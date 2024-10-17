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
  const respawnTimeoutRef = useRef();
  const geckoRef = useRef(null);

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
    if (!geckoRef.current) return;

    positionRef.current.x += velocityRef.current.x;
    positionRef.current.y += velocityRef.current.y;

    if (positionRef.current.x <= 0 || positionRef.current.x >= window.innerWidth - 80) {
      velocityRef.current.x *= -1;
    }
    if (positionRef.current.y <= 0 || positionRef.current.y >= window.innerHeight - 80) {
      velocityRef.current.y *= -1;
    }

    geckoRef.current.style.left = `${positionRef.current.x}px`;
    geckoRef.current.style.top = `${positionRef.current.y}px`;
    geckoRef.current.style.transform = `rotate(${Math.atan2(velocityRef.current.y, velocityRef.current.x) * 180 / Math.PI}deg)`;

    animationRef.current = requestAnimationFrame(updatePosition);
  }, []);

  const startAnimation = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
    updatePosition();
  }, [updatePosition]);

  const updateIconState = useCallback((newPage, visible, nextRespawnTime = null) => {
    const now = Date.now();
    set(ref(realtimeDb, 'geckoIcon'), {
      page: newPage,
      visible: visible,
      lastUpdated: now,
      nextTransferTime: visible ? now + transferTime : null,
      nextRespawnTime: visible ? null : nextRespawnTime
    }).then(() => {
      console.log('Updating icon state:', { newPage, visible, nextRespawnTime });
    }).catch((error) => {
      console.error('Error updating icon state:', error);
    });
  }, [transferTime]);

  const startTransferTimer = useCallback(() => {
    console.log('Starting transfer timer');
    const checkAndTransfer = () => {
      const iconRef = ref(realtimeDb, 'geckoIcon');
      onValue(iconRef, (snapshot) => {
        const data = snapshot.val();
        if (data && data.nextTransferTime && Date.now() >= data.nextTransferTime) {
          console.log('Transferring gecko to new page');
          const newRandomPage = getRandomPage();
          updateIconState(newRandomPage, true, null);
          setIsVisible(false);
        } else {
          console.log('Not time to transfer yet. Checking again in 1 second.');
          setTimeout(checkAndTransfer, 1000);
        }
      }, { onlyOnce: true });
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
      console.log('Gecko respawned on page:', newRandomPage);
    }
  }, [geckoGameEnabled, getRandomPage, updateIconState]);

  const scheduleRespawn = useCallback(() => {
    if (respawnTimeoutRef.current) {
      clearTimeout(respawnTimeoutRef.current);
    }
    const nextRespawnTime = Date.now() + respawnTime;
    updateIconState(currentPage || getRandomPage(), false, nextRespawnTime);
    console.log('Scheduled respawn for:', new Date(nextRespawnTime).toISOString());
    respawnTimeoutRef.current = setTimeout(respawnGecko, respawnTime);
  }, [respawnTime, updateIconState, currentPage, getRandomPage, respawnGecko]);

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
        if (shouldBeVisible !== isVisible) {
          setIsVisible(shouldBeVisible);
          if (shouldBeVisible) {
            positionRef.current = getRandomPosition();
            velocityRef.current = { 
              x: (Math.random() * 2 - 1) * 2, 
              y: (Math.random() * 2 - 1) * 2 
            };
            startAnimation();
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
        }

        if (!data.visible && data.nextRespawnTime) {
          const now = Date.now();
          if (now >= data.nextRespawnTime) {
            console.log('Respawning gecko');
            respawnGecko();
          } else {
            const timeUntilRespawn = data.nextRespawnTime - now;
            console.log(`Gecko will respawn in ${timeUntilRespawn / 1000} seconds`);
            if (respawnTimeoutRef.current) {
              clearTimeout(respawnTimeoutRef.current);
            }
            respawnTimeoutRef.current = setTimeout(respawnGecko, timeUntilRespawn);
          }
        }
      } else {
        if (isVisible) {
          setIsVisible(false);
        }
        if (!data || (data && !data.nextRespawnTime)) {
          console.log('No gecko data or nextRespawnTime. Scheduling respawn.');
          scheduleRespawn();
        } else {
          console.log('Waiting for scheduled respawn.');
        }
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
      if (respawnTimeoutRef.current) {
        clearTimeout(respawnTimeoutRef.current);
      }
    };
  }, [location, checkDailyBonus, startTransferTimer, startAnimation, getRandomPosition, startTooltipTimer, geckoGameEnabled, scheduleRespawn, isVisible, respawnGecko]);

  useEffect(() => {
    if (isVisible && geckoGameEnabled) {
      startAnimation();
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isVisible, geckoGameEnabled, startAnimation]);

  const calculateScore = useCallback(async () => {
    if (!currentUser) return 0;

    try {
      const userRef = doc(db, 'users', currentUser.uid);
      const userDoc = await getDoc(userRef);
      const totalPoints = userDoc.data()?.points || 0;

      let minScore = 1;
      let maxScore = 50;

      if (totalPoints >= 1000 && totalPoints < 2000) {
        maxScore = 45;
      } else if (totalPoints >= 2000 && totalPoints < 3000) {
        maxScore = 35;
      } else if (totalPoints >= 3000 && totalPoints < 4000) {
        maxScore = 25;
      } else if (totalPoints >= 4000) {
        maxScore = 20;
      }

      let score = Math.floor(Math.random() * (maxScore - minScore + 1)) + minScore;
      return score > 100 ? 100 : score; // Check if score is greater than 100, return 100 if it is false return score
    } catch (error) {
      console.error('Error calculating score:', error);
      return 1; // Return minimum score if there's an error
    }
  }, [currentUser]);

  const handleClick = useCallback(async () => {
    if (currentUser && !isUpdating && geckoGameEnabled) {
      setIsUpdating(true);
      try {
        const earnedScore = await calculateScore();
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
        console.log('Gecko clicked, scheduling respawn');
        scheduleRespawn();

        if (tooltipTimeoutRef.current) {
          clearTimeout(tooltipTimeoutRef.current);
        }
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current);
        }
      } catch (error) {
        console.error('Error updating points:', error);
        customToast.error('Failed to update points. Please try again.');
      } finally {
        setIsUpdating(false);
      }
    } else if (!currentUser) {
      customToast.info('Sign in to collect points!');
    }
  }, [currentUser, calculateScore, isUpdating, dailyBonusAvailable, geckoGameEnabled, scheduleRespawn]);

  if (!geckoGameEnabled || !isVisible) return null;

  return (
    <div 
      ref={geckoRef}
      className={`gecko-game-object ${showTooltip ? 'show-tooltip' : ''} ${dailyBonusAvailable ? 'daily-bonus' : ''}`}
      onClick={handleClick}
      onKeyPress={(e) => e.key === 'Enter' && handleClick()}
      tabIndex={0}
      role="button"
      aria-label={dailyBonusAvailable ? "Click to earn points and collect your daily bonus!" : "Click to earn points"}
      style={{
        position: 'fixed',
        left: `${positionRef.current.x}px`,
        top: `${positionRef.current.y}px`,
      }}
    >
      <img src="/images/geckoco-png.png" alt="Gecko Co. Logo" />
      {dailyBonusAvailable && <div className="daily-bonus-indicator">Daily Bonus Available!</div>}
    </div>
  );
};

export default React.memo(GeckoGame);