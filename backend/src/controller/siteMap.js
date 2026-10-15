import Subscription from "../models/Subscription.js";
import Portfolio from "../models/Portfolio.js";
import { getPublicBaseDomain } from "../config/domains.js";

const siteMapfn = async (_req, res, next) => {
  try {
    const now = new Date();

    const activeOwnerIds = await Subscription.distinct("ownerId", {
      status: "active",
      endsAt: { $gt: now },
    });

    const portfolios = await Portfolio.find({
      ownerId: { $in: activeOwnerIds },
      status: "published",
      username: { $exists: true, $ne: "" },
    })
      .select("username updatedAt")
      .lean();

    const baseDomain = getPublicBaseDomain();

    const urls = portfolios.map((portfolio) => {
      const url = `https://${portfolio.username}.${baseDomain}/`;

      return `
  <url>
    <loc>${url}</loc>
    <lastmod>${new Date(portfolio.updatedAt).toISOString()}</lastmod>
  </url>`;
    });

    urls.unshift(`
      <url>
        <loc>https://${baseDomain}/</loc>
      </url>
    `);

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.join("\n")}
</urlset>`;

    res.set("Content-Type", "application/xml; charset=utf-8");
    res.send(sitemap);
  } catch (error) {
    next(error);
  }
};



export default siteMapfn;