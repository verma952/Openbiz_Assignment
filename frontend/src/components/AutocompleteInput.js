import React, { useState, useEffect, useRef } from "react";
import "./AutoComplete.css"; // Import
export default function AutocompleteInput({
  suggestions = [],
  value,
  onChange,
  placeholder,
  name,
}) {
  const [filteredSuggestions, setFilteredSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  const handleInputChange = (e) => {
    const userInput = e.target.value;
    onChange(e); // Propagate change to the parent form

    const newFiltered = suggestions.filter(
      (s) => s.toLowerCase().indexOf(userInput.toLowerCase()) > -1
    );

    setFilteredSuggestions(newFiltered);
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (suggestionValue) => {
    const syntheticEvent = {
      target: { name: name, value: suggestionValue },
    };
    onChange(syntheticEvent); // Update parent form state
    setShowSuggestions(false);
  };

  return (
    <div className="autocomplete-wrapper" ref={wrapperRef}>
      <input
        type="text"
        value={value}
        onChange={handleInputChange}
        onFocus={() => setShowSuggestions(true)}
        placeholder={placeholder}
        name={name}
        autoComplete="off"
      />
      {showSuggestions && value && filteredSuggestions.length > 0 && (
        <ul className="suggestions-list">
          {filteredSuggestions.map((suggestion, index) => (
            <li key={index} onMouseDown={() => handleSuggestionClick(suggestion)}>
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}