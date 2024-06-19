import React, { useEffect, useRef, useState } from 'react';
import './Home.scss';
import Typed from 'typed.js';
import { Link } from 'react-router-dom';
import featuredData from '../../featured'; // Import the featured data

function Home() {
    const typedRef = useRef(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const images = [
        "images/home1-resize.png",
        "images/home2-resize.png",
        "images/home3-resize.png",
    ];

    const words = ["love?"];
    const [changingWordIndex, setChangingWordIndex] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setChangingWordIndex((prevIndex) => (prevIndex + 1) % words.length);
        }, 3000); // Change word every 3 seconds

        return () => clearInterval(interval);
    }, [words]);

    useEffect(() => {
        const options = {
            strings: [words[changingWordIndex]], // Use the current word from the array
            typeSpeed: 40,
            backSpeed: 50,
            loop: true,
            contentType: 'text',
            cursorChar: '',
            smartBackspace: true, // Enable smart backspacing
        };

        const typed = new Typed(typedRef.current, options);

        return () => {
            typed.destroy();
        };
    }, [changingWordIndex]); // Depend on the changing word index to reset the Typed.js instance

    const goToSlide = (index) => {
        setCurrentImageIndex(index);
    };
    
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 3000);

        return () => clearInterval(interval);
    }, [images.length]);


    return (
        <div className="App">
            <div className="first-section">
                <div className="text-container">
                    <h1 className="text-center mb-3">
                        Looking for a new pet
                    </h1>
                    <h1 className="text-center mb-3">
                        you will
                    </h1>
                    <h1 className="text-center mb-3"> surely <span className="red-text" ref={typedRef}></span>
                    </h1>
                    <Link to="/shop" className="shop-now-button">SHOP NOW!</Link>
                </div>
                <div className="image-container">
                    <img src={images[currentImageIndex]} alt="Background" className="background-image" />
                    <div className="slideshowDots">
                        {images.map((_, index) => (
                            <div
                                key={index}
                                className={`slideshowDot${currentImageIndex === index ? " active" : ""}`}
                                onClick={() => setCurrentImageIndex(index)}
                            ></div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Featured Species Section */}
            <div className="second-section">
                <h2 className="text-center mt-5">Featured Species</h2>
                <div className="row">
                    <div className="col-lg-6 col-md-6 col-sm-12">
                        <div className="image-container">
                            <img src={featuredData.images[currentImageIndex]} alt="Feature Gecko" className="gecko-image" />
                            <div className="slideshowDots">
                                {featuredData.images.map((_, index) => (
                                    <div
                                        key={index}
                                        // className={`slideshowDot${currentImageIndex === index ? " active" : ""}`}
                                        onClick={() => setCurrentImageIndex(index)}
                                    ></div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="col-lg-6 col-md-6 col-sm-12">
                        <div className="gecko-info">
                            <h3>{featuredData.name}</h3>
                            <ul>
                                <li><strong>Name:</strong> {featuredData.name}</li>
                                <li><strong>Description:</strong> {featuredData.description}</li>
                                <li><strong>Species:</strong> {featuredData.species}</li>
                                <li><strong>Origin:</strong> {featuredData.origin}</li>
                                <li><strong>Size:</strong> {featuredData.size}</li>
                                <li><strong>Range:</strong> {featuredData.range}</li>
                                <li><strong>Diet:</strong> {featuredData.diet}</li>
                                <li><strong>Lifespan:</strong> {featuredData.lifespan} years</li>
                                {/* Add more fields as needed */}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;
