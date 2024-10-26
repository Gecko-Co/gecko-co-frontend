import React, { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import './BreederMapBlogPost.scss';

const BreederMapBlogPost = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = useCallback(() => setIsModalOpen(true), []);
  const closeModal = useCallback(() => setIsModalOpen(false), []);

  const handleKeyDown = useCallback((event) => {
    if (event.key === 'Escape') {
      closeModal();
    }
  }, [closeModal]);

  return (
    <div className="blog-post-container">
      <h1 className="blog-post-title">Introducing the Gecko Co. Breeder Map</h1>
      <p className="blog-post-date">Published on October 27, 2023</p>
      
      <div className="blog-post-content">
        <h2>Discover Gecko Breeders Around the World!</h2>
        <p>
          We're thrilled to announce the launch of our new Breeder Map feature! This interactive tool is designed to connect gecko enthusiasts with breeders across the globe, making it easier than ever to find your perfect gecko companion.
        </p>
        
        <div className="image-container breeder-map-preview">
          <div className="image-wrapper" onClick={openModal}>
            <img 
              src="/images/breeder-map.jpg" 
              alt="Breeder Map Preview" 
              className="blog-image"
            />
            <div className="image-overlay">
              <span>Click to zoom</span>
            </div>
          </div>
        </div>
        <p className="image-description">A sneak peek of our new Breeder Map feature</p>
        
        <h2>Key Features of the Breeder Map</h2>
        <ul>
          <li>Interactive global map showcasing gecko breeders worldwide</li>
          <li>Detailed breeder profiles including species information</li>
          <li>Easy-to-use search functionality to find breeders in specific locations</li>
          <li>Direct contact options to connect with breeders</li>
          <li>User-friendly interface for breeders to add and manage their listings</li>
        </ul>
        
        <h2>How to Use the Breeder Map</h2>
        <ol>
          <li>Navigate to the Breeder Map page on our website</li>
          <li>Use the search bar to find breeders in your desired location</li>
          <li>Click on map markers to view breeder details</li>
          <li>Explore species information and contact breeders directly</li>
          <li>If you're a breeder, easily add your own listing to the map</li>
        </ol>
        
        <h2>Benefits for Gecko Enthusiasts</h2>
        <p>
          Whether you're a first-time gecko owner or an experienced collector, the Breeder Map offers numerous benefits:
        </p>
        <ul>
          <li>Discover a wide variety of gecko species and morphs</li>
          <li>Connect with reputable breeders in your area or around the world</li>
          <li>Access up-to-date information on available geckos</li>
          <li>Simplify your search for specific gecko types</li>
          <li>Join a growing community of gecko enthusiasts</li>
        </ul>
        
        <h2>For Breeders: Get on the Map!</h2>
        <p>
          Are you a gecko breeder? Don't miss this opportunity to showcase your geckos to a global audience! Adding your listing to our Breeder Map is quick and easy:
        </p>
        <ol>
          <li>Create or log in to your Gecko Co. account</li>
          <li>Navigate to the Breeder Map and click "Add Your Location"</li>
          <li>Fill in your breeder details, including species you work with</li>
          <li>Add your location to the map</li>
          <li>Start connecting with gecko enthusiasts from around the world!</li>
        </ol>
        
        <div className="cta-section">
          <p>Ready to explore the world of gecko breeding or showcase your own geckos?</p>
          <Link to="/breeder-map" className="cta-button">Explore the Breeder Map</Link>
        </div>
        
        <div className="feedback-section">
          <h2>We Want Your Feedback!</h2>
          <p>
            The Breeder Map is a new feature, and we're constantly working to improve it. If you have any suggestions, feedback, or encounter any issues while using the map, please don't hesitate to contact us. Your input is invaluable in helping us create the best possible experience for our gecko-loving community!
          </p>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal" onClick={closeModal} onKeyDown={handleKeyDown} tabIndex={-1}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-image-container">
              <img src="/images/breeder-map.jpg" alt="Breeder Map Full View" className="modal-image" />
              <button className="close-button" onClick={closeModal} aria-label="Close modal">
                &times;
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BreederMapBlogPost;