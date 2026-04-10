"use client";

import { FormEvent, useRef, useState } from "react";
import type { Locale } from "@/lib/content";
import { content, t } from "@/lib/content";

export default function ContactForm({ locale }: { locale: Locale }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [submitText, setSubmitText] = useState(t(content.contact.form.submit, locale));
  const c = content.contact.form;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitText(t(c.sent, locale));
    setTimeout(() => {
      setSubmitText(t(c.submit, locale));
      formRef.current?.reset();
    }, 3000);
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit} ref={formRef} noValidate>
      <div className="form-row">
        <div className="form-field">
          <label>{t(c.name.label, locale)}</label>
          <input type="text" name="name" placeholder={t(c.name.placeholder, locale)} required />
        </div>
        <div className="form-field">
          <label>{t(c.email.label, locale)}</label>
          <input type="email" name="email" placeholder={t(c.email.placeholder, locale)} required />
        </div>
      </div>
      <div className="form-field">
        <label>{t(c.subject.label, locale)}</label>
        <select name="subject">
          {c.subject.options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {t(opt.label, locale)}
            </option>
          ))}
        </select>
      </div>
      <div className="form-field">
        <label>{t(c.message.label, locale)}</label>
        <textarea name="message" placeholder={t(c.message.placeholder, locale)} required />
      </div>
      <div className="form-submit">
        <button type="submit" className="btn-green">
          <span>{submitText}</span>
        </button>
        <span className="form-note">{t(c.note, locale)}</span>
      </div>
    </form>
  );
}
