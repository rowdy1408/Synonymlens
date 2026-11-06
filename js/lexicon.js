/* SynonymLens — WordNet data for basic entries.
   data/manifest.json maps the first two letters of a word to a shard file; each shard maps word → list of senses.
   A sense: p (n v a s r), d (definition), e (examples), syn (same synset), sim (similar), ant (antonyms),
   hyper (more general), hypo (more specific), der (word family), fr (verb frame numbers).
   Word lists are [word, zipf×10] pairs: zipf 6 = very common, 3 = uncommon, 1 = rare.
   data/ex/: example sentences from Tatoeba (CC BY 2.0 FR), up to 4 per word. */
(function (global) {
  const BASE = "data/";
  let manifest = null, zipfMap = null, ipaMap = null;
  const shards = new Map();
  const getJSON = f => fetch(BASE + f).then(r => { if (!r.ok) throw new Error("Could not load " + f); return r.json(); });

  function prefKey(w) {
    const p = w.toLowerCase().replace(/[^a-z]/g, "").slice(0, 2);
    return p ? (p + "_").slice(0, 2) : "__";
  }
  async function raw(w) {
    if (!manifest) manifest = getJSON("manifest.json");
    const m = await manifest;
    const f = m[prefKey(w)];
    if (!f) return null;
    if (!shards.has(f)) shards.set(f, getJSON(f));
    const s = await shards.get(f);
    return s[w] || null;
  }

  // possible base forms of an inflected word, most likely first
  const IRR = {
    went: "go", gone: "go", was: "be", were: "be", been: "be", is: "be", are: "be", am: "be", had: "have", has: "have",
    did: "do", done: "do", made: "make", took: "take", taken: "take", gave: "give", given: "give", got: "get", gotten: "get",
    saw: "see", seen: "see", came: "come", knew: "know", known: "know", thought: "think", found: "find", told: "tell",
    became: "become", felt: "feel", brought: "bring", began: "begin", begun: "begin", kept: "keep", held: "hold",
    wrote: "write", written: "write", stood: "stand", heard: "hear", meant: "mean", met: "meet", ran: "run", paid: "pay",
    sat: "sit", spoke: "speak", spoken: "speak", led: "lead", grew: "grow", grown: "grow", lost: "lose", fell: "fall",
    fallen: "fall", sent: "send", built: "build", understood: "understand", drew: "draw", drawn: "draw", broke: "break",
    broken: "break", spent: "spend", rose: "rise", risen: "rise", drove: "drive", driven: "drive", bought: "buy",
    taught: "teach", caught: "catch", sought: "seek", fought: "fight", chose: "choose", chosen: "choose", wore: "wear",
    worn: "wear", children: "child", people: "person", men: "man", women: "woman", feet: "foot", teeth: "tooth",
    mice: "mouse", criteria: "criterion", phenomena: "phenomenon", data: "datum", analyses: "analysis", crises: "crisis",
    hypotheses: "hypothesis", worse: "bad", worst: "bad", better: "good", best: "good"
  };
  function candidates(w) {
    const c = [];
    const add = x => { if (x && x.length > 1 && !c.includes(x)) c.push(x); };
    add(w);
    if (w.includes(" ")) add(w.replace(/ /g, "-"));
    if (IRR[w]) add(IRR[w]);
    if (w.endsWith("ies")) add(w.slice(0, -3) + "y");
    if (w.endsWith("s") && !w.endsWith("ss")) add(w.slice(0, -1));
    if (w.endsWith("es")) add(w.slice(0, -2));
    if (w.endsWith("ied")) add(w.slice(0, -3) + "y");
    if (w.endsWith("ed")) { add(w.slice(0, -1)); add(w.slice(0, -2)); if (/(.)\1ed$/.test(w)) add(w.slice(0, -3)); }
    if (w.endsWith("ing")) { add(w.slice(0, -3) + "e"); add(w.slice(0, -3)); if (/(.)\1ing$/.test(w)) add(w.slice(0, -4)); }
    if (w.endsWith("ier")) add(w.slice(0, -3) + "y");
    if (w.endsWith("iest")) add(w.slice(0, -4) + "y");
    if (w.endsWith("er")) { add(w.slice(0, -2)); add(w.slice(0, -1)); }
    if (w.endsWith("est")) { add(w.slice(0, -3)); add(w.slice(0, -2)); }
    if (w.endsWith("ly")) add(w.slice(0, -2));
    return c;
  }

  // the entry for a word or its base form → { word, senses } or null
  async function lookup(q) {
    const w = q.toLowerCase().trim();
    // a word that is common in its own right keeps its own entry (e.g. "better", "data")
    for (const c of candidates(w)) {
      const e = await raw(c);
      if (e && e.length) return { word: c, senses: e };
    }
    return null;
  }

  async function zipf(w) {
    if (!zipfMap) zipfMap = getJSON("words.json").then(list => new Map(list.map(x => [x[0], x[1]])));
    return (await zipfMap).get(w) ?? 0;
  }
  async function ipa(w) {
    if (!ipaMap) ipaMap = getJSON("ipa-us.json");
    try { return (await ipaMap)[w] || null; } catch (e) { return null; }
  }

  // example sentences for a word from Tatoeba (data/ex/<first letter>.json), any meaning of the word
  const exFiles = new Map();
  async function examples(w) {
    const k = /^[a-z]/.test(w) ? w[0] : "_";
    if (!exFiles.has(k)) exFiles.set(k, getJSON("ex/" + k + ".json").catch(() => ({})));
    return (await exFiles.get(k))[w] || [];
  }

  global.Lexicon = { lookup, zipf, ipa, examples };
})(window);
