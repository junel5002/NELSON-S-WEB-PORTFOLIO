/*
================================================================================
EMAILJS INTEGRATION NOTES
================================================================================

REQUIRED MATCHING RULE:
The HTML form field name attributes MUST match:
1) The keys used in the JavaScript data objects
2) The variable names used inside the EmailJS templates

Example:
HTML:     <input name="from_name" />
JS:       from_name
Template: {{from_name}}

If these names do not match exactly (case-sensitive),
EmailJS will send empty values or fail silently.


================================================================================
HOW TO GET EMAILJS KEYS & IDS (FOLLOW IN ORDER)
================================================================================

STEP 1: Create an EmailJS account
→ https://www.emailjs.com/
→ Sign up and log in

STEP 2: Get your PUBLIC KEY
→ Dashboard → Account → Public Key
→ Copy the Public Key
→ Paste it into: emailjs.init("YOUR_PUBLIC_KEY_HERE")

STEP 3: Create an EMAIL SERVICE
→ Dashboard → Email Services
→ Add New Service (Gmail, Outlook, etc.)
→ Save and copy the Service ID
→ Paste it into: 'YOUR_SERVICE_ID_HERE'

STEP 4: Create EMAIL TEMPLATES
→ Dashboard → Email Templates
→ Create:
   - One template for INTERNAL notification
   - One template for AUTO-REPLY
→ Use variables like: {{from_name}}, {{subject}}, {{message}}
→ Copy each Template ID
→ Paste them where indicated below

STEP 5: Make sure TEMPLATE VARIABLES match JS KEYS
→ JS key: from_name  → Template: {{from_name}}
→ JS key: subject    → Template: {{subject}}
→ JS key: message    → Template: {{message}}
================================================================================
*/


// ===============================
// EmailJS Service
// ===============================
// -------------------------------
// CONFIG (fill these in)
// -------------------------------
const EMAILJS_PUBLIC_KEY = "5E_Zbk25C2FE18HBv";
const EMAILJS_SERVICE_ID = "service_w49mmpi"; // your service id

const EMAILJS_TEMPLATE_INTERNAL = "YOUR_INTERNAL_TEMPLATE_ID";
const EMAILJS_TEMPLATE_AUTOREPLY = "YOUR_AUTOREPLY_TEMPLATE_ID";

// Optional: your email for internal notifications if your template uses {{to_email}}
const YOUR_RECEIVER_EMAIL = "your-email@example.com";

// -------------------------------
// INIT
// -------------------------------
document.addEventListener("DOMContentLoaded", () => {
  if (typeof emailjs === "undefined") {
    console.error("EmailJS SDK not loaded. Check script tag order.");
    return;
  }

  emailjs.init(EMAILJS_PUBLIC_KEY);

  const form = document.getElementById("contactForm");
  const statusEl = document.getElementById("formStatus");

  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Get form values (MUST match name="" attributes)
    const from_name = form.querySelector('[name="from_name"]').value.trim();
    const from_email = form.querySelector('[name="from_email"]').value.trim();
    const phone = form.querySelector('[name="phone"]').value.trim();
    const subject = form.querySelector('[name="subject"]').value.trim();
    const message = form.querySelector('[name="message"]').value.trim();

    if (!from_name || !from_email || !subject || !message) {
      if (statusEl) statusEl.textContent = "Please fill in all required fields.";
      return;
    }

    const payloadCommon = {
      from_name,
      from_email,
      phone,
      subject,
      message,
      date: new Date().toLocaleString(),
      message_id: `MSG_${Date.now()}`
    };

    // -------------------------------
    // INTERNAL TEMPLATE PAYLOAD
    // (Sent to you / your inbox)
    // -------------------------------
    const internalPayload = {
      ...payloadCommon,
      to_email: YOUR_RECEIVER_EMAIL // only needed if your EmailJS template uses it
    };

    // -------------------------------
    // AUTOREPLY TEMPLATE PAYLOAD
    // (Sent to the user)
    // IMPORTANT: your EmailJS template "To Email" should be {{to_email}}
    // -------------------------------
    const autoReplyPayload = {
      ...payloadCommon,
      to_name: from_name,
      to_email: from_email,
      from_name: "Nelson Kwesi Xedzro" // displayed in the auto reply
    };

    try {
      if (statusEl) statusEl.textContent = "Sending...";

      // Send internal + auto reply
      const results = await Promise.allSettled([
        emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_INTERNAL, internalPayload),
        emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_AUTOREPLY, autoReplyPayload)
      ]);

      const internalOk = results[0].status === "fulfilled";
      const autoOk = results[1].status === "fulfilled";

      if (internalOk || autoOk) {
        if (statusEl) statusEl.textContent = "Message sent successfully ✅";
        form.reset();
      } else {
        if (statusEl) statusEl.textContent = "Failed to send message. Please try again.";
        console.error("EmailJS failures:", results);
      }
    } catch (err) {
      if (statusEl) statusEl.textContent = "Error sending message. Please try again.";
      console.error("EmailJS error:", err);
    }
  });
});
