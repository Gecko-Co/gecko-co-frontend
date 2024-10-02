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
    if (p1) setParent1Genes(p1.split(',').map(g => ({ name: g.split(':')[0], zygosity: g.split(':')[1] })));
    if (p2) setParent2Genes(p2.split(',').map(g => ({ name: g.split(':')[0], zygosity: g.split(':')[1] })));
    
    const sharedResults = params.get('results');
    if (sharedResults) {
      setOffspring(JSON.parse(decodeURIComponent(sharedResults)));
    }
  }, []);

  const handleAddGene = useCallback((parent, geneString) => {
    const setGenes = parent === 'parent1' ? setParent1Genes : setParent2Genes;
    let geneName, zygosity;

    if (geneString.startsWith('het ')) {
      geneName = geneString.slice(4);
      zygosity = 'het';
    } else if (geneString.startsWith('Super ')) {
      geneName = geneString.slice(6);
      zygosity = 'hom';
    } else {
      geneName = geneString;
      const geneType = genes.find(g => g.name === geneName)?.type;
      zygosity = geneType === 'Recessive' ? 'hom' : 'het';
    }

    setGenes((prevGenes) => {
      if (geneName === 'Wild Type (Normal)') return [{ name: geneName, zygosity: 'hom' }];
      if (prevGenes.some(g => g.name === 'Wild Type (Normal)')) return prevGenes;
      return [...prevGenes.filter(g => g.name !== geneName), { name: geneName, zygosity }];
    });
  }, []);

  const handleRemoveGene = useCallback((parent, geneName) => {
    const setGenes = parent === 'parent1' ? setParent1Genes : setParent2Genes;
    setGenes((prevGenes) => prevGenes.filter((g) => g.name !== geneName));
  }, []);

  const handleClearAll = useCallback(() => {
    setParent1Genes([]);
    setParent2Genes([]);
    setOffspring([]);
  }, []);

  const sortGenes = useCallback((genes, genesByType) => {
    const order = ['Line-bred', 'Dominant', 'Co-Dominant', 'Incomplete-Dominant', 'Recessive'];
    return genes.sort((a, b) => {
      const aType = Object.entries(genesByType).find(([, genes]) => genes.includes(a.name))[0];
      const bType = Object.entries(genesByType).find(([, genes]) => genes.includes(b.name))[0];
      const aIndex = order.indexOf(aType);
      const bIndex = order.indexOf(bType);
      if (aIndex !== bIndex) return aIndex - bIndex;
      if (a.zygosity !== b.zygosity) return a.zygosity === 'hom' ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  }, []);

  const calculateGeneProbabilities = useCallback((parent1Genes, parent2Genes, genesByType) => {
    const calculateSingleGeneProbability = (gene1, gene2) => {
      const isRecessive = genesByType.Recessive.includes(gene1.name);
      const isCoDominant = genesByType['Co-Dominant'].includes(gene1.name);
      const isIncompleteDominant = genesByType['Incomplete-Dominant'].includes(gene1.name);

      if (isRecessive) {
        if (gene1.zygosity === 'hom' && gene2.zygosity === 'hom') return { hom: 1, het: 0, none: 0 };
        if (gene1.zygosity === 'hom' && gene2.zygosity === 'het') return { hom: 0.5, het: 0.5, none: 0 };
        if (gene1.zygosity === 'het' && gene2.zygosity === 'hom') return { hom: 0.5, het: 0.5, none: 0 };
        if (gene1.zygosity === 'het' && gene2.zygosity === 'het') return { hom: 0.25, het: 0.5, none: 0.25 };
        if (gene1.zygosity === 'hom' || gene2.zygosity === 'hom') return { hom: 0, het: 1, none: 0 };
        if (gene1.zygosity === 'het' || gene2.zygosity === 'het') return { hom: 0, het: 0.5, none: 0.5 };
      } else if (isCoDominant || isIncompleteDominant) {
        if (gene1.zygosity === 'hom' && gene2.zygosity === 'hom') return { hom: 1, het: 0, none: 0 };
        if ((gene1.zygosity === 'hom' && gene2.zygosity === 'het') || (gene1.zygosity === 'het' && gene2.zygosity === 'hom')) return { hom: 0.5, het: 0.5, none: 0 };
        if (gene1.zygosity === 'het' && gene2.zygosity === 'het') return { hom: 0.25, het: 0.5, none: 0.25 };
        if (gene1.zygosity === 'hom' || gene2.zygosity === 'hom') return { hom: 0, het: 1, none: 0 };
        if (gene1.zygosity === 'het' || gene2.zygosity === 'het') return { hom: 0, het: 0.5, none: 0.5 };
      } else {
        // Dominant genes
        if (gene1.zygosity === 'hom' || gene2.zygosity === 'hom') return { hom: 1, het: 0, none: 0 };
        if (gene1.zygosity === 'het' && gene2.zygosity === 'het') return { hom: 0.25, het: 0.5, none: 0.25 };
        if (gene1.zygosity === 'het' || gene2.zygosity === 'het') return { hom: 0, het: 0.5, none: 0.5 };
      }

      return { hom: 0, het: 0, none: 1 };
    };

    const allGenes = [...new Set([...parent1Genes, ...parent2Genes].map(g => g.name))];
    let offspringResults = [{ probability: 1, genesInvolved: {}, geneCount: 0 }];

    allGenes.forEach(geneName => {
      const gene1 = parent1Genes.find(g => g.name === geneName) || { name: geneName, zygosity: 'none' };
      const gene2 = parent2Genes.find(g => g.name === geneName) || { name: geneName, zygosity: 'none' };
      const probabilities = calculateSingleGeneProbability(gene1, gene2);

      offspringResults = offspringResults.flatMap(offspring => [
        { ...offspring, probability: offspring.probability * probabilities.hom, genesInvolved: { ...offspring.genesInvolved, [geneName]: 'hom' }, geneCount: offspring.geneCount + 1 },
        { ...offspring, probability: offspring.probability * probabilities.het, genesInvolved: { ...offspring.genesInvolved, [geneName]: 'het' }, geneCount: offspring.geneCount + 1 },
        { ...offspring, probability: offspring.probability * probabilities.none, genesInvolved: { ...offspring.genesInvolved, [geneName]: 'none' }, geneCount: offspring.geneCount }
      ].filter(o => o.probability > 0));
    });

    offspringResults.forEach(offspring => {
      const genotypeGenes = Object.entries(offspring.genesInvolved)
        .filter(([, zygosity]) => zygosity !== 'none')
        .map(([gene, zygosity]) => ({ name: gene, zygosity }));

      const sortedGenes = sortGenes(genotypeGenes, genesByType);

      const genotypeDisplay = sortedGenes.map(({ name, zygosity }) => {
        const geneType = Object.entries(genesByType).find(([, genes]) => genes.includes(name))[0];
        let displayName = name;
        if (geneType === 'Recessive' && zygosity === 'het') {
          displayName = `het ${name}`;
        } else if ((geneType === 'Co-Dominant' || geneType === 'Incomplete-Dominant') && zygosity === 'hom') {
          displayName = `Super ${name}`;
        }
        return `<span class="gene-type ${geneType.toLowerCase()}" title="${geneType}">${displayName}</span>`;
      });

      offspring.genotype = genotypeDisplay.length > 0 
        ? genotypeDisplay.join(' ')
        : '<span class="gene-type dominant" title="Dominant">Wild Type (Normal)</span>';

      offspring.probability = Math.round(offspring.probability * 10000) / 100;
    });

    return offspringResults;
  }, [sortGenes]);

  const calculateOffspring = useCallback(() => {
    const offspringResults = calculateGeneProbabilities(parent1Genes, parent2Genes, genesByType);
    setOffspring(offspringResults);
  }, [parent1Genes, parent2Genes, genesByType, calculateGeneProbabilities]);

  const handleShare = useCallback(() => {
    const baseUrl = window.location.origin + window.location.pathname;
    const p1 = parent1Genes.map(g => `${g.name}:${g.zygosity}`).join(',');
    const p2 = parent2Genes.map(g => `${g.name}:${g.zygosity}`).join(',');
    const resultsParam = encodeURIComponent(JSON.stringify(offspring));
    const shareUrl = `${baseUrl}?p1=${p1}&p2=${p2}&results=${resultsParam}`;
    
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
      <Toaster 
        position="bottom-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#23283b',
            color: '#fff',
          },
        }}
        containerStyle={{
          bottom: 80,
          right: 20,
          fontSize: '14px',
        }}
      />
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
                    <th>Number of Genes</th>
                  </tr>
                </thead>
                <tbody>
                  {offspring.map((result, index) => (
                    <tr key={index}>
                      <td>{result.probability}%</td>
                      <td dangerouslySetInnerHTML={{ __html: result.genotype }}></td>
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

  const geneOptions = useMemo(() => {
    return genes.flatMap(gene => {
      if (gene.type === 'Recessive') {
        return [
          { value: gene.name, label: gene.name },
          { value: `het ${gene.name}`, label: `het ${gene.name}` }
        ];
      } else if (gene.type === 'Co-Dominant' || gene.type === 'Incomplete-Dominant') {
        return [
          { value: gene.name, label: gene.name },
          { value: `Super ${gene.name}`, label: `Super ${gene.name}` }
        ];
      } else {
        return [{ value: gene.name, label: gene.name }];
      }
    });
  }, [genes]);

  const handleAddGene = useCallback(() => {
    if (selectedGene && !selectedGenes.some(g => g.name === selectedGene.split(' ').pop())) {
      onAddGene(selectedGene);
      setSelectedGene('');
    }
  }, [selectedGene, selectedGenes, onAddGene]);

  const isWildTypeSelected = selectedGenes.some(g => g.name === 'Wild Type (Normal)');

  const getDisplayName = (gene) => {
    const geneInfo = genes.find(g => g.name === gene.name);
    if (geneInfo.type === 'Recessive' && gene.zygosity === 'het') {
      return `het ${gene.name}`;
    } else if ((geneInfo.type === 'Co-Dominant' || geneInfo.type === 'Incomplete-Dominant') && gene.zygosity === 'hom') {
      return `Super ${gene.name}`;
    }
    return gene.name;
  };

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
          {geneOptions.map((option) => (
            <option key={option.value} value={option.value} disabled={isWildTypeSelected && option.value !== 'Wild Type (Normal)'}>
              {option.label}
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
              <li key={gene.name}>
                {getDisplayName(gene)}
                <button onClick={() => onRemoveGene(gene.name)}>Remove</button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
});

export default GeneticCalculator;