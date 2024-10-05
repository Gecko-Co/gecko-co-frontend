import React from "react";
import FilterBTN from "../FilterBTN";

const Species = ({ selectedSpecies, updateSpecies }) => {
  let species = [
    "Leopard Gecko",
    "Crested Gecko",
    "African Fat-tailed Gecko",
    "Knob-Tailed Gecko",
  ];

  return (
    <div className="accordion-item ">
      <h2 className="accordion-header" id="headingTwo">
        <button
          className="accordion-button collapsed"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#collapseTwo"
          aria-expanded="false"
          aria-controls="collapseTwo"
        >
          Species
        </button>
      </h2>
      <div
        id="collapseTwo"
        className="accordion-collapse collapse"
        aria-labelledby="headingTwo"
        data-bs-parent="#accordionExample"
      >
        <div className="accordion-body d-flex flex-wrap gap-3">
          {species.map((item, index) => (
            <FilterBTN
              name="species"
              index={index}
              key={index}
              task={updateSpecies}
              input={item}
              selectedValue={selectedSpecies}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Species;