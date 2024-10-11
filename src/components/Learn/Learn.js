import React from 'react';
import { Link } from 'react-router-dom';
import geckoData from '../../geckoData.json';
import './Learn.scss';

function Learn() {
  if (!geckoData || Object.keys(geckoData).length === 0) {
    return <div>Error loading gecko data</div>;
  }

  const createUrlSlug = (species) => {
    return species.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  };

  return (
    <div className="learn-container">
      <div className="learn-header">
        <h1 className="learn-title">Gecko Species Guide</h1>
        <p className="learn-subtitle">Discover the fascinating world of geckos and learn how to care for these amazing creatures</p>
      </div>
      <div className="species-grid">
        {Object.entries(geckoData).map(([species, data]) => (
          <div key={species} className="species-card">
            <div className="image-container">
              <img src={`/images/${species}.jpg`} alt={species} className="gecko-image" />
            </div>
            <div className="species-info">
              <h3>{species}</h3>
              <p className="scientific-name">{data.scientificName}</p>
              <Link to={`/learn/${createUrlSlug(species)}`} className="learn-more-btn">
                Learn More
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Learn;