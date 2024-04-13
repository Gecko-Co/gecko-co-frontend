import React, { useState } from "react";

const FilterBTN = ({ input, task, updatePageNumber, index, name, selectedValue, setSelectedValue }) => {
 const [isHovered, setIsHovered] = useState(false); // State to track hover

 const handleClick = () => {
    setSelectedValue(input);
    task(input);
    updatePageNumber(1);
 };

 return (
    <div>
      <style jsx>
        {`
          .x:checked + label {
            background-color: #23283b;
            color: white;
            border-color: #23283b;
          }
          input[type="radio"] {
            display: none;
          }
          .btn-outline-primary {
            transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;
            background-color: white;
            color: #23283b;
            border-color: #23283b; /* Set the border color to #23283b by default */
          }
          .btn-outline-primary:hover, .btn-outline-primary:active {
            background-color: #23283b;
            color: white;
            border-color: #23283b; /* Ensure the border color remains #23283b on hover and active */
          }
          .hovered {
            background-color: #23283b;
            color: white;
            border-color: #23283b; /* Ensure the border color remains #23283b when hovered */
          }
        `}
      </style>

      <div className="form-check">
        <input
          className="form-check-input x"
          type="radio"
          name={name}
          id={`${name}-${index}`}
          checked={selectedValue === input}
          onChange={handleClick}
        />
        <label
          className={`btn btn-outline-primary ${isHovered ? 'hovered' : ''}`}
          htmlFor={`${name}-${index}`}
          onMouseEnter={() => setIsHovered(true)} // Set hover state to true on mouse enter
          onMouseLeave={() => setIsHovered(false)} // Set hover state to false on mouse leave
        >
          {input}
        </label>
      </div>
    </div>
 );
};

export default FilterBTN;
