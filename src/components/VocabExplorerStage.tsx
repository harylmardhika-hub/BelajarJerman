import React, { useState } from 'react';
import {
  CefrLevel,
  PronunciationEvaluationResult,
  VocabCategory,
  VocabItem,
} from '../types';
import {
  buildDailyPronunciationChartData,
  conjugateGermanVerb,
  generateCaseDeclensionTable,
} from '../utils/germanRules';
import { speakGermanText } from '../utils/speechAudio';
import { Volume2, Mic, Search } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';

interface VocabExplorerStageProps {
  vocabulary: VocabItem[];
  pronunciationHistory: PronunciationEvaluationResult[];
  onSelectForPractice: (
    vocab: VocabItem,
    targetTab: 'daily' | 'pronunciation'
  ) => void;
  onWordAdded?: (newVocab: VocabItem, updatedTotalXp: number) => void;
}

export const VocabExplorerStage: React.FC<VocabExplorerStageProps> = ({
  vocabulary,
  pronunciationHistory,
  onSelectForPractice,
  onWordAdded,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<'ALL' | CefrLevel>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | VocabCategory>(
    'ALL'
  );
  const [chartMetric, setChartMetric] = useState<'avgScore' | 'bestScore'>(
    'avgScore'
  );
  const [lookupWordInput, setLookupWordInput] = useState('');
  const [lookupMeaningInput, setLookupMeaningInput] = useState('');
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [lookupBanner, setLookupBanner] = useState<string | null>(null);
  const [expandedGrammarVocabId, setExpandedGrammarVocabId] = useState<
    string | null
  >(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(60);

  const dailyChartData = buildDailyPronunciationChartData(pronunciationHistory);

  const overallWeekAvg = Math.round(
    dailyChartData.reduce((acc, d) => acc + d.avgScore, 0) /
      Math.max(1, dailyChartData.length)
  );
  const overallWeekBest = Math.max(...dailyChartData.map((d) => d.bestScore));
  const totalWeekAttempts = dailyChartData.reduce(
    (acc, d) => acc + d.attemptsCount,
    0
  );
  const firstDayScore = dailyChartData[0]?.avgScore || 72;
  const latestDayScore =
    dailyChartData[dailyChartData.length - 1]?.avgScore || 94;
  const deltaPoints = latestDayScore - firstDayScore;

  const filteredList = vocabulary.filter((item) => {
    const matchesLevel = levelFilter === 'ALL' || item.level === levelFilter;
    const matchesCategory =
      categoryFilter === 'ALL' || item.category === categoryFilter;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      item.word.toLowerCase().includes(q) ||
      item.meaningId.toLowerCase().includes(q) ||
      item.exampleDe.toLowerCase().includes(q);
    return matchesLevel && matchesCategory && matchesSearch;
  });

  const totalPages = Math.max(1, Math.ceil(filteredList.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const paginatedList = filteredList.slice(
    (safePage - 1) * pageSize,
    safePage * pageSize
  );

  const handleLookupAnyWord = async (
    wordToAnalyze: string,
    customMeaning?: string
  ) => {
    const clean = wordToAnalyze.trim();
    if (!clean || clean.length < 2 || isLookingUp) return;
    setIsLookingUp(true);
    setLookupBanner(null);
    try {
      const res = await fetch('/api/vocabulary/lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: clean,
          meaningId: customMeaning || lookupMeaningInput,
        }),
      });
      const data = await res.json();
      if (res.ok && data.vocab) {
        if (!data.alreadyExisted && onWordAdded) {
          onWordAdded(data.vocab, data.stats?.totalXp || 0);
        }
        setExpandedGrammarVocabId(data.vocab.id);
        setLookupBanner(
          data.alreadyExisted
            ? `Kata „${
                data.vocab.article !== 'none' ? `${data.vocab.article} ` : ''
              }${data.vocab.word}“ (${data.vocab.ipa}) sudah ada di dek Anda.`
            : `Berhasil dianalisis [${data.vocab.level}]: „${
                data.vocab.article !== 'none' ? `${data.vocab.article} ` : ''
              }${data.vocab.word}“ (${data.vocab.ipa}) telah ditambahkan ke Kamus & SRS (+15 XP).`
        );
        setLookupWordInput('');
        setLookupMeaningInput('');
      }
    } finally {
      setIsLookingUp(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-stone-200">
        <div>
          <div className="text-xs text-stone-500">
            Analitik Perkembangan Artikulasi · Indeks Kosakata CEFR A1–C1, Deklinasi Kasus & Status SRS
          </div>
          <h2 className="text-xl font-bold text-stone-950 mt-1">
            Kamus Lengkap (A1–C1) & Progres Pengucapan Harian
          </h2>
        </div>

        <div className="text-xs font-mono-tabular text-stone-600">
          Menampilkan <strong>{filteredList.length}</strong> dari{' '}
          {vocabulary.length} kata
        </div>
      </div>

      {/* Recharts Daily Pronunciation Score BarChart Card */}
      <section
        aria-label="Grafik Perkembangan Skor Pengucapan Harian"
        className="bg-white border border-stone-200/90 rounded-xl p-6 space-y-5"
      >
        <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-stone-200/80">
          <div>
            <div className="flex items-center gap-2 text-xs text-stone-500">
              <span>Tren Akurasi Fonetik 7 Hari Terakhir</span>
              <span aria-hidden="true">·</span>
              <span className="font-mono-tabular text-emerald-700 font-semibold">
                {deltaPoints >= 0
                  ? `+${deltaPoints}% Peningkatan`
                  : `${deltaPoints}% Perubahan`}{' '}
                dalam 7 Hari
              </span>
            </div>
            <h3 className="text-base font-bold text-stone-950 mt-0.5">
              Perkembangan Skor Pengucapan Harian
            </h3>
          </div>

          {/* Interactive Chart Metric Toggle */}
          <div className="flex items-center gap-1 p-1 bg-stone-200/70 rounded-lg">
            <button
              type="button"
              onClick={() => setChartMetric('avgScore')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                chartMetric === 'avgScore'
                  ? 'bg-white text-stone-950 shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-950'
              }`}
            >
              Rata-rata Harian
            </button>
            <button
              type="button"
              onClick={() => setChartMetric('bestScore')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                chartMetric === 'bestScore'
                  ? 'bg-white text-stone-950 shadow-xs font-semibold'
                  : 'text-stone-600 hover:text-stone-950'
              }`}
            >
              Skor Terbaik
            </button>
          </div>
        </div>

        {/* Summary KPI Ledger (Hairline Divided — No Nested Sub-Cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-stone-200/80 border-b border-stone-200/80 pb-5">
          <div className="pb-3 sm:pb-0 sm:pr-5">
            <div className="text-xs text-stone-500">
              Rata-rata Akurasi 7 Hari
            </div>
            <div className="text-2xl font-bold font-mono-tabular text-stone-950 mt-0.5">
              {overallWeekAvg}%
            </div>
            <div className="text-[11px] text-stone-500 mt-0.5">
              Ambang kefasihan nominal: 85%
            </div>
          </div>

          <div className="py-3 sm:py-0 sm:px-5">
            <div className="text-xs text-stone-500">
              Skor Pengucapan Tertinggi
            </div>
            <div className="text-2xl font-bold font-mono-tabular text-emerald-700 mt-0.5">
              {overallWeekBest}%
            </div>
            <div className="text-[11px] text-stone-500 mt-0.5">
              Standar kefasihan Hochdeutsch
            </div>
          </div>

          <div className="pt-3 sm:pt-0 sm:pl-5">
            <div className="text-xs text-stone-500">
              Total Evaluasi Suara (7 Hari)
            </div>
            <div className="text-2xl font-bold font-mono-tabular text-stone-950 mt-0.5">
              {totalWeekAttempts} Sesi
            </div>
            <div className="text-[11px] text-stone-500 mt-0.5">
              Termasuk latihan hari ini ({dailyChartData[6]?.attemptsCount || 1}x)
            </div>
          </div>
        </div>

        {/* Recharts BarChart Container */}
        <div
          data-testid="pronunciation-progress-chart"
          className="w-full h-72 pt-2"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={dailyChartData}
              margin={{ top: 12, right: 16, left: -12, bottom: 4 }}
            >
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="#E7E5E4"
              />
              <XAxis
                dataKey="dayLabel"
                tick={{ fill: '#57534E', fontSize: 11 }}
                axisLine={{ stroke: '#D6D3D1' }}
                tickLine={false}
              />
              <YAxis
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 85, 100]}
                tickFormatter={(val) => `${val}%`}
                tick={{ fill: '#78716C', fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                cursor={{ fill: 'rgba(231, 229, 228, 0.45)' }}
                content={({ active, payload, label }) => {
                  if (!active || !payload || payload.length === 0) return null;
                  const row = payload[0].payload;
                  const val =
                    chartMetric === 'avgScore' ? row.avgScore : row.bestScore;
                  return (
                    <div className="bg-white border border-stone-200 rounded-lg p-3 shadow-md text-xs space-y-1">
                      <div className="font-bold text-stone-950">{label}</div>
                      <div className="font-mono-tabular text-blue-700 font-semibold">
                        {chartMetric === 'avgScore'
                          ? `Rata-rata Skor: ${val}%`
                          : `Skor Terbaik: ${val}%`}
                      </div>
                      <div className="text-stone-600">
                        Frekuensi Latihan: {row.attemptsCount} sesi
                      </div>
                      <div className="text-stone-500">
                        Fokus Kata: „{row.sampleWord}“
                      </div>
                    </div>
                  );
                }}
              />
              <ReferenceLine
                y={85}
                stroke="#059669"
                strokeDasharray="4 4"
                label={{
                  value: 'Target Fasih 85%',
                  position: 'insideTopRight',
                  fill: '#047857',
                  fontSize: 11,
                }}
              />
              <Bar
                dataKey={chartMetric}
                name={
                  chartMetric === 'avgScore'
                    ? 'Rata-rata Skor (%)'
                    : 'Skor Terbaik (%)'
                }
                radius={[4, 4, 0, 0]}
                maxBarSize={44}
              >
                {dailyChartData.map((entry) => {
                  const scoreVal =
                    chartMetric === 'avgScore'
                      ? entry.avgScore
                      : entry.bestScore;
                  const fill =
                    scoreVal >= 85
                      ? '#1D4ED8'
                      : scoreVal >= 75
                      ? '#3B82F6'
                      : '#B45309';
                  return <Cell key={entry.dateKey} fill={fill} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500 pt-2 border-t border-stone-200/80">
          <span>
            Biru Prusia (&ge;85%): Tingkat kefasihan nominal · Biru Kobalt (75–84%): Transisi baik · Amber (&lt;75%): Perlu pengulangan artikulasi
          </span>
          <span className="font-mono-tabular">
            Data tersinkronisasi otomatis dengan Studio Pengucapan
          </span>
        </div>
      </section>

      {/* Interactive Filter Controls & Universal Word Analyzer */}
      <div className="bg-white border border-stone-200/90 rounded-xl p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <div className="md:col-span-3 relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              placeholder={`Cari dari ${vocabulary.length} kata...`}
              aria-label="Cari kata Jerman atau arti Indonesia"
              className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-lg text-stone-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-700"
            />
          </div>

          {/* Segmented Level Filter (A1-C1) with Live Counts */}
          <div className="md:col-span-6 flex flex-wrap sm:flex-nowrap items-center gap-0.5 p-1 bg-stone-200/70 rounded-lg">
            {(['ALL', 'A1', 'A2', 'B1', 'B2', 'C1'] as const).map((lvl) => {
              const count =
                lvl === 'ALL'
                  ? vocabulary.length
                  : vocabulary.filter((v) => v.level === lvl).length;
              return (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => {
                    setLevelFilter(lvl);
                    setCurrentPage(1);
                  }}
                  className={`flex-1 px-1.5 py-1.5 text-[11px] font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    levelFilter === lvl
                      ? 'bg-white text-stone-950 shadow-xs font-semibold'
                      : 'text-stone-600 hover:text-stone-950'
                  }`}
                >
                  {lvl === 'ALL' ? `Semua (${count})` : `${lvl} (${count})`}
                </button>
              );
            })}
          </div>

          {/* Category Dropdown */}
          <div className="md:col-span-3">
            <select
              aria-label="Filter berdasarkan kategori"
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value as 'ALL' | VocabCategory);
                setCurrentPage(1);
              }}
              className="w-full px-3 py-2 text-xs font-medium bg-stone-50 border border-stone-200 rounded-lg text-stone-800 focus:outline-none focus:ring-2 focus:ring-blue-700"
            >
              <option value="ALL">Semua Kategori ({vocabulary.length} Kata)</option>
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
          </div>
        </div>

        {/* Universal Word Generator (Semua Kata Bahasa Jerman A1–C1) */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleLookupAnyWord(lookupWordInput);
          }}
          className="pt-3 border-t border-stone-200/80 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5"
        >
          <span className="text-xs font-semibold text-stone-800 whitespace-nowrap">
            Generator Semua Kata Jerman (A1–C1):
          </span>
          <input
            type="text"
            value={lookupWordInput}
            onChange={(e) => setLookupWordInput(e.target.value)}
            placeholder="Ketik kata Jerman apa saja (misal: Schmetterling, Geschwindigkeit)..."
            aria-label="Ketik kata Jerman apa saja untuk dianalisis otomatis"
            className="flex-1 px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg text-stone-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-700"
          />
          <input
            type="text"
            value={lookupMeaningInput}
            onChange={(e) => setLookupMeaningInput(e.target.value)}
            placeholder="Arti Indonesia (opsional)..."
            aria-label="Arti Indonesia opsional"
            className="sm:w-48 px-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg text-stone-950 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-700"
          />
          <button
            type="submit"
            disabled={isLookingUp || lookupWordInput.trim().length < 2}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-stone-950 rounded-lg hover:bg-stone-800 transition-colors whitespace-nowrap shrink-0 disabled:opacity-50"
          >
            {isLookingUp ? 'Menganalisis...' : 'Analisis & Tambah Otomatis'}
          </button>
        </form>

        {lookupBanner && (
          <div
            role="status"
            className="px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200 text-xs font-medium text-emerald-800"
          >
            {lookupBanner}
          </div>
        )}
      </div>

      {/* Vocabulary Table with Expandable 4-Case / Conjugation Inspector */}
      <div className="bg-white border border-stone-200/90 rounded-xl overflow-hidden">
        {filteredList.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <div className="text-sm font-semibold text-stone-900">
              Tidak ada kosakata yang cocok dengan filter pencarian.
            </div>
            <p className="text-xs text-stone-500">
              Gunakan fitur <strong>Generator Semua Kata Jerman</strong> di atas untuk menganalisis dan menambahkan kata tersebut secara instan.
            </p>
          </div>
        ) : (
          <div>
            {/* Top Pagination & Count Bar */}
            <div className="px-4 py-3 border-b border-stone-200/80 bg-stone-50/70 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-600">
              <div className="font-mono-tabular">
                Menampilkan baris{' '}
                <strong className="text-stone-950">
                  {(safePage - 1) * pageSize + 1}–
                  {Math.min(safePage * pageSize, filteredList.length)}
                </strong>{' '}
                dari{' '}
                <strong className="text-stone-950">
                  {filteredList.length}
                </strong>{' '}
                kata
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  aria-label="Jumlah kata per halaman"
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="px-2.5 py-1 text-xs bg-white border border-stone-300 rounded text-stone-800"
                >
                  <option value={60}>60 Kata / Halaman</option>
                  <option value={120}>120 Kata / Halaman</option>
                  <option value={1000}>Tampilkan Semua ({filteredList.length})</option>
                </select>
                {totalPages > 1 && (
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      disabled={safePage <= 1}
                      onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                      className="px-2.5 py-1 text-xs font-medium bg-white border border-stone-300 rounded hover:bg-stone-100 disabled:opacity-40"
                    >
                      Sebelumnya
                    </button>
                    <span className="font-mono-tabular px-1">
                      Hal. {safePage} / {totalPages}
                    </span>
                    <button
                      type="button"
                      disabled={safePage >= totalPages}
                      onClick={() =>
                        setCurrentPage((p) => Math.min(totalPages, p + 1))
                      }
                      className="px-2.5 py-1 text-xs font-medium bg-white border border-stone-300 rounded hover:bg-stone-100 disabled:opacity-40"
                    >
                      Berikutnya
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-stone-200 bg-stone-50 text-[11px] font-semibold text-stone-600">
                    <th className="py-3 px-4">Kata & IPA</th>
                    <th className="py-3 px-4">Arti Indonesia</th>
                    <th className="py-3 px-4">Level & Kategori</th>
                    <th className="py-3 px-4">Status SRS</th>
                    <th className="py-3 px-4 text-right">Tindakan & Tata Bahasa</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-200/80 text-xs">
                  {paginatedList.map((item) => {
                  const fullWord =
                    item.article !== 'none'
                      ? `${item.article} ${item.word}`
                      : item.word;
                  const isExpanded = expandedGrammarVocabId === item.id;
                  const declensions = isExpanded
                    ? generateCaseDeclensionTable(
                        item.word,
                        item.article,
                        item.plural
                      )
                    : [];
                  const conjugation =
                    isExpanded && item.article === 'none'
                      ? conjugateGermanVerb(item.word)
                      : null;

                  return (
                    <React.Fragment key={item.id}>
                      <tr className="hover:bg-stone-50/80">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-stone-950 text-sm">
                            {fullWord}
                          </div>
                          <div className="font-mono-tabular text-stone-500 text-[11px] mt-0.5">
                            {item.ipa} · {item.plural}
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-stone-950">
                            {item.meaningId}
                          </div>
                          <div className="text-stone-500 text-[11px] mt-0.5 line-clamp-1">
                            „{item.exampleDe}“
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-stone-600">
                          <span className="font-semibold text-blue-700">
                            {item.level}
                          </span>{' '}
                          · {item.category}
                        </td>
                        <td className="py-3.5 px-4 font-mono-tabular">
                          <div className="text-stone-900 font-medium">
                            Kotak {item.srsBox}/5 · {item.nextReviewLabel}
                          </div>
                          <div className="text-[11px] text-stone-500 mt-0.5">
                            {item.mastered ? 'Dikuasai' : 'Dalam Latihan'}
                            {item.lastAccuracy !== null
                              ? ` · Ucap ${item.lastAccuracy}%`
                              : ''}
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="inline-flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() =>
                                setExpandedGrammarVocabId(
                                  isExpanded ? null : item.id
                                )
                              }
                              className="px-2.5 py-1.5 text-[11px] font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-md transition-colors whitespace-nowrap shrink-0"
                            >
                              {isExpanded ? 'Tutup Kasus' : 'Bedah Kasus'}
                            </button>
                            <button
                              type="button"
                              onClick={() => speakGermanText(fullWord, 0.94)}
                              aria-label={`Putar audio ${fullWord}`}
                              className="p-1.5 text-stone-600 hover:text-blue-700 bg-stone-100 hover:bg-blue-50 rounded-md transition-colors"
                            >
                              <Volume2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() =>
                                onSelectForPractice(item, 'pronunciation')
                              }
                              aria-label={`Latih pengucapan ${fullWord}`}
                              className="px-2.5 py-1.5 text-[11px] font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors flex items-center gap-1 whitespace-nowrap shrink-0"
                            >
                              <Mic className="w-3 h-3" />
                              Ucapkan
                            </button>
                          </div>
                        </td>
                      </tr>

                      {isExpanded && (
                        <tr className="bg-stone-50/90">
                          <td colSpan={5} className="p-4 border-t border-stone-200/80">
                            {declensions.length > 0 ? (
                              <div className="space-y-2">
                                <div className="text-xs font-bold text-stone-900">
                                  Deklinasi 4 Kasus Nomina „{fullWord}“ (Klik untuk mendengar):
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-stone-200/80 border border-stone-200/90 rounded-lg overflow-hidden bg-white">
                                  {declensions.map((d) => (
                                    <button
                                      key={d.kasus}
                                      type="button"
                                      onClick={() =>
                                        speakGermanText(d.singularForm, 0.92)
                                      }
                                      className="p-3 hover:bg-blue-50/50 text-left transition-colors"
                                    >
                                      <div className="text-[11px] text-stone-500 font-semibold">
                                        {d.kasus} ({d.questionDe})
                                      </div>
                                      <div className="text-sm font-bold text-blue-800 font-display mt-0.5">
                                        {d.singularForm}
                                      </div>
                                      <div className="text-[11px] font-mono-tabular text-stone-500">
                                        Jamak: {d.pluralForm}
                                      </div>
                                    </button>
                                  ))}
                                </div>
                              </div>
                            ) : conjugation ? (
                              <div className="space-y-2">
                                <div className="text-xs font-bold text-stone-900">
                                  Konjugasi Verba „{item.word}“ · Perfekt:{' '}
                                  <span className="font-mono-tabular text-blue-700">
                                    {conjugation.auxiliary} + {conjugation.partizipII}
                                  </span>{' '}
                                  · Präteritum:{' '}
                                  <span className="font-mono-tabular text-blue-700">
                                    {conjugation.praeteritumIch}
                                  </span>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-6 divide-y sm:divide-y-0 sm:divide-x divide-stone-200/80 border border-stone-200/90 rounded-lg overflow-hidden bg-white">
                                  {Object.entries(conjugation.praesens).map(
                                    ([k, v]) => (
                                      <button
                                        key={k}
                                        type="button"
                                        onClick={() => speakGermanText(v, 0.92)}
                                        className="p-2.5 hover:bg-blue-50/50 text-left transition-colors"
                                      >
                                        <div className="font-bold text-stone-950">
                                          {v}
                                        </div>
                                      </button>
                                    )
                                  )}
                                </div>
                              </div>
                            ) : (
                              <div className="text-xs text-stone-600">
                                Ungkapan tetap (idiomatik): „{item.word}“ — {item.exampleDe}
                              </div>
                            )}
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
