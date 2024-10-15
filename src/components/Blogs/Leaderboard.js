import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrophy, faStar, faSpinner } from '@fortawesome/free-solid-svg-icons';
import './Leaderboard.scss';

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      try {
        const leaderboardQuery = query(
          collection(db, 'users'),
          orderBy('points', 'desc'),
          limit(20) // Increased to show more players
        );
        const querySnapshot = await getDocs(leaderboardQuery);
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setLeaderboardData(data);
        setLastUpdated(new Date());
      } catch (error) {
        console.error('Error fetching leaderboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboardData();

    const intervalId = setInterval(fetchLeaderboardData, 60000); // Refresh every 60 seconds

    return () => clearInterval(intervalId); // Clean up on unmount
  }, []);

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

  const getFullName = (user) => {
    return `${user.firstName || ''} ${user.lastName || ''}`.trim();
  };

  return (
    <div className="leaderboard-container">
      <h1 className="leaderboard-title">Gecko Hunt Leaderboard</h1>
      {loading ? (
        <div className="loading-spinner">
          <FontAwesomeIcon icon={faSpinner} spin />
          <span>Loading leaderboard...</span>
        </div>
      ) : (
        <>
          <div className="leaderboard-info">
            <p>Players with 5000 points or more are eligible for the giveaway!</p>
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
                <span className="name">{getFullName(user)}</span>
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