import React, { useState } from 'react';
import { GermanArticle, VocabItem } from '../types';
import {
  buildContextualCaseQuestion,
  generateCaseDeclensionTable,
  getArticleMorphologyRule,
} from '../utils/germanRules';
import { speakGermanText } from '../utils/speechAudio';
import { Volume2, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';

interface ArticleQuizStageProps {
  vocabulary: VocabItem[];
  articleQuizCorrect: number;
  articleQuizTotal: number;
  onSubmitQuizAnswer: (
    vocabId: string,
    selectedArticle: GermanArticle
  ) => Promise<void>;
}

export const ArticleQuizStage: React.FC<ArticleQuizStageProps> = ({
  vocabulary,
  articleQuizCorrect,
  articleQuizTotal,
  onSubmitQuizAnswer,
}) => {
  const nounVocabulary = vocabulary.filter((v) => v.article !== 'none');
  const [quizMode, setQuizMode] = useState<'nominativ' | 'kasus_konteks'>(
    'nominativ'
  );
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentQuestion =
    nounVocabulary[questionIndex % Math.max(1, nounVocabulary.length)] ||
    vocabulary[0];

  const contextualChallenge = buildContextualCaseQuestion(
    currentQuestion,
    questionIndex
  );
  const declensionTable = generateCaseDeclensionTable(
    currentQuestion.word,
    currentQuestion.article,
    currentQuestion.plural
  );

  const targetCorrectOption =
    quizMode === 'nominativ'
      ? currentQuestion.article
      : contextualChallenge.correctArticleForm;

  const handleChooseOption = async (chosen: string) => {
    if (selectedOption || isSubmitting || !currentQuestion) return;
    setIsSubmitting(true);
    setSelectedOption(chosen);
    try {
      const mappedForBackend: GermanArticle =
        chosen === targetCorrectOption
          ? currentQuestion.article
          : currentQuestion.article === 'der'
          ? 'die'
          : 'der';

      await onSubmitQuizAnswer(currentQuestion.id, mappedForBackend);
      if (quizMode === 'nominativ') {
        speakGermanText(
          `${currentQuestion.article} ${currentQuestion.word}`,
          0.95
        );
      } else {
        speakGermanText(
          `${contextualChallenge.sentenceBefore} ${contextualChallenge.correctArticleForm} ${contextualChallenge.sentenceAfter}`,
          0.92
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNextQuestion = () => {
    setSelectedOption(null);
    setQuestionIndex((prev) => (prev + 1) % Math.max(1, nounVocabulary.length));
  };

  const accuracyPct =
    articleQuizTotal > 0
      ? Math.round((articleQuizCorrect / articleQuizTotal) * 100)
      : 100;

  const isCorrect =
    selectedOption !== null && selectedOption === targetCorrectOption;

  const morphologyExplanation = getArticleMorphologyRule(
    currentQuestion.word,
    currentQuestion.article
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-stone-200">
        <div>
          <div className="text-xs text-stone-500">
            Laboratorium Tata Bahasa Jerman · Genus Nomina & Deklinasi 4 Kasus (Nominativ · Akkusativ · Dativ · Genitiv)
          </div>
          <h2 className="text-xl font-bold text-stone-950 mt-1">
            Kuis Artikel & Deklinasi Kasus Kontekstual
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 p-1 bg-stone-200/70 rounded-lg">
            <button
              type="button"
              onClick={() => {
                setQuizMode('nominativ');
                setSelectedOption(null);
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                quizMode === 'nominativ'
                  ? 'bg-white text-stone-950 shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-950'
              }`}
            >
              Mode 1: Genus Dasar (der/die/das)
            </button>
            <button
              type="button"
              onClick={() => {
                setQuizMode('kasus_konteks');
                setSelectedOption(null);
              }}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                quizMode === 'kasus_konteks'
                  ? 'bg-white text-stone-950 shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-950'
              }`}
            >
              Mode 2: Deklinasi 4 Kasus (Nom/Akk/Dat/Gen)
            </button>
          </div>

          <div className="text-xs font-mono-tabular text-stone-700">
            Skor Benar: <strong>{articleQuizCorrect}</strong> /{' '}
            {articleQuizTotal} ({accuracyPct}%)
          </div>
        </div>
      </div>

      <div className="bg-white border border-stone-200/90 rounded-xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500 pb-4 border-b border-stone-200/80">
          <span>
            Soal {(questionIndex % nounVocabulary.length) + 1} dari{' '}
            {nounVocabulary.length} · Level {currentQuestion.level} ·{' '}
            {quizMode === 'nominativ'
              ? 'Kasus Nominativ Tunggal'
              : `Kasus ${contextualChallenge.targetCase} (${contextualChallenge.triggerPrepositionOrVerb})`}
          </span>
          <button
            type="button"
            onClick={() => speakGermanText(currentQuestion.word, 0.92)}
            className="text-blue-700 font-semibold flex items-center gap-1 hover:text-blue-800 whitespace-nowrap shrink-0"
          >
            <Volume2 className="w-4 h-4" />
            Dengarkan Nomina
          </button>
        </div>

        {quizMode === 'nominativ' ? (
          <div className="py-2">
            <div className="text-xs font-medium text-stone-500">
              Pilih Artikel Nominativ Tunggal yang Tepat
            </div>
            <div className="mt-2 flex flex-wrap items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-mono-tabular font-bold text-blue-700 border-b-2 border-blue-700 px-2">
                {selectedOption ? currentQuestion.article : '___'}
              </span>
              <h3 className="text-3xl sm:text-4xl font-bold text-stone-950 font-display tracking-tight">
                {currentQuestion.word}
              </h3>
              <span className="text-base font-mono-tabular text-stone-500">
                {currentQuestion.ipa}
              </span>
            </div>
            <p className="text-sm text-stone-600 mt-3">
              Arti Bahasa Indonesia:{' '}
              <strong className="text-stone-950">
                {currentQuestion.meaningId}
              </strong>{' '}
              · Jamak: {currentQuestion.plural}
            </p>
          </div>
        ) : (
          <div className="py-2 space-y-2.5">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="font-semibold text-blue-700">
                Target Kasus: {contextualChallenge.targetCase}
              </span>
              <span aria-hidden="true">·</span>
              <span className="text-stone-600">
                Pemicu: {contextualChallenge.triggerPrepositionOrVerb}
              </span>
              <span aria-hidden="true">·</span>
              <span className="text-stone-500">
                Genus dasar:{' '}
                <strong className="text-stone-900">
                  {currentQuestion.article} {currentQuestion.word}
                </strong>{' '}
                ({currentQuestion.meaningId})
              </span>
            </div>

            <div className="text-xl sm:text-2xl font-bold text-stone-950 font-display leading-relaxed pt-1">
              „{contextualChallenge.sentenceBefore}{' '}
              <span className="border-b-2 border-blue-700 px-2 font-mono-tabular text-blue-700">
                {selectedOption ? targetCorrectOption : '___'}
              </span>{' '}
              {contextualChallenge.sentenceAfter}“
            </div>

            <p className="text-xs text-stone-600">
              Terjemahan: “{contextualChallenge.translationId}”
            </p>
          </div>
        )}

        {/* Choice Buttons */}
        {quizMode === 'nominativ' ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {(['der', 'die', 'das'] as GermanArticle[]).map((art) => {
              const isChosen = selectedOption === art;
              const isRightOption = currentQuestion.article === art;

              let btnStyle =
                'bg-stone-50 border-stone-200 text-stone-950 hover:bg-stone-100';
              if (selectedOption !== null) {
                if (isRightOption) {
                  btnStyle =
                    'bg-emerald-50 border-emerald-600 text-emerald-950 font-bold';
                } else if (isChosen && !isRightOption) {
                  btnStyle = 'bg-red-50 border-red-500 text-red-900';
                } else {
                  btnStyle = 'bg-stone-50 border-stone-200 text-stone-400';
                }
              }

              const genderLabel =
                art === 'der'
                  ? 'Maskulin'
                  : art === 'die'
                  ? 'Feminin'
                  : 'Neutrum';

              return (
                <button
                  key={art}
                  type="button"
                  disabled={selectedOption !== null}
                  onClick={() => handleChooseOption(art)}
                  className={`p-4 rounded-xl border text-left transition-colors flex items-center justify-between ${btnStyle}`}
                >
                  <div>
                    <div className="text-xl font-bold font-display">{art}</div>
                    <div className="text-xs text-stone-500 mt-0.5">
                      {genderLabel}
                    </div>
                  </div>
                  {selectedOption !== null && isRightOption && (
                    <span className="text-xs font-mono-tabular text-emerald-700 font-semibold">
                      Tepat
                    </span>
                  )}
                  {selectedOption !== null && isChosen && !isRightOption && (
                    <span className="text-xs font-mono-tabular text-red-700 font-semibold">
                      Kurang Tepat
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {contextualChallenge.options.map((opt) => {
              const isChosen = selectedOption === opt;
              const isRightOption = targetCorrectOption === opt;

              let btnStyle =
                'bg-stone-50 border-stone-200 text-stone-950 hover:bg-stone-100';
              if (selectedOption !== null) {
                if (isRightOption) {
                  btnStyle =
                    'bg-emerald-50 border-emerald-600 text-emerald-950 font-bold';
                } else if (isChosen && !isRightOption) {
                  btnStyle = 'bg-red-50 border-red-500 text-red-900';
                } else {
                  btnStyle = 'bg-stone-50 border-stone-200 text-stone-400';
                }
              }

              return (
                <button
                  key={opt}
                  type="button"
                  disabled={selectedOption !== null}
                  onClick={() => handleChooseOption(opt)}
                  className={`p-3.5 rounded-xl border text-left transition-colors flex items-center justify-between ${btnStyle}`}
                >
                  <div>
                    <div className="text-lg font-bold font-display">{opt}</div>
                    <div className="text-[11px] text-stone-500 mt-0.5">
                      Artikel Kasus
                    </div>
                  </div>
                  {selectedOption !== null && isRightOption && (
                    <span className="text-xs font-mono-tabular text-emerald-700 font-semibold">
                      Tepat
                    </span>
                  )}
                  {selectedOption !== null && isChosen && !isRightOption && (
                    <span className="text-xs font-mono-tabular text-red-700 font-semibold">
                      Kurang Tepat
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* Morphological & Declension Feedback Section */}
        {selectedOption !== null && (
          <div
            role="status"
            className="pt-5 border-t border-stone-200/80 space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-bold text-stone-950">
                {isCorrect ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    <span>
                      Benar! Jawaban tepat adalah „{targetCorrectOption}“ (+10 XP)
                    </span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-amber-700 shrink-0" />
                    <span>
                      Jawaban yang tepat adalah „{targetCorrectOption}“
                    </span>
                  </>
                )}
              </div>

              <button
                type="button"
                onClick={handleNextQuestion}
                className="px-4 py-2 text-xs font-semibold text-white bg-stone-950 rounded-lg hover:bg-stone-800 transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
              >
                Soal Berikutnya
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <p className="text-xs text-stone-700 leading-relaxed">
              <strong className="text-stone-950">Penjelasan Tata Bahasa:</strong>{' '}
              {quizMode === 'nominativ'
                ? morphologyExplanation
                : contextualChallenge.explanationId}
            </p>

            {/* Full 4-Case Reference Strip (Hairline Divided) */}
            {declensionTable.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-stone-200/80 border border-stone-200/90 rounded-lg overflow-hidden">
                {declensionTable.map((row) => (
                  <div key={row.kasus} className="p-2.5 bg-stone-50/60 text-xs">
                    <div className="font-semibold text-stone-500 text-[11px]">
                      {row.kasus}
                    </div>
                    <div className="font-bold text-stone-950 font-mono-tabular mt-0.5">
                      {row.singularForm}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
