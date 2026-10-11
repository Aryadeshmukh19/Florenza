import React, { useState, useEffect, useRef, useMemo, useCallback, useContext, createContext } from "react";
import {
  motion,
  AnimatePresence,
  MotionConfig,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue,
  useMotionTemplate,
  useReducedMotion,
  animate,
} from "framer-motion";
import { ArrowRight, ArrowLeft, ArrowDownRight, Plus, X, Check, Copy, MessageCircle, Phone, Moon, Sun } from "lucide-react";
import logoSrc from "./logo.png";
import macroSrc from "./macro.jpg";
import macroForestSrc from "./macro-forest.jpg";
import sproutingSrc from "./sprouting.jpg";
import {
  BRAND,
  INTRO,
  SPROUTS_VS,
  CROPS,
  SPEC_ROWS,
  YIELD_NOTE,
  STAGES,
  NUTRIENTS,
  NUTRITION_FACTORS,
  HEALTH,
  RESEARCH_NOTE,
  SOURCES,
  GUIDE,
  RECIPES,
  cropsListingDish,
} from "./content.js";

/* ──────────────────────────────────────────────────────────────
   STRUCTURE
   ────────────────────────────────────────────────────────────── */

const SECTIONS = [
  { id: "forest", label: "The Forest" },
  { id: "about", label: "About" },
  { id: "collection", label: "Microgreens" },
  { id: "method", label: "How we grow" },
  { id: "guide", label: "The Guide" },
  { id: "science", label: "Science" },
  { id: "recipes", label: "Recipes" },
  { id: "founder", label: "Founder" },
  { id: "order", label: "Order Fresh" },
];

const NAV = [
  { href: "#about", label: "About" },
  { href: "#collection", label: "Microgreens" },
  { href: "#method", label: "How we grow" },
  { href: "#science", label: "Science" },
  { href: "#recipes", label: "Recipes" },
  { href: "#founder", label: "Founder" },
];

const CROP_INDEX = Object.fromEntries(CROPS.map((c, i) => [c.id, i]));
const cropById = (id) => CROPS[CROP_INDEX[id]];

// Botanical drawing rules per variety. Shapes and colours only.
const VARIETY = {
  broccoli: { shape: "heart", len: 34, wid: 21, stem: "#C9D5BF", leaf: "#2F704A", leafB: "#3F8157", vein: "#A9B9A2", h: [130, 195] },
  fenugreek: { shape: "oblong", len: 26, wid: 11, stem: "#C8C29A", leaf: "#6E8F6B", leafB: "#8C9A5B", vein: "#D8C98E", h: [120, 185], trifoliate: true },
  redAmaranth: { shape: "oval", len: 30, wid: 13, stem: "#A3263A", leaf: "#8E1F2F", leafB: "#2F704A", vein: "#E3A1AC", h: [120, 180] },
  greenAmaranth: { shape: "oval", len: 28, wid: 13, stem: "#B5CC98", leaf: "#4E8F4A", leafB: "#5E9B52", vein: "#CFE3B8", h: [115, 175] },
  radish: { shape: "heart", len: 32, wid: 22, stem: "#C0667A", leaf: "#2F704A", leafB: "#27603F", vein: "#E0A3B0", h: [125, 190] },
  moong: { shape: "oval", len: 30, wid: 14, stem: "#E4E6CC", leaf: "#5E9B4E", leafB: "#6FA65A", vein: "#D6E6C0", h: [130, 190] },
  pea: { shape: "oval", len: 34, wid: 18, stem: "#9CC489", leaf: "#5C9E55", leafB: "#4F9049", vein: "#C8E2B8", h: [140, 200], tendril: true, thick: 1.3 },
  sunflower: { shape: "oblong", len: 42, wid: 15, stem: "#E2DDBE", leaf: "#3F7F3A", leafB: "#4A8A42", vein: "#B9D3A0", h: [130, 185], thick: 1.6 },
  mustard: { shape: "heart", len: 26, wid: 18, stem: "#D7E0C3", leaf: "#5C8F3E", leafB: "#4E8236", vein: "#CFE0A8", h: [115, 175] },
  chavali: { shape: "oval", len: 36, wid: 17, stem: "#9C7F78", leaf: "#4F8C47", leafB: "#5A9650", vein: "#C7DDB4", h: [130, 195], thick: 1.4 },
};

const EASE = [0.16, 1, 0.3, 1]; // fast → slow
const SPRING = { type: "spring", stiffness: 120, damping: 20, mass: 0.9 };
const SOFT = { type: "spring", stiffness: 70, damping: 18, mass: 1 };

/* ──────────────────────────────────────────────────────────────
   SHARED STATE — the selected crop and the order enquiry
   ────────────────────────────────────────────────────────────── */

const FlorenzaContext = createContext(null);
const useFlorenza = () => useContext(FlorenzaContext);

function FlorenzaProvider({ children }) {
  const [active, setActive] = useState(0);
  const [picks, setPicks] = useState([]);
  const togglePick = useCallback((id) => setPicks((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id])), []);
  const showCrop = useCallback((id) => {
    setActive(CROP_INDEX[id]);
    document.getElementById("collection")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);
  const value = useMemo(() => ({ active, setActive, picks, togglePick, showCrop }), [active, picks, togglePick, showCrop]);
  return <FlorenzaContext.Provider value={value}>{children}</FlorenzaContext.Provider>;
}

/* ──────────────────────────────────────────────────────────────
   UTILITIES
   ────────────────────────────────────────────────────────────── */

const clamp01 = (v) => Math.max(0, Math.min(1, v));
const easeOut = (t) => 1 - Math.pow(1 - t, 3);
const pad = (n) => String(n).padStart(2, "0");

function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function useMedia(query) {
  const [match, setMatch] = useState(() => typeof window !== "undefined" && window.matchMedia(query).matches);
  useEffect(() => {
    const m = window.matchMedia(query);
    const on = () => setMatch(m.matches);
    on();
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, [query]);
  return match;
}

async function copyText(text, fallbackEl) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    if (fallbackEl) {
      const r = document.createRange();
      r.selectNodeContents(fallbackEl);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(r);
    }
    return false;
  }
}

/* ──────────────────────────────────────────────────────────────
   BOTANICAL DRAWING SYSTEM
   ────────────────────────────────────────────────────────────── */

const LEAF_SHAPES = {
  oval: (l, w) => `M0 0C${l * 0.25} ${-w} ${l * 0.8} ${-w * 0.95} ${l} 0C${l * 0.8} ${w * 0.95} ${l * 0.25} ${w} 0 0Z`,
  heart: (l, w) => `M0 0C${l * 0.12} ${-w} ${l * 0.72} ${-w * 1.22} ${l * 0.98} ${-w * 0.4}Q${l * 0.86} 0 ${l * 0.98} ${w * 0.4}C${l * 0.72} ${w * 1.22} ${l * 0.12} ${w} 0 0Z`,
  lance: (l, w) => `M0 0C${l * 0.3} ${-w} ${l * 0.72} ${-w * 0.62} ${l} 0C${l * 0.72} ${w * 0.62} ${l * 0.3} ${w} 0 0Z`,
  oblong: (l, w) => `M0 0C${l * 0.08} ${-w} ${l * 0.92} ${-w} ${l} 0C${l * 0.92} ${w} ${l * 0.08} ${w} 0 0Z`,
};

const BLANCHED = { stem: "#EDE7C8", leaf: "#D9CF86", leafB: "#CFC47A", vein: "#F2EFE5" };

function buildSprouts(varieties, seed, count, spread = 1) {
  const r = rng(seed);
  const out = [];
  for (let i = 0; i < count; i++) {
    const v = varieties[Math.floor(r() * varieties.length)];
    const cfg = VARIETY[v] || VARIETY.broccoli;
    const t = count === 1 ? 0.5 : i / (count - 1);
    const x0 = 200 + (t - 0.5) * 190 * spread + (r() - 0.5) * 22;
    const lean = (t - 0.5) * 70 * spread + (r() - 0.5) * 40;
    const h = cfg.h[0] + r() * (cfg.h[1] - cfg.h[0]);
    out.push({ key: i, cfg, x0, lean, h, bend: (r() - 0.5) * 36, open: 32 + r() * 34, tilt: (r() - 0.5) * 26, size: 0.82 + r() * 0.38, dew: r() > 0.62, dur: 5 + r() * 4, depth: r() });
  }
  return out.sort((a, b) => a.depth - b.depth);
}

function Leaf({ cfg, angle, x, y, scale, detail, dew, alt }) {
  const d = LEAF_SHAPES[cfg.shape](cfg.len, cfg.wid);
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle}) scale(${scale * 1.45})`}>
      <path d={d} fill={alt ? cfg.leafB : cfg.leaf} />
      <path d={d} fill="none" stroke="rgba(0,0,0,0.18)" strokeWidth={0.6} />
      {detail && (
        <>
          <path d={`M1 0L${cfg.len * 0.84} 0`} stroke={cfg.vein} strokeWidth={0.9} strokeLinecap="round" opacity={0.75} />
          <path d={`M${cfg.len * 0.35} 0L${cfg.len * 0.55} ${-cfg.wid * 0.45}M${cfg.len * 0.5} 0L${cfg.len * 0.7} ${cfg.wid * 0.4}`} stroke={cfg.vein} strokeWidth={0.5} opacity={0.5} />
          {dew && (
            <g>
              <circle cx={cfg.len * 0.55} cy={-cfg.wid * 0.25} r={2.3} fill="rgba(250,249,243,0.35)" />
              <circle cx={cfg.len * 0.55 - 0.7} cy={-cfg.wid * 0.25 - 0.7} r={0.8} fill="#FAF9F3" />
            </g>
          )}
        </>
      )}
    </g>
  );
}

/**
 * Specimen — procedurally drawn microgreen cluster.
 * growth: 0 (seed) → 1 (harvest). detail adds veins + dew. blanch draws the pale blackout stage.
 */
function Specimen({ varieties, seed = 1, count = 9, growth = 1, detail = false, sway = false, ground = true, spread = 1, blanch = false, swell = 0, className = "", label }) {
  const key = varieties.join(",");
  const sprouts = useMemo(() => buildSprouts(varieties, seed, count, spread), [key, seed, count, spread]); // eslint-disable-line react-hooks/exhaustive-deps
  const stemF = easeOut(clamp01((growth - 0.1) / 0.9));
  const leafF = easeOut(clamp01((growth - 0.38) / 0.62));
  const seedOpacity = clamp01(1 - growth / 0.55);

  return (
    <svg viewBox="0 0 400 400" className={className} role={label ? "img" : undefined} aria-label={label} aria-hidden={label ? undefined : true}>
      {ground && (
        <g>
          <ellipse cx="200" cy="344" rx="170" ry="14" fill="rgba(7,26,18,0.55)" />
          <path d="M40 342 C 120 336, 280 336, 360 342" stroke="rgba(146,119,90,0.55)" strokeWidth="1" fill="none" />
          {Array.from({ length: 26 }).map((_, i) => (
            <circle key={i} cx={52 + ((i * 53) % 296)} cy={345 + ((i * 7) % 9)} r={0.8 + ((i * 13) % 5) * 0.25} fill="rgba(146,119,90,0.45)" />
          ))}
        </g>
      )}
      {seedOpacity > 0 &&
        sprouts.map((s) => (
          <ellipse key={`s${s.key}`} cx={s.x0} cy={339} rx={3.4 * (1 + swell * 0.45)} ry={2.4 * (1 + swell * 0.45)} fill={swell ? "#A88E6E" : "#92775A"} opacity={seedOpacity} transform={`rotate(${s.tilt} ${s.x0} 339)`} />
        ))}
      {stemF > 0.001 &&
        sprouts.map((s) => {
          const cfg = blanch ? { ...s.cfg, ...BLANCHED } : s.cfg;
          const h = s.h * stemF;
          const tipX = s.x0 + s.lean * stemF;
          const tipY = 340 - h;
          const cX = s.x0 + s.bend * stemF;
          const cY = 340 - h * 0.55;
          const ang = (Math.atan2(tipY - cY, tipX - cX) * 180) / Math.PI;
          const spreadA = 8 + s.open * leafF;
          const sc = (0.18 + 0.82 * leafF) * s.size;
          const hook = growth < 0.45 ? (1 - leafF) * 60 : 0;
          return (
            <g key={s.key} className={sway ? "sway" : undefined} style={sway ? { "--ox": `${s.x0}px`, "--d": `${s.dur}s` } : undefined}>
              <path d={`M${s.x0} 340 Q${cX} ${cY} ${tipX} ${tipY}`} stroke={cfg.stem} strokeWidth={2.1 * s.size * (cfg.thick || 1)} fill="none" strokeLinecap="round" />
              {detail && <path d={`M${s.x0 + 0.6} 338 Q${cX + 0.6} ${cY} ${tipX + 0.4} ${tipY + 3}`} stroke="rgba(250,249,243,0.35)" strokeWidth={0.6} fill="none" />}
              <Leaf cfg={cfg} x={tipX} y={tipY} angle={ang - spreadA + hook} scale={sc} detail={detail} dew={s.dew} />
              <Leaf cfg={cfg} x={tipX} y={tipY} angle={ang + spreadA + hook} scale={sc} detail={detail} alt />
              {cfg.trifoliate && leafF > 0.85 && s.dew && <Leaf cfg={cfg} x={tipX} y={tipY} angle={ang} scale={sc * 0.7 * ((leafF - 0.85) / 0.15)} detail={detail} alt />}
              {cfg.tendril && leafF > 0.6 && (
                <path d={`M${tipX} ${tipY} q ${6 + s.bend * 0.2} -18 18 -24 q 9 -3 7 6 q -2 5 -7 2`} stroke={cfg.stem} strokeWidth={1} fill="none" strokeLinecap="round" opacity={(leafF - 0.6) / 0.4} />
              )}
            </g>
          );
        })}
    </svg>
  );
}

function BigLeaf({ fill = "#174F35", vein = "rgba(169,185,162,0.14)", className = "", style }) {
  const laterals = [0.18, 0.3, 0.42, 0.54, 0.66, 0.78];
  return (
    <svg viewBox="-10 -130 380 260" className={className} style={style} aria-hidden="true">
      <path d="M0 0 C 70 -112 238 -120 362 0 C 238 120 70 112 0 0 Z" fill={fill} />
      <path d="M0 0 C 120 -4 240 -3 356 0" stroke={vein} strokeWidth="2" fill="none" />
      {laterals.map((t) => (
        <g key={t}>
          <path d={`M${t * 360} 0 Q ${t * 360 + 38} -30 ${t * 360 + 62} ${-78 + t * 40}`} stroke={vein} strokeWidth="1.2" fill="none" />
          <path d={`M${t * 360} 0 Q ${t * 360 + 38} 30 ${t * 360 + 62} ${78 - t * 40}`} stroke={vein} strokeWidth="1.2" fill="none" />
        </g>
      ))}
    </svg>
  );
}

function Frond({ fill = "#0D2B1E", pinnae = 20, className = "", style, outline = false, draw }) {
  const items = useMemo(() => {
    const arr = [];
    for (let i = 1; i <= pinnae; i++) {
      const t = i / (pinnae + 1);
      const x = (1 - t) * (1 - t) * 100 + 2 * (1 - t) * t * 60 + t * t * 120;
      const y = (1 - t) * (1 - t) * 600 + 2 * (1 - t) * t * 300 + t * t * 20;
      arr.push({ x, y, size: 1 - t * 0.78, side: i % 2 ? 1 : -1, t });
    }
    return arr;
  }, [pinnae]);
  const leaf = (s) => `M0 0 C 18 ${-12 * s} ${62 * s} ${-14 * s} ${86 * s} 0 C ${62 * s} ${12 * s} 18 ${10 * s} 0 0 Z`;
  return (
    <svg viewBox="0 0 220 620" className={className} style={style} aria-hidden="true">
      <motion.path d="M100 600 Q 60 300 120 20" stroke={fill} strokeWidth={outline ? 1.2 : 3} fill="none" style={draw ? { pathLength: draw } : undefined} />
      {items.map((p, i) => (
        <motion.path
          key={i}
          d={leaf(p.size)}
          transform={`translate(${p.x} ${p.y}) rotate(${p.side === 1 ? -32 - p.t * 20 : 212 + p.t * 20})`}
          fill={outline ? "none" : fill}
          stroke={outline ? fill : "none"}
          strokeWidth={outline ? 1 : 0}
          style={draw ? { pathLength: draw } : undefined}
        />
      ))}
    </svg>
  );
}

/* ──────────────────────────────────────────────────────────────
   SMALL PRIMITIVES
   ────────────────────────────────────────────────────────────── */

function Badge({ size = 56, className = "" }) {
  return (
    <span className={`relative inline-grid shrink-0 place-items-center rounded-full bg-ivory ${className}`} style={{ width: size, height: size, boxShadow: "inset 0 0 0 1px #0D2B1E, inset 0 0 0 3px #FAF9F3, inset 0 0 0 3.6px rgba(13,43,30,0.5)" }}>
      <img src={logoSrc} alt="Florenza Microgreens" className="block" style={{ width: "74%", height: "auto" }} draggable="false" />
    </span>
  );
}

function Meta({ children, className = "", ...rest }) {
  return (
    <span className={`meta ${className}`} {...rest}>
      {children}
    </span>
  );
}

function Reveal({ children, delay = 0, y = 28, className = "", as = "div" }) {
  const Comp = motion[as];
  return (
    <Comp className={className} initial={{ opacity: 0.08, y, filter: "blur(8px)" }} whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 1.1, ease: EASE, delay }}>
      {children}
    </Comp>
  );
}

function MaskLine({ children, delay = 0, className = "", animateOnLoad = false }) {
  // The wrapper is observed (not the clipped child), so the reveal always fires.
  const trigger = animateOnLoad ? { initial: "hide", animate: "show" } : { initial: "hide", whileInView: "show", viewport: { once: true, amount: 0.3 } };
  return (
    <motion.span className={`block overflow-hidden pb-[0.08em] ${className}`} {...trigger}>
      <motion.span className="block" variants={{ hide: { y: "105%" }, show: { y: "0%", transition: { duration: 1.3, ease: EASE, delay } } }}>
        {children}
      </motion.span>
    </motion.span>
  );
}

function SectionMark({ n, label, tone = "light" }) {
  return (
    <div className={`flex items-center gap-4 ${tone === "light" ? "text-sage" : "text-emerald"}`}>
      <Meta className="tabular-nums">{n}</Meta>
      <span className={`h-px w-10 ${tone === "light" ? "bg-sage/40" : "bg-emerald/40"}`} />
      <Meta>{label}</Meta>
    </div>
  );
}

/** Magnetic — the child drifts toward the pointer when it comes near. */
function Magnetic({ children, strength = 0.28, className = "" }) {
  const ref = useRef(null);
  const x = useSpring(0, { stiffness: 150, damping: 15, mass: 0.4 });
  const y = useSpring(0, { stiffness: 150, damping: 15, mass: 0.4 });
  const reduce = useReducedMotion();
  const onMove = (e) => {
    if (reduce || e.pointerType !== "mouse") return;
    const r = ref.current.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * strength);
    y.set((e.clientY - (r.top + r.height / 2)) * strength);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
  };
  return (
    <div ref={ref} onPointerMove={onMove} onPointerLeave={reset} className={`inline-block p-8 -m-8 ${className}`}>
      <motion.div style={{ x, y }}>{children}</motion.div>
    </div>
  );
}

/** Underlined tab strip with a shared moving indicator. Arrow keys move between tabs. */
function TabStrip({ items, value, onChange, id, tone = "light", className = "", size = "meta" }) {
  const onKey = (e) => {
    const i = items.findIndex((t) => t.value === value);
    if (e.key === "ArrowRight") {
      e.stopPropagation();
      onChange(items[(i + 1) % items.length].value);
    }
    if (e.key === "ArrowLeft") {
      e.stopPropagation();
      onChange(items[(i - 1 + items.length) % items.length].value);
    }
  };
  const on = tone === "light" ? "text-cream" : "text-night";
  const off = tone === "light" ? "text-sage/60 hover:text-sage" : "text-emerald/55 hover:text-emerald";
  const line = tone === "light" ? "bg-cream" : "bg-night";
  return (
    <div role="tablist" onKeyDown={onKey} className={`no-scrollbar flex gap-6 overflow-x-auto ${className}`}>
      {items.map((t) => {
        const sel = t.value === value;
        return (
          <button key={t.value} type="button" role="tab" aria-selected={sel} tabIndex={sel ? 0 : -1} onClick={() => onChange(t.value)} className={`relative shrink-0 whitespace-nowrap pb-2.5 pt-1 transition-colors ${size === "meta" ? "meta" : "font-display text-xl"} ${sel ? on : off}`}>
            {t.label}
            {sel && <motion.span layoutId={`tab-${id}`} className={`absolute inset-x-0 bottom-0 h-px ${line}`} transition={SPRING} />}
          </button>
        );
      })}
    </div>
  );
}

function Chip({ selected = false, onClick, children, className = "", ...rest }) {
  const base = selected ? "border-cream bg-cream text-night" : "border-sage/30 text-mist hover:border-sage";
  return (
    <button type="button" onClick={onClick} aria-pressed={rest.role ? undefined : selected} className={`inline-flex shrink-0 items-center gap-2 whitespace-nowrap border px-3.5 py-2 text-[13px] transition-colors duration-300 ${base} ${className}`} style={{ borderRadius: 999 }} {...rest}>
      {children}
    </button>
  );
}

let accSeq = 0;
function Accordion({ title, children, tone = "light", meta }) {
  const [open, setOpen] = useState(false);
  const [id] = useState(() => `acc-${++accSeq}`);
  return (
    <div className={`border-b ${tone === "light" ? "border-sage/20" : "border-deep/15"}`}>
      <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-controls={id} className="group flex w-full items-center gap-4 py-5 text-left">
        {meta && <Meta className={`w-8 shrink-0 tabular-nums ${tone === "light" ? "text-sage/50" : "text-emerald/50"}`}>{meta}</Meta>}
        <span className={`min-w-0 flex-1 font-display text-[1.45rem] leading-tight ${tone === "light" ? "text-cream" : "text-night"}`}>{title}</span>
        <motion.span animate={{ rotate: open ? 45 : 0 }} transition={SPRING} className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border ${tone === "light" ? "border-sage/40 text-sage" : "border-deep/25 text-deep"}`}>
          <Plus size={12} strokeWidth={1.5} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div id={id} initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.55, ease: EASE }} className="overflow-hidden">
            <div className={`pb-6 ${meta ? "sm:pl-12" : ""}`}>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   CURSOR + PROGRESS
   ────────────────────────────────────────────────────────────── */

function Cursor() {
  const fine = useMedia("(pointer: fine)");
  const reduce = useReducedMotion();
  const enabled = fine && !reduce;
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const rx = useSpring(x, { stiffness: 380, damping: 32, mass: 0.5 });
  const ry = useSpring(y, { stiffness: 380, damping: 32, mass: 0.5 });
  const [state, setState] = useState({ hover: false, label: "" });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!enabled) return;
    document.documentElement.classList.add("has-cursor");
    const move = (e) => {
      x.set(e.clientX);
      y.set(e.clientY);
      setVisible(true);
    };
    const over = (e) => {
      const t = e.target instanceof Element ? e.target : null;
      const interactive = t?.closest("a,button,[role='button'],[role='tab'],input,textarea,label");
      const lab = t?.closest("[data-cursor]");
      // A labelled area shows its label, unless the pointer is on some other control inside it.
      const label = lab && (!interactive || interactive === lab || interactive.contains(lab) || lab.contains(interactive)) ? lab.getAttribute("data-cursor") : "";
      setState({ hover: !!interactive || !!label, label });
    };
    const leave = () => setVisible(false);
    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerover", over, { passive: true });
    document.addEventListener("pointerleave", leave);
    return () => {
      document.documentElement.classList.remove("has-cursor");
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerover", over);
      document.removeEventListener("pointerleave", leave);
    };
  }, [enabled, x, y]);

  if (!enabled) return null;
  const size = state.label ? 78 : state.hover ? 38 : 8;
  return (
    <motion.div aria-hidden="true" className="pointer-events-none fixed left-0 top-0 z-[100] mix-blend-difference" style={{ x: rx, y: ry, opacity: visible ? 1 : 0 }}>
      <motion.div
        className="grid -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full"
        animate={{ width: size, height: size, backgroundColor: state.hover && !state.label ? "rgba(242,239,229,0)" : "rgba(242,239,229,1)", borderColor: "rgba(242,239,229,0.9)" }}
        style={{ borderWidth: 1, borderStyle: "solid" }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
      >
        <AnimatePresence>
          {state.label && (
            <motion.span key={state.label} initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }} className="text-[9px] font-medium tracking-[0.22em] text-night">
              {state.label}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleY = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.4 });
  const [current, setCurrent] = useState(0);
  useEffect(() => {
    const els = SECTIONS.map((s) => document.getElementById(s.id)).filter(Boolean);
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setCurrent(SECTIONS.findIndex((s) => s.id === e.target.id));
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
  return (
    <div aria-hidden="true" className="pointer-events-none fixed right-6 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-center gap-4 mix-blend-difference xl:flex">
      <span className="meta tabular-nums text-cream/80">{pad(current + 1)}</span>
      <div className="relative h-40 w-px bg-cream/20">
        <motion.div className="absolute inset-0 origin-top bg-cream" style={{ scaleY }} />
      </div>
      <span className="meta tabular-nums text-cream/40">{pad(SECTIONS.length)}</span>
      <AnimatePresence mode="wait">
        <motion.span key={current} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.5, ease: EASE }} className="meta mt-2 text-cream/70 [writing-mode:vertical-rl]">
          {SECTIONS[current].label}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   NAVIGATION
   ────────────────────────────────────────────────────────────── */

function Navigation() {
  const { scrollY } = useScroll();
  const p = useTransform(scrollY, [30, 480], [0, 1], { clamp: true });
  const bg = useTransform(p, (v) => `rgba(242,239,229,${(0.86 * v).toFixed(3)})`);
  const border = useTransform(p, (v) => `rgba(13,43,30,${(0.14 * v).toFixed(3)})`);
  const blur = useTransform(p, (v) => `blur(${(16 * v).toFixed(1)}px) saturate(${1 + 0.3 * v})`);
  const color = useTransform(p, [0, 1], ["#F2EFE5", "#0D2B1E"]);
  const padY = useTransform(p, [0, 1], [18, 10]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 px-3 sm:px-5" style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 12px)" }}>
        <motion.nav
          aria-label="Primary"
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 1.2, ease: EASE, delay: 0.4 }}
          style={{ backgroundColor: bg, borderColor: border, backdropFilter: blur, WebkitBackdropFilter: blur, color, paddingTop: padY, paddingBottom: padY }}
          className="mx-auto flex max-w-[1320px] items-center justify-between gap-4 rounded-[14px] border px-3 sm:px-4"
        >
          <a href="#forest" className="flex items-center gap-3" aria-label="Florenza — back to the top">
            <Badge size={46} />
            <span className="hidden flex-col leading-none sm:flex">
              <span className="font-display text-[22px] italic tracking-tight">Florenza</span>
              <Meta className="mt-1 opacity-60">Microgreens · Pune</Meta>
            </span>
          </a>
          <ul className="hidden items-center gap-7 xl:flex">
            {NAV.map((n) => (
              <li key={n.href}>
                <a href={n.href} className="navlink meta py-2">
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="flex items-center gap-3">
            <a href="#order" className="group hidden items-center gap-2 border-b border-current pb-1 sm:inline-flex">
              <Meta>Order Fresh</Meta>
              <ArrowDownRight size={14} strokeWidth={1.5} className="transition-transform duration-500 group-hover:rotate-[-45deg]" />
            </a>
            <button type="button" onClick={() => setOpen(true)} className="flex items-center gap-2 px-2 py-2 xl:hidden" aria-expanded={open} aria-controls="index-menu">
              <Meta>Index</Meta>
              <span className="flex flex-col gap-[3px]" aria-hidden="true">
                <span className="block h-px w-4 bg-current" />
                <span className="block h-px w-2.5 self-end bg-current" />
              </span>
            </button>
          </div>
        </motion.nav>
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            id="index-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Site index"
            className="fixed inset-0 z-[60] flex flex-col overflow-y-auto bg-deep px-6 text-cream"
            style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 20px)", paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 28px)" }}
            initial={{ clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            exit={{ clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.8, ease: EASE }}
          >
            <div className="relative z-10 flex items-center justify-between">
              <Badge size={46} />
              <button type="button" onClick={() => setOpen(false)} className="flex items-center gap-2 p-2" aria-label="Close index" autoFocus>
                <Meta>Close</Meta>
                <X size={16} strokeWidth={1.5} />
              </button>
            </div>
            <ul className="relative z-10 mt-auto flex flex-col gap-1 pt-10">
              {[...NAV, { href: "#order", label: "Order Fresh" }].map((n, i) => (
                <motion.li key={n.href} initial={{ y: 40, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 + i * 0.06, duration: 0.9, ease: EASE }}>
                  <a href={n.href} onClick={() => setOpen(false)} className="flex items-baseline gap-4 border-b border-cream/10 py-3">
                    <Meta className="tabular-nums text-sage">{pad(SECTIONS.findIndex((s) => `#${s.id}` === n.href) + 1)}</Meta>
                    <span className={`font-display text-[2.5rem] font-light leading-none ${n.href === "#order" ? "italic text-sage" : ""}`}>{n.label}</span>
                  </a>
                </motion.li>
              ))}
            </ul>
            <Meta className="relative z-10 mt-8 text-sage/60">{BRAND.location}</Meta>
            <Frond fill="rgba(110,143,107,0.18)" className="pointer-events-none absolute -right-10 top-24 h-[55vh] w-auto rotate-12" />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* ──────────────────────────────────────────────────────────────
   01 — HERO FOREST
   ────────────────────────────────────────────────────────────── */

const DUST = Array.from({ length: 26 }, (_, i) => {
  const r = rng(900 + i);
  return { left: r() * 100, top: 10 + r() * 80, size: 1 + r() * 2.2, dur: 9 + r() * 10, delay: -r() * 12, o: 0.25 + r() * 0.5 };
});

function PrimaryCTA({ href, label, cursor, icon: Icon, external = false, className = "" }) {
  return (
    <a
      href={href}
      data-cursor={cursor}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      className={`cta group relative inline-flex items-center gap-4 overflow-hidden border border-cream/50 px-6 py-4 text-cream ${className}`}
      style={{ borderRadius: 999 }}
    >
      <span className="cta-fill absolute inset-0 origin-bottom scale-y-0 bg-cream transition-transform duration-700" style={{ transitionTimingFunction: "cubic-bezier(.16,1,.3,1)" }} aria-hidden="true" />
      {Icon && <Icon size={16} strokeWidth={1.4} className="relative transition-colors duration-500 group-hover:text-night" aria-hidden="true" />}
      <span className="relative text-[11px] font-medium tracking-[0.26em] transition-colors duration-500 group-hover:text-night">{label}</span>
      <span className="relative flex h-5 w-7 items-center overflow-hidden transition-colors duration-500 group-hover:text-night" aria-hidden="true">
        <ArrowRight size={16} strokeWidth={1.3} className="arrow-a absolute" />
        <ArrowRight size={16} strokeWidth={1.3} className="arrow-b absolute" />
      </span>
    </a>
  );
}

function HeroForest() {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const fine = useMedia("(pointer: fine)");
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 40, damping: 18, mass: 0.8 });
  const sy = useSpring(my, { stiffness: 40, damping: 18, mass: 0.8 });
  const lx = useSpring(useMotionValue(0), { stiffness: 60, damping: 20 });
  const ly = useSpring(useMotionValue(0), { stiffness: 60, damping: 20 });

  useEffect(() => {
    const r = ref.current.getBoundingClientRect();
    lx.jump(r.width * 0.68);
    ly.jump(r.height * 0.42);
  }, [lx, ly]);

  const onMove = (e) => {
    if (reduce || !fine) return;
    const r = ref.current.getBoundingClientRect();
    mx.set(((e.clientX - r.left) / r.width - 0.5) * 2);
    my.set(((e.clientY - r.top) / r.height - 0.5) * 2);
    lx.set(e.clientX - r.left);
    ly.set(e.clientY - r.top);
  };

  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const k = reduce ? 0 : 1;
  const px = (d) => useTransform(sx, (v) => v * d * k); // eslint-disable-line react-hooks/rules-of-hooks
  const py = (d) => useTransform(sy, (v) => v * d * k); // eslint-disable-line react-hooks/rules-of-hooks
  const photoX = px(-6), photoY = py(-4);
  const farX = px(-10), farY = py(-6);
  const midX = px(-24), midY = py(-14);
  const subX = px(-14), subY = py(-8);
  const nearX = px(-52), nearY = py(-30);
  const rayX = px(30);

  const sPhoto = useTransform(scrollYProgress, [0, 1], ["0%", `${8 * k}%`]);
  const sFar = useTransform(scrollYProgress, [0, 1], ["0%", `${12 * k}%`]);
  const sMid = useTransform(scrollYProgress, [0, 1], ["0%", `${24 * k}%`]);
  const sSub = useTransform(scrollYProgress, [0, 1], ["0%", `${16 * k}%`]);
  const sNear = useTransform(scrollYProgress, [0, 1], ["0%", `${48 * k}%`]);
  const sText = useTransform(scrollYProgress, [0, 1], ["0%", `${30 * k}%`]);
  const fadeText = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const light = useMotionTemplate`radial-gradient(560px circle at ${lx}px ${ly}px, rgba(242,239,229,0.13), rgba(169,185,162,0.05) 40%, transparent 70%)`;

  return (
    <section id="forest" ref={ref} onPointerMove={onMove} className="relative isolate flex min-h-[100svh] flex-col overflow-hidden bg-night" aria-labelledby="hero-title">
      <div aria-hidden="true" className="absolute inset-0 -z-10" style={{ background: "radial-gradient(ellipse 90% 70% at 70% 30%, #174F35 0%, #0D2B1E 38%, #071A12 75%)" }} />

      {/* photographic depth: real cotyledons, toned into the forest */}
      <motion.div aria-hidden="true" style={{ y: sPhoto }} className="pointer-events-none absolute inset-0 -z-10">
        <motion.div
          style={{ x: photoX, y: photoY, backgroundImage: `url(${macroForestSrc})` }}
          initial={{ opacity: 0, scale: 1.12 }}
          animate={{ opacity: 0.55, scale: 1.05 }}
          transition={{ duration: 2.6, ease: EASE }}
          className="hero-photo absolute inset-[-4%] bg-cover bg-[70%_40%]"
        />
      </motion.div>

      <motion.div aria-hidden="true" style={{ x: rayX }} className="pointer-events-none absolute -left-[10%] -top-[20%] -z-10 h-[140%] w-[80%] origin-top-left -rotate-[24deg]">
        {[
          { l: "18%", w: 90, o: 0.09 },
          { l: "34%", w: 160, o: 0.06 },
          { l: "52%", w: 60, o: 0.08 },
          { l: "66%", w: 120, o: 0.04 },
        ].map((r, i) => (
          <motion.div key={i} className="absolute top-0 h-full blur-2xl" style={{ left: r.l, width: r.w, background: `linear-gradient(to bottom, rgba(242,239,229,${r.o}), transparent 75%)` }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 2.4, delay: 0.3 + i * 0.25 }} />
        ))}
      </motion.div>

      <motion.div aria-hidden="true" style={{ y: sFar }} className="pointer-events-none absolute inset-0 -z-10">
        <motion.div style={{ x: farX, y: farY }} className="absolute inset-0 opacity-50 blur-[10px]">
          <BigLeaf fill="#174F35" vein="transparent" className="absolute -left-[8%] top-[4%] w-[46vw] max-w-none rotate-[28deg]" />
          <Frond fill="#174F35" className="absolute right-[2%] top-[18%] h-[70vh] w-auto -rotate-[8deg]" />
          <BigLeaf fill="#133B29" vein="transparent" className="absolute left-[30%] top-[62%] w-[30vw] max-w-none rotate-[168deg]" />
        </motion.div>
      </motion.div>

      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        {DUST.map((d, i) => (
          <span key={i} className="dust absolute rounded-full bg-cream" style={{ left: `${d.left}%`, top: `${d.top}%`, width: d.size, height: d.size, opacity: d.o, animationDuration: `${d.dur}s`, animationDelay: `${d.delay}s` }} />
        ))}
      </div>

      <motion.div aria-hidden="true" style={{ y: sMid }} className="pointer-events-none absolute inset-0 -z-10">
        <motion.div style={{ x: midX, y: midY }} className="absolute inset-0 blur-[1.5px]">
          <Frond fill="#0B2519" className="absolute -left-[4%] bottom-[-8%] h-[92vh] w-auto rotate-[14deg]" />
          <Frond fill="#0A2217" className="absolute left-[8%] bottom-[-14%] h-[70vh] w-auto -rotate-[10deg] opacity-80" />
          <BigLeaf fill="#0E2E20" vein="rgba(169,185,162,0.08)" className="absolute -right-[6%] bottom-[18%] w-[30vw] min-w-[260px] max-w-none rotate-[200deg]" />
        </motion.div>
      </motion.div>

      <motion.div aria-hidden="true" style={{ y: sSub }} className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 flex justify-center md:justify-end">
        <motion.div style={{ x: subX, y: subY }} className="relative w-[128vw] max-w-none translate-y-[8%] opacity-55 md:mr-[-3%] md:w-[min(44vw,680px)] md:translate-y-[14%] md:opacity-100">
          <motion.div initial={{ opacity: 0, y: 60, filter: "blur(12px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 2.2, ease: EASE, delay: 0.5 }}>
            <Specimen varieties={["redAmaranth", "broccoli", "fenugreek", "radish", "pea", "sunflower"]} seed={7} count={17} spread={1.25} sway detail className="h-auto w-full" />
          </motion.div>
          <div className="absolute inset-x-[8%] bottom-[12%] h-24 bg-night blur-2xl" />
        </motion.div>
      </motion.div>

      <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 mix-blend-screen" style={{ background: light }} />

      <motion.div aria-hidden="true" style={{ y: sNear }} className="pointer-events-none absolute inset-0 z-20">
        <motion.div style={{ x: nearX, y: nearY }} className="absolute inset-0 blur-[5px]">
          <BigLeaf fill="#040F0A" vein="rgba(23,79,53,0.35)" className="absolute -bottom-[16%] -left-[18%] w-[70vw] min-w-[420px] max-w-none -rotate-[32deg] md:-left-[12%] md:w-[48vw]" />
          <BigLeaf fill="#050F0B" vein="rgba(23,79,53,0.3)" className="absolute -right-[20%] -top-[14%] w-[48vw] min-w-[320px] max-w-none rotate-[148deg] md:w-[36vw]" />
        </motion.div>
      </motion.div>

      {/* vignette + a reading shade behind the type */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-10" style={{ background: "radial-gradient(ellipse 120% 90% at 50% 40%, transparent 55%, rgba(7,26,18,0.85) 100%), linear-gradient(90deg, rgba(7,26,18,0.6) 0%, rgba(7,26,18,0.2) 45%, transparent 70%)" }} />

      {/* typography — stable against the pointer */}
      <motion.div style={{ y: sText, opacity: fadeText }} className="relative z-30 mx-auto flex w-full max-w-[1320px] flex-1 flex-col px-5 pb-10 pt-32 sm:px-8 md:pt-40">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.4, delay: 0.2 }} className="flex items-center gap-4 text-sage">
          <span className="h-px w-10 shrink-0 bg-sage/50" />
          <Meta>{BRAND.positioning}</Meta>
        </motion.div>
        <h1 id="hero-title" className="mt-7 font-display font-light leading-[0.9] tracking-[-0.02em] text-cream" style={{ fontSize: "clamp(3.2rem, 8.6vw, 8.8rem)" }}>
          <span className="sr-only">Florenza — </span>
          <MaskLine animateOnLoad delay={0.35}>
            {BRAND.core[0]}
          </MaskLine>
          <MaskLine animateOnLoad delay={0.47} className="pl-[0.5em] md:pl-[1.1em]">
            {BRAND.core[1]}
          </MaskLine>
          <MaskLine animateOnLoad delay={0.59}>
            <em className="text-sage-lit italic">{BRAND.core[2]}</em>
          </MaskLine>
        </h1>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.4, ease: EASE, delay: 1.05 }} className="mt-9 flex flex-col gap-7 md:flex-row md:items-center md:gap-12">
          <p className="max-w-[34ch] text-[16px] leading-relaxed text-mist/85 md:text-[17px]">{BRAND.heroLine}</p>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
            <Magnetic strength={0.2}>
              <PrimaryCTA href="#collection" label="EXPLORE OUR MICROGREENS" cursor="EXPLORE" />
            </Magnetic>
            <a href="#order" className="group inline-flex items-center gap-2 border-b border-sage/50 pb-1 text-cream transition-colors hover:border-cream">
              <Meta>Order Fresh</Meta>
              <ArrowDownRight size={14} strokeWidth={1.5} className="transition-transform duration-500 group-hover:rotate-[-45deg]" />
            </a>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1.6, delay: 1.6 }} className="mt-auto flex flex-wrap items-end justify-between gap-6 pt-14 text-sage/80">
          <div className="flex items-center gap-4">
            <a href="#about" className="relative block h-12 w-px shrink-0 overflow-hidden bg-sage/25" aria-label="Scroll to About Florenza">
              <span className="scrollcue absolute inset-x-0 top-0 h-1/2 bg-cream" />
            </a>
            <div className="flex flex-col gap-1">
              <Meta className="text-cream/80">Founded by {BRAND.founder}</Meta>
              <Meta className="text-sage/60">{BRAND.location}</Meta>
            </div>
          </div>
          <div className="hidden max-w-[360px] text-right md:block">
            <Meta className="block text-sage/60">Fig. 01 — Microgreens at the cotyledon stage</Meta>
            <Meta className="mt-2 block text-cream/70">Harvested ~7–21 days, varying by crop</Meta>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────
   02 — ABOUT: WHAT ARE MICROGREENS
   ────────────────────────────────────────────────────────────── */

function ScrollWord({ children, progress, range }) {
  const opacity = useTransform(progress, range, [0.14, 1]);
  const y = useTransform(progress, range, [8, 0]);
  return (
    <motion.span style={{ opacity, y }} className="inline-block">
      {children}
    </motion.span>
  );
}

const STATEMENT = "Freshness begins long before the plate.";

function GrowthCycle() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 85%", "end 55%"] });
  return (
    <div ref={ref} className="relative">
      {/* horizontal stem on wider screens, vertical on phones */}
      <div className="absolute left-0 right-0 top-[7px] hidden h-px bg-sage/15 sm:block" aria-hidden="true" />
      <motion.div className="absolute left-0 right-0 top-[7px] hidden h-px origin-left bg-sage/60 sm:block" style={{ scaleX: scrollYProgress }} aria-hidden="true" />
      <div className="absolute bottom-2 left-[7px] top-2 w-px bg-sage/15 sm:hidden" aria-hidden="true" />
      <motion.div className="absolute bottom-2 left-[7px] top-2 w-px origin-top bg-sage/60 sm:hidden" style={{ scaleY: scrollYProgress }} aria-hidden="true" />
      <ol className="relative grid gap-6 sm:grid-cols-5 sm:gap-2">
        {INTRO.cycle.map((c) => {
          const key = c === "Microgreen";
          return (
            <li key={c} className="flex min-w-0 items-baseline gap-5 sm:flex-col sm:items-start sm:gap-0">
              <span className={`relative block h-[15px] w-[15px] shrink-0 translate-y-0.5 rounded-full border sm:translate-y-0 ${key ? "border-cream bg-cream" : "border-sage/50 bg-deep"}`}>{key && <span className="pulse-ring absolute -inset-2 rounded-full border border-cream/40" />}</span>
              <span className={`font-display leading-tight sm:mt-4 ${key ? "text-[1.6rem] italic text-cream sm:text-[clamp(1.05rem,2vw,1.6rem)]" : "text-[1.3rem] text-sage/70 sm:text-[clamp(0.9rem,1.6vw,1.25rem)]"}`}>{c}</span>
              {key && <Meta className="text-sage sm:mt-2">~7–21 days</Meta>}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

function SproutsVsMicrogreens() {
  const [side, setSide] = useState("micro");
  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-6">
        <h3 className="max-w-[16ch] font-display text-[clamp(2.2rem,4.4vw,3.8rem)] font-light leading-[0.98] text-cream" style={{ textWrap: "balance" }}>
          Not simply <em className="italic text-sage">sprouts with leaves.</em>
        </h3>
        <div className="flex border border-sage/25 p-1" style={{ borderRadius: 999 }} role="group" aria-label="Compare sprouts and microgreens">
          {[
            ["sprouts", "Sprouts"],
            ["micro", "Microgreens"],
          ].map(([v, l]) => (
            <button key={v} type="button" onClick={() => setSide(v)} aria-pressed={side === v} className="relative px-4 py-2">
              {side === v && <motion.span layoutId="svm" className="absolute inset-0 bg-cream" style={{ borderRadius: 999 }} transition={SPRING} />}
              <span className={`meta relative transition-colors ${side === v ? "text-night" : "text-sage"}`}>{l}</span>
            </button>
          ))}
        </div>
      </div>
      <p className="mt-5 max-w-[56ch] text-[15px] leading-relaxed text-sage/80">{INTRO.notJust}</p>
      <div className="mt-8 border-t border-sage/20">
        <div className="hidden grid-cols-[1fr_1.3fr_1.3fr] gap-6 border-b border-sage/20 py-3 md:grid">
          <Meta className="text-sage/50">Characteristic</Meta>
          <Meta className={side === "sprouts" ? "text-cream" : "text-sage/50"}>Sprouts</Meta>
          <Meta className={side === "micro" ? "text-cream" : "text-sage/50"}>Microgreens</Meta>
        </div>
        {SPROUTS_VS.map((r) => (
          <div key={r.k} className="grid grid-cols-[minmax(0,0.9fr)_minmax(0,1.3fr)] gap-4 border-b border-sage/15 py-4 md:grid-cols-[1fr_1.3fr_1.3fr] md:gap-6">
            <Meta className="pt-1 text-sage/60">{r.k}</Meta>
            {["sprouts", "micro"].map((sd) => (
              <motion.p key={sd} initial={false} animate={{ opacity: side === sd ? 1 : 0.38 }} transition={{ duration: 0.5 }} className={`min-w-0 text-[15px] leading-snug ${side === sd ? "block text-cream" : "hidden text-sage md:block"}`}>
                {r[sd]}
              </motion.p>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function About() {
  const ref = useRef(null);
  const stRef = useRef(null);
  const plateRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: stRef, offset: ["start 85%", "end 40%"] });
  const { scrollYProgress: secP } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const { scrollYProgress: plateP } = useScroll({ target: plateRef, offset: ["start end", "end start"] });
  const stem = useTransform(secP, [0.05, 0.95], [0, 1]);
  const leafL = useTransform(secP, [0, 1], ["-10%", "20%"]);
  const leafR = useTransform(secP, [0, 1], ["10%", "-25%"]);
  const plateY = useTransform(plateP, [0, 1], ["-7%", "7%"]);
  const plateClip = useTransform(plateP, [0.02, 0.35], ["inset(14% 8% 14% 8%)", "inset(0% 0% 0% 0%)"]);
  const words = STATEMENT.split(" ");

  return (
    <section id="about" ref={ref} className="relative overflow-hidden" aria-labelledby="about-title" style={{ background: "linear-gradient(180deg, #071A12 0%, #0D2B1E 22%, #123A28 60%, #0F3322 100%)" }}>
      <motion.div aria-hidden="true" style={{ y: leafL }} className="pointer-events-none absolute -left-24 top-[30%] opacity-40">
        <Frond fill="#174F35" className="h-[80vh] w-auto -rotate-[18deg]" />
      </motion.div>
      <motion.div aria-hidden="true" style={{ y: leafR }} className="pointer-events-none absolute -right-40 top-[4%] opacity-30">
        <BigLeaf fill="#174F35" vein="rgba(169,185,162,0.12)" className="w-[40vw] min-w-[320px] rotate-[120deg]" />
      </motion.div>

      {/* continuity stem — begins here, continues into the collection */}
      <svg aria-hidden="true" className="pointer-events-none absolute left-[7%] top-0 h-full w-[120px] md:left-[9%]" viewBox="0 0 120 1000" preserveAspectRatio="none">
        <motion.path d="M60 0 C 20 180, 100 340, 58 520 S 30 820, 60 1000" stroke="rgba(169,185,162,0.35)" strokeWidth="1" fill="none" vectorEffect="non-scaling-stroke" style={{ pathLength: stem }} />
      </svg>

      <div className="relative mx-auto max-w-[1320px] px-5 pb-28 pt-32 sm:px-8 md:pb-40 md:pt-44">
        <div className="md:pl-[12%]">
          <SectionMark n="02" label="About Florenza" />
          <h2 id="about-title" ref={stRef} className="mt-10 max-w-[14ch] font-display font-light leading-[0.98] tracking-[-0.015em] text-cream" style={{ fontSize: "clamp(3rem, 8vw, 8.4rem)", textWrap: "balance" }}>
            {words.map((w, i) => (
              <React.Fragment key={i}>
                <ScrollWord progress={scrollYProgress} range={[i / words.length, (i + 1) / words.length]}>
                  {w === "plate." ? <em className="italic text-sage">{w}</em> : w}
                </ScrollWord>{" "}
              </React.Fragment>
            ))}
          </h2>
        </div>

        {/* definition + Plate I */}
        <div className="mt-20 grid items-center gap-14 md:mt-28 md:grid-cols-12">
          <div className="min-w-0 md:col-span-5 md:col-start-2 md:pl-[10%]">
            <Reveal>
              <Meta className="text-sage/70">What are microgreens?</Meta>
              <p className="mt-6 max-w-[36ch] font-display text-[clamp(1.4rem,2.1vw,1.9rem)] leading-[1.35] text-mist">{INTRO.definition}</p>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="mt-8 max-w-[44ch] border-l border-sage/30 pl-5 text-[15px] leading-relaxed text-sage/85">{BRAND.focus}</p>
            </Reveal>
          </div>
          <figure ref={plateRef} className="relative min-w-0 md:col-span-5 md:col-start-8">
            <motion.div style={{ clipPath: plateClip }} className="relative aspect-[4/5] w-full overflow-hidden">
              <motion.img src={macroSrc} alt="Close-up of young microgreen cotyledons in soft light" style={{ y: plateY, scale: 1.18 }} className="absolute inset-0 h-full w-full object-cover" draggable="false" />
              <div className="absolute inset-0" style={{ background: "linear-gradient(180deg, rgba(7,26,18,0) 55%, rgba(7,26,18,0.55) 100%)" }} aria-hidden="true" />
            </motion.div>
            <figcaption className="mt-4 flex items-center justify-between gap-4 text-sage/70">
              <Meta>Plate I</Meta>
              <Meta className="text-right">Cotyledons — the first leaves</Meta>
            </figcaption>
          </figure>
        </div>

        {/* growth cycle + Plate II */}
        <div className="mt-28 grid gap-12 md:grid-cols-12">
          <div className="min-w-0 md:col-span-10 md:col-start-2">
            <div className="flex flex-wrap items-baseline justify-between gap-4">
              <Meta className="text-sage">Growth cycle</Meta>
              <p className="max-w-[52ch] text-[14px] leading-relaxed text-sage/70">{INTRO.window}</p>
            </div>
            <div className="mt-10">
              <GrowthCycle />
            </div>
            <Reveal className="mt-14">
              <figure className="relative ml-auto max-w-[760px] overflow-hidden bg-ivory p-3 sm:p-4" style={{ borderRadius: 2 }}>
                <img src={sproutingSrc} alt="A seed germinating into a seedling, shown in stages from left to right" className="block h-auto w-full mix-blend-multiply" draggable="false" />
                <figcaption className="mt-3 flex flex-wrap items-center justify-between gap-2 text-deep/60">
                  <Meta>Plate II — Seed to seedling</Meta>
                  <Meta>Germination → Seedling</Meta>
                </figcaption>
              </figure>
            </Reveal>
          </div>
        </div>

        {/* sprouts vs microgreens */}
        <div className="mt-28 grid md:grid-cols-12">
          <div className="min-w-0 md:col-span-10 md:col-start-2">
            <SproutsVsMicrogreens />
          </div>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────
   03 — COLLECTION EXPLORER (10-position specimen dial)
   ────────────────────────────────────────────────────────────── */

const N = CROPS.length;
const RING_R = 43;

function slotFor(i, active) {
  if (i === active) return { x: 50, y: 50, w: 50 };
  const k = (i - active + N) % N; // 1..N-1
  const a = ((-90 + (k - 1) * (360 / (N - 1))) * Math.PI) / 180;
  return { x: 50 + RING_R * Math.cos(a), y: 50 + RING_R * Math.sin(a), w: 12 };
}

function ProductVisual({ crop, active, hovered, revealed, className = "" }) {
  return (
    <motion.div className={className} animate={{ scale: active ? (revealed ? 0.92 : 1) : hovered ? 1.18 : 1 }} transition={SPRING}>
      <Specimen varieties={[crop.id]} seed={crop.seed} count={active ? 11 : 6} detail={active || hovered} sway={active} className="h-auto w-full overflow-visible" label={active ? `${crop.name} microgreens, illustrated` : undefined} />
    </motion.div>
  );
}

function SpecGrid({ crop }) {
  if (!crop.spec) {
    return (
      <div>
        <p className="font-display text-xl italic text-cream">{crop.specNote}</p>
        {crop.traits && (
          <ul className="mt-4 flex flex-wrap gap-2">
            {crop.traits.map((t) => (
              <li key={t} className="border border-sage/25 px-3 py-1.5 text-[13px] text-mist" style={{ borderRadius: 999 }}>
                {t}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }
  return (
    <div>
      <dl className="grid grid-cols-2 gap-x-6">
        {SPEC_ROWS.map(([key, label]) =>
          crop.spec[key] ? (
            <div key={key} className={`min-w-0 border-t border-sage/15 py-3 ${key === "light" ? "col-span-2" : ""}`}>
              <dt>
                <Meta className="text-sage/55">{label}</Meta>
              </dt>
              <dd className="mt-1 text-[14px] leading-snug text-cream tabular-nums">{crop.spec[key]}</dd>
            </div>
          ) : null
        )}
      </dl>
      {crop.problems && (
        <p className="mt-1 border-t border-sage/15 pt-3 text-[13px] leading-relaxed text-sage/85">
          <Meta className="mr-2 text-sage/55">Common problems</Meta>
          {crop.problems}
        </p>
      )}
      <p className="mt-4 text-[12px] leading-relaxed text-sage/55">{YIELD_NOTE}</p>
    </div>
  );
}

function NutritionPanel({ crop }) {
  if (!crop.nutrition) {
    return (
      <p className="text-[14px] leading-relaxed text-sage/85">
        This profile doesn't list specific nutrients. Composition varies between crops and growing conditions.{" "}
        <a href="#science" className="text-cream underline decoration-sage/40 underline-offset-4 hover:decoration-cream">
          See Nutrition &amp; Science
        </a>
        .
      </p>
    );
  }
  return (
    <div>
      <Meta className="text-sage/60">{crop.nutritionLead}</Meta>
      <ul className="mt-3 flex flex-wrap gap-2">
        {crop.nutrition.map((n, i) => (
          <motion.li key={n} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04, duration: 0.5, ease: EASE }} className="border border-sage/25 px-3 py-1.5 text-[13px] text-mist" style={{ borderRadius: 999 }}>
            {n}
          </motion.li>
        ))}
      </ul>
      {crop.science && <p className="mt-5 border-l border-sage/30 pl-4 text-[14px] leading-relaxed text-sage/85">{crop.science}</p>}
    </div>
  );
}

function KitchenPanel({ crop }) {
  const dishes = RECIPES.filter((r) => r.crops.includes(crop.id) || cropsListingDish(r).includes(crop.id));
  return (
    <div>
      <Meta className="text-sage/60">Uses</Meta>
      <p className="mt-2 font-display text-[1.6rem] leading-snug text-cream">{(crop.uses || []).join(" · ") || "Not listed in this profile"}</p>
      {dishes.length > 0 && (
        <p className="mt-5 text-[14px] text-sage/80">
          In our recipes:{" "}
          {dishes.map((d, i) => (
            <React.Fragment key={d.id}>
              <a href="#recipes" className="text-cream underline decoration-sage/40 underline-offset-4 hover:decoration-cream">
                {d.name}
              </a>
              {i < dishes.length - 1 ? ", " : ""}
            </React.Fragment>
          ))}
        </p>
      )}
    </div>
  );
}

/** The specimen drawer — opens the full crop profile in three tabs. */
function CropDrawer({ crop, open, onToggle, tab, setTab, idSuffix = "" }) {
  const panelId = `drawer-${crop.id}${idSuffix}`;
  return (
    <div>
      <button type="button" onClick={onToggle} aria-expanded={open} aria-controls={panelId} className="group inline-flex items-center gap-3 border-b border-sage/40 pb-2 text-cream transition-colors hover:border-cream">
        <motion.span animate={{ rotate: open ? 45 : 0 }} transition={SPRING} className="grid h-6 w-6 place-items-center rounded-full border border-sage/50">
          <Plus size={12} strokeWidth={1.5} />
        </motion.span>
        <Meta>{open ? "Close the profile" : "Open the crop profile"}</Meta>
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id={panelId}
            initial={{ clipPath: "inset(0 0 100% 0)", opacity: 0, filter: "blur(6px)", y: -8 }}
            animate={{ clipPath: "inset(0 0 0% 0)", opacity: 1, filter: "blur(0px)", y: 0 }}
            exit={{ clipPath: "inset(0 0 100% 0)", opacity: 0, filter: "blur(4px)", y: -6 }}
            transition={{ type: "spring", stiffness: 90, damping: 18, mass: 0.9 }}
            className="relative mt-6 overflow-hidden border border-sage/20 bg-night/40 p-5 backdrop-blur-md md:p-6"
            style={{ borderRadius: 4 }}
          >
            <div className="absolute inset-x-0 top-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${crop.accent}, transparent)` }} />
            <TabStrip
              id={`drawer${idSuffix}`}
              value={tab}
              onChange={setTab}
              items={[
                { value: "profile", label: "Crop profile" },
                { value: "nutrition", label: "Nutrition" },
                { value: "kitchen", label: "In the kitchen" },
              ]}
            />
            <div className="mt-5" role="tabpanel">
              <AnimatePresence mode="wait">
                <motion.div key={`${crop.id}-${tab}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.35, ease: EASE }}>
                  {tab === "profile" && <SpecGrid crop={crop} />}
                  {tab === "nutrition" && <NutritionPanel crop={crop} />}
                  {tab === "kitchen" && <KitchenPanel crop={crop} />}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function QuickFacts({ crop }) {
  const facts = crop.spec
    ? [
        ["Harvest", crop.spec.harvest],
        ["Soaking", crop.spec.soak],
        ["Difficulty", crop.spec.difficulty],
      ]
    : [["Production", crop.specNote]];
  return (
    <dl className="grid grid-cols-3 gap-4">
      {facts.map(([k, v]) => (
        <div key={k} className={`min-w-0 ${facts.length === 1 ? "col-span-3" : ""}`}>
          <dt>
            <Meta className="text-sage/55">{k}</Meta>
          </dt>
          <dd className="mt-1.5 text-[14px] leading-snug text-mist">{v}</dd>
        </div>
      ))}
    </dl>
  );
}

function PickButton({ crop }) {
  const { picks, togglePick } = useFlorenza();
  const on = picks.includes(crop.id);
  return (
    <button type="button" onClick={() => togglePick(crop.id)} aria-pressed={on} className={`inline-flex items-center gap-2 border-b pb-2 transition-colors ${on ? "border-cream text-cream" : "border-sage/40 text-sage hover:border-cream hover:text-cream"}`}>
      <span className={`grid h-6 w-6 place-items-center rounded-full border transition-colors ${on ? "border-cream bg-cream text-night" : "border-sage/50"}`}>{on ? <Check size={12} strokeWidth={2} /> : <Plus size={12} strokeWidth={1.5} />}</span>
      <Meta>{on ? "In your enquiry" : "Add to enquiry"}</Meta>
    </button>
  );
}

function CropIndex({ active, select }) {
  return (
    <div role="tablist" aria-label="Choose a microgreen" className="flex flex-wrap gap-x-5 gap-y-1">
      {CROPS.map((c, i) => {
        const on = i === active;
        return (
          <button key={c.id} type="button" role="tab" aria-selected={on} onClick={() => select(i)} className={`relative flex items-baseline gap-1.5 py-1.5 font-display text-[1.1rem] transition-colors ${on ? "text-cream" : "text-sage/50 hover:text-sage"}`}>
            <span className="meta tabular-nums opacity-60">{pad(i + 1)}</span>
            {c.name}
            {on && <motion.span layoutId="crop-index" className="absolute inset-x-0 bottom-0.5 h-px bg-cream" transition={SPRING} />}
          </button>
        );
      })}
    </div>
  );
}

function CollectionExplorer() {
  const { active, setActive } = useFlorenza();
  const [hovered, setHovered] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [tab, setTab] = useState("profile");
  const [dir, setDir] = useState(1);
  const crop = CROPS[active];
  const prevActive = useRef(active);

  // Direction for the mobile swipe transition, also when the crop is changed from elsewhere on the page.
  useEffect(() => {
    const d = (active - prevActive.current + N) % N;
    if (d) setDir(d <= N / 2 ? 1 : -1);
    prevActive.current = active;
  }, [active]);

  const select = useCallback((n) => setActive(((n % N) + N) % N), [setActive]);
  const next = () => select(active + 1);
  const prev = () => select(active - 1);

  const onKey = (e) => {
    if (e.target.matches("input, textarea")) return;
    if (e.key === "ArrowRight") next();
    if (e.key === "ArrowLeft") prev();
  };

  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "start 30%"] });

  return (
    <section id="collection" ref={ref} className="relative overflow-hidden bg-deep" aria-labelledby="collection-title" onKeyDown={onKey}>
      {CROPS.map((p, i) => (
        <motion.div
          key={p.id}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          initial={false}
          animate={{ opacity: i === active ? 1 : 0 }}
          transition={{ duration: 1.4, ease: EASE }}
          style={{ background: `radial-gradient(ellipse 65% 55% at 34% 58%, ${p.tone} 0%, transparent 70%), radial-gradient(ellipse 50% 40% at 80% 20%, rgba(23,79,53,0.5), transparent 70%)` }}
        />
      ))}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(180deg, #0F3322 0%, transparent 14%, transparent 86%, #071A12 100%)" }} />

      <svg aria-hidden="true" className="pointer-events-none absolute left-[7%] top-0 hidden h-[440px] w-[40%] md:left-[9%] md:block" viewBox="0 0 400 440" preserveAspectRatio="none">
        <motion.path d="M6 0 C 0 120, 60 200, 180 260 S 360 360, 390 440" stroke="rgba(169,185,162,0.35)" strokeWidth="1" fill="none" vectorEffect="non-scaling-stroke" style={{ pathLength: scrollYProgress }} />
      </svg>

      <div className="relative mx-auto max-w-[1320px] px-5 pb-24 pt-28 sm:px-8 md:pb-36 md:pt-40">
        <header className="grid gap-8 md:grid-cols-12">
          <div className="md:col-span-8 md:col-start-2">
            <SectionMark n="03" label="Our Microgreens" />
            <h2 id="collection-title" className="mt-8 font-display font-light leading-[0.9] tracking-[-0.02em] text-cream">
              <MaskLine>
                <span style={{ fontSize: "clamp(3.6rem, 10vw, 9.5rem)" }} className="block">
                  Ten greens.
                </span>
              </MaskLine>
              <MaskLine delay={0.12}>
                <span style={{ fontSize: "clamp(1.9rem, 4.2vw, 3.8rem)" }} className="block pl-[0.1em] italic text-sage md:pl-[2.4em]">
                  Ten distinct expressions.
                </span>
              </MaskLine>
            </h2>
          </div>
          <div className="hidden self-end md:col-span-3 md:block">
            <p className="text-sm leading-relaxed text-sage/80">Turn the dial to bring a crop forward. Open its profile for growing specifications, nutrition and uses.</p>
          </div>
        </header>

        {/* DESKTOP — spatial herbarium dial */}
        <div className="mt-14 hidden grid-cols-12 items-center gap-8 lg:grid">
          <div className="relative col-span-7 aspect-square max-h-[86vh] w-full" data-cursor="EXPLORE">
            <motion.svg aria-hidden="true" viewBox="0 0 400 400" className="pointer-events-none absolute inset-[7%] h-[86%] w-[86%]" animate={{ rotate: -active * (360 / N) }} transition={SOFT}>
              <circle cx="200" cy="200" r="196" fill="none" stroke="rgba(169,185,162,0.14)" strokeWidth="0.6" />
              {Array.from({ length: 60 }).map((_, i) => (
                <line key={i} x1="200" y1="4" x2="200" y2={i % 6 === 0 ? 16 : 9} stroke="rgba(169,185,162,0.35)" strokeWidth="0.6" transform={`rotate(${i * 6} 200 200)`} />
              ))}
              <circle cx="200" cy="4" r="2.4" fill="#F2EFE5" />
            </motion.svg>
            <svg aria-hidden="true" viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full">
              {CROPS.map((c, i) => {
                if (i === active) return null;
                const s = slotFor(i, active);
                return <motion.line key={c.id} x1="50" y1="50" initial={false} animate={{ x2: s.x, y2: s.y }} transition={SPRING} stroke="rgba(169,185,162,0.13)" strokeWidth="0.15" strokeDasharray="0.6 0.8" vectorEffect="non-scaling-stroke" />;
              })}
            </svg>

            {CROPS.map((p, i) => {
              const s = slotFor(i, active);
              const isActive = i === active;
              const isHover = hovered === i && !isActive;
              return (
                <motion.button
                  key={p.id}
                  type="button"
                  aria-label={isActive ? `${p.name}, selected` : `Bring ${p.name} forward`}
                  aria-pressed={isActive}
                  onClick={() => select(i)}
                  onMouseEnter={() => setHovered(i)}
                  onMouseLeave={() => setHovered(null)}
                  onFocus={() => setHovered(i)}
                  onBlur={() => setHovered(null)}
                  className="absolute block"
                  style={{ x: "-50%", y: "-50%", zIndex: isActive ? 1 : 2 }}
                  initial={false}
                  animate={{ left: `${s.x}%`, top: `${s.y}%`, width: `${s.w}%` }}
                  transition={SPRING}
                >
                  <ProductVisual crop={p} active={isActive} hovered={isHover} revealed={revealed} className="w-full" />
                  {!isActive && (
                    <span className="pointer-events-none absolute left-1/2 top-[86%] flex -translate-x-1/2 flex-col items-center whitespace-nowrap">
                      <Meta className="tabular-nums text-sage/55">{pad(i + 1)}</Meta>
                      <motion.span initial={false} animate={{ opacity: isHover ? 1 : 0, y: isHover ? 0 : -4 }} transition={{ duration: 0.4, ease: EASE }} className="mt-0.5 font-display text-base italic text-cream">
                        {p.name}
                      </motion.span>
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>

          <div className="col-span-5 min-w-0 pl-2" aria-live="polite">
            <div className="flex items-center gap-4">
              <Meta className="tabular-nums text-cream">N° {pad(active + 1)}</Meta>
              <span className="h-px w-8 bg-sage/40" />
              <Meta className="tabular-nums text-sage/60">{pad(N)}</Meta>
              {crop.status === "available" && <Meta className="ml-auto border border-cream/40 px-2 py-1 text-cream">Currently growing</Meta>}
            </div>
            <AnimatePresence mode="wait">
              <motion.div key={crop.id} initial="hide" animate="show" exit="exit" variants={{ hide: {}, show: { transition: { staggerChildren: 0.06 } }, exit: {} }}>
                <motion.h3
                  variants={{ hide: { y: 40, opacity: 0, filter: "blur(8px)" }, show: { y: 0, opacity: 1, filter: "blur(0px)", transition: { duration: 0.9, ease: EASE } }, exit: { y: -24, opacity: 0, filter: "blur(6px)", transition: { duration: 0.3 } } }}
                  className="mt-5 font-display text-[clamp(3rem,4.8vw,4.8rem)] font-light leading-[0.95] tracking-[-0.015em] text-cream"
                >
                  {crop.name}
                  {crop.local && <span className="ml-3 align-middle font-display text-[0.42em] italic text-sage">{crop.local}</span>}
                </motion.h3>
                <motion.p variants={{ hide: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0.8 } }, exit: { opacity: 0 } }} className="mt-3 flex min-h-[1.75rem] flex-wrap items-baseline gap-x-4 gap-y-1">
                  {crop.latin && <span className="font-display text-xl italic text-sage">{crop.latin}</span>}
                  {crop.family && <Meta className="text-sage/55">{crop.family}</Meta>}
                </motion.p>
                <motion.div variants={{ hide: { scaleX: 0 }, show: { scaleX: 1, transition: { duration: 1, ease: EASE } }, exit: { opacity: 0 } }} className="mt-6 h-px origin-left bg-sage/25" />
                <motion.div variants={{ hide: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 }, exit: { opacity: 0 } }} className="mt-5">
                  <Meta className="text-sage/55">Flavour</Meta>
                  <p className="mt-1.5 font-display text-[1.9rem] italic leading-tight" style={{ color: crop.accent }}>
                    {crop.flavour}
                  </p>
                </motion.div>
                <motion.div variants={{ hide: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 }, exit: { opacity: 0 } }} className="mt-6">
                  <QuickFacts crop={crop} />
                </motion.div>
                <motion.div variants={{ hide: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 }, exit: { opacity: 0 } }} className="mt-8 flex flex-wrap items-start gap-x-10 gap-y-5">
                  <PickButton crop={crop} />
                </motion.div>
              </motion.div>
            </AnimatePresence>
            <div className="mt-6">
              <CropDrawer crop={crop} open={revealed} onToggle={() => setRevealed((v) => !v)} tab={tab} setTab={setTab} />
            </div>
            <div className="mt-10 flex items-center gap-4">
              <button type="button" onClick={prev} aria-label="Previous microgreen" className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-sage/30 text-cream transition-colors hover:border-cream hover:bg-cream hover:text-night">
                <ArrowLeft size={16} strokeWidth={1.4} />
              </button>
              <button type="button" onClick={next} aria-label="Next microgreen" className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-sage/30 text-cream transition-colors hover:border-cream hover:bg-cream hover:text-night">
                <ArrowRight size={16} strokeWidth={1.4} />
              </button>
              <Meta className="text-sage/50">or use the ← → keys</Meta>
            </div>
          </div>
          <div className="col-span-10 col-start-2 mt-6 border-t border-sage/15 pt-6">
            <CropIndex active={active} select={select} />
          </div>
        </div>

        <MobileCollection crop={crop} active={active} dir={dir} select={select} next={next} prev={prev} revealed={revealed} setRevealed={setRevealed} tab={tab} setTab={setTab} />
      </div>
    </section>
  );
}

function MobileCollection({ crop, active, dir, select, next, prev, revealed, setRevealed, tab, setTab }) {
  const stripRef = useRef(null);
  useEffect(() => {
    const strip = stripRef.current;
    const el = strip?.querySelector(`[data-i='${active}']`);
    if (strip && el) strip.scrollTo({ left: el.offsetLeft - strip.clientWidth / 2 + el.clientWidth / 2, behavior: "smooth" });
  }, [active]);
  return (
    <div className="mt-10 lg:hidden">
      <div ref={stripRef} className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:-mx-8 sm:px-8" role="tablist" aria-label="Choose a microgreen">
        {CROPS.map((c, i) => (
          <Chip key={c.id} data-i={i} role="tab" aria-selected={i === active} selected={i === active} onClick={() => select(i)}>
            <span className="tabular-nums opacity-60">{pad(i + 1)}</span> {c.name}
          </Chip>
        ))}
      </div>
      <div className="mt-6 flex items-center justify-between">
        <Meta className="tabular-nums text-cream" aria-live="polite">
          {pad(active + 1)} <span className="text-sage/50">/ {pad(N)}</span>
        </Meta>
        <Meta className="text-sage/60">Swipe to explore</Meta>
      </div>
      <div className="relative mt-2 aspect-[5/4] w-full overflow-hidden">
        <AnimatePresence initial={false} custom={dir} mode="popLayout">
          <motion.div
            key={crop.id}
            custom={dir}
            variants={{
              enter: (d) => ({ x: d > 0 ? "70%" : "-70%", opacity: 0, scale: 0.8, rotate: d * 6 }),
              center: { x: "0%", opacity: 1, scale: 1, rotate: 0 },
              exit: (d) => ({ x: d > 0 ? "-70%" : "70%", opacity: 0, scale: 0.8, rotate: -d * 6 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={SPRING}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.55}
            onDragEnd={(_, info) => {
              if (info.offset.x < -60 || info.velocity.x < -450) next();
              else if (info.offset.x > 60 || info.velocity.x > 450) prev();
            }}
            className="absolute inset-0 touch-pan-y"
          >
            <Specimen varieties={[crop.id]} seed={crop.seed} count={10} detail sway className="pointer-events-none h-full w-full" label={`${crop.name} microgreens, illustrated`} />
          </motion.div>
        </AnimatePresence>
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={crop.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} transition={{ duration: 0.6, ease: EASE }}>
          <h3 className="font-display text-[3rem] font-light leading-none text-cream">
            {crop.name}
            {crop.local && <span className="ml-2 align-middle text-[1.2rem] italic text-sage">{crop.local}</span>}
          </h3>
          <p className="mt-2 flex flex-wrap items-baseline gap-x-3">
            {crop.latin && <span className="font-display text-lg italic text-sage">{crop.latin}</span>}
            {crop.family && <Meta className="text-sage/55">{crop.family}</Meta>}
          </p>
          <p className="mt-5 font-display text-[1.6rem] italic leading-tight" style={{ color: crop.accent }}>
            {crop.flavour}
          </p>
          <div className="mt-5">
            <QuickFacts crop={crop} />
          </div>
        </motion.div>
      </AnimatePresence>
      <div className="mt-7 flex flex-col items-start gap-6">
        <PickButton crop={crop} />
        <div className="w-full">
          <CropDrawer crop={crop} open={revealed} onToggle={() => setRevealed((v) => !v)} tab={tab} setTab={setTab} idSuffix="-m" />
        </div>
      </div>
      <div className="mt-10 flex items-center justify-between">
        <button type="button" onClick={prev} aria-label="Previous microgreen" className="grid h-12 w-12 place-items-center rounded-full border border-sage/30 text-cream active:bg-cream active:text-night">
          <ArrowLeft size={16} strokeWidth={1.4} />
        </button>
        <div className="flex gap-1" aria-hidden="true">
          {CROPS.map((p, i) => (
            <motion.span key={p.id} className="block h-[2px] rounded-full" animate={{ width: i === active ? 22 : 6, backgroundColor: i === active ? "#F2EFE5" : "rgba(169,185,162,0.35)" }} transition={SPRING} />
          ))}
        </div>
        <button type="button" onClick={next} aria-label="Next microgreen" className="grid h-12 w-12 place-items-center rounded-full border border-sage/30 text-cream active:bg-cream active:text-night">
          <ArrowRight size={16} strokeWidth={1.4} />
        </button>
      </div>
    </div>
  );
}

/* ──────────────────────────────────────────────────────────────
   04 — HOW WE GROW (10-stage method, crop-specific ranges)
   ────────────────────────────────────────────────────────────── */

function useAnimatedNumber(target, reduce) {
  const [v, setV] = useState(target);
  const cur = useRef(target);
  useEffect(() => {
    if (reduce) {
      cur.current = target;
      setV(target);
      return;
    }
    const c = animate(cur.current, target, {
      type: "spring",
      stiffness: 40,
      damping: 16,
      onUpdate: (x) => {
        cur.current = x;
        setV(x);
      },
    });
    return () => c.stop();
  }, [target, reduce]);
  return v;
}

const STAGE_LIGHT = {
  seed: "radial-gradient(ellipse 70% 60% at 50% 100%, rgba(146,119,90,0.34), transparent 70%)",
  soak: "radial-gradient(ellipse 70% 60% at 50% 95%, rgba(169,185,162,0.22), transparent 70%)",
  sow: "radial-gradient(ellipse 70% 60% at 50% 100%, rgba(146,119,90,0.28), transparent 70%)",
  germinate: "radial-gradient(ellipse 70% 60% at 50% 90%, rgba(47,112,74,0.32), transparent 70%)",
  blackout: "none",
  light: "radial-gradient(ellipse 80% 70% at 50% 0%, rgba(242,239,229,0.3), transparent 70%)",
  grow: "radial-gradient(ellipse 80% 70% at 50% 10%, rgba(110,143,107,0.38), transparent 70%)",
  harvest: "radial-gradient(ellipse 80% 70% at 50% 0%, rgba(242,239,229,0.2), transparent 70%)",
  pack: "radial-gradient(ellipse 80% 70% at 50% 40%, rgba(181,154,101,0.2), transparent 70%)",
  deliver: "radial-gradient(ellipse 80% 70% at 50% 40%, rgba(181,154,101,0.14), transparent 70%)",
};

function stageValue(stage, crop) {
  if (stage.specFixed) return stage.specFixed;
  if (!crop.spec) return crop.specNote;
  return crop.spec[stage.specKey] || "—";
}

function PackLabel({ crop }) {
  return (
    <motion.div
      initial={{ y: 40, opacity: 0, rotate: -4 }}
      animate={{ y: 0, opacity: 1, rotate: -2 }}
      exit={{ y: 30, opacity: 0, rotate: -5 }}
      transition={SPRING}
      className="absolute left-[calc(50%-min(39%,150px))] top-[16%] w-[min(78%,300px)] bg-ivory p-5 text-deep shadow-[0_30px_60px_-20px_rgba(0,0,0,0.6)]"
      style={{ borderRadius: 3 }}
    >
      <div className="flex items-center justify-between border-b border-deep/15 pb-3">
        <span className="font-display text-2xl italic">Florenza</span>
        <span className="h-3 w-3 rounded-full bg-gold" aria-hidden="true" />
      </div>
      <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.22em]">{crop.name} microgreens</p>
      <dl className="mt-3 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1.5 text-[11px]">
        {["Net weight", "Harvest date", "Batch", "Storage"].map((k) => (
          <React.Fragment key={k}>
            <dt className="text-deep/60">{k}</dt>
            <dd className="border-b border-dotted border-deep/30">{k === "Batch" ? "FLR-" : " "}</dd>
          </React.Fragment>
        ))}
      </dl>
      <p className="mt-3 text-[10px] tracking-wide text-deep/60">
        {BRAND.phone} · {BRAND.location}
      </p>
    </motion.div>
  );
}

function FlorenzaMethod() {
  const [stage, setStage] = useState(7);
  const [cropId, setCropId] = useState("broccoli");
  const reduce = useReducedMotion();
  const s = STAGES[stage];
  const crop = cropById(cropId);
  const growth = useAnimatedNumber(s.growth, reduce);
  const soaked = s.id === "soak" && !(crop.spec && /^no|not required/i.test(crop.spec.soak));
  const packed = s.id === "pack" || s.id === "deliver";

  return (
    <section id="method" className="relative overflow-hidden bg-night" aria-labelledby="method-title">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "linear-gradient(#A9B9A2 1px, transparent 1px), linear-gradient(90deg, #A9B9A2 1px, transparent 1px)", backgroundSize: "64px 64px", maskImage: "radial-gradient(ellipse 70% 70% at 50% 50%, black, transparent)", WebkitMaskImage: "radial-gradient(ellipse 70% 70% at 50% 50%, black, transparent)" }} />

      <div className="relative mx-auto max-w-[1320px] px-5 py-28 sm:px-8 md:py-40">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-7 md:col-start-2">
            <SectionMark n="04" label="How we grow" />
            <h2 id="method-title" className="mt-8 font-display font-light leading-[0.95] tracking-[-0.015em] text-cream" style={{ fontSize: "clamp(2.8rem, 6.6vw, 6.6rem)", textWrap: "balance" }}>
              <MaskLine>Where horticulture</MaskLine>
              <MaskLine delay={0.1}>
                <em className="italic text-sage">meets precision.</em>
              </MaskLine>
            </h2>
          </div>
          <div className="self-end md:col-span-3">
            <p className="text-sm leading-relaxed text-sage/80">Ten stages from seed to your door. Soaking and blackout differ from crop to crop, so choose one to see its starting ranges.</p>
          </div>
        </div>

        <div className="mt-14 md:ml-[8.33%]">
          <Meta className="text-sage/60">Showing ranges for</Meta>
          <div className="no-scrollbar -mx-5 mt-3 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:px-0" role="group" aria-label="Choose a crop">
            {CROPS.map((c) => (
              <Chip key={c.id} selected={c.id === cropId} onClick={() => setCropId(c.id)}>
                {c.name}
              </Chip>
            ))}
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="min-w-0 lg:col-span-4 lg:col-start-2">
            <ol className="no-scrollbar relative flex gap-1 overflow-x-auto pb-2 lg:flex-col lg:gap-0 lg:overflow-visible lg:border-l lg:border-sage/20 lg:pb-0" role="tablist" aria-label="Growing stages">
              {STAGES.map((st, i) => {
                const on = i === stage;
                return (
                  <li key={st.id} className="relative shrink-0">
                    {on && <motion.span layoutId="stage-ind" className="absolute -left-px top-0 hidden h-full w-[2px] bg-cream lg:block" transition={SPRING} />}
                    {on && <motion.span layoutId="stage-ind-m" className="absolute inset-x-0 bottom-0 h-[2px] bg-cream lg:hidden" transition={SPRING} />}
                    <button type="button" role="tab" aria-selected={on} aria-controls="stage-panel" onClick={() => setStage(i)} onMouseEnter={() => setStage(i)} onFocus={() => setStage(i)} className="group flex w-full items-baseline gap-4 px-3 py-3 text-left lg:py-[0.55rem] lg:pl-7">
                      <Meta className={`tabular-nums transition-colors ${on ? "text-cream" : "text-sage/40"}`}>{pad(i + 1)}</Meta>
                      <span className={`font-display text-2xl font-light transition-all duration-700 lg:text-[2.1rem] lg:leading-none ${on ? "translate-x-1 text-cream" : "text-sage/45 group-hover:text-sage"}`}>{st.name}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>

          <div className="min-w-0 lg:col-span-6">
            <div className="relative aspect-[5/4] w-full overflow-hidden border border-sage/15 bg-deep/60" style={{ borderRadius: 4 }}>
              {STAGES.map((st, i) => (
                <motion.div key={st.id} aria-hidden="true" className="absolute inset-0" initial={false} animate={{ opacity: i === stage ? 1 : 0 }} transition={{ duration: 1.2, ease: EASE }} style={{ background: STAGE_LIGHT[st.id] }} />
              ))}
              <motion.div aria-hidden="true" className="absolute inset-0 bg-[#020805]" initial={false} animate={{ opacity: s.id === "blackout" ? 0.6 : 0 }} transition={{ duration: 1, ease: EASE }} />

              <div aria-hidden="true" className="absolute inset-y-6 left-4 flex flex-col justify-between">
                {Array.from({ length: 11 }).map((_, i) => (
                  <span key={i} className={`block h-px bg-sage/40 ${i % 5 === 0 ? "w-3" : "w-1.5"}`} />
                ))}
              </div>
              <div aria-hidden="true" className="absolute inset-x-8 bottom-4 flex justify-between">
                {Array.from({ length: 17 }).map((_, i) => (
                  <span key={i} className={`block w-px bg-sage/40 ${i % 4 === 0 ? "h-3" : "h-1.5"}`} />
                ))}
              </div>
              <div className="absolute left-8 top-5 z-10 flex items-center gap-3">
                <Meta className="tabular-nums text-sage/70">Stage {pad(stage + 1)}</Meta>
                <span className="h-px w-6 bg-sage/30" />
                <AnimatePresence mode="wait">
                  <motion.span key={s.id} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 6 }} className="meta text-cream">
                    {s.name}
                  </motion.span>
                </AnimatePresence>
              </div>
              <div className="absolute right-6 top-5 z-10 hidden text-right sm:block">
                <Meta className="text-sage/60">{crop.name}</Meta>
                <div className="mt-2 h-px w-24 bg-sage/20">
                  <motion.div className="h-full origin-left bg-cream" animate={{ scaleX: (stage + 1) / STAGES.length }} transition={SOFT} />
                </div>
              </div>

              <AnimatePresence>
                {soaked && (
                  <motion.svg key="soak" aria-hidden="true" viewBox="0 0 400 60" preserveAspectRatio="none" className="absolute inset-x-[10%] top-[74%] h-[12%] w-[80%]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    {[0, 1, 2].map((r) => (
                      <path key={r} className="ripple" style={{ animationDelay: `${r * 0.8}s` }} d={`M0 ${16 + r * 14} Q 50 ${8 + r * 14} 100 ${16 + r * 14} T 200 ${16 + r * 14} T 300 ${16 + r * 14} T 400 ${16 + r * 14}`} stroke="rgba(221,228,216,0.5)" strokeWidth="1" fill="none" vectorEffect="non-scaling-stroke" />
                    ))}
                  </motion.svg>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {s.id === "grow" && (
                  <motion.div key="air" aria-hidden="true" className="absolute inset-x-0 top-[22%] h-[40%]" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                    {[0, 1, 2, 3].map((r) => (
                      <span key={r} className="airflow absolute left-0 h-px w-24" style={{ top: `${r * 28}%`, animationDelay: `${r * 0.7}s`, background: "linear-gradient(90deg, transparent, rgba(242,239,229,0.5), transparent)" }} />
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div className="absolute inset-x-[12%] bottom-[2%] top-[8%]" animate={{ opacity: packed ? 0.3 : 1, filter: packed ? "blur(2px)" : "blur(0px)" }} transition={{ duration: 0.8 }}>
                <Specimen varieties={[crop.id]} seed={crop.seed + 5} count={13} growth={growth} swell={soaked ? 1 : 0} blanch={s.id === "blackout"} detail={stage >= 5} sway={stage >= 5} className="h-full w-full" label={`${crop.name} microgreens at the ${s.name.toLowerCase()} stage`} />
              </motion.div>

              <AnimatePresence>
                {s.id === "harvest" && (
                  <motion.div aria-hidden="true" initial={{ scaleX: 0, opacity: 0 }} animate={{ scaleX: 1, opacity: 1 }} exit={{ scaleX: 0, opacity: 0 }} transition={{ duration: 1, ease: EASE, delay: 0.3 }} className="absolute inset-x-[10%] top-[78%] origin-left">
                    <div className="h-px w-full" style={{ backgroundImage: "linear-gradient(90deg, #F2EFE5 50%, transparent 50%)", backgroundSize: "10px 1px" }} />
                    <Meta className="mt-2 block text-right text-cream/70">Harvest line</Meta>
                  </motion.div>
                )}
              </AnimatePresence>
              <AnimatePresence>{packed && <PackLabel key="label" crop={crop} />}</AnimatePresence>
            </div>

            <div className="mt-8" id="stage-panel" role="tabpanel" aria-live="polite">
              <AnimatePresence mode="wait">
                <motion.div key={`${s.id}-${crop.id}`} initial={{ opacity: 0, y: 14, filter: "blur(6px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0, y: -8, filter: "blur(4px)" }} transition={{ duration: 0.55, ease: EASE }} className="grid gap-6 sm:grid-cols-[1.2fr_1fr]">
                  <div className="min-w-0">
                    <p className="font-display text-[2rem] italic leading-tight text-cream">{s.name}</p>
                    <p className="mt-3 max-w-[40ch] text-[15px] leading-relaxed text-sage/85">{s.line}</p>
                  </div>
                  <div className="min-w-0 border-l border-sage/20 pl-5">
                    <Meta className="text-sage/55">
                      {s.specLabel}
                      {!s.specFixed ? ` · ${crop.name}` : ""}
                    </Meta>
                    <p className="mt-2 font-display text-[1.7rem] leading-tight text-cream tabular-nums">{stageValue(s, crop)}</p>
                    {!s.specFixed && crop.spec && <p className="mt-2 text-[12px] text-sage/55">Starting range, not a guarantee.</p>}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────
   05 — THE FLORENZA GUIDE (light, educational)
   ────────────────────────────────────────────────────────────── */

function DailyCare() {
  const [when, setWhen] = useState("morning");
  const [done, setDone] = useState({});
  const list = GUIDE.care[when];
  const count = list.filter((t) => done[`${when}:${t}`]).length;
  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex border border-deep/20 p-1" style={{ borderRadius: 999 }} role="group" aria-label="Time of day">
          {[
            ["morning", "Every morning", Sun],
            ["evening", "Every evening", Moon],
          ].map(([v, l, Icon]) => (
            <button key={v} type="button" onClick={() => setWhen(v)} aria-pressed={when === v} className="relative flex items-center gap-2 px-4 py-2">
              {when === v && <motion.span layoutId="care-when" className="absolute inset-0 bg-night" style={{ borderRadius: 999 }} transition={SPRING} />}
              <Icon size={13} strokeWidth={1.5} className={`relative ${when === v ? "text-ivory" : "text-deep/70"}`} />
              <span className={`meta relative ${when === v ? "text-ivory" : "text-deep/70"}`}>{l}</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-4">
          <Meta className="tabular-nums text-deep/70">
            {count} / {list.length} checked
          </Meta>
          {count > 0 && (
            <button type="button" onClick={() => setDone((d) => Object.fromEntries(Object.entries(d).filter(([k]) => !k.startsWith(`${when}:`))))} className="meta text-emerald underline underline-offset-4">
              Reset
            </button>
          )}
        </div>
      </div>
      <div className="mt-4 h-px w-full bg-deep/10">
        <motion.div className="h-full origin-left bg-emerald" animate={{ scaleX: count / list.length }} transition={SOFT} />
      </div>
      <AnimatePresence mode="wait">
        <motion.ul key={when} className="mt-2" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.35, ease: EASE }}>
          {list.map((t) => {
            const k = `${when}:${t}`;
            const on = !!done[k];
            return (
              <li key={t} className="border-b border-deep/10">
                <label className="flex cursor-pointer items-center gap-4 py-3.5">
                  <input type="checkbox" className="peer sr-only" checked={on} onChange={() => setDone((d) => ({ ...d, [k]: !d[k] }))} />
                  <span className={`grid h-6 w-6 shrink-0 place-items-center border transition-colors peer-focus-visible:outline peer-focus-visible:outline-1 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-emerald ${on ? "border-emerald bg-emerald text-ivory" : "border-deep/30"}`} style={{ borderRadius: 3 }}>
                    <AnimatePresence>
                      {on && (
                        <motion.span initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }} transition={SPRING}>
                          <Check size={13} strokeWidth={2} />
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </span>
                  <span className={`font-display text-[1.35rem] leading-tight transition-colors ${on ? "text-deep/40 line-through decoration-deep/30" : "text-night"}`}>{t}</span>
                </label>
              </li>
            );
          })}
        </motion.ul>
      </AnimatePresence>
    </div>
  );
}

function PostHarvest() {
  const [step, setStep] = useState(0);
  const seq = GUIDE.post.sequence;
  return (
    <div className="grid gap-12 lg:grid-cols-2">
      <div className="min-w-0">
        <Meta className="text-deep/60">Immediately after harvest</Meta>
        <ol className="mt-5 flex flex-wrap items-center gap-y-3">
          {seq.map((st, i) => (
            <li key={st} className="flex items-center">
              <button type="button" onClick={() => setStep(i)} aria-pressed={step === i} className={`relative px-2.5 py-1.5 font-display text-[1.35rem] transition-colors ${i <= step ? "text-night" : "text-deep/35 hover:text-deep/70"}`}>
                {st}
                {step === i && <motion.span layoutId="post-step" className="absolute inset-x-2 bottom-0 h-px bg-night" transition={SPRING} />}
              </button>
              {i < seq.length - 1 && <ArrowRight size={13} strokeWidth={1.3} className={i < step ? "text-deep" : "text-deep/25"} aria-hidden="true" />}
            </li>
          ))}
        </ol>
        <ul className="mt-8 grid gap-x-6 sm:grid-cols-2">
          {GUIDE.post.important.map((t) => (
            <li key={t} className="flex items-baseline gap-3 border-b border-deep/10 py-3 text-[15px] text-deep">
              <span className="h-1.5 w-1.5 shrink-0 -translate-y-0.5 rounded-full bg-gold" aria-hidden="true" />
              {t}
            </li>
          ))}
        </ul>
        <div className="mt-10 border-l-2 border-gold pl-5">
          <Meta className="text-deep/60">Storage</Meta>
          <p className="mt-2 max-w-[46ch] font-display text-[1.45rem] leading-snug text-night">{GUIDE.post.storage}</p>
          <p className="mt-4 text-[13px] leading-relaxed text-deep/70">Quality is influenced by {GUIDE.post.storageFactors.join(", ").toLowerCase()}.</p>
        </div>
      </div>
      <div className="min-w-0">
        <Meta className="text-deep/60">Traceability — every batch carries a record</Meta>
        <ul className="mt-5 flex flex-wrap gap-2">
          {GUIDE.post.records.map((r, i) => (
            <motion.li key={r} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.025, duration: 0.5, ease: EASE }} className="border border-deep/15 bg-ivory/70 px-3 py-1.5 text-[13px] text-deep" style={{ borderRadius: 999 }}>
              {r}
            </motion.li>
          ))}
        </ul>
        <p className="mt-6 max-w-[44ch] text-[14px] leading-relaxed text-deep/70">This information becomes FLORENZA's own scientific production database.</p>
      </div>
    </div>
  );
}

const GUIDE_TABS = [
  { value: "space", label: "Growing space" },
  { value: "care", label: "Daily care" },
  { value: "harvest", label: "Harvesting" },
  { value: "post", label: "After harvest" },
  { value: "trouble", label: "Troubleshooting" },
];

function FlorenzaGuide() {
  const [tab, setTab] = useState("space");
  return (
    <section id="guide" className="relative overflow-hidden bg-mist text-deep" aria-labelledby="guide-title">
      <div aria-hidden="true" className="h-40" style={{ background: "linear-gradient(180deg, #071A12 0%, #2F704A 45%, #A9B9A2 78%, #DDE4D8 100%)" }} />
      <Frond fill="rgba(23,79,53,0.1)" outline className="pointer-events-none absolute -right-16 top-40 h-[80%] w-auto rotate-[8deg]" />
      <div className="relative mx-auto max-w-[1320px] px-5 pb-28 pt-10 sm:px-8 md:pb-36">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-8 md:col-start-2">
            <SectionMark n="05" label="The Florenza Guide" tone="dark" />
            <h2 id="guide-title" className="mt-8 font-display font-light leading-[0.95] tracking-[-0.015em] text-night" style={{ fontSize: "clamp(2.6rem, 6vw, 6rem)" }}>
              <MaskLine>Observe. Identify.</MaskLine>
              <MaskLine delay={0.1}>
                <em className="italic text-emerald">Adjust. Record.</em>
              </MaskLine>
            </h2>
          </div>
        </div>

        <div className="mt-14 md:mx-[8.33%]">
          <div className="-mx-5 border-b border-deep/15 px-5 sm:mx-0 sm:px-0">
            <TabStrip id="guide" tone="dark" value={tab} onChange={setTab} items={GUIDE_TABS} size="display" />
          </div>
          <div className="mt-10 min-h-[380px]" role="tabpanel">
            <AnimatePresence mode="wait">
              <motion.div key={tab} initial={{ opacity: 0, y: 18, filter: "blur(6px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0, y: -10, filter: "blur(4px)" }} transition={{ duration: 0.55, ease: EASE }}>
                {tab === "space" && (
                  <div className="grid gap-12 lg:grid-cols-[1.4fr_1fr]">
                    <div className="min-w-0">
                      <Meta className="text-deep/60">The Florenza growing environment</Meta>
                      <p className="mt-5 font-display text-[clamp(1.9rem,3.6vw,3.2rem)] font-light leading-[1.12] text-night">
                        {GUIDE.space.pillars.map((p, i) => (
                          <React.Fragment key={p}>
                            <span className={i % 2 ? "italic text-emerald" : ""}>{p}</span>
                            {i < GUIDE.space.pillars.length - 1 && <> <span className="text-gold">+</span> </>}
                          </React.Fragment>
                        ))}
                      </p>
                    </div>
                    <div className="min-w-0">
                      <Meta className="text-deep/60">We avoid</Meta>
                      <ul className="mt-4">
                        {GUIDE.space.avoid.map((a) => (
                          <li key={a} className="flex items-center gap-3 border-b border-deep/10 py-2.5 text-[15px] text-deep">
                            <X size={13} strokeWidth={1.5} className="shrink-0 text-earth" aria-hidden="true" />
                            {a}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
                {tab === "care" && (
                  <div className="grid gap-12 lg:grid-cols-[1fr_1.3fr]">
                    <div className="min-w-0">
                      <p className="max-w-[22ch] font-display text-[clamp(1.8rem,3vw,2.6rem)] font-light leading-[1.15] text-night">
                        A morning round and an <em className="italic text-emerald">evening round.</em>
                      </p>
                      <p className="mt-5 max-w-[38ch] text-[15px] leading-relaxed text-deep/70">The daily care routine. Tick the items to walk through each round.</p>
                    </div>
                    <div className="min-w-0">
                      <DailyCare />
                    </div>
                  </div>
                )}
                {tab === "harvest" && (
                  <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
                    <div className="min-w-0">
                      <Meta className="text-deep/60">The golden rule</Meta>
                      <p className="mt-5 max-w-[22ch] font-display text-[clamp(2rem,3.6vw,3.2rem)] font-light italic leading-[1.1] text-night">{GUIDE.harvest.rule}</p>
                    </div>
                    <div className="min-w-0">
                      <Meta className="text-deep/60">When is a microgreen ready? Look for</Meta>
                      <ul className="mt-4">
                        {GUIDE.harvest.signs.map((t, i) => (
                          <motion.li key={t} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05, duration: 0.5, ease: EASE }} className="flex items-center gap-4 border-b border-deep/10 py-3">
                            <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-emerald text-ivory">
                              <Check size={12} strokeWidth={2} />
                            </span>
                            <span className="font-display text-[1.3rem] text-night">{t}</span>
                          </motion.li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}
                {tab === "post" && <PostHarvest />}
                {tab === "trouble" && (
                  <div className="grid gap-12 lg:grid-cols-[1fr_1.5fr]">
                    <div className="min-w-0">
                      <Meta className="text-deep/60">The Florenza method</Meta>
                      <ol className="mt-5 flex flex-col gap-1">
                        {GUIDE.method.map((m, i) => (
                          <li key={m} className="flex items-baseline gap-4">
                            <Meta className="tabular-nums text-deep/40">{pad(i + 1)}</Meta>
                            <span className={`font-display text-[clamp(1.8rem,3vw,2.6rem)] font-light leading-tight ${i % 2 ? "italic text-emerald" : "text-night"}`}>{m}</span>
                          </li>
                        ))}
                      </ol>
                    </div>
                    <div className="min-w-0 border-t border-deep/15">
                      {GUIDE.trouble.map((t, i) => (
                        <Accordion key={t.problem} tone="dark" title={t.problem} meta={pad(i + 1)}>
                          <Meta className="text-deep/55">Possible reason</Meta>
                          <p className="mt-1.5 text-[15px] text-deep">{t.reason}</p>
                        </Accordion>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
      <div aria-hidden="true" className="h-32" style={{ background: "linear-gradient(180deg, #DDE4D8 0%, #6E8F6B 45%, #0D2B1E 85%, #071A12 100%)" }} />
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────
   06 — NUTRITION & SCIENCE
   ────────────────────────────────────────────────────────────── */

function NatureScienceBridge() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 80%", "end 60%"] });
  const draw = useTransform(scrollYProgress, [0, 0.8], [0, 1]);
  const frond = useTransform(scrollYProgress, [0, 0.7], [0, 1]);
  const rot = useTransform(scrollYProgress, [0, 1], [-40, 40]);
  return (
    <div ref={ref} className="relative py-10 md:py-16">
      <svg aria-hidden="true" viewBox="0 0 1200 200" preserveAspectRatio="none" className="pointer-events-none absolute inset-x-0 top-1/2 hidden h-[200px] w-full -translate-y-1/2 lg:block">
        <defs>
          <linearGradient id="bridge" x1="0" x2="1">
            <stop offset="0" stopColor="#6E8F6B" />
            <stop offset="0.5" stopColor="#F2EFE5" />
            <stop offset="1" stopColor="#A9B9A2" />
          </linearGradient>
        </defs>
        <motion.path d="M0 110 C 90 40, 170 180, 260 100 S 420 40, 520 100 L 680 100 L 740 60 L 860 60 L 900 100 L 1200 100" stroke="url(#bridge)" strokeWidth="1" fill="none" vectorEffect="non-scaling-stroke" style={{ pathLength: draw }} />
      </svg>
      <div className="relative grid items-center gap-16 lg:grid-cols-3 lg:gap-6">
        <div className="relative hidden flex-col items-center lg:flex lg:items-start">
          <Frond fill="#6E8F6B" outline draw={frond} className="h-[300px] w-auto opacity-80 md:h-[380px]" />
          <p className="absolute bottom-6 left-1/2 -translate-x-1/2 font-display text-[clamp(3.4rem,6vw,6rem)] font-light italic leading-none text-cream lg:left-6 lg:translate-x-0">Nature</p>
        </div>
        <div className="relative z-10 flex flex-col items-center text-center">
          <Reveal>
            <Badge size={112} />
          </Reveal>
          <p className="mt-8 flex items-center gap-3 font-display text-2xl text-cream lg:hidden" aria-hidden="true">
            <em className="italic">Nature</em>
            <span className="h-px w-8 bg-sage/50" />
            <span className="text-[13px] font-extralight uppercase tracking-[0.4em]">Science</span>
          </p>
          <Reveal delay={0.1}>
            <Meta className="mt-8 block text-sage">The Florenza philosophy</Meta>
          </Reveal>
          <Reveal delay={0.2}>
            <blockquote className="mt-5 max-w-[19ch] bg-night/60 font-display text-[clamp(1.7rem,2.6vw,2.4rem)] italic leading-[1.2] text-cream" style={{ textWrap: "balance" }}>
              “{BRAND.philosophy}”
            </blockquote>
          </Reveal>
        </div>
        <div className="relative hidden flex-col items-center lg:flex lg:items-end">
          <motion.svg aria-hidden="true" viewBox="0 0 300 300" className="h-[280px] w-[280px] md:h-[340px] md:w-[340px]" style={{ rotate: rot }}>
            <rect x="40" y="40" width="220" height="220" fill="none" stroke="rgba(169,185,162,0.35)" strokeWidth="0.8" />
            <rect x="75" y="75" width="150" height="150" fill="none" stroke="rgba(169,185,162,0.25)" strokeWidth="0.8" transform="rotate(45 150 150)" />
            <circle cx="150" cy="150" r="110" fill="none" stroke="rgba(169,185,162,0.22)" strokeWidth="0.8" />
            <circle cx="150" cy="150" r="3" fill="#F2EFE5" />
            <line x1="0" y1="150" x2="300" y2="150" stroke="rgba(169,185,162,0.3)" strokeWidth="0.6" />
            <line x1="150" y1="0" x2="150" y2="300" stroke="rgba(169,185,162,0.3)" strokeWidth="0.6" />
            {Array.from({ length: 24 }).map((_, i) => (
              <line key={i} x1="150" y1="36" x2="150" y2={i % 6 === 0 ? 48 : 42} stroke="rgba(242,239,229,0.5)" strokeWidth="0.6" transform={`rotate(${i * 15} 150 150)`} />
            ))}
          </motion.svg>
          <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[clamp(1.4rem,2.4vw,2.2rem)] font-extralight uppercase tracking-[0.5em] text-cream lg:left-auto lg:right-0 lg:translate-x-0">Science</p>
        </div>
      </div>
    </div>
  );
}

function NutrientExplorer() {
  const { showCrop } = useFlorenza();
  const cats = Object.keys(NUTRIENTS);
  const [cat, setCat] = useState(cats[0]);
  const [item, setItem] = useState(NUTRIENTS[cats[0]].items[0].name);
  const group = NUTRIENTS[cat];
  const sel = group.items.find((i) => i.name === item) || group.items[0];
  const crops = cat === "Minerals" ? group.generalCrops : sel.crops;

  const changeCat = (c) => {
    setCat(c);
    setItem(NUTRIENTS[c].items[0].name);
  };

  return (
    <div className="grid gap-12 lg:grid-cols-12">
      <div className="min-w-0 lg:col-span-6">
        <TabStrip id="nutri" value={cat} onChange={changeCat} items={cats.map((c) => ({ value: c, label: c }))} size="display" />
        <AnimatePresence mode="wait">
          <motion.div key={cat} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.45, ease: EASE }}>
            <p className="mt-6 text-[14px] text-sage/75">{group.note}</p>
            <ul className="mt-6 flex flex-col">
              {group.items.map((it) => {
                const on = it.name === sel.name;
                return (
                  <li key={it.name}>
                    <button type="button" aria-pressed={on} onClick={() => setItem(it.name)} onMouseEnter={() => setItem(it.name)} className="group flex w-full items-center gap-4 border-b border-sage/15 py-3 text-left">
                      <motion.span className="block h-px shrink-0 bg-cream" initial={false} animate={{ width: on ? 28 : 0 }} transition={SPRING} />
                      <span className={`font-display text-[clamp(1.5rem,2.4vw,2.1rem)] font-light leading-tight transition-colors ${on ? "text-cream" : "text-sage/50 group-hover:text-sage"}`}>{it.name}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="min-w-0 lg:col-span-5 lg:col-start-8">
        <div className="lg:sticky lg:top-32" aria-live="polite">
          <AnimatePresence mode="wait">
            <motion.div key={`${cat}-${sel.name}`} initial={{ opacity: 0, y: 14, filter: "blur(6px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.5, ease: EASE }}>
              <Meta className="text-sage/60">{cat === "Minerals" ? "Crop profiles noting minerals" : "Noted in Florenza crop profiles"}</Meta>
              <p className="mt-3 font-display text-[clamp(2.2rem,3.6vw,3.2rem)] font-light leading-none text-cream">{sel.name}</p>
              {crops.length > 0 ? (
                <ul className="mt-6 flex flex-wrap gap-2">
                  {crops.map((id) => (
                    <li key={id}>
                      <Chip onClick={() => showCrop(id)} aria-label={`View the ${cropById(id).name} profile`}>
                        {cropById(id).name}
                        <ArrowRight size={12} strokeWidth={1.4} />
                      </Chip>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-6 max-w-[40ch] text-[14px] leading-relaxed text-sage/80">Microgreens may contain this depending on species. It isn't listed against a specific Florenza crop profile.</p>
              )}
              <div className="mt-10 border-t border-sage/15 pt-6">
                <Meta className="text-sage/60">Composition depends on</Meta>
                <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
                  {NUTRITION_FACTORS.map((f) => (
                    <li key={f} className="text-[14px] text-mist/80">
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function NutritionScience() {
  return (
    <section id="science" className="relative overflow-hidden bg-night" aria-labelledby="science-title">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0" style={{ background: "linear-gradient(90deg, #0D2B1E 0%, #071A12 50%, #06140E 100%)" }} />
      <div className="relative mx-auto max-w-[1320px] px-5 pb-28 pt-16 sm:px-8 md:pb-36">
        <NatureScienceBridge />

        <div className="mt-20 grid gap-10 md:grid-cols-12">
          <div className="md:col-span-8 md:col-start-2">
            <SectionMark n="06" label="Nutrition & Science" />
            <h2 id="science-title" className="mt-8 font-display font-light leading-[0.95] tracking-[-0.015em] text-cream" style={{ fontSize: "clamp(2.6rem, 6vw, 6rem)" }}>
              <MaskLine>Small plants.</MaskLine>
              <MaskLine delay={0.1}>
                <em className="italic text-sage">Remarkable diversity.</em>
              </MaskLine>
            </h2>
            <p className="mt-8 max-w-[58ch] text-[15px] leading-relaxed text-sage/85">
              Research has shown that microgreens can contain substantial concentrations of certain nutrients and phytochemicals relative to their mature counterparts in some species. That doesn't make every microgreen more nutritious than every mature vegetable: concentration varies significantly between species and growing conditions.
            </p>
          </div>
        </div>

        <div className="mt-16 md:ml-[8.33%]">
          <NutrientExplorer />
        </div>

        <div className="mt-24 grid gap-12 md:grid-cols-12">
          <Reveal className="min-w-0 md:col-span-5 md:col-start-2">
            <Meta className="text-sage">Research interest · Brassica microgreens</Meta>
            <p className="mt-5 font-display text-[clamp(1.4rem,2vw,1.8rem)] leading-[1.35] text-mist">{RESEARCH_NOTE}</p>
          </Reveal>
          <div className="min-w-0 md:col-span-5 md:col-start-8">
            <Meta className="text-sage">Nutrition &amp; health research</Meta>
            <div className="mt-4 border-t border-sage/20">
              {HEALTH.map((h, i) => (
                <Accordion key={h.area} title={h.area} meta={pad(i + 1)}>
                  <dl className="grid gap-4">
                    <div>
                      <dt>
                        <Meta className="text-sage/55">Nutritional relevance</Meta>
                      </dt>
                      <dd className="mt-1.5 text-[14px] leading-relaxed text-mist/85">{h.relevance}</dd>
                    </div>
                    <div>
                      <dt>
                        <Meta className="text-sage/55">How Florenza describes it</Meta>
                      </dt>
                      <dd className="mt-1.5 font-display text-[1.25rem] italic leading-snug text-cream">“{h.wording}”</dd>
                    </div>
                  </dl>
                </Accordion>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-20 grid gap-10 md:grid-cols-12">
          <div className="min-w-0 md:col-span-10 md:col-start-2">
            <div className="relative border border-gold/50 px-6 py-7 md:px-10 md:py-9" style={{ borderRadius: 3 }}>
              <span className="absolute -top-3 left-6 bg-night px-3 md:left-10">
                <Meta className="text-gold">Important</Meta>
              </span>
              <p className="max-w-[70ch] font-display text-[clamp(1.25rem,1.8vw,1.6rem)] leading-[1.4] text-cream">{BRAND.disclaimer}</p>
            </div>
            <div className="mt-6 border-t border-sage/15">
              <Accordion title="Science & references">
                <ul className="grid gap-2">
                  {SOURCES.map((src) => (
                    <li key={src} className="text-[14px] leading-relaxed text-sage/85">
                      {src}
                    </li>
                  ))}
                </ul>
                <p className="mt-4 text-[13px] text-sage/65">For every nutritional number Florenza publishes, the aim is to cite crop, cultivar, growing conditions, source and analytical method.</p>
              </Accordion>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────
   07 — RECIPES
   ────────────────────────────────────────────────────────────── */

function Recipes() {
  const { showCrop } = useFlorenza();
  const [filter, setFilter] = useState("All");
  const list = RECIPES.filter((r) => filter === "All" || r.cuisine === filter);
  const [sel, setSel] = useState("chaat");
  const recipe = list.find((r) => r.id === sel) || list[0];
  const named = recipe.crops;
  const listing = cropsListingDish(recipe);
  const drawn = named.length ? named : ["broccoli", "radish", "pea", "sunflower"];
  const detailRef = useRef(null);
  const wide = useMedia("(min-width: 1024px)");

  const pick = (id) => {
    setSel(id);
    if (!wide) setTimeout(() => detailRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 60);
  };

  const ChipRow = ({ label, ids }) => (
    <div>
      <Meta className="text-sage/55">{label}</Meta>
      <div className="mt-2 flex flex-wrap gap-2">
        {ids.map((id) => (
          <Chip key={id} onClick={() => showCrop(id)} aria-label={`View the ${cropById(id).name} profile`}>
            {cropById(id).name} <ArrowRight size={12} strokeWidth={1.4} />
          </Chip>
        ))}
      </div>
    </div>
  );

  return (
    <section id="recipes" className="relative overflow-hidden" aria-labelledby="recipes-title" style={{ background: "linear-gradient(180deg, #071A12 0%, #0D2B1E 30%, #174F35 100%)" }}>
      <div className="relative mx-auto max-w-[1320px] px-5 py-28 sm:px-8 md:py-36">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-7 md:col-start-2">
            <SectionMark n="07" label="Recipes" />
            <h2 id="recipes-title" className="mt-8 font-display font-light leading-[0.95] tracking-[-0.015em] text-cream" style={{ fontSize: "clamp(2.8rem, 6.4vw, 6.4rem)" }}>
              <MaskLine>From tray</MaskLine>
              <MaskLine delay={0.1}>
                <em className="italic text-sage">to table.</em>
              </MaskLine>
            </h2>
          </div>
          <div className="self-end md:col-span-3">
            <div className="flex border border-sage/25 p-1" style={{ borderRadius: 999 }} role="group" aria-label="Filter by cuisine">
              {["All", "Indian", "International"].map((f) => (
                <button key={f} type="button" onClick={() => setFilter(f)} aria-pressed={filter === f} className="relative flex-1 px-3 py-2">
                  {filter === f && <motion.span layoutId="rec-filter" className="absolute inset-0 bg-cream" style={{ borderRadius: 999 }} transition={SPRING} />}
                  <span className={`meta relative ${filter === f ? "text-night" : "text-sage"}`}>{f}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-14 grid gap-12 lg:grid-cols-12">
          <ul className="min-w-0 border-t border-sage/20 lg:col-span-5 lg:col-start-2">
            <AnimatePresence initial={false}>
              {list.map((r) => {
                const on = r.id === recipe.id;
                return (
                  <motion.li key={r.id} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.45, ease: EASE }} className="overflow-hidden border-b border-sage/20">
                    <button type="button" onClick={() => pick(r.id)} onMouseEnter={() => wide && setSel(r.id)} aria-pressed={on} className="group flex w-full items-baseline gap-4 py-4 text-left">
                      <Meta className="w-7 shrink-0 tabular-nums text-sage/45">{pad(RECIPES.indexOf(r) + 1)}</Meta>
                      <span className={`min-w-0 flex-1 font-display text-[clamp(1.45rem,2.2vw,1.95rem)] font-light leading-tight transition-all duration-500 ${on ? "translate-x-1 text-cream" : "text-sage/60 group-hover:text-sage"}`}>{r.name}</span>
                      <Meta className="hidden shrink-0 text-sage/45 sm:inline">{r.cuisine}</Meta>
                    </button>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>

          <div ref={detailRef} className="min-w-0 scroll-mt-28 lg:col-span-5 lg:col-start-8">
            <div className="relative overflow-hidden border border-sage/15 bg-night/40 p-6 md:p-8" style={{ borderRadius: 4 }} aria-live="polite">
              <AnimatePresence mode="wait">
                <motion.div key={recipe.id} initial={{ opacity: 0, y: 16, filter: "blur(6px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} exit={{ opacity: 0, y: -10, filter: "blur(4px)" }} transition={{ duration: 0.5, ease: EASE }}>
                  <div className="flex items-center justify-between">
                    <Meta className="text-sage/60">{recipe.cuisine} cuisine</Meta>
                    <Meta className="tabular-nums text-sage/40">
                      {pad(RECIPES.indexOf(recipe) + 1)} / {pad(RECIPES.length)}
                    </Meta>
                  </div>
                  <div className="relative mx-auto mt-2 w-[74%]">
                    <div className="absolute inset-x-[4%] bottom-[8%] top-[62%] rounded-[50%] border border-sage/25 bg-deep" style={{ boxShadow: "inset 0 -10px 30px rgba(0,0,0,0.35)" }} aria-hidden="true" />
                    <Specimen varieties={drawn} seed={RECIPES.indexOf(recipe) * 13 + 5} count={12} detail sway ground={false} className="relative h-auto w-full" />
                  </div>
                  <h3 className="-mt-2 font-display text-[clamp(2rem,3vw,2.7rem)] font-light leading-tight text-cream">{recipe.name}</h3>
                  <p className="mt-4 font-display text-[1.2rem] leading-relaxed text-mist">
                    {recipe.parts.map((p, i) => (
                      <React.Fragment key={p}>
                        <span className={/microgreen/i.test(p) ? "italic text-sage-lit" : ""}>{p}</span>
                        {i < recipe.parts.length - 1 && <> <span className="text-gold">+</span> </>}
                      </React.Fragment>
                    ))}
                  </p>
                  {(named.length > 0 || listing.length > 0) && (
                    <div className="mt-6 grid gap-4 border-t border-sage/15 pt-5">
                      {named.length > 0 && <ChipRow label="Microgreens named" ids={named} />}
                      {listing.length > 0 && <ChipRow label="Also suggested in crop profiles" ids={listing} />}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────
   08 — FOUNDER
   ────────────────────────────────────────────────────────────── */

function Founder() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const bigX = useTransform(scrollYProgress, [0, 1], ["8%", "-28%"]);
  const leaves = useTransform(scrollYProgress, [0.02, 0.22], [1, 0]);
  const leavesY = useTransform(scrollYProgress, [0, 0.3], ["0%", "-30%"]);
  const portraitY = useTransform(scrollYProgress, [0.2, 0.8], ["6%", "-6%"]);

  return (
    <section id="founder" ref={ref} className="relative overflow-hidden bg-ivory text-deep" aria-labelledby="founder-title">
      <div aria-hidden="true" className="relative h-[30vh] min-h-[180px]" style={{ background: "linear-gradient(180deg, #174F35 0%, #2F704A 25%, #6E8F6B 58%, #DDE4D8 84%, #FAF9F3 100%)" }}>
        <motion.div style={{ opacity: leaves, y: leavesY }} className="absolute inset-0">
          <BigLeaf fill="#0D2B1E" vein="transparent" className="absolute -left-20 top-0 w-[38vw] min-w-[280px] rotate-[20deg] opacity-70" />
          <BigLeaf fill="#123A28" vein="transparent" className="absolute -right-24 top-[-10%] w-[34vw] min-w-[260px] rotate-[160deg] opacity-60" />
        </motion.div>
      </div>

      <div className="relative mx-auto max-w-[1320px] px-5 pb-28 pt-12 sm:px-8 md:pb-36">
        <motion.p aria-hidden="true" style={{ x: bigX }} className="outline-text pointer-events-none absolute left-0 top-[12%] select-none whitespace-nowrap font-display font-light leading-none md:top-[16%]">
          <span style={{ fontSize: "clamp(8rem, 26vw, 26rem)" }}>Science</span>
        </motion.p>

        <div className="relative grid items-end gap-14 md:grid-cols-12">
          <motion.figure style={{ y: portraitY }} className="relative md:col-span-5 md:col-start-2">
            <div className="absolute -inset-3 border border-deep/15" style={{ borderRadius: "999px 999px 4px 4px" }} aria-hidden="true" />
            <div className="relative aspect-[4/5] w-full overflow-hidden" style={{ borderRadius: "999px 999px 4px 4px", background: "linear-gradient(170deg, #DDE4D8 0%, #A9B9A2 55%, #6E8F6B 100%)" }}>
              <Frond fill="rgba(13,43,30,0.35)" outline className="absolute -right-6 bottom-[-4%] h-[92%] w-auto rotate-[8deg]" />
              <Frond fill="rgba(13,43,30,0.2)" outline className="absolute -left-10 bottom-[-6%] h-[70%] w-auto -rotate-[14deg]" />
              <div className="absolute inset-0 grid place-items-center">
                <span className="font-display text-[clamp(4.5rem,10vw,8rem)] font-light italic tracking-tight text-deep/40">SND</span>
              </div>
              <figcaption className="absolute inset-x-0 bottom-0 flex items-center justify-between px-6 pb-5">
                <Meta className="text-deep/60">Portrait to come</Meta>
                <Meta className="text-deep/60">{BRAND.location}</Meta>
              </figcaption>
            </div>
          </motion.figure>

          <div className="relative min-w-0 md:col-span-5 md:col-start-8 md:pb-6">
            <SectionMark n="08" label="The Founder" tone="dark" />
            <h2 id="founder-title" className="mt-8 font-display font-light leading-[0.92] tracking-[-0.02em] text-night" style={{ fontSize: "clamp(3rem, 5.8vw, 5.6rem)" }}>
              <MaskLine>Sharayu</MaskLine>
              <MaskLine delay={0.1}>
                <em className="italic text-emerald">Nigade Deshmukh</em>
              </MaskLine>
            </h2>
            <Reveal delay={0.15}>
              <div className="mt-7 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-deep/15 pt-5">
                <Meta className="text-emerald/80">Founder, Florenza</Meta>
                <span className="h-px w-6 bg-deep/20" />
                <Meta className="text-deep">{BRAND.location}</Meta>
              </div>
            </Reveal>
            <Reveal delay={0.25}>
              <p className="mt-9 max-w-[32ch] font-display text-[clamp(1.45rem,2.2vw,2rem)] leading-[1.3] text-deep">Florenza focuses on careful cultivation, hygienic handling, freshness and transparent information.</p>
            </Reveal>
            <Reveal delay={0.3}>
              <p className="mt-6 max-w-[40ch] border-l-2 border-gold pl-4 text-[15px] italic leading-relaxed text-deep/80">“{BRAND.philosophy}”</p>
            </Reveal>
          </div>
        </div>

        <ol className="relative mt-24 grid border-y border-deep/15 md:grid-cols-3">
          {BRAND.pillars.map((p, i) => (
            <Reveal as="li" key={p} delay={i * 0.12} className={`flex items-baseline gap-4 py-8 md:px-8 md:first:pl-0 ${i > 0 ? "border-t border-deep/15 md:border-l md:border-t-0" : ""}`}>
              <Meta className="tabular-nums text-earth">{pad(i + 1)}</Meta>
              <span className={`font-display text-[clamp(2rem,3.2vw,2.9rem)] font-light leading-none ${i === 1 ? "italic text-emerald" : "text-night"}`}>{p}</span>
            </Reveal>
          ))}
        </ol>
      </div>
    </section>
  );
}

/* ──────────────────────────────────────────────────────────────
   09 — ORDER FRESH (enquiry composer) + FOOTER
   ────────────────────────────────────────────────────────────── */

function OrderFresh() {
  const { picks, togglePick } = useFlorenza();
  const [name, setName] = useState("");
  const [area, setArea] = useState("");
  const [notes, setNotes] = useState("");
  const [copied, setCopied] = useState("");
  const msgRef = useRef(null);
  const phoneRef = useRef(null);

  const message = useMemo(() => {
    const lines = ["Hello Florenza, I'd like to order fresh microgreens."];
    if (picks.length) lines.push(`Varieties: ${picks.map((id) => cropById(id).name).join(", ")}`);
    if (name.trim()) lines.push(`Name: ${name.trim()}`);
    if (area.trim()) lines.push(`Area: ${area.trim()}`);
    if (notes.trim()) lines.push(`Notes: ${notes.trim()}`);
    lines.push("Could you tell me what's available?");
    return lines.join("\n");
  }, [picks, name, area, notes]);

  const wa = `https://wa.me/${BRAND.phoneIntl}?text=${encodeURIComponent(message)}`;
  const doCopy = async (what) => {
    const ok = await copyText(what === "msg" ? message : BRAND.phone, what === "msg" ? msgRef.current : phoneRef.current);
    setCopied(ok ? what : `${what}-sel`);
    setTimeout(() => setCopied(""), 2400);
  };

  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const riseL = useTransform(scrollYProgress, [0, 1], ["40%", "0%"]);
  const riseR = useTransform(scrollYProgress, [0, 1], ["55%", "5%"]);
  const field = "w-full border-b border-sage/30 bg-transparent py-3 text-[16px] text-cream placeholder:text-sage/45 focus:border-cream focus:outline-none";

  return (
    <section id="order" ref={ref} className="relative isolate overflow-hidden bg-night" aria-labelledby="cta-title">
      <div aria-hidden="true" className="absolute inset-0 -z-10" style={{ background: "linear-gradient(180deg, #FAF9F3 0%, #A9B9A2 4%, #174F35 13%, #0D2B1E 34%, #071A12 100%)" }} />
      <div aria-hidden="true" className="absolute inset-0 -z-10" style={{ background: "radial-gradient(ellipse 60% 50% at 50% 55%, rgba(47,112,74,0.3), transparent 70%)" }} />
      <motion.div aria-hidden="true" style={{ y: riseL }} className="pointer-events-none absolute -left-24 bottom-0 -z-10 opacity-60 blur-[2px]">
        <Frond fill="#0B2519" className="h-[90vh] w-auto rotate-[16deg]" />
      </motion.div>
      <motion.div aria-hidden="true" style={{ y: riseR }} className="pointer-events-none absolute -right-32 bottom-0 -z-10 opacity-60 blur-[3px]">
        <BigLeaf fill="#0A2217" vein="rgba(169,185,162,0.08)" className="w-[46vw] min-w-[320px] -rotate-[60deg]" />
      </motion.div>

      <div className="mx-auto flex max-w-[1320px] flex-col items-center px-5 pt-44 text-center sm:px-8 md:pt-56">
        <SectionMark n="09" label="Order Fresh" />
        <h2 id="cta-title" className="mt-10 max-w-[13ch] font-display font-light leading-[0.95] tracking-[-0.02em] text-cream" style={{ fontSize: "clamp(3.2rem, 8.4vw, 8.6rem)", textWrap: "balance" }}>
          <MaskLine>Bring something</MaskLine>
          <MaskLine delay={0.1}>
            <em className="italic text-sage">greener</em> to the table.
          </MaskLine>
        </h2>
        <p className="mt-8 max-w-[46ch] text-[15px] leading-relaxed text-sage/85">Tell us what you'd like. We'll reply with the varieties being harvested, quantities and delivery.</p>
      </div>

      <div className="mx-auto mt-16 max-w-[1100px] px-5 sm:px-8">
        <form onSubmit={(e) => e.preventDefault()} className="grid gap-12 border border-sage/20 bg-night/55 p-6 backdrop-blur-md md:p-10 lg:grid-cols-[1.2fr_1fr]" style={{ borderRadius: 4 }} aria-label="Order enquiry">
          <div className="min-w-0">
            <fieldset>
              <legend className="meta text-sage">01 · Varieties you're interested in</legend>
              <div className="mt-4 flex flex-wrap gap-2">
                {CROPS.map((c) => (
                  <Chip key={c.id} selected={picks.includes(c.id)} onClick={() => togglePick(c.id)}>
                    {picks.includes(c.id) && <Check size={12} strokeWidth={2} />}
                    {c.name}
                  </Chip>
                ))}
              </div>
              <p className="mt-3 text-[12px] text-sage/60">Not every variety is grown at all times. We'll tell you what's ready.</p>
            </fieldset>
            <fieldset className="mt-10 grid gap-2 sm:grid-cols-2 sm:gap-x-6">
              <legend className="meta mb-2 text-sage">02 · About you (optional)</legend>
              <label className="block">
                <span className="sr-only">Your name</span>
                <input id="order-name" className={field} placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
              </label>
              <label className="block">
                <span className="sr-only">Your area</span>
                <input id="order-area" className={field} placeholder="Area in Pune" value={area} onChange={(e) => setArea(e.target.value)} />
              </label>
              <label className="block sm:col-span-2">
                <span className="sr-only">Notes</span>
                <input id="order-notes" className={field} placeholder="Quantity or other notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
              </label>
            </fieldset>
          </div>

          <div className="flex min-w-0 flex-col">
            <span className="meta text-sage">03 · Your message</span>
            <pre ref={msgRef} className="mt-4 flex-1 whitespace-pre-wrap break-words border-l border-sage/30 pl-4 font-sans text-[14px] leading-relaxed text-mist">
              {message}
            </pre>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
              <Magnetic strength={0.22}>
                <PrimaryCTA href={wa} label="SEND ON WHATSAPP" cursor="SEND" icon={MessageCircle} external />
              </Magnetic>
              <button type="button" onClick={() => doCopy("msg")} className="inline-flex items-center gap-2 border-b border-sage/40 pb-1 text-sage transition-colors hover:border-cream hover:text-cream">
                {copied === "msg" ? <Check size={13} strokeWidth={1.8} /> : <Copy size={13} strokeWidth={1.5} />}
                <Meta>{copied === "msg" ? "Copied" : copied === "msg-sel" ? "Selected — copy it" : "Copy message"}</Meta>
              </button>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-sage/15 pt-6">
              <Phone size={14} strokeWidth={1.5} className="text-sage" aria-hidden="true" />
              <Meta className="text-sage/65">Or call</Meta>
              <span ref={phoneRef} className="select-all font-display text-[1.5rem] tabular-nums text-cream">
                {BRAND.phone}
              </span>
              <button type="button" onClick={() => doCopy("phone")} className="meta text-sage underline decoration-sage/40 underline-offset-4 hover:text-cream" aria-label="Copy phone number">
                {copied === "phone" ? "Copied" : copied === "phone-sel" ? "Selected" : "Copy"}
              </button>
            </div>
          </div>
        </form>
      </div>

      <div aria-hidden="true" className="pointer-events-none mx-auto mt-16 flex max-w-[1100px] justify-center px-5 opacity-90">
        <Specimen varieties={["redAmaranth", "radish"]} seed={301} count={9} className="w-1/3" sway />
        <Specimen varieties={["broccoli", "pea"]} seed={302} count={11} className="w-1/3" sway />
        <Specimen varieties={["fenugreek", "sunflower"]} seed={303} count={9} className="w-1/3" sway />
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="relative bg-night text-sage" style={{ paddingBottom: "calc(env(safe-area-inset-bottom, 0px) + 32px)" }}>
      <div className="mx-auto max-w-[1320px] border-t border-sage/15 px-5 pt-12 sm:px-8">
        <div className="flex flex-col gap-10 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex items-center gap-5">
            <Badge size={64} />
            <div>
              <p className="font-display text-2xl italic text-cream">Young greens. Thoughtfully grown.</p>
              <Meta className="mt-2 block text-sage/65">
                {BRAND.location} · <span className="select-all tabular-nums">{BRAND.phone}</span>
              </Meta>
            </div>
          </div>
          <nav aria-label="Footer">
            <ul className="flex flex-wrap gap-x-7 gap-y-3">
              {[...NAV, { href: "#order", label: "Order Fresh" }].map((n) => (
                <li key={n.href}>
                  <a href={n.href} className="navlink meta text-sage/80 hover:text-cream">
                    {n.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <p className="mt-12 max-w-[80ch] text-[12px] leading-relaxed text-sage/55">{BRAND.disclaimer}</p>
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 text-sage/50">
          <Meta>© Florenza Microgreens · Founded by {BRAND.founder}</Meta>
          <Meta>Grow with science · Harvest with care · Serve fresh</Meta>
        </div>
      </div>
    </footer>
  );
}

/* ──────────────────────────────────────────────────────────────
   ROOT
   ────────────────────────────────────────────────────────────── */

export default function Florenza() {
  return (
    <MotionConfig reducedMotion="user">
      <FlorenzaProvider>
        <a href="#about" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[200] focus:bg-cream focus:px-4 focus:py-2 focus:text-night">
          Skip to content
        </a>
        <Cursor />
        <ScrollProgress />
        <Navigation />
        <main>
          <HeroForest />
          <About />
          <CollectionExplorer />
          <FlorenzaMethod />
          <FlorenzaGuide />
          <NutritionScience />
          <Recipes />
          <Founder />
          <OrderFresh />
        </main>
        <Footer />
        <div aria-hidden="true" className="grain pointer-events-none fixed inset-0 z-[90]" />
      </FlorenzaProvider>
    </MotionConfig>
  );
}
