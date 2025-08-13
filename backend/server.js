const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path");
const { createClient } = require('@supabase/supabase-js');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// --- Supabase Connection ---
// Ensure you have a .env file with SUPABASE_URL and SUPABASE_KEY or replace these directly.
// For security, it's best to use environment variables.
const supabaseUrl = 'https://qvrwitcxyuxuhyqavosa.supabase.co';
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF2cndpdGN4eXV4dWh5cWF2b3NhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTExNTcxNywiZXhwIjoyMDcwNjkxNzE3fQ.gECKB06oPugMNtb0QUXmWqn9SGFr-W963im_5e1lOoE"; // Replace with your actual service_role key
const supabase = createClient(supabaseUrl, supabaseKey);


// --- Load local data files ---
const dataPath = path.join(__dirname, "data");
const formSchema = JSON.parse(fs.readFileSync(path.join(dataPath, "formSchema.json"), "utf-8"));
const suggestions = JSON.parse(fs.readFileSync(path.join(dataPath, "suggestions.json"), "utf-8"));


// --- API Endpoints ---
app.get("/api/schema", (req, res) => {
  res.json(formSchema);
});

app.get("/api/suggestions", (req, res) => {
  res.json(suggestions);
});


// --- POST /api/submit Endpoint ---
app.post("/api/submit", async (req, res) => {
  const data = req.body;
  const errors = [];

  // Validation logic (remains the same)
  [...formSchema.step1, ...formSchema.step2].forEach(field => {
    const value = data[field.name];
    if (field.required && (value === undefined || value === "")) {
      errors.push(`${field.label || field.name} is required`);
    }
    if (field.pattern && value) {
      const regex = new RegExp(field.pattern);
      if (!regex.test(value)) {
        errors.push(`${field.label || field.name} is invalid`);
      }
    }
    // ... other validation rules
  });

  if (errors.length > 0) {
    return res.status(400).json({ success: false, errors });
  }

  // --- Save to Supabase Database ---
  try {
    const { error: dbError } = await supabase
      .from('registrations') // The name of your table
      .insert([
        {
          entrepreneur_name: data.entrepreneurName,
          aadhaar_number: data.aadhaarNumber,
          // *** THE FIX IS HERE ***
          // The '!!' operator ensures that we always send a boolean (true/false)
          // to the database, which satisfies the 'not-null' constraint.
          aadhaar_consent: !!data.aadhaarConsent,
          organisation_type: data.organisationType,
          pan_number: data.panNumber,
          pan_holder_name: data.panHolderName,
          pan_dob: data.panDOB || null,
          pan_doi: data.panDOI || null,
          pan_consent: !!data.panConsent, // Also fixed for pan_consent
          plant_name: data.plantName,
          address_flat_door_block: data.flatDoorBlock,
          address_city_town: data.villageTownCity,
          address_district: data.district,
          address_state: data.state,
          address_pincode: data.pinCode,
        }
      ]);

    if (dbError) {
      throw dbError;
    }
    
    console.log("✅ Data saved successfully to Supabase.");
    res.json({ success: true, message: "Form submitted successfully" });

  } catch (error) {
    console.error("❌ Supabase database error:", error.message);
    // Provide a more specific error message to the frontend
    res.status(500).json({ success: false, message: `Database error: ${error.message}` });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Backend running on http://localhost:${PORT}`));

// Export the app for testing
module.exports = app;
