"use strict";
// Server-side pricing. The browser sends what the seller approved; the server recomputes every rupee
// from the price list in integer paise and refuses anything that doesn't add up.
const { DATA } = require("./core");

const PROD = id => DATA.catalogue.find(p => p.id === id);
const MAX_TOTAL_PAISE = +(process.env.MAX_LINK_PAISE || 5000000); // ₹50,000 cap for a demo

function priceOrder(o) {
  const err = m => Object.assign(new Error(m), { status: 400 });
  if (!o || typeof o !== "object") throw err("Missing order");
  const L = o.line || {};
  const qty = L.qty;
  if (!Number.isInteger(qty) || qty < 1 || qty > 50) throw err("Quantity must be 1 to 50");
  let name, unit, size = L.size || null, priceNote = "price list";
  if (L.product_id) {
    const p = PROD(L.product_id); if (!p) throw err("Unknown product");
    name = p.name;
    if (p.sizes[0] === "Free") size = "Free";
    else if (!p.sizes.includes(size)) throw err("Size missing or not offered");
    unit = p.paise;
    if (L.unit_paise != null && L.unit_paise !== p.paise) {
      if (!L.price_changed_by_seller) throw err("Unit price differs from the price list");
      unit = L.unit_paise; priceNote = "changed by seller";
    }
  } else {
    name = String(L.name || "").trim().slice(0, 60); if (!name) throw err("Item name missing");
    unit = L.unit_paise; priceNote = "typed by seller";
  }
  if (!Number.isInteger(unit) || unit < 100 || unit > MAX_TOTAL_PAISE) throw err("Unit price out of range");
  const delivery = o.delivery_paise == null ? null : o.delivery_paise;
  if (!Number.isInteger(delivery) || delivery < 0 || delivery > 100000) throw err("Delivery out of range");
  const discount = o.discount_paise || 0;
  if (!Number.isInteger(discount) || discount < 0) throw err("Discount out of range");
  const subtotal = unit * qty;
  if (discount > subtotal + delivery) throw err("Discount larger than the order");
  const total = subtotal + delivery - discount;
  if (total < 100) throw err("Total must be at least ₹1");
  if (total > MAX_TOTAL_PAISE) throw err("Total above the demo limit");
  if (o.expected_total_paise != null && o.expected_total_paise !== total) throw err("Total doesn't match the approved card");
  const item = `${qty} × ${name}${size && size !== "Free" ? ` (${size})` : ""}`;
  return { name, size, qty, unit, subtotal, delivery, discount, total, item, priceNote };
}

module.exports = { priceOrder };
