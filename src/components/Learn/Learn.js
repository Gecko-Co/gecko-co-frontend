import React from 'react';
import styled from 'styled-components';
import placeholderData from '../../data'; // Importing placeholder data

const Learn = () => {
  // Get unique species and their first image
  const uniqueSpecies = [];
  const speciesImages = {};

  placeholderData.results.forEach(result => {
    if (!speciesImages[result.species]) {
      speciesImages[result.species] = result.images;
      uniqueSpecies.push({ species: result.species, image: result.images });
    }
  });

  return (
    <Container>
      <Title>
        <span>Care Sheet and </span>
        <span>Husbandry</span>
      </Title>
      <SpeciesContainer>
        {uniqueSpecies.map((item, index) => (
          <SpeciesCard key={index}>
            <ImageContainer>
              <GeckoImage src={`/${item.image}`} alt={item.species} />
            </ImageContainer>
            <h3>{item.species}</h3>
          </SpeciesCard>
        ))}
      </SpeciesContainer>
    </Container>
  );
};

const Container = styled.div`
  background-color: white;
  padding: 50px 20px;
  margin-top: 80px;
  padding-bottom: 120px;

  @media (min-width: 768px) {
    padding: 70px 50px;
  }
`;

const Title = styled.h1`
  text-align: center;
  margin-bottom: 50px;
  font-size: 24px;

  @media (min-width: 768px) {
    font-size: 32px;
  }
`;

const SpeciesContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: space-around;
`;

const SpeciesCard = styled.div`
  text-align: center;
  margin: 20px;

  @media (min-width: 768px) {
    margin: 20px 30px;
  }
`;

const ImageContainer = styled.div`
  width: 150px;
  height: 150px;
  border-radius: 50%;
  overflow: hidden;
  margin: 10px auto;
  position: relative;

  @media (min-width: 768px) {
    width: 200px;
    height: 200px;
  }
`;

const GeckoImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;

  &:hover {
    transform: scale(1.1);
  }
`;

export default Learn;
