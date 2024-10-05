import React, { useState } from "react";

const FilterBTN = ({ input, task, index, name, selectedValue }) => {
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = () => {
    task(input);
  };

  return (
    <div>
      <style jsx>{`
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
          border-color: #23283b;
        }
        .btn-outline-primary:hover, .btn-outline-primary:active {
          background-color: #23283b;
          color: white;
          border-color: #23283b;
        }
        .hovered {
          background-color: #23283b;
          color: white;
          border-color: #23283b;
        }
      `}</style>

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
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          {input}
        </label>
      </div>
    </div>
  );
};

export default FilterBTN;