import React, { useState } from 'react';
import styled from 'styled-components';

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
    console.log(formData);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
    setFormData({ name: '', email: '', message: '' });
  };

  return (
    <ContactContainer>
      <Title>COULDN'T FIND WHAT YOU ARE LOOKING FOR?</Title>
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
        <SendButton type="submit">Send</SendButton> {/* Updated SendButton styled component */}
      </Form>
      {showSuccess && <SuccessMessage>Success!</SuccessMessage>}
    </ContactContainer>
  );
};

const ContactContainer = styled.div`
  background-color: white;
  padding: 130px 20px;
  margin-top: 75px;
  padding-bottom: 120px;
  text-align: center;
  position: relative;
`;

const Title = styled.h1`
  margin-bottom: 20px;
  font-size: 12px;

  @media (min-width: 768px) {
    font-size: 32px;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
`;

const Input = styled.input`
  width: 80%;
  max-width: 500px;
  padding: 10px;
  border: 2px solid #23283b; /* Updated border color to match SendButton */
  border-radius: 5px;
  font-size: 16px;

  @media (min-width: 768px) {
    font-size: 18px;
  }
`;

const TextArea = styled.textarea`
  width: 80%;
  max-width: 500px;
  padding: 10px;
  height: 150px;
  border: 2px solid #23283b; /* Updated border color to match SendButton */
  border-radius: 5px;
  font-size: 16px;
  resize: vertical;

  @media (min-width: 768px) {
    font-size: 18px;
  }
`;

const SendButton = styled.button`
  width: 150px;
  padding: 10px;
  background-color: white;
  color: #23283b;
  border: 2px solid #23283b;
  border-radius: 5px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;

  &:hover {
    background-color: #23283b;
    color: white;
  }
`;

const SuccessMessage = styled.div`
  margin-top: 40px;
  padding: 10px;
  background-color: #28a745;
  color: #ffffff;
  border: 1px solid #218838;
  border-radius: 5px;
  width: 80%;
  max-width: 500px;
  text-align: center;
  position: absolute;
  top: 180px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
`;

export default Contact;
