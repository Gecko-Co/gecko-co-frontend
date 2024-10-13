import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalculator, faArrowRight, faShoppingCart, faDna, faChartLine } from '@fortawesome/free-solid-svg-icons';
import Slider from "react-slick";
import { Helmet } from 'react-helmet';
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import './Home.scss';
import featuredData from '../../featured';
import { useCart } from '../Cart/CartContext';
import customToast from '../../utils/toast';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../../firebase';

const GeckoSliderCard = ({ gecko }) => {
  const [isHovered, setIsHovered] = useState(false);
  const { addToCart } = useCart();

  const handleAddToCart = useCallback(async (event) => {
    event.preventDefault();
    const success = await addToCart(gecko);
    if (success) {
      customToast.success('Gecko added to cart!');
    }
  }, [addToCart, gecko]);

  const getImageUrl = useCallback((imagePath) => {
    const baseUrl = "https://www.geckoco.ph/";
    return imagePath ? `${baseUrl}${imagePath}` : '/placeholder.svg';
  }, []);

  return (
    <div 
      className="gecko-slider-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="card-image-container">
        <img src={getImageUrl(gecko.images)} alt={gecko.title} className="card-image" />
        <div className="card-quick-info">
          <span className="card-gender">{gecko.gender}</span>
          <span className="card-name">{gecko.name}</span>
        </div>
      </div>
      <div className="card-content">
        <div className="card-info">
          <h3 className="card-title">
            <span className="card-title-text">{gecko.title}</span>
          </h3>
          <p className="card-price">₱{parseFloat(gecko.price).toLocaleString('en-US')}</p>
        </div>
        <div className="card-actions">
          <Link to={`/gecko/${gecko.name}`} className="btn btn-primary">View Details</Link>
          <button 
            className="btn btn-secondary" 
            onClick={handleAddToCart}
            disabled={gecko.status.toLowerCase() !== 'available'}
          >
            {isHovered ? (
              <FontAwesomeIcon icon={faShoppingCart} />
            ) : (
              gecko.status.toLowerCase() === 'available' ? 'Add to Cart' : 'Not Available'
            )}
          </button>
        </div>
      </div>
      <div className={`card-status ${gecko.status.toLowerCase()}`}>
        {gecko.status}
      </div>
    </div>
  );
};

export default function Component() {
  const [currentSecondSectionIndex, setCurrentSecondSectionIndex] = useState(0);
  const [currentHeroIndex, setCurrentHeroIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [availableGeckos, setAvailableGeckos] = useState([]);
  //const [heroTextMaxHeight, setHeroTextMaxHeight] = useState(0); //Removed

  const heroContent = [
    {
      title: "Discover Gecko Genetics",
      subtitle: "Find the perfect genes for your project",
      cta: "Explore Now",
      link: "/genetic-calculator",
      image: "/images/hero-gecko-1.jpg"
    },
    {
      title: "Expert Care Guides",
      subtitle: "Learn how to care for your gecko",
      cta: "Read Guides",
      link: "/learn",
      image: "/images/hero-gecko-2.jpg"
    },
    {
      title: "Rare Morphs Available",
      subtitle: "Unique colors and patterns",
      cta: "View Collection",
      link: "/shop",
      image: "/images/hero-gecko-3.jpg"
    }
  ];

  const second_section_images = featuredData.images;

  const first_section_images = [
    "images/home1-resize.png",
    "images/home2-resize.png",
    "images/home3-resize.png",
  ];

  useEffect(() => {
    const fetchGeckos = async () => {
      const geckosRef = collection(db, 'geckos');
      const q = query(geckosRef, where("status", "==", "Available"));
      const querySnapshot = await getDocs(q);
      const geckos = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAvailableGeckos(geckos);
    };

    fetchGeckos();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentHeroIndex((prevIndex) => (prevIndex + 1) % heroContent.length);
        setIsTransitioning(false);
      }, 500);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  //Removed useEffect for heroTextMaxHeight

  const sliderSettings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        }
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1
        }
      }
    ]
  };

  return (
    <>
      <Helmet>
        <title>Gecko Co. - Premium Gecko Breeder in the Philippines</title>
        <meta name="description" content="Discover exceptional morphs of Leopard Geckos, African Fat-Tailed Geckos, Crested Geckos, and Knobtail Geckos at Gecko Co. Expert care and ethical breeding practices." />
        <link rel="canonical" href="https://geckoco.ph" />
      </Helmet>
      <div className="App">
        <section className="hero-section">
          <div className="hero-container">
            <div className="hero-content">
              <div className="hero-text-container" style={{ height: '300px' }}> {/* Updated */}
                <div className={`hero-text ${isTransitioning ? 'fade-out' : 'fade-in'}`}>
                  <h1 className="hero-title">{heroContent[currentHeroIndex].title}</h1>
                  <p className="hero-subtitle">{heroContent[currentHeroIndex].subtitle}</p>
                  <Link to={heroContent[currentHeroIndex].link} className="hero-cta">
                    {heroContent[currentHeroIndex].cta}
                  </Link>
                </div>
              </div>
            </div>
            <div className="image-showcase">
              {first_section_images.map((image, index) => (
                <div key={index} className="image-item">
                  <img src={image} alt={`Showcase ${index + 1}`} />
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="diagonal-transition"></div>

        <div className="second-section">
          <h2 className="section-title">Species Highlight</h2>
          <div className="content-wrapper">
            <div className="image-gallery">
              <div className="main-image-container">
                <img src={second_section_images[currentSecondSectionIndex]} alt="Main Display" className="main-image" />
              </div>
              <div className="thumbnail-container">
                {second_section_images.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    className={`thumbnail ${currentSecondSectionIndex === index ? 'active' : ''}`}
                    onClick={() => setCurrentSecondSectionIndex(index)}
                  />
                ))}
              </div>
            </div>
            <div className="species-info">
              <h2>{featuredData.name}</h2>
              <p className="description">{featuredData.description}</p>
              <ul>
                <li><strong>Species:</strong> {featuredData.species}</li>
                <li><strong>Origin:</strong> {featuredData.origin}</li>
                <li><strong>Size:</strong> {featuredData.size}</li>
                <li><strong>Range:</strong> {featuredData.range}</li>
                <li><strong>Diet:</strong> {featuredData.diet}</li>
                <li><strong>Lifespan:</strong> {featuredData.lifespan}</li>
              </ul>
              <Link to="/learn" className="learn-more-button">Learn More About Geckos</Link>
            </div>
          </div>
        </div>

        <div className="diagonal-transition reverse"></div>

        <div className="third-section">
          <h2 className="section-title">Featured Geckos</h2>
          <div className="content-wrapper">
            <div className="gecko-slider">
              <Slider {...sliderSettings}>
                {availableGeckos.map((gecko) => (
                  <GeckoSliderCard key={gecko.id} gecko={gecko} />
                ))}
              </Slider>
            </div>
          </div>
          <Link to="/shop" className="view-all-btn">View All Geckos</Link>
        </div>

        <div className="diagonal-transition"></div>

        <div className="fourth-section">
          <h2 className="section-title">Gecko Genetics Hub</h2>
          <div className="content-wrapper">
            <div className="calculator-preview">
              <FontAwesomeIcon icon={faCalculator} className="calculator-icon" />
              <h3>Genetic Calculator</h3>
              <p>Predict offspring traits based on parent genetics.</p>
              <Link to="/genetic-calculator" className="calculator-btn">
                Try Calculator <FontAwesomeIcon icon={faArrowRight} />
              </Link>
            </div>
            <div className="genetics-info">
              <div className="info-card">
                <FontAwesomeIcon icon={faDna} className="info-icon" />
                <h3>Morph Database</h3>
                <p>Explore our comprehensive database of gecko morphs and their genetic makeup.</p>
              </div>
              <div className="info-card">
                <FontAwesomeIcon icon={faChartLine} className="info-icon" />
                <h3>Breeding Projections</h3>
                <p>Visualize potential outcomes and probabilities for your breeding projects.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="diagonal-transition reverse"></div>

        <div className="fifth-section">
          <h2 className="section-title">Why Choose Us?</h2>
          <div className="content-wrapper">
            <div className="feature">
              <div className="feature-icon">🏆</div>
              <h3>Expert Care</h3>
              <p>Our team of experienced professionals ensures the best care for your exotic pets.</p>
            </div>
            <div className="feature">
              <div className="feature-icon">🌿</div>
              <h3>Sustainable Practices</h3>
              <p>We prioritize ethical sourcing and environmental responsibility in all our operations.</p>
            </div>
            <div className="feature">
              <div className="feature-icon">💖</div>
              <h3>Lifetime Support</h3>
              <p>We provide ongoing guidance and support for the entire lifespan of your pet.</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}