import React from 'react';
import './Progress.css'; // We will create this CSS file next

// A simple checkmark SVG component for the "Done" step
const CheckmarkIcon = () => (
  <svg className="checkmark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
    <circle className="checkmark-circle" cx="26" cy="26" r="25" fill="none" />
    <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
  </svg>
);

export default function Progress({ activeStep }) {
  // Define the steps for the progress bar
  const steps = ['Aadhaar', 'Organisation', 'Done'];

  return (
    <div className="progress-container">
      <div className="progress-bar">
        {/* The background of the progress bar */}
        <div className="progress-bar-background"></div>
        {/* The foreground (filled) part of the progress bar */}
        <div 
          className="progress-bar-foreground" 
          style={{ width: `${((activeStep - 1) / (steps.length - 1)) * 100}%` }}
        ></div>
      </div>

      {steps.map((label, index) => {
        const stepNumber = index + 1;
        let status = '';
        if (activeStep > stepNumber) {
          status = 'completed';
        } else if (activeStep === stepNumber) {
          status = 'active';
        }

        return (
          <div key={label} className={`step-item ${status}`}>
            <div className="dot">
              {/* Show a checkmark for completed steps, otherwise show the number */}
              {activeStep > stepNumber || (label === 'Done' && activeStep === 3) ? <CheckmarkIcon /> : stepNumber}
            </div>
            <div className="label">{label}</div>
          </div>
        );
      })}
    </div>
  );
}