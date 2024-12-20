import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../firebase';
import customToast from '../../utils/toast';
import ReCAPTCHA from "react-google-recaptcha";
import GoogleSignInButton from './GoogleSignInButton';
import { useAuth } from './AuthContext';
import './SignUp.scss';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner'; // Assume you have this component

const SignUp = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const recaptchaRef = useRef(null);
  const navigate = useNavigate();
  const { currentUser, loading: authLoading, setCurrentUser } = useAuth();

  useEffect(() => {
    if (!authLoading && currentUser) {
      navigate('/account');
    }
  }, [currentUser, authLoading, navigate]);

  if (authLoading) {
    return <LoadingSpinner />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      customToast.error('Passwords do not match');
      return;
    }
    
    const captchaValue = recaptchaRef.current.getValue();
    if (!captchaValue) {
      customToast.error('Please complete the CAPTCHA');
      return;
    }
    
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      await updateProfile(user, {
        displayName: `${firstName} ${lastName}`
      });

      await setDoc(doc(db, 'users', user.uid), {
        firstName,
        lastName,
        email,
        createdAt: new Date().toISOString()
      });

      await sendEmailVerification(user);

      setCurrentUser(user);

      customToast.success('Account created successfully! Please check your email to verify your account.');
      
      // Delay navigation slightly to ensure state updates have propagated
      setTimeout(() => {
        navigate('/');
      }, 100);
    } catch (error) {
      console.error('Error signing up:', error);
      if (error.code === 'auth/email-already-in-use') {
        customToast.error('An account with this email already exists.');
      } else if (error.code === 'auth/too-many-requests') {
        customToast.error('Too many sign-up attempts. Please try again later.');
      } else {
        customToast.error('Failed to create account. Please try again.');
      }
    } finally {
      setLoading(false);
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
      }
    }
  };

  return (
    <div className="google-anno-skip">
    <div className="signup-container" style={{ pointerEvents: loading ? 'none' : 'auto' }}>
      <div className="signup-form">
        <h2>Create your account</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="firstName">First Name</label>
            <input
              id="firstName"
              type="text"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="lastName">Last Name</label>
            <input
              id="lastName"
              type="text"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <ReCAPTCHA
            ref={recaptchaRef}
            sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>
        <div className="separator">
          <span>OR</span>
        </div>
        <GoogleSignInButton />
        <p className="login-link">
          Already have an account? <Link to="/signin">Sign In</Link>
        </p>
      </div>
    </div>
    </div>
  );
};

export default SignUp;