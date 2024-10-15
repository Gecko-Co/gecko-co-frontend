import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { doc, updateDoc, increment, getDoc, setDoc } from 'firebase/firestore';
import { ref, onValue, set } from 'firebase/database';
import { db, realtimeDb } from '../../firebase';
import { useAuth } from '../Auth/AuthContext';
import customToast from '../../utils/toast';
import './GeckoGame.scss';

const GeckoGame = ({ transferTime, respawnTime, enabledPages, geckoGameEnabled }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [currentPage, setCurrentPage] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [dailyBonusAvailable, setDailyBonusAvailable] = useState(false);
  const { currentUser } = useAuth();
  const location = useLocation();
  const tooltipTimeoutRef = useRef();
  const positionRef = useRef({ x: 0, y: 0 });
  const velocityRef = useRef({ x: 0.002, y: 0.002 });
  const animationRef = useRef();

  const getRandomPosition = useCallback(() => {
    return {
      x: Math.random() * (window.innerWidth - 80),
      y: Math.random() * (window.innerHeight - 80),
    };
  }, []);

  const getRandomPage = useCallback(() => {
    return enabledPages[Math.floor(Math.random() * enabledPages.length)];
  }, [enabledPages]);

  const updatePosition = useCallback(() => {
    positionRef.current.x += velocityRef.current.x * window.innerWidth;
    positionRef.current.y += velocityRef.current.y * window.innerHeight;

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

  const updateIconState = useCallback((newPage, visible, nextRespawnTime = null) => {
    const now = Date.now();
    set(ref(realtimeDb, 'geckoIcon'), {
      page: newPage,
      visible: visible,
      lastUpdated: now,
      nextTransferTime: now + transferTime,
      nextRespawnTime: nextRespawnTime
    }).then(() => {
      console.log('Icon state updated:', {
        visible: visible,
        lastUpdated: now,
        nextTransferTime: now + transferTime,
        nextRespawnTime: nextRespawnTime
      });
    }).catch((error) => {
      console.error('Error updating icon state:', error);
    });
  }, [transferTime]);

  const startTransferTimer = useCallback(() => {
    const checkAndTransfer = () => {
      const iconRef = ref(realtimeDb, 'geckoIcon');
      onValue(iconRef, (snapshot) => {
        const data = snapshot.val();
        if (data && data.nextTransferTime && Date.now() >= data.nextTransferTime) {
          console.log('Transferring gecko to new page');
          const newRandomPage = getRandomPage();
          updateIconState(newRandomPage, true);
          setIsVisible(false);
        } else {
          console.log('Not time to transfer yet. Checking again in 1 second.');
          setTimeout(checkAndTransfer, 1000);
        }
      });
    };
    checkAndTransfer();
  }, [getRandomPage, updateIconState]);

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

  const checkDailyBonus = useCallback(async () => {
    if (currentUser) {
      try {
        const userRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userRef);
        const lastBonusDate = userDoc.data()?.lastDailyBonus?.toDate();
        const today = new Date();
        if (!lastBonusDate || 
            lastBonusDate.getDate() !== today.getDate() || 
            lastBonusDate.getMonth() !== today.getMonth() || 
            lastBonusDate.getFullYear() !== today.getFullYear()) {
          setDailyBonusAvailable(true);
        } else {
          setDailyBonusAvailable(false);
        }
      } catch (error) {
        console.error('Error checking daily bonus:', error);
      }
    }
  }, [currentUser]);

  const respawnGecko = useCallback(() => {
    if (geckoGameEnabled) {
      const newRandomPage = getRandomPage();
      setCurrentPage(newRandomPage);
      updateIconState(newRandomPage, true, null);
    }
  }, [geckoGameEnabled, getRandomPage, updateIconState]);

  const scheduleRespawn = useCallback(() => {
    const nextRespawnTime = Date.now() + respawnTime;
    updateIconState(currentPage, false, nextRespawnTime);
    setTimeout(respawnGecko, respawnTime);
  }, [respawnTime, 

 respawnGecko, updateIconState, currentPage]);

  useEffect(() => {
    if (!geckoGameEnabled) {
      setIsVisible(false);
      return;
    }

    const iconRef = ref(realtimeDb, 'geckoIcon');
    const unsubscribe = onValue(iconRef, (snapshot) => {
      const data = snapshot.val();
      if (data && geckoGameEnabled) {
        setCurrentPage(data.page);
        const shouldBeVisible = data.visible && data.page === location.pathname;
        setIsVisible(shouldBeVisible);
        if (shouldBeVisible) {
          positionRef.current = getRandomPosition();
          velocityRef.current = { 
            x: (Math.random() * 0.004 - 0.002), 
            y: (Math.random() * 0.004 - 0.002) 
          };
          updatePosition();
          startTooltipTimer();
          startTransferTimer();
        } else {
          if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
          }
          if (tooltipTimeoutRef.current) {
            clearTimeout(tooltipTimeoutRef.current);
          }
        }
      } else {
        setIsVisible(false);
        scheduleRespawn();
      }
    });

    checkDailyBonus();

    return () => {
      unsubscribe();
      if (tooltipTimeoutRef.current) {
        clearTimeout(tooltipTimeoutRef.current);
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [location, checkDailyBonus, startTransferTimer, updatePosition, getRandomPosition, startTooltipTimer, geckoGameEnabled, scheduleRespawn]);

  const calculateScore = useCallback(() => {
    const minScore = 1;
    const maxScore = 50;
    return Math.floor(Math.random() * (maxScore - minScore + 1)) + minScore;
  }, []);

  const handleClick = useCallback(async () => {
    if (currentUser && !isUpdating && geckoGameEnabled) {
      setIsUpdating(true);
      try {
        const earnedScore = calculateScore();
        const userRef = doc(db, 'users', currentUser.uid);

        let bonusPoints = 0;
        if (dailyBonusAvailable) {
          bonusPoints = 50;
          await setDoc(userRef, { lastDailyBonus: new Date() }, { merge: true });
          setDailyBonusAvailable(false);
        }

        await updateDoc(userRef, {
          points: increment(earnedScore + bonusPoints),
        });

        const userDoc = await getDoc(userRef);
        const newPoints = userDoc.data().points;

        if (bonusPoints > 0) {
          customToast.success(`Daily Bonus! +${bonusPoints} bonus points! +${earnedScore} points! Total: ${newPoints}`);
        } else {
          customToast.success(`+${earnedScore} points! Total: ${newPoints}`);
        }

        setIsVisible(false);
        setShowTooltip(false);
        updateIconState(currentPage, false, Date.now() + respawnTime);

        if (tooltipTimeoutRef.current) {
          clearTimeout(tooltipTimeoutRef.current);
        }
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }

        scheduleRespawn();
      } catch (error) {
        console.error('Error updating points:', error);
        customToast.error('Failed to update points. Please try again.');
      } finally {
        setIsUpdating(false);
      }
    } else if (!currentUser) {
      customToast.info('Sign in to collect points!');
    }
  }, [currentUser, calculateScore, isUpdating, dailyBonusAvailable, currentPage, geckoGameEnabled, updateIconState, scheduleRespawn, respawnTime]);

  if (!geckoGameEnabled || !isVisible) return null;

  return (
    <div 
      className={`gecko-game-object ${showTooltip ? 'show-tooltip' : ''} ${dailyBonusAvailable ? 'daily-bonus' : ''}`}
      onClick={handleClick}
      onKeyPress={(e) => e.key === 'Enter' && handleClick()}
      tabIndex={0}
      role="button"
      aria-label={dailyBonusAvailable ? "Click to earn points and collect your daily bonus!" : "Click to earn points"}
    >
      <img src="/images/geckoco-png.png" alt="Gecko Co. Logo" />
      {dailyBonusAvailable && <div className="daily-bonus-indicator">Daily Bonus Available!</div>}
    </div>
  );
};

export default React.memo(GeckoGame);