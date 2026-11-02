import React from 'react';
import { MouthShapeType } from '../types';

interface VocalTractDiagramProps {
  mouthShape: MouthShapeType;
  phoneticFocus: string;
  ipa: string;
  syllables: string[];
  isPlayingAudio: boolean;
}

const MOUTH_PROFILES: Record<
  MouthShapeType,
  {
    title: string;
    lipOpening: string;
    tonguePos: string;
    airflowNote: string;
    tonguePath: string;
    lipRoundingRadius: number;
    resonancePoint: { cx: number; cy: number; label: string };
  }
> = {
  umlaut_u: {
    title: 'Vokal Depan Bulat · Umlaut ü [yː / ʏ]',
    lipOpening: 'Bibir membulat rapat maju (seperti u)',
    tonguePos: 'Punggung lidah naik tinggi di depan (posisi i)',
    airflowNote: 'Resonansi di rongga depan tepat di belakang gigi atas',
    tonguePath: 'M 48 135 Q 85 78 132 82 Q 165 86 175 130',
    lipRoundingRadius: 10,
    resonancePoint: { cx: 96, cy: 76, label: 'Palatum Depan [yː]' },
  },
  umlaut_o: {
    title: 'Vokal Tengah Bulat · Umlaut ö [øː / œ]',
    lipOpening: 'Bibir membulat sedang ke depan',
    tonguePos: 'Lidah tengah-depan (posisi vokal e)',
    airflowNote: 'Suara terfokus di antara langit-langit tengah dan bibir',
    tonguePath: 'M 48 135 Q 90 92 135 94 Q 166 98 175 130',
    lipRoundingRadius: 12,
    resonancePoint: { cx: 104, cy: 88, label: 'Palatum Tengah [øː]' },
  },
  umlaut_a: {
    title: 'Vokal Terbuka Depan · Umlaut ä [ɛː / ɛ]',
    lipOpening: 'Rahang terbuka santai tanpa pembulatan bibir',
    tonguePos: 'Lidah depan agak rendah',
    airflowNote: 'Aliran udara bebas dengan pembukaan mulut lebih lebar dari e',
    tonguePath: 'M 48 135 Q 92 106 138 104 Q 168 108 175 130',
    lipRoundingRadius: 16,
    resonancePoint: { cx: 100, cy: 98, label: 'Rongga Depan [ɛː]' },
  },
  ich_laut: {
    title: 'Frikatif Palatal · Ich-Laut ch [ç]',
    lipOpening: 'Sudut bibir sedikit melebar (seperti tersenyum)',
    tonguePos: 'Punggung lidah mendekat rapat ke langit-langit keras',
    airflowNote: 'Udara berdesis halus melewati celah sempit di palatum',
    tonguePath: 'M 48 135 Q 98 72 134 78 Q 165 92 175 130',
    lipRoundingRadius: 14,
    resonancePoint: { cx: 112, cy: 70, label: 'Celah Palatal [ç]' },
  },
  ach_laut: {
    title: 'Frikatif Velar · Ach-Laut ch [x]',
    lipOpening: 'Rahang terbuka netral mengikuti vokal a/o/u',
    tonguePos: 'Pangkal lidah belakang naik ke langit-langit lunak (velum)',
    airflowNote: 'Gesekan udara hangat di tenggorokan atas',
    tonguePath: 'M 48 135 Q 92 108 148 74 Q 172 86 175 130',
    lipRoundingRadius: 15,
    resonancePoint: { cx: 148, cy: 68, label: 'Velum Belakang [x]' },
  },
  sch_laut: {
    title: 'Sibilan Postalveolar · Konsonan sch / st / sp [ʃ]',
    lipOpening: 'Bibir membulat condong ke depan (protrusi bibir)',
    tonguePos: 'Ujung & daun lidah terangkat ke belakang gusi atas',
    airflowNote: 'Desis udara tebal dan penuh di belakang gigi',
    tonguePath: 'M 48 135 Q 76 76 122 88 Q 162 98 175 130',
    lipRoundingRadius: 11,
    resonancePoint: { cx: 82, cy: 74, label: 'Alveolar-Palatal [ʃ]' },
  },
  r_uvular: {
    title: 'Frikatif Uvular · Konsonan R Jerman [ʁ / ɐ]',
    lipOpening: 'Bibir rileks menyesuaikan vokal berikutnya',
    tonguePos: 'Ujung lidah tetap menyentuh gigi bawah; pangkal lidah naik',
    airflowNote: 'Getaran lembut di uvula (anak tekak) tanpa trill ujung lidah',
    tonguePath: 'M 48 135 Q 95 112 154 78 Q 176 84 178 130',
    lipRoundingRadius: 14,
    resonancePoint: { cx: 162, cy: 76, label: 'Uvula Belakang [ʁ]' },
  },
  diphthong: {
    title: 'Transisi Vokal Ganda · Diftong Jerman [aɪ̯ / aʊ̯ / ɔʏ̯]',
    lipOpening: 'Bergerak dinamis dari terbuka lebar ke posisi sempit',
    tonguePos: 'Meluncur mulus dari vokal rendah ke vokal tinggi dalam 1 suku kata',
    airflowNote: 'Tekanan suara kuat di awal vokal pertama lalu melandai',
    tonguePath: 'M 48 135 Q 92 94 134 86 Q 165 96 175 130',
    lipRoundingRadius: 13,
    resonancePoint: { cx: 108, cy: 82, label: 'Luncuran Diftong [aɪ̯]' },
  },
};

export const VocalTractDiagram: React.FC<VocalTractDiagramProps> = ({
  mouthShape,
  phoneticFocus,
  ipa,
  syllables,
  isPlayingAudio,
}) => {
  const profile = MOUTH_PROFILES[mouthShape] || MOUTH_PROFILES.umlaut_u;

  return (
    <div className="bg-white border border-stone-200/90 rounded-xl p-6">
      <div className="flex flex-wrap items-baseline justify-between gap-2 pb-4 border-b border-stone-200/80">
        <div>
          <span className="text-xs font-medium text-stone-500">
            Atlas Biomekanika Artikulasi · {ipa}
          </span>
          <h3 className="text-base font-bold text-stone-900 mt-0.5">
            {profile.title}
          </h3>
        </div>
        <span className="text-xs font-mono-tabular text-stone-500">
          {isPlayingAudio ? 'Audio Sedang Diputar' : 'Diagram Sagital Hochdeutsch'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center pt-5">
        {/* Sagittal Vocal Tract SVG Diagram (No nested card border, clean architectural divider) */}
        <div className="md:col-span-6 md:border-r md:border-stone-200/80 md:pr-6 flex flex-col items-center">
          <svg
            viewBox="0 0 240 165"
            className="w-full max-w-[270px] h-auto select-none"
            role="img"
            aria-label={`Diagram posisi lidah dan bibir untuk ${profile.title}`}
          >
            {/* Coordinate Grid Lines */}
            <line x1="20" y1="40" x2="220" y2="40" stroke="#E7E5E4" strokeDasharray="2 2" />
            <line x1="20" y1="80" x2="220" y2="80" stroke="#E7E5E4" strokeDasharray="2 2" />
            <line x1="20" y1="120" x2="220" y2="120" stroke="#E7E5E4" strokeDasharray="2 2" />

            {/* Hard & Soft Palate Roof */}
            <path
              d="M 42 74 C 65 44, 145 42, 174 75 C 185 88, 188 115, 188 145"
              fill="none"
              stroke="#44403C"
              strokeWidth="3"
              strokeLinecap="round"
            />

            {/* Upper & Lower Lips Indicator */}
            <circle
              cx="40"
              cy="86"
              r={profile.lipRoundingRadius}
              fill="rgba(29, 78, 216, 0.08)"
              stroke="#1D4ED8"
              strokeWidth="2"
            />
            <text x="12" y="64" fontSize="9" fill="#1D4ED8" fontWeight="600">
              Bibir
            </text>

            {/* Dynamic Tongue Contour */}
            <path
              d={profile.tonguePath}
              fill="rgba(29, 78, 216, 0.14)"
              stroke="#1D4ED8"
              strokeWidth="3.5"
              strokeLinecap="round"
            />

            {/* Airflow Vector Arrow */}
            <path
              d="M 168 118 Q 130 82 54 88"
              fill="none"
              stroke="#15803D"
              strokeWidth="1.75"
              strokeDasharray="4 3"
            />
            <polygon points="50,88 58,84 57,92" fill="#15803D" />

            {/* Primary Acoustic Resonance Node */}
            <circle
              cx={profile.resonancePoint.cx}
              cy={profile.resonancePoint.cy}
              r={isPlayingAudio ? 9 : 6}
              fill="#1D4ED8"
              fillOpacity="0.22"
            />
            <circle
              cx={profile.resonancePoint.cx}
              cy={profile.resonancePoint.cy}
              r="4"
              fill="#1D4ED8"
            />
            <text
              x={Math.min(145, Math.max(52, profile.resonancePoint.cx - 28))}
              y={profile.resonancePoint.cy - 10}
              fontSize="9.5"
              fill="#1C1917"
              fontWeight="600"
            >
              {profile.resonancePoint.label}
            </text>

            {/* Legend labels */}
            <text x="68" y="152" fontSize="9" fill="#78716C">
              Kontur Lidah Sagital · Vektor Aliran Udara
            </text>
          </svg>
        </div>

        {/* Biomechanical Articulation Parameters */}
        <div className="md:col-span-6 divide-y divide-stone-200/70 text-xs">
          <div className="pb-2.5">
            <div className="text-stone-500">Fokus Fonetik Kata</div>
            <div className="text-stone-900 font-semibold mt-0.5">{phoneticFocus}</div>
          </div>

          <div className="py-2.5">
            <div className="text-stone-500">Pembukaan Bibir & Rahang</div>
            <div className="text-stone-800 mt-0.5">{profile.lipOpening}</div>
          </div>

          <div className="py-2.5">
            <div className="text-stone-500">Elevasi Punggung Lidah</div>
            <div className="text-stone-800 mt-0.5">{profile.tonguePos}</div>
          </div>

          <div className="pt-2.5">
            <div className="text-stone-500 mb-1">
              Struktur Suku Kata & Tekanan Akustik (Unboxed)
            </div>
            <div className="flex flex-wrap items-center gap-2 font-mono-tabular text-sm">
              {syllables.map((syl, idx) => (
                <React.Fragment key={`${syl}-${idx}`}>
                  <span
                    className={
                      idx === 0
                        ? 'text-blue-700 font-bold underline decoration-blue-700/40 underline-offset-4'
                        : 'text-stone-700'
                    }
                  >
                    {idx === 0 ? `ˈ${syl}` : syl}
                  </span>
                  {idx < syllables.length - 1 && (
                    <span className="text-stone-400" aria-hidden="true">
                      ·
                    </span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
