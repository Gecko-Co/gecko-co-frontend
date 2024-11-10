import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebook } from '@fortawesome/free-brands-svg-icons';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <StyledFooter>
      <Container>
        <FooterTop>
          <FooterSection>
            <FooterHeading>Connect with Us</FooterHeading>
            <SocialIcons>
              <SocialLink href="https://www.facebook.com/geckoco11" target="_blank" rel="noopener noreferrer">
                <FontAwesomeIcon icon={faFacebook} size="2x" />
              </SocialLink>
            </SocialIcons>
          </FooterSection>
          <FooterSection>
            <FooterHeading>Explore</FooterHeading>
            <ExploreLinks>
              <FooterLink to="/">Home</FooterLink>
              <FooterLink to="/shop">Shop</FooterLink>
              <FooterLink to="/learn">Learn</FooterLink>
              <FooterLink to="/genetic-calculator">Genetic Calculator</FooterLink>
              <FooterLink to="/contact">Contact</FooterLink>
              <FooterLink to="/cart">Cart</FooterLink>
              <FooterLink to="/blogs">Blogs</FooterLink>
              <FooterLink to="/policies">Policies</FooterLink>
              <FooterLink to="/breeder-map">Breeder Map</FooterLink>
            </ExploreLinks>
          </FooterSection>
          <FooterSection>
            <FooterHeading>Contact Information</FooterHeading>
            <FooterText>
              Tandang Sora
              <br />
              Quezon City, Philippines
              <br />
              Phone: +639 274677321
            </FooterText>
          </FooterSection>
          <FooterSection>
            <FooterLogo src="/images/geckoco-png.png" alt="Geckoco Logo" />
          </FooterSection>
        </FooterTop>
        <FooterBottom>
          <FooterText>
            &copy; 2018-{new Date().getFullYear()} Gecko Co.&reg; | All Rights Reserved
          </FooterText>
        </FooterBottom>
      </Container>
    </StyledFooter>
  );
};

const FooterLogo = styled.img`
  width: 150px;
  height: 150px;
  margin-right: 10px; // Adjust margin as needed
`;

const CompanyName = styled.span`
  font-size: 1rem;
  font-weight: bold;
  color: #bd692d;
`;
const StyledFooter = styled.footer`
  background-color: #23283b;
  color: white;
  padding: 40px 0;
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
`;

const FooterTop = styled.div`
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
`;

const FooterBottom = styled.div`
  margin-top: 20px;
  text-align: center;
`;

const FooterSection = styled.div`
  flex: 1 0 250px;
  margin-bottom: 20px;
`;

const FooterHeading = styled.h3`
  color: #ffffff;
  font-size: 18px;
  margin-bottom: 10px;
`;

const SocialIcons = styled.div`
  display: flex;
  gap: 10px;
`;

const SocialLinks = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const SocialLink = styled.a`
  color: white;
  text-decoration: none;
  transition: color 0.3s;

  &:hover {
    color: orange;
  }
`;

const ExploreLinks = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const FooterLink = styled(Link)`
  color: white;
  text-decoration: none;
  margin-bottom: 5px;
  transition: color 0.3s;

  &:hover {
    color: orange;
  }
`;

const FooterText = styled.p`
  font-size: 14px;
  color: #6c757d;
`;

export default Footer;