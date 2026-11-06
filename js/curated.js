/* SynonymLens — curated (full) entries, written and checked by the teacher.
   Each word: entry (Word tray), syn + ant + scale (Synonyms & antonyms tray), family (other forms that lead here).
   Example sentences mark the focus words with *…*. Slots in patterns: + N, + V, + V-ing, + S + V, + sb, + sth. */
window.CURATED = window.CURATED || {};
(function () {
const ENTRY = {
  word: "important",
  pos: "adjective",
  ipa: { uk: "ɪmˈpɔː.tənt", us: "ɪmˈpɔːr.tənt" },
  senses: [
    {
      level: "A1",
      short: "of great value or effect",
      def: "having a big effect or great value",
      use: "Use for ideas, factors, decisions, roles",
      collocations: [
        { p: "play an important role in + N / V-ing", ex: "Teachers *play an important role in* shaping children’s values." },
        { p: "an important factor in + N", ex: "Cost is *an important factor in* choosing a university." },
        { p: "vitally / extremely important", ex: "Regular exercise is *vitally important* for mental health." },
        { p: "an important decision", ex: "Choosing a career is one of the most *important decisions* in life." },
        { p: "important to + sb", ex: "Family is more *important to* me than money." }
      ],
      patterns: [
        { p: "It is important to + V", ex: "*It is important to* protect endangered species." },
        { p: "It is important that + S + V", ex: "*It is important that* every child has access to education." },
        { p: "the most important + N", ex: "Health is *the most important* thing in life." }
      ]
    },
    {
      level: "B1",
      short: "powerful or influential",
      def: "having a lot of power or influence",
      use: "Use for people and organisations",
      collocations: [
        { p: "an important figure in + N", ex: "Nguyen Du is *an important figure in* Vietnamese literature." },
        { p: "an important person / guest", ex: "The president welcomed *important guests* from abroad." }
      ],
      patterns: [
        { p: "one of the most important + N", ex: "She is *one of the most important* scientists of her generation." }
      ]
    }
  ]
};

const SYN = [
  {
    synonyms: [
      { w: "significant", verdict: "pass", degree: "=", scope: "=", att: "=", register: "Formal",
        pair: ["Technology plays an *important* role in education.", "Technology plays a *significant* role in education."],
        use: ["You need the closest meaning to important in Writing.", "You talk about numbers: a significant increase means large enough to notice."],
        avoid: ["You use the pattern It is ___ to + V. Keep important: It is important to study hard."],
        grammar: ["play a significant role in + N / V-ing", "be significant for + N", "a significant + N"],
        ok: ["a significant role", "a significant factor", "a significant impact", "a significant increase"],
        no: ["It is significant to study hard."] },
      { w: "crucial", verdict: "warn", degree: "▲", scope: "=", att: "=", register: "Neutral",
        pair: ["Teachers play an *important* role in shaping children’s values.", "Teachers play a *crucial* role in shaping children’s values."],
        use: ["The thing decides the result: without it, the plan fails.", "You want to say extremely important."],
        avoid: ["The idea is only normally important. Crucial will sound too strong.", "You describe a person: a crucial person is wrong."],
        grammar: ["be crucial for / to + N", "It is crucial to + V", "It is crucial that + S + V"],
        ok: ["a crucial role", "crucial for success", "a crucial moment", "a crucial decision"],
        no: ["a crucial person"] },
      { w: "key", verdict: "warn", degree: "=", scope: "=", att: "=", register: "Neutral",
        pair: ["Cost is an *important* factor in choosing a university.", "Cost is a *key* factor in choosing a university."],
        use: ["The word comes directly before a noun: a key factor, a key role."],
        avoid: ["The word comes after be. Education is very key is wrong in Writing."],
        grammar: ["a key + N (only before a noun)", "a key to + N / V-ing"],
        ok: ["a key factor", "a key role", "a key issue", "a key skill"],
        no: ["Education is very key."] },
      { w: "major", verdict: "warn", degree: "=", scope: "⊂", att: "=", register: "Neutral",
        pair: ["Pollution is an *important* problem in big cities.", "Pollution is a *major* problem in big cities."],
        use: ["You talk about size or scale: problems, causes, changes."],
        avoid: ["The word comes after be: The problem is major is wrong.", "You talk about personal values: Family is major to me is wrong."],
        grammar: ["a major + N (only before a noun)"],
        ok: ["a major problem", "a major cause", "a major change", "a major role"],
        no: ["The problem is major.", "Family is major to me."] },
      { w: "vital", verdict: "warn", degree: "▲", scope: "⊂", att: "=", register: "Neutral",
        pair: ["Clean water is *important* for public health.", "Clean water is *vital* for public health."],
        use: ["You talk about life, health, safety or survival.", "Something is needed to keep a thing alive or working."],
        avoid: ["The topic is everyday and small. Vital will sound too strong.", "You describe a person: a vital person is wrong."],
        grammar: ["be vital for / to + N", "It is vital to + V", "It is vital that + S + V"],
        ok: ["vital for survival", "a vital role", "vital information", "vitally important"],
        no: ["a vital person"] },
      { w: "essential", verdict: "warn", degree: "▲", scope: "=", att: "=", register: "Neutral",
        pair: ["Practical skills are *important* for graduates.", "Practical skills are *essential* for graduates."],
        use: ["Something cannot be missing: without it, the thing does not work."],
        avoid: ["You talk about decisions or events: an essential decision is wrong."],
        grammar: ["be essential for + N", "It is essential to + V", "It is essential that + S + V"],
        ok: ["essential for success", "an essential skill", "essential services"],
        no: ["an essential decision"] },
      { w: "serious", verdict: "fail", degree: "—", scope: "≠", att: "−", register: "Neutral",
        pair: ["Teachers play an *important* role in society.", "Teachers play a *serious* role in society."],
        use: ["You talk about bad or dangerous things: a serious problem, a serious illness."],
        avoid: ["You want to say important. Serious does not mean important."],
        grammar: ["a serious + N (problem, illness, injury)"],
        ok: ["a serious problem", "a serious illness", "a serious injury"],
        no: ["a serious role", "a serious factor"] }
    ],
    more: [
      { w: "fundamental", verdict: "warn", degree: "▲", scope: "⊂", att: "=", register: "Formal",
        pair: ["Education is an *important* human right.", "Education is a *fundamental* human right."],
        use: ["You talk about the basic ideas everything else depends on: rights, principles, changes."],
        avoid: ["You describe people or small details."],
        grammar: ["a fundamental + N", "be fundamental to + N"],
        ok: ["a fundamental right", "a fundamental change", "a fundamental principle"],
        no: ["a fundamental person"] },
      { w: "critical", verdict: "warn", degree: "▲", scope: "=", att: "=", register: "Neutral",
        pair: ["Sleep is *important* for memory.", "Sleep is *critical* for memory."],
        use: ["You want the strength of crucial: critical for success."],
        avoid: ["The word comes before a person. A critical teacher means a teacher who criticises."],
        grammar: ["be critical for / to + N", "It is critical that + S + V"],
        ok: ["critical for success", "a critical moment", "critically important"],
        no: ["a critical teacher (= a teacher who criticises)"] }
    ]
  },
  {
    synonyms: [
      { w: "influential", verdict: "pass", degree: "=", scope: "=", att: "=", register: "Neutral",
        pair: ["He is an *important* figure in modern art.", "He is an *influential* figure in modern art."],
        use: ["A person or organisation changes what other people think or do."],
        avoid: ["You talk about decisions or events in general."],
        grammar: ["an influential + N", "be influential in + N / V-ing"],
        ok: ["an influential figure", "influential in politics", "an influential leader"],
        no: [] },
      { w: "prominent", verdict: "pass", degree: "=", scope: "=", att: "=", register: "Formal",
        pair: ["She is an *important* scientist.", "She is a *prominent* scientist."],
        use: ["The person is well known and stands out in their field."],
        avoid: ["You mean power or control, not fame."],
        grammar: ["a prominent + N", "play a prominent role in + N / V-ing"],
        ok: ["a prominent scientist", "a prominent figure", "a prominent role"],
        no: [] },
      { w: "powerful", verdict: "warn", degree: "▲", scope: "⊂", att: "=", register: "Neutral",
        pair: ["He is an *important* businessman.", "He is a *powerful* businessman."],
        use: ["The person controls others through money, politics or position."],
        avoid: ["Their influence is about ideas, like a writer or an artist. Use influential."],
        grammar: ["a powerful + N"],
        ok: ["a powerful leader", "a powerful company", "a powerful politician"],
        no: [] },
      { w: "leading", verdict: "warn", degree: "=", scope: "=", att: "=", register: "Neutral",
        pair: ["He is an *important* expert on climate change.", "He is a *leading* expert on climate change."],
        use: ["The word comes before a noun for the top people or companies in a field."],
        avoid: ["The word comes after be. The expert is leading changes the meaning."],
        grammar: ["a leading + N (only before a noun)"],
        ok: ["a leading expert", "a leading company", "a leading figure"],
        no: ["The expert is leading."] }
    ],
    more: []
  }
];

const ANT = [
  [
    { w: "insignificant", p: 15, opp: "strong", att: "=", register: "Formal", good: "pass",
      neg: { phrase: "by no means insignificant", vs: "=", note: "Same strength as important, with a careful academic tone." },
      pair: ["The impact of social media on teenagers is *important*.", "The impact of social media on teenagers is *by no means insignificant*."],
      contrast: { t: "While + N is important, + N is relatively insignificant.", ex: "While cost is *important*, distance is relatively *insignificant*." },
      trap: { text: "The researchers found the effect of diet to be *insignificant*.", q: "Diet had an *important* effect." },
      use: ["You write formally and want a measured, academic tone.", "You negate it: by no means insignificant, far from insignificant."],
      avoid: ["You describe a person. An insignificant person sounds rude."],
      ok: ["statistically insignificant", "an insignificant amount", "by no means insignificant"], no: ["an insignificant person"] },
    { w: "trivial", p: 6, opp: "strong", att: "−", register: "Neutral", good: "pass",
      neg: { phrase: "far from trivial", vs: "=", note: "Same strength as important. It answers people who think the thing does not matter." },
      pair: ["Choosing a university is *important*.", "Choosing a university is *far from trivial*."],
      contrast: { t: "Some people see + N as trivial, while others consider it important.", ex: "Some people see fashion as *trivial*, while others consider it *important* self-expression." },
      trap: { text: "Critics dismissed the change as *trivial*.", q: "Critics believed the change was *important*." },
      use: ["You report that someone thinks the thing does not deserve attention."],
      avoid: ["You want a neutral description. Trivial sounds dismissive."],
      ok: ["a trivial matter", "trivial details", "far from trivial"], no: ["a trivial person"] },
    { w: "minor", p: 32, opp: "mild", att: "=", register: "Neutral", good: "pass",
      neg: { phrase: "no minor + N", label: "no minor issue", vs: "=", note: "Same strength as important. Only before a noun: no minor issue." },
      pair: ["Air pollution is an *important* issue.", "Air pollution is *no minor* issue."],
      contrast: { t: "While + N is an important factor, + N plays only a minor role.", ex: "While cost is an *important* factor, location plays only a *minor* role." },
      trap: { text: "Weather played only a *minor* role in the decline.", q: "Weather was an *important* reason for the decline." },
      use: ["The thing matters a little, but less than others.", "You compare factors: a major cause and a minor cause."],
      avoid: ["You mean it does not matter at all. Minor still means it matters a little."],
      ok: ["a minor role", "a minor issue", "minor changes", "no minor issue"], no: [] },
    { w: "unimportant", p: 19, opp: "strong", att: "=", register: "Neutral", good: "warn",
      neg: { phrase: "not unimportant", vs: "▼", note: "Weaker than important. It sounds hesitant: matters a bit." },
      pair: ["Sleep is *important* for students.", "Sleep is *not unimportant* for students."],
      contrast: { t: "Some + N may seem unimportant, but they are often important.", ex: "Some details may seem *unimportant*, but they are often *important* in exams." },
      trap: { text: "Most respondents said price was *unimportant* to them.", q: "Price was *important* to most respondents." },
      use: ["You need a plain, clear word, for example in Speaking."],
      avoid: ["You negate it to mean important. Not unimportant sounds weaker and unsure."],
      ok: ["relatively unimportant", "seem unimportant"], no: [] }
  ],
  [
    { w: "minor", p: 28, opp: "mild", att: "=", register: "Neutral", good: "pass",
      neg: { phrase: "no minor + N", label: "no minor figure", vs: "=", note: "Same strength as important. Only before a noun: no minor figure." },
      pair: ["Nguyen Du is an *important* figure in Vietnamese literature.", "Nguyen Du is *no minor* figure in Vietnamese literature."],
      contrast: { t: "While some + N were important, others remained minor figures.", ex: "While some officials were *important*, others remained *minor* figures." },
      trap: { text: "He was a *minor* figure in the government.", q: "He was an *important* member of the government." },
      use: ["The person has some influence, but little."],
      avoid: ["You mean the person has no influence at all."],
      ok: ["a minor figure", "a minor role", "a minor official"], no: [] },
    { w: "obscure", p: 10, opp: "strong", att: "=", register: "Formal", good: "pass",
      neg: { phrase: "far from obscure", vs: "=", note: "Close to important and well known." },
      pair: ["She is an *important* name in her field.", "She is *far from obscure* in her field."],
      contrast: { t: "While some + N became important, many remained obscure.", ex: "While some artists became *important*, many remained *obscure*." },
      trap: { text: "The author was relatively *obscure* during her lifetime.", q: "The author was *important* during her lifetime." },
      use: ["The person or thing is not well known."],
      avoid: ["You mean the person has no power. Obscure is about fame, not power."],
      ok: ["an obscure poet", "remain obscure", "far from obscure"], no: [] }
  ]
];

const SCALE = [
  { ends: ["matters little", "matters most"], groups: [
    { p: 6, k: "ant", w: ["trivial"] }, { p: 17, k: "ant", w: ["insignificant", "unimportant"] }, { p: 32, k: "ant", w: ["minor"] },
    { p: 63, k: "syn", w: ["important", "significant", "key", "major"] },
    { p: 81, k: "syn", w: ["essential", "fundamental"] }, { p: 92, k: "syn", w: ["crucial", "critical", "vital"] } ] },
  { ends: ["little influence", "great influence"], groups: [
    { p: 10, k: "ant", w: ["obscure"] }, { p: 28, k: "ant", w: ["minor"] },
    { p: 63, k: "syn", w: ["important", "influential", "prominent", "leading"] }, { p: 82, k: "syn", w: ["powerful"] } ] }
];

const FAMILY = {
  importance: { pos: "noun" },
  importantly: { pos: "adverb" },
  unimportant: { pos: "adjective", rel: "opposite" }
};

window.CURATED[ENTRY.word] = { entry: ENTRY, syn: SYN, ant: ANT, scale: SCALE, family: FAMILY, baseP: 63 };
})();
