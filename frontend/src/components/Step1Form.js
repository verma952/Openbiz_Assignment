import React, { useState } from "react";
// Make sure to import your CSS file in your actual project
import "./step1.css";

export default function Step1Form({ onNext, formData, setFormData }) {
  // We assume the parent component provides a stable object for field names,
  // or we define them statically here for clarity.
  const fieldNames = {
    aadhaar: "aadhaarNumber",
    name: "entrepreneurName"
  };

  const [errors, setErrors] = useState({});

  const handleChange = (name, value) => {
    let processedValue = value;
    // 1. Real-time input filtering for better UX
    if (name === fieldNames.aadhaar) {
      // Remove all non-digit characters
      processedValue = value.replace(/\D/g, "");
    } else if (name === fieldNames.name) {
      // Remove all non-alphabetic/non-space characters
      processedValue = value.replace(/[^a-zA-Z\s]/g, "");
    }

    setFormData((prev) => ({ ...prev, [name]: processedValue }));

    // Clear error for the field being edited
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  /**
   * 2. A dedicated validation function for clarity and robustness.
   */
  const validate = () => {
    const newErrors = {};
    const aadhaarNum = formData[fieldNames.aadhaar] || "";
    const entrepreneurName = formData[fieldNames.name] || "";

    // Aadhaar Validation
    if (!aadhaarNum) {
      newErrors[fieldNames.aadhaar] = "Aadhaar number is required.";
    } else if (!/^\d{12}$/.test(aadhaarNum)) {
      newErrors[fieldNames.aadhaar] = "Aadhaar must be a 12-digit number.";
    }

    // Name Validation
    if (!entrepreneurName.trim()) {
      newErrors[fieldNames.name] = "Name is required.";
    } else if (!/^[a-zA-Z\s]+$/.test(entrepreneurName)) {
      // This is a fallback, as handleChange should prevent this state.
      newErrors[fieldNames.name] = "Name must only contain letters and spaces.";
    }
    
    // Consent Validation
    if (!formData.consent) {
      newErrors.consent = "You must agree to the terms to proceed.";
    }

    return newErrors;
  };

  /**
   * 3. handleSubmit is now cleaner and uses the validate function.
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      console.log("Validation successful, proceeding to next step.");
      onNext();
    } else {
      console.log("Validation failed:", validationErrors);
    }
  };

  return (
    <div className="step1-card">
      <form onSubmit={handleSubmit} noValidate>
        <div className="step1-header">Aadhaar Verification With OTP</div>
        <div className="step1-grid">
          {/* Aadhaar number */}
          <div className="step1-field">
            <label htmlFor={fieldNames.aadhaar}>Aadhaar Number / आधार संख्या</label>
            <input
              type="text" // Use text to allow controlled input
              id={fieldNames.aadhaar}
              name={fieldNames.aadhaar}
              placeholder="Enter 12-digit Aadhaar Number"
              value={formData[fieldNames.aadhaar] || ""}
              onChange={(e) => handleChange(fieldNames.aadhaar, e.target.value)}
              maxLength={12}
              autoComplete="off"
            />
            {errors[fieldNames.aadhaar] && (
              <div className="required-text">{errors[fieldNames.aadhaar]}</div>
            )}
          </div>

          {/* Name */}
          <div className="step1-field">
            <label htmlFor={fieldNames.name}>Name of Entrepreneur</label>
            <input
              type="text"
              id={fieldNames.name}
              name={fieldNames.name}
              placeholder="Name as per Aadhaar"
              value={formData[fieldNames.name] || ""}
              onChange={(e) => handleChange(fieldNames.name, e.target.value)}
              autoComplete="off"
            />
            {errors[fieldNames.name] && (
              <div className="required-text">{errors[fieldNames.name]}</div>
            )}
          </div>
        </div>

        <ul className="info-list">
          {/* List items remain the same */}
          <li>Aadhaar number shall be required for Udyam Registration.</li>
          <li>The Aadhaar number shall be of the proprietor in the case of a proprietorship firm, of the managing partner in the case of a partnership firm and of a karta in the case of a Hindu Undivided Family (HUF).</li>
          <li>In case of a Company or a Limited Liability Partnership or a Cooperative Society or a Society or a Trust, the organisation or its authorised signatory shall provide its GSTIN and PAN along with its Aadhaar number.</li>
        </ul>

        <div className="consent">
          <input
            type="checkbox"
            id="consent"
            checked={!!formData.consent}
            onChange={(e) => handleChange("consent", e.target.checked)}
          />
          <label htmlFor="consent">
            I, the holder of the above Aadhaar, hereby give my consent to Ministry of MSME...
          </label>
        </div>
        {errors.consent && (
          <div className="required-text" style={{ paddingLeft: "16px" }}>
            {errors.consent}
          </div>
        )}

        <button type="submit" className="otp-btn">
          Validate & Generate OTP
        </button>
      </form>
    </div>
  );
}