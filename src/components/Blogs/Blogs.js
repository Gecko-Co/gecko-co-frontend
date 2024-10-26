import React from 'react';
import { Link } from 'react-router-dom';
import './Blogs.scss';

const Blogs = () => {
  const blogPosts = [
    {
      id: 2,
      title: 'Introducing the Gecko Co. Breeder Map',
      excerpt: 'Discover our new interactive Breeder Map feature! Connect with gecko breeders worldwide and find your perfect gecko companion.',
      link: '/blogs/breeder-map-introduction',
      image: '/images/breeder-map.jpg',
      date: '2023-10-27', // Added date for sorting
    },
    {
      id: 1,
      title: 'Gecko Hunt Christmas Event',
      excerpt: 'Join our exciting Gecko Hunt event this Christmas season! Win a real gecko by December 20, 5 PM PH time!',
      link: '/blogs/gecko-hunt-christmas-event',
      image: '/images/click1.jpg',
      date: '2023-10-15', // Added date for sorting
    },
    // Uncomment and update these as needed for future blog posts
    // {
    //   id: 3,
    //   title: 'Caring for Your New Gecko',
    //   excerpt: 'Learn the basics of gecko care and create the perfect habitat for your new pet.',
    //   link: '/blogs/caring-for-your-new-gecko',
    //   image: '/images/learn.jpg',
    //   date: '2023-11-01',
    // },
    // {
    //   id: 4,
    //   title: 'Understanding Gecko Genetics',
    //   excerpt: 'Dive into the fascinating world of gecko genetics and morphs.',
    //   link: '/blogs/understanding-gecko-genetics',
    //   image: '/images/genetic-calculator.jpg',
    //   date: '2023-11-15',
    // },
  ];

  // Sort blog posts by date, newest first
  const sortedBlogPosts = [...blogPosts].sort((a, b) => new Date(b.date) - new Date(a.date));

  return (
    <div className="blogs-container">
      <h1 className="blogs-title">Gecko Co. Blogs</h1>
      <div className="blog-posts">
        {sortedBlogPosts.map((post) => (
          <div key={post.id} className="blog-post-card">
            <img src={post.image} alt={post.title} className="blog-post-image" />
            <div className="blog-post-content">
              <h2 className="blog-post-title">{post.title}</h2>
              <p className="blog-post-excerpt">{post.excerpt}</p>
              <p className="blog-post-excerpt">{post.date}</p>
              <Link to={post.link} className="read-more-link">
                Read More
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Blogs;