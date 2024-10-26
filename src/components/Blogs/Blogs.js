import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import './Blogs.scss';

const Blogs = () => {
  const blogPosts = [
    {
      id: 2,
      title: 'Introducing the Gecko Co. Breeder Map',
      excerpt: 'Discover our new interactive Breeder Map feature! Connect with gecko breeders worldwide and find your perfect gecko companion.',
      link: '/blogs/breeder-map-introduction',
      image: '/images/breeder-map.jpg',
      date: '2023-10-27',
    },
    {
      id: 1,
      title: 'Gecko Hunt Christmas Event',
      excerpt: 'Join our exciting Gecko Hunt event this Christmas season! Win a real gecko by December 20, 5 PM PH time!',
      link: '/blogs/gecko-hunt-christmas-event',
      image: '/images/click1.jpg',
      date: '2023-10-15',
    },
  ];

  const sortedBlogPosts = [...blogPosts].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="blogs-container">
      <Helmet>
        <title>Gecko Co. Blogs - Latest News and Events</title>
        <meta name="description" content="Stay updated with the latest news, events, and information about geckos from Gecko Co. Read our blog posts on breeding, care tips, and special events." />
        <meta name="keywords" content="gecko blogs, gecko news, gecko events, gecko care, gecko breeding, Gecko Co" />
        <meta property="og:title" content="Gecko Co. Blogs - Latest News and Events" />
        <meta property="og:description" content="Stay updated with the latest news, events, and information about geckos from Gecko Co. Read our blog posts on breeding, care tips, and special events." />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://geckoco.ph/images/blog-preview.jpg" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Gecko Co. Blogs - Latest News and Events" />
        <meta name="twitter:description" content="Stay updated with the latest news, events, and information about geckos from Gecko Co. Read our blog posts on breeding, care tips, and special events." />
        <meta name="twitter:image" content="https://geckoco.ph/images/blog-preview.jpg" />
      </Helmet>

      <h1 className="blogs-title">Gecko Co. Blogs</h1>
      <div className="blog-posts">
        {sortedBlogPosts.map((post) => (
          <article key={post.id} className="blog-post-card">
            <img src={post.image} alt={`Preview image for ${post.title}`} className="blog-post-image" width="300" height="200" />
            <div className="blog-post-content">
              <h2 className="blog-post-title">{post.title}</h2>
              <p className="blog-post-excerpt">{post.excerpt}</p>
              <div className="blog-post-meta">
                <time className="blog-post-date" dateTime={post.date}>
                  {new Date(post.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </time>
                <Link to={post.link} className="read-more-link" aria-label={`Read more about ${post.title}`}>
                  Read More
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

export default Blogs;