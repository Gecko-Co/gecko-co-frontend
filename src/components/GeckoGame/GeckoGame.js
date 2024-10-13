import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { doc, updateDoc, increment, getDoc } from 'firebase/firestore';
import { db } from '../../firebase';
import { useAuth } from '../Auth/AuthContext';
import customToast from '../../utils/toast';
import './GeckoGame.scss';

const GeckoGame = ({ transferTime, respawnTime, enabledPages }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [currentPage, setCurrentPage] = useState('');
  const { currentUser } = useAuth();
  const location = useLocation();
  const timeoutRef = useRef();
  const tooltipTimeoutRef = useRef();
  const positionRef = useRef({ x: 0, y: 0 });
  const velocityRef = useRef({ x: 2, y: 2 });
  const animationRef = useRef();

  const checkVisibility = useCallback(() => {
    const lastClickTime = sessionStorage.getItem('geckoGameLastClick');
    const currentTime = Date.now();

    if (lastClickTime && currentTime - parseInt(lastClickTime) < respawnTime) {
      setIsVisible(false);
      return false;
    }
    return true;
  }, [respawnTime]);

  const getRandomPosition = useCallback(() => {
    return {
      x: Math.random() * (window.innerWidth - 80),
      y: Math.random() * (window.innerHeight - 80)
    };
  }, []);

  const getRandomPage = useMemo(() => () => {
    return enabledPages[Math.floor(Math.random() * enabledPages.length)];
  }, [enabledPages]);

  const updatePosition = useCallback(() => {
    positionRef.current.x += velocityRef.current.x;
    positionRef.current.y += velocityRef.current.y;

    if (positionRef.current.x <= 0 || positionRef.current.x >= window.innerWidth - 80) {
      velocityRef.current.x *= -1;
    }
    if (positionRef.current.y <= 0 || positionRef.current.y >= window.innerHeight - 80) {
      velocityRef.current.y *= -1;
    }

    document.documentElement.style.setProperty('--gecko-x', `${positionRef.current.x}px`);
    document.documentElement.style.setProperty('--gecko-y', `${positionRef.current.y}px`);
    document.documentElement.style.setProperty('--gecko-rotate', `${Math.atan2(velocityRef.current.y, velocityRef.current.x) * 180 / Math.PI}deg`);

    animationRef.current = requestAnimationFrame(updatePosition);
  }, []);

  const startPageChangeTimer = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      const newRandomPage = getRandomPage();
      setCurrentPage(newRandomPage);
      setIsVisible(newRandomPage === location.pathname);
      console.log('GeckoGame: Icon moved to', newRandomPage);
      positionRef.current = getRandomPosition();
      velocityRef.current = { x: Math.random() * 4 - 2, y: Math.random() * 4 - 2 };
    }, transferTime);
  }, [getRandomPage, location.pathname, transferTime, getRandomPosition]);

  const startTooltipTimer = useCallback(() => {
    const showTooltip = () => {
      setShowTooltip(true);
      tooltipTimeoutRef.current = setTimeout(() => {
        setShowTooltip(false);
        tooltipTimeoutRef.current = setTimeout(showTooltip, Math.random() * 10000 + 5000);
      }, 3000);
    };
    tooltipTimeoutRef.current = setTimeout(showTooltip, Math.random() * 5000 + 2000);
  }, []);

  useEffect(() => {
    const shouldBeVisible = checkVisibility();
    if (shouldBeVisible) {
      const randomPage = getRandomPage();
      setCurrentPage(randomPage);
      if (randomPage === location.pathname) {
        setIsVisible(true);
        positionRef.current = getRandomPosition();
        velocityRef.current = { x: Math.random() * 4 - 2, y: Math.random() * 4 - 2 };
        console.log('GeckoGame: Icon appeared at', positionRef.current, 'on page', randomPage);
        updatePosition();
        startPageChangeTimer();
        startTooltipTimer();
      } else {
        setIsVisible(false);
      }
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [location, checkVisibility, getRandomPage, startPageChangeTimer, updatePosition, getRandomPosition, startTooltipTimer]);

  const calculateScore = useCallback(() => {
    const today = new Date();
    const endDate = new Date('2023-12-20');
    const daysUntilEnd = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
    const daysToIncrease = Math.max(20 - daysUntilEnd, 0);
    
    const currentMinScore = 1 + daysToIncrease;
    const currentMaxScore = 10 + daysToIncrease;
    
    return Math.floor(Math.random() * (currentMaxScore - currentMinScore + 1)) + currentMinScore;
  }, []);

  const handleClick = useCallback(async () => {
    if (currentUser) {
      const earnedScore = calculateScore();
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        points: increment(earnedScore)
      });

      const userDoc = await getDoc(userRef);
      const newPoints = userDoc.data().points;

      customToast.success(`+${earnedScore} points! Total: ${newPoints}`);

      setIsVisible(false);
      setShowTooltip(false);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }

      console.log('GeckoGame: Icon clicked, will respawn after', respawnTime, 'ms');
      sessionStorage.setItem('geckoGameLastClick', Date.now().toString());

      setTimeout(() => {
        const newRandomPage = getRandomPage();
        setCurrentPage(newRandomPage);
        setIsVisible(newRandomPage === location.pathname);
        console.log('GeckoGame: Icon respawned on', newRandomPage);
        positionRef.current = getRandomPosition();
        velocityRef.current = { x: Math.random() * 4 - 2, y: Math.random() * 4 - 2 };
        updatePosition();
        startTooltipTimer();
      }, respawnTime);
    } else {
      customToast.info('Sign in to collect points!');
    }
  }, [currentUser, respawnTime, getRandomPage, location.pathname, updatePosition, getRandomPosition, startTooltipTimer, calculateScore]);

  if (!isVisible || currentPage !== location.pathname) return null;

  return (
    <div 
      className={`gecko-game-object ${showTooltip ? 'show-tooltip' : ''}`}
      onClick={handleClick}
    >
      <img src="/images/geckoco-png.png" alt="Gecko Co. Logo" />
    </div>
  );
};

export default GeckoGame;