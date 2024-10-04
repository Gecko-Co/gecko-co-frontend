import React from 'react';
import { useParams, Link } from 'react-router-dom';
import geckoData from '../../geckoData.json';
import './GeckoSpecies.scss';

function GeckoSpecies() {
  const { species } = useParams();
  console.log("URL species parameter:", species);
  
  const findGeckoData = (speciesParam) => {
    const normalizedSpeciesParam = speciesParam.replace(/-/g, ' ').toLowerCase();
    return Object.entries(geckoData).find(([key, value]) => 
      key.toLowerCase().replace(/[^a-z0-9]+/g, '') === normalizedSpeciesParam.replace(/[^a-z0-9]+/g, '')
    );
  };

  const [geckoName, gecko] = findGeckoData(species) || [];
  console.log("Processed gecko name:", geckoName);
  console.log("Gecko data:", gecko);

  if (!gecko) {
    return <div className="gecko-species-container">Gecko species not found</div>;
  }

  return (
    <div className="gecko-species-container">
      <Link to="/learn" className="back-button">&larr; Back to All Geckos</Link>
      <h1>{geckoName}</h1>
      <h2>{gecko.scientificName}</h2>
      
      <div className="gecko-info-grid">
        <div className="info-section">
          <h3>Origin and Habitat</h3>
          <p><strong>Origin:</strong> {gecko.origin}</p>
          <p><strong>Habitat:</strong> {gecko.habitat}</p>
          <p><strong>Discovery:</strong> {gecko.discovery}</p>
        </div>

        <div className="info-section">
          <h3>Physical Characteristics</h3>
          <p><strong>Size:</strong> {gecko.size}</p>
          <p><strong>Lifespan:</strong> {gecko.lifespan}</p>
          <p><strong>Activity:</strong> {gecko.activity}</p>
        </div>

        <div className="info-section">
          <h3>Care and Husbandry</h3>
          <p><strong>Diet:</strong> {gecko.diet}</p>
          <p><strong>Temperament:</strong> {gecko.temperament}</p>
          <h4>Enclosure Requirements:</h4>
          <ul>
            {Object.entries(gecko.husbandry).map(([key, value]) => (
              <li key={key}><strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {value}</li>
            ))}
          </ul>
        </div>

        <div className="info-section">
          <h3>Breeding Information</h3>
          <ul>
            {Object.entries(gecko.breeding).map(([key, value]) => (
              <li key={key}><strong>{key.charAt(0).toUpperCase() + key.slice(1)}:</strong> {value}</li>
            ))}
          </ul>
        </div>

        <div className="info-section">
          <h3>Morphs</h3>
          <ul className="morph-list">
            {gecko.morphs.map((morph, index) => (
              <li key={index}>{morph}</li>
            ))}
          </ul>
        </div>

        <div className="info-section fun-facts">
          <h3>Fun Facts</h3>
          <ul>
            {gecko.funFacts.map((fact, index) => (
              <li key={index}>{fact}</li>
            ))}
          </ul>
        </div>

        <div className="info-section">
          <h3>Conservation Status</h3>
          <p>{gecko.conservation}</p>
        </div>
      </div>
    </div>
  );
}

export default GeckoSpecies;