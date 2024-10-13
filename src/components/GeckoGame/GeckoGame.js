import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { doc, updateDoc, increment, getDoc, setDoc } from 'firebase/firestore';
import { ref, onValue, set } from 'firebase/database';
import { db, realtimeDb } from '../../firebase';
import { useAuth } from '../Auth/AuthContext';
import customToast from '../../utils/toast';
import './GeckoGame.scss';

const GeckoGame = ({ transferTime, respawnTime, enabledPages }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const [currentPage, setCurrentPage] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [dailyBonusAvailable, setDailyBonusAvailable] = useState(false);
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
      y: Math.random() * (window.innerHeight - 80),
    };
  }, []);

  const getRandomPage = useMemo(
    () => () => {
      return enabledPages[Math.floor(Math.random() * enabledPages.length)];
    },
    [enabledPages]
  );

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
      
      // Update the icon's visibility state in Firebase Realtime Database
      set(ref(realtimeDb, 'geckoIcon'), {
        page: newRandomPage,
        visible: true,
        lastUpdated: Date.now()
      });
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

  const checkDailyBonus = useCallback(async () => {
    if (currentUser) {
      try {
        const userRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userRef);
        const lastBonusDate = userDoc.data()?.lastDailyBonus?.toDate();
        const today = new Date();
        if (!lastBonusDate || lastBonusDate.getDate() !== today.getDate()) {
          setDailyBonusAvailable(true);
        }
      } catch (error) {
        console.error('Error checking daily bonus:', error);
      }
    }
  }, [currentUser]);

  useEffect(() => {
    const iconRef = ref(realtimeDb, 'geckoIcon');
    const unsubscribe = onValue(iconRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const shouldBeVisible = data.visible && data.page === location.pathname;
        setIsVisible(shouldBeVisible);
        if (shouldBeVisible) {
          positionRef.current = getRandomPosition();
          velocityRef.current = { x: Math.random() * 4 - 2, y: Math.random() * 4 - 2 };
          updatePosition();
          startTooltipTimer();
        } else {
          if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
          }
          if (tooltipTimeoutRef.current) {
            clearTimeout(tooltipTimeoutRef.current);
          }
        }
      }
    });

    checkDailyBonus();
    startPageChangeTimer();

    return () => {
      unsubscribe();
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
  }, [location, checkDailyBonus, startPageChangeTimer, updatePosition, getRandomPosition, startTooltipTimer]);

  const calculateScore = useCallback(() => {
    const minScore = 1;
    const maxScore = 10;
    return Math.floor(Math.random() * (maxScore - minScore + 1)) + minScore;
  }, []);

  const handleClick = useCallback(async () => {
    if (currentUser && !isUpdating) {
      setIsUpdating(true);
      try {
        const earnedScore = calculateScore();
        const userRef = doc(db, 'users', currentUser.uid);
        
        let bonusPoints = 0;
        if (dailyBonusAvailable) {
          bonusPoints = 50; // Daily bonus points
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
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        if (tooltipTimeoutRef.current) {
          clearTimeout(tooltipTimeoutRef.current);
        }
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }

        // Update the icon's visibility state in Firebase Realtime Database
        set(ref(realtimeDb, 'geckoIcon'), {
          page: currentPage,
          visible: false,
          lastUpdated: Date.now()
        });

        console.log('GeckoGame: Icon clicked, will respawn after', respawnTime, 'ms');
        sessionStorage.setItem('geckoGameLastClick', Date.now().toString());

        setTimeout(() => {
          const newRandomPage = getRandomPage();
          setCurrentPage(newRandomPage);
          
          // Update the icon's visibility state in Firebase Realtime Database
          set(ref(realtimeDb, 'geckoIcon'), {
            page: newRandomPage,
            visible: true,
            lastUpdated: Date.now()
          });

          console.log('GeckoGame: Icon respawned on', newRandomPage);
        }, respawnTime);
      } catch (error) {
        console.error('Error updating points:', error);
        customToast.error('Failed to update points. Please try again.');
      } finally {
        setIsUpdating(false);
      }
    } else if (!currentUser) {
      customToast.info('Sign in to collect points!');
    }
  }, [currentUser, respawnTime, getRandomPage, calculateScore, isUpdating, dailyBonusAvailable, currentPage]);

  if (!isVisible || currentPage !== location.pathname) return null;

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