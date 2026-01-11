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
        if (typeof emailjs === 'undefined') {
            console.error('EmailJS is not loaded. Check script inclusion.');
            return;
        }

        try {
            // STEP 2: Paste your EmailJS PUBLIC KEY here
            emailjs.init("5E_Zbk25C2FE18HBv");
            this.initialized = true;
            console.log('EmailJS initialized');
        } catch (error) {
            console.error('EmailJS init failed:', error);
        }
    }

    generateMessageId() {
        return 'MSG_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }

    // ===============================
    // Auto-reply Email (to user)
    // ===============================
    async sendAutoReply(userData) {
        if (!this.initialized) {
            throw new Error('EmailJS not initialized');
        }

        try {
            // Keys here MUST match EmailJS template variables
            const autoReplyData = {
                to_name: userData.from_name,
                to_email: userData.from_email,
                from_name: 'YOUR NAME OR BRAND',
                subject: We received your message: ${userData.subject},
                message: userData.message,
                date: new Date().toLocaleString(),
                message_id: this.generateMessageId(),
                reply_to: 'YOUR_EMAIL_ADDRESS'
            };

            const response = await emailjs.send(
                'YOUR_SERVICE_ID_HERE',        // STEP 3: Email Service ID
                'YOUR_AUTOREPLY_TEMPLATE_ID', // STEP 4: Auto-reply Template ID
                autoReplyData
            );

            return { success: true, response };
        } catch (error) {
            return { success: false, error: error.text || 'Unknown error' };
        }
    }

    // ===============================
    // Internal Notification (to you)
    // ===============================
    async sendInternalNotification(formData) {
        if (!this.initialized) {
            throw new Error('EmailJS not initialized');
        }

        try {
            // Keys here MUST match EmailJS template variables
            const internalData = {
                from_name: formData.from_name,
                from_email: formData.from_email,
                subject: formData.subject,
                message: formData.message,
                to_name: 'YOUR NAME',
                reply_to: formData.from_email,
                date: formData.date,
                message_id: this.generateMessageId()
            };

            const response = await emailjs.send(
                'YOUR_SERVICE_ID_HERE',        // STEP 3: Email Service ID
                'YOUR_INTERNAL_TEMPLATE_ID',  // STEP 4: Internal Template ID
                internalData
            );

            return { success: true, response };
        } catch (error) {
            return { success: false, error: error.text || 'Unknown error' };
        }
    }

    // ===============================
    // Handle Form Submission
    // ===============================
    async handleFormSubmission(formData) {
        const [internalResult, autoReplyResult] = await Promise.allSettled([
            this.sendInternalNotification(formData),
            this.sendAutoReply(formData)
        ]);

        return {
            internalSuccess: internalResult.status === 'fulfilled',
            autoReplySuccess: autoReplyResult.status === 'fulfilled'
        };
    }
}


// ===============================
// Global Instance
// ===============================
const emailService = new EmailService();


// ===============================
// Form Handling
// ===============================
document.addEventListener('DOMContentLoaded', function () {
    const contactForm = document.getElementById('contactForm');
    if (!contactForm) return;

    contactForm.addEventListener('submit', async function (e) {
        e.preventDefault();

        // Input name attributes MUST match these keys
        const formData = {
            from_name: document.querySelector('input[name="from_name"]')?.value.trim(),
            from_email: document.querySelector('input[name="reply_to"]')?.value.trim(),
            subject: document.querySelector('input[name="title"]')?.value.trim(),
            message: document.querySelector('textarea[name="message"]')?.value.trim(),
            date: new Date().toLocaleString()
        };

        if (!formData.from_name || !formData.from_email || !formData.subject || !formData.message) {
            console.warn('Missing required fields');
            return;
        }

        try {
            await emailService.handleFormSubmission(formData);
            contactForm.reset();
        } catch (error) {
            console.error('Submission failed:', error);
        }
    });
});
