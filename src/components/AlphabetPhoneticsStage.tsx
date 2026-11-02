import React, { useState } from 'react';
import {
  GermanLetterItem,
  GraphemeSegment,
  LetterCategory,
  VocabItem,
} from '../types';
import { GERMAN_ALPHABET_ITEMS } from '../data/germanAlphabet';
import {
  analyzeAdvancedPhonologicalRules,
  deconstructWordToGraphemes,
  spellWordDin5009,
} from '../utils/germanRules';
import { speakGermanText } from '../utils/speechAudio';
import { VocalTractDiagram } from './VocalTractDiagram';
import { Volume2, CheckCircle2, Play, RotateCcw } from 'lucide-react';

interface AlphabetPhoneticsStageProps {
  vocabulary: VocabItem[];
  masteredLetters: string[];
  onToggleMasteredLetter: (letterId: string) => Promise<void>;
  initialXrayWord?: string;
}

const CATEGORY_TABS: { id: 'ALL' | LetterCategory; label: string }[] = [
  { id: 'ALL', label: `Semua (${GERMAN_ALPHABET_ITEMS.length})` },
  { id: 'umlaut_eszett', label: 'Umlaut & ẞ (4)' },
  { id: 'konsonan_khas', label: 'Konsonan Khas (8)' },
  { id: 'digraf', label: 'Digraf & Diftong (7)' },
  { id: 'vokal', label: 'Vokal (5)' },
  { id: 'konsonan_standar', label: 'Konsonan (13)' },
];

export const AlphabetPhoneticsStage: React.FC<AlphabetPhoneticsStageProps> = ({
  vocabulary,
  masteredLetters,
  onToggleMasteredLetter,
  initialXrayWord = 'Kühlschrank',
}) => {
  const [selectedCategory, setSelectedCategory] = useState<
    'ALL' | LetterCategory
  >('ALL');
  const [selectedLetter, setSelectedLetter] = useState<GermanLetterItem>(
    GERMAN_ALPHABET_ITEMS[2] // Default: Ü ü
  );
  const [xrayInput, setXrayInput] = useState<string>(initialXrayWord);
  const [activeSegmentIdx, setActiveSegmentIdx] = useState<number>(0);
  const [activeSpellingIdx, setActiveSpellingIdx] = useState<number | null>(
    null
  );
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);

  // Interactive Spelling Dictation (Buchstabier-Trainer) state
  const [spellingQuizIdx, setSpellingQuizIdx] = useState(0);
  const [typedSpelling, setTypedSpelling] = useState('');
  const [spellingResult, setSpellingResult] = useState<
    'idle' | 'correct' | 'wrong'
  >('idle');

  const filteredLetters = GERMAN_ALPHABET_ITEMS.filter(
    (item) => selectedCategory === 'ALL' || item.category === selectedCategory
  );

  const graphemeSegments: GraphemeSegment[] =
    deconstructWordToGraphemes(xrayInput);
  const dinSpellingList = spellWordDin5009(xrayInput);
  const phonologicalRules = analyzeAdvancedPhonologicalRules(xrayInput);

  const activeSegment =
    graphemeSegments[
      Math.min(activeSegmentIdx, Math.max(0, graphemeSegments.length - 1))
    ] || null;

  const handlePlayLetterName = (item: GermanLetterItem) => {
    speakGermanText(
      `${item.grapheme}. ${item.examples[0]?.word || ''}`,
      0.88,
      () => setIsPlayingAudio(true),
      () => setIsPlayingAudio(false)
    );
  };

  const handlePlayDinCode = (item: GermanLetterItem) => {
    speakGermanText(
      `${item.grapheme.charAt(0).toUpperCase()} wie ${item.din5009Word}`,
      0.9,
      () => setIsPlayingAudio(true),
      () => setIsPlayingAudio(false)
    );
  };

  const handleStepThroughSpelling = async () => {
    if (dinSpellingList.length === 0 || activeSpellingIdx !== null) return;
    setIsPlayingAudio(true);

    for (let idx = 0; idx < dinSpellingList.length; idx++) {
      setActiveSpellingIdx(idx);
      const token = dinSpellingList[idx];
      await speakGermanText(`${token.char}, wie ${token.dinWord}`, 1.05);
    }

    await speakGermanText(xrayInput, 0.92);
    setActiveSpellingIdx(null);
    setIsPlayingAudio(false);
  };

  const currentSpellingTarget =
    vocabulary[spellingQuizIdx % Math.max(1, vocabulary.length)] ||
    vocabulary[0];

  const handleAppendSpecialChar = (ch: string) => {
    setTypedSpelling((prev) => prev + ch);
    setSpellingResult('idle');
  };

  const handleCheckSpelling = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUser = typedSpelling
      .trim()
      .replace(/^(der|die|das)\s+/i, '')
      .toLowerCase();
    const cleanTarget = currentSpellingTarget.word.trim().toLowerCase();
    if (cleanUser === cleanTarget) {
      setSpellingResult('correct');
      speakGermanText(currentSpellingTarget.word, 0.95);
    } else {
      setSpellingResult('wrong');
    }
  };

  const handleNextSpellingWord = () => {
    setSpellingQuizIdx((prev) => (prev + 1) % Math.max(1, vocabulary.length));
    setTypedSpelling('');
    setSpellingResult('idle');
  };

  const isSelectedLetterMastered = masteredLetters.includes(selectedLetter.id);

  return (
    <div className="space-y-6">
      {/* Editorial Stage Masthead */}
      <div className="flex flex-wrap items-end justify-between gap-4 pb-4 border-b border-stone-200/90">
        <div>
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <span>Fondasi Fonetik & Ortografi Jerman</span>
            <span aria-hidden="true">·</span>
            <span>37 Unit Alfabet & Digraf</span>
            <span aria-hidden="true">·</span>
            <span>Standar Ejaan DIN 5009</span>
          </div>
          <h2 className="text-2xl font-bold text-stone-950 mt-1 tracking-tight">
            Laboratorium Belajar Per Huruf & Bedah Ejaan Kata
          </h2>
        </div>

        <div className="text-xs font-mono-tabular text-stone-600">
          Huruf Dikuasai: <strong className="text-stone-950">{masteredLetters.length}</strong> /{' '}
          {GERMAN_ALPHABET_ITEMS.length}
        </div>
      </div>

      {/* SECTION 1: Interactive Alphabet & Digraph Matrix + Detailed Letter Inspector */}
      <div className="bg-white border border-stone-200/90 rounded-xl p-6 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-stone-950">
              01. Peta Interaktif Huruf, Umlaut (Ä/Ö/Ü), Eszett (ß) & Digraf
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Klik huruf untuk mendengarkan bunyi asli, mempelajari posisi bibir/lidah, dan melihat jebakan pengucapan.
            </p>
          </div>
        </div>

        {/* Category Segmented Filter */}
        <div className="flex flex-wrap items-center gap-1 p-1 bg-stone-100 rounded-lg">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedCategory(tab.id)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                selectedCategory === tab.id
                  ? 'bg-white text-stone-950 shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-950'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Grid of Letter Tiles */}
        <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 gap-2">
          {filteredLetters.map((item) => {
            const isSelected = item.id === selectedLetter.id;
            const isMastered = masteredLetters.includes(item.id);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setSelectedLetter(item);
                  handlePlayLetterName(item);
                }}
                aria-label={`Pilih huruf ${item.displayPair} (${item.letterNameDe})`}
                className={`p-2.5 rounded-lg border text-left transition-colors relative ${
                  isSelected
                    ? 'bg-blue-50/70 border-blue-700 text-stone-950'
                    : isMastered
                    ? 'bg-stone-50 border-emerald-600/40 text-stone-900 hover:bg-stone-100/80'
                    : 'bg-white border-stone-200/90 text-stone-800 hover:bg-stone-50'
                }`}
              >
                <div className="flex items-baseline justify-between gap-1">
                  <span className="text-base font-bold font-display text-stone-950">
                    {item.displayPair}
                  </span>
                  {isMastered && (
                    <span
                      className="text-[10px] font-mono-tabular text-emerald-700 font-bold"
                      title="Sudah dikuasai"
                    >
                      ✓
                    </span>
                  )}
                </div>
                <div className="text-[11px] font-mono-tabular text-blue-700 font-medium mt-0.5 truncate">
                  {item.soundIpa.split('/')[0]}
                </div>
                <div className="text-[10px] text-stone-500 truncate">
                  „{item.letterNameDe}“
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Letter Deep-Dive (Clean Hairline Split, No Nested Card Boxes) */}
        <div className="pt-6 border-t border-stone-200/80 grid grid-cols-1 md:grid-cols-12 gap-8">
          <div className="md:col-span-7 space-y-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-xs text-stone-500">
                  <span>Nama Huruf: {selectedLetter.letterNameDe}</span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono-tabular">
                    {selectedLetter.letterNameIpa}
                  </span>
                  <span aria-hidden="true">·</span>
                  <span>Kode Eja: „wie {selectedLetter.din5009Word}“</span>
                </div>
                <div className="flex items-baseline gap-3 mt-1.5">
                  <span className="text-4xl font-bold font-display text-stone-950">
                    {selectedLetter.displayPair}
                  </span>
                  <span className="text-lg font-mono-tabular font-semibold text-blue-700">
                    Bunyi: {selectedLetter.soundIpa}
                  </span>
                </div>
                <p className="text-xs text-stone-600 mt-1">
                  Pendekatan bunyi Indonesia:{' '}
                  <strong className="text-stone-950">
                    {selectedLetter.indonesianApprox}
                  </strong>
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handlePlayLetterName(selectedLetter)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-blue-700 rounded-lg hover:bg-blue-800 transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
                >
                  <Volume2 className="w-4 h-4" />
                  Bunyikan Huruf
                </button>
                <button
                  type="button"
                  onClick={() => handlePlayDinCode(selectedLetter)}
                  className="px-3 py-2 text-xs font-semibold text-stone-700 bg-stone-100 rounded-lg hover:bg-stone-200 transition-colors whitespace-nowrap shrink-0"
                >
                  Eja „wie {selectedLetter.din5009Word}“
                </button>
                <button
                  type="button"
                  onClick={() => onToggleMasteredLetter(selectedLetter.id)}
                  className={`px-3 py-2 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                    isSelectedLetterMastered
                      ? 'bg-emerald-50/70 border-emerald-600/40 text-emerald-900'
                      : 'bg-white border-stone-300 text-stone-700 hover:bg-stone-50'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {isSelectedLetterMastered
                    ? 'Sudah Dikuasai'
                    : 'Tandai Dikuasai (+10 XP)'}
                </button>
              </div>
            </div>

            {/* Clean Hairline Editorial Notes (No nested boxes) */}
            <div className="divide-y divide-stone-200/80 border-t border-stone-200/80 text-xs leading-relaxed">
              <div className="py-3">
                <span className="font-semibold text-stone-950">
                  Cara Artikulasi & Aturan Posisi Huruf:{' '}
                </span>
                <span className="text-stone-700">
                  {selectedLetter.articulationRuleId}
                </span>
              </div>

              <div className="pt-3">
                <span className="font-semibold text-amber-900">
                  Catatan Kontras Penutur Indonesia:{' '}
                </span>
                <span className="text-stone-700">
                  {selectedLetter.commonMistakeId}
                </span>
              </div>
            </div>
          </div>

          {/* Example Words Column separated by clean vertical hairline */}
          <div className="md:col-span-5 md:border-l md:border-stone-200/80 md:pl-6 space-y-3">
            <div className="text-xs font-semibold text-stone-900">
              Contoh Kata dengan Huruf „{selectedLetter.displayPair}“
            </div>
            <div className="divide-y divide-stone-200/70 border-t border-stone-200/70">
              {selectedLetter.examples.map((ex) => (
                <div
                  key={ex.word}
                  className="py-2.5 flex items-center justify-between gap-2"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-stone-950">
                      {ex.word}{' '}
                      <span className="font-mono-tabular font-normal text-stone-500">
                        {ex.ipa}
                      </span>
                    </div>
                    <div className="text-[11px] text-stone-500">
                      {ex.meaningId}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => speakGermanText(ex.word, 0.9)}
                      aria-label={`Putar kata ${ex.word}`}
                      className="p-1.5 text-stone-700 hover:text-blue-700 bg-stone-100 hover:bg-blue-50 rounded-md transition-colors"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setXrayInput(
                          ex.word.replace(/^(der|die|das)\s+/i, '')
                        );
                        setActiveSegmentIdx(0);
                      }}
                      className="px-2.5 py-1 text-[11px] font-semibold text-blue-700 bg-blue-50/80 hover:bg-blue-100 rounded-md transition-colors whitespace-nowrap shrink-0"
                    >
                      Bedah Huruf
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Interactive Word Letter-by-Letter X-Ray & DIN 5009 Spelling Simulator */}
      <div className="bg-white border border-stone-200/90 rounded-xl p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-stone-200/80">
          <div>
            <h3 className="text-base font-bold text-stone-950">
              02. Bedah Kata Per Huruf (Grapheme X-Ray) & Simulator Eja DIN 5009
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Ketik atau pilih kata bahasa Jerman untuk membedah bunyi tiap huruf, melihat huruf bisu (Dehnungs-h), dan mendengar ejaan per huruf.
            </p>
          </div>

          <button
            type="button"
            disabled={activeSpellingIdx !== null || dinSpellingList.length === 0}
            onClick={handleStepThroughSpelling}
            className="px-4 py-2 text-xs font-semibold text-white bg-stone-900 rounded-lg hover:bg-stone-800 transition-colors flex items-center gap-2 whitespace-nowrap shrink-0 disabled:opacity-50"
          >
            <Play className="w-3.5 h-3.5" />
            {activeSpellingIdx !== null
              ? 'Mengeja Huruf demi Huruf...'
              : 'Eja Kata Per Huruf (Audio)'}
          </button>
        </div>

        {/* Word Input & Quick Preset Picker */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex-1">
            <label htmlFor="xray-word-input" className="sr-only">
              Kata Jerman untuk dibedah per huruf
            </label>
            <input
              id="xray-word-input"
              type="text"
              value={xrayInput}
              onChange={(e) => {
                setXrayInput(e.target.value);
                setActiveSegmentIdx(0);
              }}
              placeholder="Ketik kata Jerman (misal: Kühlschrank, Straße, Unabhängigkeit)..."
              className="w-full px-3.5 py-2 text-sm font-semibold bg-stone-50 border border-stone-300 rounded-lg text-stone-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-700"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
            {[
              'Kühlschrank',
              'Straßenbahn',
              'Frühstück',
              'Unabhängigkeit',
              'Wörterbuch',
            ].map((preset) => (
              <button
                key={preset}
                type="button"
                onClick={() => {
                  setXrayInput(preset);
                  setActiveSegmentIdx(0);
                }}
                className={`px-2.5 py-1.5 text-xs font-medium rounded-md border transition-colors whitespace-nowrap shrink-0 ${
                  xrayInput.toLowerCase() === preset.toLowerCase()
                    ? 'bg-blue-50 border-blue-700 text-blue-950 font-semibold'
                    : 'bg-white border-stone-200 text-stone-600 hover:bg-stone-50'
                }`}
              >
                {preset}
              </button>
            ))}
          </div>
        </div>

        {/* Interactive Grapheme Tiles Row */}
        {graphemeSegments.length > 0 && (
          <div className="space-y-5">
            <div>
              <div className="text-xs font-medium text-stone-500 mb-2">
                Klik ubin huruf/digraf di bawah untuk mendengar bunyi dan melihat aturan fonetiknya di dalam kata <strong className="text-stone-900">„{xrayInput}“</strong>:
              </div>
              <div className="flex flex-wrap items-stretch gap-2">
                {graphemeSegments.map((seg, idx) => {
                  const isActive = idx === activeSegmentIdx;
                  return (
                    <button
                      key={`${seg.grapheme}-${idx}`}
                      type="button"
                      onClick={() => {
                        setActiveSegmentIdx(idx);
                        speakGermanText(seg.grapheme, 0.85);
                      }}
                      className={`px-3.5 py-2.5 rounded-lg border text-center transition-colors min-w-[68px] ${
                        isActive
                          ? 'bg-blue-700 border-blue-700 text-white'
                          : seg.isSpecialGerman
                          ? 'bg-stone-50 border-stone-300 text-stone-950 hover:bg-stone-100'
                          : 'bg-white border-stone-200 text-stone-900 hover:bg-stone-50'
                      }`}
                    >
                      <div className="text-lg font-bold font-display">
                        {seg.grapheme}
                      </div>
                      <div
                        className={`text-[11px] font-mono-tabular mt-0.5 ${
                          isActive ? 'text-blue-100' : 'text-blue-700 font-semibold'
                        }`}
                      >
                        {seg.soundIpa}
                      </div>
                      <div
                        className={`text-[10px] mt-0.5 truncate max-w-[90px] ${
                          isActive ? 'text-white/90' : 'text-stone-500'
                        }`}
                      >
                        {seg.indonesianCue}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Active Grapheme Explanation Callout (Unboxed hairline strip) */}
            {activeSegment && (
              <div className="py-3.5 border-y border-stone-200/80 flex flex-wrap items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="font-bold text-stone-950 text-sm">
                      Segmen #{activeSegmentIdx + 1}: „{activeSegment.grapheme}“
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="font-mono-tabular font-semibold text-blue-700">
                      IPA {activeSegment.soundIpa}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="text-stone-600">
                      Bunyi: <strong className="text-stone-900">{activeSegment.indonesianCue}</strong>
                    </span>
                  </div>
                  <p className="text-xs text-stone-600">
                    {activeSegment.ruleNoteId}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => speakGermanText(activeSegment.grapheme, 0.8)}
                  className="px-3 py-1.5 text-xs font-semibold text-blue-700 bg-white border border-stone-200 rounded-lg hover:bg-stone-50 transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  Ucapkan Segmen „{activeSegment.grapheme}“
                </button>
              </div>
            )}

            {/* DIN 5009 Character-by-Character Spelling Strip */}
            <div>
              <div className="text-xs font-semibold text-stone-800 mb-2">
                Ejaan Huruf demi Huruf (Buchstabieralphabet DIN 5009 — {dinSpellingList.length} Karakter):
              </div>
              <div className="flex flex-wrap items-center gap-1.5">
                {dinSpellingList.map((token, idx) => {
                  const isCurrentStep = activeSpellingIdx === idx;
                  return (
                    <button
                      key={`${token.char}-${idx}`}
                      type="button"
                      onClick={() =>
                        speakGermanText(
                          `${token.char}, wie ${token.dinWord}`,
                          0.95
                        )
                      }
                      className={`px-2.5 py-1.5 rounded-md border text-xs transition-colors flex items-center gap-1.5 ${
                        isCurrentStep
                          ? 'bg-blue-700 border-blue-700 text-white font-bold'
                          : 'bg-white border-stone-200 text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      <span className="font-bold font-mono-tabular">
                        {token.char}
                      </span>
                      <span
                        className={
                          isCurrentStep ? 'text-blue-100' : 'text-stone-400'
                        }
                        aria-hidden="true"
                      >
                        ·
                      </span>
                      <span className="text-[11px]">{token.dinWord}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Advanced German Phonological Rules Inspector (Clean Hairline Ledger) */}
            {phonologicalRules.length > 0 && (
              <div className="pt-4 border-t border-stone-200/80">
                <div className="text-xs font-semibold text-stone-800 mb-2.5">
                  Inspektur Hukum Fonologi & Koartikulasi Hochdeutsch ({phonologicalRules.length} Aturan Aktif):
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                  {phonologicalRules.map((rule, rIdx) => (
                    <div
                      key={`${rule.ruleNameDe}-${rIdx}`}
                      className="pt-2 border-t border-stone-200/60 space-y-1"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-stone-950">
                          {rule.ruleNameDe} · {rule.ruleNameId}
                        </span>
                        <span className="text-[11px] font-mono-tabular font-semibold text-blue-700 whitespace-nowrap shrink-0">
                          {rule.ipaShift}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-600 leading-relaxed">
                        {rule.explanationId}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* SECTION 3: Interactive Letter-by-Letter Dictation & Spelling Trainer */}
      <div className="bg-white border border-stone-200/90 rounded-xl p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-stone-200/80">
          <div>
            <h3 className="text-base font-bold text-stone-950">
              03. Latihan Dikte & Susun Huruf (Buchstabier-Trainer)
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Dengarkan audio kata Jerman lalu ketik ejaan per hurufnya secara tepat (gunakan tombol Ä, Ö, Ü, ß di bawah).
            </p>
          </div>

          <button
            type="button"
            onClick={handleNextSpellingWord}
            className="px-3 py-1.5 text-xs font-medium text-stone-700 bg-stone-100 rounded-lg hover:bg-stone-200 transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Ganti Kata Dikte
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          <div className="md:col-span-5 md:border-r md:border-stone-200/80 md:pr-6 space-y-2">
            <div className="text-xs text-stone-500">
              Petunjuk Arti Bahasa Indonesia (Level {currentSpellingTarget.level}):
            </div>
            <div className="text-lg font-bold text-stone-950 font-display">
              „{currentSpellingTarget.meaningId}“
            </div>
            <div className="text-xs font-mono-tabular text-stone-500">
              Jumlah karakter: {currentSpellingTarget.word.length} huruf · IPA:{' '}
              {currentSpellingTarget.ipa}
            </div>
            <button
              type="button"
              onClick={() => speakGermanText(currentSpellingTarget.word, 0.85)}
              className="mt-1 px-4 py-2 text-xs font-semibold text-white bg-blue-700 rounded-lg hover:bg-blue-800 transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <Volume2 className="w-4 h-4" />
              Dengarkan Kata Dikte
            </button>
          </div>

          <form
            onSubmit={handleCheckSpelling}
            className="md:col-span-7 space-y-3"
          >
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs text-stone-500 mr-1">
                Sisipkan Karakter Jerman:
              </span>
              {['ä', 'ö', 'ü', 'ß', 'Ä', 'Ö', 'Ü'].map((ch) => (
                <button
                  key={ch}
                  type="button"
                  onClick={() => handleAppendSpecialChar(ch)}
                  className="px-2.5 py-1 text-xs font-bold font-mono-tabular bg-stone-100 hover:bg-blue-50 text-stone-900 rounded border border-stone-200 transition-colors"
                >
                  {ch}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={typedSpelling}
                onChange={(e) => {
                  setTypedSpelling(e.target.value);
                  setSpellingResult('idle');
                }}
                placeholder={`Ketik ejaan ${currentSpellingTarget.word.length} huruf...`}
                aria-label="Ketik ejaan kata bahasa Jerman"
                className="flex-1 px-3.5 py-2 text-sm font-medium bg-stone-50 border border-stone-300 rounded-lg text-stone-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-700"
              />
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-stone-900 rounded-lg hover:bg-stone-800 transition-colors whitespace-nowrap shrink-0"
              >
                Periksa Ejaan
              </button>
            </div>

            {spellingResult === 'correct' && (
              <div
                role="status"
                className="py-2 text-xs font-semibold text-emerald-800"
              >
                Tepat! Ejaan „{currentSpellingTarget.article !== 'none' ? `${currentSpellingTarget.article} ` : ''}{currentSpellingTarget.word}“ sudah sesuai standar.
              </div>
            )}

            {spellingResult === 'wrong' && (
              <div
                role="status"
                className="py-2 text-xs text-amber-900"
              >
                Belum tepat. Ejaan yang benar per huruf adalah:{' '}
                <strong className="font-mono-tabular">
                  {Array.from(currentSpellingTarget.word).join(' - ')}
                </strong>{' '}
                ({currentSpellingTarget.word}).
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Live Sagittal Vocal Tract Diagram synced with Selected Letter */}
      <VocalTractDiagram
        mouthShape={selectedLetter.mouthShape}
        phoneticFocus={`Huruf ${selectedLetter.displayPair} · ${selectedLetter.soundIpa}`}
        ipa={selectedLetter.letterNameIpa}
        syllables={selectedLetter.examples.map((e) => e.word)}
        isPlayingAudio={isPlayingAudio}
      />
    </div>
  );
};
