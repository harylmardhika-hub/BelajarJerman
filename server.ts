import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import {
  AppStatePayload,
  CefrLevel,
  GermanArticle,
  MouthShapeType,
  PronunciationEvaluationResult,
  SrsRating,
  VocabCategory,
  VocabItem,
} from './src/types';
import { SEED_VOCABULARY } from './src/data/seedVocabulary';
import {
  calculateSrsUpdate,
  evaluatePronunciationAttempt,
  generateGermanIpa,
  inferGermanArticle,
  validateNewVocabInput,
} from './src/utils/germanRules';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const STORE_PATH = path.join(DATA_DIR, 'store.json');

const INITIAL_HISTORY: PronunciationEvaluationResult[] = [
  {
    id: 'eval-seed-1',
    vocabId: 'voc-1',
    targetText: 'das Frühstück',
    spokenText: 'das Frühstück',
    overallScore: 94,
    statusLabel: 'NOMINAL · FASIH',
    syllableBreakdown: [
      {
        syllable: 'Früh',
        status: 'tepat',
        score: 95,
        phoneticNote: 'Artikulasi vokal ü panjang [yː] jernih',
      },
      {
        syllable: 'stück',
        status: 'tepat',
        score: 93,
        phoneticNote: 'Konsonan awal st- [ʃt] tegas',
      },
    ],
    feedbackSummaryId:
      'Sangat baik! Pengucapan "das Frühstück" memiliki intonasi dan artikulasi Umlaut ü yang presisi.',
    phoneticCoachingTips: [
      'Pertahankan pembulatan bibir saat berpindah dari suku kata "Früh" ke "stück".',
    ],
    timestamp: new Date(Date.now() - 3600 * 1000).toISOString(),
  },
];

function loadStore(): AppStatePayload {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(STORE_PATH)) {
      const raw = fs.readFileSync(STORE_PATH, 'utf-8');
      const parsed = JSON.parse(raw) as AppStatePayload;
      if (Array.isArray(parsed.vocabulary)) {
        const existingWords = new Set(
          parsed.vocabulary.map((v) => v.word.toLowerCase())
        );
        const missingSeeds = SEED_VOCABULARY.filter(
          (seed) => !existingWords.has(seed.word.toLowerCase())
        );
        if (missingSeeds.length > 0) {
          parsed.vocabulary = [...parsed.vocabulary, ...missingSeeds];
          saveStore(parsed);
        }
      }
      return parsed;
    }
  } catch (err) {
    console.error('Failed to read store.json, initializing fresh store:', err);
  }

  const initial: AppStatePayload = {
    vocabulary: SEED_VOCABULARY,
    pronunciationHistory: INITIAL_HISTORY,
    stats: {
      dailyTarget: 10,
      dailyCompleted: 4,
      streakDays: 7,
      totalXp: 420,
      articleQuizCorrect: 14,
      articleQuizTotal: 16,
      avgPronunciationScore: 89,
      masteredLetters: ['let-ae', 'let-oe', 'let-ue', 'let-ss'],
    },
  };
  saveStore(initial);
  return initial;
}

function saveStore(state: AppStatePayload): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(STORE_PATH, JSON.stringify(state, null, 2), 'utf-8');
  } catch (err) {
    console.error('Failed to write store.json:', err);
  }
}

let geminiQuotaAvailable = true;

function getGeminiClient(): GoogleGenAI | null {
  if (!geminiQuotaAvailable) return null;
  const key = process.env.GEMINI_API_KEY;
  if (!key || key === 'MY_GEMINI_API_KEY' || key.trim() === '') {
    return null;
  }
  return new GoogleGenAI({
    apiKey: key,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

function inferMouthShape(word: string): MouthShapeType {
  const lower = word.toLowerCase();
  if (lower.includes('ü')) return 'umlaut_u';
  if (lower.includes('ö')) return 'umlaut_o';
  if (lower.includes('ä')) return 'umlaut_a';
  if (/[aou]ch/.test(lower)) return 'ach_laut';
  if (lower.includes('ch')) return 'ich_laut';
  if (lower.includes('sch') || /s[pt]/.test(lower)) return 'sch_laut';
  if (lower.includes('ei') || lower.includes('au') || lower.includes('eu'))
    return 'diphthong';
  return 'r_uvular';
}

function splitGermanSyllables(word: string): string[] {
  const clean = word.trim();
  if (clean.includes('-')) {
    return clean.split('-').filter(Boolean);
  }
  if (clean.length <= 5) return [clean];
  const parts = clean.match(/[^aeiouäöüy]*[aeiouäöüy]+(?:[^aeiouäöüy](?![aeiouäöüy]))?/gi);
  if (parts && parts.length >= 2) {
    return parts;
  }
  const mid = Math.ceil(clean.length / 2);
  return [clean.slice(0, mid), clean.slice(mid)];
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '5mb' }));

  let state = loadStore();

  // GET /api/state
  app.get('/api/state', (_req, res) => {
    res.json(state);
  });

  // POST /api/vocabulary - Add new custom vocabulary
  app.post('/api/vocabulary', (req, res) => {
    const validation = validateNewVocabInput(req.body || {});
    if (!validation.valid) {
      res.status(400).json({ error: validation.error });
      return;
    }

    const {
      word,
      article = 'die',
      plural = '',
      ipa = '',
      meaningId,
      category = 'Kehidupan Sehari-hari',
      level = 'A1',
      exampleDe,
      exampleId = '',
      phoneticFocus = '',
      articulationTip = '',
    } = req.body;

    const cleanWord = String(word).trim();
    const syllables = splitGermanSyllables(cleanWord);
    const newVocab: VocabItem = {
      id: `voc-${Date.now()}`,
      word: cleanWord,
      article: article as GermanArticle,
      plural: plural ? String(plural).trim() : `die ${cleanWord}n`,
      ipa: ipa ? String(ipa).trim() : `[${cleanWord.toLowerCase()}]`,
      syllables,
      meaningId: String(meaningId).trim(),
      category: category as VocabCategory,
      level: level as CefrLevel,
      exampleDe: String(exampleDe).trim(),
      exampleId: exampleId
        ? String(exampleId).trim()
        : `Contoh penggunaan kata ${cleanWord} dalam percakapan sehari-hari.`,
      phoneticFocus: phoneticFocus
        ? String(phoneticFocus).trim()
        : `Intonasi suku kata ${syllables.join('·')}`,
      articulationTip: articulationTip
        ? String(articulationTip).trim()
        : 'Tekan suku kata pertama dengan jelas dan jaga kejelasan konsonan akhir.',
      mouthShape: inferMouthShape(cleanWord),
      srsBox: 1,
      nextReviewLabel: 'Hari Ini',
      mastered: false,
      reviewCount: 0,
      lastAccuracy: null,
    };

    state.vocabulary = [newVocab, ...state.vocabulary];
    state.stats.totalXp += 20;
    saveStore(state);

    res.status(201).json({
      vocab: newVocab,
      stats: state.stats,
    });
  });

  // POST /api/vocabulary/lookup - Instant analyzer & generator for ANY German word (A1-C1)
  app.post('/api/vocabulary/lookup', async (req, res) => {
    const rawQuery = String(req.body?.query || '').trim();
    const customMeaning = String(req.body?.meaningId || '').trim();

    if (!rawQuery || rawQuery.length < 2) {
      res.status(400).json({
        error: 'Masukkan kata bahasa Jerman minimal 2 karakter.',
      });
      return;
    }

    const strippedWord = rawQuery.replace(/^(der|die|das)\s+/i, '').trim();
    const existing = state.vocabulary.find(
      (v) => v.word.toLowerCase() === strippedWord.toLowerCase()
    );
    if (existing) {
      res.json({
        vocab: existing,
        stats: state.stats,
        alreadyExisted: true,
      });
      return;
    }

    const inferredArt = inferGermanArticle(rawQuery);
    const capitalizedWord =
      inferredArt !== 'none'
        ? strippedWord.charAt(0).toUpperCase() + strippedWord.slice(1)
        : strippedWord;
    const syllables = splitGermanSyllables(capitalizedWord);
    const ipa = generateGermanIpa(capitalizedWord);

    let meaningId = customMeaning || `Kosakata Jerman „${capitalizedWord}“`;
    let exampleDe =
      inferredArt !== 'none'
        ? `Wir lernen heute das Wort „${inferredArt} ${capitalizedWord}“ im Deutschkurs.`
        : `Wir benutzen das Wort „${capitalizedWord}“ oft im Alltag.`;
    let exampleId = `Kami mempelajari penggunaan kata „${capitalizedWord}“ dalam bahasa Jerman.`;

    const ai = getGeminiClient();
    if (ai) {
      try {
        const aiRes = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: `Berikan arti Bahasa Indonesia singkat dan 1 contoh kalimat A1 sederhana beserta terjemahan Indonesianya untuk kata bahasa Jerman: "${rawQuery}".`,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                meaningId: { type: Type.STRING },
                exampleDe: { type: Type.STRING },
                exampleId: { type: Type.STRING },
              },
            },
          },
        });
        if (aiRes.text) {
          const parsed = JSON.parse(aiRes.text.trim());
          if (parsed.meaningId) meaningId = parsed.meaningId;
          if (parsed.exampleDe) exampleDe = parsed.exampleDe;
          if (parsed.exampleId) exampleId = parsed.exampleId;
        }
      } catch {
        geminiQuotaAvailable = false;
      }
    }

    const lowerWord = capitalizedWord.toLowerCase();
    const autoLevel =
      lowerWord.endsWith('keit') ||
      lowerWord.endsWith('tät') ||
      lowerWord.endsWith('schaft') ||
      lowerWord.length >= 13
        ? 'C1'
        : lowerWord.endsWith('ung') || lowerWord.length >= 10
        ? 'B2'
        : syllables.length >= 3
        ? 'B1'
        : 'A1';

    const autoCategory =
      autoLevel === 'C1' || autoLevel === 'B2'
        ? 'Akademik, Bisnis & C1'
        : inferredArt === 'none'
        ? 'Verba & Sifat A1'
        : 'Kehidupan Sehari-hari';

    const pluralSuffix =
      lowerWord.endsWith('ung') ||
      lowerWord.endsWith('heit') ||
      lowerWord.endsWith('keit') ||
      lowerWord.endsWith('schaft') ||
      lowerWord.endsWith('tät') ||
      lowerWord.endsWith('ion')
        ? 'en'
        : lowerWord.endsWith('e')
        ? 'n'
        : lowerWord.endsWith('er') || lowerWord.endsWith('el') || lowerWord.endsWith('en')
        ? ''
        : 'e';

    const created: VocabItem = {
      id: `voc-dyn-${Date.now()}`,
      word: capitalizedWord,
      article: inferredArt,
      plural:
        inferredArt !== 'none'
          ? `die ${capitalizedWord}${pluralSuffix}`
          : '— (Ungkapan / Verba)',
      ipa,
      syllables,
      meaningId,
      category: autoCategory,
      level: autoLevel,
      exampleDe,
      exampleId,
      phoneticFocus: `Intonasi suku kata ${syllables.join('·')}`,
      articulationTip:
        'Ucapkan setiap suku kata dengan jelas sesuai panduan IPA dan perhatikan konsonan akhir.',
      mouthShape: inferMouthShape(capitalizedWord),
      srsBox: 1,
      nextReviewLabel: 'Hari Ini',
      mastered: false,
      reviewCount: 0,
      lastAccuracy: null,
    };

    state.vocabulary = [created, ...state.vocabulary];
    state.stats.totalXp += 15;
    saveStore(state);

    res.status(201).json({
      vocab: created,
      stats: state.stats,
      alreadyExisted: false,
    });
  });

  // POST /api/vocabulary/:id/review - Update SRS Box and stats
  app.post('/api/vocabulary/:id/review', (req, res) => {
    const { id } = req.params;
    const rating = (req.body?.rating || 'good') as SrsRating;
    const vocabIndex = state.vocabulary.findIndex((v) => v.id === id);

    if (vocabIndex === -1) {
      res.status(404).json({ error: 'Kosakata tidak ditemukan.' });
      return;
    }

    const current = state.vocabulary[vocabIndex];
    const update = calculateSrsUpdate(current.srsBox, rating);

    const updatedVocab: VocabItem = {
      ...current,
      srsBox: update.nextBox,
      nextReviewLabel: update.nextReviewLabel,
      mastered: update.mastered,
      reviewCount: current.reviewCount + 1,
    };

    state.vocabulary[vocabIndex] = updatedVocab;
    state.stats.dailyCompleted += 1;
    state.stats.totalXp += update.xpEarned;
    saveStore(state);

    res.json({
      vocab: updatedVocab,
      stats: state.stats,
      xpEarned: update.xpEarned,
    });
  });

  // POST /api/article-quiz/submit - Record Der/Die/Das quiz attempt
  app.post('/api/article-quiz/submit', (req, res) => {
    const { vocabId, selectedArticle } = req.body || {};
    const vocab = state.vocabulary.find((v) => v.id === vocabId);

    if (!vocab) {
      res.status(404).json({ error: 'Kosakata tidak ditemukan.' });
      return;
    }

    const isCorrect = vocab.article === selectedArticle;
    state.stats.articleQuizTotal += 1;
    if (isCorrect) {
      state.stats.articleQuizCorrect += 1;
      state.stats.totalXp += 10;
    } else {
      state.stats.totalXp += 2;
    }
    saveStore(state);

    res.json({
      isCorrect,
      correctArticle: vocab.article,
      stats: state.stats,
    });
  });

  // POST /api/alphabet/mastery - Toggle letter mastery & award XP
  app.post('/api/alphabet/mastery', (req, res) => {
    const { letterId } = req.body || {};
    if (!letterId || typeof letterId !== 'string') {
      res.status(400).json({ error: 'ID huruf tidak valid.' });
      return;
    }

    const currentList = Array.isArray(state.stats.masteredLetters)
      ? state.stats.masteredLetters
      : ['let-ae', 'let-oe', 'let-ue', 'let-ss'];

    const exists = currentList.includes(letterId);
    if (exists) {
      state.stats.masteredLetters = currentList.filter((id) => id !== letterId);
    } else {
      state.stats.masteredLetters = [...currentList, letterId];
      state.stats.totalXp += 10;
    }

    saveStore(state);
    res.json({
      masteredLetters: state.stats.masteredLetters,
      stats: state.stats,
    });
  });

  // POST /api/pronunciation/evaluate - Evaluate German pronunciation (deterministic + optional Gemini enrichment)
  app.post('/api/pronunciation/evaluate', async (req, res) => {
    const { vocabId, spokenText } = req.body || {};
    if (typeof spokenText !== 'string' || spokenText.trim().length === 0) {
      res.status(400).json({
        error: 'Masukkan atau rekam teks pengucapan bahasa Jerman terlebih dahulu.',
      });
      return;
    }

    const vocab =
      state.vocabulary.find((v) => v.id === vocabId) || state.vocabulary[0];

    const evaluation = evaluatePronunciationAttempt(vocab, spokenText);

    // Optional server-side Gemini coaching enrichment when API key is configured
    const ai = getGeminiClient();
    if (ai) {
      try {
        const aiResponse = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: `Evaluasi pengucapan bahasa Jerman berikut untuk pembelajar Indonesia:
Target kata: "${vocab.article !== 'none' ? `${vocab.article} ${vocab.word}` : vocab.word}" (IPA: ${vocab.ipa}, Fokus fonetik: ${vocab.phoneticFocus})
Transkrip yang diucapkan pengguna: "${spokenText}"
Skor kemiripan fonetik awal: ${evaluation.overallScore}%

Berikan ringkasan umpan balik singkat (1-2 kalimat bahasa Indonesia) dan maksimal 2 tips artikulasi praktis.`,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                feedbackSummaryId: {
                  type: Type.STRING,
                  description: 'Ringkasan umpan balik singkat dalam bahasa Indonesia.',
                },
                tips: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Daftar 1-2 tips artikulasi spesifik.',
                },
              },
            },
          },
        });

        if (aiResponse.text) {
          const parsed = JSON.parse(aiResponse.text.trim());
          if (parsed.feedbackSummaryId) {
            evaluation.feedbackSummaryId = parsed.feedbackSummaryId;
          }
          if (Array.isArray(parsed.tips) && parsed.tips.length > 0) {
            evaluation.phoneticCoachingTips = parsed.tips.slice(0, 3);
          }
        }
      } catch {
        geminiQuotaAvailable = false;
        // Keep deterministic phonetic evaluation if Gemini quota or key is unavailable
      }
    }

    // Update vocab accuracy and pronunciation history
    const vocabIdx = state.vocabulary.findIndex((v) => v.id === vocab.id);
    if (vocabIdx !== -1) {
      state.vocabulary[vocabIdx] = {
        ...state.vocabulary[vocabIdx],
        lastAccuracy: evaluation.overallScore,
      };
    }

    state.pronunciationHistory = [
      evaluation,
      ...state.pronunciationHistory.slice(0, 14),
    ];

    const allScores = state.pronunciationHistory.map((h) => h.overallScore);
    state.stats.avgPronunciationScore = Math.round(
      allScores.reduce((acc, s) => acc + s, 0) / Math.max(1, allScores.length)
    );
    state.stats.totalXp += evaluation.overallScore >= 80 ? 20 : 10;

    saveStore(state);

    res.json({
      evaluation,
      stats: state.stats,
      vocab: state.vocabulary[vocabIdx],
    });
  });

  // POST /api/tts - Server-side Gemini TTS with graceful browser fallback flag
  app.post('/api/tts', async (req, res) => {
    const { text } = req.body || {};
    if (!text || typeof text !== 'string') {
      res.status(400).json({ error: 'Teks tidak boleh kosong.' });
      return;
    }

    const ai = getGeminiClient();
    if (!ai) {
      res.json({ fallback: true });
      return;
    }

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash-lite-tts',
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `Sprich deutlich auf Hochdeutsch: ${text}`,
              },
            ],
          },
        ],
        config: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: {
              prebuiltVoiceConfig: { voiceName: 'Kore' },
            },
          },
        },
      });

      const base64Audio =
        response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      if (base64Audio) {
        res.json({
          fallback: false,
          audioBase64: base64Audio,
          mimeType: 'audio/wav',
        });
        return;
      }
    } catch {
      // Fallback cleanly to client-side German Web Speech synthesis
    }

    res.json({ fallback: true });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`KlangWerk server listening on http://localhost:${PORT}`);
  });
}

startServer();
