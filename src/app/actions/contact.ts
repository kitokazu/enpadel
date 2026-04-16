"use server";

import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function sendContactEmail(formData: FormData) {
  const name = formData.get("name")?.toString().trim() ?? "";
  const email = formData.get("email")?.toString().trim() ?? "";
  const subject = formData.get("subject")?.toString().trim() ?? "";
  const message = formData.get("message")?.toString().trim() ?? "";

  if (!name || !email || !emailRegex.test(email) || !message) {
    return { success: false, error: "Invalid form data" };
  }

  try {
    await resend.emails.send({
      from: "EnPadel Contact <contact@enpadel.com>",
      to: "info@enpadel.com",
      replyTo: email,
      subject: subject || `Contact form message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\nSubject: ${subject}\n\nMessage:\n${message}`,
    });

    return { success: true };
  } catch {
    return { success: false, error: "Failed to send email" };
  }
}
