export type GermanArticle = 'der' | 'die' | 'das' | 'none';

export type CefrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1';

export type VocabCategory =
  | 'Kehidupan Sehari-hari'
  | 'Kuliner & Kafe'
  | 'Perjalanan & Kota'
  | 'Kerja & Studi'
  | 'Salam & Komunikasi'
  | 'Keluarga & Rumah'
  | 'Waktu, Angka & Alam'
  | 'Verba & Sifat A1'
  | 'Akademik, Bisnis & C1';

export type MouthShapeType =
  | 'umlaut_u'
  | 'umlaut_o'
  | 'umlaut_a'
  | 'ich_laut'
  | 'ach_laut'
  | 'sch_laut'
  | 'r_uvular'
  | 'diphthong';

export type SrsRating = 'again' | 'hard' | 'good' | 'easy';

export type LetterCategory =
  | 'umlaut_eszett'
  | 'konsonan_khas'
  | 'vokal'
  | 'digraf'
  | 'konsonan_standar';

export interface GermanLetterExample {
  word: string;
  ipa: string;
  meaningId: string;
}

export interface GermanLetterItem {
  id: string;
  grapheme: string;
  displayPair: string;
  letterNameDe: string;
  letterNameIpa: string;
  indonesianApprox: string;
  soundIpa: string;
  din5009Word: string;
  category: LetterCategory;
  mouthShape: MouthShapeType;
  articulationRuleId: string;
  commonMistakeId: string;
  examples: GermanLetterExample[];
}

export interface GraphemeSegment {
  grapheme: string;
  upperDisplay: string;
  soundIpa: string;
  indonesianCue: string;
  ruleNoteId: string;
  mouthShape: MouthShapeType;
  isSpecialGerman: boolean;
}

export interface DinSpellingItem {
  char: string;
  letterNameDe: string;
  dinWord: string;
  ipa: string;
}

export interface GermanCaseDeclension {
  kasus: 'Nominativ' | 'Akkusativ' | 'Dativ' | 'Genitiv';
  questionDe: string;
  roleId: string;
  singularForm: string;
  pluralForm: string;
  examplePhraseDe: string;
}

export interface GermanVerbConjugation {
  infinitive: string;
  praesens: {
    ich: string;
    du: string;
    erSieEs: string;
    wir: string;
    ihr: string;
    sieSie: string;
  };
  praeteritumIch: string;
  partizipII: string;
  auxiliary: 'haben' | 'sein';
}

export interface PhonologicalRuleDetection {
  ruleNameDe: string;
  ruleNameId: string;
  segment: string;
  ipaShift: string;
  explanationId: string;
}

export interface ContextualCaseQuestion {
  vocab: VocabItem;
  targetCase: 'Nominativ' | 'Akkusativ' | 'Dativ' | 'Genitiv';
  triggerPrepositionOrVerb: string;
  sentenceBefore: string;
  sentenceAfter: string;
  correctArticleForm: string;
  options: string[];
  explanationId: string;
  translationId: string;
}

export interface VocabItem {
  id: string;
  word: string;
  article: GermanArticle;
  plural: string;
  ipa: string;
  syllables: string[];
  meaningId: string;
  category: VocabCategory;
  level: CefrLevel;
  exampleDe: string;
  exampleId: string;
  phoneticFocus: string;
  articulationTip: string;
  mouthShape: MouthShapeType;
  srsBox: 1 | 2 | 3 | 4 | 5;
  nextReviewLabel: string;
  mastered: boolean;
  reviewCount: number;
  lastAccuracy: number | null;
}

export interface SyllableEvaluation {
  syllable: string;
  status: 'tepat' | 'hampir' | 'perlu_latihan';
  score: number;
  phoneticNote: string;
}

export interface PronunciationEvaluationResult {
  id: string;
  vocabId: string;
  targetText: string;
  spokenText: string;
  overallScore: number;
  statusLabel: 'NOMINAL · FASIH' | 'CUKUP TEPAT' | 'PERLU KOREKSI';
  syllableBreakdown: SyllableEvaluation[];
  feedbackSummaryId: string;
  phoneticCoachingTips: string[];
  timestamp: string;
}

export interface DailyPronunciationMetric {
  dateKey: string;
  dayLabel: string;
  avgScore: number;
  bestScore: number;
  attemptsCount: number;
  sampleWord: string;
}

export interface UserStudyStats {
  dailyTarget: number;
  dailyCompleted: number;
  streakDays: number;
  totalXp: number;
  articleQuizCorrect: number;
  articleQuizTotal: number;
  avgPronunciationScore: number;
  masteredLetters?: string[];
}

export interface AppStatePayload {
  vocabulary: VocabItem[];
  pronunciationHistory: PronunciationEvaluationResult[];
  stats: UserStudyStats;
}
