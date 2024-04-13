import React, { useState, useEffect } from 'react';
import './Flag.scss';

const Flag = () => {
    const [isFloating, setIsFloating] = useState(false);
    console.log("ENV var: ",process.env.NEXT_PUBLIC_VERCEL_ENV)
    const environment = process.env.NEXT_PUBLIC_VERCEL_ENV === 'preview' ? 'DEV' : 'PROD';
    const environmentStyle = environment === 'DEV' ? { color: 'blue', fontWeight: 'bold' } : { color: 'red', fontWeight: 'bold' };

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            setIsFloating(scrollTop > 100); // Adjust threshold as needed
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <div className={`development-banner ${isFloating ? 'floating' : ''}`}>
            <span style={environmentStyle}>{environment}</span> environment: This site is still in development.
        </div>
    );
};

export default Flag;
