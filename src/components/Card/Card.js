import React from "react";
import { Link } from "react-router-dom";
import styles from "./Card.module.scss";
import CardDetails from "./CardDetails";

const Card = ({ page, results }) => {
  let display;

  if (results) {
    display = results.map((x) => {
      // Ensure x and x.location are defined before accessing their properties
      let { id, images, name, status, species = {} } = x || {};

      // Now, even if x or location is undefined, the code won't throw an error
      // but instead, use the default empty object {} and proceed without crashing
      return (
        <Link
          style={{ textDecoration: "none" }}
          to={`${page}${id}`}
          key={id}
          className="col-lg-4 col-md-6 col-sm-6 col-12 mb-4 position-relative text-dark"
        >
          <div
            className={`${styles.card} d-flex flex-column justify-content-center`}
          >
            <img className={`${styles.img} img-fluid`} src={images} alt={name} style={{ width: "250px", height: "200px" }} />
            <div className={`${styles.content}`}>
              <div className="fs-5 fw-bold mb-4">{name}</div>
              
                <div className="fs-7 fw-normal">Species</div>
                <div className="fs-6">{species || 'Unknown'}</div>
              

              
              
            </div>
          </div>

          {(() => {
            if (status === "Sold") {
              return (
                <div
                  className={`${styles.badge} position-absolute badge bg-danger`}
                >
                  {status}
                </div>
              );
            } else if (status === "Available") {
              return (
                <div
                  className={`${styles.badge} position-absolute badge bg-success`}
                >
                  {status}
                </div>
              );
            } else if (status === "Reserved") {
              return (
                <div
                  className={`${styles.badge} position-absolute badge bg-primary`}
                >
                  {status}
                </div>
              );
            }
          })()}
        </Link>
      );
    });
  } else {
    display = "No Geckos Found :/";
  }

  return <>{display}</>;
};

export default Card;
