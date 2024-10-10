import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateProfile, updateEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { useAuth } from '../Auth/AuthContext';
import customToast from '../../utils/toast';
import './Settings.scss';

const Settings = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await updateProfile(currentUser, { displayName });
      customToast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      customToast.error('Failed to update profile. Please try again.');
    }
  };

  const handleUpdateEmail = async (e) => {
    e.preventDefault();
    if (!currentPassword) {
      customToast.error('Please enter your current password to update email');
      return;
    }
    try {
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
      await reauthenticateWithCredential(currentUser, credential);
      await updateEmail(currentUser, email);
      customToast.success('Email updated successfully');
    } catch (error) {
      console.error('Error updating email:', error);
      customToast.error('Failed to update email. Please check your password and try again.');
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      customToast.error('New passwords do not match');
      return;
    }
    if (!currentPassword) {
      customToast.error('Please enter your current password');
      return;
    }
    try {
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
      await reauthenticateWithCredential(currentUser, credential);
      await updatePassword(currentUser, newPassword);
      customToast.success('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (error) {
      console.error('Error updating password:', error);
      customToast.error('Failed to update password. Please check your current password and try again.');
    }
  };

  if (!currentUser) {
    navigate('/signin');
    return null;
  }

  return (
    <div className="settings-container">
      <div className="settings-page">
        <h1>Account Settings</h1>
        <form onSubmit={handleUpdateProfile} className="settings-form">
          <h2>Update Profile</h2>
          <div className="form-group">
            <label htmlFor="displayName">Display Name</label>
            <input
              type="text"
              id="displayName"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          </div>
          <button type="submit" className="update-button">Update Profile</button>
        </form>
        <form onSubmit={handleUpdateEmail} className="settings-form">
          <h2>Update Email</h2>
          <div className="form-group">
            <label htmlFor="email">New Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="currentPasswordEmail">Current Password</label>
            <input
              type="password"
              id="currentPasswordEmail"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="update-button">Update Email</button>
        </form>
        <form onSubmit={handleUpdatePassword} className="settings-form">
          <h2>Change Password</h2>
          <div className="form-group">
            <label htmlFor="currentPassword">Current Password</label>
            <input
              type="password"
              id="currentPassword"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="newPassword">New Password</label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
          <button type="submit" className="update-button">Change Password</button>
        </form>
        <button onClick={() => navigate('/account')} className="back-button">Back to Account</button>
      </div>
    </div>
  );
};

export default Settings;