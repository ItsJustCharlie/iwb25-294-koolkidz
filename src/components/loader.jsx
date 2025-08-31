import React from 'react';
import muffinLogo from '../assets/muffin2.png';
import './Loader.css';

export const Loader = () => {
  return (
    <div className="loader-container">
      <div className="waves">
        <svg className="wave" viewBox="0 -34 35 120" xmlns="http://www.w3.org/2000/svg">
          <path d="
            M17.5 0
            C5 15 30 25 17.5 40
            C5 55 30 65 17.5 80
            C5 95 30 105 17.5 120
          " />
        </svg>
        
        <svg className="wave" viewBox="0 0 35 120" xmlns="http://www.w3.org/2000/svg">
          <path d="
            M17.5 0
            C5 15 30 25 17.5 40
            C5 55 30 65 17.5 80
            C5 95 30 105 17.5 120
          " />
        </svg>
        
        <svg className="wave" viewBox="0 -34 35 120" xmlns="http://www.w3.org/2000/svg">
          <path d="
            M17.5 0
            C5 15 30 25 17.5 40
            C5 55 30 65 17.5 80
            C5 95 30 105 17.5 120
          " />
        </svg>
      </div>
      <img src={muffinLogo} className="muffin-loader" alt="muffin" />
    </div>
  );
};