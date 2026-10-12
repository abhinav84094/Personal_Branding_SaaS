import React from "react";
import { Mail, MessageCircle } from "lucide-react";

export default function SupportContacts({ contacts = {} }) {
  const whatsappUrl = contacts.whatsappNumber
    ? `https://wa.me/${contacts.whatsappNumber}?text=${encodeURIComponent("Hi, I need help with my personal brand website.")}`
    : "";

  if (!whatsappUrl && !contacts.email) {
    return (
      <div className="support-contacts support-contacts-pending">
        <small className="eyebrow">NEED A HAND?</small>
        <p>Our support contact options will be available soon.</p>
      </div>
    );
  }

  return (
    <section className="support-contacts">
      <small className="eyebrow">WE’RE HERE TO HELP</small>
      <h3>Questions about your website?</h3>
      <p>Chat with us on WhatsApp or send us an email.</p>
      <div className="support-contact-actions">
        {whatsappUrl && (
          <a href={whatsappUrl} target="_blank" rel="noreferrer">
            <MessageCircle size={17} />
            WhatsApp
            {contacts.displayNumber ? ` · ${contacts.displayNumber}` : ""}
          </a>
        )}
        {contacts.email && (
          <a href={`mailto:${contacts.email}`}>
            <Mail size={17} />
            {contacts.email}
          </a>
        )}
      </div>
    </section>
  );
}
