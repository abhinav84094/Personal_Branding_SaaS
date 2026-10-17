import { formatTemplatePrice } from "./templatePrice.js";
import React from "react";
import { LockKeyhole, Check, Play } from "lucide-react";
import { AnimatedTemplatePreview } from "../templates/Animated/AnimatedTemplates.jsx";
export default function PremiumTemplateCard({
  template,
  access,
  selected,
  busy,
  onPreview,
  onBuy,
  onSelect,
}) {
  const unlocked = access?.unlocked === true;
  const price = formatTemplatePrice(access);
  return (
    <article
      className={
        "template-tile premium-template " +
        template.id +
        (selected ? " chosen" : "")
      }
    >
      <AnimatedTemplatePreview template={template} />
      <div className="premium-template-meta">
        <span>
          {unlocked ? (
            <>
              <Check size={14} />
              Owned
            </>
          ) : (
            <>
              <LockKeyhole size={14} />
              {price
                ? price + " · one-time"
                : access
                  ? "Price unavailable"
                  : "Loading price…"}
            </>
          )}
        </span>
        {selected && <strong>✓ Selected</strong>}
      </div>
      <div className="premium-template-actions">
        <button type="button" className="btn light" onClick={onPreview}>
          <Play size={14} />
          Free preview
        </button>
        {unlocked ? (
          <button
            type="button"
            className="btn dark"
            disabled={busy}
            aria-pressed={selected}
            onClick={onSelect}
          >
            {selected ? "Selected" : "Use template"}
          </button>
        ) : (
          <button
            type="button"
            className="btn dark"
            disabled={busy || !access || !price}
            onClick={onBuy}
          >
            {busy
              ? "Please wait…"
              : !access
                ? "Loading access…"
                : price
                  ? "Unlock for " + price
                  : "Purchases unavailable"}
          </button>
        )}
      </div>
    </article>
  );
}
