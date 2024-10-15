import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { ref, onValue } from 'firebase/database';
import { db, realtimeDb } from '../../firebase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrophy, faStar, faSpinner, faClock, faEye } from '@fortawesome/free-solid-svg-icons';
import './Leaderboard.scss';

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState(null);
  const [nextRespawnTime, setNextRespawnTime] = useState(null);
  const [countdown, setCountdown] = useState('');
  const [isGeckoVisible, setIsGeckoVisible] = useState(false);

  useEffect(() => {
    const fetchLeaderboardData = async () => {
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
      } catch (error) {
        console.error('Error fetching leaderboard data:', error);
        setError('Failed to load leaderboard data. Please log-in.');
      } finally {
        setLoading(false);
      }
    };

    const fetchGeckoState = () => {
      const iconRef = ref(realtimeDb, 'geckoIcon');
      onValue(iconRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setIsGeckoVisible(data.visible);
          if (data.nextRespawnTime) {
            setNextRespawnTime(new Date(data.nextRespawnTime));
          } else {
            setNextRespawnTime(null);
          }
        } else {
          setIsGeckoVisible(false);
          setNextRespawnTime(null);
        }
      });
    };

    fetchLeaderboardData();
    fetchGeckoState();

    const intervalId = setInterval(fetchLeaderboardData, 60000);

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    let countdownInterval;
    if (nextRespawnTime && !isGeckoVisible) {
      countdownInterval = setInterval(() => {
        const now = new Date();
        const timeLeft = nextRespawnTime.getTime() - now.getTime();

        if (timeLeft <= 0) {
          setCountdown('Respawning...');
          clearInterval(countdownInterval);
        } else {
          const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
          const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
          setCountdown(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
        }
      }, 1000);
    }

    return () => {
      if (countdownInterval) {
        clearInterval(countdownInterval);
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
          <FontAwesomeIcon icon={faClock} /> Next Gecko Sighting: {countdown}
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
            {getGeckoStatus()}
          </div>
          <div className="leaderboard-table">
            <div className="leaderboard-header">
              <span className="rank">Rank</span>
              <span className="name">Name</span>
              <span className="points">Points</span>
            </div>
            {leaderboardData.map((user, index) => (
              <div key={user.id} className={`leaderboard-row ${user.points >= 5000 ? 'eligible' : ''}`}>
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