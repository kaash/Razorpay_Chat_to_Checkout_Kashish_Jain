"use strict";
// Best-effort, in-memory rate limit. Serverless instances can restart, so this is a speed bump,
// not a guarantee. The real cost guard is the monthly spend limit you set in the Anthropic console.
const buckets = new Map();

function limit(key, perMinute, perDay) {
  const now = Date.now();
  let b = buckets.get(key);
  if (!b || now - b.dayStart > 86400000) b = { dayStart: now, day: 0, min: [] };
  b.min = b.min.filter(t => now - t < 60000);
  if (b.min.length >= perMinute) { buckets.set(key, b); return { ok: false, why: "Too many requests this minute. Try again shortly." }; }
  if (b.day >= perDay) { buckets.set(key, b); return { ok: false, why: "Daily limit reached for this demo." }; }
  b.min.push(now); b.day++; buckets.set(key, b);
  if (buckets.size > 5000) buckets.clear();
  return { ok: true };
}

module.exports = { limit };
