/**
 * Audits the rendered typography of a running build, over CDP.
 *
 * Everything here is a claim that cannot be checked by reading the CSS:
 * which font file a glyph ACTUALLY resolved to, what the computed size is
 * after the clamp(), whether anything is synthesising an italic. Several real
 * bugs on this site looked correct in the stylesheet and wrong in the browser
 * — most notably Japanese silently rendering in Hiragino while the CSS said
 * Shippori Mincho, because a generic `serif` sat earlier in the stack.
 *
 * Usage:
 *   npm run build && npx next start -p 3111 &
 *   "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
 *     --headless --disable-gpu --remote-debugging-port=9222 \
 *     --user-data-dir=/tmp/verify-chrome about:blank &
 *   node scripts/verify-type.mjs http://localhost:3111/ja 1440
 *
 * Exits non-zero if any hard invariant fails.
 */
const [, , url = "http://localhost:3111/en", width = "1440"] = process.argv;
const W = Number(width);

/** Roles that must resolve to the display face, and to the text face. */
const DISPLAY = [".nav-logo", ".svh-title", ".fc h3", ".ev-meta-item p", ".contact-email", ".f-logo"];
const TEXT = [".nav-center a", ".svh-sub", ".who-body-en p", ".section-label", ".contact-intro", ".btn-green"];

const list = await fetch("http://127.0.0.1:9222/json/list").then((r) => r.json());
const target = list.find((t) => t.type === "page");
if (!target) { console.error("no page target — is headless Chrome up on :9222?"); process.exit(2); }

const ws = new WebSocket(target.webSocketDebuggerUrl);
let id = 0;
const pending = new Map();
await new Promise((res) => (ws.onopen = res));
ws.onmessage = (m) => {
  const msg = JSON.parse(m.data);
  if (msg.id && pending.has(msg.id)) { pending.get(msg.id)(msg); pending.delete(msg.id); }
};
const send = (method, params = {}) =>
  new Promise((res) => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
const evalJs = async (e) => {
  const r = await send("Runtime.evaluate", { expression: e, returnByValue: true, awaitPromise: true });
  if (r.result?.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails).slice(0, 400));
  return r.result?.result?.value;
};

for (const d of ["Page", "Runtime", "DOM", "CSS"]) await send(`${d}.enable`);
await send("Emulation.setDeviceMetricsOverride", { width: W, height: 900, deviceScaleFactor: 1, mobile: W < 700 });
await send("Page.navigate", { url });
await new Promise((r) => setTimeout(r, 7000));
// Reveals are IntersectionObserver-driven, so below-fold sections sit at
// opacity 0 and report nothing useful until they are forced visible.
await evalJs(`document.querySelectorAll('.reveal,.reveal-left,.reveal-scale').forEach(e=>e.classList.add('visible'));
  (async()=>{for(let y=0;y<document.body.scrollHeight;y+=600){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,40));}window.scrollTo(0,0);return 1})()`);
await evalJs(`document.fonts.ready`);
await new Promise((r) => setTimeout(r, 2000));

const doc = await send("DOM.getDocument", { depth: -1 });
const faceOf = async (sel) => {
  const q = await send("DOM.querySelector", { nodeId: doc.result.root.nodeId, selector: sel });
  if (!q.result?.nodeId) return null;
  const f = await send("CSS.getPlatformFontsForNode", { nodeId: q.result.nodeId });
  return (f.result?.fonts || []).map((x) => x.familyName).join(" + ");
};

const stats = await evalJs(`(() => {
  const hasText = el => [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
  const els = [...document.querySelectorAll('body *')].filter(el => {
    if (['SCRIPT','STYLE','NOSCRIPT'].includes(el.tagName)) return false;
    const cs = getComputedStyle(el);
    return cs.display !== 'none' && cs.visibility !== 'hidden' && hasText(el);
  });
  const sizes = {}, weights = {}, italics = [];
  for (const el of els) {
    const cs = getComputedStyle(el);
    sizes[cs.fontSize] = (sizes[cs.fontSize] || 0) + 1;
    weights[cs.fontWeight] = (weights[cs.fontWeight] || 0) + 1;
    if (cs.fontStyle !== 'normal') italics.push(String(el.className) || el.tagName);
  }
  return {
    lang: document.documentElement.lang,
    overflow: document.documentElement.scrollWidth > window.innerWidth,
    sizes: Object.keys(sizes).sort((a,b)=>parseFloat(a)-parseFloat(b)).map(k => k + ' x' + sizes[k]),
    weights: Object.keys(weights).sort(),
    italics,
    errored: [...document.fonts].filter(f => f.status === 'error').map(f => f.family),
  };
})()`);

console.log(`\n${url}  @${W}px  lang=${stats.lang}`);
console.log("  display roles:");
for (const s of DISPLAY) console.log(`    ${s.padEnd(20)} ${await faceOf(s)}`);
console.log("  text roles:");
for (const s of TEXT) console.log(`    ${s.padEnd(20)} ${await faceOf(s)}`);
console.log("  sizes:  ", stats.sizes.join(", "));
console.log("  weights:", stats.weights.join(", "));
console.log("  italics:", stats.italics.length, stats.italics.slice(0, 8).join(", "));
console.log("  errored font faces:", stats.errored.length ? stats.errored.join(", ") : "none");
console.log("  horizontal overflow:", stats.overflow ? "YES" : "no");

const fail = [];
if (stats.lang === "ja" && stats.italics.length) fail.push("Japanese is being set in italic (no JP face has one — the browser is skewing glyphs)");
if (stats.weights.some((w) => !["400", "500"].includes(w))) fail.push(`unexpected weight(s): ${stats.weights.join(", ")} — the site uses 400 and 500 only`);
if (stats.errored.length) fail.push(`font faces failed to load: ${stats.errored.join(", ")}`);
if (stats.overflow) fail.push("page scrolls horizontally");
ws.close();

if (fail.length) { console.error("\nFAIL\n  - " + fail.join("\n  - ")); process.exit(1); }
console.log("\nOK");
