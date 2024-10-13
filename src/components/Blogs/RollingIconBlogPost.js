import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './RollingIconBlogPost.scss';

const RollingIconBlogPost = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <div className="blog-post-container">
      <h1 className="blog-post-title">Rolling Icon Christmas Event</h1>
      <p className="blog-post-date">Posted on October 13, 2023</p>
      
      <div className="blog-post-content">
        <h2>Win a Gecko this Christmas!</h2>
        <p>
          Join our exciting Rolling Icon event this Christmas season! The top 10 players with the highest score by December 20th, 5:00 PM PH time, will have a chance to win an adorable gecko as their prize!
        </p>
        
        <h2>How the Game Works</h2>
        <div className="image-container rolling-icon-examples">
          <div className="image-wrapper">
            <img 
              src="/images/click1.jpg" 
              alt="Rolling Icon Example 1" 
              className="blog-image"
            />
          </div>
          <div className="image-wrapper">
            <img 
              src="/images/click2.jpg" 
              alt="Rolling Icon Example 2" 
              className="blog-image"
            />
          </div>
        </div>
        <p className="image-description">Examples of the Rolling Icon as it appears on our website</p>
        <ol>
          <li>Our icon will appear randomly on different pages of our website.</li>
          <li>The icon moves around the page, making it a fun challenge to catch!</li>
          <li>Click on  the icon to earn points. Be quick - it disappears after a while!</li>
          <li>After clicking, the icon will respawn on a random page after a set time.</li>
          <li>The more icons you catch, the higher your score!</li>
        </ol>
        
        <h2>Exciting Scoring Mechanics</h2>
        <p>
          We've introduced a dynamic scoring system to make the game even more thrilling as we approach the end of the event!
        </p>
        <ul>
          <li>At the start of the event, each click on the Rolling Icon will earn you between 1 to 10 points.</li>
          <li>As we get closer to the end date (December 20th), the potential points you can earn will increase daily!</li>
          <li>In the final days of the event, you could earn up to 30 points or more per click!</li>
          <li>The exact number of points you earn per click is random within the day's range, adding an element of excitement to each capture.</li>
        </ul>
        <p>
          This progressive scoring system means that every player has a chance to climb the leaderboard, even if they start playing later in the event. It also adds extra excitement in the final days as scores can change dramatically!
        </p>
        
        <h2>Prize Details</h2>
        <div className="image-container giveaway-image">
          <div className="image-wrapper" onClick={openModal}>
            <img 
              src="/images/giveaway.jpg" 
              alt="Gecko Prize" 
              className="blog-image"
            />
            <div className="image-overlay">
              <span>Click to zoom</span>
            </div>
          </div>
        </div>
        <p>
          The winner will receive this beautiful Sunglow gecko! Shipping is paid by the winner, only Philippine residents are eligible to win.
        </p>
        
        <h2>Current Leaderboard</h2>
        <p>
          Check out the current standings on our leaderboard! See how you stack up against other players and aim for the top 10 spots to have a chance to win the gecko. Remember, with our new scoring system, the leaderboard can change quickly, especially near the end of the event!
        </p>
        <Link to="/leaderboard" className="leaderboard-link">View Leaderboard</Link>
        
        <div className="event-details">
          <p><strong>Event End Date:</strong> December 20, 2023, 5:00 PM Philippines Time</p>
          <p><strong>Good luck and happy icon hunting!</strong></p>
        </div>
      </div>

      {isModalOpen && (
        <div className="modal" onClick={closeModal}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <img src="/images/giveaway.jpg" alt="Gecko Prize" className="modal-image" />
            <button className="close-button" onClick={closeModal}>&times;</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RollingIconBlogPost;