import api from "../api.js";
let razorpayScript;
export async function loadRazorpay() {
  if (window.Razorpay) return;
  if (!razorpayScript)
    razorpayScript = new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = resolve;
      script.onerror = () => {
        razorpayScript = null;
        reject(new Error("Could not load secure checkout. Please try again."));
      };
      document.body.append(script);
    });
  await razorpayScript;
}
export async function checkoutTemplate(templateId) {
  const { data: order } = await api.post("/billing/templates/order", {
    templateId,
  });
  if (order.mode === "simulation") {
    const { data } = await api.post("/billing/templates/simulate-success", {
      orderId: order.orderId,
    });
    if (!data.unlocked)
      throw new Error("The template could not be unlocked. Please refresh.");
    return data;
  }
  await loadRazorpay();
  return new Promise((resolve, reject) => {
    const checkout = new window.Razorpay({
      key: order.keyId,
      amount: Math.round(order.template.amount * 100),
      currency: order.template.currency,
      order_id: order.orderId,
      name: "Prakash SaaS",
      description: order.template.name + " · One-time unlock",
      modal: {
        ondismiss: () =>
          reject(
            new Error(
              "Checkout closed. Your template selection has not changed.",
            ),
          ),
      },
      handler: async (payment) => {
        try {
          const { data } = await api.post("/billing/templates/verify", payment);
          if (!data.unlocked)
            throw new Error(
              "Payment confirmation is pending. Please refresh shortly.",
            );
          resolve(data);
        } catch (e) {
          reject(e);
        }
      },
    });
    checkout.open();
  });
}
