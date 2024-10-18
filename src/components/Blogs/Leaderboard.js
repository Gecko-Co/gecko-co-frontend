import React, { useState, useEffect, useCallback } from 'react';
import { collection, query, orderBy, limit, getDocs, doc, getDoc } from 'firebase/firestore';
import { ref, onValue } from 'firebase/database';
import { db, realtimeDb } from '../../firebase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrophy, faStar, faSpinner, faClock, faEye, faUser } from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../Auth/AuthContext';
import './Leaderboard.scss';

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);
  const [nextRespawnTime, setNextRespawnTime] = useState(null);
  const [countdown, setCountdown] = useState('');
  const [isGeckoVisible, setIsGeckoVisible] = useState(false);
  const [userScore, setUserScore] = useState(null);
  const [userRank, setUserRank] = useState(null);
  const [daysRemaining, setDaysRemaining] = useState(0);
  const { currentUser } = useAuth();

  const fetchLeaderboardData = useCallback(async () => {
    try {
      const leaderboardQuery = query(
        collection(db, 'users'),
        orderBy('points', 'desc'),
        limit(20)
      );
      const querySnapshot = await getDocs(leaderboardQuery);
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setLeaderboardData(data);
      setLastUpdated(new Date());
      setError(null);

      if (currentUser) {
        const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
        const userData = userDoc.data();
        setUserScore(userData?.points || 0);

        const userRank = data.findIndex(user => user.id === currentUser.uid) + 1;
        setUserRank(userRank > 0 ? userRank : 'Unranked');
      }
    } catch (error) {
      console.error('Error fetching leaderboard data:', error);
      setError('Failed to load leaderboard data. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  const fetchGeckoState = useCallback(() => {
    const iconRef = ref(realtimeDb, 'geckoIcon');
    onValue(iconRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setIsGeckoVisible(data.visible);
        if (data.visible) {
          setNextRespawnTime(null);
          setCountdown('');
        } else if (data.nextRespawnTime) {
          const nextRespawn = new Date(data.nextRespawnTime);
          setNextRespawnTime(nextRespawn);
        } else {
          setNextRespawnTime(null);
          setCountdown('');
        }
      } else {
        setIsGeckoVisible(false);
        setNextRespawnTime(null);
        setCountdown('');
      }
    });
  }, []);

  const calculateDaysRemaining = useCallback(() => {
    const endDate = new Date('2024-12-20T23:59:59');
    const now = new Date();
    const timeDiff = endDate.getTime() - now.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    setDaysRemaining(daysDiff);
  }, []);

  useEffect(() => {
    fetchLeaderboardData();
    fetchGeckoState();
    calculateDaysRemaining();

    const intervalId = setInterval(fetchLeaderboardData, 300000);
    const daysIntervalId = setInterval(calculateDaysRemaining, 86400000);

    return () => {
      clearInterval(intervalId);
      clearInterval(daysIntervalId);
    };
  }, [fetchLeaderboardData, fetchGeckoState, calculateDaysRemaining]);

  useEffect(() => {
    let intervalId;
    if (nextRespawnTime && !isGeckoVisible) {
      const updateCountdown = () => {
        const now = Date.now();
        const timeLeft = nextRespawnTime.getTime() - now;

        if (timeLeft <= 0) {
          setCountdown('');
          clearInterval(intervalId);
        } else {
          const minutes = Math.floor(timeLeft / 60000);
          const seconds = Math.floor((timeLeft % 60000) / 1000);
          const newCountdown = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
          setCountdown(newCountdown);
        }
      };

      updateCountdown();
      intervalId = setInterval(updateCountdown, 1000);
    } else {
      setCountdown('');
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [nextRespawnTime, isGeckoVisible]);

  const getTrophyIcon = (index) => {
    switch (index) {
      case 0:
        return <FontAwesomeIcon icon={faTrophy} className="trophy gold" />;
      case 1:
        return <FontAwesomeIcon icon={faTrophy} className="trophy silver" />;
      case 2:
        return <FontAwesomeIcon icon={faTrophy} className="trophy bronze" />;
      default:
        return null;
    }
  };

  const getDisplayName = (user) => {
    if (user.firstName && user.lastName) {
      return `${user.firstName} ${user.lastName}`;
    } else if (user.firstName) {
      return user.firstName;
    } else if (user.email) {
      return user.email.split('@')[0];
    } else {
      return `Player ${user.id.slice(0, 6)}`;
    }
  };

  const getGeckoStatus = () => {
    if (isGeckoVisible) {
      return (
        <p className="gecko-visible">
          <FontAwesomeIcon icon={faEye} /> The Gecko is on the loose! Can you spot it?
        </p>
      );
    } else if (nextRespawnTime) {
      return (
        <p className="next-respawn-time">
          <FontAwesomeIcon icon={faClock} /> Next Gecko Sighting: {countdown || 'Any moment now!'}
        </p>
      );
    }
    return null;
  };

  return (
    <div className="leaderboard-container">
      <h1 className="leaderboard-title">Gecko Hunt Leaderboard</h1>
      {loading ? (
        <div className="loading-spinner">
          <FontAwesomeIcon icon={faSpinner} spin />
          <span>Loading leaderboard...</span>
        </div>
      ) : error ? (
        <div className="error-message">{error}</div>
      ) : (
        <>
          <div className="leaderboard-info">
            <p>Players with 5000 points or more are eligible for the giveaway!</p>
            <p className="days-remaining">Days remaining: {daysRemaining}</p>
            {getGeckoStatus()}
            {currentUser && userScore !== null && userRank !== null && (
              <div className="user-stats">
                <FontAwesomeIcon icon={faUser} /> Your Stats: Rank {userRank} - {userScore} points
              </div>
            )}
          </div>
          <div className="leaderboard-table">
            <div className="leaderboard-header">
              <span className="rank">Rank</span>
              <span className="name">Name</span>
              <span className="points">Points</span>
            </div>
            {leaderboardData.map((user, index) => (
              <div key={user.id} className={`leaderboard-row ${user.points >= 5000 ? 'eligible' : ''} ${user.id === currentUser?.uid ? 'current-user' : ''}`}>
                <span className="rank">
                  {getTrophyIcon(index)}
                  {index + 1}
                </span>
                <span className="name">{getDisplayName(user)}</span>
                <span className="points">
                  <FontAwesomeIcon icon={faStar} className="points-icon" />
                  {user.points || 0}
                </span>
              </div>
            ))}
          </div>
        </>
      )}
      {lastUpdated && (
        <div className="last-updated">
          Last updated: {lastUpdated.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
};

export default Leaderboard;