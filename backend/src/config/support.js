function formatContacts(number, email) {
  const displayNumber = number?.trim() || "";

  return {
    displayNumber,
    whatsappNumber: displayNumber.replace(/\D/g, ""),
    email: email?.trim() || "",
  };
}

export function getPublicContacts() {
  return formatContacts(
    process.env.PUBLIC_NUMBER || process.env.WhatsApp,
    process.env.PUBLIC_EMAIL || process.env.Email,
  );
}

export function getSupportContacts() {
  return formatContacts(process.env.PRIVATE_NUMBER, process.env.PRIVATE_EMAIL);
}
