import React, { useState, useEffect } from "react";
import ReactPaginate from "react-paginate";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";

const Pagination = ({ itemsPerPage, totalItems, currentPage, onPageChange }) => {
  const [width, setWidth] = useState(window.innerWidth);

  const updateDimensions = () => {
    setWidth(window.innerWidth);
  };

  useEffect(() => {
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const pageCount = Math.ceil(totalItems / itemsPerPage);

  const handlePageChange = (data) => {
    onPageChange(data.selected + 1);
  };

  return (
    <>
      <style jsx>{`
        .pagination {
          background-color: transparent;
          color: white;
          padding: 10px;
        }
        .pagination a {
          color: #23283b;
          cursor: pointer;
          transition: color 0.3s;
        }
        .pagination a:hover {
          color: orange;
        }
        .pagination .active a {
          background-color: #23283b;
          color: white;
        }
        .custom-prev-next {
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #23283b;
        }
        .custom-prev-next .icon {
          margin-right: 8px;
        }
        .custom-prev-next:hover {
          color: orange;
        }
      `}</style>
      <ReactPaginate
        className="pagination justify-content-center my-4 gap-4"
        nextLabel={
          <div className="custom-prev-next">
            <span className="icon">
              <FontAwesomeIcon icon={faArrowRight} />
            </span>
            Next
          </div>
        }
        previousLabel={
          <div className="custom-prev-next">
            <span className="icon">
              <FontAwesomeIcon icon={faArrowLeft} />
            </span>
            Prev
          </div>
        }
        forcePage={currentPage - 1}
        activeClassName="active"
        marginPagesDisplayed={width < 576 ? 1 : 2}
        pageRangeDisplayed={width < 576 ? 1 : 2}
        pageCount={pageCount}
        onPageChange={handlePageChange}
        pageClassName="page-item"
        pageLinkClassName="page-link"
      />
    </>
  );
};

export default Pagination;