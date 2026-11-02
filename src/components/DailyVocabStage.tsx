import React, { useState } from 'react';
import { CefrLevel, SrsRating, VocabItem } from '../types';
import {
  conjugateGermanVerb,
  deconstructWordToGraphemes,
  generateCaseDeclensionTable,
  getArticleMorphologyRule,
} from '../utils/germanRules';
import { speakGermanText } from '../utils/speechAudio';
import { Volume2, RotateCw, Mic, ChevronLeft, ChevronRight } from 'lucide-react';

interface DailyVocabStageProps {
  vocabulary: VocabItem[];
  activeVocab: VocabItem;
  onSelectVocab: (vocab: VocabItem) => void;
  onSubmitSrsReview: (vocabId: string, rating: SrsRating) => Promise<void>;
  onOpenPronunciationFor: (vocab: VocabItem) => void;
  onOpenAlphabetFor?: (word: string) => void;
}

const ARTICLE_COLOR_MAP: Record<string, string> = {
  der: 'text-blue-700',
  die: 'text-rose-700',
  das: 'text-emerald-700',
  none: 'text-stone-600',
};

const ARTICLE_LABEL_MAP: Record<string, string> = {
  der: 'Maskulin (der)',
  die: 'Feminin (die)',
  das: 'Neutrum (das)',
  none: 'Verba / Ungkapan',
};

export const DailyVocabStage: React.FC<DailyVocabStageProps> = ({
  vocabulary,
  activeVocab,
  onSelectVocab,
  onSubmitSrsReview,
  onOpenPronunciationFor,
  onOpenAlphabetFor,
}) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isPlayingWord, setIsPlayingWord] = useState(false);
  const [isPlayingSentence, setIsPlayingSentence] = useState(false);
  const [isSavingReview, setIsSavingReview] = useState(false);
  const [lastFeedbackBanner, setLastFeedbackBanner] = useState<string | null>(
    null
  );
  const [deckLevelFilter, setDeckLevelFilter] = useState<'ALL' | CefrLevel>(
    'ALL'
  );
  const [deckCategoryFilter, setDeckCategoryFilter] = useState<string>('ALL');
  const [showAllQueue, setShowAllQueue] = useState(false);

  const deckItems = vocabulary.filter((v) => {
    const matchLvl =
      deckLevelFilter === 'ALL' || v.level === deckLevelFilter;
    const matchCat =
      deckCategoryFilter === 'ALL' || v.category === deckCategoryFilter;
    return matchLvl && matchCat;
  });

  const safeDeck = deckItems.length > 0 ? deckItems : vocabulary;
  const graphemeTiles = deconstructWordToGraphemes(activeVocab.word);
  const caseDeclensions = generateCaseDeclensionTable(
    activeVocab.word,
    activeVocab.article,
    activeVocab.plural
  );
  const verbConjugation =
    activeVocab.article === 'none'
      ? conjugateGermanVerb(activeVocab.word)
      : null;

  const currentIndex = Math.max(
    0,
    safeDeck.findIndex((v) => v.id === activeVocab.id)
  );

  const fullWordWithArticle =
    activeVocab.article !== 'none'
      ? `${activeVocab.article} ${activeVocab.word}`
      : activeVocab.word;

  const handlePlayWord = () => {
    speakGermanText(
      fullWordWithArticle,
      0.92,
      () => setIsPlayingWord(true),
      () => setIsPlayingWord(false)
    );
  };

  const handlePlaySentence = () => {
    speakGermanText(
      activeVocab.exampleDe,
      0.9,
      () => setIsPlayingSentence(true),
      () => setIsPlayingSentence(false)
    );
  };

  const handlePrev = () => {
    const prevIdx = (currentIndex - 1 + safeDeck.length) % safeDeck.length;
    setIsFlipped(false);
    setLastFeedbackBanner(null);
    onSelectVocab(safeDeck[prevIdx]);
  };

  const handleNext = () => {
    const nextIdx = (currentIndex + 1) % safeDeck.length;
    setIsFlipped(false);
    setLastFeedbackBanner(null);
    onSelectVocab(safeDeck[nextIdx]);
  };

  const handleRate = async (rating: SrsRating, label: string) => {
    if (isSavingReview) return;
    setIsSavingReview(true);
    try {
      await onSubmitSrsReview(activeVocab.id, rating);
      setLastFeedbackBanner(
        `Tersimpan: „${fullWordWithArticle}“ dijadwalkan ulang (${label}).`
      );
      setIsFlipped(false);
      const nextIdx = (currentIndex + 1) % safeDeck.length;
      if (safeDeck[nextIdx]) {
        onSelectVocab(safeDeck[nextIdx]);
      }
    } finally {
      setIsSavingReview(false);
    }
  };

  const morphologyRule = getArticleMorphologyRule(
    activeVocab.word,
    activeVocab.article
  );

  const visibleQueueItems = showAllQueue
    ? safeDeck
    : safeDeck.slice(0, 16);

  return (
    <div className="space-y-6">
      {/* Stage Top Bar: Editorial Masthead & Navigation */}
      <div className="flex flex-wrap items-end justify-between gap-4 pb-4 border-b border-stone-200/90">
        <div>
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <span>Kurikulum Goethe & TestDaF A1–C1</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono-tabular">
              Kartu {currentIndex + 1} / {safeDeck.length}
            </span>
            <span aria-hidden="true">·</span>
            <span>Level {activeVocab.level}</span>
            <span aria-hidden="true">·</span>
            <span>{activeVocab.category}</span>
          </div>
          <h2 className="text-2xl font-bold text-stone-950 mt-1 tracking-tight">
            Latihan Kosakata, Deklinasi 4 Kasus & Konjugasi ({vocabulary.length} Kata)
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            aria-label="Filter level CEFR kosakata harian"
            value={deckLevelFilter}
            onChange={(e) => {
              const nextLvl = e.target.value as 'ALL' | CefrLevel;
              setDeckLevelFilter(nextLvl);
              const matching = vocabulary.filter(
                (v) =>
                  (nextLvl === 'ALL' || v.level === nextLvl) &&
                  (deckCategoryFilter === 'ALL' ||
                    v.category === deckCategoryFilter)
              );
              if (matching[0]) onSelectVocab(matching[0]);
            }}
            className="px-3 py-2 text-xs font-medium bg-white border border-stone-200/90 rounded-lg text-stone-800 focus:outline-none focus:ring-2 focus:ring-blue-700"
          >
            <option value="ALL">
              Semua Level A1–C1 ({vocabulary.length} Kata)
            </option>
            {(['A1', 'A2', 'B1', 'B2', 'C1'] as CefrLevel[]).map((lvl) => {
              const count = vocabulary.filter((v) => v.level === lvl).length;
              return (
                <option key={lvl} value={lvl}>
                  Level {lvl} ({count} Kata)
                </option>
              );
            })}
          </select>

          <select
            aria-label="Filter tema kosakata harian"
            value={deckCategoryFilter}
            onChange={(e) => {
              const nextCat = e.target.value;
              setDeckCategoryFilter(nextCat);
              const matching = vocabulary.filter(
                (v) =>
                  (deckLevelFilter === 'ALL' || v.level === deckLevelFilter) &&
                  (nextCat === 'ALL' || v.category === nextCat)
              );
              if (matching[0]) onSelectVocab(matching[0]);
            }}
            className="px-3 py-2 text-xs font-medium bg-white border border-stone-200/90 rounded-lg text-stone-800 focus:outline-none focus:ring-2 focus:ring-blue-700"
          >
            <option value="ALL">Semua Tema ({vocabulary.length} Kata)</option>
            <option value="Salam & Komunikasi">Salam & Komunikasi</option>
            <option value="Keluarga & Rumah">Keluarga & Rumah</option>
            <option value="Kuliner & Kafe">Kuliner & Kafe</option>
            <option value="Perjalanan & Kota">Perjalanan & Kota</option>
            <option value="Kehidupan Sehari-hari">Kehidupan Sehari-hari</option>
            <option value="Kerja & Studi">Kerja & Studi</option>
            <option value="Waktu, Angka & Alam">Waktu, Angka & Alam</option>
            <option value="Verba & Sifat A1">Kata Kerja & Sifat</option>
            <option value="Akademik, Bisnis & C1">Akademik, Bisnis & C1</option>
          </select>

          <button
            type="button"
            onClick={() => {
              if (safeDeck.length <= 1) return;
              const randIdx =
                (currentIndex +
                  1 +
                  Math.floor(Math.random() * (safeDeck.length - 1))) %
                safeDeck.length;
              setIsFlipped(false);
              setLastFeedbackBanner(null);
              onSelectVocab(safeDeck[randIdx]);
            }}
            aria-label="Pilih kartu kosakata acak"
            className="px-3 py-2 text-xs font-medium text-stone-700 bg-white border border-stone-200/90 rounded-lg hover:bg-stone-50 transition-colors whitespace-nowrap shrink-0"
          >
            Acak Kartu
          </button>

          <button
            type="button"
            onClick={handlePrev}
            aria-label="Kartu kosakata sebelumnya"
            className="px-3 py-2 text-xs font-medium text-stone-700 bg-white border border-stone-200/90 rounded-lg hover:bg-stone-50 transition-colors flex items-center gap-1 whitespace-nowrap shrink-0"
          >
            <ChevronLeft className="w-4 h-4" />
            Sebelumnya
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label="Kartu kosakata berikutnya"
            className="px-3 py-2 text-xs font-medium text-stone-700 bg-white border border-stone-200/90 rounded-lg hover:bg-stone-50 transition-colors flex items-center gap-1 whitespace-nowrap shrink-0"
          >
            Berikutnya
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {lastFeedbackBanner && (
        <div
          role="status"
          className="px-4 py-2.5 rounded-lg bg-emerald-50/80 border border-emerald-300/80 text-xs font-medium text-emerald-900 flex items-center justify-between"
        >
          <span>{lastFeedbackBanner}</span>
          <button
            type="button"
            onClick={() => setLastFeedbackBanner(null)}
            className="text-emerald-800 underline ml-4 whitespace-nowrap shrink-0"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Main Flashcard Specimen Surface (Single-Elevation Card) */}
      <div className="bg-white border border-stone-200/90 rounded-xl p-6 sm:p-8">
        {/* Unboxed Metadata Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500 pb-5 border-b border-stone-200/80">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-stone-900">
              {ARTICLE_LABEL_MAP[activeVocab.article]}
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-semibold text-blue-700">
              CEFR {activeVocab.level}
            </span>
            <span aria-hidden="true">·</span>
            <span className="font-mono-tabular">
              Kotak SRS {activeVocab.srsBox}/5
            </span>
            <span aria-hidden="true">·</span>
            <span>Jadwal: {activeVocab.nextReviewLabel}</span>
            {activeVocab.mastered && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-emerald-700 font-semibold">
                  Dikuasai
                </span>
              </>
            )}
          </div>

          <div className="font-mono-tabular text-stone-500">
            Ulasan: {activeVocab.reviewCount}x
            {activeVocab.lastAccuracy !== null &&
              ` · Akurasi Ucap: ${activeVocab.lastAccuracy}%`}
          </div>
        </div>

        {/* Center Word & Phonetics Specimen */}
        <div className="py-7">
          <div className="flex flex-wrap items-baseline gap-3.5">
            {activeVocab.article !== 'none' && (
              <span
                className={`text-3xl sm:text-4xl font-bold font-display ${
                  ARTICLE_COLOR_MAP[activeVocab.article]
                }`}
              >
                {activeVocab.article}
              </span>
            )}
            <h3 className="text-4xl sm:text-5xl font-bold text-stone-950 tracking-tight font-display">
              {activeVocab.word}
            </h3>
            <span className="text-lg font-mono-tabular text-stone-500">
              {activeVocab.ipa}
            </span>
          </div>

          <div className="mt-2.5 flex flex-wrap items-center gap-2 text-xs text-stone-500">
            <span>Bentuk Jamak / Pokok: {activeVocab.plural}</span>
            <span aria-hidden="true">·</span>
            <span>
              Suku kata:{' '}
              <strong className="font-mono-tabular text-stone-800">
                {activeVocab.syllables.join(' · ')}
              </strong>
            </span>
            <span aria-hidden="true">·</span>
            <span>Fokus: {activeVocab.phoneticFocus}</span>
          </div>

          {/* Interactive Per-Letter Breakdown Strip */}
          <div className="mt-5 pt-4 border-t border-stone-200/70">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
              <span className="text-xs font-medium text-stone-500">
                Bedah Bunyi Per Huruf & Digraf (Klik huruf untuk mendengar):
              </span>
              {onOpenAlphabetFor && (
                <button
                  type="button"
                  onClick={() => onOpenAlphabetFor(activeVocab.word)}
                  className="text-xs font-semibold text-blue-700 hover:text-blue-800 underline whitespace-nowrap shrink-0"
                >
                  Buka di Lab Huruf & Ejaan →
                </button>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {graphemeTiles.map((seg, idx) => (
                <button
                  key={`${seg.grapheme}-${idx}`}
                  type="button"
                  onClick={() => speakGermanText(seg.grapheme, 0.85)}
                  title={seg.ruleNoteId}
                  className={`px-2.5 py-1 rounded-md border text-left transition-colors ${
                    seg.isSpecialGerman
                      ? 'bg-stone-50 border-stone-300 text-stone-950 hover:bg-blue-50/60 hover:border-blue-400'
                      : 'bg-white border-stone-200 text-stone-800 hover:bg-stone-50'
                  }`}
                >
                  <span className="text-xs font-bold font-display">
                    {seg.grapheme}
                  </span>{' '}
                  <span className="text-[10px] font-mono-tabular text-blue-700">
                    {seg.soundIpa}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Primary Card Controls */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handlePlayWord}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 rounded-lg hover:bg-blue-800 transition-colors flex items-center gap-2 whitespace-nowrap shrink-0"
            >
              <Volume2 className="w-4 h-4" />
              {isPlayingWord ? 'Memutar Audio...' : 'Dengarkan Kata'}
            </button>

            <button
              type="button"
              onClick={() => setIsFlipped((prev) => !prev)}
              className="px-4 py-2 text-xs font-semibold text-stone-800 bg-stone-100 rounded-lg hover:bg-stone-200 transition-colors flex items-center gap-2 whitespace-nowrap shrink-0"
            >
              <RotateCw className="w-4 h-4" />
              {isFlipped ? 'Sembunyikan Detail Arti' : 'Balik Kartu & Lihat Arti'}
            </button>

            <button
              type="button"
              onClick={() => onOpenPronunciationFor(activeVocab)}
              className="px-4 py-2 text-xs font-semibold text-stone-800 bg-white border border-stone-300 rounded-lg hover:bg-stone-50 transition-colors flex items-center gap-2 whitespace-nowrap shrink-0"
            >
              <Mic className="w-4 h-4 text-blue-700" />
              Latih Pengucapan Kata Ini
            </button>
          </div>
        </div>

        {/* Meaning & Contextual Example Section */}
        <div className="pt-6 border-t border-stone-200/80 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="text-xs font-medium text-stone-500">
              Arti Bahasa Indonesia & Aturan Genus
            </div>
            {isFlipped ? (
              <div className="mt-1.5 space-y-2">
                <div className="text-2xl font-bold text-stone-950 font-display">
                  {activeVocab.meaningId}
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {morphologyRule}
                </p>
              </div>
            ) : (
              <div className="mt-1.5">
                <p className="text-sm text-stone-600">
                  Klik tombol <strong className="text-stone-900">Balik Kartu & Lihat Arti</strong> di atas untuk menguji ingatan Anda sebelum menilai tingkat kesulitan.
                </p>
                <p className="text-xs text-stone-500 mt-1">
                  Petunjuk Genus: {morphologyRule}
                </p>
              </div>
            )}
          </div>

          <div className="md:border-l md:border-stone-200/80 md:pl-8">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-stone-500">
                Contoh Kalimat Kontekstual
              </span>
              <button
                type="button"
                onClick={handlePlaySentence}
                className="text-xs font-semibold text-blue-700 hover:text-blue-800 flex items-center gap-1 whitespace-nowrap shrink-0"
              >
                <Volume2 className="w-3.5 h-3.5" />
                {isPlayingSentence ? 'Memutar...' : 'Putar Kalimat'}
              </button>
            </div>
            <p className="text-sm font-medium text-stone-950 mt-1.5 leading-relaxed">
              „{activeVocab.exampleDe}“
            </p>
            {isFlipped && (
              <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                “{activeVocab.exampleId}”
              </p>
            )}
          </div>
        </div>

        {/* Unified Architectural 4-Case Declension Ledger (Zero Floating Sub-Cards) */}
        {caseDeclensions.length > 0 && (
          <div className="mt-6 pt-5 border-t border-stone-200/80">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <span className="text-xs font-semibold text-stone-900">
                Matriks Deklinasi 4 Kasus Jerman (Kasus-Deklination: Nominativ · Akkusativ · Dativ · Genitiv)
              </span>
              <span className="text-[11px] text-stone-500">
                Klik kolom kasus untuk mendengarkan pelafalan
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-stone-200/80 border border-stone-200/90 rounded-lg overflow-hidden">
              {caseDeclensions.map((row) => (
                <button
                  key={row.kasus}
                  type="button"
                  onClick={() => speakGermanText(row.singularForm, 0.92)}
                  className="p-3.5 bg-white hover:bg-stone-50 text-left transition-colors"
                >
                  <div className="flex items-center justify-between text-[11px] text-stone-500">
                    <span className="font-bold text-stone-900">{row.kasus}</span>
                    <span className="font-mono-tabular">{row.questionDe}</span>
                  </div>
                  <div className="text-sm font-bold text-blue-700 font-display mt-1">
                    {row.singularForm}
                  </div>
                  <div className="text-[11px] font-mono-tabular text-stone-600 mt-0.5">
                    Jamak: {row.pluralForm}
                  </div>
                  <div className="text-[10px] text-stone-500 mt-1 line-clamp-1">
                    {row.roleId}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {verbConjugation && (
          <div className="mt-6 pt-5 border-t border-stone-200/80">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
              <span className="text-xs font-semibold text-stone-900">
                Tabel Konjugasi Verba (Präsens · Präteritum · Perfekt Partizip II)
              </span>
              <span className="text-[11px] font-mono-tabular text-blue-700 font-semibold">
                Perfekt: {verbConjugation.auxiliary} + {verbConjugation.partizipII} · Präteritum: {verbConjugation.praeteritumIch}
              </span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 divide-y sm:divide-y-0 sm:divide-x divide-stone-200/80 border border-stone-200/90 rounded-lg overflow-hidden">
              {Object.entries(verbConjugation.praesens).map(([key, form]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => speakGermanText(form, 0.92)}
                  className="p-3 bg-white hover:bg-stone-50 text-left transition-colors"
                >
                  <div className="text-xs font-bold text-stone-950 font-display">
                    {form}
                  </div>
                  <div className="text-[10px] text-stone-500 mt-0.5">
                    Präsens Aktif
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Spaced Repetition (SRS) Interval Buttons */}
        <div className="mt-6 pt-5 border-t border-stone-200/80">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-stone-900">
              Evaluasi Daya Ingat Spaced Repetition (SRS)
            </span>
            <span className="text-xs text-stone-500">
              Pilih seberapa mudah Anda mengingat kata & artikelnya
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              type="button"
              disabled={isSavingReview}
              onClick={() => handleRate('again', 'Ulangi Hari Ini')}
              className="px-3.5 py-2.5 rounded-lg border border-stone-200 bg-white hover:bg-red-50/60 hover:border-red-300 text-left transition-colors"
            >
              <div className="text-xs font-bold text-stone-950">
                1 · Ulangi Lagi
              </div>
              <div className="text-[11px] font-mono-tabular text-stone-500 mt-0.5">
                &lt; 10 Menit · +5 XP
              </div>
            </button>

            <button
              type="button"
              disabled={isSavingReview}
              onClick={() => handleRate('hard', 'Besok')}
              className="px-3.5 py-2.5 rounded-lg border border-stone-200 bg-white hover:bg-amber-50/60 hover:border-amber-300 text-left transition-colors"
            >
              <div className="text-xs font-bold text-stone-950">
                2 · Cukup Sulit
              </div>
              <div className="text-[11px] font-mono-tabular text-stone-500 mt-0.5">
                1 Hari · +10 XP
              </div>
            </button>

            <button
              type="button"
              disabled={isSavingReview}
              onClick={() => handleRate('good', '3 Hari')}
              className="px-3.5 py-2.5 rounded-lg border border-blue-200 bg-blue-50/40 hover:bg-blue-50 text-left transition-colors"
            >
              <div className="text-xs font-bold text-blue-950">
                3 · Ingat Baik
              </div>
              <div className="text-[11px] font-mono-tabular text-blue-700 mt-0.5">
                3 Hari · +15 XP
              </div>
            </button>

            <button
              type="button"
              disabled={isSavingReview}
              onClick={() => handleRate('easy', '7–14 Hari')}
              className="px-3.5 py-2.5 rounded-lg border border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50 text-left transition-colors"
            >
              <div className="text-xs font-bold text-emerald-950">
                4 · Sangat Mudah
              </div>
              <div className="text-[11px] font-mono-tabular text-emerald-700 mt-0.5">
                7+ Hari · +25 XP
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Deck Selector Strip */}
      <div className="bg-white border border-stone-200/90 rounded-xl p-6">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3.5">
          <h3 className="text-sm font-bold text-stone-950">
            Daftar Kosakata Filter Ini ({safeDeck.length} Kata)
          </h3>
          {safeDeck.length > 16 && (
            <button
              type="button"
              onClick={() => setShowAllQueue((prev) => !prev)}
              className="text-xs font-semibold text-blue-700 hover:text-blue-800 underline whitespace-nowrap shrink-0"
            >
              {showAllQueue
                ? 'Ringkas Tampilan (16 Kata)'
                : `Tampilkan Semua (${safeDeck.length} Kata)`}
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
          {visibleQueueItems.map((item) => {
            const isSelected = item.id === activeVocab.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setIsFlipped(false);
                  onSelectVocab(item);
                }}
                className={`p-2.5 rounded-lg border text-left transition-colors ${
                  isSelected
                    ? 'bg-blue-50/70 border-blue-700 text-stone-950'
                    : 'bg-white border-stone-200/90 text-stone-700 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-semibold truncate">
                    {item.article !== 'none' ? `${item.article} ` : ''}
                    {item.word}
                  </span>
                  <span className="text-[10px] font-mono-tabular text-blue-700 font-semibold shrink-0">
                    {item.level}
                  </span>
                </div>
                <div className="text-[11px] text-stone-500 truncate mt-0.5">
                  {item.meaningId} · Kotak {item.srsBox}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
