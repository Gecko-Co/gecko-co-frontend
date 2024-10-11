import React, { useState, useCallback } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';
import { useAuth } from '../Auth/AuthContext';
import { db } from '../../firebase';
import { collection, addDoc } from 'firebase/firestore';
import customToast from '../../utils/toast';
import './Contact.scss';

const API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

const mapContainerStyle = {
  width: '100%',
  height: '100%',
  minHeight: '300px',
};

const center = {
  lat: 14.68651,
  lng: 121.05180,
};

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const { currentUser } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({ ...prevData, [name]: value }));
  };

  const validateEmail = (email: string) => {
    const re = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return re.test(String(email).toLowerCase());
  };

  const handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!currentUser) {
      customToast.error('Please log in to submit the form');
      return;
    }
    if (!validateEmail(formData.email)) {
      customToast.error('Please enter a valid email address');
      return;
    }
    addDoc(collection(db, 'contactMessages'), {
      ...formData,
      userId: currentUser.uid,
      timestamp: new Date()
    })
      .then(() => {
        setFormData({ name: '', email: '', message: '' });
        customToast.success('Message sent successfully!');
      })
      .catch((error) => {
        console.error('Error submitting form:', error);
        customToast.error('Failed to send message. Please try again.');
      });
  };

  const handleNewsletterSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!currentUser) {
      customToast.error('Please log in to subscribe to the newsletter');
      return;
    }
    if (!validateEmail(newsletterEmail)) {
      customToast.error('Please enter a valid email address');
      return;
    }
    addDoc(collection(db, 'newsletterSubscriptions'), {
      email: newsletterEmail,
      userId: currentUser.uid,
      timestamp: new Date()
    })
      .then(() => {
        setNewsletterEmail('');
        customToast.success('Subscribed successfully!');
      })
      .catch((error) => {
        console.error('Error subscribing to newsletter:', error);
        customToast.error('Failed to subscribe. Please try again.');
      });
  };

  const faqs = [
    { question: "What types of exotic pets do you offer?", answer: "We specialize on gecko species but from time to time we offer other reptiles." },
    { question: "How do I care for my exotic pet?", answer: "Care instructions vary by species. We provide detailed care guides with every purchase and offer ongoing support." },
    { question: "Do you ship internationally?", answer: "We currently ship within the Philippines only, to ensure the safety and well-being of our animals." },
  ];

  const renderMap = useCallback(() => {
    return (
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={15}
      >
        <Marker position={center} />
      </GoogleMap>
    );
  }, []);

  return (
    <div className="contact-container">
      <div className="content">
        <div className="info-section">
          <h1 className="title">Get in Touch</h1>
          <p className="subtitle">We'd love to hear from you!</p>
          <form className="contact-form">
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
            <button type="button" className="send-button" onClick={handleSubmit}>
              <span>{currentUser ? 'Send Message' : 'Log in to Send Message'}</span>
            </button>
          </form>
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
            <form>
              <input
                type="email"
                placeholder="Enter your email"
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                required
              />
              <button type="button" onClick={handleNewsletterSubmit}>
                {currentUser ? 'Subscribe' : 'Log in to Subscribe'}
              </button>
            </form>
          </div>
          <div className="map-container">
            <LoadScript googleMapsApiKey={API_KEY}>
              {renderMap()}
            </LoadScript>
          </div>
        </div>
      </div>
    </div>
  );
}