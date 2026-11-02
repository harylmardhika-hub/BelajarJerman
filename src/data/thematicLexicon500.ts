import {
  CefrLevel,
  GermanArticle,
  MouthShapeType,
  VocabCategory,
  VocabItem,
} from '../types';
import { generateGermanIpa } from '../utils/germanRules';

type RawThematicRow = [
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

const THEMATIC_500_ROWS: RawThematicRow[] = [
  // ============================================================================
  // BULAN, ANGKA, UKURAN & ARAH MATA ANGIN (A1–A2)
  // ============================================================================
  ['Januar', 'der', 'die Januare', 'Ja·nu·ar', 'Bulan Januari', 'Waktu, Angka & Alam', 'A1', 'Im Januar ist es in Mitteleuropa meistens am kältesten.', 'Pada bulan Januari cuaca di Eropa Tengah biasanya paling dingin.'],
  ['Februar', 'der', 'die Februare', 'Fe·bru·ar', 'Bulan Februari', 'Waktu, Angka & Alam', 'A1', 'Der Monat Februar hat achtundzwanzig oder neunundzwanzig Tage.', 'Bulan Februari memiliki dua puluh delapan atau dua puluh sembilan hari.'],
  ['März', 'der', 'die Märze', 'März', 'Bulan Maret', 'Waktu, Angka & Alam', 'A1', 'Ende März beginnt auf der Nordhalbkugel der astronomische Frühling.', 'Pada akhir Maret musim semi astronomis dimulai di belahan bumi utara.'],
  ['April', 'der', 'die Aprile', 'A·pril', 'Bulan April', 'Waktu, Angka & Alam', 'A1', 'Im April wechselt das Wetter oft schnell zwischen Sonne und Regen.', 'Pada bulan April cuaca sering berganti cepat antara cerah dan hujan.'],
  ['Mai', 'der', 'die Maie', 'Mai', 'Bulan Mei', 'Waktu, Angka & Alam', 'A1', 'Im Monat Mai blühen überall in den Gärten die Obstbäume.', 'Pada bulan Mei pohon-pohon buah berbunga di seluruh taman.'],
  ['Juni', 'der', 'die Junis', 'Ju·ni', 'Bulan Juni', 'Waktu, Angka & Alam', 'A1', 'Am einundzwanzigsten Juni ist der längste Tag des Jahres.', 'Tanggal dua puluh satu Juni adalah hari terpanjang dalam setahun.'],
  ['Juli', 'der', 'die Julis', 'Ju·li', 'Bulan Juli', 'Waktu, Angka & Alam', 'A1', 'Im Juli beginnen in vielen Bundesländern die großen Sommerferien.', 'Pada bulan Juli liburan musim panas panjang dimulai di banyak negara bagian.'],
  ['August', 'der', 'die Auguste', 'Au·gust', 'Bulan Agustus', 'Waktu, Angka & Alam', 'A1', 'Am siebzehnten August feiert Indonesien seinen Unabhängigkeitstag.', 'Pada tanggal tujuh belas Agustus Indonesia merayakan hari kemerdekaannya.'],
  ['September', 'der', 'die September', 'Sep·tem·ber', 'Bulan September', 'Waktu, Angka & Alam', 'A1', 'Im September fängt an vielen Schulen das neue Schuljahr an.', 'Pada bulan September tahun ajaran baru dimulai di banyak sekolah.'],
  ['Oktober', 'der', 'die Oktober', 'Ok·to·ber', 'Bulan Oktober', 'Waktu, Angka & Alam', 'A1', 'Im Oktober beginnt an den deutschen Universitäten das Wintersemester.', 'Pada bulan Oktober semester musim dingin dimulai di universitas-universitas Jerman.'],
  ['November', 'der', 'die November', 'No·vem·ber', 'Bulan November', 'Waktu, Angka & Alam', 'A1', 'Im November sind die Abende oft neblig, kühl und früh dunkel.', 'Pada bulan November sore dan malam hari sering berkabut, sejuk, dan cepat gelap.'],
  ['Dezember', 'der', 'die Dezember', 'De·zem·ber', 'Bulan Desember', 'Waktu, Angka & Alam', 'A1', 'Im Dezember leuchten in den Innenstädten festliche Weihnachtsmärkte.', 'Pada bulan Desember pasar-pasar Natal yang meriah bersinar di pusat kota.'],
  ['Norden', 'der', '— (Singularetantum)', 'Nor·den', 'Utara', 'Waktu, Angka & Alam', 'A1', 'Hamburg und Bremen liegen im hohen Norden Deutschlands.', 'Hamburg dan Bremen terletak di bagian utara Jerman.'],
  ['Süden', 'der', '— (Singularetantum)', 'Sü·den', 'Selatan', 'Waktu, Angka & Alam', 'A1', 'München und Stuttgart liegen im Süden der Bundesrepublik.', 'München dan Stuttgart terletak di bagian selatan Republik Federal Jerman.'],
  ['Osten', 'der', '— (Singularetantum)', 'Os·ten', 'Timur', 'Waktu, Angka & Alam', 'A1', 'Die Sonne geht jeden Morgen im Osten auf.', 'Matahari terbit setiap pagi di sebelah timur.'],
  ['Westen', 'der', '— (Singularetantum)', 'Wes·ten', 'Barat', 'Waktu, Angka & Alam', 'A1', 'Am Abend sinkt die Sonne langsam im Westen hinter den Horizont.', 'Pada sore hari matahari perlahan terbenam di sebelah barat di balik cakrawala.'],
  ['Dutzend', 'das', 'die Dutzende', 'Dut·zend', 'Lusin (12 buah)', 'Waktu, Angka & Alam', 'A2', 'Auf dem Bauernmarkt kaufte sie ein ganzes Dutzend frische Landeier.', 'Di pasar petani ia membeli satu lusin penuh telur kampung segar.'],
  ['Hälfte', 'die', 'die Hälften', 'Hälf·te', 'Setengah / Separuh bagian', 'Waktu, Angka & Alam', 'A2', 'Mehr als die Hälfte der Kursteilnehmer spricht bereits drei Sprachen.', 'Lebih dari separuh peserta kursus sudah berbicara tiga bahasa.'],
  ['Drittel', 'das', 'die Drittel', 'Drit·tel', 'Sepertiga bagian', 'Waktu, Angka & Alam', 'B1', 'Rund ein Drittel der Fläche Deutschlands ist mit grünem Wald bedeckt.', 'Sekitar sepertiga wilayah daratan Jerman tertutup hutan hijau.'],
  ['Viertel', 'das', 'die Viertel', 'Vier·tel', 'Seperempat / Distrik kota', 'Waktu, Angka & Alam', 'A2', 'Wir wohnen in einem ruhigen grünen Viertel nahe der Universität.', 'Kami tinggal di sebuah distrik hijau yang tenang di dekat universitas.'],

  // ============================================================================
  // PAKAIAN, WARNA & KEHIDUPAN PRIBADI (A1–B1)
  // ============================================================================
  ['Hemd', 'das', 'die Hemden', 'Hemd', 'Kemeja pria', 'Kehidupan Sehari-hari', 'A1', 'Für das Vorstellungsgespräch bügelte er ein weißes Baumwollhemd.', 'Untuk wawancara kerja ia menyetrika sehelai kemeja katun putih.'],
  ['Bluse', 'die', 'die Blusen', 'Blu·se', 'Blus / Kemeja wanita', 'Kehidupan Sehari-hari', 'A2', 'Sie trägt zum dunklen Kostüm eine elegante hellblaue Bluse.', 'Ia mengenakan blus biru muda yang elegan dipadukan dengan setelan gelap.'],
  ['Hose', 'die', 'die Hosen', 'Ho·se', 'Celana panjang', 'Kehidupan Sehari-hari', 'A1', 'Diese schwarze Hose passt sehr gut zu deinen braunen Schuhen.', 'Celana hitam ini sangat serasi dengan sepatu cokelatmu.'],
  ['Mantel', 'der', 'die Mäntel', 'Man·tel', 'Mantel panjang (Coat)', 'Kehidupan Sehari-hari', 'A1', 'Bitte hängen Sie Ihren nassen Mantel draußen an die Garderobe.', 'Silakan gantungkan mantel basah Anda di gantungan pakaian luar.'],
  ['Pullover', 'der', 'die Pullover', 'Pul·lo·ver', 'Sweter rajut hangat', 'Kehidupan Sehari-hari', 'A1', 'Im Herbst trage ich gern einen warmen Pullover aus weicher Wolle.', 'Di musim gugur saya senang memakai sweter hangat dari wol lembut.'],
  ['Schal', 'der', 'die Schals', 'Schal', 'Syal leher', 'Kehidupan Sehari-hari', 'A1', 'Ein gestrickter Schal schützt den Hals vor kaltem Ostwind.', 'Syal rajut melindungi leher dari angin timur yang dingin.'],
  ['Mütze', 'die', 'die Mützen', 'Müt·ze', 'Topi kupluk musim dingin', 'Kehidupan Sehari-hari', 'A1', 'Zieh den Kindern draußen bitte eine warme Mütze über die Ohren.', 'Tolong pakaikan topi kupluk hangat menutupi telinga anak-anak saat di luar.'],
  ['Stiefel', 'der', 'die Stiefel', 'Stie·fel', 'Sepatu bot', 'Kehidupan Sehari-hari', 'A2', 'Bei hohem Schnee sind wasserdichte Winterstiefel besonders praktisch.', 'Saat salju tebal, sepatu bot musim dingin tahan air sangatlah praktis.'],
  ['Turnschuh', 'der', 'die Turnschuhe', 'Turn·schuh', 'Sepatu olahraga / Sneakers', 'Kehidupan Sehari-hari', 'A2', 'Für den langen Stadtrundgang ziehe ich bequeme Turnschuhe an.', 'Untuk tur keliling kota yang panjang saya mengenakan sepatu olahraga yang nyaman.'],
  ['Reißverschluss', 'der', 'die Reißverschlüsse', 'Reiß·ver·schluss', 'Ritsleting', 'Kehidupan Sehari-hari', 'B1', 'Der Schneider tauschte den kaputten Reißverschluss an der Jacke schnell aus.', 'Penjahit itu mengganti ritsleting yang rusak pada jaket dengan cepat.'],
  ['Kragen', 'der', 'die Kragen', 'Kra·gen', 'Kerah baju', 'Kehidupan Sehari-hari', 'B1', 'Bei starkem Wind klappte er den hohen Kragen seines Mantels hoch.', 'Saat angin kencang ia menegakkan kerah tinggi mantelnya.'],
  ['Ärmel', 'der', 'die Ärmel', 'Är·mel', 'Lengan baju', 'Kehidupan Sehari-hari', 'A2', 'Beim Kochen krempelte er sich die langen Ärmel seines Hemdes hoch.', 'Saat memasak ia menggulung lengan panjang kemejanya.'],
  ['Taschentuch', 'das', 'die Taschentücher', 'Ta·schen·tuch', 'Sapu tangan / Tisu saku', 'Kehidupan Sehari-hari', 'A2', 'Hast du vielleicht ein sauberes Papiertaschentuch für mich?', 'Apakah kamu mungkin punya selembar tisu saku bersih untukku?'],
  ['Schmuck', 'der', '— (Singularetantum)', 'Schmuck', 'Perhiasan', 'Kehidupan Sehari-hari', 'A2', 'Zu besonderen Festen trägt sie traditionellen silbernen Schmuck.', 'Pada acara perayaan khusus ia mengenakan perhiasan perak tradisional.'],
  ['Gürtel', 'der', 'die Gürtel', 'Gür·tel', 'Ikat pinggang / Sabuk', 'Kehidupan Sehari-hari', 'A2', 'Ein schmaler schwarzer Ledergürtel rundet den Anzug klassisch ab.', 'Ikat pinggang kulit hitam yang ramping melengkapi setelan jas secara klasik.'],

  // ============================================================================
  // SENI, MUSIK, MEDIA & BUDAYA JERMAN (A2–C1)
  // ============================================================================
  ['Zeitschrift', 'die', 'die Zeitschriften', 'Zeit·schrift', 'Majalah / Jurnal berkala', 'Kehidupan Sehari-hari', 'A2', 'Im Wartezimmer las ich einen spannenden Artikel in einer wissenschaftlichen Zeitschrift.', 'Di ruang tunggu saya membaca artikel menarik di sebuah majalah ilmiah.'],
  ['Tageszeitung', 'die', 'die Tageszeitungen', 'Ta·ges·zei·tung', 'Surat kabar harian', 'Kehidupan Sehari-hari', 'A2', 'Viele Menschen lesen morgens beim Frühstück die digitale Tageszeitung.', 'Banyak orang membaca surat kabar harian digital saat sarapan pagi.'],
  ['Nachrichtensendung', 'die', 'die Nachrichtensendungen', 'Nach·rich·ten·sen·dung', 'Siaran berita televisi/radio', 'Kehidupan Sehari-hari', 'B1', 'Die bekannteste deutsche Nachrichtensendung beginnt jeden Abend um zwanzig Uhr.', 'Siaran berita Jerman paling terkenal dimulai setiap malam pukul dua puluh tepat.'],
  ['Hörbuch', 'das', 'die Hörbücher', 'Hör·buch', 'Buku audio (Audiobook)', 'Kerja & Studi', 'A2', 'Auf langen Zugfahrten höre ich gern deutsche Hörbücher zur Ausspracheübung.', 'Dalam perjalanan kereta jarak jauh saya senang mendengarkan buku audio Jerman untuk melatih pengucapan.'],
  ['Wörterbucheintrag', 'der', 'die Wörterbucheinträge', 'Wör·ter·buch·ein·trag', 'Entri kamus', 'Kerja & Studi', 'B1', 'Jeder gute Wörterbucheintrag gibt neben der Bedeutung auch die Lautschrift an.', 'Setiap entri kamus yang baik mencantumkan transkripsi fonetik di samping artinya.'],
  ['Lautschrift', 'die', 'die Lautschriften', 'Laut·schrift', 'Transkripsi fonetik (IPA)', 'Kerja & Studi', 'B1', 'Die internationale Lautschrift zeigt exakt, wie ein fremdes Wort ausgesprochen wird.', 'Transkripsi fonetik internasional menunjukkan secara presisi bagaimana kata asing diucapkan.'],
  ['Aufführung', 'die', 'die Aufführungen', 'Auf·füh·rung', 'Pertunjukan / Pementasan teater', 'Kehidupan Sehari-hari', 'B1', 'Nach der großartigen Theateraufführung applaudierte das Publikum minutenlang.', 'Setelah pementasan teater yang luar biasa, penonton bertepuk tangan selama beberapa menit.'],
  ['Orchester', 'das', 'die Orchester', 'Or·ches·ter', 'Orkestra musik', 'Kehidupan Sehari-hari', 'A2', 'Das Berliner Philharmonische Orchester genießt weltweiten Ruf.', 'Orkestra Filharmoni Berlin memiliki reputasi kelas dunia.'],
  ['Bühne', 'die', 'die Bühnen', 'Büh·ne', 'Panggung pertunjukan', 'Kehidupan Sehari-hari', 'A2', 'Die Schauspieler sprachen auf der großen Bühne mit deutlicher Artikulation.', 'Para aktor berbicara di atas panggung besar dengan artikulasi yang jelas.'],
  ['Gemälde', 'das', 'die Gemälde', 'Ge·mäl·de', 'Lukisan', 'Kehidupan Sehari-hari', 'B1', 'Dieses berühmte Ölgemälde hängt heute in der Alten Nationalgalerie.', 'Lukisan cat minyak terkenal ini kini terpajang di Galeri Nasional Tua.'],
  ['Denkmal', 'das', 'die Denkmäler', 'Denk·mal', 'Monumen bersejarah / Cagar budaya', 'Perjalanan & Kota', 'B1', 'Das historische Gebäude im Stadtzentrum steht unter strengem Denkmalschutz.', 'Gedung bersejarah di pusat kota itu berada di bawah perlindungan cagar budaya yang ketat.'],
  ['Sehenswürdigkeiten', 'die', 'die Sehenswürdigkeiten (Jamak)', 'Se·hens·wür·dig·kei·ten', 'Tempat-tempat wisata terkenal', 'Perjalanan & Kota', 'A2', 'Bei einer Stadtrundfahrt sieht man die wichtigsten Sehenswürdigkeiten an einem Vormittag.', 'Dalam tur keliling kota, kita dapat melihat tempat-tempat wisata terpenting dalam satu pagi.'],
  ['Gastfreundschaft', 'die', '— (Singularetantum)', 'Gast·freund·schaft', 'Keramahtamahan dalam menjamu tamu', 'Salam & Komunikasi', 'B1', 'Indonesien ist auf der ganzen Welt für seine herzliche Gastfreundschaft bekannt.', 'Indonesia dikenal di seluruh dunia karena keramahtamahannya yang tulus.'],
  ['Feierabend', 'der', 'die Feierabende', 'Fei·er·a·bend', 'Waktu istirahat selesai bekerja sore hari', 'Kerja & Studi', 'A2', 'Nach einem produktiven Tag im Labor wünschen wir allen einen schönen Feierabend!', 'Setelah hari yang produktif di laboratorium, kami mengucapkan selamat beristirahat sore bagi semuanya!'],
  ['Wochenende', 'das', 'die Wochenenden', 'Wo·chen·en·de', 'Akhir pekan', 'Waktu, Angka & Alam', 'A1', 'Ich wünsche Ihnen ein erholsames und sonniges Wochenende!', 'Saya mengucapkan selamat menikmati akhir pekan yang santai dan cerah untuk Anda!'],

  // ============================================================================
  // TATA BAHASA, LINGUISTIK & KOMUNIKASI ILMIAH (B1–C1)
  // ============================================================================
  ['Hauptwort', 'das', 'die Hauptwörter', 'Haupt·wort', 'Kata benda (Substantiv / Nomina)', 'Kerja & Studi', 'A2', 'Im Deutschen wird jedes Hauptwort am Anfang mit einem Großbuchstaben geschrieben.', 'Dalam bahasa Jerman setiap kata benda selalu diawali dengan huruf kapital.'],
  ['Zeitwort', 'das', 'die Zeitwörter', 'Zeit·wort', 'Kata kerja (Verba)', 'Kerja & Studi', 'A2', 'Im deutschen Hauptsatz steht das konjugierte Zeitwort immer an zweiter Stelle.', 'Dalam kalimat utama bahasa Jerman, kata kerja terkonjugasi selalu berada di posisi kedua.'],
  ['Eigenschaftswort', 'das', 'die Eigenschaftswörter', 'Ei·gen·schafts·wort', 'Kata sifat (Adjektiva)', 'Kerja & Studi', 'A2', 'Vor einem Nomen erhält das Eigenschaftswort eine passende Kasusendung.', 'Di depan kata benda, kata sifat mendapatkan akhiran kasus yang sesuai.'],
  ['Fürwort', 'das', 'die Fürwörter', 'Für·wort', 'Kata ganti (Pronomina)', 'Kerja & Studi', 'B1', 'Nach bestimmten Präpositionen steht das persönliche Fürwort im Dativ.', 'Sesudah preposisi tertentu, kata ganti orang berada dalam kasus Dativ.'],
  ['Verhältniswort', 'das', 'die Verhältniswörter', 'Ver·hält·nis·wort', 'Kata depan (Preposisi)', 'Kerja & Studi', 'B1', 'Jedes deutsche Verhältniswort verlangt einen bestimmten grammatischen Fall.', 'Setiap kata depan bahasa Jerman menuntut kasus tata bahasa tertentu.'],
  ['Einzahl', 'die', '— (Singularetantum)', 'Ein·zahl', 'Bentuk tunggal (Singular)', 'Kerja & Studi', 'A2', 'In der Einzahl unterscheiden sich die drei Artikel der, die und das deutlich.', 'Pada bentuk tunggal, ketiga artikel der, die, dan das berbeda secara jelas.'],
  ['Mehrzahl', 'die', '— (Singularetantum)', 'Mehr·zahl', 'Bentuk jamak (Plural)', 'Kerja & Studi', 'A2', 'In der Mehrzahl lautet der bestimmte Artikel im Nominativ für alle Nomen „die“.', 'Pada bentuk jamak, artikel tentu Nominativ untuk semua kata benda adalah "die".'],
  ['Hauptsatz', 'der', 'die Hauptsätze', 'Haupt·satz', 'Induk kalimat (Kalimat utama)', 'Kerja & Studi', 'B1', 'Ein selbstständiger Hauptsatz kann im Text auch allein stehen.', 'Induk kalimat yang mandiri dapat berdiri sendiri di dalam teks.'],
  ['Nebensatz', 'der', 'die Nebensätze', 'Ne·ben·satz', 'Anak kalimat (Kalimat subordinatif)', 'Kerja & Studi', 'B1', 'In einem deutschen Nebensatz wandert das konjugierte Verb ganz ans Satzende.', 'Dalam anak kalimat bahasa Jerman, kata kerja terkonjugasi berpindah ke paling akhir kalimat.'],
  ['Vergangenheit', 'die', '— (Singularetantum)', 'Ver·gan·gen·heit', 'Bentuk lampau / Masa lalu', 'Waktu, Angka & Alam', 'A2', 'Im gesprochenen Deutsch nutzt man für die Vergangenheit meistens das Perfekt.', 'Dalam bahasa Jerman lisan, bentuk lampau umumnya dinyatakan menggunakan Perfekt.'],
  ['Gegenwart', 'die', '— (Singularetantum)', 'Ge·gen·wart', 'Masa kini / Kala Präsens', 'Waktu, Angka & Alam', 'B1', 'Das Präsens bezeichnet im Deutschen sowohl die Gegenwart als auch oft die Zukunft.', 'Bentuk Präsens dalam bahasa Jerman menyatakan masa kini sekaligus sering digunakan untuk masa depan.'],
  ['Zukunft', 'die', '— (Singularetantum)', 'Zu·kunft', 'Masa depan', 'Waktu, Angka & Alam', 'A2', 'Gute Fremdsprachenkenntnisse sind eine wertvolle Investition in Ihre Zukunft.', 'Kemampuan bahasa asing yang baik adalah investasi berharga untuk masa depan Anda.'],
  ['Redefluss', 'der', '— (Singularetantum)', 'Re·de·fluss', 'Kelancaran berbicara (Fluency)', 'Salam & Komunikasi', 'B2', 'Kurze tägliche Sprechübungen fördern den natürlichen Redefluss.', 'Latihan berbicara singkat setiap hari mendorong kelancaran bicara yang alami.'],
  ['Wortstellung', 'die', 'die Wortstellungen', 'Wort·stel·lung', 'Urutan kata dalam kalimat (Sintaksis)', 'Kerja & Studi', 'B1', 'Die deutsche Wortstellung folgt klaren strukturellen Regeln um das Verb herum.', 'Urutan kata bahasa Jerman mengikuti kaidah struktural yang jelas berpusat pada kata kerja.'],
  ['Silbentrennung', 'die', 'die Silbentrennungen', 'Sil·ben·tren·nung', 'Pemenggalan suku kata', 'Kerja & Studi', 'B1', 'Die sichtbare Silbentrennung hilft beim richtigen Betonen langer Komposita.', 'Pemenggalan suku kata yang terlihat jelas membantu penekanan kata majemuk panjang secara tepat.'],

  // ============================================================================
  // EKONOMI, TEKNOLOGI, HUKUM & AKADEMIK TINGKAT LANJUT (B2–C1)
  // ============================================================================
  ['Volkswirtschaft', 'die', 'die Volkswirtschaften', 'Volks·wirt·schaft', 'Ekonomi makro / Perekonomian nasional', 'Akademik, Bisnis & C1', 'B2', 'Deutschland besitzt die größte Volkswirtschaft innerhalb der Europäischen Union.', 'Jerman memiliki perekonomian nasional terbesar di dalam Uni Eropa.'],
  ['Betriebswirtschaft', 'die', '— (Singularetantum)', 'Be·triebs·wirt·schaft', 'Manajemen bisnis / Administrasi niaga', 'Akademik, Bisnis & C1', 'B2', 'Viele internationale Studierende wählen das Fach Betriebswirtschaft.', 'Banyak mahasiswa internasional memilih jurusan Manajemen Bisnis.'],
  ['Marktwirtschaft', 'die', 'die Marktwirtschaften', 'Markt·wirt·schaft', 'Ekonomi pasar', 'Akademik, Bisnis & C1', 'B2', 'Die soziale Marktwirtschaft verbindet freien Wettbewerb mit sozialer Absicherung.', 'Ekonomi pasar sosial memadukan persaingan bebas dengan jaminan sosial.'],
  ['Nachfrageanstieg', 'der', 'die Nachfrageanstiege', 'Nach·fra·ge·an·stieg', 'Lonjakan permintaan pasar', 'Akademik, Bisnis & C1', 'C1', 'Im Bereich erneuerbarer Technologien verzeichnet die Branche einen starken Nachfrageanstieg.', 'Di bidang teknologi terbarukan, industri mencatat lonjakan permintaan yang kuat.'],
  ['Versorgungssicherheit', 'die', '— (Singularetantum)', 'Ver·sor·gungs·si·cher·heit', 'Ketahanan pasokan (energi/pangan)', 'Akademik, Bisnis & C1', 'C1', 'Moderne Speichersysteme gewährleisten langfristig die regionale Versorgungssicherheit.', 'Sistem penyimpanan modern menjamin ketahanan pasokan regional dalam jangka panjang.'],
  ['Forschungsinstitut', 'das', 'die Forschungsinstitute', 'For·schungs·in·sti·tut', 'Lembaga riset ilmiah', 'Akademik, Bisnis & C1', 'B2', 'Das Max-Planck-Forschungsinstitut genießt weltweit höchstes wissenschaftliches Ansehen.', 'Lembaga riset Max Planck menikmati reputasi ilmiah tertinggi di seluruh dunia.'],
  ['Versuchsaufbau', 'der', 'die Versuchsaufbauten', 'Ver·suchs·auf·bau', 'Rangkaian percobaan laboratorium', 'Akademik, Bisnis & C1', 'C1', 'Der gesamte Versuchsaufbau wurde im Labor zweimal unabhängig überprüft.', 'Seluruh rangkaian percobaan telah diperiksa dua kali secara independen di laboratorium.'],
  ['Messergebnis', 'das', 'die Messergebnisse', 'Mess·er·geb·nis', 'Hasil pengukuran', 'Akademik, Bisnis & C1', 'B2', 'Alle Messergebnisse werden automatisch in einer grafischen Übersicht dargestellt.', 'Semua hasil pengukuran ditampilkan secara otomatis dalam ringkasan grafik.'],
  ['Genauigkeit', 'die', '— (Singularetantum)', 'Ge·nau·ig·keit', 'Ketepatan / Akurasi / Presisi', 'Akademik, Bisnis & C1', 'B2', 'Deutsche Ingenieurskunst ist für ihre hohe technische Genauigkeit bekannt.', 'Keahlian rekayasa teknik Jerman terkenal karena akurasi teknisnya yang tinggi.'],
  ['Zuverlässigkeit', 'die', '— (Singularetantum)', 'Zu·ver·läs·sig·keit', 'Keandalan (Reliability)', 'Akademik, Bisnis & C1', 'B2', 'Pünktlichkeit und Zuverlässigkeit gelten im Berufsleben als wichtige Tugenden.', 'Ketepatan waktu dan keandalan dipandang sebagai nilai utama dalam dunia kerja.'],
  ['Sorgfaltspflicht', 'die', 'die Sorgfaltspflichten', 'Sorg·falts·pflicht', 'Kewajiban kehati-hatian hukum (Due diligence)', 'Akademik, Bisnis & C1', 'C1', 'Unternehmen unterliegen entlang der Lieferkette einer gesetzlichen Sorgfaltspflicht.', 'Perusahaan tunduk pada kewajiban kehati-hatian hukum di sepanjang rantai pasok.'],
  ['Urheberrecht', 'das', 'die Urheberrechte', 'Ur·he·ber·recht', 'Hak cipta (Copyright)', 'Akademik, Bisnis & C1', 'B2', 'Wissenschaftliche Publikationen und Kunstwerke sind durch das Urheberrecht geschützt.', 'Publikasi ilmiah dan karya seni dilindungi oleh undang-undang hak cipta.'],
  ['Datenschutz', 'der', '— (Singularetantum)', 'Da·ten·schutz', 'Perlindungan privasi data', 'Akademik, Bisnis & C1', 'B2', 'Auf strengen Datenschutz wird bei digitalen Anwendungen in Europa besonders geachtet.', 'Perlindungan data yang ketat sangat diperhatikan pada aplikasi digital di Eropa.'],
  ['Künstliche Intelligenz', 'die', '— (Singularetantum)', 'Künst·li·che In·tel·li·genz', 'Kecerdasan buatan', 'Akademik, Bisnis & C1', 'B2', 'Moderne Sprachanalyse verbindet phonetische Regeln mit künstlicher Intelligenz.', 'Analisis suara modern memadukan kaidah fonetik dengan kecerdasan buatan.'],
  ['Digitalisierung', 'die', '— (Singularetantum)', 'Di·gi·ta·li·sie·rung', 'Digitalisasi', 'Akademik, Bisnis & C1', 'B2', 'Die Digitalisierung im Bildungswesen ermöglicht interaktives Lernen an jedem Ort.', 'Digitalisasi di bidang pendidikan memungkinkan pembelajaran interaktif di mana saja.'],
  ['Zukunftsperspektive', 'die', 'die Zukunftsperspektiven', 'Zu·kunfts·per·spek·ti·ve', 'Prospek masa depan', 'Akademik, Bisnis & C1', 'B2', 'Ein zweisprachiges Studium eröffnet hervorragende berufliche Zukunftsperspektiven.', 'Studi dwibahasa membuka prospek karier masa depan yang sangat cemerlang.'],
  ['Entscheidungsfindung', 'die', 'die Entscheidungsfindungen', 'Ent·schei·dungs·fin·dung', 'Proses pengambilan keputusan', 'Akademik, Bisnis & C1', 'C1', 'Transparente Daten erleichtern die sachliche Entscheidungsfindung im Gremium.', 'Data yang transparan memudahkan proses pengambilan keputusan yang objektif di dalam komite.'],
  ['Problemlösungskompetenz', 'die', 'die Problemlösungskompetenzen', 'Pro·blem·lö·sungs·kom·pe·tenz', 'Kompetensi pemecahan masalah', 'Akademik, Bisnis & C1', 'C1', 'Analytisches Denken und Problemlösungskompetenz werden im Studium gezielt gefördert.', 'Pemikiran analitis dan kompetensi pemecahan masalah dikembangkan secara terarah dalam perkuliahan.'],
  ['Verhandlungssicherheit', 'die', '— (Singularetantum)', 'Ver·hand·lungs·si·cher·heit', 'Kefasihan tingkat negosiasi profesional', 'Akademik, Bisnis & C1', 'C1', 'Mit dem Niveau C1 erreichen Sie sprachliche Verhandlungssicherheit im Beruf.', 'Dengan level C1 Anda mencapai kefasihan bahasa tingkat negosiasi profesional di dunia kerja.'],
  ['Wissensgesellschaft', 'die', 'die Wissensgesellschaften', 'Wis·sens·ge·sell·schaft', 'Masyarakat berbasis pengetahuan', 'Akademik, Bisnis & C1', 'C1', 'In einer modernen Wissensgesellschaft ist lebenslanges Lernen selbstverständlich.', 'Dalam masyarakat berbasis pengetahuan modern, belajar sepanjang hayat adalah hal yang wajar.'],

  // ============================================================================
  // VERBA HARIAN & AKADEMIK TAMBAHAN (A1–C1)
  // ============================================================================
  ['beantworten', 'none', 'beantwortet · beantwortete · hat beantwortet', 'be·ant·wor·ten', 'Menjawab pertanyaan / surat', 'Verba & Sifat A1', 'A2', 'Die Dozentin beantwortete am Ende der Vorlesung geduldig alle Fragen.', 'Dosen tersebut menjawab seluruh pertanyaan dengan sabar di akhir kuliah.'],
  ['begründen', 'none', 'begründet · begründete · hat begründet', 'be·grün·den', 'Memberikan alasan / mendasari argumen', 'Verba & Sifat A1', 'B1', 'Bitte begründen Sie Ihre eigene Meinung in zwei bis drei vollständigen Sätzen.', 'Silakan berikan alasan atas pendapat Anda dalam dua hingga tiga kalimat lengkap.'],
  ['beschreiben', 'none', 'beschreibt · beschrieb · hat beschrieben', 'be·schrei·ben', 'Mendeskripsikan / Menggambarkan', 'Verba & Sifat A1', 'A2', 'In der mündlichen Prüfung sollen Sie ein Foto genau beschreiben.', 'Dalam ujian lisan Anda diminta mendeskripsikan sebuah foto secara rinci.'],
  ['bestätigen', 'none', 'bestätigt · bestätigte · hat bestätigt', 'be·stä·ti·gen', 'Mengonfirmasi / Membenarkan', 'Verba & Sifat A1', 'B1', 'Bitte bestätigen Sie Ihren reservierten Termin kurz per E-Mail.', 'Mohon konfirmasi jadwal reservasi Anda secara singkat melalui surel.'],
  ['beantragen', 'none', 'beantragt · beantragte · hat beantragt', 'be·an·tra·gen', 'Mengajukan permohonan resmi (visa/beasiswa)', 'Verba & Sifat A1', 'B1', 'Das Studienvisum sollte man mindestens acht Wochen vor der Abreise beantragen.', 'Visa studi sebaiknya diajukan minimal delapan minggu sebelum keberangkatan.'],
  ['vereinbaren', 'none', 'vereinbart · vereinbarte · hat vereinbart', 'ver·ein·ba·ren', 'Menyepakati / Membuat janji temu', 'Verba & Sifat A1', 'B1', 'Wir haben für nächsten Dienstag einen neuen Gesprächstermin vereinbart.', 'Kami telah menyepakati jadwal pertemuan baru untuk hari Selasa depan.'],
  ['teilnehmen an', 'none', 'nimmt teil · nahm teil · hat teilgenommen (+ Dativ)', 'teil·neh·men an', 'Mengikuti / Berpartisipasi dalam (+ Dativ)', 'Verba & Sifat A1', 'A2', 'Viele Studierende nehmen regelmäßig an unserem offenen Aussprachetraining teil.', 'Banyak mahasiswa secara rutin mengikuti pelatihan pengucapan terbuka kami.'],
  ['achten auf', 'none', 'achtet auf · achtete auf · hat geachtet (+ Akkusativ)', 'ach·ten auf', 'Memperhatikan dengan saksama (+ Akkusativ)', 'Verba & Sifat A1', 'A2', 'Achten Sie beim Sprechen besonders auf den Unterschied zwischen sch und ch.', 'Saat berbicara, perhatikan secara khusus perbedaan antara bunyi sch dan ch.'],
  ['sich freuen auf', 'none', 'freut sich · freute sich · hat sich gefreut (+ Akkusativ)', 'sich freu·en auf', 'Menantikan dengan gembira (+ Akkusativ)', 'Verba & Sifat A1', 'A2', 'Wir freuen uns schon sehr auf die gemeinsame Studienreise nach Wien.', 'Kami sudah sangat menantikan perjalanan studi bersama ke Wina.'],
  ['sich beschäftigen mit', 'none', 'beschäftigt sich · beschäftigte sich · hat sich beschäftigt (+ Dativ)', 'sich be·schäf·ti·gen mit', 'Mendalami / Menyibukkan diri dengan (+ Dativ)', 'Verba & Sifat A1', 'B1', 'In diesem Modul beschäftigen wir uns intensiv mit der deutschen Satzmelodie.', 'Dalam modul ini kita mendalami melodi kalimat bahasa Jerman secara intensif.'],
  ['beitragen zu', 'none', 'trägt bei · trug bei · hat beigetragen (+ Dativ)', 'bei·tra·gen zu', 'Berkontribusi terhadap (+ Dativ)', 'Akademik, Bisnis & C1', 'B2', 'Klare Aussprache trägt wesentlich zu einem überzeugenden Auftreten bei.', 'Pengucapan yang jernih berkontribusi besar terhadap penampilan yang meyakinkan.'],
  ['ausgehen von', 'none', 'geht aus · ging aus · ist ausgegangen (+ Dativ)', 'aus·ge·hen von', 'Berangkat dari asumsi / Memperkirakan (+ Dativ)', 'Akademik, Bisnis & C1', 'B2', 'Experten gehen von einem weiteren Wachstum im Bildungssektor aus.', 'Para pakar memperkirakan adanya pertumbuhan lebih lanjut di sektor pendidikan.'],
  ['zurückführen auf', 'none', 'führt zurück · führte zurück · hat zurückgeführt (+ Akkusativ)', 'zu·rück·füh·ren auf', 'Menelusuri penyebab pada (+ Akkusativ)', 'Akademik, Bisnis & C1', 'C1', 'Der rasche Lernerfolg lässt sich auf das strukturierte Wiederholungssystem zurückführen.', 'Keberhasilan belajar yang pesat dapat ditelusuri penyebabnya pada sistem pengulangan yang terstruktur.'],
  ['infrage stellen', 'none', 'stellt infrage · stellte infrage · hat infrage gestellt', 'in·fra·ge stel·len', 'Mempertanyakan keabsahan / Menggugat argumen', 'Akademik, Bisnis & C1', 'C1', 'Die neue Studie stellt mehrere bisherige Annahmen grundlegend infrage.', 'Studi terbaru ini secara mendasar mempertanyakan beberapa asumsi sebelumnya.'],
  ['zum Ausdruck bringen', 'none', 'bringt zum Ausdruck · brachte zum Ausdruck · hat zum Ausdruck gebracht', 'zum Aus·druck brin·gen', 'Mengungkapkan secara formal (Funktionsverbgefüge)', 'Akademik, Bisnis & C1', 'C1', 'In seiner Rede brachte der Direktor seinen Dank an das gesamte Team zum Ausdruck.', 'Dalam pidatonya, direktur mengungkapkan rasa terima kasihnya kepada seluruh tim.'],
];

function detectThematicMouthShape(word: string): MouthShapeType {
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

function buildThematicPhoneticFocus(word: string, syllables: string[]): string {
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

function buildThematicArticulationTip(word: string): string {
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

export const THEMATIC_500_VOCABULARY: VocabItem[] = THEMATIC_500_ROWS.map(
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
      id: `thm-voc-${idx + 1}`,
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
      phoneticFocus: buildThematicPhoneticFocus(word, syllables),
      articulationTip: buildThematicArticulationTip(word),
      mouthShape: detectThematicMouthShape(word),
      srsBox: ((idx % 4) + 1) as 1 | 2 | 3 | 4,
      nextReviewLabel:
        idx % 4 === 0
          ? 'Hari Ini'
          : idx % 4 === 1
          ? 'Besok (1 Hari)'
          : idx % 4 === 2
          ? '3 Hari'
          : '7 Hari',
      mastered: idx % 9 === 0,
      reviewCount: (idx % 3) + 1,
      lastAccuracy: 85 + (idx % 12),
    };
  }
);
