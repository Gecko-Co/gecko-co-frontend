import React, { useEffect, useRef, useState } from 'react';
import './Home.scss';
import Typed from 'typed.js';
import { Link } from 'react-router-dom';
import featuredData from '../../featured';
import placeholderData from "../../data";

export default function Component() {
    const typedRef = useRef(null);
    const [currentSecondSectionIndex, setCurrentSecondSectionIndex] = useState(0);

    const first_section_images = [
        "images/home1-resize.png",
        "images/home2-resize.png",
        "images/home3-resize.png",
    ];
    const second_section_images = featuredData.images;

    const words = ["love?"];
    const [changingWordIndex, setChangingWordIndex] = useState(0);

    // Filter available geckos and select up to 3 for featuring
    const featuredGeckos = placeholderData.results
        .filter(gecko => gecko.status === "Available")
        .slice(0, 3);

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
                    <div className="text-content">
                        <div className="text-container">
                            <h1 className="gradient-text">Looking for a new pet</h1>
                            <h1 className="gradient-text">you will</h1>
                            <h1 className="gradient-text">truly <span className="red-text" ref={typedRef}></span></h1>
                            <Link to="/shop" className="shop-now-button">SHOP NOW!</Link>
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
            </div>

            <div className="diagonal-transition"></div>

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
                        <ul>
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

            <div className="diagonal-transition reverse"></div>

            <div className="third-section">
                <h1 className="section-title">Featured Geckos</h1>
                <div className="content-wrapper">
                    {featuredGeckos.map((gecko) => (
                        <div key={gecko.id} className="gecko-card">
                            <img src={gecko.images} alt={gecko.name} className="gecko-image" />
                            <div className="gecko-info">
                                <h3>{gecko.name}</h3>
                                <p>{gecko.species}</p>
                                <p className="gecko-price">₱{parseInt(gecko.price).toLocaleString()}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <Link to="/shop" className="view-all-btn">View All Geckos</Link>
            </div>

            <div className="diagonal-transition"></div>

            <div className="fourth-section">
                <h1 className="section-title">Why Choose Us?</h1>
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
    );
}