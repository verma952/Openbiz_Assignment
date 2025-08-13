import React, { useState } from 'react';
import Step1Form from './components/Step1Form';
import Step2Form from './components/Step2Form';
import Progress from './components/Progress'; // Import the Progress component
import './App.css';

export default function App() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({});

  const handleNext = () => {
    // Ensure we don't go past the final "Done" step
    setStep(prev => (prev < 3 ? prev + 1 : 3));
  };

  const handleBack = () => {
    setStep(prev => (prev > 1 ? prev - 1 : 1));
  };

  const restartForm = () => {
    setFormData({});
    setStep(1);
  };

  return (
    <div className="app-container">
      {/* Render the Progress component at the top */}
      <Progress activeStep={step} />

      <div className="form-wrapper">
        {step === 1 && (
          <Step1Form
            onNext={handleNext}
            formData={formData}
            setFormData={setFormData}
          />
        )}
        {step === 2 && (
          <Step2Form
            onBack={handleBack}
            onNext={handleNext}
            formData={formData}
            setFormData={setFormData}
          />
        )}
        {step === 3 && (
          <div className="form-complete">
            <h2>Registration Submitted!</h2>
            <p>Thank you for providing your details.</p>
            <button onClick={restartForm} className="submit-btn">
              Start New Registration
            </button>
          </div>
        )}
      </div>
    </div>
  );
}