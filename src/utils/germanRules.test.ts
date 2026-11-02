import test from 'node:test';
import assert from 'node:assert/strict';
import {
  analyzeAdvancedPhonologicalRules,
  buildContextualCaseQuestion,
  buildDailyPronunciationChartData,
  calculatePhoneticSimilarity,
  calculateSrsUpdate,
  conjugateGermanVerb,
  deconstructWordToGraphemes,
  evaluatePronunciationAttempt,
  generateCaseDeclensionTable,
  generateGermanIpa,
  getArticleMorphologyRule,
  inferGermanArticle,
  spellWordDin5009,
  toAsciiGermanPhonetic,
  validateNewVocabInput,
} from './germanRules';
import { SEED_VOCABULARY } from '../data/seedVocabulary';

test('toAsciiGermanPhonetic converts Umlauts and Eszett properly', () => {
  assert.equal(toAsciiGermanPhonetic('der Kühlschrank'), 'der kuehlschrank');
  assert.equal(toAsciiGermanPhonetic('die Straßenbahn'), 'die strassenbahn');
  assert.equal(toAsciiGermanPhonetic('Frühstück & Bäckerei'), 'fruehstueck baeckerei');
});

test('calculatePhoneticSimilarity scores exact and umlaut-equivalent matches accurately', () => {
  assert.equal(
    calculatePhoneticSimilarity('der Kühlschrank', 'der Kühlschrank'),
    100
  );
  assert.equal(
    calculatePhoneticSimilarity('der Kühlschrank', 'der Kuehlschrank'),
    96
  );
  const partialScore = calculatePhoneticSimilarity('Sehenswürdigkeit', 'Sehenswurdig');
  assert.ok(partialScore >= 65 && partialScore < 95);
  assert.equal(calculatePhoneticSimilarity('das Frühstück', ''), 0);
});

test('calculateSrsUpdate increments Leitner boxes and awards XP correctly', () => {
  const resGood = calculateSrsUpdate(2, 'good');
  assert.equal(resGood.nextBox, 3);
  assert.equal(resGood.xpEarned, 15);
  assert.equal(resGood.mastered, false);

  const resEasy = calculateSrsUpdate(3, 'easy');
  assert.equal(resEasy.nextBox, 5);
  assert.equal(resEasy.xpEarned, 25);
  assert.equal(resEasy.mastered, true);

  const resAgain = calculateSrsUpdate(4, 'again');
  assert.equal(resAgain.nextBox, 1);
  assert.equal(resAgain.mastered, false);
});

test('evaluatePronunciationAttempt returns syllable breakdown and coaching tips', () => {
  const result = evaluatePronunciationAttempt(
    {
      id: 'v1',
      word: 'Kühlschrank',
      article: 'der',
      syllables: ['Kühl', 'schrank'],
      phoneticFocus: 'Umlaut ü [yː] & sch [ʃ]',
    },
    'der Kühlschrank'
  );

  assert.equal(result.overallScore, 100);
  assert.equal(result.statusLabel, 'NOMINAL · FASIH');
  assert.equal(result.syllableBreakdown.length, 2);
  assert.equal(result.syllableBreakdown[0].status, 'tepat');
  assert.ok(result.phoneticCoachingTips.length >= 1);
});

test('getArticleMorphologyRule provides Indonesian morphological explanations', () => {
  assert.ok(
    getArticleMorphologyRule('Entschuldigung', 'die').includes('-ung')
  );
  assert.ok(
    getArticleMorphologyRule('Gemütlichkeit', 'die').includes('-keit')
  );
  assert.ok(
    getArticleMorphologyRule('Wörterbuch', 'das').includes('das Buch')
  );
});

test('validateNewVocabInput rejects empty fields and accepts valid vocabulary across A1-C1', () => {
  const invalidEmpty = validateNewVocabInput({
    word: '',
    meaningId: 'Sepeda',
    exampleDe: 'Ich fahre Fahrrad.',
  });
  assert.equal(invalidEmpty.valid, false);

  const validEntry = validateNewVocabInput({
    word: 'Nachhaltigkeit',
    article: 'die',
    meaningId: 'Keberlanjutan',
    exampleDe: 'Nachhaltigkeit ist wichtig.',
    category: 'Akademik, Bisnis & C1',
    level: 'C1',
  });
  assert.equal(validEntry.valid, true);
});

test('deconstructWordToGraphemes segments German letters, Umlauts, Dehnungs-h, and trigraphs', () => {
  const segments = deconstructWordToGraphemes('der Kühlschrank');
  const graphemes = segments.map((s) => s.grapheme.toLowerCase());
  assert.deepEqual(graphemes, ['k', 'ü', 'h', 'l', 'sch', 'r', 'a', 'n', 'k']);
  // Check Dehnungs-h rule detection after ü
  assert.ok(segments[2].soundIpa.includes('bisu'));
  // Check trigraph sch
  assert.equal(segments[4].soundIpa, '[ʃ]');
});

test('spellWordDin5009 produces official DIN 5009 German spelling sequence', () => {
  const spelled = spellWordDin5009('die Straße');
  assert.equal(spelled.length, 6);
  assert.equal(spelled[0].dinWord, 'Samuel');
  assert.equal(spelled[4].char, 'ß');
  assert.equal(spelled[4].dinWord, 'Eszett');
});

test('buildDailyPronunciationChartData produces 7-day series and incorporates today evaluations', () => {
  const refNow = new Date('2026-11-01T15:00:00Z');
  const series = buildDailyPronunciationChartData(
    [
      {
        id: 'ev-1',
        vocabId: 'voc-1',
        targetText: 'das Frühstück',
        spokenText: 'das Frühstück',
        overallScore: 98,
        statusLabel: 'NOMINAL · FASIH',
        syllableBreakdown: [],
        feedbackSummaryId: 'Sangat baik',
        phoneticCoachingTips: [],
        timestamp: '2026-11-01T14:30:00Z',
      },
      {
        id: 'ev-2',
        vocabId: 'voc-2',
        targetText: 'die Entschuldigung',
        spokenText: 'die Entschuldigung',
        overallScore: 90,
        statusLabel: 'NOMINAL · FASIH',
        syllableBreakdown: [],
        feedbackSummaryId: 'Baik',
        phoneticCoachingTips: [],
        timestamp: '2026-11-01T12:10:00Z',
      },
    ],
    refNow
  );

  assert.equal(series.length, 7);
  const todayItem = series[6];
  assert.ok(todayItem.dayLabel.startsWith('Hari Ini'));
  assert.equal(todayItem.avgScore, 94);
  assert.equal(todayItem.bestScore, 98);
  assert.equal(todayItem.attemptsCount, 2);
});

test('generateGermanIpa and inferGermanArticle synthesize phonetics and gender for arbitrary German words', () => {
  const ipaSchule = generateGermanIpa('Schule');
  assert.ok(ipaSchule.includes('ʃu'));
  assert.equal(inferGermanArticle('Freiheit'), 'die');
  assert.equal(inferGermanArticle('Mädchen'), 'das');
  assert.equal(inferGermanArticle('Bahnhof'), 'der');
  assert.equal(inferGermanArticle('lernen'), 'none');
});

test('generateCaseDeclensionTable produces 4-case declension matrix for German nouns', () => {
  const tableMasculine = generateCaseDeclensionTable('Tisch', 'der', 'die Tische');
  assert.equal(tableMasculine.length, 4);
  assert.equal(tableMasculine[0].singularForm, 'der Tisch');
  assert.equal(tableMasculine[1].singularForm, 'den Tisch');
  assert.equal(tableMasculine[2].singularForm, 'dem Tisch');
  assert.equal(tableMasculine[2].pluralForm, 'den Tischen');
  assert.equal(tableMasculine[3].singularForm, 'des Tisches');
});

test('conjugateGermanVerb conjugates regular, irregular, and inseparable prefix verbs', () => {
  const sprechenConj = conjugateGermanVerb('sprechen');
  assert.ok(sprechenConj);
  assert.equal(sprechenConj.praesens.du, 'du sprichst');
  assert.equal(sprechenConj.partizipII, 'gesprochen');

  const beruecksichtigenConj = conjugateGermanVerb('berücksichtigen');
  assert.ok(beruecksichtigenConj);
  assert.equal(beruecksichtigenConj.partizipII, 'berücksichtigt');
});

test('analyzeAdvancedPhonologicalRules detects Auslautverhaertung, Glottisschlag, and Spirantisierung', () => {
  const rules = analyzeAdvancedPhonologicalRules('Unabhängigkeit');
  assert.ok(rules.some((r) => r.ruleNameDe.includes('Spirantisierung')));
  assert.ok(rules.some((r) => r.ruleNameDe.includes('Glottisschlag')));

  const devoicingRules = analyzeAdvancedPhonologicalRules('Fahrrad');
  assert.ok(devoicingRules.some((r) => r.ruleNameDe === 'Auslautverhärtung'));
});

test('buildContextualCaseQuestion creates contextual Nominativ, Akkusativ, Dativ, and Genitiv challenges', () => {
  const mockVocab = {
    id: 'c1',
    word: 'Wettbewerb',
    article: 'der' as const,
    plural: 'die Wettbewerbe',
    ipa: '[ˈvɛtbəˌvɛʁp]',
    syllables: ['Wett', 'be', 'werb'],
    meaningId: 'Kompetisi',
    category: 'Akademik, Bisnis & C1' as const,
    level: 'B2' as const,
    exampleDe: 'Im Wettbewerb zählt Qualität.',
    exampleId: 'Dalam kompetisi kualitas penting.',
    phoneticFocus: 'Auslaut p',
    articulationTip: 'Tegas',
    mouthShape: 'umlaut_a' as const,
    srsBox: 1 as const,
    nextReviewLabel: 'Hari Ini',
    mastered: false,
    reviewCount: 1,
    lastAccuracy: 90,
  };

  const akkQ = buildContextualCaseQuestion(mockVocab, 1);
  assert.equal(akkQ.targetCase, 'Akkusativ');
  assert.equal(akkQ.correctArticleForm, 'den');

  const datQ = buildContextualCaseQuestion(mockVocab, 2);
  assert.equal(datQ.targetCase, 'Dativ');
  assert.equal(datQ.correctArticleForm, 'dem');

  const genQ = buildContextualCaseQuestion(mockVocab, 3);
  assert.equal(genQ.targetCase, 'Genitiv');
  assert.equal(genQ.correctArticleForm, 'des');
});

test('SEED_VOCABULARY contains 500+ unique German words across all CEFR levels A1-C1', () => {
  assert.ok(
    SEED_VOCABULARY.length >= 500,
    `Expected >= 500 words, got ${SEED_VOCABULARY.length}`
  );
  const levels = new Set(SEED_VOCABULARY.map((v) => v.level));
  assert.ok(levels.has('A1'));
  assert.ok(levels.has('A2'));
  assert.ok(levels.has('B1'));
  assert.ok(levels.has('B2'));
  assert.ok(levels.has('C1'));
});
