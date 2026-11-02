import {
  CefrLevel,
  GermanArticle,
  MouthShapeType,
  VocabCategory,
  VocabItem,
} from '../types';
import { generateGermanIpa } from '../utils/germanRules';

type RawMasterRow = [
  string,
  GermanArticle,
  string,
  string,
  string,
  VocabCategory,
  CefrLevel,
  string,
  string
];

const MASTER_LEXICON_ROWS: RawMasterRow[] = [
  // HARI, BULAN, MUSIM & WAKTU (A1)
  ['Montag', 'der', 'die Montage', 'Mon·tag', 'Hari Senin', 'Waktu, Angka & Alam', 'A1', 'Am Montag beginnt unsere neue Arbeitswoche im Büro.', 'Pada hari Senin minggu kerja baru kami di kantor dimulai.'],
  ['Dienstag', 'der', 'die Dienstage', 'Diens·tag', 'Hari Selasa', 'Waktu, Angka & Alam', 'A1', 'Jeden Dienstagabend gehe ich zum Deutschkurs.', 'Setiap Selasa malam saya pergi mengikuti kursus bahasa Jerman.'],
  ['Mittwoch', 'der', 'die Mittwoche', 'Mitt·woch', 'Hari Rabu', 'Waktu, Angka & Alam', 'A1', 'Am Mittwoch ist bereits die Mitte der Woche erreicht.', 'Pada hari Rabu pertengahan minggu sudah tercapai.'],
  ['Donnerstag', 'der', 'die Donnerstage', 'Don·ners·tag', 'Hari Kamis', 'Waktu, Angka & Alam', 'A1', 'Am Donnerstag haben die Geschäfte in der Stadt länger geöffnet.', 'Pada hari Kamis toko-toko di kota buka lebih lama.'],
  ['Freitag', 'der', 'die Freitage', 'Frei·tag', 'Hari Jumat', 'Waktu, Angka & Alam', 'A1', 'Am Freitagnachmittag freuen sich alle auf das freie Wochenende.', 'Pada Jumat sore semua orang menantikan akhir pekan yang libur.'],
  ['Samstag', 'der', 'die Samstage', 'Sams·tag', 'Hari Sabtu', 'Waktu, Angka & Alam', 'A1', 'Am Samstag erledigen wir unseren großen Wocheneinkauf.', 'Pada hari Sabtu kami menyelesaikan belanja mingguan besar kami.'],
  ['Sonntag', 'der', 'die Sonntage', 'Sonn·tag', 'Hari Minggu', 'Waktu, Angka & Alam', 'A1', 'Am Sonntag machen wir einen langen Spaziergang im Park.', 'Pada hari Minggu kami berjalan-jalan santai yang panjang di taman.'],
  ['Frühling', 'der', 'die Frühlinge', 'Früh·ling', 'Musim semi', 'Waktu, Angka & Alam', 'A1', 'Im Frühling werden die Tage endlich wieder länger und wärmer.', 'Di musim semi hari-hari akhirnya kembali lebih panjang dan hangat.'],
  ['Sommer', 'der', 'die Sommer', 'Som·mer', 'Musim panas', 'Waktu, Angka & Alam', 'A1', 'Im Sommer baden viele Menschen in den bayerischen Seen.', 'Di musim panas banyak orang berenang di danau-danau Bayern.'],
  ['Herbst', 'der', 'die Herbste', 'Herbst', 'Musim gugur', 'Waktu, Angka & Alam', 'A1', 'Im Herbst färben sich die Blätter der Bäume golden und rot.', 'Di musim gugur dedaunan pohon berubah warna menjadi keemasan dan merah.'],
  ['Winter', 'der', 'die Winter', 'Win·ter', 'Musim dingin', 'Waktu, Angka & Alam', 'A1', 'Im Winter schneit es in den süddeutschen Bergen fast jede Woche.', 'Di musim dingin salju turun hampir setiap minggu di pegunungan Jerman selatan.'],
  ['Vormittag', 'der', 'die Vormittage', 'Vor·mit·tag', 'Pagi menjelang siang (09.00–12.00)', 'Waktu, Angka & Alam', 'A1', 'Heute Vormittag habe ich zwei wichtige Telefonate geführt.', 'Tadi pagi menjelang siang saya melakukan dua panggilan telepon penting.'],
  ['Nachmittag', 'der', 'die Nachmittage', 'Nach·mit·tag', 'Sore hari (13.00–17.00)', 'Waktu, Angka & Alam', 'A1', 'Am Nachmittag trinken wir auf der Terrasse eine Tasse Kaffee.', 'Pada sore hari kami minum secangkir kopi di teras.'],
  ['Mitternacht', 'die', 'die Mitternächte', 'Mit·ter·nacht', 'Tengah malam (00.00)', 'Waktu, Angka & Alam', 'A2', 'An Silvester begrüßen alle um Mitternacht das neue Jahr.', 'Saat malam tahun baru semua orang menyambut tahun baru pada tengah malam.'],
  ['Viertelstunde', 'die', 'die Viertelstunden', 'Vier·tel·stun·de', 'Seperempat jam (15 menit)', 'Waktu, Angka & Alam', 'A2', 'Der nächste Bus fährt in genau einer Viertelstunde ab.', 'Bus berikutnya berangkat tepat dalam lima belas menit.'],
  ['Halbjahr', 'das', 'die Halbjahre', 'Halb·jahr', 'Semester / Setengah tahun', 'Waktu, Angka & Alam', 'A2', 'Im ersten Halbjahr sind die Umsätze des Unternehmens deutlich gestiegen.', 'Pada semester pertama tahun ini omzet perusahaan meningkat tajam.'],

  // ANGGOTA TUBUH & KESEHATAN (A1–B1)
  ['Körper', 'der', 'die Körper', 'Kör·per', 'Tubuh / Badan', 'Kehidupan Sehari-hari', 'A1', 'Ausreichend Schlaf ist wichtig für einen gesunden Körper.', 'Tidur yang cukup penting bagi tubuh yang sehat.'],
  ['Gesicht', 'das', 'die Gesichter', 'Ge·sicht', 'Wajah', 'Kehidupan Sehari-hari', 'A1', 'Morgens wasche ich mein Gesicht immer mit kaltem Wasser.', 'Setiap pagi saya selalu membasuh wajah dengan air dingin.'],
  ['Auge', 'das', 'die Augen', 'Au·ge', 'Mata', 'Kehidupan Sehari-hari', 'A1', 'Schließen Sie beim Hören kurz die Augen und achten Sie auf den Klang.', 'Pejamkan mata sejenak saat mendengar dan perhatikan bunyinya.'],
  ['Ohr', 'das', 'die Ohren', 'Ohr', 'Telinga', 'Kehidupan Sehari-hari', 'A1', 'Ein geschultes Ohr erkennt feine Unterschiede zwischen den Vokalen.', 'Telinga yang terlatih mengenali perbedaan halus antarvokal.'],
  ['Zunge', 'die', 'die Zungen', 'Zun·ge', 'Lidah', 'Kehidupan Sehari-hari', 'A2', 'Beim deutschen Ich-Laut wölbt sich die Zunge leicht nach oben.', 'Pada bunyi Ich-Laut Jerman, lidah melengkung sedikit ke atas.'],
  ['Lippe', 'die', 'die Lippen', 'Lip·pe', 'Bibir', 'Kehidupan Sehari-hari', 'A2', 'Für die Umlaute ö und ü müssen beide Lippen gerundet werden.', 'Untuk bunyi Umlaut ö dan ü, kedua bibir harus dibulatkan.'],
  ['Kehle', 'die', 'die Kehlen', 'Keh·le', 'Tenggorokan / Kerongkongan', 'Kehidupan Sehari-hari', 'B1', 'Das deutsche R entsteht sanft hinten in der Kehle.', 'Bunyi R Jerman dihasilkan secara lembut di bagian belakang tenggorokan.'],
  ['Stimme', 'die', 'die Stimmen', 'Stim·me', 'Suara vokal', 'Kehidupan Sehari-hari', 'A2', 'Sprechen Sie die Sätze mit klarer und ruhiger Stimme aus.', 'Ucapkan kalimat-kalimat tersebut dengan suara yang jernih dan tenang.'],
  ['Rücken', 'der', 'die Rücken', 'Rü·cken', 'Punggung', 'Kehidupan Sehari-hari', 'A1', 'Ein ergonomischer Stuhl schont bei der Büroarbeit den Rücken.', 'Kursi ergonomis melindungi punggung saat bekerja di kantor.'],
  ['Schulter', 'die', 'die Schultern', 'Schul·ter', 'Bahu / Pundak', 'Kehidupan Sehari-hari', 'A2', 'Er trug seine schwere Fototasche locker über der linken Schulter.', 'Ia menyandang tas kamera beratnya dengan santai di bahu kiri.'],
  ['Magen', 'der', 'die Mägen', 'Ma·gen', 'Lambung / Perut', 'Kehidupan Sehari-hari', 'A2', 'Warmer Kamillentee beruhigt einen empfindlichen Magen sehr schnell.', 'Teh kamomil hangat menenangkan lambung yang sensitif dengan sangat cepat.'],
  ['Blutdruck', 'der', '— (Singularetantum)', 'Blut·druck', 'Tekanan darah', 'Kehidupan Sehari-hari', 'B1', 'Die Ärztin misst bei jeder Untersuchung zuerst den Blutdruck.', 'Dokter mengukur tekanan darah terlebih dahulu pada setiap pemeriksaan.'],
  ['Impfung', 'die', 'die Impfungen', 'Imp·fung', 'Vaksinasi / Imunisasi', 'Kehidupan Sehari-hari', 'B1', 'Alle durchgeführten Impfungen werden im gelben Impfpass eingetragen.', 'Semua vaksinasi yang telah dilakukan dicatat di buku vaksin kuning.'],

  // PROFESI & BIDANG KEAHLIAN (A1–B2)
  ['Ingenieur', 'der', 'die Ingenieure', 'In·ge·ni·eur', 'Insinyur', 'Kerja & Studi', 'A2', 'Mein Bruder arbeitet als Ingenieur in der Automobilindustrie.', 'Kakak laki-laki saya bekerja sebagai insinyur di industri otomotif.'],
  ['Wissenschaftler', 'der', 'die Wissenschaftler', 'Wis·sen·schaft·ler', 'Ilmuwan / Peneliti', 'Kerja & Studi', 'B1', 'Wissenschaftler aus fünf Ländern arbeiten gemeinsam an diesem Institut.', 'Para ilmuwan dari lima negara bekerja bersama di institut ini.'],
  ['Krankenschwester', 'die', 'die Krankenschwestern', 'Kran·ken·schwes·ter', 'Perawat medis', 'Kerja & Studi', 'A2', 'Die freundliche Krankenschwester kümmerte sich aufmerksam um die Patienten.', 'Perawat yang ramah itu merawat para pasien dengan penuh perhatian.'],
  ['Architekt', 'der', 'die Architekten', 'Ar·chi·tekt', 'Arsitek', 'Kerja & Studi', 'A2', 'Der Architekt entwarf ein helles Gebäude mit großen Glasfassaden.', 'Arsitek tersebut merancang gedung terang dengan fasad kaca besar.'],
  ['Rechtsanwalt', 'der', 'die Rechtsanwälte', 'Rechts·an·walt', 'Pengacara / Advokat hukum', 'Kerja & Studi', 'B1', 'Vor Vertragsabschluss ließ sie das Dokument von einem Rechtsanwalt prüfen.', 'Sebelum penandatanganan kontrak, ia meminta dokumen tersebut diperiksa oleh pengacara.'],
  ['Dolmetscher', 'der', 'die Dolmetscher', 'Dol·met·scher', 'Juru bahasa lisan (Interpreter)', 'Kerja & Studi', 'B1', 'Auf der internationalen Konferenz übersetzte ein erfahrener Dolmetscher simultan.', 'Pada konferensi internasional tersebut, seorang juru bahasa berpengalaman menerjemahkan secara simultan.'],
  ['Übersetzer', 'der', 'die Übersetzer', 'Ü·ber·set·zer', 'Penerjemah teks tertulis', 'Kerja & Studi', 'B1', 'Der literarische Übersetzer übertrug den Roman meisterhaft ins Deutsche.', 'Penerjemah sastra itu mengalihbahasakan novel tersebut dengan sangat apik ke bahasa Jerman.'],
  ['Handwerker', 'der', 'die Handwerker', 'Hand·wer·ker', 'Teknisi / Ahli pertukangan', 'Kerja & Studi', 'A2', 'Der Handwerker reparierte das undichte Fenster innerhalb einer Stunde.', 'Teknisi tersebut memperbaiki jendela yang bocor dalam waktu satu jam.'],
  ['Buchhalter', 'der', 'die Buchhalter', 'Buch·hal·ter', 'Akuntan / Staf pembukuan', 'Kerja & Studi', 'B1', 'Der Buchhalter prüft am Monatsende alle Eingangsrechnungen.', 'Akuntan memeriksa seluruh faktur masuk pada akhir bulan.'],
  ['Unternehmer', 'der', 'die Unternehmer', 'Un·ter·neh·mer', 'Pengusaha / Wirausahawan', 'Kerja & Studi', 'B1', 'Als junger Unternehmer gründete er eine Firma für Medizintechnik.', 'Sebagai pengusaha muda, ia mendirikan perusahaan teknologi medis.'],
  ['Beamte', 'der', 'die Beamten', 'Be·am·te', 'Pegawai negeri sipil / Pejabat', 'Kerja & Studi', 'B1', 'Der zuständige Beamte im Konsulat bearbeitete den Visumantrag zügig.', 'Pejabat berwenang di konsulat memproses permohonan visa tersebut dengan cepat.'],
  ['Forscher', 'der', 'die Forscher', 'For·scher', 'Peneliti', 'Kerja & Studi', 'B1', 'Die Forscher veröffentlichten ihre Ergebnisse in einer Fachzeitschrift.', 'Para peneliti mempublikasikan hasil temuan mereka di jurnal ilmiah.'],

  // RUMAH, BENDA & KEHIDUPAN KOTA TAMBAHAN (A1–B1)
  ['Schere', 'die', 'die Scheren', 'Sche·re', 'Gunting', 'Keluarga & Rumah', 'A1', 'Mit dieser scharfen Schere lässt sich dickes Papier mühelos schneiden.', 'Dengan gunting tajam ini kertas tebal dapat dipotong dengan mudah.'],
  ['Schlüssel', 'der', 'die Schlüssel', 'Schlüs·sel', 'Kunci', 'Keluarga & Rumah', 'A1', 'Gute Aussprache ist der Schlüssel zu selbstbewusster Kommunikation.', 'Pengucapan yang baik adalah kunci menuju komunikasi yang percaya diri.'],
  ['Vorhängeschloss', 'das', 'die Vorhängeschlösser', 'Vor·hän·ge·schloss', 'Gembok', 'Keluarga & Rumah', 'B1', 'Er sicherte sein neues Fahrrad am Bahnhof mit einem massiven Vorhängeschloss.', 'Ia mengamankan sepeda barunya di stasiun dengan gembok yang kokoh.'],
  ['Werkstatt', 'die', 'die Werkstätten', 'Werk·statt', 'Bengkel', 'Perjalanan & Kota', 'A2', 'Das Auto steht heute zur jährlichen Inspektion in der Werkstatt.', 'Mobil itu hari ini berada di bengkel untuk pemeriksaan tahunan.'],
  ['Waschmittel', 'das', 'die Waschmittel', 'Wasch·mit·tel', 'Deterjen pencuci pakaian', 'Keluarga & Rumah', 'A2', 'Dieses umweltfreundliche Waschmittel reinigt auch bei niedrigen Temperaturen.', 'Deterjen ramah lingkungan ini membersihkan pakaian bahkan pada suhu rendah.'],
  ['Bügeleisen', 'das', 'die Bügeleisen', 'Bü·gel·ei·sen', 'Setrika', 'Keluarga & Rumah', 'A2', 'Vergiss bitte nicht, das heiße Bügeleisen nach dem Bügeln auszuschalten.', 'Tolong jangan lupa mematikan setrika panas setelah selesai menyetrika.'],
  ['Kleiderbügel', 'der', 'die Kleiderbügel', 'Klei·der·bü·gel', 'Gantungan baju (Hanger)', 'Keluarga & Rumah', 'A2', 'Häng deinen nassen Mantel bitte auf einen stabilen Kleiderbügel.', 'Tolong gantungkan mantel basahmu pada gantungan baju yang kokoh.'],
  ['Blumentopf', 'der', 'die Blumentöpfe', 'Blu·men·topf', 'Pot bunga', 'Keluarga & Rumah', 'A2', 'Auf dem sonnigen Balkon stehen fünf bunte Blumentöpfe aus Ton.', 'Di balkon yang cerah terdapat lima pot bunga warna-warni dari tanah liat.'],
  ['Gießkanne', 'die', 'die Gießkannen', 'Gieß·kan·ne', 'Alat penyiram tanaman', 'Keluarga & Rumah', 'B1', 'Sie füllte die grüne Gießkanne mit frischem Regenwasser für den Garten.', 'Ia mengisi alat penyiram tanaman hijau itu dengan air hujan segar untuk kebun.'],
  ['Briefumschlag', 'der', 'die Briefumschläge', 'Brief·um·schlag', 'Amplop surat', 'Kehidupan Sehari-hari', 'A2', 'Stecken Sie das unterschriebene Formular in einen frankierten Briefumschlag.', 'Masukkan formulir yang telah ditandatangani ke dalam amplop berperangko.'],
  ['Kugelschreiber', 'der', 'die Kugelschreiber', 'Ku·gel·schrei·ber', 'Pulpen (Bolpoin)', 'Kerja & Studi', 'A1', 'Unterschreiben Sie den Vertrag bitte mit einem blauen oder schwarzen Kugelschreiber.', 'Silakan tandatangani kontrak tersebut menggunakan pulpen biru atau hitam.'],
  ['Bleistift', 'der', 'die Bleistifte', 'Blei·stift', 'Pensil', 'Kerja & Studi', 'A1', 'Notieren Sie sich die Betonungszeichen am besten mit einem weichen Bleistift.', 'Catatlah tanda tekanan kata sebaiknya menggunakan pensil yang lunak.'],
  ['Notizbuch', 'das', 'die Notizbücher', 'No·tiz·buch', 'Buku catatan kecil', 'Kerja & Studi', 'A1', 'Ich trage immer ein kleines Notizbuch für neue deutsche Ausdrücke bei mir.', 'Saya selalu membawa buku catatan kecil untuk ungkapan-ungkapan Jerman baru.'],
  ['Ordner', 'der', 'die Ordner', 'Ord·ner', 'Map ordner dokumen / Folder', 'Kerja & Studi', 'A2', 'Alle wichtigen Rechnungen und Verträge hefte ich in diesem blauen Ordner ab.', 'Semua tagihan dan kontrak penting saya arsipkan di dalam map ordner biru ini.'],
  ['Ladekabel', 'das', 'die Ladekabel', 'La·de·ka·bel', 'Kabel pengisi daya (Charger)', 'Kerja & Studi', 'A2', 'Hast du zufällig ein passendes Ladekabel für mein Mobiltelefon dabei?', 'Apakah kamu kebetulan membawa kabel pengisi daya yang cocok untuk ponselku?'],
  ['Kopfhörer', 'der', 'die Kopfhörer', 'Kopf·hö·rer', 'Headphone / Earphone', 'Kerja & Studi', 'A2', 'Mit guten Kopfhörern hört man die feinen Konsonanten beim Sprachtraining noch klarer.', 'Dengan headphone yang baik, konsonan halus dalam latihan bahasa terdengar makin jernih.'],
  ['Lautsprecher', 'der', 'die Lautsprecher', 'Laut·spre·cher', 'Pengeras suara (Speaker)', 'Kerja & Studi', 'A2', 'Über die Lautsprecher am Bahnsteig wurde die Einfahrt des Zuges angekündigt.', 'Melalui pengeras suara di peron diumumkan kedatangan kereta.'],
  ['Mikrofon', 'das', 'die Mikrofone', 'Mi·kro·fon', 'Mikrofon', 'Kerja & Studi', 'A2', 'Sprechen Sie beim Aussprachetest bitte in normalem Abstand ins Mikrofon.', 'Saat tes pengucapan silakan berbicara ke mikrofon dengan jarak normal.'],
  ['Netzwerk', 'das', 'die Netzwerke', 'Netz·werk', 'Jaringan (Network)', 'Kerja & Studi', 'B1', 'Ein gutes berufliches Netzwerk hilft beim Einstieg in den Arbeitsmarkt.', 'Jaringan profesional yang baik membantu saat memasuki pasar kerja.'],
  ['Schnittstelle', 'die', 'die Schnittstellen', 'Schnitt·stel·le', 'Antarmuka (Interface) / Titik temu', 'Kerja & Studi', 'B2', 'Die moderne Anwendung verfügt über eine schnelle Schnittstelle zur Sprachanalyse.', 'Aplikasi modern ini memiliki antarmuka cepat untuk analisis suara.'],

  // KATA SIFAT & VERBA LANJUTAN (B1–C1)
  ['ausführlich', 'none', 'Adjektiv · Adverb', 'aus·führ·lich', 'Lengkap / Terperinci / Mendalam', 'Verba & Sifat A1', 'B1', 'In diesem Handbuch werden alle vier deutschen Fälle ausführlich erklärt.', 'Di dalam buku panduan ini keempat kasus bahasa Jerman dijelaskan secara terperinci.'],
  ['übersichtlich', 'none', 'Adjektiv · Adverb', 'ü·ber·sicht·lich', 'Rapi dan mudah dipahami (terstruktur jelas)', 'Verba & Sifat A1', 'B1', 'Die Deklinationstabelle ist sehr übersichtlich gestaltet.', 'Tabel deklinasi tersebut dirancang dengan sangat rapi dan mudah dipahami.'],
  ['abwechslungsreich', 'none', 'Adjektiv · Adverb', 'ab·wechs·lungs·reich', 'Bervariasi / Tidak membosankan', 'Verba & Sifat A1', 'B1', 'Ein abwechslungsreiches Training aus Hören, Lesen und Sprechen motiviert langfristig.', 'Latihan yang bervariasi antara mendengar, membaca, dan berbicara memotivasi dalam jangka panjang.'],
  ['anspruchsvoll', 'none', 'Adjektiv · Adverb', 'an·spruchs·voll', 'Menantang / Berstandar tinggi', 'Verba & Sifat A1', 'B2', 'Wissenschaftliche Texte auf dem Niveau C1 sind sprachlich sehr anspruchsvoll.', 'Teks ilmiah pada level C1 secara kebahasaan sangat menantang.'],
  ['nachhaltig', 'none', 'Adjektiv · Adverb', 'nach·hal·tig', 'Berkelanjutan / Berdampak jangka panjang', 'Verba & Sifat A1', 'B2', 'Verteiltes Lernen sorgt für einen nachhaltigen Aufbau des Wortschatzes.', 'Pembelajaran terjadwal memastikan pembangunan kosakata yang berdampak jangka panjang.'],
  ['angemessen', 'none', 'Adjektiv · Adverb', 'an·ge·mes·sen', 'Layak / Pantas / Sesuai konteks', 'Verba & Sifat A1', 'B2', 'In formellen Briefen sollte man stets eine angemessene Ausdrucksweise wählen.', 'Dalam surat resmi kita harus selalu memilih gaya bahasa yang pantas.'],
  ['unverzichtbar', 'none', 'Adjektiv · Adverb', 'un·ver·zicht·bar', 'Sangat penting / Tak tergantikan', 'Verba & Sifat A1', 'B2', 'Sichere Artikelkenntnisse sind für korrekte deutsche Sätze unverzichtbar.', 'Pengetahuan artikel yang mantap sangat penting untuk menyusun kalimat Jerman yang benar.'],
  ['offensichtlich', 'none', 'Adjektiv · Adverb', 'of·fen·sicht·lich', 'Jelas terlihat / Nyata', 'Verba & Sifat A1', 'B2', 'Nach drei Wochen Übung war der Fortschritt in seiner Aussprache offensichtlich.', 'Setelah tiga minggu berlatih, kemajuan dalam pengucapannya terlihat jelas.'],
  ['maßgeblich', 'none', 'Adjektiv · Adverb', 'maß·geb·lich', 'Sangat menentukan / Berpengaruh besar', 'Akademik, Bisnis & C1', 'C1', 'Die richtige Vokalquantität trägt maßgeblich zur Verständlichkeit bei.', 'Panjang-pendek vokal yang tepat berperan sangat menentukan bagi kejelasan makna.'],
  ['ausschlaggebend', 'none', 'Adjektiv · Adverb', 'aus·schlag·ge·bend', 'Menjadi faktor penentu utama', 'Akademik, Bisnis & C1', 'C1', 'Für die Auswahl der Bewerberin waren ihre exzellenten Sprachkenntnisse ausschlaggebend.', 'Faktor penentu terpilihnya pelamar tersebut adalah kemampuan bahasanya yang unggul.'],
  ['unmissverständlich', 'none', 'Adjektiv · Adverb', 'un·miss·ver·ständ·lich', 'Tegas / Tidak menimbulkan salah tafsir', 'Akademik, Bisnis & C1', 'C1', 'Die Sicherheitsregeln im Labor sind klar und unmissverständlich formuliert.', 'Aturan keselamatan di laboratorium dirumuskan secara jelas dan tidak menimbulkan salah tafsir.'],
  ['zukunftsfähig', 'none', 'Adjektiv · Adverb', 'zu·kunfts·fä·hig', 'Siap menghadapi masa depan (Future-proof)', 'Akademik, Bisnis & C1', 'C1', 'Mehrsprachigkeit ist eine zukunftsfähige Schlüsselkompetenz in einer vernetzten Welt.', 'Kemampuan multibahasa adalah kompetensi kunci masa depan di dunia yang saling terhubung.'],
  ['differenzieren', 'none', 'differenziert · differenzierte · hat differenziert', 'dif·fe·ren·zie·ren', 'Membedakan secara rinci / Memilah', 'Akademik, Bisnis & C1', 'C1', 'Fortgeschrittene Sprecher differenzieren genau zwischen kurzen und langen Vokalen.', 'Penutur mahir membedakan secara presisi antara vokal pendek dan vokal panjang.'],
  ['präzisieren', 'none', 'präzisiert · präzisierte · hat präzisiert', 'prä·zi·sie·ren', 'Memperjelas / Mempertajam rincian', 'Akademik, Bisnis & C1', 'C1', 'Könnten Sie Ihren Vorschlag in Bezug auf den Zeitplan noch etwas präzisieren?', 'Bisakah Anda memperjelas sedikit lagi usulan Anda terkait jadwal pelaksanaan?'],
  ['erläutern', 'none', 'erläutert · erläuterte · hat erläutert', 'er·läu·tern', 'Menguraikan / Menjelaskan dengan contoh', 'Akademik, Bisnis & C1', 'B2', 'Der Dozent erläuterte die Regel anhand mehrerer anschaulicher Beispielsätze.', 'Dosen tersebut menguraikan kaidah itu menggunakan beberapa kalimat contoh yang jelas.'],
  ['zusammenfassen', 'none', 'fasst zusammen · fasste zusammen · hat zusammengefasst', 'zu·sam·men·fas·sen', 'Merangkum / Menyimpulkan pokok bahasan', 'Akademik, Bisnis & C1', 'B1', 'Am Ende des Kapitels werden die wichtigsten Grammatikregeln kurz zusammengefasst.', 'Di akhir bab, aturan tata bahasa terpenting dirangkum secara singkat.'],
  ['hervorheben', 'none', 'hebt hervor · hob hervor · hat hervorgehoben', 'her·vor·he·ben', 'Menonjolkan / Menekankan pentingnya', 'Akademik, Bisnis & C1', 'B2', 'Durch die Satzbetonung kann man das wichtigste Wort besonders hervorheben.', 'Melalui tekanan kalimat, kita dapat menonjolkan kata yang paling penting.'],
  ['widerlegen', 'none', 'widerlegt · widerlegte · hat widerlegt', 'wi·der·le·gen', 'Mematahkan argumen / Membuktikan salah', 'Akademik, Bisnis & C1', 'C1', 'Mit neuen Messungen konnte das Forschungsteam das alte Vorurteil widerlegen.', 'Dengan pengukuran baru, tim riset berhasil mematahkan anggapan lama tersebut.'],
  ['befürworten', 'none', 'befürwortet · befürwortete · hat befürwortet', 'be·für·wor·ten', 'Mendukung / Menyetujui gagasan resmi', 'Akademik, Bisnis & C1', 'C1', 'Die Mehrheit der Kommission befürwortet den Ausbau zweisprachiger Studiengänge.', 'Mayoritas komisi mendukung perluasan program studi dwibahasa.'],
  ['bewältigen', 'none', 'bewältigt · bewältigte · hat bewältigt', 'be·wäl·ti·gen', 'Mengatasi / Menangani beban tugas besar', 'Akademik, Bisnis & C1', 'B2', 'Wenn man den Lernstoff in kleine Schritte teilt, lässt er sich leicht bewältigen.', 'Jika materi belajar dibagi menjadi langkah-langkah kecil, materi tersebut mudah dikuasai.'],
  ['aneignen', 'none', 'eignet an · eignete an · hat angeeignet (sich + Dativ)', 'an·eig·nen', 'Menguasai ilmu / Mempelajari mandiri (sich + Dativ)', 'Akademik, Bisnis & C1', 'C1', 'Innerhalb eines Jahres hat sie sich einen beeindruckenden Fachwortschatz angeeignet.', 'Dalam waktu satu tahun ia berhasil menguasai kosakata keahlian yang mengesankan.'],
  ['verständigen', 'none', 'verständigt · verständigte · hat verständigt', 'ver·stän·di·gen', 'Berkomunikasi / Mencapai kesepakatan', 'Salam & Komunikasi', 'B1', 'Schon mit dem Grundwortschatz kann man sich auf Reisen problemlos verständigen.', 'Bahkan dengan kosakata dasar, seseorang sudah dapat berkomunikasi tanpa kendala saat bepergian.'],
  ['nachschlagen', 'none', 'schlägt nach · schlug nach · hat nachgeschlagen', 'nach·schla·gen', 'Mencari kata di kamus / referensi', 'Kerja & Studi', 'B1', 'Unbekannte Nomen können Sie jederzeit im integrierten Wörterbuch nachschlagen.', 'Kata benda yang belum dikenal dapat Anda cari kapan saja di dalam kamus terpadu.'],
  ['einprägen', 'none', 'prägt ein · prägte ein · hat eingeprägt (sich + Dativ)', 'ein·prä·gen', 'Menanamkan di ingatan / Menghafal kuat', 'Kerja & Studi', 'B2', 'Mit Beispielsätzen und Audio prägen Sie sich neue Wörter besonders schnell ein.', 'Dengan kalimat contoh dan audio, Anda menanamkan kata-kata baru di ingatan dengan sangat cepat.'],
  ['beherrschen', 'none', 'beherrscht · beherrschte · hat beherrscht', 'be·herr·schen', 'Menguasai secara mahir', 'Kerja & Studi', 'B2', 'Er beherrscht neben Indonesisch und Englisch auch fließend Deutsch.', 'Selain bahasa Indonesia dan Inggris, ia juga menguasai bahasa Jerman dengan fasih.'],

  // KULINER, ALAM, KEHIDUPAN & PERJALANAN TAMBAHAN (A1–B2)
  ['Kühlschranktür', 'die', 'die Kühlschranktüren', 'Kühl·schrank·tür', 'Pintu kulkas', 'Keluarga & Rumah', 'A2', 'An der Kühlschranktür hängen kleine Magnetkarten mit wichtigen deutschen Verben.', 'Di pintu kulkas tertempel kartu magnet kecil berisi kata kerja penting bahasa Jerman.'],
  ['Esstisch', 'der', 'die Esstische', 'Ess·tisch', 'Meja makan', 'Keluarga & Rumah', 'A1', 'Am großen Esstisch versammelt sich am Abend die ganze Familie.', 'Di meja makan besar seluruh keluarga berkumpul pada malam hari.'],
  ['Bücherregal', 'das', 'die Bücherregale', 'Bü·cher·re·gal', 'Rak buku', 'Keluarga & Rumah', 'A1', 'Alle Deutschlehrbücher und Wörterbücher stehen griffbereit im Bücherregal.', 'Semua buku pelajaran dan kamus bahasa Jerman tersusun mudah dijangkau di rak buku.'],
  ['Fensterbrett', 'das', 'die Fensterbretter', 'Fens·ter·brett', 'Ambang jendela', 'Keluarga & Rumah', 'A2', 'Auf dem sonnigen Fensterbrett wachsen frische Kräuter für die Küche.', 'Di ambang jendela yang disinari matahari tumbuh herba segar untuk dapur.'],
  ['Haustier', 'das', 'die Haustiere', 'Haus·tier', 'Hewan peliharaan', 'Keluarga & Rumah', 'A1', 'Hunde und Katzen sind in Deutschland die beliebtesten Haustiere.', 'Anjing dan kucing adalah hewan peliharaan paling populer di Jerman.'],
  ['Spaziergang', 'der', 'die Spaziergänge', 'Spa·zier·gang', 'Jalan-jalan santai', 'Kehidupan Sehari-hari', 'A1', 'Ein kurzer Spaziergang nach dem Mittagessen erfrischt den Geist.', 'Jalan-jalan santai singkat setelah makan siang menyegarkan pikiran.'],
  ['Ausflug', 'der', 'die Ausflüge', 'Aus·flug', 'Darmawisata / Tamasya singkat', 'Perjalanan & Kota', 'A2', 'Am kommenden Sonntag planen wir einen gemeinsamen Ausflug an den Bodensee.', 'Pada hari Minggu mendatang kami merencanakan tamasya bersama ke Danau Constance.'],
  ['Wanderung', 'die', 'die Wanderungen', 'Wan·de·rung', 'Pendakian alam / Hiking', 'Perjalanan & Kota', 'A2', 'Für die mehrstündige Wanderung tragen wir feste Wanderschuhe.', 'Untuk pendakian alam selama beberapa jam kami mengenakan sepatu gunung yang kokoh.'],
  ['Fahrradweg', 'der', 'die Fahrradwege', 'Fahr·rad·weg', 'Jalur khusus sepeda', 'Perjalanan & Kota', 'A2', 'In vielen deutschen Universitätsstädten gibt es breite und sichere Fahrradwege.', 'Di banyak kota universitas di Jerman terdapat jalur sepeda yang lebar dan aman.'],
  ['Straßenverkehr', 'der', '— (Singularetantum)', 'Stra·ßen·ver·kehr', 'Lalu lintas jalan raya', 'Perjalanan & Kota', 'B1', 'Im dichten Straßenverkehr ist gegenseitige Rücksichtnahme besonders wichtig.', 'Dalam lalu lintas jalan raya yang padat, sikap saling tenggang rasa sangatlah penting.'],
  ['Rücksicht', 'die', '— (Singularetantum)', 'Rück·sicht', 'Tenggang rasa / Perhatian terhadap orang lain', 'Salam & Komunikasi', 'B1', 'In Wohngebieten nehmen alle Nachbarn abends Rücksicht aufeinander.', 'Di kawasan tempat tinggal semua tetangga saling bertenggang rasa pada malam hari.'],
  ['Geduld', 'die', '— (Singularetantum)', 'Ge·duld', 'Kesabaran', 'Salam & Komunikasi', 'B1', 'Mit etwas Geduld und täglicher Übung meistern Sie auch schwierige Konsonantencluster.', 'Dengan sedikit kesabaran dan latihan harian, Anda pasti menguasai gugus konsonan yang sulit sekalipun.'],
  ['Ausdauer', 'die', '— (Singularetantum)', 'Aus·dau·er', 'Ketekunan / Daya tahan', 'Kerja & Studi', 'B1', 'Beim Erlernen einer Fremdsprache ist Ausdauer wichtiger als bloßes Talent.', 'Dalam mempelajari bahasa asing, ketekunan lebih penting daripada sekadar bakat.'],
  ['Neugier', 'die', '— (Singularetantum)', 'Neu·gier', 'Rasa ingin tahu', 'Kerja & Studi', 'B1', 'Wissenschaftliche Neugier führt oft zu den spannendsten Entdeckungen.', 'Rasa ingin tahu ilmiah sering kali menghasilkan penemuan yang paling menarik.'],
  ['Begeisterung', 'die', '— (Singularetantum)', 'Be·geis·te·rung', 'Antusiasme / Semangat tinggi', 'Salam & Komunikasi', 'B1', 'Seine Begeisterung für die deutsche Sprache und Kultur steckte den ganzen Kurs an.', 'Antusiasmenya terhadap bahasa dan budaya Jerman menular ke seluruh peserta kursus.'],
  ['Zuversicht', 'die', '— (Singularetantum)', 'Zu·ver·sicht', 'Rasa optimis / Keyakinan positif', 'Salam & Komunikasi', 'B2', 'Nach der gründlichen Vorbereitung geht sie mit großer Zuversicht in die Prüfung.', 'Setelah persiapan yang matang, ia menghadapi ujian dengan penuh rasa optimis.'],
  ['Selbstvertrauen', 'das', '— (Singularetantum)', 'Selbst·ver·trau·en', 'Rasa percaya diri', 'Salam & Komunikasi', 'B1', 'Jedes erfolgreich geführte Gespräch stärkt Ihr sprachliches Selbstvertrauen.', 'Setiap percakapan yang berhasil dilakukan memperkuat rasa percaya diri berbahasa Anda.'],
  ['Sprachgefühl', 'das', '— (Singularetantum)', 'Sprach·ge·fühl', 'Kepekaan / Intuisi bahasa', 'Salam & Komunikasi', 'B2', 'Durch regelmäßiges Hören und Lesen entwickelt sich ein natürliches Sprachgefühl.', 'Melalui kegiatan mendengar dan membaca secara rutin, tumbuh kepekaan bahasa yang alami.'],
];

function detectMasterMouthShape(word: string): MouthShapeType {
  const lower = word.toLowerCase();
  if (lower.includes('ü')) return 'umlaut_u';
  if (lower.includes('ö')) return 'umlaut_o';
  if (lower.includes('ä')) return 'umlaut_a';
  if (/[aou]ch/.test(lower)) return 'ach_laut';
  if (lower.includes('ch') || lower.endsWith('ig')) return 'ich_laut';
  if (
    lower.includes('sch') ||
    /s[pt]/.test(lower) ||
    lower.includes('ß') ||
    lower.includes('z')
  )
    return 'sch_laut';
  if (
    lower.includes('ei') ||
    lower.includes('au') ||
    lower.includes('eu') ||
    lower.includes('äu')
  )
    return 'diphthong';
  return 'r_uvular';
}

function buildMasterPhoneticFocus(word: string, syllables: string[]): string {
  const lower = word.toLowerCase();
  if (lower.includes('ü')) return 'Vokal bulat depan Umlaut ü [yː/ʏ]';
  if (lower.includes('ö')) return 'Vokal bulat tengah Umlaut ö [øː/œ]';
  if (lower.includes('ä')) return 'Vokal terbuka depan Umlaut ä [ɛː/ɛ]';
  if (lower.includes('ß'))
    return 'Konsonan tajam Eszett ß [s] & vokal panjang';
  if (/[aou]ch/.test(lower)) return 'Frikatif tenggorokan Ach-Laut ch [x]';
  if (lower.includes('ch') || lower.endsWith('ig'))
    return 'Frikatif palatal halus Ich-Laut [ç]';
  if (lower.includes('sch') || /s[pt]/.test(lower))
    return 'Sibilan tebal sch / sp / st [ʃ]';
  if (lower.includes('ei') || lower.includes('eu') || lower.includes('au'))
    return 'Transisi vokal ganda (Diftong)';
  return `Tekanan suku kata ${syllables.join('·')}`;
}

function buildMasterArticulationTip(word: string): string {
  const lower = word.toLowerCase();
  if (lower.includes('ü')) {
    return 'Posisikan lidah di depan seperti vokal "i", lalu bulatkan kedua bibir maju rapat seperti "u".';
  }
  if (lower.includes('ö')) {
    return 'Jaga lidah pada posisi vokal "e" sambil membulatkan bibir ke depan.';
  }
  if (lower.includes('ch') || lower.endsWith('ig')) {
    return 'Perhatikan posisi ch/-ig: desiskan udara lembut di langit-langit mulut tanpa menjadi bunyi k keras.';
  }
  if (lower.includes('sch') || /s[pt]/.test(lower)) {
    return 'Majukan bibir sedikit untuk menghasilkan desis tebal [ʃ] ("sy").';
  }
  return 'Beri tekanan jelas pada suku kata utama dan jaga ketegasan konsonan akhir.';
}

export const MASTER_LEXICON_VOCABULARY: VocabItem[] = MASTER_LEXICON_ROWS.map(
  (row, idx) => {
    const [
      word,
      article,
      plural,
      syllableStr,
      meaningId,
      category,
      level,
      exampleDe,
      exampleId,
    ] = row;
    const syllables = syllableStr
      .split('·')
      .map((s) => s.trim())
      .filter(Boolean);

    return {
      id: `mst-voc-${idx + 1}`,
      word,
      article,
      plural,
      ipa: generateGermanIpa(word),
      syllables: syllables.length > 0 ? syllables : [word],
      meaningId,
      category,
      level,
      exampleDe,
      exampleId,
      phoneticFocus: buildMasterPhoneticFocus(word, syllables),
      articulationTip: buildMasterArticulationTip(word),
      mouthShape: detectMasterMouthShape(word),
      srsBox: ((idx % 4) + 1) as 1 | 2 | 3 | 4,
      nextReviewLabel:
        idx % 4 === 0
          ? 'Hari Ini'
          : idx % 4 === 1
          ? 'Besok (1 Hari)'
          : idx % 4 === 2
          ? '3 Hari'
          : '7 Hari',
      mastered: idx % 8 === 0,
      reviewCount: (idx % 3) + 1,
      lastAccuracy: 85 + (idx % 12),
    };
  }
);
