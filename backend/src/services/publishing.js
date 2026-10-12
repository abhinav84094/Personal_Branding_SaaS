import Portfolio from "../models/Portfolio.js";
import Subscription from "../models/Subscription.js";
import { getPublicPortfolioUrl } from "../config/domains.js";

export function isPortfolioReadyToPublish(portfolio) {
  return Boolean(
    portfolio?.profile?.fullName?.trim() &&
    portfolio.profile.contactNumber?.trim() &&
    portfolio.username &&
    ["minimal", "developer", "creative"].includes(portfolio.templateId),
  );
}

export async function publishPortfolioAfterPayment(ownerId) {
  const portfolio = await Portfolio.findOne({ ownerId });
  if (!isPortfolioReadyToPublish(portfolio)) {
    return { portfolio, published: false, publicUrl: "" };
  }

  const activeSubscription = await Subscription.exists({
    ownerId,
    status: "active",
    endsAt: { $gt: new Date() },
  });
  if (!activeSubscription) {
    return { portfolio, published: false, publicUrl: "" };
  }

  if (portfolio.status !== "published") {
    portfolio.status = "published";
    portfolio.publishedAt = new Date();
    await portfolio.save();
  }

  const publicUrl =
    process.env.NODE_ENV !== "production" && process.env.PUBLIC_BASE_URL
      ? `${process.env.PUBLIC_BASE_URL}/p/${portfolio.username}`
      : getPublicPortfolioUrl(portfolio.username);

  return { portfolio, published: true, publicUrl };
}
