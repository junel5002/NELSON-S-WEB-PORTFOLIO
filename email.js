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
class EmailService {
  constructor() {
    this.initialized = false;
    this.init();
  }

  init() {
    if (typeof emailjs === "undefined") {
      console.error("EmailJS is not loaded. Check script inclusion.");
      return;
    }

    try {
      emailjs.init("5E_Zbk25C2FE18HBv"); // your public key
      this.initialized = true;
      console.log("EmailJS initialized");
    } catch (error) {
      console.error("EmailJS init failed:", error);
    }
  }

  generateMessageId() {
    return "MSG_" + Date.now() + "_" + Math.random().toString(36).slice(2, 11);
  }

  // Auto-reply Email (to user)
  async sendAutoReply(formData) {
    if (!this.initialized) throw new Error("EmailJS not initialized");

    const autoReplyData = {
      to_name: formData.from_name,
      to_email: formData.from_email,
      from_name: "Nelson Kwesi Xedzro", // change to your brand/name
      subject: `We received your message: ${formData.subject}`,
      message: formData.message,
      date: formData.date,
      message_id: formData.message_id,
      reply_to: "your-email@example.com" // optional
    };

    return emailjs.send(
      "service_w49mmpi",              // your service id
      "template_1kmek4e",   // put your auto-reply template id here
      autoReplyData
    );
  }

  // Internal Notification (to you)
  async sendInternalNotification(formData) {
    if (!this.initialized) throw new Error("EmailJS not initialized");

    const internalData = {
      from_name: formData.from_name,
      from_email: formData.from_email,
      phone: formData.phone,
      subject: formData.subject,
      message: formData.message,
      date: formData.date,
      message_id: formData.message_id
    };

    return emailjs.send(
      "service_w49mmpi",
      "template_0rl1my6", // put your internal template id here
      internalData
    );
  }

  async handleFormSubmission(formData) {
    const results = await Promise.allSettled([
      this.sendInternalNotification(formData),
      this.sendAutoReply(formData)
    ]);

    return {
      internalSuccess: results[0].status === "fulfilled",
      autoReplySuccess: results[1].status === "fulfilled",
      results
    };
  }
}

const emailService = new EmailService();

document.addEventListener("DOMContentLoaded", () => {
  const contactForm = document.getElementById("contactForm");
  const statusEl = document.getElementById("formStatus");
  if (!contactForm) return;

  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const formData = {
      from_name: contactForm.querySelector('input[name="from_name"]').value.trim(),
      from_email: contactForm.querySelector('input[name="from_email"]').value.trim(),
      phone: contactForm.querySelector('input[name="phone"]').value.trim(),
      subject: contactForm.querySelector('input[name="subject"]').value.trim(),
      message: contactForm.querySelector('textarea[name="message"]').value.trim(),
      date: new Date().toLocaleString(),
      message_id: "MSG_" + Date.now()
    };

    if (!formData.from_name || !formData.from_email || !formData.subject || !formData.message) {
      if (statusEl) statusEl.textContent = "Please fill in all required fields.";
      return;
    }

    try {
      if (statusEl) statusEl.textContent = "Sending...";

      const result = await emailService.handleFormSubmission(formData);

      if (result.internalSuccess || result.autoReplySuccess) {
        if (statusEl) statusEl.textContent = "Message sent successfully ✅";
        contactForm.reset();
      } else {
        if (statusEl) statusEl.textContent = "Failed to send message. Please try again.";
      }
    } catch (err) {
      console.error("Submission failed:", err);
      if (statusEl) statusEl.textContent = "Error sending message. Please try again.";
    }
  });
});

