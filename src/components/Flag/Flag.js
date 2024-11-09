import React, { useState, useEffect } from 'react';
import './Flag.scss';

const Flag = () => {
    const [isFloating, setIsFloating] = useState(false);
    const [animate, setAnimate] = useState(false);

    const environment = "20%"
    const environmentStyle = { color: '#fff', fontWeight: 'bold', fontSize: '1.2em' };

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            setIsFloating(scrollTop > 100);
        };

        window.addEventListener('scroll', handleScroll);

        // Add animation effect
        const animationInterval = setInterval(() => {
            setAnimate(prev => !prev);
        }, 3000);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            clearInterval(animationInterval);
        };
    }, []);

    return (
        <div className={`development-banner ${isFloating ? 'floating' : ''}`}>
            <span style={{...environmentStyle, transform: animate ? 'scale(1.1)' : 'scale(1)', transition: 'transform 0.3s ease'}}>{environment}</span> OFF 🎉 Limited Time Offer on Selected Items!
        </div>
    );
};

export default Flag;