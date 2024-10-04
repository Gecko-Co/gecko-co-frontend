import React, { useState } from 'react';
import placeholderData from '../../data';
import './Learn.scss';

const geckoInfo = {
  "Knob-Tailed Gecko": {
    husbandry: "Knob-tailed geckos require a warm, dry environment with a temperature gradient. Provide a basking spot of 88-95°F (31-35°C) and a cool side around 75-80°F (24-27°C). Humidity should be kept low, around 30-40%.",
    morphs: ["Normal", "Patternless", "Striped", "Albino"],
    funFact: "Knob-tailed geckos get their name from the knob-like shape at the end of their tails, which they can detach to escape predators."
  },
  "Leopard Gecko": {
    husbandry: "Leopard geckos need a warm environment with a temperature gradient. Maintain a basking spot of 88-90°F (31-32°C) and a cool side around 75-80°F (24-27°C). Provide a humid hide for shedding.",
    morphs: ["Normal", "Albino", "Blizzard", "Tangerine", "Giant"],
    funFact: "Leopard geckos are one of the few gecko species with eyelids, allowing them to blink and sleep with their eyes closed."
  },
  "African Fat-tailed Gecko": {
    husbandry: "African fat-tailed geckos require similar care to leopard geckos but with slightly higher humidity. Maintain a basking spot of 88-92°F (31-33°C) and a cool side around 75-80°F (24-27°C). Keep humidity between 50-70%.",
    morphs: ["Normal", "Albino", "White Out", "Oreo"],
    funFact: "African fat-tailed geckos can store fat in their tails, which helps them survive during periods of food scarcity in the wild."
  },
  "Crested Gecko": {
    husbandry: "Crested geckos thrive in cooler temperatures compared to other geckos. Keep the enclosure between 72-80°F (22-27°C). Maintain high humidity between 60-80%. Provide vertical space for climbing.",
    morphs: ["Normal", "Harlequin", "Dalmatian", "Pinstripe", "Tiger"],
    funFact: "Crested geckos were once thought to be extinct until they were rediscovered in 1994 on the island of New Caledonia."
  }
};

export default function Learn() {
  const [selectedSpecies, setSelectedSpecies] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const uniqueSpecies = Array.from(new Set(placeholderData.results.map(result => result.species)))
    .map(species => {
      const speciesData = placeholderData.results.find(result => result.species === species);
      return { species, image: speciesData.images };
    });

  const handleSpeciesClick = (species) => {
    setSelectedSpecies(species);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="learn-container">
      <div className="learn-header">
        <h1 className="learn-title">Gecko Species Guide</h1>
        <p className="learn-subtitle">Discover the fascinating world of geckos and learn how to care for these amazing creatures</p>
      </div>
      <div className="species-grid">
        {uniqueSpecies.map((item, index) => (
          <div 
            key={index} 
            className="species-card"
            onClick={() => handleSpeciesClick(item.species)}
          >
            <div className="image-container">
              <img src={`/${item.image}`} alt={item.species} className="gecko-image" />
            </div>
            <h3>{item.species}</h3>
            <button className="learn-more-btn">Learn More</button>
          </div>
        ))}
      </div>
      {isModalOpen && selectedSpecies && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={closeModal}>&times;</button>
            <h2>{selectedSpecies}</h2>
            <div className="info-grid">
              <div className="info-section">
                <h3>Husbandry</h3>
                <p>{geckoInfo[selectedSpecies].husbandry}</p>
              </div>
              <div className="info-section">
                <h3>Known Morphs</h3>
                <ul className="morph-list">
                  {geckoInfo[selectedSpecies].morphs.map((morph, index) => (
                    <li key={index}>{morph}</li>
                  ))}
                </ul>
              </div>
              <div className="info-section fun-fact">
                <h3>Fun Fact</h3>
                <p>{geckoInfo[selectedSpecies].funFact}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}