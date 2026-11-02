/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import {
  AppStatePayload,
  GermanArticle,
  PronunciationEvaluationResult,
  SrsRating,
  UserStudyStats,
  VocabItem,
} from './types';
import { SEED_VOCABULARY } from './data/seedVocabulary';
import { GERMAN_ALPHABET_ITEMS } from './data/germanAlphabet';
import { AlphabetPhoneticsStage } from './components/AlphabetPhoneticsStage';
import { DailyVocabStage } from './components/DailyVocabStage';
import { PronunciationStudio } from './components/PronunciationStudio';
import { ArticleQuizStage } from './components/ArticleQuizStage';
import { VocabExplorerStage } from './components/VocabExplorerStage';
import { AddVocabModal } from './components/AddVocabModal';
import { speakGermanText } from './utils/speechAudio';
import { Volume2 } from 'lucide-react';

type ActiveWorkspaceTab =
  | 'alphabet'
  | 'daily'
  | 'pronunciation'
  | 'quiz'
  | 'explorer';

const PHONETIC_QUICK_GUIDE = [
  {
    symbol: 'ü [yː]',
    example: 'das Frühstück',
    desc: 'Lidah posisi "i", bibir membulat maju seperti "u".',
  },
  {
    symbol: 'ö [œ]',
    example: 'das Wörterbuch',
    desc: 'Lidah posisi "e", bibir membulat ke depan.',
  },
  {
    symbol: 'ch [ç]',
    example: 'das Gespräch',
    desc: 'Ich-Laut: desis halus di langit-langit keras.',
  },
  {
    symbol: 'sch [ʃ]',
    example: 'der Kühlschrank',
    desc: 'Bibir maju menghasilkan desis tebal "sy".',
  },
  {
    symbol: 'ß [s]',
    example: 'die Straßenbahn',
    desc: 'Eszett: bunyi "s" tajam sesudah vokal panjang.',
  },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveWorkspaceTab>('alphabet');
  const [vocabulary, setVocabulary] = useState<VocabItem[]>(SEED_VOCABULARY);
  const [activeVocabId, setActiveVocabId] = useState<string>(
    SEED_VOCABULARY[0].id
  );
  const [xrayWordTarget, setXrayWordTarget] = useState<string>('Kühlschrank');
  const [pronunciationHistory, setPronunciationHistory] = useState<
    PronunciationEvaluationResult[]
  >([]);
  const [latestEvaluation, setLatestEvaluation] =
    useState<PronunciationEvaluationResult | null>(null);
  const [stats, setStats] = useState<UserStudyStats>({
    dailyTarget: 10,
    dailyCompleted: 4,
    streakDays: 7,
    totalXp: 420,
    articleQuizCorrect: 14,
    articleQuizTotal: 16,
    avgPronunciationScore: 89,
    masteredLetters: ['let-ae', 'let-oe', 'let-ue', 'let-ss'],
  });
  const [dailyGoalTarget, setDailyGoalTarget] = useState<number>(10);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetchInitialState() {
      try {
        const res = await fetch('/api/state');
        if (res.ok) {
          const data = (await res.json()) as AppStatePayload;
          if (!cancelled) {
            if (Array.isArray(data.vocabulary) && data.vocabulary.length > 0) {
              setVocabulary(data.vocabulary);
              setActiveVocabId(data.vocabulary[0].id);
            }
            if (Array.isArray(data.pronunciationHistory)) {
              setPronunciationHistory(data.pronunciationHistory);
              setLatestEvaluation(data.pronunciationHistory[0] || null);
            }
            if (data.stats) {
              setStats({
                ...data.stats,
                masteredLetters: Array.isArray(data.stats.masteredLetters)
                  ? data.stats.masteredLetters
                  : ['let-ae', 'let-oe', 'let-ue', 'let-ss'],
              });
              setDailyGoalTarget(data.stats.dailyTarget || 10);
            }
          }
        }
      } catch {
        // Fallback to deterministic seed state
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    fetchInitialState();
    return () => {
      cancelled = true;
    };
  }, []);

  const activeVocab =
    vocabulary.find((v) => v.id === activeVocabId) || vocabulary[0];

  const handleSelectVocab = (vocab: VocabItem) => {
    setActiveVocabId(vocab.id);
  };

  const handleToggleMasteredLetter = async (letterId: string) => {
    try {
      const res = await fetch('/api/alphabet/mastery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ letterId }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch {
      setStats((prev) => {
        const current = prev.masteredLetters || [];
        const exists = current.includes(letterId);
        return {
          ...prev,
          masteredLetters: exists
            ? current.filter((id) => id !== letterId)
            : [...current, letterId],
        };
      });
    }
  };

  const handleSubmitSrsReview = async (vocabId: string, rating: SrsRating) => {
    try {
      const res = await fetch(`/api/vocabulary/${vocabId}/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating }),
      });
      if (res.ok) {
        const data = await res.json();
        setVocabulary((prev) =>
          prev.map((item) => (item.id === vocabId ? data.vocab : item))
        );
        if (data.stats) setStats(data.stats);
      }
    } catch {
      // Ignore network error on fallback
    }
  };

  const handleEvaluatePronunciation = async (
    vocabId: string,
    spokenText: string
  ): Promise<PronunciationEvaluationResult | null> => {
    try {
      const res = await fetch('/api/pronunciation/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vocabId, spokenText }),
      });
      if (res.ok) {
        const data = await res.json();
        const evalResult = data.evaluation as PronunciationEvaluationResult;
        setLatestEvaluation(evalResult);
        setPronunciationHistory((prev) => [evalResult, ...prev.slice(0, 14)]);
        if (data.stats) setStats(data.stats);
        if (data.vocab) {
          setVocabulary((prev) =>
            prev.map((v) => (v.id === data.vocab.id ? data.vocab : v))
          );
        }
        return evalResult;
      }
    } catch {
      // Ignore network error
    }
    return null;
  };

  const handleSubmitQuizAnswer = async (
    vocabId: string,
    selectedArticle: GermanArticle
  ) => {
    try {
      const res = await fetch('/api/article-quiz/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vocabId, selectedArticle }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.stats) setStats(data.stats);
      }
    } catch {
      // Ignore network error
    }
  };

  const handleCreatedVocab = (newVocab: VocabItem, updatedTotalXp: number) => {
    setVocabulary((prev) => [newVocab, ...prev]);
    setActiveVocabId(newVocab.id);
    setStats((prev) => ({ ...prev, totalXp: updatedTotalXp }));
  };

  const masteredCount = vocabulary.filter((v) => v.mastered).length;
  const masteredLettersList = stats.masteredLetters || [
    'let-ae',
    'let-oe',
    'let-ue',
    'let-ss',
  ];
  const dailyProgressPct = Math.min(
    100,
    Math.round((stats.dailyCompleted / Math.max(1, dailyGoalTarget)) * 100)
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F5F0] text-stone-900">
      {/* Strict 3-Zone Top Bar Contract */}
      <header className="flex items-center justify-between gap-8 px-6 py-4 bg-white border-b border-stone-200/90">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            setActiveTab('alphabet');
          }}
          className="text-lg font-bold tracking-tight text-stone-950 font-display whitespace-nowrap shrink-0"
        >
          KlangWerk
        </a>

        {/* Zone 2: 5 concise single-line text navigation links */}
        <nav
          aria-label="Navigasi Utama"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-stone-600"
        >
          <a
            href="#huruf-ejaan"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('alphabet');
            }}
            className={`hover:text-stone-950 transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'alphabet'
                ? 'text-stone-950 underline underline-offset-8 decoration-2 decoration-blue-700 font-semibold'
                : ''
            }`}
          >
            Huruf & Ejaan
          </a>
          <a
            href="#kosakata-harian"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('daily');
            }}
            className={`hover:text-stone-950 transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'daily'
                ? 'text-stone-950 underline underline-offset-8 decoration-2 decoration-blue-700 font-semibold'
                : ''
            }`}
          >
            Kosakata Harian
          </a>
          <a
            href="#pengucapan"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('pronunciation');
            }}
            className={`hover:text-stone-950 transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'pronunciation'
                ? 'text-stone-950 underline underline-offset-8 decoration-2 decoration-blue-700 font-semibold'
                : ''
            }`}
          >
            Pengucapan
          </a>
          <a
            href="#kuis-artikel"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('quiz');
            }}
            className={`hover:text-stone-950 transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'quiz'
                ? 'text-stone-950 underline underline-offset-8 decoration-2 decoration-blue-700 font-semibold'
                : ''
            }`}
          >
            Kuis Artikel
          </a>
          <a
            href="#kamus-progres"
            onClick={(e) => {
              e.preventDefault();
              setActiveTab('explorer');
            }}
            className={`hover:text-stone-950 transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'explorer'
                ? 'text-stone-950 underline underline-offset-8 decoration-2 decoration-blue-700 font-semibold'
                : ''
            }`}
          >
            Kamus & Progres
          </a>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 text-xs font-semibold text-white bg-stone-900 rounded-lg hover:bg-stone-800 transition-colors whitespace-nowrap shrink-0"
          >
            Tambah Kosakata
          </button>
        </div>
      </header>

      {/* Mobile Workspace Switcher (Visible below md) */}
      <div className="md:hidden bg-white border-b border-stone-200 px-4 py-2 flex items-center gap-1 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('alphabet')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap shrink-0 ${
            activeTab === 'alphabet'
              ? 'bg-stone-900 text-white'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          Huruf & Ejaan
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('daily')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap shrink-0 ${
            activeTab === 'daily'
              ? 'bg-stone-900 text-white'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          Kosakata Harian
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('pronunciation')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap shrink-0 ${
            activeTab === 'pronunciation'
              ? 'bg-stone-900 text-white'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          Pengucapan
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('quiz')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap shrink-0 ${
            activeTab === 'quiz'
              ? 'bg-stone-900 text-white'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          Kuis Artikel
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('explorer')}
          className={`px-3 py-1.5 text-xs font-medium rounded-md whitespace-nowrap shrink-0 ${
            activeTab === 'explorer'
              ? 'bg-stone-900 text-white'
              : 'text-stone-600 hover:text-stone-900'
          }`}
        >
          Kamus & Progres
        </button>
      </div>

      {/* Main Two-Zone Educational Sandbox Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8">
        {isLoading ? (
          <div className="p-12 text-center text-sm text-stone-600">
            Memuat dek kosakata dan laboratorium huruf Bahasa Jerman...
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left / Main Interactive Stage (67% width on desktop) */}
            <div className="lg:col-span-8">
              {activeTab === 'alphabet' && (
                <AlphabetPhoneticsStage
                  key={xrayWordTarget}
                  vocabulary={vocabulary}
                  masteredLetters={masteredLettersList}
                  onToggleMasteredLetter={handleToggleMasteredLetter}
                  initialXrayWord={xrayWordTarget}
                />
              )}

              {activeTab === 'daily' && (
                <DailyVocabStage
                  vocabulary={vocabulary}
                  activeVocab={activeVocab}
                  onSelectVocab={handleSelectVocab}
                  onSubmitSrsReview={handleSubmitSrsReview}
                  onOpenPronunciationFor={(vocab) => {
                    setActiveVocabId(vocab.id);
                    setActiveTab('pronunciation');
                  }}
                  onOpenAlphabetFor={(word) => {
                    setXrayWordTarget(word);
                    setActiveTab('alphabet');
                  }}
                />
              )}

              {activeTab === 'pronunciation' && (
                <PronunciationStudio
                  vocabulary={vocabulary}
                  activeVocab={activeVocab}
                  onSelectVocab={handleSelectVocab}
                  latestEvaluation={latestEvaluation}
                  history={pronunciationHistory}
                  onEvaluatePronunciation={handleEvaluatePronunciation}
                />
              )}

              {activeTab === 'quiz' && (
                <ArticleQuizStage
                  vocabulary={vocabulary}
                  articleQuizCorrect={stats.articleQuizCorrect}
                  articleQuizTotal={stats.articleQuizTotal}
                  onSubmitQuizAnswer={handleSubmitQuizAnswer}
                />
              )}

              {activeTab === 'explorer' && (
                <VocabExplorerStage
                  vocabulary={vocabulary}
                  pronunciationHistory={pronunciationHistory}
                  onSelectForPractice={(vocab, tab) => {
                    setActiveVocabId(vocab.id);
                    setActiveTab(tab);
                  }}
                  onWordAdded={handleCreatedVocab}
                />
              )}
            </div>

            {/* Right Control & Concept Deck (33% width on desktop) */}
            <aside
              aria-label="Panel Progres dan Panduan Fonetik"
              className="lg:col-span-4 space-y-6"
            >
              {/* Daily Target & SRS Mastery Card */}
              <section className="bg-white border border-stone-200/90 rounded-xl p-6 space-y-5">
                <div className="flex items-baseline justify-between border-b border-stone-200/80 pb-3.5">
                  <div>
                    <span className="text-xs text-stone-500">
                      Ringkasan Sesi Belajar
                    </span>
                    <h3 className="text-base font-bold text-stone-900 mt-0.5">
                      Target & Retensi Harian
                    </h3>
                  </div>
                  <span className="text-xs font-mono-tabular font-semibold text-emerald-800">
                    Runtutan {stats.streakDays} Hari
                  </span>
                </div>

                {/* Progress Bar */}
                <div>
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-medium text-stone-700">
                      Latihan Selesai Hari Ini
                    </span>
                    <span className="font-mono-tabular font-bold text-stone-900">
                      {stats.dailyCompleted} / {dailyGoalTarget} Kata (
                      {dailyProgressPct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-700 transition-transform duration-150 origin-left"
                      style={{
                        transform: `scaleX(${dailyProgressPct / 100})`,
                      }}
                    />
                  </div>
                </div>

                {/* Labeled Slider for Daily Target */}
                <div className="pt-1">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <label
                      htmlFor="daily-goal-slider"
                      className="font-medium text-stone-600"
                    >
                      Atur Target Harian:
                    </label>
                    <span className="font-mono-tabular font-semibold text-stone-900">
                      {dailyGoalTarget} Kata / Hari
                    </span>
                  </div>
                  <input
                    id="daily-goal-slider"
                    type="range"
                    min={5}
                    max={25}
                    step={5}
                    value={dailyGoalTarget}
                    onChange={(e) => setDailyGoalTarget(Number(e.target.value))}
                    className="w-full accent-blue-700 cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-mono-tabular text-stone-400">
                    <span>5 Kata</span>
                    <span>15 Kata</span>
                    <span>25 Kata</span>
                  </div>
                </div>

                {/* Unboxed Hairline Ledger Metrics (Zero nested cards) */}
                <div className="grid grid-cols-3 divide-x divide-stone-200/80 pt-4 border-t border-stone-200/80 text-center">
                  <div className="px-2">
                    <div className="text-xl font-bold font-display font-mono-tabular text-stone-900">
                      {stats.totalXp}
                    </div>
                    <div className="text-[11px] text-stone-500 mt-0.5">
                      Total XP
                    </div>
                  </div>
                  <div className="px-2">
                    <div className="text-xl font-bold font-display font-mono-tabular text-stone-900">
                      {masteredLettersList.length}/{GERMAN_ALPHABET_ITEMS.length}
                    </div>
                    <div className="text-[11px] text-stone-500 mt-0.5">
                      Huruf & Digraf
                    </div>
                  </div>
                  <div className="px-2">
                    <div className="text-xl font-bold font-display font-mono-tabular text-stone-900">
                      {masteredCount}/{vocabulary.length}
                    </div>
                    <div className="text-[11px] text-stone-500 mt-0.5">
                      Kata Dikuasai
                    </div>
                  </div>
                </div>
              </section>

              {/* Interactive German Phonetics Quick Reference */}
              <section className="bg-white border border-stone-200/90 rounded-xl p-6 space-y-3">
                <div className="border-b border-stone-200/80 pb-3.5">
                  <span className="text-xs text-stone-500">
                    Referensi Artikulasi Hochdeutsch
                  </span>
                  <h3 className="text-base font-bold text-stone-900 mt-0.5">
                    Kunci Bunyi Khas Jerman
                  </h3>
                </div>

                <div className="divide-y divide-stone-200/70">
                  {PHONETIC_QUICK_GUIDE.map((item) => (
                    <div
                      key={item.symbol}
                      className="py-2.5 flex items-start justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold font-mono-tabular text-blue-700">
                            {item.symbol}
                          </span>
                          <span
                            className="text-xs text-stone-400"
                            aria-hidden="true"
                          >
                            ·
                          </span>
                          <span className="text-xs font-semibold text-stone-900">
                            {item.example}
                          </span>
                        </div>
                        <p className="text-[11px] text-stone-600 mt-0.5">
                          {item.desc}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => speakGermanText(item.example, 0.9)}
                        aria-label={`Dengarkan contoh ${item.example}`}
                        className="p-1.5 text-stone-600 hover:text-blue-700 bg-stone-100 hover:bg-blue-50 rounded-md transition-colors shrink-0"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              {/* Recent Pronunciation History */}
              <section className="bg-white border border-stone-200/90 rounded-xl p-6 space-y-3">
                <div className="flex items-baseline justify-between border-b border-stone-200/80 pb-3.5">
                  <div>
                    <span className="text-xs text-stone-500">
                      Riwayat Evaluasi Suara
                    </span>
                    <h3 className="text-base font-bold text-stone-900 mt-0.5">
                      Log Pengucapan Terakhir
                    </h3>
                  </div>
                  <span className="text-xs font-mono-tabular text-stone-500">
                    {pronunciationHistory.length} Sesi
                  </span>
                </div>

                {pronunciationHistory.length === 0 ? (
                  <p className="text-xs text-stone-500">
                    Belum ada evaluasi pengucapan. Buka tab Pengucapan untuk mulai berlatih.
                  </p>
                ) : (
                  <div className="divide-y divide-stone-200/70">
                    {pronunciationHistory.slice(0, 4).map((item) => (
                      <div
                        key={item.id}
                        className="py-2.5 flex items-center justify-between gap-2 text-xs"
                      >
                        <div className="min-w-0">
                          <div className="font-semibold text-stone-900 truncate">
                            {item.targetText}
                          </div>
                          <div className="text-[11px] text-stone-500 truncate">
                            Input: „{item.spokenText}“
                          </div>
                        </div>
                        <div className="text-right font-mono-tabular shrink-0">
                          <span
                            className={`font-bold ${
                              item.overallScore >= 85
                                ? 'text-emerald-700'
                                : item.overallScore >= 65
                                ? 'text-amber-700'
                                : 'text-red-700'
                            }`}
                          >
                            {item.overallScore}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </aside>
          </div>
        )}
      </main>

      {/* Clean Minimal Footer */}
      <footer className="bg-white border-t border-stone-200/90 py-5 px-6 mt-12">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs text-stone-500">
          <span>
            KlangWerk · Studio Fonetik, Morfologi & Kosakata Bahasa Jerman (CEFR A1–C1)
          </span>
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => setActiveTab('alphabet')}
              className="hover:text-stone-900 transition-colors"
            >
              Lab Huruf & Ejaan
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('daily')}
              className="hover:text-stone-900 transition-colors"
            >
              Latihan SRS
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('pronunciation')}
              className="hover:text-stone-900 transition-colors"
            >
              Studio Pengucapan
            </button>
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="hover:text-stone-900 transition-colors"
            >
              Tambah Kosakata
            </button>
          </div>
        </div>
      </footer>

      <AddVocabModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onCreated={handleCreatedVocab}
      />
    </div>
  );
}
