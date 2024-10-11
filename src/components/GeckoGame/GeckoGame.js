import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { doc, updateDoc, increment, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../Auth/AuthContext';
import customToast from '../../utils/toast';
import './GeckoGame.scss';

const GeckoGame = ({ transferTime, respawnTime, score, enabledPages }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isVisible, setIsVisible] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [currentPage, setCurrentPage] = useState('');
  const { currentUser } = useAuth();
  const location = useLocation();
  const animationRef = useRef();
  const timeoutRef = useRef();

  useEffect(() => {
    const checkAndUpdateVisibility = () => {
      const lastClickTime = localStorage.getItem('geckoGameLastClick');
      const currentTime = Date.now();

      if (lastClickTime && currentTime - parseInt(lastClickTime) < respawnTime) {
        setIsVisible(false);
        return;
      }

      const randomPage = enabledPages[Math.floor(Math.random() * enabledPages.length)];
      setCurrentPage(randomPage);

      if (randomPage === location.pathname) {
        setIsVisible(true);
        const newPosition = {
          x: Math.random() * (window.innerWidth - 80),
          y: Math.random() * (window.innerHeight - 80)
        };
        setPosition(newPosition);
        console.log('GeckoGame: Icon appeared at', newPosition, 'on page', randomPage);
        animateRolling();
        startPageChangeTimer();
      } else {
        setIsVisible(false);
      }
    };

    checkAndUpdateVisibility();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [location, respawnTime, enabledPages]);

  const startPageChangeTimer = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      const newRandomPage = enabledPages[Math.floor(Math.random() * enabledPages.length)];
      setCurrentPage(newRandomPage);
      setIsVisible(newRandomPage === location.pathname);
      console.log('GeckoGame: Icon moved to', newRandomPage);
    }, transferTime);
  };

  const animateRolling = () => {
    const roll = () => {
      setRotation((prevRotation) => (prevRotation + 2) % 360);
      setPosition((prevPosition) => {
        const newX = prevPosition.x + 1;
        const newY = prevPosition.y + Math.sin(newX * 0.05) * 2;
        return {
          x: newX > window.innerWidth ? -80 : newX,
          y: Math.max(0, Math.min(window.innerHeight - 80, newY))
        };
      });
      animationRef.current = requestAnimationFrame(roll);
    };
    roll();
  };

  const handleClick = async () => {
    if (currentUser) {
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        points: increment(score)
      });

      const userDoc = await getDoc(userRef);
      const newPoints = userDoc.data().points;

      customToast.success(`+${score} points! Total: ${newPoints}`);

      setIsVisible(false);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      console.log('GeckoGame: Icon clicked, will respawn after', respawnTime, 'ms');
      localStorage.setItem('geckoGameLastClick', Date.now().toString());

      // Schedule respawn on a random page after respawnTime
      setTimeout(() => {
        const newRandomPage = enabledPages[Math.floor(Math.random() * enabledPages.length)];
        setCurrentPage(newRandomPage);
        setIsVisible(newRandomPage === location.pathname);
        console.log('GeckoGame: Icon respawned on', newRandomPage);
      }, respawnTime);
    } else {
      customToast.info('Sign in to collect points!');
    }
  };

  if (!isVisible || currentPage !== location.pathname) return null;

  return (
    <div 
      className="gecko-game-object" 
      style={{ 
        left: `${position.x}px`, 
        top: `${position.y}px`,
        transform: `rotate(${rotation}deg)`
      }}
      onClick={handleClick}
    >
      <img src="/images/geckoco-png.png" alt="Gecko Co. Logo" />
    </div>
  );
};

export default GeckoGame;