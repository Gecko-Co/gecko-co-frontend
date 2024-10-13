import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { db } from '../../firebase';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrophy, faStar } from '@fortawesome/free-solid-svg-icons';
import './Leaderboard.scss';

const Leaderboard = () => {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboardData = async () => {
      try {
        const leaderboardQuery = query(
          collection(db, 'users'),
          orderBy('points', 'desc'),
          limit(10)
        );
        const querySnapshot = await getDocs(leaderboardQuery);
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setLeaderboardData(data);
      } catch (error) {
        console.error('Error fetching leaderboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLeaderboardData();
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
      <h1 className="leaderboard-title">Rolling Icon Leaderboard</h1>
      {loading ? (
        <p>Loading leaderboard...</p>
      ) : (
        <div className="leaderboard-table">
          <div className="leaderboard-header">
            <span className="rank">Rank</span>
            <span className="name">Name</span>
            <span className="points">Points</span>
          </div>
          {leaderboardData.map((user, index) => (
            <div key={user.id} className="leaderboard-row">
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
      )}
    </div>
  );
};

export default Leaderboard;