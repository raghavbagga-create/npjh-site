var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// source/functions/site-gold-rates.ts
var site_gold_rates_exports = {};
__export(site_gold_rates_exports, {
  handler: () => handler
});
module.exports = __toCommonJS(site_gold_rates_exports);

// source/lib/gold-rates.ts
function normalizeGoldRates(data) {
  const d = data;
  const amount = (value) => {
    const n = Number(value);
    if (!Number.isFinite(n) || n <= 0) throw new Error("Invalid rate");
    return Math.round(n * 1.03);
  };
  const gold24 = amount(d?.rates?.gold_rates?.gold_999), gold22 = amount(d?.rates?.gold_rates?.gold_916);
  let silver = null;
  try {
    silver = amount(d?.rates?.silver_rates?.silver_999);
  } catch {
  }
  let sourceDate = null;
  const date = d?.history?.[0]?.date;
  if (typeof date === "string" && /^\d{2}\/\d{2}\/\d{4}$/.test(date)) {
    const [day, month, year] = date.split("/");
    const iso = `${year}-${month}-${day}`;
    const parsed = /* @__PURE__ */ new Date(iso + "T00:00:00Z");
    if (!Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === iso) sourceDate = iso;
  }
  return { gold24, gold22, silver, sourceDate };
}

// source/functions/site-gold-rates.ts
var { handler: fetchRawRates } = require("./gold-rate.js");
async function handler() {
  try {
    const res = await fetchRawRates();
    if (res.statusCode !== 200) throw new Error("Rates unavailable");
    return { statusCode: 200, headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=300, s-maxage=300" }, body: JSON.stringify(normalizeGoldRates(JSON.parse(res.body))) };
  } catch {
    return { statusCode: 503, headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }, body: JSON.stringify({ error: "Rates temporarily unavailable" }) };
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  handler
});
