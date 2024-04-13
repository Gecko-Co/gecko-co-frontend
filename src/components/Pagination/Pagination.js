import React, { useState, useEffect } from "react";
import ReactPaginate from "react-paginate";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faArrowRight } from "@fortawesome/free-solid-svg-icons";

const Pagination = ({ pageNumber, info, updatePageNumber }) => {
  let pageChange = (data) => {
    updatePageNumber(data.selected + 1);
  };

  const [width, setWidth] = useState(window.innerWidth);
  const updateDimensions = () => {
    setWidth(window.innerWidth);
  };
  useEffect(() => {
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  return (
    <>
      <style jsx>
        {`
          @media (max-width: 768px) {
            .pagination {
              font-size: 12px;
            }
          }
          @media (min-width: 769px) and (max-width: 992px) {
            .pagination {
              font-size: 14px;
            }
          }
          .custom-prev-next {
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
          }
          .custom-prev-next .icon {
            margin-right: 8px;
          }
        `}
      </style>
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
        forcePage={pageNumber === 1 ? 0 : pageNumber - 1}
        activeClassName="active"
        marginPagesDisplayed={width < 576 ? 1 : 2}
        pageRangeDisplayed={width < 576 ? 1 : 2}
        pageCount={info?.pages}
        onPageChange={pageChange}
        pageClassName="page-item"
        pageLinkClassName="page-link"
      />
    </>
  );
};

export default Pagination;
