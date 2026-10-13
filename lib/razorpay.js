"use strict";
// Razorpay Payment Links, TEST MODE ONLY by default. No real money moves with rzp_test_ keys.
// Docs to check when wiring: https://razorpay.com/docs/api/payments/payment-links/
const API = "https://api.razorpay.com/v1";

function auth() {
  const id = process.env.RAZORPAY_KEY_ID, secret = process.env.RAZORPAY_KEY_SECRET;
  if (!id || !secret) throw Object.assign(new Error("Payments are not configured"), { status: 503 });
  if (!id.startsWith("rzp_test_") && process.env.ALLOW_LIVE_KEYS !== "1") throw Object.assign(new Error("Only Razorpay test keys are allowed in this demo"), { status: 503 });
  return "Basic " + Buffer.from(id + ":" + secret).toString("base64");
}

async function call(method, path, body) {
  const r = await fetch(API + path, { method, headers: { Authorization: auth(), "Content-Type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
  const j = await r.json().catch(() => ({}));
  if (!r.ok) throw Object.assign(new Error((j.error && j.error.description) || `Razorpay error (${r.status})`), { status: 502 });
  return j;
}

// Payment Link statuses: created, partially_paid, expired, cancelled, paid
const mapStatus = s => s === "paid" ? "paid" : s === "expired" ? "expired" : s === "cancelled" ? "cancelled" : "unpaid";

async function createLink({ priced, buyer, channel, referenceId, expiryHrs }) {
  const expire_by = Math.floor(Date.now() / 1000) + Math.max(1, Math.min(72, expiryHrs || 24)) * 3600;
  const body = {
    amount: priced.total, currency: "INR", accept_partial: false, reference_id: referenceId, expire_by,
    description: `${priced.item}${priced.delivery ? ` + delivery ₹${priced.delivery / 100}` : ""}`.slice(0, 200),
    customer: buyer ? { name: String(buyer).slice(0, 40) } : undefined,
    notify: { sms: false, email: false }, reminder_enable: false,
    notes: { source: "chat_to_checkout_demo", channel: channel || "", item: priced.item.slice(0, 250), unit_paise: String(priced.unit), price_note: priced.priceNote, delivery_paise: String(priced.delivery), discount_paise: String(priced.discount) }
  };
  const j = await call("POST", "/payment_links", body);
  return { id: j.id, short_url: j.short_url, reference_id: j.reference_id || referenceId, amount: j.amount, status: mapStatus(j.status) };
}

async function getLink(id) { const j = await call("GET", "/payment_links/" + encodeURIComponent(id)); return { id: j.id, status: mapStatus(j.status), amount_paid: j.amount_paid || 0, short_url: j.short_url }; }
async function cancelLink(id) { const j = await call("POST", "/payment_links/" + encodeURIComponent(id) + "/cancel"); return { id: j.id, status: mapStatus(j.status) }; }

module.exports = { createLink, getLink, cancelLink, mapStatus };
