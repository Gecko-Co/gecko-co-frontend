import React, { useState, useCallback, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import './RollingIconBlogPost.scss';

const RollingIconBlogPost = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = useCallback(() => setIsModalOpen(true), []);
  const closeModal = useCallback(() => setIsModalOpen(false), []);

  const handleKeyDown = useCallback((event) => {
    if (event.key === 'Escape') {
      closeModal();
    }
  }, [closeModal]);

  useEffect(() => {
    // Add schema.org structured data
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      "headline": "Early Christmas Gecko Hunt Event: Win a Real Gecko!",
      "image": "https://geckoco.ph/images/giveaway.jpg",
      "datePublished": "2023-10-15",
      "author": {
        "@type": "Organization",
        "name": "Gecko Co."
      },
      "publisher": {
        "@type": "Organization",
        "name": "Gecko Co.",
        "logo": {
          "@type": "ImageObject",
          "url": "https://geckoco.ph/logo.png"
        }
      },
      "description": "Join our exciting Gecko Hunt event for a chance to win a real gecko! Reach 5000 points by December 20th to enter the giveaway."
    });
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return (
    <article className="blog-post-container">
      <Helmet>
        <title>Early Christmas Gecko Hunt Event: Win a Real Gecko! | Gecko Co.</title>
        <meta name="description" content="Join our exciting Gecko Hunt event for a chance to win a real gecko! Reach 5000 points by December 20th to enter the giveaway." />
        <meta name="keywords" content="gecko hunt, christmas event, gecko giveaway, online game, pet gecko, Gecko Co" />
        <meta property="og:title" content="Early Christmas Gecko Hunt Event: Win a Real Gecko!" />
        <meta property="og:description" content="Join our exciting Gecko Hunt event for a chance to win a real gecko! Reach 5000 points by December 20th to enter the giveaway." />
        <meta property="og:image" content="https://geckoco.ph/images/giveaway.jpg" />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Early Christmas Gecko Hunt Event: Win a Real Gecko!" />
        <meta name="twitter:description" content="Join our exciting Gecko Hunt event for a chance to win a real gecko! Reach 5000 points by December 20th to enter the giveaway." />
        <meta name="twitter:image" content="https://geckoco.ph/images/giveaway.jpg" />
      </Helmet>

      <h1 className="blog-post-title">Early Christmas Gecko Hunt Event</h1>
      <p className="blog-post-date">Published on October 15, 2023</p>
      
      <section className="blog-post-content">
        <h2>Win a Gecko this Early Christmas Season!</h2>
        <p>
          Join our exciting Gecko Hunt event for an early Christmas celebration! All players who reach 5000 points or more by December 20th, 5:00 PM PH time, will have a chance to win an adorable gecko as their prize!
        </p>
        
        <h2>How the Game Works</h2>
        <figure className="image-container rolling-icon-examples">
          <div className="image-wrapper">
            <img 
              src="/images/click1.jpg" 
              alt="Gecko Hunt Example 1: Gecko icon on website" 
              className="blog-image"
              width="300"
              height="300"
            />
          </div>
          <div className="image-wrapper">
            <img 
              src="/images/click2.jpg" 
              alt="Gecko Hunt Example 2: Gecko icon in different position" 
              className="blog-image"
              width="300"
              height="300"
            />
          </div>
          <figcaption className="image-description">Examples of the gecko icon as it appears on our website</figcaption>
        </figure>
        <ol>
          <li>Our icon will appear randomly on different pages of our website.</li>
          <li>The icon moves around the page, making it a fun challenge to catch!</li>
          <li>Click on the icon to earn points. Be quick - it disappears after a while!</li>
          <li>After clicking, the icon will respawn on a random page after a set time.</li>
          <li>The more icons you catch, the higher your score!</li>
        </ol>
        
        <h2>Scoring Mechanics</h2>
        <ul>
          <li>Each click on the moving icon will earn you between 1 to 50 points.</li>
          <li>The exact number of points you earn per click is random within this range, adding an element of excitement to each capture.</li>
          <li>There's a daily bonus available! The first click of each day will give you an additional 50 points on top of your regular score.</li>
          <li>Keep an eye out for the daily bonus indicator on the icon - it's your chance to boost your score significantly!</li>
        </ul>
        <p>
          This scoring system ensures that every player has a fair chance to reach the 5000 point goal, regardless of when they start playing. It also adds extra excitement as scores can change dramatically with each click and daily bonus!
        </p>
        
        <h2>Prize Details</h2>
        <figure className="image-container giveaway-image">
          <div className="image-wrapper" onClick={openModal}>
            <img 
              src="/images/giveaway.jpg" 
              alt="Sunglow gecko prize for the Gecko Hunt event" 
              className="blog-image"
              width="600"
              height="400"
            />
            <div className="image-overlay">
              <span>Click to zoom</span>
            </div>
          </div>
          <figcaption className="image-caption">The beautiful Sunglow gecko prize for our Gecko Hunt event</figcaption>
        </figure>
        <p>
          The winner will receive this beautiful Sunglow gecko! Shipping is paid by the winner, only Philippine residents are eligible to win and the winner will be responsible for shipping specially those outside NCR.
        </p>
        
        <h2>Current Leaderboard</h2>
        <p>
          Check out the current standings on our leaderboard. See how close you are to reaching the 5000 point goal! Remember, with our scoring system, including daily bonuses, you can climb the leaderboard quickly!
        </p>
        <p>
          Once the event ends, we'll use the <a href="https://wheelofnames.com/" target="_blank" rel="noopener noreferrer">Wheel of Names</a> to determine the winner from all players who reached 5000 points or more.
        </p>
        <Link to="/leaderboard" className="leaderboard-link">View Leaderboard</Link>
        
        <div className="event-details">
          <p><strong>Event End Date:</strong> December 20, 2023, 5:00 PM Philippines Time</p>
          <p><strong>Goal:</strong> Reach 5000 points to be eligible for the giveaway</p>
          <p><strong>Good luck and happy gecko hunting!</strong></p>
        </div>
      </section>

      {isModalOpen && (
        <div className="modal" onClick={closeModal} onKeyDown={handleKeyDown} tabIndex={-1} role="dialog" aria-modal="true">
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-image-container">
              <img src="/images/giveaway.jpg" alt="Full view of the Sunglow gecko prize" className="modal-image" />
              <button className="close-button" onClick={closeModal} aria-label="Close modal">
                &times;
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
};

export default RollingIconBlogPost;