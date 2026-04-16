"use client";

import { FormEvent, useRef, useState } from "react";
import type { Locale } from "@/lib/content";
import { content, t } from "@/lib/content";
import { sendContactEmail } from "@/app/actions/contact";
import CustomSelect from "./CustomSelect";

type FormState = "idle" | "submitting" | "success" | "error";
type FieldErrors = { name?: string; email?: string; message?: string };

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const errorMessages = {
  name: { en: "Name is required", ja: "お名前を入力してください" },
  email: { en: "Valid email is required", ja: "有効なメールアドレスを入力してください" },
  message: { en: "Message is required", ja: "メッセージを入力してください" },
};

export default function ContactForm({ locale }: { locale: Locale }) {
  const formRef = useRef<HTMLFormElement>(null);
  const [formState, setFormState] = useState<FormState>("idle");
  const [errors, setErrors] = useState<FieldErrors>({});
  const c = content.contact.form;

  function validate(): FieldErrors {
    const form = formRef.current;
    if (!form) return {};
    const data = new FormData(form);
    const errs: FieldErrors = {};
    if (!data.get("name")?.toString().trim()) errs.name = t(errorMessages.name, locale);
    const email = data.get("email")?.toString().trim() || "";
    if (!email || !emailRegex.test(email)) errs.email = t(errorMessages.email, locale);
    if (!data.get("message")?.toString().trim()) errs.message = t(errorMessages.message, locale);
    return errs;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setFormState("submitting");
    const data = new FormData(formRef.current!);
    const result = await sendContactEmail(data);
    if (result.success) {
      setFormState("success");
      setTimeout(() => {
        setFormState("idle");
        setErrors({});
        formRef.current?.reset();
      }, 3000);
    } else {
      setFormState("error");
      setTimeout(() => setFormState("idle"), 3000);
    }
  }

  const buttonLabel =
    formState === "submitting"
      ? ""
      : formState === "success"
        ? t(c.sent, locale)
        : t(c.submit, locale);

  return (
    <form className="contact-form" onSubmit={handleSubmit} ref={formRef} noValidate>
      <div className="form-row">
        <div className={`form-field${errors.name ? " has-error" : ""}`}>
          <label>{t(c.name.label, locale)}</label>
          <input
            type="text"
            name="name"
            placeholder={t(c.name.placeholder, locale)}
            required
            onChange={() => errors.name && setErrors((e) => ({ ...e, name: undefined }))}
          />
          {errors.name && <span className="form-error">{errors.name}</span>}
        </div>
        <div className={`form-field${errors.email ? " has-error" : ""}`}>
          <label>{t(c.email.label, locale)}</label>
          <input
            type="email"
            name="email"
            placeholder={t(c.email.placeholder, locale)}
            required
            onChange={() => errors.email && setErrors((e) => ({ ...e, email: undefined }))}
          />
          {errors.email && <span className="form-error">{errors.email}</span>}
        </div>
      </div>
      <div className="form-field">
        <label>{t(c.subject.label, locale)}</label>
        <CustomSelect
          name="subject"
          options={c.subject.options.map((opt) => ({
            value: opt.value,
            label: t(opt.label, locale),
          }))}
        />
      </div>
      <div className={`form-field${errors.message ? " has-error" : ""}`}>
        <label>{t(c.message.label, locale)}</label>
        <textarea
          name="message"
          placeholder={t(c.message.placeholder, locale)}
          required
          onChange={() => errors.message && setErrors((e) => ({ ...e, message: undefined }))}
        />
        {errors.message && <span className="form-error">{errors.message}</span>}
      </div>
      <div className="form-submit">
        <button
          type="submit"
          className="btn-green"
          disabled={formState === "submitting"}
        >
          <span>
            {formState === "submitting" && <span className="form-spinner" />}
            {buttonLabel}
          </span>
        </button>
        <span className="form-note">{t(c.note, locale)}</span>
      </div>
    </form>
  );
}
