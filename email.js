// EmailJS Service
class EmailService {
  constructor() {
    this.initialized = false;
    this.init();
  }

  init() {
    if (typeof emailjs === "undefined") {
      console.error("EmailJS is not loaded. Please check the script inclusion.");
      return;
    }

    try {
      // ✅ Your EmailJS PUBLIC KEY
      emailjs.init("5E_Zbk25C2FE18HBv");
      this.initialized = true;
      console.log("EmailJS initialized successfully");
    } catch (error) {
      console.error("Failed to initialize EmailJS:", error);
    }
  }

  generateMessageId() {
    return "MSG_" + Date.now() + "_" + Math.random().toString(36).substr(2, 9);
  }

  // ✅ Auto-reply to user
  async sendAutoReply(userData) {
    if (!this.initialized) throw new Error("EmailJS not initialized");

    try {
      const autoReplyData = {
        to_name: userData.from_name,
        to_email: userData.from_email,

        from_name: "Cephas Osei-Bonsu",

        // ✅ FIXED string interpolation
        subject: `We've received your message: ${userData.subject}`,

        user_subject: userData.subject,
        message: userData.message,
        date: new Date().toLocaleString(),
        message_id: this.generateMessageId(),
        reply_to: "cephasbonsuosei003@gmail.com"
      };

      console.log("Sending auto-reply with data:", autoReplyData);

      const response = await emailjs.send(
        "service_w49mmpi",      // ✅ your Service ID
        "template_1kmek4e",     // ✅ your Auto-reply template ID
        autoReplyData
      );

      console.log("Auto-reply sent successfully:", response);
      return { success: true, response };
    } catch (error) {
      console.error("Auto-reply failed:", error);
      return { success: false, error: error?.text || error?.message || "Unknown error" };
    }
  }

  // ✅ Internal notification (to you)
  async sendInternalNotification(formData) {
    if (!this.initialized) throw new Error("EmailJS not initialized");

    try {
      const internalData = {
        from_name: formData.from_name,
        from_email: formData.from_email,
        subject: formData.subject,
        message: formData.message,
        to_name: "Cephas Osei-Bonsu",
        reply_to: formData.from_email,
        date: formData.date,
        message_id: formData.message_id || this.generateMessageId()
      };

      console.log("Sending internal notification with data:", internalData);

      const response = await emailjs.send(
        "service_w49mmpi",      // ✅ your Service ID
        "template_0rl1my6",     // ✅ your Internal template ID
        internalData
      );

      console.log("Internal notification sent successfully:", response);
      return { success: true, response };
    } catch (error) {
      console.error("Internal notification failed:", error);
      return { success: false, error: error?.text || error?.message || "Unknown error" };
    }
  }

  // Main handler
  async handleFormSubmission(formData) {
    const [internalResult, autoReplyResult] = await Promise.allSettled([
      this.sendInternalNotification(formData),
      this.sendAutoReply(formData)
    ]);

    const internalSuccess =
      internalResult.status === "fulfilled" && internalResult.value.success;

    const autoReplySuccess =
      autoReplyResult.status === "fulfilled" && autoReplyResult.value.success;

    return {
      internalSuccess,
      autoReplySuccess,
      internalError:
        internalResult.status === "rejected"
          ? internalResult.reason
          : internalResult.value?.error || null,
      autoReplyError:
        autoReplyResult.status === "rejected"
          ? autoReplyResult.reason
          : autoReplyResult.value?.error || null
    };
  }
}

// Create global instance
const emailService = new EmailService();

// Form Handling
document.addEventListener("DOMContentLoaded", function () {
  const contactForm = document.getElementById("contactForm");
  if (!contactForm) {
    console.error("Contact form not found!");
    return;
  }

  const statusMessage = document.getElementById("statusMessage");
  const submitBtn = contactForm.querySelector(".submit-btn");

  const showMessage = (message, isSuccess = true) => {
    if (!statusMessage) return;

    statusMessage.textContent = message;
    statusMessage.style.display = "block";
    statusMessage.style.padding = "12px";
    statusMessage.style.borderRadius = "8px";
    statusMessage.style.marginTop = "15px";
    statusMessage.style.background = isSuccess
      ? "rgba(16, 183, 255, 0.1)"
      : "rgba(255, 71, 87, 0.1)";
    statusMessage.style.border = isSuccess ? "1px solid #10b7ff" : "1px solid #ff4757";
    statusMessage.style.color = isSuccess ? "#10b7ff" : "#ff4757";
    statusMessage.style.textAlign = "center";
    statusMessage.style.fontWeight = "600";

    setTimeout(() => {
      if (statusMessage) statusMessage.style.display = "none";
    }, 5000);
  };

  const setLoading = (isLoading) => {
    if (!submitBtn) return;

    if (isLoading) {
      submitBtn.disabled = true;
      submitBtn.style.opacity = "0.7";
      submitBtn.style.cursor = "not-allowed";
      submitBtn.textContent = "Sending...";
    } else {
      submitBtn.disabled = false;
      submitBtn.style.opacity = "1";
      submitBtn.style.cursor = "pointer";
      submitBtn.textContent = "Send Message";
    }
  };

  contactForm.addEventListener("submit", async function (e) {
    e.preventDefault();

    const honeypot = document.getElementById("website")?.value.trim();
    if (honeypot) {
      console.warn("Submission blocked by honeypot field.");
      return;
    }

    // ⚠️ These MUST match your HTML input names exactly
    const formData = {
      from_name: document.querySelector('input[name="name"]')?.value.trim() || "",
      from_email: document.querySelector('input[name="reply_to"]')?.value.trim() || "",
      subject: document.querySelector('input[name="title"]')?.value.trim() || "",
      message: document.querySelector('textarea[name="message"]')?.value.trim() || "",
      date: new Date().toLocaleString(),
      message_id: `MSG_${Date.now()}`
    };

    console.log("Form data to be submitted:", formData);

    if (!formData.from_name || !formData.from_email || !formData.subject || !formData.message) {
      showMessage("Please fill in all fields.", false);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.from_email)) {
      showMessage("Please enter a valid email address.", false);
      return;
    }

    setLoading(true);

    try {
      const result = await emailService.handleFormSubmission(formData);

      if (result.internalSuccess && result.autoReplySuccess) {
        showMessage(
          "🎉 Thank you! Your message has been sent successfully. You will receive a confirmation email shortly!",
          true
        );
        contactForm.reset();
      } else {
        console.warn("Internal success:", result.internalSuccess, "Auto success:", result.autoReplySuccess);
        console.warn("Internal error:", result.internalError);
        console.warn("Auto error:", result.autoReplyError);

        showMessage("❌ Sorry, there was an error sending your message. Please try again later.", false);
      }
