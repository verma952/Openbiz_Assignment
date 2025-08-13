// scrape.js
// Run:  node scrape.js
// Output: ./data/formSchema.json + ./data/step1.json + ./data/step2.json

const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");

(async () => {
  const OUT_DIR = path.join(__dirname, "data");
  if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR);

  const browser = await puppeteer.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });
  const page = await browser.newPage();

  // Be a bit more “browser-like”
  await page.setUserAgent(
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 " +
    "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
  );
  await page.setViewport({ width: 1366, height: 900 });

  const URL = "https://udyamregistration.gov.in/UdyamRegistration.aspx";
  console.log("🔄 Opening:", URL);
  await page.goto(URL, { waitUntil: "networkidle2", timeout: 120000 });

  // Make sure DOM is fully there
  await page.waitForSelector("body");

  // Core extractor (runs in the page)
  const allFields = await page.evaluate(() => {
    // ——— helpers ———
    const getLabelFor = (el) => {
      // 1) use "labels" HTML API
      if (el.labels && el.labels.length) {
        return Array.from(el.labels).map(l => l.innerText.trim()).join(" / ");
      }
      // 2) <label for="id">
      if (el.id) {
        const viaFor = document.querySelector(`label[for="${el.id}"]`);
        if (viaFor) return viaFor.innerText.trim();
      }
      // 3) aria-label
      if (el.getAttribute("aria-label")) return el.getAttribute("aria-label").trim();
      // 4) nearest preceding label in the same container
      const container = el.closest("div, .form-group, .row, .col, fieldset") || el.parentElement;
      if (container) {
        const lab = container.querySelector("label");
        if (lab) return lab.innerText.trim();
      }
      // 5) legend (for fieldsets)
      const fs = el.closest("fieldset");
      if (fs) {
        const lg = fs.querySelector("legend");
        if (lg) return lg.innerText.trim();
      }
      return "";
    };

    const getSectionTitle = (el) => {
      // Walk up and find a nearby heading-ish element
      let cur = el;
      const isHeading = (node) =>
        ["H1","H2","H3","H4","H5","H6"].includes(node.tagName) ||
        node.getAttribute?.("role") === "heading" ||
        node.className?.toLowerCase?.().includes("title") ||
        node.className?.toLowerCase?.().includes("header");

      while (cur && cur !== document.body) {
        // direct heading inside this ancestor
        const head = cur.querySelector?.("h1,h2,h3,h4,h5,h6,[role='heading'],.panel-title,.card-title,.title,.header");
        if (head && head.innerText.trim().length > 0) {
          return head.innerText.trim();
        }
        // or the ancestor itself is a heading-like
        if (cur.tagName && isHeading(cur) && cur.innerText.trim()) {
          return cur.innerText.trim();
        }
        cur = cur.parentElement;
      }
      return "";
    };

    const getVisibility = (el) => {
      const cs = window.getComputedStyle(el);
      const hiddenByType = (el.tagName.toLowerCase() === "input" && (el.type === "hidden"));
      const hidden = hiddenByType || cs.display === "none" || cs.visibility === "hidden" || cs.opacity === "0";
      return { hidden, display: cs.display, visibility: cs.visibility, opacity: cs.opacity };
    };

    const getOptions = (el) => {
      if (el.tagName.toLowerCase() !== "select") return null;
      return Array.from(el.options || []).map(o => ({
        value: o.value,
        text: o.text.trim(),
        selected: o.selected
      }));
    };

    const inferStep = (el, label, name) => {
      const txt = `${label} ${name} ${getSectionTitle(el)}`.toLowerCase();
      const k1 = ["aadhaar", "aadhar", "otp", "mobile", "name as per aadhaar"];
      const k2 = ["pan", "p.a.n", "income tax", "gst", "enterprise", "udyam"];
      const hit1 = k1.some(k => txt.includes(k));
      const hit2 = k2.some(k => txt.includes(k));
      if (hit1 && !hit2) return 1;
      if (hit2 && !hit1) return 2;
      // fallback: if currently visible, likely step1; if hidden, likely step2
      const vis = getVisibility(el);
      if (!vis.hidden) return 1;
      return 2;
    };

    const serialize = (el) => {
      const tag = el.tagName.toLowerCase();
      const type = tag === "select" ? "select" : (el.type || tag);
      const label = getLabelFor(el);
      const name = el.getAttribute("name") || el.getAttribute("id") || "";
      const placeholder = el.getAttribute("placeholder") || "";
      const required = el.required || el.getAttribute("aria-required") === "true";
      const pattern = el.getAttribute("pattern") || null;
      const minLength = el.getAttribute("minlength") ? Number(el.getAttribute("minlength")) : null;
      const maxLength = el.getAttribute("maxlength") ? Number(el.getAttribute("maxlength")) : null;
      const opts = getOptions(el);
      const section = getSectionTitle(el);
      const vis = getVisibility(el);
      const step = inferStep(el, label, name);

      return {
        tag,
        type,
        name,
        id: el.id || null,
        label,
        placeholder,
        required,
        pattern,
        minLength,
        maxLength,
        dataset: {...el.dataset},
        attributes: {
          autocomplete: el.getAttribute("autocomplete"),
          inputmode: el.getAttribute("inputmode"),
        },
        options: opts,
        section,
        visibility: vis,
        step
      };
    };

    const nodes = Array.from(document.querySelectorAll("input, select, textarea"));
    // Filter out obvious non-form inputs (buttons, submit, reset)
    const fields = nodes
      .filter(el => {
        const t = (el.type || "").toLowerCase();
        return !["submit","button","reset","image","file"].includes(t);
      })
      .map(serialize);

    return fields;
  });

  // Split by step for convenience
  const step1 = allFields.filter(f => f.step === 1);
  const step2 = allFields.filter(f => f.step === 2);

  // Persist
  const finalSchema = {
    scrapedAt: new Date().toISOString(),
    source: URL,
    counts: { total: allFields.length, step1: step1.length, step2: step2.length },
    regexLibrary: {
      aadhaar: "^\\d{12}$",
      pan: "^[A-Z]{5}[0-9]{4}[A-Z]{1}$",
      // You can add more when you confirm patterns from the page text/help
    },
    step1,
    step2
  };

  fs.writeFileSync(path.join(OUT_DIR, "formSchema.json"), JSON.stringify(finalSchema, null, 2));
  fs.writeFileSync(path.join(OUT_DIR, "step1.json"), JSON.stringify(step1, null, 2));
  fs.writeFileSync(path.join(OUT_DIR, "step2.json"), JSON.stringify(step2, null, 2));

  console.log("✅ Done!");
  console.log("   -> data/formSchema.json");
  console.log("   -> data/step1.json");
  console.log("   -> data/step2.json");

  await browser.close();
})();
