import React, { useState } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import './Contact.scss';

const API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [email, setEmail] = useState('');
  const [showNewsletterSuccess, setShowNewsletterSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log(formData);
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
    setFormData({ name: '', email: '', message: '' });
  };

  const handleNewsletterSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log('Newsletter signup:', email);
    setShowNewsletterSuccess(true);
    setTimeout(() => setShowNewsletterSuccess(false), 3000);
    setEmail('');
  };

  const faqs = [
    { question: "What types of exotic pets do you offer?", answer: "We specialize on gecko species but from time to time we offer other reptiles." },
    { question: "How do I care for my exotic pet?", answer: "Care instructions vary by species. We provide detailed care guides with every purchase and offer ongoing support." },
    { question: "Do you ship internationally?", answer: "We currently ship within the Philippines only, to ensure the safety and well-being of our animals." },
  ];

  return (
    <div className="contact-container">
      <div className="decorative-shape"></div>
      <div className="content">
        <div className="info-section">
          <h1 className="title">Get in Touch</h1>
          <p className="subtitle">We'd love to hear from you!</p>
          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="name">Name</label>
              <input 
                id="name"
                type="text" 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                required 
              />
            </div>
            <div className="input-group">
              <label htmlFor="email">Email</label>
              <input 
                id="email"
                type="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                required 
              />
            </div>
            <div className="input-group">
              <label htmlFor="message">Message</label>
              <textarea 
                id="message"
                name="message" 
                value={formData.message} 
                onChange={handleChange} 
                required 
              />
            </div>
            <button type="submit" className="send-button">
              <span>Send Message</span>
            </button>
          </form>
          {showSuccess && <div className="success-message">Message sent successfully!</div>}
        </div>
        <div className="additional-info">
          <div className="faq-section">
            <h2>Frequently Asked Questions</h2>
            <div className="faq-list">
              {faqs.map((faq, index) => (
                <details key={index} className="faq-item">
                  <summary>{faq.question}</summary>
                  <p>{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
          <div className="newsletter-signup">
            <h2>Stay Updated</h2>
            <p>Subscribe to our newsletter for the latest gecko news and care tips!</p>
            <form onSubmit={handleNewsletterSubmit}>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit">Subscribe</button>
            </form>
            {showNewsletterSuccess && <div className="success-message">Subscribed successfully!</div>}
          </div>
          <div className="map-container">
            <LoadScript googleMapsApiKey={API_KEY}>
              <GoogleMap
                mapContainerStyle={{ height: '100%', width: '100%' }}
                center={{ lat: 14.68651, lng: 121.05180 }}
                zoom={15}
              >
                <Marker position={{ lat: 14.68651, lng: 121.05180 }} />
              </GoogleMap>
            </LoadScript>
          </div>
        </div>
      </div>
    </div>
  );
}