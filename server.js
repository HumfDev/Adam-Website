require('dotenv').config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

// ── Clients ──────────────────────────────────────────────────────────
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// ── Middleware ────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.static(path.join(__dirname)));   // serves index.html

// ── POST /api/submit ──────────────────────────────────────────────────
app.post('/api/submit', async (req, res) => {
  const {
    firstName, lastName, email, phone,
    company, orgType, role,
    printerType, numPrinters, printsPerMonth,
    researchFocus, mainChallenge, source, message
  } = req.body;

  // Basic server-side validation
  if (!firstName || !lastName || !email || !company || !orgType || !role || !printerType || !mainChallenge) {
    return res.status(400).json({ error: 'Missing required fields.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email address.' });
  }

  // Insert into Supabase — the DB trigger fires the Edge Function which sends emails
  const { error: dbError } = await supabase
    .from('demo_requests')
    .insert([{
      first_name:       firstName,
      last_name:        lastName,
      email:            email.toLowerCase().trim(),
      phone:            phone || null,
      company,
      org_type:         orgType,
      role,
      printer_type:     printerType,
      num_printers:     numPrinters || null,
      prints_per_month: printsPerMonth || null,
      research_focus:   researchFocus || null,
      main_challenge:   mainChallenge,
      source:           source || null,
      message:          message || null,
    }]);

  if (dbError) {
    console.error('Supabase insert error:', dbError);
    return res.status(500).json({ error: 'Failed to save your request. Please try again.' });
  }

  return res.status(200).json({ success: true });
});

// ── Start ─────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`Adam Biotech server running at http://localhost:${PORT}`);
});
