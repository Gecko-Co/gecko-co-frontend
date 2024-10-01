import React, { useRef, useEffect } from 'react';
import styled from 'styled-components';
import {
  Accordion,
  AccordionItem,
  AccordionItemHeading,
  AccordionItemButton,
  AccordionItemPanel,
} from 'react-accessible-accordion';

const PolicyPage = () => {
  const accordionRef = useRef(null);

  useEffect(() => {
    const handleAccordionChange = (event) => {
      if (event.target.getAttribute('aria-expanded') === 'true') {
        const rect = event.target.getBoundingClientRect();
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const targetTop = rect.top + scrollTop;
        const headerOffset = 100; // Adjust this value based on your navbar height
        const elementPosition = targetTop - headerOffset;
        window.scrollTo({
          top: elementPosition,
          behavior: 'smooth'
        });
      }
    };

    const accordionElement = accordionRef.current;
    if (accordionElement) {
      accordionElement.addEventListener('click', handleAccordionChange);
    }

    return () => {
      if (accordionElement) {
        accordionElement.removeEventListener('click', handleAccordionChange);
      }
    };
  }, []);

  return (
    <PageWrapper>
      <CenterContainer>
        <PolicyContainer>
          <PolicyHeader>Policies</PolicyHeader>
          <PolicyDescription>Please read our policies carefully to understand how we operate and protect your rights.</PolicyDescription>
          
          <StyledAccordion allowZeroExpanded ref={accordionRef}>
            <AccordionItem>
              <AccordionItemHeading>
                <StyledAccordionButton>Terms of Service</StyledAccordionButton>
              </AccordionItemHeading>
              <StyledAccordionPanel>
                <PolicySection>
                  <PolicySubheader>1. Acceptance of Terms</PolicySubheader>
                  <PolicyText>By accessing and using Gecko-Co's website and services, you agree to comply with and be bound by these Terms of Service.</PolicyText>
                  
                  <PolicySubheader>2. Use of Services</PolicySubheader>
                  <PolicyText>You agree to use our services only for lawful purposes and in accordance with these Terms.</PolicyText>
                  
                  <PolicySubheader>3. Intellectual Property</PolicySubheader>
                  <PolicyText>All content on this website is the property of Gecko-Co and is protected by copyright laws.</PolicyText>
                  
                  <PolicySubheader>4. User Responsibilities</PolicySubheader>
                  <PolicyText>You are responsible for maintaining the confidentiality of your account and for all activities that occur under your account.</PolicyText>
                  
                  <PolicySubheader>5. Limitation of Liability</PolicySubheader>
                  <PolicyText>Gecko-Co shall not be liable for any indirect, incidental, special, consequential or punitive damages resulting from your use of or inability to use the service.</PolicyText>
                </PolicySection>
              </StyledAccordionPanel>
            </AccordionItem>

            <AccordionItem>
              <AccordionItemHeading>
                <StyledAccordionButton>Privacy Policy</StyledAccordionButton>
              </AccordionItemHeading>
              <StyledAccordionPanel>
                <PolicySection>
                  <PolicySubheader>1. Information Collection</PolicySubheader>
                  <PolicyText>We collect personal information that you voluntarily provide to us when you use our website or services.</PolicyText>
                  
                  <PolicySubheader>2. Use of Information</PolicySubheader>
                  <PolicyText>We use the information we collect to provide, maintain, and improve our services, and to communicate with you.</PolicyText>
                  
                  <PolicySubheader>3. Information Sharing</PolicySubheader>
                  <PolicyText>We do not sell or rent your personal information to third parties. We may share your information with service providers who assist us in operating our website and conducting our business.</PolicyText>
                  
                  <PolicySubheader>4. Data Security</PolicySubheader>
                  <PolicyText>We implement appropriate technical and organizational measures to protect your personal information against unauthorized or unlawful processing, accidental loss, destruction or damage.</PolicyText>
                  
                  <PolicySubheader>5. Your Rights</PolicySubheader>
                  <PolicyText>You have the right to access, correct, or delete your personal information. Please contact us if you wish to exercise these rights.</PolicyText>
                </PolicySection>
              </StyledAccordionPanel>
            </AccordionItem>

            <AccordionItem>
              <AccordionItemHeading>
                <StyledAccordionButton>Cookie Policy</StyledAccordionButton>
              </AccordionItemHeading>
              <StyledAccordionPanel>
                <PolicySection>
                  <PolicySubheader>1. What are Cookies?</PolicySubheader>
                  <PolicyText>Cookies are small text files that are placed on your device when you visit our website.</PolicyText>
                  
                  <PolicySubheader>2. How We Use Cookies</PolicySubheader>
                  <PolicyText>We use cookies to enhance your browsing experience, analyze our website traffic, and personalize content.</PolicyText>
                  
                  <PolicySubheader>3. Types of Cookies We Use</PolicySubheader>
                  <PolicyText>We use both session cookies and persistent cookies. We also use essential cookies, functionality cookies, and analytics cookies.</PolicyText>
                  
                  <PolicySubheader>4. Managing Cookies</PolicySubheader>
                  <PolicyText>You can control and/or delete cookies as you wish. You can delete all cookies that are already on your computer and you can set most browsers to prevent them from being placed.</PolicyText>
                  
                  <PolicySubheader>5. Changes to Our Cookie Policy</PolicySubheader>
                  <PolicyText>We may update our Cookie Policy from time to time. We will notify you of any changes by posting the new Cookie Policy on this page.</PolicyText>
                </PolicySection>
              </StyledAccordionPanel>
            </AccordionItem>

            <AccordionItem>
              <AccordionItemHeading>
                <StyledAccordionButton>Disclaimer</StyledAccordionButton>
              </AccordionItemHeading>
              <StyledAccordionPanel>
                <PolicySection>
                  <PolicySubheader>1. Information Accuracy</PolicySubheader>
                  <PolicyText>While we strive to provide accurate and up-to-date information, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability or availability of the information, products, services, or related graphics contained on the website.</PolicyText>
                  
                  <PolicySubheader>2. Use at Your Own Risk</PolicySubheader>
                  <PolicyText>Any reliance you place on such information is strictly at your own risk. We will not be liable for any loss or damage including without limitation, indirect or consequential loss or damage, arising from the use of this website.</PolicyText>
                  
                  <PolicySubheader>3. External Links</PolicySubheader>
                  <PolicyText>Through this website, you may link to other websites which are not under our control. We have no control over the nature, content, and availability of those sites. The inclusion of any links does not necessarily imply a recommendation or endorse the views expressed within them.</PolicyText>
                  
                  <PolicySubheader>4. Website Availability</PolicySubheader>
                  <PolicyText>Every effort is made to keep the website up and running smoothly. However, we take no responsibility for, and will not be liable for, the website being temporarily unavailable due to technical issues beyond our control.</PolicyText>
                  
                  <PolicySubheader>5. Professional Advice</PolicySubheader>
                  <PolicyText>The information on this website is provided for general information purposes only and does not constitute legal, financial, or other professional advice. You should not act upon this information without seeking professional counsel.</PolicyText>
                </PolicySection>
              </StyledAccordionPanel>
            </AccordionItem>
          </StyledAccordion>

          <UpdatedDate>Last updated: {new Date().toLocaleDateString()}</UpdatedDate>
        </PolicyContainer>
      </CenterContainer>
    </PageWrapper>
  );
};

const PageWrapper = styled.div`
  padding-top: 170px; // Adjust this value based on your navbar height
  min-height: 100vh;
  background-color: #f4f4f4;
  background-image: linear-gradient(to bottom right, #f4f4f4, #e0e0e0);
  display: flex;
  justify-content: center;
  align-items: flex-start;
`;

const CenterContainer = styled.div`
  width: 100%;
  max-width: 800px;
  margin: 20px auto;
`;

const PolicyContainer = styled.div`
  padding: 40px;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    padding: 20px;
  }
`;

const PolicyHeader = styled.h1`
  color: #23283b;
  font-size: 32px;
  margin-bottom: 20px;
  text-align: center;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;

  @media (max-width: 768px) {
    font-size: 24px;
  }
`;

const PolicyDescription = styled.p`
  color: #666;
  font-size: 18px;
  margin-bottom: 30px;
  text-align: center;
  line-height: 1.6;

  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const StyledAccordion = styled(Accordion)`
  border: none;
  background-color: transparent;
`;

const StyledAccordionButton = styled(AccordionItemButton)`
  background-color: #23283b;
  color: #ffffff;
  padding: 15px 20px;
  font-size: 18px;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  width: 100%;
  text-align: left;

  &:hover {
    background-color: #bd692d;
  }

  &[aria-expanded='true'] {
    background-color: #bd692d;
  }

  @media (max-width: 768px) {
    font-size: 16px;
    padding: 12px 16px;
  }
`;

const StyledAccordionPanel = styled(AccordionItemPanel)`
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 0 0 8px 8px;
  padding: 20px;
  margin-top: -8px;
  margin-bottom: 16px;
`;

const PolicySection = styled.div`
  margin-bottom: 20px;
`;

const PolicySubheader = styled.h3`
  color: #23283b;
  font-size: 20px;
  margin-bottom: 10px;
  font-weight: 600;

  @media (max-width: 768px) {
    font-size: 18px;
  }
`;

const PolicyText = styled.p`
  color: #333;
  font-size: 16px;
  line-height: 1.6;
  margin-bottom: 15px;

  @media (max-width: 768px) {
    font-size: 14px;
  }
`;

const UpdatedDate = styled.p`
  color: #666;
  font-size: 14px;
  text-align: center;
  margin-top: 30px;
  font-style: italic;

  @media (max-width: 768px) {
    font-size: 12px;
  }
`;

export default PolicyPage;