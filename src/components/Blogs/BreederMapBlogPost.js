import React, { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
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

  useEffect(() => {
    // Add schema.org structured data
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": "Introducing the Gecko Co. Breeder Map: Connect with Gecko Breeders Worldwide",
      "image": "https://geckoco.ph/images/breeder-map.jpg",
      "datePublished": "2023-10-27",
      "author": {
        "@type": "Organization",
        "name": "Gecko Co."
      },
      "publisher": {
        "@type": "Organization",
        "name": "Gecko Co.",
        "logo": {
          "@type": "ImageObject",
          "url": "https://geckoco.ph/logo.png"
        }
      },
      "description": "Discover our new interactive Breeder Map feature, connecting gecko enthusiasts with breeders worldwide. Find your perfect gecko companion and explore the global gecko breeding community."
    });
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return (
    <article className="blog-post-container">
      <Helmet>
        <title>Introducing the Gecko Co. Breeder Map: Connect with Gecko Breeders Worldwide</title>
        <meta name="description" content="Discover our new interactive Breeder Map feature, connecting gecko enthusiasts with breeders worldwide. Find your perfect gecko companion and explore the global gecko breeding community." />
        <meta name="keywords" content="gecko breeder map, gecko breeders, find gecko breeders, gecko breeding community, buy geckos, sell geckos, gecko species, gecko morphs" />
        <meta property="og:title" content="Introducing the Gecko Co. Breeder Map: Connect with Gecko Breeders Worldwide" />
        <meta property="og:description" content="Discover our new interactive Breeder Map feature, connecting gecko enthusiasts with breeders worldwide. Find your perfect gecko companion and explore the global gecko breeding community." />
        <meta property="og:image" content="https://geckoco.ph/images/breeder-map.jpg" />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Introducing the Gecko Co. Breeder Map: Connect with Gecko Breeders Worldwide" />
        <meta name="twitter:description" content="Discover our new interactive Breeder Map feature, connecting gecko enthusiasts with breeders worldwide. Find your perfect gecko companion and explore the global gecko breeding community." />
        <meta name="twitter:image" content="https://geckoco.ph/images/breeder-map.jpg" />
      </Helmet>

      <h1 className="blog-post-title">Introducing the Gecko Co. Breeder Map: Connect with Gecko Breeders Worldwide</h1>
      <p className="blog-post-date">Published on October 27, 2023</p>
      
      <section className="blog-post-content">
        <h2>Discover Gecko Breeders Around the World!</h2>
        <p>
          We're thrilled to announce the launch of our new Breeder Map feature! This interactive tool is designed to connect gecko enthusiasts with breeders across the globe, making it easier than ever to find your perfect gecko companion.
        </p>
        
        <figure className="image-container breeder-map-preview">
          <div className="image-wrapper" onClick={openModal}>
            <img 
              src="/images/breeder-map.jpg" 
              alt="Interactive Gecko Breeder Map showing global breeder locations" 
              className="blog-image"
              width="800"
              height="450"
            />
            <div className="image-overlay">
              <span>Click to zoom</span>
            </div>
          </div>
          <figcaption className="image-description">A sneak peek of our new interactive Gecko Breeder Map feature</figcaption>
        </figure>
        
        <h2>Key Features of the Gecko Breeder Map</h2>
        <ul>
          <li>Interactive global map showcasing gecko breeders worldwide</li>
          <li>Detailed breeder profiles including gecko species information</li>
          <li>Easy-to-use search functionality to find gecko breeders in specific locations</li>
          <li>Direct contact options to connect with gecko breeders</li>
          <li>User-friendly interface for breeders to add and manage their gecko listings</li>
        </ul>
        
        <h2>How to Use the Gecko Breeder Map</h2>
        <ol>
          <li>Navigate to the Gecko Breeder Map page on our website</li>
          <li>Use the search bar to find gecko breeders in your desired location</li>
          <li>Click on map markers to view detailed gecko breeder information</li>
          <li>Explore gecko species information and contact breeders directly</li>
          <li>If you're a gecko breeder, easily add your own listing to the map</li>
        </ol>
        
        <h2>Benefits for Gecko Enthusiasts</h2>
        <p>
          Whether you're a first-time gecko owner or an experienced collector, the Gecko Breeder Map offers numerous benefits:
        </p>
        <ul>
          <li>Discover a wide variety of gecko species and morphs</li>
          <li>Connect with reputable gecko breeders in your area or around the world</li>
          <li>Access up-to-date information on available geckos for sale</li>
          <li>Simplify your search for specific gecko types</li>
          <li>Join a growing community of gecko enthusiasts and breeders</li>
        </ul>
        
        <h2>For Gecko Breeders: Get on the Map!</h2>
        <p>
          Are you a gecko breeder? Don't miss this opportunity to showcase your geckos to a global audience! Adding your listing to our Gecko Breeder Map is quick and easy:
        </p>
        <ol>
          <li>Create or log in to your Gecko Co. account</li>
          <li>Navigate to the Gecko Breeder Map and click "Add Your Location"</li>
          <li>Fill in your breeder details, including gecko species you work with</li>
          <li>Add your location to the map</li>
          <li>Start connecting with gecko enthusiasts from around the world!</li>
        </ol>
        
        <div className="cta-section">
          <p>Ready to explore the world of gecko breeding or showcase your own geckos?</p>
          <Link to="/breeder-map" className="cta-button">Explore the Gecko Breeder Map</Link>
        </div>
        
        <div className="feedback-section">
          <h2>We Want Your Feedback on the Gecko Breeder Map!</h2>
          <p>
            The Gecko Breeder Map is a new feature, and we're constantly working to improve it. If you have any suggestions, feedback, or encounter any issues while using the map, please don't hesitate to contact us. Your input is invaluable in helping us create the best possible experience for our gecko-loving community!
          </p>
        </div>
      </section>

      {isModalOpen && (
        <div className="modal" onClick={closeModal} onKeyDown={handleKeyDown} tabIndex={-1} role="dialog" aria-modal="true">
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-image-container">
              <img src="/images/breeder-map.jpg" alt="Full view of the interactive Gecko Breeder Map" className="modal-image" />
              <button className="close-button" onClick={closeModal} aria-label="Close modal">
                &times;
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
};

export default BreederMapBlogPost;