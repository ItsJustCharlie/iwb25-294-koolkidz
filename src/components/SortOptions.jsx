import { useState } from 'react';

function SortOptions({ sortBy, setSortBy }) {
  const [isOpen, setIsOpen] = useState(false);
  
  const options = [
    { value: 'sales', label: 'Most Popular' },
    { value: 'price', label: 'Lowest Price' }
  ];

  const selectedOption = options.find(opt => opt.value === sortBy);

  return (
    <div className="sort-dropdown">
      <div 
        className="dropdown-header"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span>Sort by: {selectedOption.label}</span>
        <svg 
          className={`dropdown-icon ${isOpen ? 'open' : ''}`} 
          width="16" 
          height="16" 
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
        >
          <path d="M6 9l6 6 6-6" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </div>
      
      {isOpen && (
        <div className="dropdown-options">
          {options.map(option => (
            <div
              key={option.value}
              className={`dropdown-option ${sortBy === option.value ? 'active' : ''}`}
              onClick={() => {
                setSortBy(option.value);
                setIsOpen(false);
              }}
            >
              {option.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default SortOptions;