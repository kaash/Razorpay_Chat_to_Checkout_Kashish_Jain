"use strict";
// GET /api/health → tells the page which real services are switched on. Never returns secrets.
const { send, cors } = require("../lib/http");

module.exports = async (req, res) => {
  if (cors(req, res)) return;
  const mockAi = process.env.MOCK_AI === "1", mockPay = process.env.MOCK_PAY === "1";
  const payKey = process.env.RAZORPAY_KEY_ID || "";
  send(res, 200, {
    ok: true,
    ai: mockAi || !!process.env.ANTHROPIC_API_KEY,
    ai_mode: mockAi ? "mock" : process.env.ANTHROPIC_API_KEY ? "claude" : "off",
    model: mockAi ? "mock (rules)" : (process.env.ANTHROPIC_API_KEY ? (process.env.CLAUDE_MODEL || "claude-sonnet-5-5") : null),
    payments: mockPay || (!!payKey && !!process.env.RAZORPAY_KEY_SECRET && (payKey.startsWith("rzp_test_") || process.env.ALLOW_LIVE_KEYS === "1")),
    payments_mode: mockPay ? "mock" : payKey.startsWith("rzp_test_") ? "test" : payKey ? "live" : "off"
  });
};
