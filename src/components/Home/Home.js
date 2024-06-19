import React, { useEffect, useRef, useState } from 'react';
import './Home.scss';
import Typed from 'typed.js';
import { Link } from 'react-router-dom';
import featuredData from '../../featured';

function Home() {
    const typedRef = useRef(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const first_section_images = [
        "images/home1-resize.png",
        "images/home2-resize.png",
        "images/home3-resize.png",
    ];
    const second_section_images = featuredData.images;

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
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % first_section_images.length);
        }, 3000);

        return () => clearInterval(interval);
    }, [first_section_images.length]);

    return (
        <div className="App">
            <div className="first-section">
                <div className="text-container">
                    <h1 className="text-center mb-3">Looking for a new pet </h1>
                    <h1 className="text-center mb-3">you will </h1>
                    <h1 className="text-center mb-3">surely <span className="red-text" ref={typedRef}></span></h1>
                    <Link to="/shop" className="shop-now-button">SHOP NOW!</Link>
                </div>
                <div className="image-container">
                    <img src={first_section_images[currentImageIndex]} alt="Background" className="background-image" />
                    <div className="slideshowDots">
                        {first_section_images.map((_, index) => (
                            <div
                                key={index}
                                className={`slideshowDot${currentImageIndex === index ? " active" : ""}`}
                                onClick={() => goToSlide(index)}
                            ></div>
                        ))}
                    </div>
                </div>
            </div>
            <div className="second-section">
                <div className="image-gallery-container">
                    <div className="main-image-container">
                        <img src={second_section_images[currentImageIndex]} alt="Main Display" className="main-image" />
                    </div>
                    <div className="thumbnail-container">
                        {second_section_images.map((image, index) => (
                            <img
                                key={index}
                                src={image}
                                alt={`Thumbnail ${index + 1}`}
                                className={`thumbnail ${currentImageIndex === index ? 'active' : ''}`}
                                onClick={() => goToSlide(index)}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Home;
