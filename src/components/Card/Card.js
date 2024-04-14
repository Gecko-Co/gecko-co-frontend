import React, { useState } from "react";
import { Link } from "react-router-dom";

const Card = ({ page, results, disableLink = true }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const handleMouseEnter = (index) => {
    setHoveredIndex(index);
  };

  const handleMouseLeave = () => {
    setHoveredIndex(null);
  };

  const cardStyle = {
    border: "2px solid #23283b",
    borderRadius: "10px",
    transition: "transform 0.3s ease-in-out",
    position: "relative",
    overflow: "hidden",
  };

  const imgContainerStyle = {
    borderRadius: "10px 10px 0 0",
    overflow: "hidden",
  };

  const imgStyle = {
    height: "200px",
    objectFit: "cover",
    transition: "transform 0.3s ease-in-out",
    width: "100%",
  };

  const hoverContentStyle = {
    position: "absolute",
    top: "30%",  
    left: "50%",
    transform: "translate(-50%, -50%)",
    textAlign: "center",
    zIndex: "1",
    textDecoration: "none",
    display: hoveredIndex !== null ? "block" : "none",
    color: "#fff",
    fontSize: "18px",
    fontWeight: "bold",
    backgroundColor: "#23283b",
    padding: "10px",
    borderRadius: "5px",
    pointerEvents: disableLink ? "none" : "auto",
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
                style={cardStyle}
                className="d-flex flex-column justify-content-between w-100"
                onMouseEnter={() => handleMouseEnter(index)}
                onMouseLeave={handleMouseLeave}
              >
                {disableLink ? (
                  <div style={imgContainerStyle}>
                    <img 
                      style={{ ...imgStyle, transform: hoveredIndex === index ? "scale(1.1)" : "scale(1)" }}
                      className="img-fluid" 
                      src={images} 
                      alt={breeder} 
                    />
                  </div>
                ) : (
                  <Link style={{ textDecoration: "none" }} to={`${page}${breeder}`}>
                    <div style={imgContainerStyle}>
                      <img 
                        style={{ ...imgStyle, transform: hoveredIndex === index ? "scale(1.1)" : "scale(1)" }}
                        className="img-fluid" 
                        src={images} 
                        alt={breeder} 
                      />
                    </div>
                  </Link>
                )}

                {/* Hover content */}
                {hoveredIndex === index && (
                  <Link 
                    style={hoverContentStyle} 
                    to={`${page}${breeder}`}
                  >
                    See more details
                  </Link>
                )}

                <div className="content" style={{ padding: "10px", display: 'flex', flexDirection: 'column', paddingTop: "10px", overflow: "hidden" }}>
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

                <div className={`position-absolute badge ${badgeColor}`} style={{ top: "10px", right: "20px", fontSize: "17px" }}>
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
