import React from 'react';
import { useState, useEffect } from 'react';
import './Flag.scss';
const Flag = () => {
    const [isFloating, setIsFloating] = useState(false);

    // Add scroll event listener to track scroll position
    useEffect(() => {
      const handleScroll = () => {
        // Determine scroll position
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        // Check if scroll position meets threshold to make banner float
        setIsFloating(scrollTop > 100); // Adjust threshold as needed
      };
  
      window.addEventListener('scroll', handleScroll);
  
      // Clean up event listener
      return () => {
        window.removeEventListener('scroll', handleScroll);
      };
    }, []);
  
    return (
      <div className={`development-banner ${isFloating ? 'floating' : ''}`}>
        DEV environment: This site is still in development.
      </div>
    );
  };

export default Flag;
