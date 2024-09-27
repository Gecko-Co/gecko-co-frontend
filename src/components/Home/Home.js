import React, { useEffect, useRef, useState } from 'react';
import './Home.scss';
import Typed from 'typed.js';
import { Link } from 'react-router-dom';
import featuredData from '../../featured';

export default function Home() {
    const typedRef = useRef(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [currentSecondSectionIndex, setCurrentSecondSectionIndex] = useState(0);

    const first_section_images = [
        "images/home1-resize.png",
        "images/home2-resize.png",
        "images/home3-resize.png",
    ];
    const second_section_images = featuredData.images;

    const goToSlide = (index) => {
        setCurrentImageIndex(index);
    };

    const handleTouchStart = (e) => {
        touchStartX = e.touches[0].clientX;
    };

    const handleTouchMove = (e) => {
        touchEndX = e.touches[0].clientX;
        handleGesture();
    };

    let touchStartX = 0;
    let touchEndX = 0;

    const handleGesture = () => {
        if (touchStartX - touchEndX > 50) {
            const nextIndex = (currentImageIndex + 1) % first_section_images.length;
            setCurrentImageIndex(nextIndex);
        }

        if (touchEndX - touchStartX > 50) {
            const prevIndex = (currentImageIndex - 1 + first_section_images.length) % first_section_images.length;
            setCurrentImageIndex(prevIndex);
        }
    };

    const words = ["love?"];
    const [changingWordIndex, setChangingWordIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setChangingWordIndex((prevIndex) => (prevIndex + 1) % words.length);
        }, 3000);

        return () => clearInterval(interval);
    }, [words]);

    useEffect(() => {
        const options = {
            strings: [words[changingWordIndex]],
            typeSpeed: 40,
            backSpeed: 50,
            loop: true,
            contentType: 'text',
            cursorChar: '',
            smartBackspace: true,
        };

        const typed = new Typed(typedRef.current, options);

        return () => {
            typed.destroy();
        };
    }, [changingWordIndex]);

    return (
        <div className="App">
            <div className="first-section">
                <div className="content-wrapper">
                    <div className="text-container">
                        <h1 className="text-center mb-3">Looking for a new pet</h1>
                        <h1 className="text-center mb-3">you will</h1>
                        <h1 className="text-center mb-3">surely <span className="red-text" ref={typedRef}></span></h1>
                        <Link to="/shop" className="shop-now-button">SHOP NOW!</Link>
                    </div>
                    <div className="image-container">
                        <img src={first_section_images[currentImageIndex]} alt="Background" className="background-image" />
                        {/* <div className="slideshowDots" onTouchStart={handleTouchStart} onTouchMove={handleTouchMove}>
                            {first_section_images.map((_, index) => (
                                <div
                                    key={index}
                                    className={`slideshowDot${currentImageIndex === index ? " active" : ""}`}
                                    onClick={() => goToSlide(index)}
                                ></div>
                            ))}
                        </div> */}
                    </div>
                </div>
            </div>

            <div className="wave-transition">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320" preserveAspectRatio="none">
                    <path fill="#ffffff" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,149.3C960,160,1056,160,1152,138.7C1248,117,1344,75,1392,53.3L1440,32L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
                </svg>
            </div>

            <div className="second-section">
                <h1 className="section-title">Featured Species</h1>
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
                        <ul className="bullets">
                            <li><strong>Species:</strong> {featuredData.species}</li>
                            <li><strong>Origin:</strong> {featuredData.origin}</li>
                            <li><strong>Size:</strong> {featuredData.size}</li>
                            <li><strong>Range:</strong> {featuredData.range}</li>
                            <li><strong>Diet:</strong> {featuredData.diet}</li>
                            <li><strong>Lifespan:</strong> {featuredData.lifespan}</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}