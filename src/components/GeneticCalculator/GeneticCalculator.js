import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { Toaster, toast } from 'react-hot-toast';
import genes from '../../genes.json';
import './GeneticCalculator.scss';

const Modal = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        {children}
        <button className="modal-close" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

const GeneticCalculator = () => {
  const [parent1Genes, setParent1Genes] = useState([]);
  const [parent2Genes, setParent2Genes] = useState([]);
  const [offspring, setOffspring] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
  }, []);

  const genesByType = useMemo(() => {
    return genes.reduce((acc, gene) => {
      if (!acc[gene.type]) acc[gene.type] = [];
      acc[gene.type].push(gene.name);
      return acc;
    }, {});
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const p1 = params.get('p1');
    const p2 = params.get('p2');
    if (p1) setParent1Genes(p1.split(','));
    if (p2) setParent2Genes(p2.split(','));
    
    const sharedResults = params.get('results');
    if (sharedResults) {
      setOffspring(JSON.parse(decodeURIComponent(sharedResults)));
    }
  }, []);

  const handleAddGene = useCallback((parent, gene) => {
    const setGenes = parent === 'parent1' ? setParent1Genes : setParent2Genes;
    setGenes((prevGenes) => {
      if (gene === 'Wild Type (Normal)') return [gene];
      if (prevGenes.includes('Wild Type (Normal)')) return prevGenes;
      return [...new Set([...prevGenes, gene])];
    });
  }, []);

  const handleRemoveGene = useCallback((parent, gene) => {
    const setGenes = parent === 'parent1' ? setParent1Genes : setParent2Genes;
    setGenes((prevGenes) => prevGenes.filter((g) => g !== gene));
  }, []);

  const handleClearAll = useCallback(() => {
    setParent1Genes([]);
    setParent2Genes([]);
    setOffspring([]);
  }, []);

  const calculateGeneProbabilities = useCallback((parent1Genes, parent2Genes, genesByType) => {
    const getGeneCount = (genes, targetGene) => genes.filter(g => g === targetGene).length;

    const dominantGenes = genesByType.Dominant || [];
    const recessiveGenes = genesByType.Recessive || [];
    const coDominantGenes = genesByType['Co-Dominant'] || [];
    const incompleteDominantGenes = genesByType['Incomplete-Dominant'] || [];
    const lineBredGenes = genesByType['Line-bred'] || [];

    let offspringResults = [{ probability: 1, genesInvolved: [], homozygousCoDominantAndIncompleteDominant: [], hetRecessiveGenes: [], coDominantGenesInvolved: [] }];

    // Handle dominant genes
    [...new Set([...parent1Genes, ...parent2Genes])]
      .filter(gene => dominantGenes.includes(gene) && gene !== 'Wild Type (Normal)')
      .forEach(gene => {
        const parent1Count = getGeneCount(parent1Genes, gene);
        const parent2Count = getGeneCount(parent2Genes, gene);
        const probability = 1 - 0.5 ** (parent1Count + parent2Count);
        
        offspringResults = offspringResults.flatMap(offspring => [
          { ...offspring, probability: offspring.probability * probability, genesInvolved: [...offspring.genesInvolved, gene] },
          { ...offspring, probability: offspring.probability * (1 - probability) }
        ]);
      });

    // Handle co-dominant and incomplete dominant genes
    [...coDominantGenes, ...incompleteDominantGenes].forEach(gene => {
      const parent1Count = getGeneCount(parent1Genes, gene);
      const parent2Count = getGeneCount(parent2Genes, gene);
      const totalGenes = parent1Count + parent2Count;

      let wildTypeProbability, heterozygousProbability, homozygousProbability;

      if (totalGenes === 0) {
        wildTypeProbability = 1;
        heterozygousProbability = 0;
        homozygousProbability = 0;
      } else if (totalGenes === 1) {
        wildTypeProbability = 0.5;
        heterozygousProbability = 0.5;
        homozygousProbability = 0;
      } else if (totalGenes === 2) {
        wildTypeProbability = 0.25;
        heterozygousProbability = 0.5;
        homozygousProbability = 0.25;
      } else if (totalGenes === 3) {
        wildTypeProbability = 0;
        heterozygousProbability = 0.5;
        homozygousProbability = 0.5;
      } else if (totalGenes === 4) {
        wildTypeProbability = 0;
        heterozygousProbability = 0;
        homozygousProbability = 1;
      }

      offspringResults = offspringResults.flatMap(offspring => [
        { ...offspring, probability: offspring.probability * wildTypeProbability },
        { ...offspring, probability: offspring.probability * heterozygousProbability, coDominantGenesInvolved: [...offspring.coDominantGenesInvolved, gene] },
        { ...offspring, probability: offspring.probability * homozygousProbability, homozygousCoDominantAndIncompleteDominant: [...offspring.homozygousCoDominantAndIncompleteDominant, gene] }
      ].filter(o => o.probability > 0));
    });

    // Handle recessive genes
    recessiveGenes.forEach(gene => {
      const parent1Count = getGeneCount(parent1Genes, gene);
      const parent2Count = getGeneCount(parent2Genes, gene);

      let homozygousProbability, heterozygousProbability, wildTypeProbability;

      if (parent1Count === 2 && parent2Count === 2) {
        homozygousProbability = 1;
        heterozygousProbability = 0;
        wildTypeProbability = 0;
      } else if ((parent1Count === 2 && parent2Count === 1) || (parent1Count === 1 && parent2Count === 2)) {
        homozygousProbability = 0.5;
        heterozygousProbability = 0.5;
        wildTypeProbability = 0;
      } else if (parent1Count === 1 && parent2Count === 1) {
        homozygousProbability = 0.25;
        heterozygousProbability = 0.5;
        wildTypeProbability = 0.25;
      } else if ((parent1Count === 1 && parent2Count === 0) || (parent1Count === 0 && parent2Count === 1)) {
        homozygousProbability = 0;
        heterozygousProbability = 1;
        wildTypeProbability = 0;
      } else {
        homozygousProbability = 0;
        heterozygousProbability = 0;
        wildTypeProbability = 1;
      }

      offspringResults = offspringResults.flatMap(offspring => [
        { ...offspring, probability: offspring.probability * wildTypeProbability },
        { ...offspring, probability: offspring.probability * heterozygousProbability, hetRecessiveGenes: [...offspring.hetRecessiveGenes, gene] },
        { ...offspring, probability: offspring.probability * homozygousProbability, genesInvolved: [...offspring.genesInvolved, gene] }
      ].filter(o => o.probability > 0));
    });

    // Handle line-bred genes
    const allLineBredGenes = [...new Set([...parent1Genes, ...parent2Genes])]
      .filter(gene => lineBredGenes.includes(gene));

    offspringResults.forEach(offspring => {
      offspring.genesInvolved = [...new Set([...offspring.genesInvolved, ...allLineBredGenes])];
      
      const hasSuperForm = offspring.homozygousCoDominantAndIncompleteDominant.length > 0;
      const hasHeteroForm = offspring.coDominantGenesInvolved.length > 0;

      const genotypeSpans = [
        ...offspring.genesInvolved.filter(g => dominantGenes.includes(g)).map(g => `<span class="gene-type dominant" title="Dominant">${g}</span>`),
        ...offspring.homozygousCoDominantAndIncompleteDominant.map(g => 
          `<span class="gene-type ${coDominantGenes.includes(g) ? 'co-dominant' : 'incomplete-dominant'} homozygous" title="${coDominantGenes.includes(g) ? 'Co-Dominant' : 'Incomplete Dominant'} (Homozygous)">Super ${g}</span>`
        ),
        ...offspring.coDominantGenesInvolved.map(g => 
          `<span class="gene-type ${coDominantGenes.includes(g) ? 'co-dominant' : 'incomplete-dominant'}" title="${coDominantGenes.includes(g) ? 'Co-Dominant' : 'Incomplete Dominant'} (Heterozygous)">${g}</span>`
        ),
        ...offspring.genesInvolved.filter(g => recessiveGenes.includes(g)).map(g => `<span class="gene-type recessive" title="Recessive (Homozygous)">${g}</span>`),
        ...offspring.hetRecessiveGenes.map(g => `<span class="gene-type recessive" title="Recessive (Heterozygous)">Het ${g}</span>`),
        ...allLineBredGenes.map(g => `<span class="gene-type line-bred" title="Line-bred">${g}</span>`)
      ];

      offspring.genotype = genotypeSpans.length > 0 
        ? genotypeSpans.join(', ') 
        : '<span class="gene-type dominant" title="Dominant">Wild Type (Normal)</span>';

      offspring.geneCount = offspring.genesInvolved.length + offspring.homozygousCoDominantAndIncompleteDominant.length + offspring.coDominantGenesInvolved.length + offspring.hetRecessiveGenes.length;
      offspring.probability = Math.round(offspring.probability * 10000) / 100;
    });

    return offspringResults.filter(offspring => offspring.probability > 0);
  }, []);

  const getMorphName = useCallback((visibleGenes, hetGenes, lineBredGenes, homozygousCoDominantAndIncompleteDominant, coDominantGenesInvolved) => {
    const combinationMorphs = genes.filter(gene => gene.type === "Combination");
    for (const morph of combinationMorphs) {
      if (morph.genes.every(gene => visibleGenes.includes(gene))) {
        return morph.name;
      }
    }
    
    if (visibleGenes.length === 0 && hetGenes.length === 0 && lineBredGenes.length === 0 && 
        homozygousCoDominantAndIncompleteDominant.length === 0 && coDominantGenesInvolved.length === 0) {
      return 'Wild Type (Normal)';
    }

    const parts = [
      ...homozygousCoDominantAndIncompleteDominant.map(gene => `Super ${gene}`),
      ...coDominantGenesInvolved,
      ...visibleGenes.filter(gene => !homozygousCoDominantAndIncompleteDominant.includes(gene) && !coDominantGenesInvolved.includes(gene)),
    ];

    if (hetGenes.length > 0) {
      parts.push(`het ${hetGenes.join(', ')}`);
    }

    let morphName = parts.filter(Boolean).join(' ');

    if (lineBredGenes.length > 0) {
      morphName += ` with possible influence of ${lineBredGenes.join(', ')}`;
    }

    return morphName || 'Wild Type (Normal)';
  }, []);

  const calculateOffspring = useCallback(() => {
    const offspringResults = calculateGeneProbabilities(parent1Genes, parent2Genes, genesByType);

    offspringResults.forEach(offspring => {
      const visibleGenes = offspring.genesInvolved.filter(g => 
        !genesByType.Recessive.includes(g) && 
        !genesByType['Incomplete-Dominant'].includes(g) &&
        !genesByType['Line-bred'].includes(g) &&
        !genesByType['Co-Dominant'].includes(g)
      );
      const hetGenes = offspring.hetRecessiveGenes;
      const lineBredGenes = offspring.genesInvolved.filter(g => genesByType['Line-bred'].includes(g));
      
      offspring.morphName = getMorphName(
        visibleGenes,
        hetGenes,
        lineBredGenes,
        offspring.homozygousCoDominantAndIncompleteDominant,
        offspring.coDominantGenesInvolved
      );
    });

    setOffspring(offspringResults);
  }, [parent1Genes, parent2Genes, genesByType, calculateGeneProbabilities, getMorphName]);

  const handleShare = useCallback(() => {
    const baseUrl = window.location.origin + window.location.pathname;
    const resultsParam = encodeURIComponent(JSON.stringify(offspring));
    const shareUrl = `${baseUrl}?p1=${parent1Genes.join(',')}&p2=${parent2Genes.join(',')}&results=${resultsParam}`;
    
    navigator.clipboard.writeText(shareUrl).then(() => {
      toast.success('Share link copied to clipboard!', {
        style: {
          background: '#23283b',
          color: '#fff',
        },
        iconTheme: {
          primary: '#bd692d',
          secondary: '#fff',
        },
      });
    }).catch(err => {
      console.error('Failed to copy share link: ', err);
      toast.error('Failed to copy share link. Please try again.');
    });
  }, [parent1Genes, parent2Genes, offspring]);

  return (
    <div className="genetic-calculator-wrapper">
      <Toaster position="bottom-right" />
      <Modal isOpen={isModalOpen} onClose={closeModal}>
        <h2>Experimental Feature</h2>
        <p>This genetic calculator is currently in an experimental stage. We're continuously updating and improving its functionality.</p>
        <p>Stay tuned! We'll be adding more gecko calculators in the future to expand our genetic prediction capabilities.</p>
      </Modal>
      <div className="genetic-calculator">
        <h1>Leopard Gecko Genetic Calculator</h1>
        <div className="parents-container">
          <GeneSelector
            title="Parent 1"
            genes={genes.filter(gene => gene.type !== "Combination")}
            selectedGenes={parent1Genes}
            onAddGene={(gene) => handleAddGene('parent1', gene)}
            onRemoveGene={(gene) => handleRemoveGene('parent1', gene)}
          />
          <GeneSelector
            title="Parent 2"
            genes={genes.filter(gene => gene.type !== "Combination")}
            selectedGenes={parent2Genes}
            onAddGene={(gene) => handleAddGene('parent2', gene)}
            onRemoveGene={(gene) => handleRemoveGene('parent2', gene)}
          />
        </div>
        <div className="button-container">
          <button onClick={calculateOffspring} className="calculate-btn">
            Calculate Offspring
          </button>
          <button onClick={handleShare} className="share-btn">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="18" cy="5" r="3"></circle>
              <circle cx="6" cy="12" r="3"></circle>
              <circle cx="18" cy="19" r="3"></circle>
              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
            </svg>
            Share
          </button>
          <button onClick={handleClearAll} className="clear-btn">
            Clear All
          </button>
        </div>
        {offspring.length > 0 && (
          <div className="offspring-results">
            <h2>Potential Offspring</h2>
            <div className="gene-type-legend">
              <h3>Gene Types:</h3>
              <ul>
                <li><span className="gene-type dominant">Dominant</span></li>
                <li><span className="gene-type recessive">Recessive</span></li>
                <li><span className="gene-type line-bred">Line-bred</span></li>
                <li><span className="gene-type incomplete-dominant">Incomplete-Dominant</span></li>
                <li><span className="gene-type co-dominant">Co-Dominant</span></li>
              </ul>
            </div>
            <div className="table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Probability</th>
                    <th>Genotype</th>
                    <th>Morph Name</th>
                    <th>Number of Genes</th>
                  </tr>
                </thead>
                <tbody>
                  {offspring.map((result, index) => (
                    <tr key={index}>
                      <td>{result.probability}%</td>
                      <td dangerouslySetInnerHTML={{ __html: result.genotype }}></td>
                      <td>{result.morphName}</td>
                      <td>{result.geneCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const GeneSelector = React.memo(({ title, genes, selectedGenes, onAddGene, onRemoveGene }) => {
  const [selectedGene, setSelectedGene] = useState('');

  const handleAddGene = useCallback(() => {
    if (selectedGene && !selectedGenes.includes(selectedGene)) {
      onAddGene(selectedGene);
      setSelectedGene('');
    }
  }, [selectedGene, selectedGenes, onAddGene]);

  const isWildTypeSelected = selectedGenes.includes('Wild Type (Normal)');

  return (
    <div className="gene-selector">
      <h2>{title}</h2>
      <div className="gene-input">
        <select
          value={selectedGene}
          onChange={(e) => setSelectedGene(e.target.value)}
          disabled={isWildTypeSelected && selectedGene !== 'Wild Type (Normal)'}
        >
          <option value="">Select a gene</option>
          {genes.map((gene) => (
            <option key={gene.name} value={gene.name} disabled={isWildTypeSelected && gene.name !== 'Wild Type (Normal)'}>
              {gene.name}
            </option>
          ))}
        </select>
        <button onClick={handleAddGene} disabled={isWildTypeSelected && selectedGene !== 'Wild Type (Normal)'}>Add Gene</button>
      </div>
      {selectedGenes.length > 0 && (
        <div className="selected-genes">
          <h3>Selected Genes</h3>
          <ul>
            {selectedGenes.map((gene) => (
              <li key={gene}>
                {gene}
                <button onClick={() => onRemoveGene(gene)}>Remove</button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
});

export default GeneticCalculator;