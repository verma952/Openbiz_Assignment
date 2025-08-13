import React, { useState } from "react";

 import "./step2.css"; 
const indianStates = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka",
  "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya",
  "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim",
  "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
];

const API_BASE_URL = process.env.API_URL || "http://localhost:5000";
export default function Step2Form({ formData, setFormData, onNext }) {
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiMessage, setApiMessage] = useState({ type: "", text: "" });
  const [isPanVerified, setIsPanVerified] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let finalValue = type === 'checkbox' ? checked : value;
    if (name === "panNumber") {
      finalValue = finalValue.toUpperCase();
    }
    setFormData(prev => ({ ...prev, [name]: finalValue }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
    setApiMessage({ type: "", text: "" });
  };

  const validatePanFields = () => {
    // ... (validation logic is unchanged)
    const newErrors = {};
    if (!formData.organisationType) newErrors.organisationType = "Organisation type is required.";
    if (!formData.panNumber) newErrors.panNumber = "PAN number is required.";
    else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(formData.panNumber)) newErrors.panNumber = "Invalid PAN format.";
    if (!formData.panHolderName) newErrors.panHolderName = "Name as per PAN is required.";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePanValidation = async () => {
    // This is still a mock validation for now
    setApiMessage({ type: "", text: "" });
    if (!validatePanFields()) return;
    setIsLoading(true);
    setTimeout(() => {
      setApiMessage({ type: "success", text: "PAN details verified successfully." });
      setIsPanVerified(true);
      setIsLoading(false);
    }, 1000);
  };

  const validateFullForm = () => {
    // ... (validation logic is unchanged)
    const newErrors = {};
    if (!formData.plantName) newErrors.plantName = "Plant/Unit name is required.";
    if (!formData.flatDoorBlock) newErrors.flatDoorBlock = "Flat/Door/Block is required.";
    if (!formData.villageTownCity) newErrors.villageTownCity = "City/Town is required.";
    if (!formData.state) newErrors.state = "State is required.";
    if (!formData.district) newErrors.district = "District is required.";
    if (!formData.pinCode) newErrors.pinCode = "PIN code is required.";
    if (!formData.panConsent) newErrors.panConsent = "You must provide consent.";
    setErrors(prev => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

  // *** CHANGE HERE: This function now calls your backend ***
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isPanVerified) {
      setApiMessage({ type: "error", text: "Please validate your PAN details first." });
      return;
    }
    if (!validateFullForm()) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData), // Send the complete form data
      });
      const result = await response.json();
      if (!response.ok) {
        // If the server returns errors, display them
        const errorMsg = result.errors ? result.errors.join(', ') : (result.message || "An unknown error occurred.");
        throw new Error(errorMsg);
      }
      setApiMessage({ type: "success", text: result.message });
      setTimeout(() => onNext(), 1500);
    } catch (error) {
      setApiMessage({ type: "error", text: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit} noValidate>
        {/* Section 1: Organisation & PAN */}
        <div className="form-section-header">PAN Verification</div>
        <div className="form-grid">
          {/* All form fields are the same as your original code */}
          <div className="form-field">
            <label htmlFor="organisationType">Type of Organisation *</label>
            <select id="organisationType" name="organisationType" value={formData.organisationType || ""} onChange={handleChange} disabled={isPanVerified}>
              <option value="">-- Select Type --</option>
              <option value="proprietorship">Proprietorship</option>
              <option value="partnership">Partnership</option>
              <option value="company">Company / LLP / Trust</option>
            </select>
            {errors.organisationType && <p className="error-text">{errors.organisationType}</p>}
          </div>

          <div className="form-field">
            <label htmlFor="panNumber">PAN *</label>
            <input type="text" id="panNumber" name="panNumber" placeholder="Enter 10-digit PAN" maxLength="10" value={formData.panNumber || ""} onChange={handleChange} disabled={isPanVerified} />
            {errors.panNumber && <p className="error-text">{errors.panNumber}</p>}
          </div>

          <div className="form-field">
            <label htmlFor="panHolderName">Name as per PAN *</label>
            <input type="text" id="panHolderName" name="panHolderName" placeholder="Name as it appears on PAN card" value={formData.panHolderName || ""} onChange={handleChange} disabled={isPanVerified} />
            {errors.panHolderName && <p className="error-text">{errors.panHolderName}</p>}
          </div>

          {formData.organisationType === 'proprietorship' && (
            <div className="form-field">
              <label htmlFor="panDOB">Date of Birth (as per PAN) *</label>
              <input type="date" id="panDOB" name="panDOB" value={formData.panDOB || ""} onChange={handleChange} disabled={isPanVerified} />
              {errors.panDOB && <p className="error-text">{errors.panDOB}</p>}
            </div>
          )}

          {formData.organisationType === 'company' && (
            <div className="form-field">
              <label htmlFor="panDOI">Date of Incorporation (as per PAN) *</label>
              <input type="date" id="panDOI" name="panDOI" value={formData.panDOI || ""} onChange={handleChange} disabled={isPanVerified} />
              {errors.panDOI && <p className="error-text">{errors.panDOI}</p>}
            </div>
          )}
        </div>

        {!isPanVerified && (
          <div className="submit-container">
            <button type="button" onClick={handlePanValidation} disabled={isLoading} className="submit-btn">
              {isLoading ? 'Validating...' : 'Validate PAN'}
            </button>
          </div>
        )}

        <fieldset disabled={!isPanVerified} className="form-fieldset">
          <div className="form-section-header">Official Address of Plant / Unit</div>
          <div className="form-grid">
            <div className="form-field form-field-span-2">
              <label htmlFor="plantName">Plant / Unit Name *</label>
              <input type="text" id="plantName" name="plantName" placeholder="e.g., Main Production Unit" value={formData.plantName || ""} onChange={handleChange} />
              {errors.plantName && <p className="error-text">{errors.plantName}</p>}
            </div>

            <div className="form-field form-field-span-2">
              <label htmlFor="flatDoorBlock">Flat / Door / Block No. *</label>
              <input type="text" id="flatDoorBlock" name="flatDoorBlock" placeholder="Address Line 1" value={formData.flatDoorBlock || ""} onChange={handleChange} />
              {errors.flatDoorBlock && <p className="error-text">{errors.flatDoorBlock}</p>}
            </div>

            <div className="form-field">
              <label htmlFor="villageTownCity">Village / Town / City *</label>
              <input type="text" id="villageTownCity" name="villageTownCity" placeholder="e.g., Mumbai" value={formData.villageTownCity || ""} onChange={handleChange} />
              {errors.villageTownCity && <p className="error-text">{errors.villageTownCity}</p>}
            </div>

            <div className="form-field">
              <label htmlFor="pinCode">PIN Code *</label>
              <input type="text" id="pinCode" name="pinCode" placeholder="Enter 6-digit PIN" maxLength="6" value={formData.pinCode || ""} onChange={handleChange} />
              {errors.pinCode && <p className="error-text">{errors.pinCode}</p>}
            </div>

            <div className="form-field">
              <label htmlFor="state">State *</label>
              <select id="state" name="state" value={formData.state || ""} onChange={handleChange}>
                <option value="">-- Select State --</option>
                {indianStates.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              {errors.state && <p className="error-text">{errors.state}</p>}
            </div>

            <div className="form-field">
              <label htmlFor="district">District *</label>
              <input type="text" id="district" name="district" placeholder="Enter District Name" value={formData.district || ""} onChange={handleChange} />
              {errors.district && <p className="error-text">{errors.district}</p>}
            </div>
          </div>
        </fieldset>

        {isPanVerified && (
          <div className="form-footer">
            <div className="consent-group">
              <input id="panConsent" name="panConsent" type="checkbox" checked={!!formData.panConsent} onChange={handleChange} />
              <div className="consent-label">
                <label htmlFor="panConsent">
                  I, the holder of the above PAN, hereby give my consent to the Ministry of MSME to validate my details.
                </label>
                {errors.panConsent && <p className="error-text">{errors.panConsent}</p>}
              </div>
            </div>

            {apiMessage.text && (
              <div className={`api-message ${apiMessage.type}`}>
                {apiMessage.text}
              </div>
            )}

            <div className="submit-container">
              <button type="submit" disabled={isLoading} className="submit-btn">
                {isLoading ? 'Submitting...' : 'Validate & Submit'}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
