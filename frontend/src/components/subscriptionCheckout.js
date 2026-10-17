import api from "../api.js";
import { loadRazorpay } from "./templateCheckout.js";
export async function checkoutSubscription(planId, renew = false) {
  const { data: order } = await api.post("/billing/order", { planId, renew });
  if (order.mode === "simulation") {
    const { data } = await api.post("/billing/simulate-success", {
      orderId: order.orderId,
    });
    return { ...data, simulated: true };
  }
  await loadRazorpay();
  return new Promise((resolve, reject) => {
    const checkout = new window.Razorpay({
      key: order.keyId,
      amount: Math.round(order.plan.amount * 100),
      currency: order.plan.currency,
      order_id: order.orderId,
      name: "Prakash SaaS",
      description:
        (renew ? "Validity renewal · " : "Publishing plan · ") +
        order.plan.name,
      modal: {
        ondismiss: () =>
          reject(
            new Error(
              "Checkout closed. Your current validity has not changed.",
            ),
          ),
      },
      handler: async (payment) => {
        try {
          const { data } = await api.post("/billing/verify", payment);
          resolve(data);
        } catch (e) {
          reject(e);
        }
      },
    });
    checkout.open();
  });
}
