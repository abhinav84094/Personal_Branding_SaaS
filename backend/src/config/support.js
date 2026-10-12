export function getSupportContacts() {
  const displayNumber = process.env.PRIVATE_NUMBER?.trim() || "";

  return {
    displayNumber,
    whatsappNumber: displayNumber.replace(/\D/g, ""),
    email: process.env.PRIVATE_EMAIL?.trim() || "",
  };
}
