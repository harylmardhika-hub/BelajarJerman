import React, { useState, useEffect } from 'react';
import { PronunciationEvaluationResult, VocabItem } from '../types';
import {
  analyzeAdvancedPhonologicalRules,
  calculatePhoneticSimilarity,
  evaluatePronunciationAttempt,
} from '../utils/germanRules';
import { speakGermanText } from '../utils/speechAudio';
import { VocalTractDiagram } from './VocalTractDiagram';
import { Volume2, Mic, Square, CheckCircle2, AlertTriangle } from 'lucide-react';

interface PronunciationStudioProps {
  vocabulary: VocabItem[];
  activeVocab: VocabItem;
  onSelectVocab: (vocab: VocabItem) => void;
  latestEvaluation: PronunciationEvaluationResult | null;
  history: PronunciationEvaluationResult[];
  onEvaluatePronunciation: (
    vocabId: string,
    spokenText: string
  ) => Promise<PronunciationEvaluationResult | null>;
}

export const PronunciationStudio: React.FC<PronunciationStudioProps> = ({
  vocabulary,
  activeVocab,
  onSelectVocab,
  latestEvaluation,
  history,
  onEvaluatePronunciation,
}) => {
  const [practiceScope, setPracticeScope] = useState<'word' | 'sentence'>(
    'word'
  );

  const fullWordTarget =
    activeVocab.article !== 'none'
      ? `${activeVocab.article} ${activeVocab.word}`
      : activeVocab.word;

  const activeTargetString =
    practiceScope === 'sentence' ? activeVocab.exampleDe : fullWordTarget;

  const [spokenInput, setSpokenInput] = useState(activeTargetString);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(0.95);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [micStatusNote, setMicStatusNote] = useState<string | null>(null);
  const [sentenceScore, setSentenceScore] = useState<number | null>(null);

  useEffect(() => {
    const nextTarget =
      practiceScope === 'sentence'
        ? activeVocab.exampleDe
        : activeVocab.article !== 'none'
        ? `${activeVocab.article} ${activeVocab.word}`
        : activeVocab.word;
    setSpokenInput(nextTarget);
    setSentenceScore(null);
    setMicStatusNote(null);
  }, [activeVocab, practiceScope]);

  const handleListenNative = (speed: number) => {
    setPlaybackSpeed(speed);
    speakGermanText(
      activeTargetString,
      speed,
      () => setIsPlayingAudio(true),
      () => setIsPlayingAudio(false)
    );
  };

  const handleToggleMicrophone = () => {
    if (isRecording) {
      setIsRecording(false);
      return;
    }

    const SpeechRecognitionApi =
      typeof window !== 'undefined'
        ? (window as unknown as Record<string, unknown>).SpeechRecognition ||
          (window as unknown as Record<string, unknown>).webkitSpeechRecognition
        : null;

    if (!SpeechRecognitionApi) {
      setMicStatusNote(
        'Pengenalan suara mikrofon langsung tidak tersedia di peramban ini. Anda dapat mengedit transkrip fonetik atau memilih preset uji artikulasi di bawah lalu klik Evaluasi Pengucapan.'
      );
      return;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const recognition = new (SpeechRecognitionApi as any)();
      recognition.lang = 'de-DE';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      setIsRecording(true);
      setMicStatusNote(
        'Mendengarkan pengucapan bahasa Jerman (de-DE)... Silakan bicara.'
      );

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      recognition.onresult = (event: any) => {
        const transcript = event.results?.[0]?.[0]?.transcript || '';
        if (transcript) {
          setSpokenInput(transcript);
          setMicStatusNote(`Suara tertangkap: "${transcript}"`);
          handleRunEvaluation(transcript);
        }
        setIsRecording(false);
      };

      recognition.onerror = () => {
        setIsRecording(false);
        setMicStatusNote(
          'Mikrofon tidak mendeteksi input atau izin ditolak. Gunakan input transkrip atau tombol simulasi artikulasi di bawah.'
        );
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
    } catch {
      setIsRecording(false);
    }
  };

  const handleRunEvaluation = async (customText?: string) => {
    const textToEvaluate = customText !== undefined ? customText : spokenInput;
    if (!textToEvaluate.trim()) return;
    if (customText !== undefined) {
      setSpokenInput(customText);
    }
    setIsEvaluating(true);
    try {
      if (practiceScope === 'sentence') {
        const sim = calculatePhoneticSimilarity(
          activeVocab.exampleDe,
          textToEvaluate
        );
        setSentenceScore(sim);
        await onEvaluatePronunciation(
          activeVocab.id,
          sim >= 85 ? fullWordTarget : textToEvaluate
        );
      } else {
        setSentenceScore(null);
        await onEvaluatePronunciation(activeVocab.id, textToEvaluate);
      }
    } finally {
      setIsEvaluating(false);
    }
  };

  // Generate realistic learner phonetic variants for instant interactive testing
  const nonUmlautVariant = activeTargetString
    .replace(/ü/g, 'u')
    .replace(/ö/g, 'o')
    .replace(/ä/g, 'a')
    .replace(/ß/g, 's');
  const clippedEndingVariant = activeTargetString.slice(
    0,
    Math.max(4, activeTargetString.length - 4)
  );

  const activeResult =
    latestEvaluation && latestEvaluation.vocabId === activeVocab.id
      ? latestEvaluation
      : history.find((h) => h.vocabId === activeVocab.id) ||
        evaluatePronunciationAttempt(activeVocab, fullWordTarget);

  const phonologicalLaws = analyzeAdvancedPhonologicalRules(activeVocab.word);
  const sentenceWords = activeVocab.exampleDe
    .replace(/[.,!?;:"„“]/g, '')
    .split(/\s+/)
    .filter(Boolean);

  return (
    <div className="space-y-6">
      {/* Header & Word Picker */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-stone-200">
        <div>
          <div className="text-xs text-stone-500">
            Laboratorium Fonetik, Prosodi Kalimat & Diagnostik Suku Kata · CEFR A1–C1
          </div>
          <h2 className="text-xl font-bold text-stone-950 mt-1">
            Studio Pengucapan & Prosodi Kalimat Interaktif
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 p-1 bg-stone-200/70 rounded-lg">
            <button
              type="button"
              onClick={() => setPracticeScope('word')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                practiceScope === 'word'
                  ? 'bg-white text-stone-950 shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-950'
              }`}
            >
              Mode Kata & Suku Kata
            </button>
            <button
              type="button"
              onClick={() => setPracticeScope('sentence')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                practiceScope === 'sentence'
                  ? 'bg-white text-stone-950 shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-950'
              }`}
            >
              Mode Kalimat Utuh (Prosodi)
            </button>
          </div>

          <select
            id="studio-vocab-select"
            aria-label="Pilih kata target pengucapan"
            value={activeVocab.id}
            onChange={(e) => {
              const found = vocabulary.find((v) => v.id === e.target.value);
              if (found) onSelectVocab(found);
            }}
            className="px-3 py-2 text-xs font-semibold bg-white border border-stone-300 rounded-lg text-stone-950 focus:outline-none focus:ring-2 focus:ring-blue-700 max-w-xs"
          >
            {vocabulary.map((v) => (
              <option key={v.id} value={v.id}>
                [{v.level}] {v.article !== 'none' ? `${v.article} ` : ''}
                {v.word} ({v.meaningId})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Target Acoustic Stage Card */}
      <div className="bg-white border border-stone-200/90 rounded-xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4 pb-5 border-b border-stone-200/80">
          <div>
            <div className="text-xs text-stone-500">
              {practiceScope === 'sentence'
                ? `Target Prosodi Kalimat · Level ${activeVocab.level} · Fokus: ${fullWordTarget}`
                : `Target Artikulasi Kata · Level ${activeVocab.level} · ${activeVocab.meaningId}`}
            </div>
            {practiceScope === 'sentence' ? (
              <div className="mt-1.5 space-y-1.5">
                <h3 className="text-xl sm:text-2xl font-bold text-stone-950 font-display leading-snug">
                  „{activeVocab.exampleDe}“
                </h3>
                <p className="text-xs text-stone-500">
                  Arti: “{activeVocab.exampleId}” · Kata kunci:{' '}
                  <strong className="font-mono-tabular text-blue-700">
                    {fullWordTarget} {activeVocab.ipa}
                  </strong>
                </p>
              </div>
            ) : (
              <div className="flex flex-wrap items-baseline gap-3 mt-1.5">
                <h3 className="text-3xl sm:text-4xl font-bold text-stone-950 font-display tracking-tight">
                  {fullWordTarget}
                </h3>
                <span className="text-lg font-mono-tabular text-blue-700 font-medium">
                  {activeVocab.ipa}
                </span>
              </div>
            )}
            <p className="text-xs text-stone-600 mt-2 max-w-2xl">
              <strong className="text-stone-900">Panduan Artikulasi:</strong>{' '}
              {activeVocab.articulationTip}
            </p>
          </div>

          {/* Playback Speed & Listen Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => handleListenNative(0.95)}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                playbackSpeed >= 0.9
                  ? 'bg-blue-700 text-white border-blue-700'
                  : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
              }`}
            >
              <Volume2 className="w-4 h-4" />
              Putar Normal (1.0x)
            </button>
            <button
              type="button"
              onClick={() => handleListenNative(0.7)}
              className={`px-3.5 py-2 text-xs font-semibold rounded-lg border transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
                playbackSpeed < 0.9
                  ? 'bg-blue-700 text-white border-blue-700'
                  : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
              }`}
            >
              <Volume2 className="w-4 h-4" />
              Putar Lambat (0.7x)
            </button>
          </div>
        </div>

        {/* Word-by-Word Prosody Strip when in Sentence Mode */}
        {practiceScope === 'sentence' && (
          <div className="py-3 border-b border-stone-200/80 space-y-2">
            <div className="text-xs font-semibold text-stone-700">
              Latihan Intonasi Per Kata dalam Kalimat (Klik kata untuk mendengar irama):
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {sentenceWords.map((w, idx) => {
                const isFocusWord = w
                  .toLowerCase()
                  .includes(activeVocab.word.toLowerCase().slice(0, 5));
                return (
                  <button
                    key={`${w}-${idx}`}
                    type="button"
                    onClick={() => speakGermanText(w, 0.88)}
                    className={`px-2.5 py-1 rounded-md border text-xs font-medium transition-colors ${
                      isFocusWord
                        ? 'bg-blue-50 border-blue-300 text-blue-950 font-bold'
                        : 'bg-white border-stone-200 text-stone-800 hover:bg-stone-100'
                    }`}
                  >
                    {w}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Interactive Recording & Transcript Evaluation Form */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label
              htmlFor="pronunciation-transcript-input"
              className="text-xs font-semibold text-stone-800"
            >
              Rekam Suara (Mikrofon de-DE) atau Uji Transkrip Pengucapan Anda
            </label>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[11px] text-stone-500">Simulasi Cepat:</span>
              <button
                type="button"
                onClick={() => handleRunEvaluation(activeTargetString)}
                className="px-2.5 py-1 text-[11px] font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded transition-colors whitespace-nowrap shrink-0"
              >
                Uji Fasih (100%)
              </button>
              <button
                type="button"
                onClick={() => handleRunEvaluation(nonUmlautVariant)}
                className="px-2.5 py-1 text-[11px] font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded transition-colors whitespace-nowrap shrink-0"
              >
                Uji Logat Tanpa Umlaut
              </button>
              <button
                type="button"
                onClick={() => handleRunEvaluation(clippedEndingVariant)}
                className="px-2.5 py-1 text-[11px] font-medium text-stone-700 bg-stone-100 hover:bg-stone-200 rounded transition-colors whitespace-nowrap shrink-0"
              >
                Uji Kurang Konsonan Akhir
              </button>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              type="button"
              onClick={handleToggleMicrophone}
              className={`px-4 py-2.5 text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 whitespace-nowrap shrink-0 ${
                isRecording
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-stone-950 text-white hover:bg-stone-800'
              }`}
            >
              {isRecording ? (
                <>
                  <Square className="w-3.5 h-3.5" />
                  Hentikan Rekaman
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4" />
                  Rekam Mikrofon
                </>
              )}
            </button>

            <input
              id="pronunciation-transcript-input"
              type="text"
              value={spokenInput}
              onChange={(e) => setSpokenInput(e.target.value)}
              placeholder={`Ucapkan atau ketik "${activeTargetString}"...`}
              aria-label="Transkrip pengucapan bahasa Jerman"
              className="flex-1 px-3.5 py-2 text-sm font-medium bg-stone-50 border border-stone-300 rounded-lg text-stone-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-700"
            />

            <button
              type="button"
              disabled={isEvaluating}
              onClick={() => handleRunEvaluation()}
              className="px-4 py-2.5 text-xs font-semibold text-white bg-blue-700 rounded-lg hover:bg-blue-800 transition-colors whitespace-nowrap shrink-0 disabled:opacity-50"
            >
              {isEvaluating ? 'Menganalisis...' : 'Evaluasi Pengucapan'}
            </button>
          </div>

          {micStatusNote && (
            <p className="text-xs text-stone-600 border-l-2 border-stone-400 pl-3 py-1">
              {micStatusNote}
            </p>
          )}
        </div>

        {/* Evaluation Diagnostic Results */}
        {activeResult && (
          <div className="pt-5 border-t border-stone-200/80 space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-xs text-stone-500">
                  Hasil Analisis Fonetik · Input: „
                  {practiceScope === 'sentence'
                    ? spokenInput
                    : activeResult.spokenText}
                  “
                </div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-2xl font-bold font-mono-tabular text-stone-950">
                    Akurasi:{' '}
                    {sentenceScore !== null
                      ? sentenceScore
                      : activeResult.overallScore}
                    %
                  </span>
                  <span
                    className={`text-xs font-mono-tabular font-semibold flex items-center gap-1 ${
                      (sentenceScore ?? activeResult.overallScore) >= 85
                        ? 'text-emerald-700'
                        : (sentenceScore ?? activeResult.overallScore) >= 65
                        ? 'text-amber-700'
                        : 'text-red-700'
                    }`}
                  >
                    {(sentenceScore ?? activeResult.overallScore) >= 85 ? (
                      <CheckCircle2 className="w-4 h-4" />
                    ) : (
                      <AlertTriangle className="w-4 h-4" />
                    )}
                    {activeResult.statusLabel}
                  </span>
                </div>
              </div>

              <div className="text-xs text-stone-500 font-mono-tabular">
                Target: {activeResult.targetText}
              </div>
            </div>

            <p className="text-sm text-stone-800 leading-relaxed">
              {activeResult.feedbackSummaryId}
            </p>

            {/* Syllable-by-Syllable Breakdown Ledger (Hairline Grid — No Nested Cards) */}
            <div>
              <div className="text-xs font-semibold text-stone-800 mb-2">
                Diagnostik Ketepatan per Suku Kata ({activeVocab.word})
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-stone-200/80 border border-stone-200/90 rounded-lg overflow-hidden">
                {activeResult.syllableBreakdown.map((syl, index) => (
                  <div
                    key={`${syl.syllable}-${index}`}
                    className="p-3.5 bg-white"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold font-mono-tabular text-stone-950">
                        {syl.syllable}
                      </span>
                      <span
                        className={`text-xs font-mono-tabular font-semibold ${
                          syl.status === 'tepat'
                            ? 'text-emerald-700'
                            : syl.status === 'hampir'
                            ? 'text-amber-700'
                            : 'text-red-700'
                        }`}
                      >
                        {syl.score}%
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-stone-200 rounded-full overflow-hidden mt-2">
                      <div
                        className={`h-full ${
                          syl.status === 'tepat'
                            ? 'bg-emerald-600'
                            : syl.status === 'hampir'
                            ? 'bg-amber-600'
                            : 'bg-red-600'
                        }`}
                        style={{ width: `${syl.score}%` }}
                      />
                    </div>
                    <p className="text-[11px] text-stone-600 mt-1.5">
                      {syl.phoneticNote}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Phonological Laws for Target Word (Hairline List) */}
            {phonologicalLaws.length > 0 && (
              <div className="pt-2 border-t border-stone-200/80">
                <div className="text-xs font-semibold text-stone-800 mb-2">
                  Hukum Fonologi Jerman pada Kata „{activeVocab.word}“
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {phonologicalLaws.map((law, idx) => (
                    <div
                      key={`${law.ruleNameDe}-${idx}`}
                      className="text-xs border-l-2 border-blue-700 pl-3 py-0.5"
                    >
                      <div className="flex items-center justify-between font-semibold text-stone-950">
                        <span>{law.ruleNameDe}</span>
                        <span className="font-mono-tabular text-blue-700">
                          {law.ipaShift}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-600 mt-0.5">
                        {law.explanationId}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Actionable Phonetic Coaching Tips */}
            <div className="pt-2 border-t border-stone-200/80">
              <div className="text-xs font-semibold text-stone-800 mb-1.5">
                Saran Artikulasi Spesifik
              </div>
              <ul className="space-y-1.5 text-xs text-stone-700">
                {activeResult.phoneticCoachingTips.map((tip, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="font-mono-tabular text-blue-700 font-bold">
                      0{idx + 1}.
                    </span>
                    <span>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>

      {/* Interactive Sagittal Vocal Tract & Biomechanics Diagram */}
      <VocalTractDiagram
        mouthShape={activeVocab.mouthShape}
        phoneticFocus={activeVocab.phoneticFocus}
        ipa={activeVocab.ipa}
        syllables={activeVocab.syllables}
        isPlayingAudio={isPlayingAudio}
      />
    </div>
  );
};
