import React, { useState } from 'react';
import { CefrLevel, GermanArticle, VocabCategory, VocabItem } from '../types';
import { validateNewVocabInput } from '../utils/germanRules';
import { X } from 'lucide-react';

interface AddVocabModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (newVocab: VocabItem, updatedTotalXp: number) => void;
}

export const AddVocabModal: React.FC<AddVocabModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const [article, setArticle] = useState<GermanArticle>('die');
  const [word, setWord] = useState('');
  const [plural, setPlural] = useState('');
  const [ipa, setIpa] = useState('');
  const [meaningId, setMeaningId] = useState('');
  const [category, setCategory] = useState<VocabCategory>('Kehidupan Sehari-hari');
  const [level, setLevel] = useState<CefrLevel>('A1');
  const [exampleDe, setExampleDe] = useState('');
  const [exampleId, setExampleId] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const check = validateNewVocabInput({
      word,
      article,
      meaningId,
      exampleDe,
      category,
      level,
    });

    if (!check.valid) {
      setErrorMsg(check.error || 'Mohon lengkapi semua kolom wajib.');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/vocabulary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          article,
          word,
          plural,
          ipa,
          meaningId,
          category,
          level,
          exampleDe,
          exampleId,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        setErrorMsg(data.error || 'Gagal menyimpan kosakata baru.');
        setIsSubmitting(false);
        return;
      }

      onCreated(data.vocab, data.stats.totalXp);
      setWord('');
      setPlural('');
      setIpa('');
      setMeaningId('');
      setExampleDe('');
      setExampleId('');
      setIsSubmitting(false);
      onClose();
    } catch {
      setErrorMsg('Gagal menghubungi server. Coba lagi.');
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-add-vocab-title"
    >
      <div className="bg-white border border-slate-200 rounded-xl max-w-lg w-full p-6 shadow-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div>
            <h2
              id="modal-add-vocab-title"
              className="text-lg font-bold text-slate-900"
            >
              Tambah Kosakata Jerman Baru
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Kata baru otomatis masuk ke antrean Spaced Repetition (Kotak 1) & Studio Pengucapan.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup formulir tambah kosakata"
            className="p-2 text-slate-500 hover:text-slate-900 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4" noValidate>
          {errorMsg && (
            <div
              role="alert"
              className="p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 font-medium"
            >
              ▲ VALIDASI: {errorMsg}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label
                htmlFor="input-article"
                className="block text-xs font-medium text-slate-700 mb-1"
              >
                Artikel (Genus)
              </label>
              <select
                id="input-article"
                value={article}
                onChange={(e) => setArticle(e.target.value as GermanArticle)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600"
              >
                <option value="der">der (Maskulin)</option>
                <option value="die">die (Feminin)</option>
                <option value="das">das (Neutrum)</option>
                <option value="none">Tanpa Artikel</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label
                htmlFor="input-word"
                className="block text-xs font-medium text-slate-700 mb-1"
              >
                Kata Bahasa Jerman *
              </label>
              <input
                id="input-word"
                type="text"
                value={word}
                onChange={(e) => setWord(e.target.value)}
                placeholder="Contoh: Fahrrad, Universität, Regenschirm"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="input-meaning"
                className="block text-xs font-medium text-slate-700 mb-1"
              >
                Arti Bahasa Indonesia *
              </label>
              <input
                id="input-meaning"
                type="text"
                value={meaningId}
                onChange={(e) => setMeaningId(e.target.value)}
                placeholder="Contoh: Sepeda"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600"
              />
            </div>

            <div>
              <label
                htmlFor="input-plural"
                className="block text-xs font-medium text-slate-700 mb-1"
              >
                Bentuk Jamak (Opsional)
              </label>
              <input
                id="input-plural"
                type="text"
                value={plural}
                onChange={(e) => setPlural(e.target.value)}
                placeholder="Contoh: die Fahrräder"
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label
                htmlFor="input-category"
                className="block text-xs font-medium text-slate-700 mb-1"
              >
                Kategori Konteks
              </label>
              <select
                id="input-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as VocabCategory)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600"
              >
                <option value="Kehidupan Sehari-hari">Kehidupan Sehari-hari</option>
                <option value="Salam & Komunikasi">Salam & Komunikasi</option>
                <option value="Keluarga & Rumah">Keluarga & Rumah</option>
                <option value="Kuliner & Kafe">Kuliner & Kafe</option>
                <option value="Perjalanan & Kota">Perjalanan & Kota</option>
                <option value="Kerja & Studi">Kerja & Studi</option>
                <option value="Waktu, Angka & Alam">Waktu, Angka & Alam</option>
                <option value="Verba & Sifat A1">Kata Kerja & Sifat</option>
                <option value="Akademik, Bisnis & C1">Akademik, Bisnis & C1</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="input-level"
                className="block text-xs font-medium text-slate-700 mb-1"
              >
                Level CEFR
              </label>
              <select
                id="input-level"
                value={level}
                onChange={(e) => setLevel(e.target.value as CefrLevel)}
                className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600"
              >
                <option value="A1">A1 (Dasar)</option>
                <option value="A2">A2 (Elementer)</option>
                <option value="B1">B1 (Menengah 1)</option>
                <option value="B2">B2 (Menengah 2)</option>
                <option value="C1">C1 (Lanjutan / Akademik)</option>
              </select>
            </div>
          </div>

          <div>
            <label
              htmlFor="input-example-de"
              className="block text-xs font-medium text-slate-700 mb-1"
            >
              Contoh Kalimat Bahasa Jerman *
            </label>
            <input
              id="input-example-de"
              type="text"
              value={exampleDe}
              onChange={(e) => setExampleDe(e.target.value)}
              placeholder="Contoh: Ich fahre jeden Morgen mit dem Fahrrad zur Arbeit."
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600"
            />
          </div>

          <div>
            <label
              htmlFor="input-example-id"
              className="block text-xs font-medium text-slate-700 mb-1"
            >
              Terjemahan Contoh Kalimat (Opsional)
            </label>
            <input
              id="input-example-id"
              type="text"
              value={exampleId}
              onChange={(e) => setExampleId(e.target.value)}
              placeholder="Contoh: Saya bersepeda ke tempat kerja setiap pagi."
              className="w-full px-3 py-2 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-600"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors whitespace-nowrap shrink-0"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 rounded-lg hover:bg-sky-700 transition-colors whitespace-nowrap shrink-0 disabled:opacity-50"
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan Kosakata'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
