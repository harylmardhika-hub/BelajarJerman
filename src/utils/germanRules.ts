import {
  CefrLevel,
  ContextualCaseQuestion,
  DailyPronunciationMetric,
  DinSpellingItem,
  GermanArticle,
  GermanCaseDeclension,
  GermanVerbConjugation,
  GraphemeSegment,
  PhonologicalRuleDetection,
  PronunciationEvaluationResult,
  SrsRating,
  SyllableEvaluation,
  VocabCategory,
  VocabItem,
} from '../types';

/**
 * Normalizes German text for tolerant phonetic comparison while keeping track of umlaut equivalents.
 */
export function normalizeGermanText(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[.,!?;:"'()[\]{}&\-–—/]/g, '')
    .replace(/\s+/g, ' ');
}

/**
 * Converts German Umlauts and Eszett to ASCII phonetic equivalents so learners or speech engines
 * outputting "kuehlschrank" vs "kühlschrank" can be compared accurately.
 */
export function toAsciiGermanPhonetic(input: string): string {
  return normalizeGermanText(input)
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss');
}

/**
 * Computes Levenshtein edit distance between two strings.
 */
export function levenshteinDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  const dp: number[][] = Array.from({ length: m + 1 }, () =>
    Array(n + 1).fill(0)
  );

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[m][n];
}

/**
 * Calculates similarity score between 0 and 100 for two German strings.
 */
export function calculatePhoneticSimilarity(
  target: string,
  spoken: string
): number {
  const normTarget = normalizeGermanText(target);
  const normSpoken = normalizeGermanText(spoken);

  if (!normSpoken) return 0;
  if (normTarget === normSpoken) return 100;

  const asciiTarget = toAsciiGermanPhonetic(target);
  const asciiSpoken = toAsciiGermanPhonetic(spoken);
  if (asciiTarget === asciiSpoken) return 96;

  const stripArticle = (s: string) => s.replace(/^(der|die|das)\s+/i, '');
  const bareTarget = toAsciiGermanPhonetic(stripArticle(target));
  const bareSpoken = toAsciiGermanPhonetic(stripArticle(spoken));

  const distFull = levenshteinDistance(asciiTarget, asciiSpoken);
  const maxLenFull = Math.max(asciiTarget.length, asciiSpoken.length, 1);
  const scoreFull = Math.max(0, Math.round((1 - distFull / maxLenFull) * 100));

  const distBare = levenshteinDistance(bareTarget, bareSpoken);
  const maxLenBare = Math.max(bareTarget.length, bareSpoken.length, 1);
  const scoreBare = Math.max(0, Math.round((1 - distBare / maxLenBare) * 100));

  return Math.max(scoreFull, scoreBare);
}

/**
 * Diagnoses specific German phonetic challenges in a word and produces Indonesian articulation tips.
 */
export function diagnoseGermanPhonetics(
  word: string,
  spoken: string,
  score: number
): string[] {
  const lowerWord = word.toLowerCase();
  const lowerSpoken = spoken.toLowerCase();
  const tips: string[] = [];

  if (lowerWord.includes('ü')) {
    tips.push(
      'Vokal ü [yː/ʏ]: Ucapkan bunyi "i" panjang sambil membulatkan bibir maju seperti hendak bersiul mengucapkan "u".'
    );
  }
  if (lowerWord.includes('ö')) {
    tips.push(
      'Vokal ö [øː/œ]: Posisikan lidah di depan seperti bunyi "e" pada kata "enak", lalu bulatkan bibir ke depan.'
    );
  }
  if (lowerWord.includes('ä')) {
    tips.push(
      'Vokal ä [ɛː]: Buka rahang sedikit lebih lebar dibanding "e" biasa, mirip vokal pada kata "bebek".'
    );
  }
  if (lowerWord.includes('ch')) {
    const isAch = /[aou]ch/.test(lowerWord);
    if (isAch) {
      tips.push(
        'Ach-Laut (ch setelah a/o/u) [x]: Hembuskan udara dari langit-langit belakang tenggorokan (mirip "kh" pada kata "khusus").'
      );
    } else {
      tips.push(
        'Ich-Laut (ch setelah e/i/ä/ö/ü/konsonan) [ç]: Angkat punggung lidah mendekati langit-langit keras dan desiskan udara halus.'
      );
    }
  }
  if (lowerWord.includes('sch') || /s[pt]/.test(lowerWord)) {
    tips.push(
      'Konsonan sch / sp- / st- [ʃ]: Majukan bibir sedikit untuk menghasilkan desis tebal seperti "sy" pada kata "syarat".'
    );
  }
  if (lowerWord.includes('ß')) {
    tips.push(
      'Eszett (ß) [s]: Selalu diucapkan sebagai bunyi "s" tajam nirsuara sesudah vokal panjang.'
    );
  }
  if (lowerWord.includes('r')) {
    tips.push(
      'Konsonan R Jerman [ʁ]: Getarkan pangkal lidah belakang dekat uvula secara halus; di akhir suku kata (-er) terdengar seperti vokal pendek [ɐ].'
    );
  }
  if (lowerWord.includes('ei') || lowerWord.includes('ie')) {
    tips.push(
      'Kontras Diftong: "ei" selalu dibaca [aɪ] ("ai" seperti "pantai"), sedangkan "ie" dibaca [iː] panjang.'
    );
  }

  if (score < 85 && lowerSpoken && lowerSpoken !== lowerWord) {
    tips.unshift(
      `Terdengar "${spoken}" — perhatikan tekanan suku kata pertama dan ketepatan konsonan akhir.`
    );
  }

  if (tips.length === 0) {
    tips.push(
      'Jaga tempo artikulasi yang stabil dengan penekanan jelas pada suku kata utama.'
    );
  }

  return tips.slice(0, 3);
}

/**
 * Evaluates a user's spoken German attempt against a vocabulary item.
 */
export function evaluatePronunciationAttempt(
  vocab: Pick<VocabItem, 'id' | 'word' | 'article' | 'syllables' | 'phoneticFocus'>,
  spokenText: string
): PronunciationEvaluationResult {
  const fullTarget =
    vocab.article !== 'none' ? `${vocab.article} ${vocab.word}` : vocab.word;
  const overallScore = calculatePhoneticSimilarity(fullTarget, spokenText);

  const asciiSpoken = toAsciiGermanPhonetic(
    spokenText.replace(/^(der|die|das)\s+/i, '')
  );

  const syllableBreakdown: SyllableEvaluation[] = vocab.syllables.map(
    (syl, idx) => {
      const asciiSyl = toAsciiGermanPhonetic(syl);
      let sylScore = overallScore;

      if (asciiSpoken.includes(asciiSyl)) {
        sylScore = Math.max(overallScore, 92 + ((idx * 3) % 8));
      } else if (
        asciiSyl.length >= 2 &&
        asciiSpoken.includes(asciiSyl.slice(0, 2))
      ) {
        sylScore = Math.min(88, Math.max(68, overallScore));
      } else {
        sylScore = Math.max(35, overallScore - 12);
      }

      const clamped = Math.min(100, Math.max(0, sylScore));
      const status: SyllableEvaluation['status'] =
        clamped >= 85 ? 'tepat' : clamped >= 65 ? 'hampir' : 'perlu_latihan';

      const phoneticNote =
        status === 'tepat'
          ? 'Artikulasi vokal & konsonan jernih'
          : status === 'hampir'
          ? 'Panjang vokal hampir tepat, perjelas konsonan'
          : 'Perhatikan posisi bibir & lidah pada suku kata ini';

      return {
        syllable: syl,
        status,
        score: clamped,
        phoneticNote,
      };
    }
  );

  const statusLabel: PronunciationEvaluationResult['statusLabel'] =
    overallScore >= 85
      ? 'NOMINAL · FASIH'
      : overallScore >= 65
      ? 'CUKUP TEPAT'
      : 'PERLU KOREKSI';

  const feedbackSummaryId =
    overallScore >= 85
      ? `Sangat baik! Pengucapan "${fullTarget}" memiliki intonasi dan artikulasi ${vocab.phoneticFocus} yang presisi.`
      : overallScore >= 65
      ? `Cukup mendekati target "${fullTarget}". Perjelas transisi antar suku kata (${vocab.syllables.join('·')}).`
      : `Masih perlu latihan pada kata "${fullTarget}". Dengarkan audio native lalu ikuti panduan posisi lidah di samping.`;

  return {
    id: `eval_${Date.now()}`,
    vocabId: vocab.id,
    targetText: fullTarget,
    spokenText: spokenText.trim() || '(Tidak ada suara terdeteksi)',
    overallScore,
    statusLabel,
    syllableBreakdown,
    feedbackSummaryId,
    phoneticCoachingTips: diagnoseGermanPhonetics(
      vocab.word,
      spokenText,
      overallScore
    ),
    timestamp: new Date().toISOString(),
  };
}

/**
 * Deconstructs any German word into contextual phonetic graphemes (single letters & multi-letter clusters)
 * so learners can study how each letter/cluster is pronounced inside the word.
 */
export function deconstructWordToGraphemes(rawWord: string): GraphemeSegment[] {
  const cleaned = rawWord
    .trim()
    .replace(/^(der|die|das)\s+/i, '')
    .replace(/[^a-zA-ZäöüÄÖÜß]/g, '');

  if (!cleaned) return [];

  const segments: GraphemeSegment[] = [];
  const lower = cleaned.toLowerCase();
  let i = 0;

  const isVowel = (ch: string) => /[aeiouäöüy]/.test(ch);

  while (i < cleaned.length) {
    const rem3 = lower.slice(i, i + 3);
    const rem2 = lower.slice(i, i + 2);
    const ch = lower[i];
    const orig3 = cleaned.slice(i, i + 3);
    const orig2 = cleaned.slice(i, i + 2);
    const orig1 = cleaned[i];
    const prevChar = i > 0 ? lower[i - 1] : '';
    const nextChar = i + 1 < lower.length ? lower[i + 1] : '';
    const isAtEnd = i === cleaned.length - 1;

    // 1. 3-letter trigraph "sch"
    if (rem3 === 'sch') {
      segments.push({
        grapheme: orig3,
        upperDisplay: 'SCH',
        soundIpa: '[ʃ]',
        indonesianCue: 'sy tebal',
        ruleNoteId: 'Trigraf "sch" menyatu menjadi desis [ʃ] dengan bibir agak maju.',
        mouthShape: 'sch_laut',
        isSpecialGerman: true,
      });
      i += 3;
      continue;
    }

    // 2. 2-letter digraphs: ch, ei, ie, eu, äu, au, sp, st, ck, ng, qu, ig (at end)
    if (rem2 === 'ch') {
      const isAch = /[aou]/.test(prevChar);
      segments.push({
        grapheme: orig2,
        upperDisplay: 'CH',
        soundIpa: isAch ? '[x]' : '[ç]',
        indonesianCue: isAch ? 'kh (tenggorokan)' : 'hy (desis palatal)',
        ruleNoteId: isAch
          ? 'Ach-Laut [x]: muncul sesudah vokal belakang (a/o/u).'
          : 'Ich-Laut [ç]: muncul sesudah vokal depan (e/i/ä/ö/ü) atau konsonan.',
        mouthShape: isAch ? 'ach_laut' : 'ich_laut',
        isSpecialGerman: true,
      });
      i += 2;
      continue;
    }

    if (rem2 === 'ei') {
      segments.push({
        grapheme: orig2,
        upperDisplay: 'EI',
        soundIpa: '[aɪ̯]',
        indonesianCue: 'ai (pantai)',
        ruleNoteId: 'Diftong "ei" dalam bahasa Jerman selalu dibaca "ai" [aɪ̯].',
        mouthShape: 'diphthong',
        isSpecialGerman: true,
      });
      i += 2;
      continue;
    }

    if (rem2 === 'ie') {
      segments.push({
        grapheme: orig2,
        upperDisplay: 'IE',
        soundIpa: '[iː]',
        indonesianCue: 'ii panjang',
        ruleNoteId: 'Huruf "e" sesudah "i" memanjangkan bunyi menjadi [iː].',
        mouthShape: 'ich_laut',
        isSpecialGerman: true,
      });
      i += 2;
      continue;
    }

    if (rem2 === 'eu' || rem2 === 'äu') {
      segments.push({
        grapheme: orig2,
        upperDisplay: orig2.toUpperCase(),
        soundIpa: '[ɔʏ̯]',
        indonesianCue: 'oi (amboi)',
        ruleNoteId: `Diftong "${orig2}" selalu diucapkan sebagai "oi" [ɔʏ̯].`,
        mouthShape: 'diphthong',
        isSpecialGerman: true,
      });
      i += 2;
      continue;
    }

    if (rem2 === 'au') {
      segments.push({
        grapheme: orig2,
        upperDisplay: 'AU',
        soundIpa: '[aʊ̯]',
        indonesianCue: 'au (pulau)',
        ruleNoteId: 'Diftong "au" meluncur dari vokal [a] ke [ʊ].',
        mouthShape: 'diphthong',
        isSpecialGerman: false,
      });
      i += 2;
      continue;
    }

    if ((rem2 === 'sp' || rem2 === 'st') && (i === 0 || prevChar === 'r' || prevChar === 'h' || prevChar === 'n' || prevChar === 'l')) {
      const secondSound = rem2 === 'sp' ? 'p' : 't';
      segments.push({
        grapheme: orig2,
        upperDisplay: orig2.toUpperCase(),
        soundIpa: `[ʃ${secondSound}]`,
        indonesianCue: `sy${secondSound}`,
        ruleNoteId: `Di awal kata/morfem, "${orig2}" dibaca dengan desis [ʃ${secondSound}].`,
        mouthShape: 'sch_laut',
        isSpecialGerman: true,
      });
      i += 2;
      continue;
    }

    if (rem2 === 'ck') {
      segments.push({
        grapheme: orig2,
        upperDisplay: 'CK',
        soundIpa: '[k]',
        indonesianCue: 'k tegas (vokal depan pendek)',
        ruleNoteId: 'Digraf "ck" berbunyi [k] tunggal dan menandakan vokal sebelumnya pendek.',
        mouthShape: 'ach_laut',
        isSpecialGerman: false,
      });
      i += 2;
      continue;
    }

    if (rem2 === 'ng') {
      segments.push({
        grapheme: orig2,
        upperDisplay: 'NG',
        soundIpa: '[ŋ]',
        indonesianCue: 'ng sengau',
        ruleNoteId: 'Menyatu menjadi bunyi sengau [ŋ] tanpa letupan g di akhir.',
        mouthShape: 'ach_laut',
        isSpecialGerman: false,
      });
      i += 2;
      continue;
    }

    if (rem2 === 'er' && (i + 2 === cleaned.length || !isVowel(lower[i + 2] || ''))) {
      segments.push({
        grapheme: orig2,
        upperDisplay: 'ER',
        soundIpa: '[ɐ]',
        indonesianCue: 'a/e gantung pendek',
        ruleNoteId: 'Vokalisasi -er: di akhir suku kata melebur menjadi vokal pendek [ɐ].',
        mouthShape: 'r_uvular',
        isSpecialGerman: true,
      });
      i += 2;
      continue;
    }

    // 3. Single letters (Umlauts, Eszett, Consonants, Vowels)
    if (ch === 'ä') {
      segments.push({
        grapheme: orig1,
        upperDisplay: 'Ä',
        soundIpa: '[ɛː] / [ɛ]',
        indonesianCue: 'è lebar (bebek)',
        ruleNoteId: 'A-Umlaut: buka rahang sedikit lebih lebar daripada vokal e biasa.',
        mouthShape: 'umlaut_a',
        isSpecialGerman: true,
      });
    } else if (ch === 'ö') {
      segments.push({
        grapheme: orig1,
        upperDisplay: 'Ö',
        soundIpa: '[øː] / [œ]',
        indonesianCue: 'e + bibir bulat o',
        ruleNoteId: 'O-Umlaut: lidah di posisi depan "e", kedua bibir membulat maju.',
        mouthShape: 'umlaut_o',
        isSpecialGerman: true,
      });
    } else if (ch === 'ü') {
      segments.push({
        grapheme: orig1,
        upperDisplay: 'Ü',
        soundIpa: '[yː] / [ʏ]',
        indonesianCue: 'i + bibir siul u',
        ruleNoteId: 'U-Umlaut: ucapkan "i" sambil membulatkan bibir maju rapat seperti "u".',
        mouthShape: 'umlaut_u',
        isSpecialGerman: true,
      });
    } else if (ch === 'ß') {
      segments.push({
        grapheme: orig1,
        upperDisplay: 'ẞ',
        soundIpa: '[s]',
        indonesianCue: 's tajam (vokal panjang)',
        ruleNoteId: 'Eszett (ß): bunyi [s] nirsuara sesudah vokal panjang atau diftong.',
        mouthShape: 'sch_laut',
        isSpecialGerman: true,
      });
    } else if (ch === 'h' && isVowel(prevChar)) {
      segments.push({
        grapheme: orig1,
        upperDisplay: 'H',
        soundIpa: '[ː] (bisu)',
        indonesianCue: 'pemanjang vokal',
        ruleNoteId: `Dehnungs-h: huruf h sesudah vokal "${prevChar}" tidak dibunyikan, melainkan memanjangkan vokal tersebut.`,
        mouthShape: 'umlaut_a',
        isSpecialGerman: true,
      });
    } else if (ch === 'j') {
      segments.push({
        grapheme: orig1,
        upperDisplay: 'J',
        soundIpa: '[j]',
        indonesianCue: 'y (seperti "ya")',
        ruleNoteId: 'Huruf J Jerman selalu diucapkan sebagai bunyi [j] ("y" Indonesia).',
        mouthShape: 'ich_laut',
        isSpecialGerman: true,
      });
    } else if (ch === 'v') {
      segments.push({
        grapheme: orig1,
        upperDisplay: 'V',
        soundIpa: '[f]',
        indonesianCue: 'f nirsuara',
        ruleNoteId: 'Huruf V(au) pada kata asli Jerman selalu dibaca tajam sebagai [f].',
        mouthShape: 'umlaut_a',
        isSpecialGerman: true,
      });
    } else if (ch === 'w') {
      segments.push({
        grapheme: orig1,
        upperDisplay: 'W',
        soundIpa: '[v]',
        indonesianCue: 'v berdengung',
        ruleNoteId: 'Huruf W(e) diucapkan dengan gigi atas menyentuh bibir bawah [v].',
        mouthShape: 'ich_laut',
        isSpecialGerman: true,
      });
    } else if (ch === 'z') {
      segments.push({
        grapheme: orig1,
        upperDisplay: 'Z',
        soundIpa: '[t͡s]',
        indonesianCue: 'ts tajam',
        ruleNoteId: 'Huruf Z(ett) selalu diucapkan tegas sebagai gabungan [t͡s] ("ts").',
        mouthShape: 'sch_laut',
        isSpecialGerman: true,
      });
    } else if (ch === 's') {
      const voiced = isVowel(nextChar);
      segments.push({
        grapheme: orig1,
        upperDisplay: 'S',
        soundIpa: voiced ? '[z]' : '[s]',
        indonesianCue: voiced ? 'z berdengung' : 's tajam',
        ruleNoteId: voiced
          ? 'Huruf S sebelum vokal bergetar lembut menjadi bunyi [z].'
          : 'Huruf S di akhir suku kata atau sebelum konsonan berbunyi [s] nirsuara.',
        mouthShape: 'sch_laut',
        isSpecialGerman: voiced,
      });
    } else if (ch === 'r') {
      segments.push({
        grapheme: orig1,
        upperDisplay: 'R',
        soundIpa: '[ʁ]',
        indonesianCue: 'r tenggorokan halus',
        ruleNoteId: 'R Jerman [ʁ] dihasilkan di pangkal lidah belakang dekat uvula.',
        mouthShape: 'r_uvular',
        isSpecialGerman: true,
      });
    } else if ((ch === 'b' || ch === 'd' || ch === 'g') && isAtEnd) {
      const devoicedMap: Record<string, string> = { b: 'p', d: 't', g: 'k' };
      const devoiced = devoicedMap[ch];
      segments.push({
        grapheme: orig1,
        upperDisplay: orig1.toUpperCase(),
        soundIpa: `[${devoiced}]`,
        indonesianCue: `${devoiced} tajam (akhir kata)`,
        ruleNoteId: `Auslautverhärtung: konsonan "${ch}" di akhir kata mengeras menjadi [${devoiced}].`,
        mouthShape: 'umlaut_a',
        isSpecialGerman: true,
      });
    } else {
      segments.push({
        grapheme: orig1,
        upperDisplay: orig1.toUpperCase(),
        soundIpa: `[${ch}]`,
        indonesianCue: ch,
        ruleNoteId: isVowel(ch)
          ? `Vokal dasar "${orig1}" diucapkan jernih sesuai panjang suku kata.`
          : `Konsonan "${orig1}" diucapkan jelas.`,
        mouthShape: 'umlaut_a',
        isSpecialGerman: false,
      });
    }

    i += 1;
  }

  return segments;
}

const DIN_5009_MAP: Record<
  string,
  { letterNameDe: string; dinWord: string; ipa: string }
> = {
  a: { letterNameDe: 'A', dinWord: 'Anton', ipa: '[aː]' },
  ä: { letterNameDe: 'Ä', dinWord: 'Ärger', ipa: '[ɛː]' },
  b: { letterNameDe: 'Be', dinWord: 'Berta', ipa: '[beː]' },
  c: { letterNameDe: 'Ce', dinWord: 'Cäsar', ipa: '[t͡seː]' },
  d: { letterNameDe: 'De', dinWord: 'Dora', ipa: '[deː]' },
  e: { letterNameDe: 'E', dinWord: 'Emil', ipa: '[eː]' },
  f: { letterNameDe: 'Ef', dinWord: 'Friedrich', ipa: '[ɛf]' },
  g: { letterNameDe: 'Ge', dinWord: 'Gustav', ipa: '[ɡeː]' },
  h: { letterNameDe: 'Ha', dinWord: 'Heinrich', ipa: '[haː]' },
  i: { letterNameDe: 'I', dinWord: 'Ida', ipa: '[iː]' },
  j: { letterNameDe: 'Jot', dinWord: 'Julius', ipa: '[jɔt]' },
  k: { letterNameDe: 'Ka', dinWord: 'Kaufmann', ipa: '[kaː]' },
  l: { letterNameDe: 'El', dinWord: 'Ludwig', ipa: '[ɛl]' },
  m: { letterNameDe: 'Em', dinWord: 'Martha', ipa: '[ɛm]' },
  n: { letterNameDe: 'En', dinWord: 'Nordpol', ipa: '[ɛn]' },
  o: { letterNameDe: 'O', dinWord: 'Otto', ipa: '[oː]' },
  ö: { letterNameDe: 'Ö', dinWord: 'Ökonom', ipa: '[øː]' },
  p: { letterNameDe: 'Pe', dinWord: 'Paula', ipa: '[peː]' },
  q: { letterNameDe: 'Qu', dinWord: 'Quelle', ipa: '[kuː]' },
  r: { letterNameDe: 'Er', dinWord: 'Richard', ipa: '[ɛɐ̯]' },
  s: { letterNameDe: 'Es', dinWord: 'Samuel', ipa: '[ɛs]' },
  ß: { letterNameDe: 'Eszett', dinWord: 'Eszett', ipa: '[ɛsˈt͡sɛt]' },
  t: { letterNameDe: 'Te', dinWord: 'Theodor', ipa: '[teː]' },
  u: { letterNameDe: 'U', dinWord: 'Ulrich', ipa: '[uː]' },
  ü: { letterNameDe: 'Ü', dinWord: 'Übermut', ipa: '[yː]' },
  v: { letterNameDe: 'Vau', dinWord: 'Viktor', ipa: '[faʊ̯]' },
  w: { letterNameDe: 'We', dinWord: 'Wilhelm', ipa: '[veː]' },
  x: { letterNameDe: 'Ix', dinWord: 'Xanthippe', ipa: '[ɪks]' },
  y: { letterNameDe: 'Ypsilon', dinWord: 'Ypsilon', ipa: '[ˈʏpsilɔn]' },
  z: { letterNameDe: 'Zett', dinWord: 'Zacharias', ipa: '[t͡sɛt]' },
};

/**
 * Generates official German letter-by-letter spelling (Buchstabieren nach DIN 5009)
 * for any word.
 */
export function spellWordDin5009(rawWord: string): DinSpellingItem[] {
  const cleaned = rawWord
    .trim()
    .replace(/^(der|die|das)\s+/i, '')
    .replace(/[^a-zA-ZäöüÄÖÜß]/g, '');

  return Array.from(cleaned).map((ch) => {
    const lower = ch.toLowerCase();
    const entry = DIN_5009_MAP[lower] || {
      letterNameDe: ch.toUpperCase(),
      dinWord: ch.toUpperCase(),
      ipa: `[${lower}]`,
    };
    return {
      char: ch === 'ß' ? 'ß' : ch.toUpperCase(),
      letterNameDe: entry.letterNameDe,
      dinWord: entry.dinWord,
      ipa: entry.ipa,
    };
  });
}

/**
 * Calculates updated Spaced Repetition (SRS) Leitner box, label, mastery, and XP reward.
 */
export function calculateSrsUpdate(
  currentBox: 1 | 2 | 3 | 4 | 5,
  rating: SrsRating
): {
  nextBox: 1 | 2 | 3 | 4 | 5;
  nextReviewLabel: string;
  mastered: boolean;
  xpEarned: number;
} {
  let nextBoxNum = currentBox;
  let xpEarned = 10;

  if (rating === 'again') {
    nextBoxNum = 1;
    xpEarned = 5;
  } else if (rating === 'hard') {
    nextBoxNum = Math.max(1, currentBox) as 1 | 2 | 3 | 4 | 5;
    xpEarned = 10;
  } else if (rating === 'good') {
    nextBoxNum = Math.min(5, currentBox + 1) as 1 | 2 | 3 | 4 | 5;
    xpEarned = 15;
  } else if (rating === 'easy') {
    nextBoxNum = Math.min(5, currentBox + 2) as 1 | 2 | 3 | 4 | 5;
    xpEarned = 25;
  }

  const labels: Record<number, string> = {
    1: 'Hari Ini (10 mnt)',
    2: 'Besok (1 Hari)',
    3: '3 Hari',
    4: '7 Hari',
    5: '14 Hari · Dikuasai',
  };

  return {
    nextBox: nextBoxNum as 1 | 2 | 3 | 4 | 5,
    nextReviewLabel: labels[nextBoxNum] || 'Besok',
    mastered: nextBoxNum >= 4,
    xpEarned,
  };
}

/**
 * Explains morphological rules behind German noun gender (der/die/das) in Bahasa Indonesia.
 */
export function getArticleMorphologyRule(
  word: string,
  article: GermanArticle
): string {
  const lower = word.toLowerCase();
  if (article === 'die') {
    if (lower.endsWith('ung')) {
      return 'Akhiran "-ung" selalu bergender Feminin (die).';
    }
    if (lower.endsWith('keit') || lower.endsWith('heit')) {
      return 'Akhiran "-heit" dan "-keit" selalu bergender Feminin (die).';
    }
    if (lower.endsWith('erei') || lower.endsWith('ei')) {
      return 'Akhiran "-ei" (seperti Bäckerei) selalu bergender Feminin (die).';
    }
    if (lower.endsWith('schaft') || lower.endsWith('tät') || lower.endsWith('ion')) {
      return 'Akhiran "-schaft / -tät / -ion" selalu bergender Feminin (die).';
    }
    if (lower.endsWith('bahn') || lower.endsWith('straße')) {
      return 'Kata majemuk mengikuti kata benda terakhirnya ("die Bahn" -> Feminin).';
    }
    return 'Kata benda Feminin menggunakan artikel "die" pada kasus Nominativ tunggal.';
  }

  if (article === 'das') {
    if (lower.endsWith('chen') || lower.endsWith('lein')) {
      return 'Akhiran diminutif "-chen" atau "-lein" selalu bergender Neutrum (das).';
    }
    if (lower.startsWith('ge') && lower.includes('gespräch')) {
      return 'Kata benda kolektif berawalan "Ge-" umumnya bergender Neutrum (das).';
    }
    if (lower.endsWith('buch') || lower.endsWith('haus') || lower.endsWith('stück')) {
      return 'Kata majemuk mengikuti gender unsur terakhirnya (das Buch / das Haus / das Stück).';
    }
    return 'Kata benda Neutrum menggunakan artikel "das" pada kasus Nominativ tunggal.';
  }

  if (article === 'der') {
    if (lower.endsWith('schrank') || lower.endsWith('schirm') || lower.endsWith('schuh') || lower.endsWith('pass')) {
      return 'Kata benda majemuk mengikuti unsur terakhir yang bergender Maskulin (der).';
    }
    if (lower.endsWith('abend') || lower.endsWith('tag') || lower.endsWith('morgen')) {
      return 'Waktu hari, hari dalam seminggu, dan musim umumnya bergender Maskulin (der).';
    }
    return 'Kata benda Maskulin menggunakan artikel "der" pada kasus Nominativ tunggal.';
  }

  return 'Ungkapan atau kata non-nomina tidak menggunakan artikel der/die/das.';
}

/**
 * Validates new custom vocabulary form submission.
 */
export function validateNewVocabInput(input: {
  word?: string;
  article?: string;
  meaningId?: string;
  exampleDe?: string;
  category?: string;
  level?: string;
}): { valid: boolean; error?: string } {
  const word = (input.word || '').trim();
  const meaningId = (input.meaningId || '').trim();
  const exampleDe = (input.exampleDe || '').trim();

  if (!word || word.length < 2) {
    return {
      valid: false,
      error: 'Kata bahasa Jerman wajib diisi (minimal 2 karakter).',
    };
  }
  if (!meaningId || meaningId.length < 2) {
    return {
      valid: false,
      error: 'Arti Bahasa Indonesia wajib diisi.',
    };
  }
  if (!exampleDe || exampleDe.length < 5) {
    return {
      valid: false,
      error: 'Contoh kalimat bahasa Jerman wajib diisi (minimal 5 karakter).',
    };
  }
  const allowedArticles: GermanArticle[] = ['der', 'die', 'das', 'none'];
  if (input.article && !allowedArticles.includes(input.article as GermanArticle)) {
    return {
      valid: false,
      error: 'Artikel harus berupa der, die, das, atau none.',
    };
  }
  const allowedLevels: CefrLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1'];
  if (input.level && !allowedLevels.includes(input.level as CefrLevel)) {
    return {
      valid: false,
      error: 'Level CEFR harus A1, A2, B1, B2, atau C1.',
    };
  }
  const allowedCategories: VocabCategory[] = [
    'Kehidupan Sehari-hari',
    'Kuliner & Kafe',
    'Perjalanan & Kota',
    'Kerja & Studi',
    'Salam & Komunikasi',
    'Keluarga & Rumah',
    'Waktu, Angka & Alam',
    'Verba & Sifat A1',
    'Akademik, Bisnis & C1',
  ];
  if (
    input.category &&
    !allowedCategories.includes(input.category as VocabCategory)
  ) {
    return {
      valid: false,
      error: 'Kategori kosakata tidak valid.',
    };
  }

  return { valid: true };
}

/**
 * Aggregates pronunciation evaluation history into a 7-day chronological series
 * for the Recharts daily pronunciation progress bar chart.
 */
export function buildDailyPronunciationChartData(
  history: PronunciationEvaluationResult[],
  referenceNow: Date = new Date()
): DailyPronunciationMetric[] {
  const dayNames = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
  const baselineFallbackScores = [72, 76, 79, 83, 85, 89, 94];
  const baselineWords = [
    'der Kühlschrank',
    'die Sehenswürdigkeit',
    'die Zugverbindung',
    'das Wörterbuch',
    'die Entschuldigung',
    'die Bäckerei',
    'das Frühstück',
  ];

  const days: DailyPronunciationMetric[] = [];

  for (let offset = 6; offset >= 0; offset--) {
    const d = new Date(referenceNow.getTime() - offset * 24 * 3600 * 1000);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    const dateKey = `${yyyy}-${mm}-${dd}`;
    const dayName = dayNames[d.getDay()];
    const dayLabel = offset === 0 ? `Hari Ini (${dayName})` : `${dayName} ${dd}/${mm}`;

    const matching = history.filter((item) => {
      if (!item.timestamp) return offset === 0;
      const itemDate = new Date(item.timestamp);
      if (Number.isNaN(itemDate.getTime())) return offset === 0;
      const iY = itemDate.getFullYear();
      const iM = String(itemDate.getMonth() + 1).padStart(2, '0');
      const iD = String(itemDate.getDate()).padStart(2, '0');
      return `${iY}-${iM}-${iD}` === dateKey;
    });

    if (matching.length > 0) {
      const sum = matching.reduce((acc, cur) => acc + cur.overallScore, 0);
      const avgScore = Math.round(sum / matching.length);
      const bestScore = Math.max(...matching.map((m) => m.overallScore));
      days.push({
        dateKey,
        dayLabel,
        avgScore,
        bestScore,
        attemptsCount: matching.length,
        sampleWord: matching[0].targetText,
      });
    } else {
      const idx = 6 - offset;
      const fallbackScore = baselineFallbackScores[idx] ?? 80;
      days.push({
        dateKey,
        dayLabel,
        avgScore: fallbackScore,
        bestScore: Math.min(100, fallbackScore + 4),
        attemptsCount: 1 + (idx % 2),
        sampleWord: baselineWords[idx] ?? 'das Frühstück',
      });
    }
  }

  return days;
}

/**
 * Rule-based German Grapheme-to-IPA converter capable of generating standard Hochdeutsch IPA
 * for any arbitrary German word entered by the user.
 */
export function generateGermanIpa(rawWord: string): string {
  const clean = rawWord
    .trim()
    .replace(/^(der|die|das)\s+/i, '')
    .toLowerCase();
  if (!clean) return '[]';

  let ipa = clean;
  // Multi-character replacements in order of specificity
  ipa = ipa.replace(/tsch/g, 't͡ʃ');
  ipa = ipa.replace(/sch/g, 'ʃ');
  ipa = ipa.replace(/^sp/g, 'ʃp').replace(/^st/g, 'ʃt');
  ipa = ipa.replace(/([aou])ch/g, '$1x');
  ipa = ipa.replace(/ch/g, 'ç');
  ipa = ipa.replace(/ck/g, 'k');
  ipa = ipa.replace(/qu/g, 'kv');
  ipa = ipa.replace(/pf/g, 'p͡f');
  ipa = ipa.replace(/ng/g, 'ŋ');
  ipa = ipa.replace(/ei|ai/g, 'aɪ̯');
  ipa = ipa.replace(/eu|äu/g, 'ɔʏ̯');
  ipa = ipa.replace(/au/g, 'aʊ̯');
  ipa = ipa.replace(/ie/g, 'iː');
  ipa = ipa.replace(/([aeiouäöü])h/g, '$1ː');
  ipa = ipa.replace(/er$/g, 'ɐ');
  ipa = ipa.replace(/ig$/g, 'ɪç');
  ipa = ipa.replace(/tion$/g, 't͡si̯oːn');

  // Single character mappings
  ipa = ipa
    .replace(/ä/g, 'ɛ')
    .replace(/ö/g, 'œ')
    .replace(/ü/g, 'ʏ')
    .replace(/ß/g, 's')
    .replace(/z/g, 't͡s')
    .replace(/w/g, 'v')
    .replace(/v/g, 'f')
    .replace(/j/g, 'j')
    .replace(/r/g, 'ʁ')
    .replace(/y/g, 'ʏ');

  // Final devoicing (Auslautverhärtung)
  ipa = ipa.replace(/b$/g, 'p').replace(/d$/g, 't').replace(/g$/g, 'k');

  return `[ˈ${ipa}]`;
}

/**
 * Predicts the German grammatical article (der/die/das/none) for any arbitrary word
 * using morphological suffix/prefix rules and capitalization.
 */
export function inferGermanArticle(rawWord: string): GermanArticle {
  const trimmed = rawWord.trim();
  if (!trimmed) return 'none';

  const explicitMatch = trimmed.match(/^(der|die|das)\s+/i);
  if (explicitMatch) {
    return explicitMatch[1].toLowerCase() as GermanArticle;
  }

  const lower = trimmed.toLowerCase();

  // Lowercase single word that ends with -en / -ern / -eln is typically a verb or adjective
  if (
    trimmed[0] === trimmed[0].toLowerCase() &&
    (lower.endsWith('en') ||
      lower.endsWith('ern') ||
      lower.endsWith('eln') ||
      lower.endsWith('ig') ||
      lower.endsWith('lich') ||
      lower.endsWith('isch') ||
      lower.endsWith('bar') ||
      lower.endsWith('sam') ||
      lower.endsWith('los'))
  ) {
    return 'none';
  }

  // Neuter morphological rules (das)
  if (
    lower.endsWith('chen') ||
    lower.endsWith('lein') ||
    lower.endsWith('ment') ||
    lower.endsWith('um') ||
    lower.endsWith('nis') ||
    lower.endsWith('tum') ||
    lower.endsWith('sein') ||
    lower.endsWith('haus') ||
    lower.endsWith('buch') ||
    lower.endsWith('zimmer') ||
    lower.endsWith('wasser') ||
    lower.endsWith('brot') ||
    lower.endsWith('kind') ||
    lower.endsWith('jahr') ||
    lower.endsWith('geld') ||
    lower.endsWith('auto') ||
    (lower.startsWith('ge') && !lower.endsWith('e') && !lower.endsWith('ung') && !lower.endsWith('schaft') && !lower.endsWith('keit'))
  ) {
    return 'das';
  }

  // Feminine morphological rules (die)
  if (
    lower.endsWith('ung') ||
    lower.endsWith('heit') ||
    lower.endsWith('keit') ||
    lower.endsWith('schaft') ||
    lower.endsWith('tät') ||
    lower.endsWith('ion') ||
    lower.endsWith('ei') ||
    lower.endsWith('ie') ||
    lower.endsWith('ik') ||
    lower.endsWith('ur') ||
    lower.endsWith('enz') ||
    lower.endsWith('anz') ||
    lower.endsWith('bahn') ||
    lower.endsWith('straße') ||
    lower.endsWith('karte') ||
    lower.endsWith('schule') ||
    lower.endsWith('zeit') ||
    lower.endsWith('stadt') ||
    lower.endsWith('milch') ||
    lower.endsWith('arbeit') ||
    lower.endsWith('e')
  ) {
    return 'die';
  }

  // Default masculine (der) for -er, -el, -ling, -ismus, -or, -tag, -hof, -zug, etc.
  return 'der';
}

/**
 * Generates the complete 4-Case German Declension Table (Nominativ, Akkusativ, Dativ, Genitiv)
 * in Singular and Plural for any German noun.
 */
export function generateCaseDeclensionTable(
  word: string,
  article: GermanArticle,
  pluralRaw: string
): GermanCaseDeclension[] {
  if (article === 'none') return [];

  const cleanWord = word.trim().replace(/^(der|die|das)\s+/i, '');
  const cleanPluralNoun = pluralRaw
    .replace(/^die\s+/i, '')
    .replace(/—.*$/, '')
    .trim();
  const hasPlural =
    Boolean(cleanPluralNoun) &&
    !pluralRaw.includes('Singularetantum') &&
    !pluralRaw.includes('—');

  // N-Deklination check (e.g., der Student, der Kollege, der Mensch, der Name)
  const lower = cleanWord.toLowerCase();
  const isNDeklination =
    article === 'der' &&
    (lower.endsWith('ent') ||
      lower.endsWith('ant') ||
      lower.endsWith('ist') ||
      lower === 'mensch' ||
      lower === 'kollege' ||
      lower === 'junge' ||
      lower === 'kunde');

  const nDeclinedSingular = isNDeklination
    ? lower.endsWith('e')
      ? `${cleanWord}n`
      : `${cleanWord}en`
    : cleanWord;

  // Genitive singular ending for der/das
  const genitiveSingularNoun =
    article === 'die'
      ? cleanWord
      : isNDeklination
      ? lower === 'name'
        ? `${cleanWord}ns`
        : nDeclinedSingular
      : /[sßxz]$/.test(lower)
      ? `${cleanWord}es`
      : cleanWord.length <= 5
      ? `${cleanWord}es`
      : `${cleanWord}s`;

  // Dativ plural adds -n unless already ending in -n or -s
  const dativPluralNoun = hasPlural
    ? /[ns]$/i.test(cleanPluralNoun)
      ? cleanPluralNoun
      : `${cleanPluralNoun}n`
    : '—';

  const nomSg = `${article} ${cleanWord}`;
  const akkSg =
    article === 'der'
      ? `den ${isNDeklination ? nDeclinedSingular : cleanWord}`
      : `${article} ${cleanWord}`;
  const datSg =
    article === 'der' || article === 'das'
      ? `dem ${isNDeklination ? nDeclinedSingular : cleanWord}`
      : `der ${cleanWord}`;
  const genSg =
    article === 'der' || article === 'das'
      ? `des ${genitiveSingularNoun}`
      : `der ${cleanWord}`;

  return [
    {
      kasus: 'Nominativ',
      questionDe: 'Wer oder was?',
      roleId: 'Subjek kalimat / Pelaku utama',
      singularForm: nomSg,
      pluralForm: hasPlural ? `die ${cleanPluralNoun}` : '— (Tunggal)',
      examplePhraseDe: `${
        nomSg.charAt(0).toUpperCase() + nomSg.slice(1)
      } ist heute sehr wichtig.`,
    },
    {
      kasus: 'Akkusativ',
      questionDe: 'Wen oder was?',
      roleId: 'Objek langsung / Preposisi für, ohne, durch, gegen, um',
      singularForm: akkSg,
      pluralForm: hasPlural ? `die ${cleanPluralNoun}` : '— (Tunggal)',
      examplePhraseDe: `Ich brauche ${akkSg} für das Projekt.`,
    },
    {
      kasus: 'Dativ',
      questionDe: 'Wem oder wo?',
      roleId: 'Objek tak langsung / Lokasi / Preposisi mit, nach, bei, zu, von, aus',
      singularForm: datSg,
      pluralForm: hasPlural ? `den ${dativPluralNoun}` : '— (Tunggal)',
      examplePhraseDe: `Wir sprechen intensiv mit ${datSg}.`,
    },
    {
      kasus: 'Genitiv',
      questionDe: 'Wessen?',
      roleId: 'Kepemilikan / Akademik / Preposisi wegen, trotz, während, aufgrund',
      singularForm: genSg,
      pluralForm: hasPlural ? `der ${cleanPluralNoun}` : '— (Tunggal)',
      examplePhraseDe: `Wegen ${genSg} ändert sich der Plan.`,
    },
  ];
}

/**
 * Conjugates any German verb into Präsens (all 6 persons), Präteritum (ich), and Partizip II + Auxiliary.
 */
export function conjugateGermanVerb(
  rawVerb: string
): GermanVerbConjugation | null {
  const clean = rawVerb.trim().toLowerCase();
  if (!clean || (!clean.endsWith('en') && !clean.endsWith('ern') && !clean.endsWith('eln'))) {
    return null;
  }

  const stem = clean.endsWith('en')
    ? clean.slice(0, -2)
    : clean.slice(0, -1);

  const endsWithDental = /[dt]$/.test(stem);
  const endsWithSibilant = /[sßxz]$/.test(stem);

  // Known irregular vowel-changing verbs in A1-C1 corpus
  const irregularDuErMap: Record<string, { du: string; er: string; praet: string; partII: string; aux?: 'sein' | 'haben' }> = {
    sprechen: { du: 'sprichst', er: 'spricht', praet: 'sprach', partII: 'gesprochen' },
    widersprechen: { du: 'widersprichst', er: 'widerspricht', praet: 'widersprach', partII: 'widersprochen' },
    essen: { du: 'isst', er: 'isst', praet: 'aß', partII: 'gegessen' },
    sehen: { du: 'siehst', er: 'sieht', praet: 'sah', partII: 'gesehen' },
    lesen: { du: 'liest', er: 'liest', praet: 'las', partII: 'gelesen' },
    geben: { du: 'gibst', er: 'gibt', praet: 'gab', partII: 'gegeben' },
    nehmen: { du: 'nimmst', er: 'nimmt', praet: 'nahm', partII: 'genommen' },
    helfen: { du: 'hilfst', er: 'hilft', praet: 'half', partII: 'geholfen' },
    treffen: { du: 'triffst', er: 'trifft', praet: 'traf', partII: 'getroffen' },
    fahren: { du: 'fährst', er: 'fährt', praet: 'fuhr', partII: 'gefahren', aux: 'sein' },
    schlafen: { du: 'schläfst', er: 'schläft', praet: 'schlief', partII: 'geschlafen' },
    gehen: { du: 'gehst', er: 'geht', praet: 'ging', partII: 'gegangen', aux: 'sein' },
    kommen: { du: 'kommst', er: 'kommt', praet: 'kam', partII: 'gekommen', aux: 'sein' },
    bleiben: { du: 'bleibst', er: 'bleibt', praet: 'blieb', partII: 'geblieben', aux: 'sein' },
    schreiben: { du: 'schreibst', er: 'schreibt', praet: 'schrieb', partII: 'geschrieben' },
    trinken: { du: 'trinkst', er: 'trinkt', praet: 'trank', partII: 'getrunken' },
    finden: { du: 'findest', er: 'findet', praet: 'fand', partII: 'gefunden' },
    verstehen: { du: 'verstehst', er: 'versteht', praet: 'verstand', partII: 'verstanden' },
    beginnen: { du: 'beginnst', er: 'beginnt', praet: 'begann', partII: 'begonnen' },
  };

  const irreg = irregularDuErMap[clean];

  const ichForm = `${stem}e`;
  const duForm = irreg
    ? irreg.du
    : endsWithDental
    ? `${stem}est`
    : endsWithSibilant
    ? `${stem}t`
    : `${stem}st`;
  const erForm = irreg
    ? irreg.er
    : endsWithDental
    ? `${stem}et`
    : `${stem}t`;
  const ihrForm = endsWithDental ? `${stem}et` : `${stem}t`;

  const inseparablePrefixes = [
    'be',
    'emp',
    'ent',
    'er',
    'ge',
    'miss',
    'ver',
    'zer',
    'über',
    'wider',
  ];
  const hasInseparablePrefix =
    inseparablePrefixes.some((p) => clean.startsWith(p)) ||
    clean.endsWith('ieren');

  const partizipII = irreg
    ? irreg.partII
    : hasInseparablePrefix
    ? endsWithDental
      ? `${stem}et`
      : `${stem}t`
    : endsWithDental
    ? `ge${stem}et`
    : `ge${stem}t`;

  const praeteritumIch = irreg
    ? irreg.praet
    : endsWithDental
    ? `${stem}ete`
    : `${stem}te`;

  return {
    infinitive: clean,
    praesens: {
      ich: `ich ${ichForm}`,
      du: `du ${duForm}`,
      erSieEs: `er/sie/es ${erForm}`,
      wir: `wir ${clean}`,
      ihr: `ihr ${ihrForm}`,
      sieSie: `sie/Sie ${clean}`,
    },
    praeteritumIch: `ich ${praeteritumIch}`,
    partizipII,
    auxiliary: irreg?.aux || 'haben',
  };
}

/**
 * Detects advanced German phonological and prosodic rules inside any German word
 * (Auslautverhärtung, Vokalischer R-Auslaut, Glottisschlag / Knacklaut, Allophonie Ich/Ach, etc.).
 */
export function analyzeAdvancedPhonologicalRules(
  rawWord: string
): PhonologicalRuleDetection[] {
  const clean = rawWord
    .trim()
    .replace(/^(der|die|das)\s+/i, '');
  if (!clean) return [];

  const lower = clean.toLowerCase();
  const detections: PhonologicalRuleDetection[] = [];

  // 1. Auslautverhärtung (Final Obstruent Devoicing)
  if (/[bdg]$/.test(lower)) {
    const finalChar = lower.slice(-1);
    const shiftMap: Record<string, string> = {
      b: '/b/ → [p]',
      d: '/d/ → [t]',
      g: '/ɡ/ → [k]',
    };
    detections.push({
      ruleNameDe: 'Auslautverhärtung',
      ruleNameId: 'Pengerasan Konsonan Akhir',
      segment: `-${finalChar}`,
      ipaShift: shiftMap[finalChar] || '[t]',
      explanationId: `Konsonan bersuara "-${finalChar}" di akhir kata/suku kata kehilangan getaran pita suara dan diucapkan tajam nirsuara (${shiftMap[finalChar]}).`,
    });
  }

  // 2. Spirantisierung -ig
  if (lower.endsWith('ig') || lower.includes('igk')) {
    detections.push({
      ruleNameDe: 'Spirantisierung (-ig)',
      ruleNameId: 'Peluluhan Akhiran -ig menjadi Ich-Laut',
      segment: '-ig',
      ipaShift: '-ig → [ɪç]',
      explanationId:
        'Dalam Hochdeutsch standar, akhiran "-ig" (seperti pünktlich/wichtig/Nachhaltigkeit) diucapkan sebagai desis palatal halus [ɪç], bukan [ɪk].',
    });
  }

  // 3. Vokalischer R-Auslaut (-er)
  if (lower.endsWith('er') || /(ver|zer|er|her|über|unter|wider)/.test(lower)) {
    detections.push({
      ruleNameDe: 'R-Vokalisierung (Tiefschwa)',
      ruleNameId: 'Vokalisasi R menjadi Vokal Tengah [ɐ]',
      segment: 'er / -er',
      ipaShift: '-er → [ɐ]',
      explanationId:
        'Huruf "r" sesudah vokal pada akhiran "-er" atau prefiks "ver-/er-/über-" tidak digetarkan, melainkan melebur menjadi vokal pendek terbuka [ɐ].',
    });
  }

  // 4. Glottisschlag / Knacklaut [ʔ]
  if (
    /^[aeiouäöü]/.test(lower) ||
    /(be|ver|ent|er|ge|un|aus|vor|zusammen)[aeiouäöü]/.test(lower)
  ) {
    detections.push({
      ruleNameDe: 'Glottisschlag (Knacklaut)',
      ruleNameId: 'Hentakan Pita Suara Sebelum Vokal Awal Morfem',
      segment: 'Vokal Awal / Batas Prefiks',
      ipaShift: 'Ø → [ʔ]',
      explanationId:
        'Vokal di awal kata atau sesudah prefiks (misal: Ver-antwortung [fɛɐ̯ˈʔant...], be-einflussen [bəˈʔaɪ̯n...]) dipisahkan oleh hentakan glotal halus [ʔ], tidak disambung langsung.',
    });
  }

  // 5. Komplementäre Allophonie (Ich-Laut vs Ach-Laut)
  if (lower.includes('ch') && !lower.includes('sch')) {
    const isAch = /[aou]ch/.test(lower);
    detections.push({
      ruleNameDe: isAch ? 'Velarer Ach-Laut' : 'Palataler Ich-Laut',
      ruleNameId: isAch
        ? 'Alofon Ach-Laut Pasca-Vokal Belakang'
        : 'Alofon Ich-Laut Pasca-Vokal Depan',
      segment: 'ch',
      ipaShift: isAch ? 'ch → [x]' : 'ch → [ç]',
      explanationId: isAch
        ? 'Karena didahului vokal belakang (a/o/u), digraf "ch" bergeser ke langit-langit lunak belakang [x].'
        : 'Karena didahului vokal depan (e/i/ä/ö/ü) atau konsonan, digraf "ch" diucapkan di langit-langit keras depan [ç].',
    });
  }

  // 6. Dehnungs-h
  if (/[aeiouäöü]h/.test(lower)) {
    detections.push({
      ruleNameDe: 'Dehnungs-h (Vokallänge)',
      ruleNameId: 'Huruf H Bisu Pemanjang Vokal',
      segment: 'Vokal + h',
      ipaShift: 'Vh → [Vː]',
      explanationId:
        'Huruf "h" sesudah vokal tidak dihembuskan, melainkan berfungsi memperpanjang durasi vokal di depannya dua kali lipat [ː].',
    });
  }

  if (detections.length === 0) {
    detections.push({
      ruleNameDe: 'Initialer Wortakzent',
      ruleNameId: 'Tekanan Suku Kata Utama (Stammbetonung)',
      segment: clean.slice(0, Math.min(4, clean.length)),
      ipaShift: 'ˈSuku-1',
      explanationId:
        'Kata asli Jerman menempatkan tekanan akustik utama (Wortakzent ˈ) pada suku kata akar pertama dengan artikulasi vokal penuh.',
    });
  }

  return detections;
}

/**
 * Builds a contextual 4-Case (Nominativ, Akkusativ, Dativ, Genitiv) fill-in-the-blank
 * grammar quiz question for any German noun.
 */
export function buildContextualCaseQuestion(
  vocab: VocabItem,
  seedIndex: number = 0
): ContextualCaseQuestion {
  const cases: ('Nominativ' | 'Akkusativ' | 'Dativ' | 'Genitiv')[] = [
    'Nominativ',
    'Akkusativ',
    'Dativ',
    'Genitiv',
  ];
  const targetCase = cases[seedIndex % 4];
  const article = vocab.article === 'none' ? 'das' : vocab.article;

  const caseArticleMap: Record<
    'der' | 'die' | 'das',
    Record<'Nominativ' | 'Akkusativ' | 'Dativ' | 'Genitiv', string>
  > = {
    der: {
      Nominativ: 'der',
      Akkusativ: 'den',
      Dativ: 'dem',
      Genitiv: 'des',
    },
    die: {
      Nominativ: 'die',
      Akkusativ: 'die',
      Dativ: 'der',
      Genitiv: 'der',
    },
    das: {
      Nominativ: 'das',
      Akkusativ: 'das',
      Dativ: 'dem',
      Genitiv: 'des',
    },
  };

  const correctArticleForm = caseArticleMap[article][targetCase];

  // Genitive noun inflection when des is used
  const lower = vocab.word.toLowerCase();
  const genitiveWordForm =
    targetCase === 'Genitiv' && (article === 'der' || article === 'das')
      ? /[sßxz]$/.test(lower)
        ? `${vocab.word}es`
        : `${vocab.word}s`
      : vocab.word;

  if (targetCase === 'Nominativ') {
    return {
      vocab,
      targetCase: 'Nominativ',
      triggerPrepositionOrVerb: 'Subjek Kalimat (Wer oder was?)',
      sentenceBefore: 'Heute steht',
      sentenceAfter: `${vocab.word} im Mittelpunkt unserer Diskussion.`,
      correctArticleForm,
      options: ['der', 'die', 'das', 'den'],
      explanationId: `Sebagai subjek kalimat (Nominativ), kata benda ${
        article === 'der' ? 'Maskulin' : article === 'die' ? 'Feminin' : 'Neutrum'
      } „${vocab.word}“ tetap menggunakan artikel dasar „${correctArticleForm}“.`,
      translationId: `Hari ini ${vocab.meaningId.toLowerCase()} menjadi pusat diskusi kita.`,
    };
  }

  if (targetCase === 'Akkusativ') {
    return {
      vocab,
      targetCase: 'Akkusativ',
      triggerPrepositionOrVerb: 'Preposisi „für“ / Objek Langsung (+ Akkusativ)',
      sentenceBefore: 'Wir benötigen dringend',
      sentenceAfter: `${vocab.word} für das nächste Seminar.`,
      correctArticleForm,
      options: ['den', 'der', 'die', 'das'],
      explanationId: `Kata kerja „benötigen“ dan preposisi „für“ menuntut kasus Akkusativ. Untuk nomina bergender „${article}“, artikel berubah menjadi „${correctArticleForm}“.`,
      translationId: `Kami sangat membutuhkan ${vocab.meaningId.toLowerCase()} untuk seminar berikutnya.`,
    };
  }

  if (targetCase === 'Dativ') {
    return {
      vocab,
      targetCase: 'Dativ',
      triggerPrepositionOrVerb: 'Preposisi „mit / bei“ (+ Dativ)',
      sentenceBefore: 'Im Kurs beschäftigen wir uns intensiv mit',
      sentenceAfter: `${vocab.word}.`,
      correctArticleForm,
      options: ['dem', 'der', 'den', 'des'],
      explanationId: `Preposisi „mit“ selalu diikuti oleh kasus Dativ. Pada kasus Dativ tunggal, artikel „${article}“ berubah menjadi „${correctArticleForm}“ (${
        article === 'die' ? 'die → der' : `${article} → dem`
      }).`,
      translationId: `Di dalam kursus kami membahas ${vocab.meaningId.toLowerCase()} secara intensif.`,
    };
  }

  return {
    vocab,
    targetCase: 'Genitiv',
    triggerPrepositionOrVerb: 'Preposisi Akademik „wegen / trotz“ (+ Genitiv)',
    sentenceBefore: 'Trotz',
    sentenceAfter: `${genitiveWordForm} setzen wir das Training fort.`,
    correctArticleForm,
    options: ['des', 'der', 'dem', 'den'],
    explanationId: `Preposisi „trotz“ menuntut kasus Genitiv. Pada kasus Genitiv tunggal, artikel „${article}“ berubah menjadi „${correctArticleForm}“${
      article === 'der' || article === 'das'
        ? ' dan nomina mendapat akhiran -(e)s.'
        : '.'
    }`,
    translationId: `Meskipun ada ${vocab.meaningId.toLowerCase()}, kami tetap melanjutkan pelatihan.`,
  };
}



