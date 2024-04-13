import React, { useState } from "react";
import { Link } from "react-router-dom";

const Card = ({ page, results, disableLink = true }) => {
 // Initialize an array to track hover state for each card
 const [isHovered, setIsHovered] = useState(new Array(results.length).fill(false));

 const handleMouseEnter = (index) => {
    setIsHovered((prev) => {
      const newIsHovered = [...prev];
      newIsHovered[index] = true;
      return newIsHovered;
    });
 };

 const handleMouseLeave = (index) => {
    setIsHovered((prev) => {
      const newIsHovered = [...prev];
      newIsHovered[index] = false;
      return newIsHovered;
    });
 };

 const cardStyle = (index) => ({
    border: "2px solid #23283b",
    borderRadius: "10px",
    transition: "transform 0.3s ease-in-out",
    transform: isHovered[index] ? "scale(1.05)" : "scale(1)",
 });

 const imgStyle = {
    borderRadius: "10px 10px 0 0",
    height: "200px",
    objectFit: "cover",
 };

 const badgeStyle = {
    top: "10px",
    right: "20px",
    fontSize: "17px",
 };

 if (results) {
    return (
      <div className="row">
        {results.map((x, index) => {
          const { images, breeder, species = {}, gender, price, status } = x || {};

          let genderIcon;
          if (gender === "Male") {
            genderIcon = <i className="fas fa-mars text-primary"></i>;
          } else if (gender === "Female") {
            genderIcon = <i className="fas fa-venus text-danger"></i>;
          } else {
            genderIcon = <i className="fas fa-question-circle text-secondary"></i>;
          }

          let badgeColor;
          if (status === "Sold") {
            badgeColor = "bg-danger";
          } else if (status === "Available") {
            badgeColor = "bg-success";
          } else if (status === "Reserved") {
            badgeColor = "bg-primary";
          }

          const priceInPHP = price ? `₱${parseFloat(price).toLocaleString('en-US')}` : "Price not available";

          return (
            <div key={breeder} className="col-lg-4 col-md-6 col-sm-6 col-12 mb-4 position-relative text-dark d-flex">
              <div
                style={cardStyle(index)}
                className="d-flex flex-column justify-content-between w-100"
                onMouseEnter={() => handleMouseEnter(index)}
                onMouseLeave={() => handleMouseLeave(index)}
              >
                {disableLink ? (
                 <img style={imgStyle} className="img-fluid" src={images} alt={breeder} />
                ) : (
                 <Link style={{ textDecoration: "none" }} to={`${page}${breeder}`}>
                    <img style={imgStyle} className="img-fluid" src={images} alt={breeder} />
                 </Link>
                )}

                <div className="content" style={{ padding: "10px", display: 'flex', flexDirection: 'column' }}>
                 <div className="fs-5 fw-bold mb-2">{species || 'Unknown Species'}</div>
                 <div className="fs-6" style={{ display: 'flex', alignItems: 'center' }}>
                    <span className="fw-bold">Gender:</span> 
                    <span style={{ marginRight: '5px', marginLeft: '5px' }}>{gender}</span> 
                    {genderIcon}
                 </div>

                 <div className="fs-6"><span className="fw-bold">Price: </span>{priceInPHP}</div>
                 <div className="fs-6">
                    <span style={{ fontWeight: 'bold' }}>Breeder:</span> {breeder}
                 </div>
                </div>

                <div className={`position-absolute badge ${badgeColor}`} style={badgeStyle}>
                 {status}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
 } else {
    return <div className="text-center mt-5"><p style={{ fontSize: '24px', fontWeight: 'bold' }}>No Geckos Found 😢</p></div>;
 }
};

export default Card;
