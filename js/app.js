/* SynonymLens — IELTS word page
   Two kinds of entry share one page:
   · full entries (js/curated.js): written and checked by the teacher — CEFR, collocations, sentence patterns,
     synonym verdicts and symbols, antonym uses;
   · basic entries (data/, WordNet 3.1): meanings, examples, related words — nothing judged for IELTS yet.
   Search understands typos, word-family forms and whole phrases for full entries, and keeps a local history. */

const CUR = window.CURATED || {};
const CURWORDS = Object.keys(CUR);

/* ---------- state ---------- */
let MODE = null;           // "full" | "basic"
let WORD = "";             // headword on screen
let ENTRY, SYN, ANT, SCALE, FAMILY, BASE_P;   // the full entry on screen
let BASIC = null;          // the basic entry on screen: { word, senses }
let cur = 0, sel = 0, asel = 0, showMore = false, tray = 1, allSenses = false, bsel = 0, bant = 0, bmore = false;

function useFull(w) {
  const c = CUR[w];
  ENTRY = c.entry; SYN = c.syn; ANT = c.ant; SCALE = c.scale; FAMILY = c.family; BASE_P = c.baseP;
}
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const emph = s => esc(s).replace(/\*([^*]+)\*/g, "<em>$1</em>");
// "+ N", "+ V-ing", "+ S + V", "+ sb", "+ adj", "+ prep phrase" → slot chips
const SLOT_ALT = "N \\/ V-ing|S \\+ V|V-ing|adj \\/ N|prep phrase|adj|N|V|sb|sth";
function phrase(p) {
  const parts = p.split(new RegExp("(\\+ (?:" + SLOT_ALT + "))", "g")).filter(Boolean);
  return parts.map(x => x.startsWith("+ ") ? `<span class="slot">${esc(x)}</span>` : `<span>${esc(x.trim())}</span>`).join("");
}
const item = (x, id) => `<li class="item" id="${id}"><div class="phrase">${phrase(x.p)}</div><p class="ex">${emph(x.ex)}</p></li>`;

/* ---------- Full entries · tray 2: synonyms (compared with the headword) ----------
   verdict: pass = swap freely · warn = swap with care · fail = don't swap
   degree: ▲ stronger · ▼ weaker · = same · — can't compare
   scope:  ⊂ narrower · ⊃ wider · ≠ different meaning · = same
   att:    + more positive · − more negative · = same */

const VERDICT = { pass: "Swap freely", warn: "Swap with care", fail: "Don't swap" };
const SYM = {
  degree: { "▲": "stronger", "▼": "weaker", "=": "same", "—": "can't compare", "?": "not checked yet" },
  scope: { "⊂": "narrower", "⊃": "wider", "≠": "different meaning", "=": "same", "≈": "close meaning" },
  att: { "+": "more positive", "−": "more negative", "=": "same", "?": "not checked yet" }
};
const chip = (kind, v) => `<span class="sym${v === "=" ? " same" : ""}${v === "?" ? " unk" : ""}${v === "≠" || v === "—" || v === "−" ? " off" : ""}" title="${SYM[kind][v]}" aria-label="${kind === "att" ? "attitude" : kind}: ${SYM[kind][v]}">${v}</span>`;

/* the relation picture: degree strip, scope circles, attitude scale — navy = the headword, teal = the synonym */
function relSvg(x) {
  const W = x.w, base = WORD;
  const posOf = { "▲": 128, "▼": 22, "=": 75 };
  // degree
  // degree: one strip from weaker (light) to stronger (dark); navy pin = important, blue pin = the synonym
  const none = x.degree === "—" || x.degree === "?";
  let g1 = `<defs><linearGradient id="degGrad" x1="0" x2="1" y1="0" y2="0">
      <stop offset="0" stop-color="#CFE3E0"/><stop offset=".5" stop-color="#2A9D8F"/><stop offset="1" stop-color="#1F3A5F"/></linearGradient></defs>
    <text class="rt" x="0" y="14">Degree</text>
    <rect class="${none ? "strip off" : "strip"}" x="0" y="44" width="150" height="14" rx="7"/>
    <path class="ma" d="M69 72 l6 -10 l6 10 z"/>` +
    (none ? `<text class="tk q" x="75" y="38" text-anchor="middle">?</text>` : `<path class="mb" d="M${posOf[x.degree] - 6} 30 l6 10 l6 -10 z"/>`) +
    `<text class="end" x="0" y="88">weaker</text><text class="end" x="150" y="88" text-anchor="end">stronger</text>
    <text class="rc" x="0" y="108">${SYM.degree[x.degree]}</text>`;
  // scope
  const cx = 245, cy = 56;
  // scope: same area = one circle shared by both colours; ⊂ / ⊃ = one circle inside the other; ≠ = two separate circles
  const r0 = 31;
  const S = {
    "=": `<circle class="cm" cx="${cx}" cy="${cy}" r="${r0}"/>
          <path class="ea" d="M${cx} ${cy - r0} A${r0} ${r0} 0 0 0 ${cx} ${cy + r0}"/>
          <path class="eb" d="M${cx} ${cy - r0} A${r0} ${r0} 0 0 1 ${cx} ${cy + r0}"/>
          <text class="big" x="${cx}" y="${cy + 9}" text-anchor="middle">=</text>`,
    "⊂": `<circle class="la" cx="${cx}" cy="${cy}" r="${r0 + 2}"/><circle class="sb" cx="${cx + 8}" cy="${cy + 9}" r="15"/>`,
    "⊃": `<circle class="lb" cx="${cx}" cy="${cy}" r="${r0 + 2}"/><circle class="sa" cx="${cx + 8}" cy="${cy + 9}" r="15"/>`,
    "≠": `<circle class="sa" cx="${cx - 30}" cy="${cy}" r="18"/><circle class="sb" cx="${cx + 30}" cy="${cy}" r="18"/>
          <text class="big off" x="${cx}" y="${cy + 9}" text-anchor="middle">≠</text>`,
    "≈": `<circle class="la" cx="${cx - 11}" cy="${cy}" r="26"/><circle class="lb" cx="${cx + 11}" cy="${cy}" r="26" opacity=".85"/>
          <text class="big" x="${cx}" y="${cy + 9}" text-anchor="middle">≈</text>`
  }[x.scope];
  const scopeNote = { "=": "covers the same uses", "⊂": "fits fewer contexts", "⊃": "fits more contexts", "≠": "not a synonym here", "≈": "close, not the same" }[x.scope];
  let g2 = `<text class="rt" x="190" y="14">Scope</text>${S}
    <text class="rc" x="190" y="108"><tspan class="sy${x.scope === "≠" ? " off" : ""}">${x.scope}</tspan> ${SYM.scope[x.scope]}</text>
    <text class="end" x="190" y="126">${scopeNote}</text>`;
  // attitude
  const ax = { "=": 425, "−": 383, "+": 467, "?": 425 }[x.att];
  let g3 = `<text class="rt" x="360" y="14">Attitude</text>
    <line class="axis" x1="365" y1="56" x2="485" y2="56"/>
    <text class="tk" x="360" y="80">−</text><text class="tk" x="420" y="80">0</text><text class="tk" x="482" y="80">+</text>
    <path class="ma" d="M419 64 l6 -8 l6 8 z"/>${x.att === "?" ? `<text class="tk q" x="425" y="44" text-anchor="middle">?</text>` : `<path class="mb" d="M${ax - 6} 48 l6 8 l6 -8 z"/>`}
    <text class="rc" x="360" y="108">${SYM.att[x.att]}</text>`;
  return `<svg class="rel" viewBox="0 0 500 132" role="img" aria-label="${esc(W)} compared with ${base}: degree ${SYM.degree[x.degree]}, scope ${SYM.scope[x.scope]}, attitude ${SYM.att[x.att]}">${g1}${g2}${g3}</svg>`;
}

/* ---------- Full entries · tray 2: antonyms ----------
   p = place on the shared scale (antonyms left, headword in the middle, synonyms right)
   opp = strong / mild opposite · neg = natural negation and where it lands (▲ ▼ =) · good = pass / warn */
const OPP = { strong: "strong", mild: "mild" };
const GOOD = { pass: "Good for a negation paraphrase", warn: "Negation changes the strength" };

function scaleHtml() {
  const sc = SCALE[cur];
  const g = sc.groups.map((x, i) => `<div class="grp ${i % 2 ? "dn" : "up"}${x.p < 12 ? " al" : x.p > 88 ? " ar" : ""}" style="--p:${x.p}%">
      <span class="tick k-${x.k}"></span><span class="lbls">${x.w.map(w => w === ENTRY.word
        ? `<b class="base">${w}</b>` : `<button type="button" class="sw k-${x.k}" data-w="${w}" data-k="${x.k}">${w}</button>`).join("")}</span></div>`).join("");
  // size the scale to the tallest label stack above and below the bar
  const up = Math.max(1, ...sc.groups.filter((_, i) => i % 2 === 0).map(x => x.w.length));
  const dn = Math.max(1, ...sc.groups.filter((_, i) => i % 2 === 1).map(x => x.w.length));
  const top = 28 + up * 23 + 14, h = top + 14 + 14 + dn * 23 + 6;
  return `<div class="scale" style="--top:${top}px;height:${h}px"><span class="send l">${sc.ends[0]}</span><span class="send r">${sc.ends[1]}</span><div class="bar"></div>${g}</div>`;
}

/* mini scale in the antonym detail: where the antonym sits, and where its negation lands */
function antSvg(a) {
  const X = p => 20 + p * 4.6;
  const negP = a.neg.vs === "=" ? BASE_P : a.neg.vs === "▼" ? 50 : 74;
  const xa = X(a.p), xn = X(negP), xb = X(BASE_P);
  const anchor = x => x < 90 ? "start" : x > 410 ? "end" : "middle";
  const label = a.neg.label || a.neg.phrase;
  return `<svg class="rel ants-svg" viewBox="0 0 500 112" role="img" aria-label="${esc(a.w)} is far below ${ENTRY.word}; ${esc(a.neg.phrase)} lands ${a.neg.vs === "=" ? "at the same place as" : a.neg.vs === "▼" ? "below" : "above"} ${ENTRY.word}">
    <defs><linearGradient id="antGrad" x1="0" x2="1"><stop offset="0" stop-color="#E76F51"/><stop offset=".25" stop-color="#F4C3B5"/><stop offset=".45" stop-color="#E3E8EC"/><stop offset=".55" stop-color="#CFE3E0"/><stop offset=".78" stop-color="#2A9D8F"/><stop offset="1" stop-color="#1F3A5F"/></linearGradient></defs>
    <path class="arc" d="M${xa} 40 Q${(xa + xn) / 2} 6 ${xn} 36"/>
    <text class="nl" x="${xn}" y="16" text-anchor="${anchor(xn)}">${esc(label)}</text>
    <rect x="20" y="48" width="460" height="14" rx="7" fill="url(#antGrad)"/>
    <path class="mn" d="M${xn - 6} 34 l6 10 l6 -10 z"/>
    <path class="mc" d="M${xa - 6} 38 l6 9 l6 -9 z"/>
    <path class="ma" d="M${xb - 6} 76 l6 -10 l6 10 z"/>
    <text class="al" x="${xa}" y="94" text-anchor="${anchor(xa)}">${esc(a.w)}</text>
    <text class="bl" x="${xb}" y="94" text-anchor="middle">${ENTRY.word}</text>
  </svg>`;
}

function antHtml() {
  const list = ANT[cur];
  if (asel >= list.length) asel = 0;
  const rows = list.map((a, i) => `
    <tr class="row arow${i === asel ? " on" : ""}" data-i="${i}" tabindex="0" aria-selected="${i === asel}">
      <td><span class="vd ${a.good}" title="${GOOD[a.good]}" aria-label="${GOOD[a.good]}"></span></td>
      <th scope="row">${esc(a.w)}</th>
      <td><span class="opp ${a.opp}">${OPP[a.opp]}</span></td>
      <td>${chip("att", a.att)}</td>
      <td>${chip("degree", a.neg.vs)}</td>
      <td class="chev" aria-hidden="true">›</td>
    </tr>`).join("");
  return `
    <section class="ants">
      <h2>Antonyms <span class="count">${list.length}</span></h2>
      <div class="scale-box">
        <h4>How much it matters</h4>
        ${scaleHtml()}
        <p class="hint">Click a word on the scale to open it.</p>
      </div>
      <div class="keyline">
        <span><span class="vd pass"></span>good for a negation paraphrase</span>
        <span><span class="vd warn"></span>negation changes the strength</span>
        <span><b>Opposite</b> how far from ${ENTRY.word}</span>
        <span><b>Negated</b> the negative form, compared with ${ENTRY.word}</span>
      </div>
      <div class="c2">
        <div class="c2-list">
          <table class="syn ant" aria-label="Antonyms of ${ENTRY.word}, meaning ${cur + 1}">
            <thead><tr><th><span class="sr-only">Verdict</span></th><th>Word</th><th>Opposite</th><th>Attitude</th><th>Negated</th><th></th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
        <div class="c2-detail" id="adetail" aria-live="polite"></div>
      </div>
    </section>`;
}

function renderAntDetail(a) {
  const li = x => x.map(t => `<li>${esc(t)}</li>`).join("");
  const det = document.getElementById("adetail");
  det.innerHTML = `
    <div class="dt adt">
      <div class="dt-head">
        <h3>${esc(a.w)}</h3>
        <span class="pill"><span class="vd ${a.good}"></span>${a.opp === "strong" ? "Strong opposite" : "Mild opposite"}</span>
        <span class="reg">${esc(a.register)}</span>
      </div>
      <p class="key"><span class="k a"></span>${ENTRY.word}<span class="k c"></span>${esc(a.w)}<span class="k b"></span>negated</p>
      ${antSvg(a)}
      <ol class="uses">
        <li><h4><span class="un">1</span>Paraphrase by negation</h4>
          <div class="pair"><p><span class="pl">Original</span>${emph(a.pair[0])}</p><p><span class="pl">Paraphrase</span>${emph(a.pair[1])}</p></div>
          <p class="unote">${chip("degree", a.neg.vs)} ${esc(a.neg.note)}</p></li>
        <li><h4><span class="un">2</span>Contrast in one sentence</h4>
          <p class="tpl"><span class="phrase">${phrase(a.contrast.t)}</span></p>
          <p class="ex">${emph(a.contrast.ex)}</p></li>
        <li><h4><span class="un">3</span>Reading &amp; Listening trap</h4>
          <div class="trap"><p><span class="pl">Passage</span>${emph(a.trap.text)}</p><p><span class="pl">Statement</span>${emph(a.trap.q)}</p>
          <p class="ans"><span class="false">FALSE</span>Opposite meaning means FALSE, not NOT GIVEN.</p></div></li>
      </ol>
      <div class="when">
        <div class="yes"><h4>Use it when</h4><ul>${li(a.use)}</ul></div>
        <div class="no"><h4>Avoid it when</h4><ul>${li(a.avoid)}</ul></div>
      </div>
      <div class="tg"><button type="button" class="tgl" aria-expanded="false" aria-controls="a-co">Collocations</button></div>
      <div class="tgp" id="a-co" hidden>
        <ul class="cols-ok">${a.ok.map(t => `<li><span class="ok">✓</span>${esc(t)}</li>`).join("")}${a.no.map(t => `<li class="bad"><span class="nok">✗</span>${esc(t)}</li>`).join("")}</ul>
      </div>
    </div>`;
  det.querySelectorAll(".tgl").forEach(b => b.addEventListener("click", () => {
    const open = b.getAttribute("aria-expanded") !== "true";
    b.setAttribute("aria-expanded", open);
    document.getElementById(b.getAttribute("aria-controls")).hidden = !open;
  }));
}

function wireAnts() {
  const narrow = () => matchMedia("(max-width:760px)").matches;
  document.querySelectorAll("#body2 .arow").forEach(r => {
    const pick = () => { asel = +r.dataset.i; render2(); document.querySelector(`#body2 .arow[data-i="${asel}"]`)?.focus({ preventScroll: true }); if (narrow()) document.getElementById("adetail").scrollIntoView({ block: "start", behavior: "smooth" }); };
    r.addEventListener("click", pick);
    r.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(); } });
  });
  document.querySelectorAll("#body2 .sw").forEach(b => b.addEventListener("click", () => {
    const w = b.dataset.w, d = SYN[cur];
    if (b.dataset.k === "ant") {
      asel = ANT[cur].findIndex(a => a.w === w); render2();
      document.getElementById("adetail").scrollIntoView({ block: narrow() ? "start" : "center", behavior: "smooth" });
    } else {
      let i = d.synonyms.findIndex(x => x.w === w);
      if (i < 0) { showMore = true; i = d.synonyms.length + d.more.findIndex(x => x.w === w); }
      sel = i; render2();
      document.querySelector(`#body2 .row[data-i="${sel}"]:not(.arow)`)?.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  }));
  renderAntDetail(ANT[cur][asel]);
}

function render2() {
  const s = ENTRY.senses[cur], d = SYN[cur];
  const all = [...d.synonyms, ...(showMore ? d.more : [])];
  if (sel >= all.length) sel = 0;
  const tabs2 = document.getElementById("tabs2");
  tabs2.innerHTML = ENTRY.senses.map((x, i) => `
    <button type="button" role="tab" class="tab" aria-selected="${i === cur}" data-i="${i}">
      <span class="n">${i + 1}</span><span class="lvl">${x.level}</span>${esc(x.short)}</button>`).join("");
  tabs2.querySelectorAll("[data-i]").forEach(b => b.addEventListener("click", () => { cur = +b.dataset.i; sel = 0; asel = 0; showMore = false; render(); }));

  const rows = all.map((x, i) => `
    <tr class="row${i === sel ? " on" : ""}" data-i="${i}" tabindex="0" aria-selected="${i === sel}">
      <td><span class="vd ${x.verdict}" title="${VERDICT[x.verdict]}" aria-label="${VERDICT[x.verdict]}"></span></td>
      <th scope="row">${esc(x.w)}</th>
      <td>${chip("degree", x.degree)}</td><td>${chip("scope", x.scope)}</td><td>${chip("att", x.att)}</td>
      <td class="chev" aria-hidden="true">›</td>
    </tr>`).join("");
  const moreBtn = d.more.length ? `<button type="button" class="more" id="more">${showMore ? "Show fewer" : `Show ${d.more.length} more`}</button>` : "";

  document.getElementById("body2").innerHTML = `
    <div class="c2">
      <div class="c2-list">
        <table class="syn" aria-label="Synonyms of ${ENTRY.word}, meaning ${cur + 1}">
          <thead><tr><th><span class="sr-only">Verdict</span></th><th>Word</th><th>Degree</th><th>Scope</th><th>Attitude</th><th></th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
        ${moreBtn}
      </div>
      <div class="c2-detail" id="detail" aria-live="polite"></div>
    </div>
    ${antHtml()}`;
  document.querySelectorAll("#body2 .row:not(.arow)").forEach(r => {
    const pickRow = () => { sel = +r.dataset.i; render2(); if (matchMedia("(max-width:760px)").matches) document.getElementById("detail").scrollIntoView({ block: "start", behavior: "smooth" }); };
    r.addEventListener("click", pickRow);
    r.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pickRow(); } });
  });
  const mb = document.getElementById("more");
  if (mb) mb.addEventListener("click", () => { showMore = !showMore; render2(); });
  renderDetail(all[sel]);
  wireAnts();
}

function renderDetail(x) {
  const li = a => a.map(t => `<li>${esc(t)}</li>`).join("");
  const det = document.getElementById("detail");
  det.innerHTML = `
    <div class="dt">
      <div class="dt-head">
        <h3>${esc(x.w)}</h3>
        <span class="pill ${x.verdict}"><span class="vd ${x.verdict}"></span>${VERDICT[x.verdict]}</span>
        <span class="reg">${esc(x.register)}</span>
      </div>
      <p class="key"><span class="k a"></span>${ENTRY.word}<span class="k b"></span>${esc(x.w)}</p>
      ${relSvg(x)}
      <div class="pair${x.verdict === "fail" ? " bad" : ""}">
        <p><span class="pl">Original</span>${emph(x.pair[0])}</p>
        <p><span class="pl">${x.verdict === "fail" ? "✗ Wrong" : "Paraphrase"}</span>${emph(x.pair[1])}</p>
      </div>
      <div class="when">
        <div class="yes"><h4>Use it when</h4><ul>${li(x.use)}</ul></div>
        <div class="no"><h4>Avoid it when</h4><ul>${li(x.avoid)}</ul></div>
      </div>
      <div class="tg">
        <button type="button" class="tgl" aria-expanded="false" aria-controls="g-gr">Grammar</button>
        <button type="button" class="tgl" aria-expanded="false" aria-controls="g-co">Collocations</button>
      </div>
      <div class="tgp" id="g-gr" hidden><ul class="pats">${x.grammar.map(p => `<li><span class="phrase">${phrase(p)}</span></li>`).join("")}</ul></div>
      <div class="tgp" id="g-co" hidden>
        <ul class="cols-ok">${x.ok.map(t => `<li><span class="ok">✓</span>${esc(t)}</li>`).join("")}${x.no.map(t => `<li class="bad"><span class="nok">✗</span>${esc(t)}</li>`).join("")}</ul>
      </div>
    </div>`;
  det.querySelectorAll(".tgl").forEach(b => b.addEventListener("click", () => {
    const open = b.getAttribute("aria-expanded") !== "true";
    b.setAttribute("aria-expanded", open);
    document.getElementById(b.getAttribute("aria-controls")).hidden = !open;
  }));
}


/* ---------- full entries · tray 1 ---------- */
function render() {
  const tabs = document.getElementById("tabs");
  tabs.innerHTML = ENTRY.senses.map((s, i) => `
    <button type="button" role="tab" class="tab" id="t${i}" aria-selected="${i === cur}" aria-controls="panel" data-i="${i}">
      <span class="n">${i + 1}</span><span class="lvl">${s.level}</span>${esc(s.short)}</button>`).join("");
  tabs.querySelectorAll("[data-i]").forEach(b => b.addEventListener("click", () => { cur = +b.dataset.i; sel = 0; asel = 0; showMore = false; render(); }));
  const s = ENTRY.senses[cur];
  const panel = document.getElementById("panel");
  panel.setAttribute("aria-labelledby", "t" + cur);
  const adj = /adjective/.test(ENTRY.pos);
  panel.innerHTML = `
    <div class="def"><span class="lvl" title="CEFR level">${s.level}</span>
      <p>${esc(s.def)}<small>${esc(s.use)}</small></p></div>
    <div class="cols">
      <section><h2>Collocations <span class="count">${s.collocations.length}</span></h2><ul class="list">${s.collocations.map((x, i) => item(x, `s${cur}-c${i}`)).join("")}</ul></section>
      <section><h2>${adj ? "Sentence patterns" : "Phrasal verbs & patterns"} <span class="count">${s.patterns.length}</span></h2>
        ${adj ? `<p class="note">Adjectives have no phrasal verbs, so this card shows sentence patterns instead.</p>` : ""}
        <ul class="list">${s.patterns.map((x, i) => item(x, `s${cur}-p${i}`)).join("")}</ul></section>
    </div>`;
  render2();
}

function renderFull(w) {
  MODE = "full"; WORD = w; useFull(w);
  document.getElementById("tray1").innerHTML = `
    <div id="ftopics"></div>
    <div class="tabs" role="tablist" aria-label="Meanings" id="tabs"></div>
    <div id="panel" role="tabpanel"></div>
    <div class="legend" aria-label="Legend">
      <span><span class="lvl">A1</span>CEFR level of this meaning</span>
      <span><span class="slot">+ N</span>slot: what comes next</span>
    </div>`;
  document.getElementById("tray2").innerHTML = `
    <div class="tabs" role="tablist" aria-label="Meanings" id="tabs2"></div>
    <div class="keybox" aria-label="Legend">
      <div><h4>Verdict</h4><span><span class="vd pass"></span>Swap freely</span><span><span class="vd warn"></span>Swap with care</span><span><span class="vd fail"></span>Don't swap</span></div>
      <div><h4>Degree</h4><span><span class="sym">▲</span>stronger</span><span><span class="sym">▼</span>weaker</span><span><span class="sym off">—</span>can't compare</span></div>
      <div><h4>Scope</h4><span><span class="sym">⊂</span>narrower</span><span><span class="sym">⊃</span>wider</span><span><span class="sym off">≠</span>different meaning</span></div>
      <div><h4>Attitude</h4><span><span class="sym">+</span>more positive</span><span><span class="sym off">−</span>more negative</span><span><span class="sym same">=</span>same as ${esc(w)}</span></div>
      <p class="compare">Every word is compared with <b>${esc(w)}</b>. Click a word to see when to use it.</p>
    </div>
    <div id="body2"></div>`;
  renderHeader({ word: w, pos: ENTRY.pos, uk: ENTRY.ipa?.uk, us: ENTRY.ipa?.us, kind: "full" });
  render();
  Lexicon.topics(w).then(t => { const el = document.getElementById("ftopics"); if (el && WORD === w) el.innerHTML = topicLine(t); }).catch(() => {});
}

/* ---------- basic entries (WordNet) ---------- */
const POS = { n: "noun", v: "verb", a: "adjective", s: "adjective", r: "adverb" };
const POS_SHORT = { n: "n", v: "v", a: "adj", s: "adj", r: "adv" };
const FRAME = {
  1: "{w}", 2: "{w}", 4: "{w} + prep phrase", 5: "{w} + sth + adj / N", 6: "{w} + adj / N", 7: "{w} + adj",
  8: "{w} + sth", 9: "{w} + sb", 10: "{w} + sb", 11: "{w} + sth", 12: "{w} to + sb", 13: "{w} on + sth",
  14: "{w} + sb + sth", 15: "{w} + sth to + sb", 16: "{w} + sth from + sb", 17: "{w} + sb with + sth",
  18: "{w} + sb of + sth", 19: "{w} + sth on + sb", 20: "{w} + sb + prep phrase", 21: "{w} + sth + prep phrase",
  22: "{w} + prep phrase", 24: "{w} + sb to + V", 25: "{w} + sb + V", 26: "{w} that + S + V", 27: "{w} to + sb",
  28: "{w} to + V", 29: "{w} whether to + V", 30: "{w} + sb into + V-ing", 31: "{w} + sth with + sth",
  32: "{w} + V", 33: "{w} + V-ing", 34: "It {w}s that + S + V", 35: "{w} to + V"
};
const BAD = new Set(("ass arse arsehole asshole damn damned crap crappy piss pissed bloody shit shitty fuck fucking fucked fucker " +
  "bitch bitchy dick dickhead cock cunt twat wank wanker bastard bollocks bugger slut whore tit tits boob boobs pussy prick " +
  "motherfucker nigger nigga fag faggot retard spastic dyke homo horny porn porno screw-up bullshit").split(" "));
const clean = list => (list || []).filter(([w]) => !w.split(/[ -]/).some(t => BAD.has(t)));
const common = z => z >= 55 ? 5 : z >= 48 ? 4 : z >= 40 ? 3 : z >= 30 ? 2 : 1;
const COMMON = ["", "rare", "uncommon", "fairly common", "common", "very common"];
const bars = z => { const n = common(z); return `<span class="cm-bars" title="${COMMON[n]}" aria-label="${COMMON[n]}">${[1, 2, 3, 4, 5].map(i => `<i class="${i <= n ? "on" : ""}"></i>`).join("")}</span>`; };
const shortDef = d => {
  const t = (d.replace(/^\([^)]*\)\s*/, "").split(/[;(]/)[0].trim()) || d;
  return t.length > 40 ? t.slice(0, 38).replace(/\s+\S*$/, "") + "…" : t;
};
const wordLink = (w, z) => `<a class="wl" href="#${encodeURIComponent(w.replace(/ /g, "-"))}">${esc(w)}</a>`;

function basicTabs(id) {
  const ss = BASIC.senses, show = allSenses ? ss.length : Math.min(ss.length, 6);
  const btns = ss.slice(0, show).map((s, i) => `
    <button type="button" role="tab" class="tab" aria-selected="${i === cur}" data-i="${i}">
      <span class="n">${i + 1}</span><span class="lvl unk" title="CEFR level not checked yet">?</span>${esc(shortDef(s.d))}</button>`).join("");
  const more = ss.length > 6 ? `<button type="button" class="tab more-senses" data-more="1">${allSenses ? "Fewer meanings" : `+${ss.length - 6} more meanings`}</button>` : "";
  return `<div class="tabs" role="tablist" aria-label="Meanings" id="${id}">${btns}${more}</div>`;
}
function wireBasicTabs() {
  document.querySelectorAll("#btabs1 [data-i], #btabs2 [data-i]").forEach(b => b.addEventListener("click", () => { cur = +b.dataset.i; bsel = 0; bant = 0; bmore = false; renderBasic(); }));
  document.querySelectorAll("#btabs1 [data-more], #btabs2 [data-more]").forEach(b => b.addEventListener("click", () => {
    allSenses = !allSenses; if (!allSenses && cur >= 6) { cur = 0; bsel = 0; bant = 0; } renderBasic();
  }));
}
// IELTS topics this word is listed under in the vocabulary books, with the sources
function topicLine(list) {
  if (!list || !list.length) return "";
  const by = new Map();
  list.forEach(t => { if (!by.has(t.topic)) by.set(t.topic, []); by.get(t.topic).push(t.source); });
  return `<div class="topicline"><b>IELTS topics</b>${[...by].map(([t, src]) => `<span class="topic" title="${esc(src.join(" · "))}">${esc(t)}</span>`).join("")}
    <span class="src">Listed in ${esc([...new Set(list.map(t => t.source.split(",")[0]))].join(" · "))}</span></div>`;
}
// a sentence that contains every content word of a collocation (any form); "a/b" means either word
const LIGHT = /^(with|from|into|about|someone|something|somebody|oneself|come|came|lose|lost|make|made|take|took|keep|kept|give|gave|have|does|done|went|gets|your|their)$/;
function collKeys(colloc) {
  const alts = colloc.toLowerCase().replace(/\s*\/\s*/g, "/").split(/[^a-z'\/]+/).filter(Boolean);
  let variants = [[]];
  alts.forEach(t => { const opts = t.split("/"); variants = variants.flatMap(v => opts.map(o => [...v, o])); });
  return variants.map(v => {
    const all = v.filter(t => t.length > 3).map(t => t.slice(0, Math.max(4, t.length - 2)));
    const strong = v.filter(t => t.length > 3 && !LIGHT.test(t)).map(t => t.slice(0, Math.max(4, t.length - 2)));
    return strong.length ? strong : all;
  }).filter(k => k.length);
}
function exampleFor(colloc, sentences) {
  const sets = collKeys(colloc);
  if (!sets.length) return null;
  return sentences.find(x => { const l = x.toLowerCase(); return sets.some(keys => keys.every(k => new RegExp(`\\b${reEsc(k)}`).test(l))); }) || null;
}
function markPhrase(t, colloc) {
  const keys = [...new Set(collKeys(colloc).flat())];
  let out = esc(t);
  keys.forEach(k => { out = out.replace(new RegExp(`\\b${reEsc(k)}\\w*`, "i"), m => `<em>${m}</em>`); });
  return out;
}
const unchecked = (what) => `<li class="item unk-item"><p class="ex">${what} for this word are not checked yet.</p></li>`;
const reEsc = w => w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const markWord = (t, w) => esc(t).replace(new RegExp(`\\b${reEsc(w)}\\w*`, "i"), m => `<em>${m}</em>`);

/* basic entry, same card format as a full entry; what WordNet cannot tell us is shown as "?" (not checked yet) */
function renderBasic() {
  const w = BASIC.word, s = BASIC.senses[cur];
  // ---- tray 1: Word
  const pats = s.p === "v" ? [...new Set((s.fr || []).map(n => FRAME[n]).filter(Boolean).map(f => f.replace("{w}", w)))] : [];
  const verb = s.p === "v", adj = s.p === "a" || s.p === "s";
  const collShown = new Set((BASIC.coll || []).filter(c => c.sense === cur + 1).map(c => exampleFor(c.collocation, [...(BASIC.own || []).filter(x => x.sense === cur + 1).map(x => plain(x.s)), ...(s.e || []), ...(BASIC.more || [])])).filter(Boolean));
  const mine = (BASIC.own || []).filter(x => x.sense === cur + 1 && !collShown.has(plain(x.s))).slice(0, 6);
  const wn = s.e || [], have = mine.length + wn.length;
  const more = have >= 3 ? [] : (BASIC.more || []).filter(x => !wn.includes(x)).slice(0, 4 - have);
  const ownLi = x => `<li class="item own"><p class="ex">${/\*/.test(x.s) ? emph(x.s) : markWord(x.s, w)}</p>
      <p class="exmeta">${x.topic ? `<span class="topic">${esc(x.topic)}</span>` : ""}${x.skill ? `<span>${esc(x.skill)}</span>` : ""}${x.status === "draft" ? `<span class="draft">draft · not reviewed</span>` : ""}</p></li>`;
  const exItems = mine.map(ownLi).join("") + wn.map(e => `<li class="item"><p class="ex">${markWord(e, w)}</p><p class="exsrc">WordNet</p></li>`).join("") +
    more.map(e => `<li class="item"><p class="ex">${markWord(e, w)}</p><p class="exsrc">Tatoeba · may show another meaning</p></li>`).join("");
  const fam = clean(s.der);
  const colls = (BASIC.coll || []).filter(c => c.sense === cur + 1);
  const otherColl = (BASIC.coll || []).length - colls.length;
  const sentences = [...(BASIC.own || []).filter(x => x.sense === cur + 1).map(x => plain(x.s)), ...wn, ...(BASIC.more || [])];
  const collItem = c => {
    const ex = exampleFor(c.collocation, sentences);
    return `<li class="item"><div class="phrase"><span>${markWord(c.collocation, w)}</span></div>
      ${ex ? `<p class="ex">${markPhrase(ex, c.collocation)}</p>` : ""}
      <p class="exmeta">${c.topic ? `<span class="topic">${esc(c.topic)}</span>` : ""}<span title="Source">${esc(c.source)}</span>${c.status === "draft" ? `<span class="draft">draft</span>` : ""}</p></li>`;
  };
  document.getElementById("tray1").innerHTML = `
    <p class="basic-note"><b>Basic entry</b> from WordNet 3.1. Parts marked <span class="lvl unk">?</span> are not checked for IELTS yet.</p>
    ${topicLine([...(BASIC.topics || []), ...(BASIC.coll || []).filter(c => c.topic !== "General collocations")])}
    ${basicTabs("btabs1")}
    <div class="def"><span class="lvl unk" title="CEFR level not checked yet">?</span>
      <p>${esc(s.d)}<small>${POS[s.p]} · meaning ${cur + 1} of ${BASIC.senses.length}</small></p></div>
    <div class="cols">
      <section><h2>Collocations <span class="count">${colls.length || "?"}</span></h2>
        <ul class="list">${colls.length ? colls.map(collItem).join("") : unchecked("Collocations")}</ul>
        ${!colls.length && otherColl ? `<p class="note">${otherColl} collocation${otherColl > 1 ? "s" : ""} under other meanings of this word.</p>` : ""}</section>
      <section><h2>${verb ? "Phrasal verbs &amp; patterns" : "Sentence patterns"} <span class="count">${pats.length || "?"}</span></h2>
        ${adj ? `<p class="note">Adjectives have no phrasal verbs, so this card shows sentence patterns instead.</p>` : ""}
        <ul class="list">${pats.length ? pats.map(p => `<li class="item"><div class="phrase">${phrase(p)}</div></li>`).join("") : unchecked("Sentence patterns")}</ul></section>
    </div>
    <section class="exsec"><h2>Examples <span class="count">${mine.length + wn.length + more.length}</span></h2>
      ${exItems ? `<ul class="list ex-grid">${exItems}</ul>` : `<p class="note">No example sentence for this word yet.</p>`}
      ${fam.length ? `<p class="famline"><b>Word family</b>${fam.map(([x]) => wordLink(x)).join("")}</p>` : ""}</section>
    <div class="legend" aria-label="Legend">
      <span><span class="lvl unk">?</span>not checked yet</span>
      <span><span class="slot">+ N</span>slot: what comes next</span>
    </div>`;

  // ---- tray 2: Synonyms & antonyms, same table and detail as a full entry
  const rows = basicRows(s, w);
  const main = rows.filter(r => r.scope === "=" || r.scope === "≈"), extra = rows.filter(r => r.scope === "⊃" || r.scope === "⊂");
  const shown = [...main, ...(bmore ? extra : [])];
  if (bsel >= shown.length) bsel = 0;
  const ants = clean(s.ant).filter(([x]) => x !== w).map(([x]) => ({ w: x }));
  if (bant >= ants.length) bant = 0;
  BASIC.shown = shown; BASIC.ants = ants;
  const row = (r, i) => `
    <tr class="row brow${i === bsel ? " on" : ""}" data-i="${i}" tabindex="0" aria-selected="${i === bsel}">
      <td><span class="vd unk" title="Not checked yet" aria-label="Verdict not checked yet"></span></td>
      <th scope="row">${esc(r.w)}</th>
      <td>${chip("degree", "?")}</td><td>${chip("scope", r.scope)}</td><td>${chip("att", "?")}</td>
      <td class="chev" aria-hidden="true">›</td>
    </tr>`;
  let body = shown.map((r, i) => (bmore && i === main.length && extra.length ? `<tr class="sep"><td colspan="6">Wider and narrower words · the meaning changes</td></tr>` : "") + row(r, i)).join("");
  const moreBtn = extra.length ? `<button type="button" class="more" id="bmore">${bmore ? "Show fewer" : `Show ${extra.length} more`}</button>` : "";
  const arow = (a, i) => `
    <tr class="row arow barow${i === bant ? " on" : ""}" data-i="${i}" tabindex="0" aria-selected="${i === bant}">
      <td><span class="vd unk" title="Not checked yet"></span></td>
      <th scope="row">${esc(a.w)}</th>
      <td><span class="opp unk">?</span></td><td>${chip("att", "?")}</td><td>${chip("degree", "?")}</td>
      <td class="chev" aria-hidden="true">›</td>
    </tr>`;
  document.getElementById("tray2").innerHTML = `
    ${basicTabs("btabs2")}
    <div class="keybox" aria-label="Legend">
      <div><h4>Verdict</h4><span><span class="vd pass"></span>Swap freely</span><span><span class="vd warn"></span>Swap with care</span><span><span class="vd fail"></span>Don't swap</span></div>
      <div><h4>Degree</h4><span><span class="sym">▲</span>stronger</span><span><span class="sym">▼</span>weaker</span><span><span class="sym off">—</span>can't compare</span></div>
      <div><h4>Scope</h4><span><span class="sym">⊂</span>narrower</span><span><span class="sym">⊃</span>wider</span><span><span class="sym">≈</span>close meaning</span></div>
      <div><h4>Attitude</h4><span><span class="sym">+</span>more positive</span><span><span class="sym off">−</span>more negative</span><span><span class="sym same">=</span>same as ${esc(w)}</span></div>
      <p class="compare">Every word is compared with <b>${esc(w)}</b>. <span class="sym unk">?</span> and <span class="vd unk"></span> mean not checked yet: this is a basic entry from WordNet.</p>
    </div>
    ${shown.length ? `
    <div class="c2">
      <div class="c2-list">
        <table class="syn" aria-label="Synonyms of ${esc(w)}, meaning ${cur + 1}">
          <thead><tr><th><span class="sr-only">Verdict</span></th><th>Word</th><th>Degree</th><th>Scope</th><th>Attitude</th><th></th></tr></thead>
          <tbody>${body}</tbody>
        </table>
        ${moreBtn}
      </div>
      <div class="c2-detail" id="bdetail" aria-live="polite"></div>
    </div>` : `<p class="note">WordNet lists no synonym for this meaning.${extra.length ? "" : ""}</p>${moreBtn}`}
    <section class="ants">
      <h2>Antonyms <span class="count">${ants.length}</span></h2>
      ${ants.length ? `
      <div class="keyline">
        <span><span class="vd pass"></span>good for a negation paraphrase</span>
        <span><span class="vd warn"></span>negation changes the strength</span>
        <span><b>Opposite</b> how far from ${esc(w)}</span>
        <span><b>Negated</b> the negative form, compared with ${esc(w)}</span>
      </div>
      <div class="c2">
        <div class="c2-list">
          <table class="syn ant" aria-label="Antonyms of ${esc(w)}, meaning ${cur + 1}">
            <thead><tr><th><span class="sr-only">Verdict</span></th><th>Word</th><th>Opposite</th><th>Attitude</th><th>Negated</th><th></th></tr></thead>
            <tbody>${ants.map(arow).join("")}</tbody>
          </table>
        </div>
        <div class="c2-detail" id="badetail" aria-live="polite"></div>
      </div>` : `<p class="note">WordNet lists no antonym for this meaning.</p>`}
    </section>`;

  const narrow = () => matchMedia("(max-width:760px)").matches;
  const wire = (sel, set, after) => document.querySelectorAll(sel).forEach(r => {
    const pick = () => { set(+r.dataset.i); renderBasic(); document.querySelector(`${sel}[data-i="${r.dataset.i}"]`)?.focus({ preventScroll: true }); if (narrow()) document.getElementById(after)?.scrollIntoView({ block: "start", behavior: "smooth" }); };
    r.addEventListener("click", pick);
    r.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(); } });
  });
  wire("#tray2 .brow", i => { bsel = i; }, "bdetail");
  wire("#tray2 .barow", i => { bant = i; }, "badetail");
  document.getElementById("bmore")?.addEventListener("click", () => { bmore = !bmore; renderBasic(); });
  if (shown.length) basicDetail(shown[bsel]);
  if (ants.length) basicAntDetail(ants[bant]);
  wireBasicTabs();
}

function basicRows(s, w) {
  const rows = [];
  const push = (list, scope, max) => clean(list).filter(([x]) => x !== w).slice(0, max)
    .forEach(([x]) => { if (!rows.some(r => r.w === x)) rows.push({ w: x, scope }); });
  push(s.syn, "=", 12); push(s.sim, "≈", 10); push(s.hyper, "⊃", 4); push(s.hypo, "⊂", 6);
  return rows;
}

// the headword in one of its own sentences, swapped for another word — a test to read aloud, only on an exact match
function swapIn(word, other, sentences, multi = false) {
  if (other.includes(" ") && !multi) return null;
  const re = new RegExp(`\\b${reEsc(word)}\\b`, "i");
  const src = sentences.find(x => re.test(x));
  if (!src) return null;
  let out = src.replace(re, m => (m[0] === m[0].toUpperCase() ? other[0].toUpperCase() + other.slice(1) : other));
  out = out.replace(new RegExp(`\\b(a|an) (${reEsc(other.split(" ").pop())})\\b`, "i"), (m, art, x) => {
    const a = /^[aeiou]/i.test(x) ? "an" : "a"; return (art[0] === "A" ? a[0].toUpperCase() + a.slice(1) : a) + " " + x;
  });
  return { from: src, to: out };
}
const plain = t => t.replace(/\*/g, "");
const pool = () => [...(BASIC.own || []).filter(x => x.sense === cur + 1).map(x => plain(x.s)), ...(BASIC.senses[cur].e || []), ...(BASIC.more || [])];

// the other word's own entry: its meaning that links back to the headword, its examples and patterns
async function otherWord(w) {
  let entry = null, ex = [], mine = [];
  try { [entry, ex, mine] = await Promise.all([Lexicon.lookup(w), Lexicon.examples(w), Lexicon.ownExamples(w)]); } catch (e) { /* data unavailable */ }
  const coll = await Lexicon.collocations(w).catch(() => []);
  if (!entry) return { def: null, ex: [...mine.map(x => plain(x.s)), ...ex], pats: [], coll };
  const p = BASIC.senses[cur].p, P = x => (x === "s" ? "a" : x);
  const linked = entry.senses.find(t => ["syn", "sim", "hyper", "hypo", "ant"].some(k => (t[k] || []).some(([x]) => x === BASIC.word)) && P(t.p) === P(p));
  const sense = linked || entry.senses.find(t => P(t.p) === P(p)) || entry.senses[0];
  const pats = sense.p === "v" ? [...new Set((sense.fr || []).map(n => FRAME[n]).filter(Boolean).map(f => f.replace("{w}", entry.word)))] : [];
  const n = entry.senses.indexOf(sense) + 1;
  const own = [...mine.filter(x => x.sense === n), ...mine.filter(x => x.sense !== n)].map(x => plain(x.s));
  const cs = [...coll.filter(c => c.sense === n), ...coll.filter(c => c.sense !== n)];
  return { def: sense.d, ex: [...own, ...(sense.e || []), ...ex].filter((x, i, a) => a.indexOf(x) === i), pats, coll: cs };
}

const detailTokens = {};
async function basicDetail(r) {
  const box = document.getElementById("bdetail");
  if (!box || !r) return;
  const token = detailTokens.s = (detailTokens.s || 0) + 1, word = BASIC.word;
  const x = { w: r.w, degree: "?", scope: r.scope, att: "?" };
  const swap = r.scope === "=" || r.scope === "≈" ? swapIn(word, r.w, pool()) : null;
  const avoid = {
    "⊃": `You need the exact meaning. ${r.w} is a more general word.`,
    "⊂": `The narrower meaning of ${r.w} is not true in your sentence.`
  }[r.scope];
  box.innerHTML = `
    <div class="dt">
      <div class="dt-head">
        <h3>${esc(r.w)}</h3>
        <span class="pill"><span class="vd unk"></span>Not checked yet</span>
        <span class="reg unk">Register ?</span>
      </div>
      <p class="key"><span class="k a"></span>${esc(word)}<span class="k b"></span>${esc(r.w)}</p>
      ${relSvg(x)}
      <div class="pair">
        ${swap ? `<p><span class="pl">Original</span>${markWord(swap.from, word)}</p><p><span class="pl">Swap test</span>${markWord(swap.to, r.w)}</p>
          <p class="unote">Read it aloud: does it keep the meaning and sound natural?</p>`
          : `<p class="unote">${r.scope === "⊃" || r.scope === "⊂" ? "A wider or narrower word changes the meaning, so there is no swap test." : "No sentence to test the swap yet."}</p>`}
      </div>
      <div class="when">
        <div class="yes"><h4>Use it when</h4><ul class="bwhen"><li class="loading">…</li></ul></div>
        <div class="no"><h4>Avoid it when</h4><ul>${avoid ? `<li>${esc(avoid)}</li>` : `<li class="unk-li">Not checked yet.</li>`}</ul></div>
      </div>
      <div class="tg">
        <button type="button" class="tgl" aria-expanded="false" aria-controls="bg-gr">Grammar</button>
        <button type="button" class="tgl" aria-expanded="false" aria-controls="bg-co">Collocations</button>
      </div>
      <div class="tgp" id="bg-gr" hidden><p class="unote">…</p></div>
      <div class="tgp" id="bg-co" hidden><p class="unote">…</p></div>
      <a class="open-page" href="#${encodeURIComponent(r.w.replace(/ /g, "-"))}">Open the page for ${esc(r.w)} →</a>
    </div>`;
  wireToggles(box);
  const o = await otherWord(r.w);
  if (detailTokens.s !== token || BASIC.word !== word || !box.isConnected) return;
  box.querySelector(".bwhen").innerHTML = o.def ? `<li>You mean: ${esc(o.def)}.</li>` : `<li class="unk-li">Not checked yet.</li>`;
  box.querySelector("#bg-gr").innerHTML = o.pats.length
    ? `<ul class="pats">${o.pats.map(p => `<li><span class="phrase">${phrase(p)}</span></li>`).join("")}</ul>`
    : `<p class="unote">Grammar for ${esc(r.w)} is not checked yet.</p>`;
  box.querySelector("#bg-co").innerHTML = (o.coll.length
      ? `<ul class="cols-ok">${o.coll.slice(0, 6).map(c => `<li><span class="ok">✓</span>${esc(c.collocation)}</li>`).join("")}</ul><p class="unote">From IELTS vocabulary books. Example sentences with ${esc(r.w)}:</p>`
      : `<p class="unote">Collocations are not checked yet. Example sentences with ${esc(r.w)}:</p>`) +
    (o.ex.length ? `<ul class="bex">${o.ex.slice(0, 3).map(t => `<li>${markWord(t, r.w)}</li>`).join("")}</ul>` : `<p class="unote">No example yet.</p>`);
}

async function basicAntDetail(a) {
  const box = document.getElementById("badetail");
  if (!box || !a) return;
  const token = detailTokens.a = (detailTokens.a || 0) + 1, word = BASIC.word, s = BASIC.senses[cur];
  const adj = s.p === "a" || s.p === "s";
  box.innerHTML = `
    <div class="dt adt">
      <div class="dt-head">
        <h3>${esc(a.w)}</h3>
        <span class="pill"><span class="vd unk"></span>Not checked yet</span>
        <span class="reg unk">Register ?</span>
      </div>
      <p class="key"><span class="k a"></span>${esc(word)}<span class="k c"></span>${esc(a.w)}</p>
      <ol class="uses">
        <li><h4><span class="un">1</span>Paraphrase by negation</h4><div class="u1"><p class="unote">…</p></div></li>
        <li><h4><span class="un">2</span>Contrast in one sentence</h4>
          ${adj ? `<p class="tpl"><span class="phrase">${phrase(`While + N is ${word}, + N is ${a.w}.`)}</span></p>` : `<p class="unote">Not checked yet.</p>`}</li>
        <li><h4><span class="un">3</span>Reading &amp; Listening trap</h4><div class="u3"><p class="unote">…</p></div></li>
      </ol>
      <div class="when">
        <div class="yes"><h4>Use it when</h4><ul class="bwhen"><li class="loading">…</li></ul></div>
        <div class="no"><h4>Avoid it when</h4><ul><li class="unk-li">Not checked yet.</li></ul></div>
      </div>
      <div class="tg"><button type="button" class="tgl" aria-expanded="false" aria-controls="ba-co">Collocations</button></div>
      <div class="tgp" id="ba-co" hidden><p class="unote">…</p></div>
      <a class="open-page" href="#${encodeURIComponent(a.w.replace(/ /g, "-"))}">Open the page for ${esc(a.w)} →</a>
    </div>`;
  wireToggles(box);
  const o = await otherWord(a.w);
  if (detailTokens.a !== token || BASIC.word !== word || !box.isConnected) return;
  // 1: the headword's sentence with "not + antonym" — a test, the strength often drops
  const neg = adj ? swapIn(word, "not " + a.w, pool(), true) : null;
  box.querySelector(".u1").innerHTML = neg
    ? `<div class="pair"><p><span class="pl">Original</span>${markWord(neg.from, word)}</p><p><span class="pl">Negated</span>${markWord(neg.to, "not " + a.w)}</p></div>
       <p class="unote">${chip("degree", "?")} Strength not checked: not + ${esc(a.w)} is often weaker than ${esc(word)}.</p>`
    : `<p class="unote">${adj ? "No sentence to test the negation yet." : "Not checked yet."}</p>`;
  // 3: a sentence with the antonym; the statement swaps in the headword → FALSE
  const trap = swapIn(a.w, word, o.ex);
  box.querySelector(".u3").innerHTML = trap
    ? `<div class="trap"><p><span class="pl">Passage</span>${markWord(trap.from, a.w)}</p><p><span class="pl">Statement</span>${markWord(trap.to, word)}</p>
       <p class="ans"><span class="false">FALSE</span>Opposite meaning means FALSE, not NOT GIVEN.</p></div>`
    : `<p class="unote">No sentence for a trap example yet.</p>`;
  box.querySelector(".bwhen").innerHTML = o.def ? `<li>You mean: ${esc(o.def)}.</li>` : `<li class="unk-li">Not checked yet.</li>`;
  box.querySelector("#ba-co").innerHTML = `<p class="unote">Collocations are not checked yet. Example sentences with ${esc(a.w)}:</p>` +
    (o.ex.length ? `<ul class="bex">${o.ex.slice(0, 3).map(t => `<li>${markWord(t, a.w)}</li>`).join("")}</ul>` : `<p class="unote">No example yet.</p>`);
}

function wireToggles(root) {
  root.querySelectorAll(".tgl").forEach(b => b.addEventListener("click", () => {
    const open = b.getAttribute("aria-expanded") !== "true";
    b.setAttribute("aria-expanded", open);
    document.getElementById(b.getAttribute("aria-controls")).hidden = !open;
  }));
}

async function showBasic(entry) {
  MODE = "basic"; WORD = entry.word; BASIC = entry;
  try {
    [entry.more, entry.z, entry.own, entry.coll, entry.topics] = await Promise.all([Lexicon.examples(entry.word), Lexicon.zipf(entry.word),
      Lexicon.ownExamples(entry.word), Lexicon.collocations(entry.word), Lexicon.topics(entry.word)]);
  } catch (e) { entry.more = entry.more || []; entry.z = 0; entry.own = entry.own || []; entry.coll = entry.coll || []; entry.topics = entry.topics || []; }
  const posList = [...new Set(entry.senses.map(s => POS[s.p]))].join(" · ");
  renderHeader({ word: entry.word, pos: posList, kind: "basic" });
  renderBasic();
  const us = await Lexicon.ipa(entry.word);
  if (us && WORD === entry.word) renderHeader({ word: entry.word, pos: posList, us, kind: "basic" });
}

/* ---------- header: word, part of speech, pronunciation ---------- */
const SPEAKER = `<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M4 9h4l5-4v14l-5-4H4z" fill="currentColor"/><path d="M16 8.5a5 5 0 0 1 0 7M18.5 6a8.5 8.5 0 0 1 0 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
function renderHeader(h) {
  document.getElementById("w").textContent = h.word;
  const say = (lang, label) => `<button type="button" class="say" data-lang="${lang}" aria-label="Play ${label} pronunciation">${SPEAKER}</button>`;
  document.getElementById("meta").innerHTML = `
    <span class="pos">${esc(h.pos)}</span>
    <span class="ipa"><span class="acc">UK</span>${h.uk ? `<span>/${esc(h.uk)}/</span>` : ""}${say("en-GB", "British")}</span>
    <span class="ipa"><span class="acc">US</span>${h.us ? `<span>/${esc(h.us)}/</span>` : ""}${say("en-US", "American")}</span>
    <span class="kind ${h.kind}">${h.kind === "full" ? "Full card" : "Basic entry"}</span>`;
  document.querySelectorAll("#meta .say").forEach(b => b.addEventListener("click", () => speak(h.word, b)));
  document.title = `${h.word} · SynonymLens`;
}
function speak(word, b) {
  try {
    if (!("speechSynthesis" in window)) return;
    const u = new SpeechSynthesisUtterance(word);
    u.lang = b.dataset.lang; u.rate = 0.9;
    const v = speechSynthesis.getVoices().find(x => x.lang === b.dataset.lang);
    if (v) u.voice = v;
    u.onstart = () => b.classList.add("playing");
    u.onend = u.onerror = () => b.classList.remove("playing");
    speechSynthesis.cancel(); speechSynthesis.speak(u);
  } catch (e) { /* speech not available */ }
}

/* ---------- trays ---------- */
function setTray(t, focus) {
  tray = t;
  [1, 2].forEach(n => {
    const b = document.getElementById("tr" + n), on = n === t;
    b.setAttribute("aria-selected", on); b.tabIndex = on ? 0 : -1;
    document.getElementById("tray" + n).hidden = !on;
  });
  if (focus) document.getElementById("tr" + t).focus();
}
document.querySelectorAll(".tray").forEach(b => {
  b.addEventListener("click", () => setTray(+b.dataset.t));
  b.addEventListener("keydown", e => {
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") { e.preventDefault(); setTray(tray === 1 ? 2 : 1, true); }
  });
});

/* landing title: type "SynonymLens" letter by letter, then pop the IELTS badge */
let typingTimer = null;
function playTitle() {
  const el = document.getElementById("typed"), badge = document.getElementById("badge");
  const plain = "Synonym", bold = "Lens", full = plain + bold;
  clearTimeout(typingTimer);
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) { el.innerHTML = plain + "<b>" + bold + "</b>"; badge.classList.remove("pre", "pop"); return; }
  badge.classList.remove("pop"); badge.classList.add("pre");
  const draw = n => {
    const a = full.slice(0, n), r = full.slice(n);
    const part = (txt, start) => {
      const p1 = txt.slice(0, Math.max(0, plain.length - start)), p2 = txt.slice(Math.max(0, plain.length - start));
      return esc(p1) + (p2 ? "<b>" + esc(p2) + "</b>" : "");
    };
    el.innerHTML = part(a, 0) + '<span class="caret"></span>' + (r ? '<span class="ghost">' + part(r, n) + "</span>" : "");
  };
  let n = 0;
  draw(0);
  const step = () => {
    n++; draw(n);
    if (n < full.length) typingTimer = setTimeout(step, 85 + Math.random() * 60);
    else typingTimer = setTimeout(() => {
      badge.classList.remove("pre"); badge.classList.add("pop");
      typingTimer = setTimeout(() => { el.innerHTML = plain + "<b>" + bold + "</b>"; }, 1300);
    }, 220);
  };
  typingTimer = setTimeout(step, 350);
}

// Damerau–Levenshtein with an early stop
function dist(a, b, max) {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let p2 = null, p1 = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const c = [i]; let low = i;
    for (let j = 1; j <= b.length; j++) {
      let v = Math.min(p1[j] + 1, c[j - 1] + 1, p1[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      if (p2 && i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) v = Math.min(v, p2[j - 2] + 1);
      c[j] = v; if (v < low) low = v;
    }
    if (low > max) return max + 1;
    p2 = p1; p1 = c;
  }
  return p1[b.length];
}

/* ---------- search understanding: data-driven, no AI guessing ---------- */
const OUT = {
  vulgar: [...BAD],
  technical: ["mitochondria", "photosynthesis", "deoxyribonucleic", "isotope", "enzyme", "thermodynamics"]
};
const WSET = new Set(window.WORDS || []);
const RARE_Z = 15;   // zipf 1.5: too rare for IELTS
const SLOT_RE = new RegExp("\\+ (?:" + SLOT_ALT + ")", "g");

const maxEdits = w => (w.length <= 4 ? 0 : w.length <= 6 ? 1 : 2);
function norm(q) {
  return String(q).toLowerCase().replace(/[’‘]/g, "'")
    .replace(/\bit's\b/g, "it is").replace(/\+\s*(n\s*\/\s*v-ing|s\s*\+\s*v|v-ing|n|v|sb|sth)\b/g, " ")
    .replace(/[^a-z' -]+/g, " ").replace(/\s+/g, " ").trim();
}
const toks = q => norm(q).split(" ").filter(Boolean);
const stem = t => t.length > 4 ? t.replace(/(ing|ed|s)$/, "") : t;

// word-family forms of full entries lead to their card (importance → important)
const FAMALL = {};
CURWORDS.forEach(w => Object.entries(CUR[w].family || {}).forEach(([f, v]) => { FAMALL[f] = { ...v, head: w }; }));
const NEAR = [...CURWORDS, ...Object.keys(FAMALL)];
function fixTok(t) {
  if (NEAR.includes(t) || WSET.has(t)) return t;
  const m = maxEdits(t);
  let best = null, bd = m + 1;
  for (const w of NEAR) { const d = dist(t, w, m); if (d < bd) { bd = d; best = w; } }
  return best || t;
}

// every collocation and sentence pattern of a full entry becomes a searchable key
function variants(core) {
  const m = core.match(/(\S+) \/ (\S+)/);
  if (!m) return [core];
  return [...variants(core.replace(m[0], m[1])), ...variants(core.replace(m[0], m[2]))];
}
const KEYS = [];
CURWORDS.forEach(head => CUR[head].entry.senses.forEach((s, si) => {
  [["c", "collocations", "Collocations"], ["p", "patterns", "Sentence patterns"]].forEach(([k, field, label]) => {
    s[field].forEach((x, i) => {
      const core = x.p.replace(SLOT_RE, " ").replace(/\s+/g, " ").trim().toLowerCase();
      variants(core).forEach(v => KEYS.push({ head, si, id: `s${si}-${k}${i}`, p: x.p, label, text: v, st: v.split(" ").map(stem) }));
    });
  });
}));
function contig(hay, needle) {
  for (let i = 0; i + needle.length <= hay.length; i++)
    if (needle.every((t, j) => hay[i + j] === t)) return true;
  return false;
}
function matchKeys(qt, head) {
  const q = qt.map(stem);
  const scored = [];
  for (const k of KEYS) {
    if (head && k.head !== head) continue;
    let sc = 0;
    if (contig(k.st, q)) sc = q.length;
    else if (contig(q, k.st)) sc = k.st.length + 0.5;
    if (sc >= 2) scored.push({ k, sc });
  }
  if (!scored.length) return [];
  scored.sort((a, b) => b.sc - a.sc || a.k.st.length - b.k.st.length);
  const top = scored[0];
  const seen = new Set();
  return scored.filter(x => x.sc === top.sc && x.k.st.length === top.k.st.length && x.k.si === top.k.si && x.k.head === top.k.head)
    .map(x => x.k).filter(k => !seen.has(k.id) && seen.add(k.id));
}

function fuzzyWords(q, limit) {
  const m = Math.max(1, maxEdits(q)), res = [];
  for (const w of NEAR) { const d = dist(q, w, m); if (d <= m && w !== q) res.push({ w, d: d - 0.5 }); }
  for (const w of window.WORDS || []) {
    if (Math.abs(w.length - q.length) > m || (w[0] !== q[0] && w[0] !== q[1])) continue;
    const d = dist(q, w, m);
    if (d <= m && w !== q && !res.some(r => r.w === w)) res.push({ w, d });
    if (res.length > 40) break;
  }
  return res.sort((a, b) => a.d - b.d).slice(0, limit).map(r => r.w);
}

/* resolve a query: full card (with notes and items to point at), a word to look up in WordNet, out of scope, or nothing */
function resolve(raw) {
  const t0 = toks(raw);
  if (!t0.length) return { type: "none", q: raw.trim() };
  if (t0.length === 1 && OUT.vulgar.includes(t0[0])) return { type: "vulgar" };
  if (t0.length === 1 && OUT.technical.includes(t0[0])) return { type: "technical" };
  const t = t0.map(fixTok);
  const famTok = t.find(x => FAMALL[x]);
  const head = t.find(x => CUR[x]) || (famTok && FAMALL[famTok].head);
  if (!head) return { type: "lookup", q: t0.join(" ") };
  const typo = t.some((x, i) => x !== t0[i]);
  const notes = [];
  if (typo) notes.push(`Showing results for <b>${esc(t.join(" "))}</b> · you typed “${esc(t0.join(" "))}”.`);
  if (famTok) {
    const f = FAMALL[famTok];
    notes.push(f.rel
      ? `<b>${famTok}</b> is the ${f.rel} of <b>${head}</b>, in the same word family. Showing the card for ${head}.`
      : `<b>${famTok}</b> is the ${f.pos} form of <b>${head}</b>. Showing the card for ${head}.`);
  }
  const shown = t.join(" ");
  if (t.length === 1) return { type: "full", head, notes, hits: [], shown };
  const hits = famTok ? [] : matchKeys(t, head);
  if (hits.length) {
    const what = hits.map(h => `<b>${esc(h.p)}</b>`).join(" and ");
    notes.push(`Found ${what} under ${hits[0].label}${CUR[head].entry.senses.length > 1 ? `, meaning ${hits[0].si + 1}` : ""}.`);
  } else if (!famTok) {
    notes.push(`“${esc(shown)}” is not on this card yet. Showing the word <b>${head}</b>.`);
  }
  return { type: "full", head, notes, hits, shown };
}

/* ---------- search history (this browser only) ---------- */
const HKEY = "synonymlens.history.v1", HMAX = 15;
function histGet() {
  try { const h = JSON.parse(localStorage.getItem(HKEY) || "[]"); return Array.isArray(h) ? h.filter(x => typeof x === "string") : []; }
  catch (e) { return []; }
}
function histSave(h) { try { localStorage.setItem(HKEY, JSON.stringify(h.slice(0, HMAX))); } catch (e) { /* storage blocked */ } }
function histAdd(q) { const v = q.trim().toLowerCase(); if (!v) return; histSave([v, ...histGet().filter(x => x !== v)]); }
function histRemove(q) { histSave(histGet().filter(x => x !== q)); }
function histClear() { histSave([]); }

/* ---------- routing: no hash = landing; #query = card or message ---------- */
const go = q => {
  const h = norm(q).replace(/\s+/g, "-");
  if (decodeURIComponent(location.hash.slice(1)) === h) route(); else location.hash = h;
};
let routeId = 0;
function noticeShow(notes) {
  const notice = document.getElementById("notice");
  if (!notes.length) { notice.hidden = true; return; }
  notice.innerHTML = `<div class="nt">${notes.map(n => `<p>${n}</p>`).join("")}</div><button type="button" class="x" aria-label="Close message">×</button>`;
  notice.hidden = false;
  notice.querySelector(".x").onclick = () => { notice.hidden = true; };
}
function showMsg(html) {
  document.getElementById("cardView").hidden = true;
  const msg = document.getElementById("msg"); msg.innerHTML = html; msg.hidden = false;
}
function showCard() {
  document.getElementById("msg").hidden = true;
  document.getElementById("cardView").hidden = false;
}
async function route() {
  const id = ++routeId;
  const raw = decodeURIComponent(location.hash.slice(1)).replace(/-/g, " ").trim();
  const landing = document.getElementById("landing"), view = document.getElementById("view");
  closeAll();
  if (!raw) { landing.hidden = false; view.hidden = true; document.title = "SynonymLens · IELTS"; playTitle(); setTimeout(() => document.getElementById("q0").focus(), 30); return; }
  landing.hidden = true; view.hidden = false;
  document.getElementById("q1").value = raw;
  noticeShow([]);
  const r = resolve(raw);

  if (r.type === "full") {
    const fresh = MODE !== "full" || WORD !== r.head;
    const want = r.hits.length ? r.hits[0].si : (fresh ? 0 : cur);
    if (fresh || want !== cur) { cur = want; sel = 0; asel = 0; showMore = false; }
    renderFull(r.head);
    showCard(); noticeShow(r.notes); histAdd(r.shown);
    if (fresh && !r.hits.length) setTray(1);
    if (r.hits.length) {
      setTray(1);
      const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
      r.hits.forEach(h => document.getElementById(h.id)?.classList.add("hit"));
      requestAnimationFrame(() => document.getElementById(r.hits[0].id)?.scrollIntoView({ block: "center", behavior: calm ? "auto" : "smooth" }));
    } else window.scrollTo(0, 0);
    return;
  }
  if (r.type === "vulgar") return showMsg("<h1>This word is not used in the IELTS test</h1><p>It is slang or offensive language. SynonymLens does not show these words.</p>");
  if (r.type === "technical") return showMsg("<h1>This word is outside IELTS vocabulary</h1><p>It is a specialist term. The IELTS test does not require it.</p>");

  if (r.type === "lookup") {
    showMsg(`<p class="loading">Looking up “${esc(r.q)}”…</p>`);
    let entry = null;
    try { entry = await Lexicon.lookup(r.q); }
    catch (e) {
      if (id !== routeId) return;
      return showMsg(`<h1>Word data could not load</h1><p>Open the site through a web server, for example GitHub Pages, or run <code>python3 -m http.server</code> in the site folder. Browsers block data files when the page is opened straight from disk.</p>`);
    }
    if (id !== routeId) return;
    if (entry) {
      if (!WSET.has(entry.word) && !CUR[entry.word] && await Lexicon.zipf(entry.word) < RARE_Z) {
        if (id !== routeId) return;
        return showMsg(`<h1>This word is outside IELTS vocabulary</h1><p>“${esc(entry.word)}” is very rare in English. The IELTS test does not require it.</p>`);
      }
      if (id !== routeId) return;
      const fresh = MODE !== "basic" || WORD !== entry.word;
      if (fresh) { cur = 0; bsel = 0; bant = 0; bmore = false; allSenses = false; setTray(1); }
      await showBasic(entry);
      if (id !== routeId) return;
      showCard(); window.scrollTo(0, 0);
      const notes = [];
      if (entry.word !== r.q && entry.word !== r.q.replace(/ /g, "-")) notes.push(`Showing <b>${esc(entry.word)}</b>, the base form of “${esc(r.q)}”.`);
      noticeShow(notes); histAdd(entry.word);
      return;
    }
    const one = !r.q.includes(" ");
    const fix = one ? fuzzyWords(r.q, 4) : [];
    const links = fix.map(w => `<a href="#${w}">${esc(w)}</a>`).join(", ");
    return showMsg(`<h1>No entry for “${esc(r.q)}”</h1>` + (links ? `<p>Did you mean ${links}?</p>` : "") +
      (one ? "" : `<p>Phrases are understood for full cards only. Try one word, for example <a href="#${CURWORDS[0]}">${CURWORDS[0]}</a>.</p>`));
  }
  showMsg(`<h1>No entry for “${esc(r.q)}”</h1>`);
}

/* ---------- suggestions while typing, with search history ---------- */
const boxes = [];
function closeAll() { boxes.forEach(b => b.close()); }
const CLOCK = `<svg viewBox="0 0 24 24" width="15" height="15" aria-hidden="true"><circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="2"/><path d="M12 7.5V12l3 2" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`;
function attach(input, list) {
  let items = [], active = -1, timer = null;
  const bold = (w, q) => w.startsWith(q) && q ? `<b>${esc(w.slice(0, q.length))}</b>${esc(w.slice(q.length))}` : esc(w);
  function build(qRaw) {
    const q = norm(qRaw), out = [];
    const hist = histGet();
    if (!q) {
      if (hist.length) { hist.slice(0, 8).forEach(h => out.push({ kind: "recent", w: h, go: h })); return out; }
      const w0 = CURWORDS[0];
      if (w0) {
        out.push({ kind: "try", w: w0, go: w0 });
        const k = KEYS.find(k => k.head === w0 && k.label === "Sentence patterns");
        if (k) out.push({ kind: "try-p", k, go: k.text });
        const f = Object.keys(FAMALL).find(f => FAMALL[f].head === w0);
        if (f) out.push({ kind: "try-f", w: f, go: f });
      }
      return out;
    }
    hist.filter(h => h.startsWith(q) && h !== q).slice(0, 3).forEach(h => out.push({ kind: "recent", w: h, go: h }));
    const qt = q.split(" "), fixed = qt.map(fixTok), multi = qt.length > 1;
    // patterns & collocations of full entries
    const ph = [], seenId = new Set();
    const addK = k => { const key = k.head + k.id; if (!seenId.has(key) && ph.length < (multi ? 5 : 3)) { seenId.add(key); ph.push({ kind: "phrase", k, go: k.text }); } };
    if (q.length >= 3) KEYS.filter(k => k.text.includes(q)).forEach(addK);
    if (multi) matchKeys(fixed).forEach(addK);
    // words: full cards first, then the frequency list
    const wd = [];
    if (!multi) {
      const last = qt[0];
      CURWORDS.forEach(w => { if (w.startsWith(last)) wd.push(w); });
      Object.keys(FAMALL).forEach(f => { if (f.startsWith(last) && !wd.includes(f)) wd.push(f); });
      for (const w of window.WORDS || []) { if (wd.length >= 7) break; if (w.startsWith(last) && !wd.includes(w) && !BAD.has(w)) wd.push(w); }
    }
    const inRecent = new Set(out.map(x => x.w));
    wd.filter(w => !inRecent.has(w)).forEach(w => out.push(FAMALL[w] ? { kind: "form", w, go: w } : { kind: "word", w, go: w }));
    ph.forEach(x => out.push(x));
    if (!multi && q.length >= 4 && wd.length < 3 && !WSET.has(q)) fuzzyWords(q, 3).filter(w => !wd.includes(w)).forEach(w => out.push({ kind: "fix", w, go: w }));
    if (multi && !ph.length && fixed.join(" ") !== q && fixed.some(x => NEAR.includes(x))) out.push({ kind: "fix", w: fixed.join(" "), go: fixed.join(" ") });
    return out;
  }
  const HEAD = { recent: "Recent searches", try: "Try", word: "Words", form: "Words", phrase: "Patterns & collocations", fix: "Did you mean" };
  const cardTag = w => CUR[w] ? `<span class="tag full">full card</span>` : `<span class="tag">basic</span>`;
  function row(it, q, i) {
    if (it.kind === "recent")
      return `<span class="clock" aria-hidden="true">${CLOCK}</span><span class="sg-w">${bold(it.w, q)}</span>
        <button type="button" class="sg-x" data-del="${i}" aria-label="Remove ${esc(it.w)} from history" tabindex="-1">×</button>`;
    if (it.kind === "phrase" || it.kind === "try-p")
      return `<span class="sg-w"><span class="phrase">${phrase(it.k.p)}</span></span><span class="tag">${it.k.label === "Collocations" ? "collocation" : "pattern"}</span>`;
    if (it.kind === "form" || it.kind === "try-f")
      return `<span class="dot"></span><span class="sg-w">${bold(it.w, q)}</span><span class="tag full">${FAMALL[it.w].pos} → ${FAMALL[it.w].head}</span>`;
    return `<span class="dot"></span><span class="sg-w">${it.kind === "fix" ? esc(it.w) : bold(it.w, q)}</span>${cardTag(it.w)}`;
  }
  function draw() {
    const q = norm(input.value);
    if (!items.length) { close(); return; }
    let last = null;
    list.innerHTML = items.map((it, i) => {
      const h = HEAD[it.kind.split("-")[0]];
      let head = "";
      if (h !== last) head = it.kind === "recent"
        ? `<li class="sg-head" role="presentation"><span>${h}</span>${q ? "" : `<button type="button" class="sg-clear" tabindex="-1">Clear all</button>`}</li>`
        : `<li class="sg-head" role="presentation">${h}</li>`;
      last = h;
      const word = ["word", "fix", "try"].includes(it.kind);
      const cls = ["sg-item", i === active ? "active" : "", it.kind === "recent" ? "recent" : word ? (CUR[it.w] ? "has" : "basic") : "has"].join(" ");
      return head + `<li id="${list.id}-o${i}" role="option" class="${cls}" aria-selected="${i === active}" data-i="${i}">${row(it, q, i)}</li>`;
    }).join("");
    list.hidden = false;
    input.setAttribute("aria-expanded", "true");
    if (active >= 0) { input.setAttribute("aria-activedescendant", `${list.id}-o${active}`); document.getElementById(`${list.id}-o${active}`)?.scrollIntoView({ block: "nearest" }); }
    else input.removeAttribute("aria-activedescendant");
    list.querySelectorAll(".sg-item").forEach(li => li.addEventListener("mousedown", e => {
      e.preventDefault();
      if (e.target.closest(".sg-x")) return;
      pick(+li.dataset.i);
    }));
    list.querySelectorAll(".sg-x").forEach(b => b.addEventListener("mousedown", e => {
      e.preventDefault(); e.stopPropagation();
      remove(+b.dataset.del);
    }));
    list.querySelector(".sg-clear")?.addEventListener("mousedown", e => { e.preventDefault(); histClear(); update(); });
  }
  function remove(i) {
    const it = items[i]; if (!it || it.kind !== "recent") return;
    histRemove(it.w);
    const keep = active;
    items = build(input.value);
    active = Math.min(keep, items.length - 1);
    draw();
  }
  function close() { list.hidden = true; input.setAttribute("aria-expanded", "false"); input.removeAttribute("aria-activedescendant"); active = -1; }
  function pick(i) { const it = items[i]; if (!it) return; close(); input.blur(); go(it.go); }
  function update() { active = -1; items = build(input.value); draw(); }
  input.addEventListener("input", () => { clearTimeout(timer); timer = setTimeout(update, 70); });
  input.addEventListener("focus", update);
  input.addEventListener("blur", () => setTimeout(close, 120));
  input.addEventListener("keydown", e => {
    if (e.key === "ArrowDown") { e.preventDefault(); if (list.hidden) update(); active = Math.min(items.length - 1, active + 1); draw(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); active = Math.max(-1, active - 1); draw(); }
    else if (e.key === "Enter" && active >= 0 && !list.hidden) { e.preventDefault(); pick(active); }
    else if (e.key === "Delete" && active >= 0 && items[active]?.kind === "recent") { e.preventDefault(); remove(active); }
    else if (e.key === "Escape") close();
  });
  boxes.push({ close });
}
attach(document.getElementById("q0"), document.getElementById("sg0"));
attach(document.getElementById("q1"), document.getElementById("sg1"));

document.querySelectorAll("[data-search]").forEach(f => f.addEventListener("submit", e => {
  e.preventDefault();
  const inp = f.querySelector("input"), v = inp.value.trim();
  if (v) { closeAll(); inp.blur(); go(v); }
}));
window.addEventListener("hashchange", route);
route();
