import React, { useEffect, useRef, useState } from 'react';
import './Home.scss';
import Typed from 'typed.js';
import { Link } from 'react-router-dom';

function Home() {
    const typedRef = useRef(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0); // State to manage the current image index
    const images = [ // Array of image sources
        "images/home1.png",
        "images/home2.png",
        "images/home3.png",
        // Add more image sources as needed
    ];

    useEffect(() => {
        const options = {
            strings: ["Looking for the next pet you would surely love?"],
            typeSpeed: 40,
            backSpeed: 50,
            loop: true,
            contentType: 'text',
            cursorChar: '',
        };

        const typed = new Typed(typedRef.current, options);

        return () => {
            typed.destroy();
        };
    }, []);

    // Function to update the current image index based on the clicked dot
    const goToSlide = (index) => {
        setCurrentImageIndex(index);
    };

    // Set up an interval to change the image every 5 seconds
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 3000); // Change image every 5 seconds

        return () => clearInterval(interval); // Clean up the interval on component unmount
    }, [images.length]); // Depend on the length of the images array to reset the interval if images change

    return (
        <div className="App">
            <div className="first-section">
                <div className="text-container">
                    <h1 className="text-center mb-3" ref={typedRef}></h1>
                    <Link to="/shop" className="shop-now-button">SHOP NOW!</Link>
                </div>
                <div className="image-container">
                    <img src={images[currentImageIndex]} alt="Background" className="background-image" />
                </div>
                <div className="slideshowDots">
                    {images.map((_, index) => (
                        <div
                            key={index}
                            className={`slideshowDot${currentImageIndex === index ? " active" : ""}`}
                            onClick={() => goToSlide(index)}
                        ></div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Home;
