import React, { useState } from 'react';
import styled from 'styled-components';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

const API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [showSuccess, setShowSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.error(formData);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <ContactContainer>
      <Content>
        <InfoSection>
          <Title>COULDN'T FIND WHAT YOU'RE LOOKING FOR?</Title>
          <Title>MESSAGE US</Title>
          <Form onSubmit={handleSubmit}>
            <Input 
              type="text" 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              placeholder="Name" 
              required 
            />
            <Input 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              placeholder="Email" 
              required 
            />
            <TextArea 
              name="message" 
              value={formData.message} 
              onChange={handleChange} 
              placeholder="Message" 
              required 
            />
            <SendButton type="submit">Send</SendButton>
          </Form>
          {showSuccess && <SuccessMessage>Success!</SuccessMessage>}
        </InfoSection>
        <MapContainer>
          <LoadScript googleMapsApiKey={API_KEY}>
            <GoogleMap
              mapContainerStyle={{ height: '100%', width: '100%' }}
              center={{ lat: 14.68651, lng: 121.05180 }}
              zoom={15}
            >
              <Marker position={{ lat: 14.68651, lng: 121.05180 }} />
            </GoogleMap>
          </LoadScript>
        </MapContainer>
      </Content>
    </ContactContainer>
  );
};

// Styled components
const ContactContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f4f4f4;
  padding: 130px 20px;
  margin-top: 57px;
  margin-bottom: 20px; /* Added to ensure space at bottom */
`;

const Content = styled.div`
  display: flex;
  flex-direction: column; /* Stack vertically on small screens */
  gap: 20px;
  width: 100%;
  
  @media (min-width: 768px) {
    flex-direction: row; /* Side by side on larger screens */
  }
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 700; /* Bold text for emphasis */
  color: #333;
  text-align: center; /* Center-align the text */
  margin-bottom: 15px; /* Space below the title */
  line-height: 1.3; /* Improved line spacing */
  
  &::after {
    content: '';
    display: block;
    width: 60px; /* Width of the underline */
    height: 4px; /* Thickness of the underline */
    background-color: #23283b; /* Underline color */
    margin: 10px auto; /* Centered underline */
    border-radius: 2px; /* Slightly rounded corners */
  }
  
  @media (min-width: 768px) {
    font-size: 36px; /* Larger font size on larger screens */
  }
`;

const InfoSection = styled.div`
  flex: 1 1 auto; /* Grow and shrink as needed, but don't go below auto size */
  display: flex;
  flex-direction: column;
  align-items: center;
  background: #ffffff;
  padding: 30px; /* Increased padding for a more spacious feel */
  border-radius: 10px; /* Slightly more rounded corners */
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* Slightly more pronounced shadow for depth */
  box-sizing: border-box;
  max-width: 500px; /* Limit maximum width */
  margin-bottom: 20px; /* Space between form and map on small screens */

  @media (min-width: 768px) {
    margin-bottom: 0; /* Remove margin on larger screens */
  }
`;

const MapContainer = styled.div`
  flex: 1 1 auto; /* Grow and shrink as needed, but don't go below auto size */
  height: 300px; /* Fixed height for small screens */
  border-radius: 8px;
  overflow: hidden;
  box-sizing: border-box;

  @media (min-width: 768px) {
  height: 700px; 
  }
`;


const Form = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 2px solid #23283b; /* Updated border color */
  border-radius: 5px;
  font-size: 16px;
  background: #fafafa;
  box-sizing: border-box;

  @media (min-width: 768px) {
    font-size: 18px;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 10px;
  height: 150px;
  border: 2px solid #23283b; /* Updated border color */
  border-radius: 5px;
  font-size: 16px;
  background: #fafafa;
  resize: vertical;
  box-sizing: border-box;

  @media (min-width: 768px) {
    font-size: 18px;
  }
`;

const SendButton = styled.button`
  width: 100%;
  max-width: 200px;
  padding: 12px 20px; /* Increased padding for better touch area */
  background-color: white; /* Initial background color */
  color: #23283b; /* Initial text color */
  border: 2px solid #23283b; /* Initial border color */
  border-radius: 5px;
  font-size: 18px; /* Larger font size for better readability */
  font-weight: 600; /* Slightly bolder text for emphasis */
  text-transform: uppercase; /* Uppercase text for a more modern look */
  letter-spacing: 1px; /* Slightly increased letter spacing for readability */
  cursor: pointer;
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
  box-sizing: border-box;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2); /* Subtle shadow for depth */

  &:hover {
    background-color: #23283b; /* Background color on hover */
    color: white; /* Text color on hover */
    border-color: #23283b; /* Border color on hover */
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.3); /* Subtle text shadow on hover */
  }

  @media (max-width: 767px) {
    max-width: 100%;
  }
`;

const SuccessMessage = styled.div`
  margin-top: 20px;
  padding: 10px;
  background-color: #28a745;
  color: #ffffff;
  border: 1px solid #218838;
  border-radius: 5px;
  width: 100%;
  max-width: 500px;
  text-align: center;
`;

export default Contact;
