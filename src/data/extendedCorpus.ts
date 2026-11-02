import {
  CefrLevel,
  GermanArticle,
  MouthShapeType,
  VocabCategory,
  VocabItem,
} from '../types';
import { generateGermanIpa } from '../utils/germanRules';

/**
 * Tuple format for compact high-density lexical entries:
 * [word, article, pluralOrForms, syllablesJoinedByDot, meaningId, category, level, exampleDe, exampleId, customIpa?]
 */
type RawLexicalRow = [
  string,
  GermanArticle,
  string,
  string,
  string,
  VocabCategory,
  CefrLevel,
  string,
  string,
  string?
];

const RAW_EXTENDED_ROWS: RawLexicalRow[] = [
  // ============================================================================
  // 1. SALAM & KOMUNIKASI (A1–B2)
  // ============================================================================
  ['Willkommen', 'none', '— (Ungkapan)', 'Will·kom·men', 'Selamat datang', 'Salam & Komunikasi', 'A1', 'Herzlich willkommen in unserem Sprachstudio in Berlin!', 'Selamat datang dengan hangat di studio bahasa kami di Berlin!', '[vɪlˈkɔmən]'],
  ['Entschuldigung', 'die', 'die Entschuldigungen', 'Ent·schul·di·gung', 'Permisi / Maaf', 'Salam & Komunikasi', 'A1', 'Entschuldigung, können Sie mir bitte den Weg zeigen?', 'Permisi, bisakah Anda menunjukkan jalannya kepada saya?', '[ɛntˈʃʊldɪɡʊŋ]'],
  ['Vorname', 'der', 'die Vornamen', 'Vor·na·me', 'Nama depan', 'Salam & Komunikasi', 'A1', 'Bitte schreiben Sie Ihren Vornamen in dieses Feld.', 'Silakan tulis nama depan Anda di kolom ini.', '[ˈfoːɐ̯ˌnaːmə]'],
  ['Nachname', 'der', 'die Nachnamen', 'Nach·na·me', 'Nama belakang / Marga', 'Salam & Komunikasi', 'A1', 'Wie buchstabiert man Ihren Nachnamen?', 'Bagaimana cara mengeja nama belakang Anda?', '[ˈnaːxˌnaːmə]'],
  ['Herkunft', 'die', 'die Herkünfte', 'Her·kunft', 'Asal-usul / Negara asal', 'Salam & Komunikasi', 'A1', 'Viele Studierende sprechen über ihre kulturelle Herkunft.', 'Banyak mahasiswa berbicara tentang asal-usul budaya mereka.', '[ˈheːɐ̯ˌkʊnft]'],
  ['Muttersprache', 'die', 'die Muttersprachen', 'Mut·ter·spra·che', 'Bahasa ibu', 'Salam & Komunikasi', 'A2', 'Indonesisch ist meine Muttersprache, aber ich lerne Deutsch.', 'Bahasa Indonesia adalah bahasa ibu saya, tetapi saya belajar bahasa Jerman.', '[ˈmʊtɐˌʃpʁaːxə]'],
  ['Fremdsprache', 'die', 'die Fremdsprachen', 'Fremd·spra·che', 'Bahasa asing', 'Salam & Komunikasi', 'A2', 'Jede neue Fremdsprache öffnet ein weiteres Fenster zur Welt.', 'Setiap bahasa asing baru membuka jendela baru ke dunia.', '[ˈfʁɛmtˌʃpʁaːxə]'],
  ['Aussprache', 'die', 'die Aussprachen', 'Aus·spra·che', 'Pelafalan / Pengucapan', 'Salam & Komunikasi', 'A2', 'Eine klare Aussprache erleichtert das Gespräch im Alltag.', 'Pelafalan yang jelas memudahkan percakapan sehari-hari.', '[ˈaʊ̯sˌʃpʁaːxə]'],
  ['Betonung', 'die', 'die Betonungen', 'Be·to·nung', 'Tekanan kata / Intonasi', 'Salam & Komunikasi', 'B1', 'Im Deutschen liegt die Betonung meistens auf der ersten Silbe.', 'Dalam bahasa Jerman, tekanan kata umumnya jatuh pada suku kata pertama.', '[bəˈtoːnʊŋ]'],
  ['Redewendung', 'die', 'die Redewendungen', 'Re·de·wen·dung', 'Ungkapan / Idiom', 'Salam & Komunikasi', 'B1', 'Diese Redewendung hört man in Süddeutschland sehr oft.', 'Ungkapan ini sangat sering terdengar di Jerman bagian selatan.', '[ˈʁeːdəˌvɛndʊŋ]'],
  ['Missverständnis', 'das', 'die Missverständnisse', 'Miss·ver·ständ·nis', 'Kesalahpahaman', 'Salam & Komunikasi', 'B1', 'Durch ein kurzes Gespräch konnten wir das Missverständnis klären.', 'Melalui pembicaraan singkat kami berhasil meluruskan kesalahpahaman tersebut.', '[ˈmɪsfɛɐ̯ˌʃtɛntnɪs]'],
  ['Meinung', 'die', 'die Meinungen', 'Mei·nung', 'Pendapat / Opini', 'Salam & Komunikasi', 'A2', 'Meiner Meinung nach ist tägliches Üben der beste Weg.', 'Menurut pendapat saya, latihan harian adalah cara terbaik.', '[ˈmaɪ̯nʊŋ]'],
  ['Vorschlag', 'der', 'die Vorschläge', 'Vor·schlag', 'Saran / Usulan', 'Salam & Komunikasi', 'A2', 'Hast du einen guten Vorschlag für unser Wochenendprogramm?', 'Apakah kamu punya saran bagus untuk acara akhir pekan kita?', '[ˈfoːɐ̯ˌʃlaːk]'],
  ['Gesprächspartner', 'der', 'die Gesprächspartner', 'Ge·sprächs·part·ner', 'Lawan bicara', 'Salam & Komunikasi', 'B1', 'Ein aufmerksamer Gesprächspartner hört zuerst genau zu.', 'Lawan bicara yang penuh perhatian mendengarkan dengan saksama terlebih dahulu.', '[ɡəˈʃpʁɛːçsˌpaʁtnɐ]'],
  ['Zustimmung', 'die', 'die Zustimmungen', 'Zu·stim·mung', 'Persetujuan', 'Salam & Komunikasi', 'B2', 'Der neue Projektplan fand in der Sitzung breite Zustimmung.', 'Rencana proyek baru tersebut mendapat persetujuan luas dalam rapat.', '[ˈt͡suːˌʃtɪmʊŋ]'],
  ['Einwand', 'der', 'die Einwände', 'Ein·wand', 'Keberatan / Sanggahan', 'Salam & Komunikasi', 'B2', 'Wenn niemand einen Einwand hat, beginnen wir sofort.', 'Jika tidak ada yang mengajukan keberatan, kita mulai sekarang juga.', '[ˈaɪ̯nˌvant]'],
  ['Verständigung', 'die', '— (Singularetantum)', 'Ver·stän·di·gung', 'Komunikasi / Saling pengertian', 'Salam & Komunikasi', 'B2', 'Gute Aussprache dient der reibungslosen Verständigung.', 'Pengucapan yang baik mendukung komunikasi yang lancar.', '[fɛɐ̯ˈʃtɛndɪɡʊŋ]'],
  ['Wortschatz', 'der', 'die Wortschätze', 'Wort·schatz', 'Kosakata / Perbendaharaan kata', 'Salam & Komunikasi', 'A2', 'Mit jedem gelesenen Artikel wächst Ihr aktiver Wortschatz.', 'Dengan setiap artikel yang dibaca, kosakata aktif Anda bertambah.', '[ˈvɔʁtˌʃat͡s]'],
  ['Silbe', 'die', 'die Silben', 'Sil·be', 'Suku kata', 'Salam & Komunikasi', 'A2', 'Sprechen Sie jede einzelne Silbe langsam und deutlich aus.', 'Ucapkan setiap suku kata secara perlahan dan jelas.', '[ˈzɪlbə]'],
  ['Buchstabe', 'der', 'die Buchstaben', 'Buch·sta·be', 'Huruf / Aksara', 'Salam & Komunikasi', 'A1', 'Das scharfe S ist ein besonderer Buchstabe im deutschen Alphabet.', 'S tajam (ß) adalah huruf khusus dalam alfabet Jerman.', '[ˈbuːxˌʃtaːbə]'],
  ['Satzzeichen', 'das', 'die Satzzeichen', 'Satz·zei·chen', 'Tanda baca', 'Salam & Komunikasi', 'B1', 'Im Deutschen steht vor einem Nebensatz immer ein Komma als Satzzeichen.', 'Dalam bahasa Jerman, sebelum anak kalimat selalu ada tanda baca koma.', '[ˈzat͡sˌt͡saɪ̯çn̩]'],
  ['Tonfall', 'der', 'die Tonfälle', 'Ton·fall', 'Nada bicara', 'Salam & Komunikasi', 'B2', 'Ein freundlicher Tonfall wirkt oft überzeugender als laute Worte.', 'Nada bicara yang ramah sering kali lebih meyakinkan daripada kata-kata keras.', '[ˈtoːnˌfal]'],
  ['Nachfrage', 'die', 'die Nachfragen', 'Nach·fra·ge', 'Pertanyaan lanjutan / Permintaan', 'Salam & Komunikasi', 'B1', 'Vielen Dank für Ihre präzise Nachfrage zum Thema Deklination.', 'Terima kasih atas pertanyaan lanjutan Anda yang tajam mengenai deklinasi.', '[ˈnaːxˌfʁaːɡə]'],
  ['Mitteilung', 'die', 'die Mitteilungen', 'Mit·tei·lung', 'Pemberitahuan / Pesan', 'Salam & Komunikasi', 'A2', 'Ich habe Ihnen eine wichtige Mitteilung auf dem Handy hinterlassen.', 'Saya meninggalkan pesan penting untuk Anda di ponsel.', '[ˈmɪtˌtaɪ̯lʊŋ]'],
  ['Verabredung', 'die', 'die Verabredungen', 'Ver·ab·re·dung', 'Janji temu (pribadi)', 'Salam & Komunikasi', 'A2', 'Heute Abend habe ich eine Verabredung mit alten Schulfreunden.', 'Malam ini saya punya janji temu dengan teman-teman sekolah lama.', '[fɛɐ̯ˈʔapˌʁeːdʊŋ]'],
  ['Begrüßung', 'die', 'die Begrüßungen', 'Be·grü·ßung', 'Sapaan / Sambutan', 'Salam & Komunikasi', 'A2', 'Zur Begrüßung gibt man sich in Deutschland oft die Hand.', 'Sebagai sapaan, orang di Jerman sering berjabat tangan.', '[bəˈɡʁyːsʊŋ]'],
  ['Abschied', 'der', 'die Abschiede', 'Ab·schied', 'Perpisahan', 'Salam & Komunikasi', 'A2', 'Beim Abschied am Bahnhof winkten alle noch lange.', 'Saat perpisahan di stasiun, semua orang melambaikan tangan cukup lama.', '[ˈapˌʃiːt]'],
  ['Empfehlung', 'die', 'die Empfehlungen', 'Emp·feh·lung', 'Rekomendasi / Anjuran', 'Salam & Komunikasi', 'B1', 'Auf Empfehlung meines Lehrers höre ich täglich deutsche Nachrichten.', 'Atas rekomendasi guru saya, saya mendengarkan berita Jerman setiap hari.', '[ɛmˈp͡feːlʊŋ]'],
  ['Ratschlag', 'der', 'die Ratschläge', 'Rat·schlag', 'Nasihat / Petuah', 'Salam & Komunikasi', 'B1', 'Dieser praktische Ratschlag hat mir bei der Prüfung sehr geholfen.', 'Nasihat praktis ini sangat membantu saya saat ujian.', '[ˈʁaːtˌʃlaːk]'],
  ['Überzeugung', 'die', 'die Überzeugungen', 'Ü·ber·zeu·gung', 'Keyakinan', 'Salam & Komunikasi', 'B2', 'Sie vertrat ihren Standpunkt mit ruhiger Überzeugung.', 'Ia menyampaikan sudut pandangnya dengan keyakinan yang tenang.', '[yːbɐˈt͡sɔʏ̯ɡʊŋ]'],

  // ============================================================================
  // 2. KELUARGA & RUMAH (A1–B2)
  // ============================================================================
  ['Großmutter', 'die', 'die Großmütter', 'Groß·mut·ter', 'Nenek', 'Keluarga & Rumah', 'A1', 'Meine Großmutter backt am Sonntag den besten Apfelkuchen.', 'Nenek saya memanggang kue apel terbaik pada hari Minggu.', '[ˈɡʁoːsˌmʊtɐ]'],
  ['Großvater', 'der', 'die Großväter', 'Groß·va·ter', 'Kakek', 'Keluarga & Rumah', 'A1', 'Mein Großvater erzählt gern Geschichten aus seiner Jugend.', 'Kakek saya senang menceritakan kisah dari masa mudanya.', '[ˈɡʁoːsˌfaːtɐ]'],
  ['Enkelkind', 'das', 'die Enkelkinder', 'En·kel·kind', 'Cucu', 'Keluarga & Rumah', 'A2', 'Die Großeltern besuchen ihr jüngstes Enkelkind in München.', 'Kakek-nenek mengunjungi cucu bungsu mereka di München.', '[ˈɛŋkl̩ˌkɪnt]'],
  ['Geschwister', 'die', 'die Geschwister (Jamak)', 'Ge·schwis·ter', 'Saudara kandung', 'Keluarga & Rumah', 'A1', 'Ich habe zwei ältere Geschwister: einen Bruder und eine Schwester.', 'Saya punya dua kakak kandung: satu kakak laki-laki dan satu kakak perempuan.', '[ɡəˈʃvɪstɐ]'],
  ['Nachbar', 'der', 'die Nachbarn', 'Nach·bar', 'Tetangga', 'Keluarga & Rumah', 'A1', 'Unser neuer Nachbar kommt ursprünglich aus der Schweiz.', 'Tetangga baru kami berasal dari Swiss.', '[ˈnaxbaːɐ̯]'],
  ['Schlafzimmer', 'das', 'die Schlafzimmer', 'Schlaf·zim·mer', 'Kamar tidur', 'Keluarga & Rumah', 'A1', 'Das Schlafzimmer liegt ruhig zur Gartenseite hin.', 'Kamar tidur itu terletak tenang menghadap ke arah taman.', '[ˈʃlaːfˌt͡sɪmɐ]'],
  ['Wohnzimmer', 'das', 'die Wohnzimmer', 'Wohn·zim·mer', 'Ruang tamu / Ruang keluarga', 'Keluarga & Rumah', 'A1', 'Im Wohnzimmer steht ein großes Bücherregal aus Holz.', 'Di ruang keluarga terdapat rak buku kayu yang besar.', '[ˈvoːnˌt͡sɪmɐ]'],
  ['Badezimmer', 'das', 'die Badezimmer', 'Ba·de·zim·mer', 'Kamar mandi', 'Keluarga & Rumah', 'A1', 'Das Badezimmer wurde im letzten Monat komplett renoviert.', 'Kamar mandi tersebut telah direnovasi total bulan lalu.', '[ˈbaːdəˌt͡sɪmɐ]'],
  ['Erdgeschoss', 'das', 'die Erdgeschosse', 'Erd·ge·schoss', 'Lantai dasar', 'Keluarga & Rumah', 'A2', 'Im Erdgeschoss befindet sich eine kleine Bäckerei.', 'Di lantai dasar terdapat sebuah toko roti kecil.', '[ˈeːɐ̯tɡəˌʃɔs]'],
  ['Dachboden', 'der', 'die Dachböden', 'Dach·bo·den', 'Loteng atas', 'Keluarga & Rumah', 'B1', 'Auf dem Dachboden lagern wir unsere alten Wintermäntel.', 'Di loteng kami menyimpan mantel-mantel musim dingin lama.', '[ˈdaxˌboːdn̩]'],
  ['Keller', 'der', 'die Keller', 'Kel·ler', 'Ruang bawah tanah (Basement)', 'Keluarga & Rumah', 'A2', 'Die Fahrräder stehen trocken und sicher im Keller.', 'Sepeda-sepeda itu tersimpan kering dan aman di ruang bawah tanah.', '[ˈkɛlɐ]'],
  ['Treppenhaus', 'das', 'die Treppenhäuser', 'Trep·pen·haus', 'Ruang tangga gedung', 'Keluarga & Rumah', 'A2', 'Bitte halten Sie das Treppenhaus jederzeit frei von Gegenständen.', 'Mohon jaga ruang tangga agar selalu bebas dari barang-barang.', '[ˈtʁɛpn̩ˌhaʊ̯s]'],
  ['Balkon', 'der', 'die Balkone', 'Bal·kon', 'Balkon', 'Keluarga & Rumah', 'A1', 'Im Sommer frühstücken wir gern draußen auf dem Balkon.', 'Di musim panas kami senang sarapan di luar di atas balkon.', '[balˈkɔŋ]'],
  ['Haustür', 'die', 'die Haustüren', 'Haus·tür', 'Pintu depan rumah', 'Keluarga & Rumah', 'A1', 'Vergiss bitte nicht, abends die Haustür zweimal abzuschließen.', 'Tolong jangan lupa mengunci pintu depan dua kali pada malam hari.', '[ˈhaʊ̯sˌtyːɐ̯]'],
  ['Briefkasten', 'der', 'die Briefkästen', 'Brief·kas·ten', 'Kotak surat', 'Keluarga & Rumah', 'A2', 'Die Postbotin wirft die Zeitung jeden Morgen in den Briefkasten.', 'Petugas pos memasukkan koran ke kotak surat setiap pagi.', '[ˈbʁiːfˌkastn̩]'],
  ['Waschmaschine', 'die', 'die Waschmaschinen', 'Wasch·ma·schi·ne', 'Mesin cuci', 'Keluarga & Rumah', 'A2', 'Die neue Waschmaschine verbraucht sehr wenig Strom und Wasser.', 'Mesin cuci baru itu menggunakan sangat sedikit listrik dan air.', '[ˈvaʃmaˌʃiːnə]'],
  ['Staubsauger', 'der', 'die Staubsauger', 'Staub·sau·ger', 'Penyedot debu', 'Keluarga & Rumah', 'A2', 'Am Samstagvormittag reinigen wir den Teppich mit dem Staubsauger.', 'Pada Sabtu pagi kami membersihkan karpet dengan penyedot debu.', '[ˈʃtaʊ̯pˌzaʊ̯ɡɐ]'],
  ['Spülmaschine', 'die', 'die Spülmaschinen', 'Spül·ma·schi·ne', 'Mesin pencuci piring', 'Keluarga & Rumah', 'A2', 'Kannst du bitte das saubere Geschirr aus der Spülmaschine räumen?', 'Bisakah kamu mengeluarkan piring bersih dari mesin pencuci piring?', '[ˈʃpyːlmaˌʃiːnə]'],
  ['Steckdose', 'die', 'die Steckdosen', 'Steck·do·se', 'Stopkontak listrik', 'Keluarga & Rumah', 'A2', 'In Deutschland haben die Steckdosen eine Spannung von 230 Volt.', 'Di Jerman, stopkontak memiliki tegangan 230 volt.', '[ˈʃtɛkˌdoːzə]'],
  ['Lichtschalter', 'der', 'die Lichtschalter', 'Licht·schal·ter', 'Sakelar lampu', 'Keluarga & Rumah', 'A2', 'Der Lichtschalter befindet sich direkt links neben der Tür.', 'Sakelar lampu berada tepat di sebelah kiri pintu.', '[ˈlɪçtˌʃaltɐ]'],
  ['Kopfkissen', 'das', 'die Kopfkissen', 'Kopf·kis·sen', 'Bantal kepala', 'Keluarga & Rumah', 'A2', 'Ein weiches Kopfkissen sorgt für einen erholsamen Schlaf.', 'Bantal yang empuk memastikan tidur yang nyenyak.', '[ˈkɔp͡fˌkɪsn̩]'],
  ['Bettdecke', 'die', 'die Bettdecken', 'Bett·de·cke', 'Selimut tempat tidur', 'Keluarga & Rumah', 'A2', 'Im Winter brauche ich eine dicke, warme Bettdecke.', 'Di musim dingin saya membutuhkan selimut tebal yang hangat.', '[ˈbɛtˌdɛkə]'],
  ['Vorhang', 'der', 'die Vorhänge', 'Vor·hang', 'Tirai / Gorden', 'Keluarga & Rumah', 'A2', 'Zieh bitte den Vorhang zu, damit die Sonne nicht blendet.', 'Tolong tutup tirainya agar sinar matahari tidak menyilaukan.', '[ˈfoːɐ̯ˌhaŋ]'],
  ['Teppich', 'der', 'die Teppiche', 'Tep·pich', 'Karpet / Permadani', 'Keluarga & Rumah', 'A2', 'Auf dem Holzboden liegt ein handgewebter roter Teppich.', 'Di atas lantai kayu terhampar karpet merah tenunan tangan.', '[ˈtɛpɪç]'],
  ['Kleiderschrank', 'der', 'die Kleiderschränke', 'Klei·der·schrank', 'Lemari pakaian', 'Keluarga & Rumah', 'A1', 'Alle gebügelten Hemden hängen ordentlich im Kleiderschrank.', 'Semua kemeja yang sudah disetrika tergantung rapi di lemari pakaian.', '[ˈklaɪ̯dɐˌʃʁaŋk]'],
  ['Schreibtisch', 'der', 'die Schreibtische', 'Schreib·tisch', 'Meja tulis / Meja kerja', 'Keluarga & Rumah', 'A1', 'Mein Schreibtisch steht direkt am großen Fenster.', 'Meja kerja saya terletak tepat di dekat jendela besar.', '[ˈʃʁaɪ̯pˌtɪʃ]'],
  ['Mietvertrag', 'der', 'die Mietverträge', 'Miet·ver·trag', 'Kontrak sewa tempat tinggal', 'Keluarga & Rumah', 'B1', 'Vor der Unterschrift sollte man den Mietvertrag gründlich lesen.', 'Sebelum menandatangani, sebaiknya baca kontrak sewa dengan teliti.', '[ˈmiːtfɛɐ̯ˌtʁaːk]'],
  ['Nebenkosten', 'die', 'die Nebenkosten (Jamak)', 'Ne·ben·kos·ten', 'Biaya utilitas tambahan (air, pemanas, sampah)', 'Keluarga & Rumah', 'B1', 'In dieser Miete sind die Nebenkosten für Heizung bereits enthalten.', 'Dalam biaya sewa ini, biaya utilitas pemanas sudah termasuk.', '[ˈneːbn̩ˌkɔstn̩]'],
  ['Kaution', 'die', 'die Kautionen', 'Kau·ti·on', 'Uang jaminan sewa (Deposit)', 'Keluarga & Rumah', 'B1', 'Nach dem Auszug erhält der Mieter die volle Kaution zurück.', 'Setelah pindah keluar, penyewa menerima kembali uang jaminan secara penuh.', '[kaʊ̯ˈt͡si̯oːn]'],
  ['Hausordnung', 'die', 'die Hausordnungen', 'Haus·ord·nung', 'Tata tertib gedung / rumah', 'Keluarga & Rumah', 'B1', 'Laut Hausordnung gilt ab 22 Uhr im gesamten Gebäude Nachtruhe.', 'Menurut tata tertib gedung, mulai pukul 22.00 berlaku jam tenang malam.', '[ˈhaʊ̯sˌʔɔʁdnʊŋ]'],
  ['Mülltrennung', 'die', '— (Singularetantum)', 'Müll·tren·nung', 'Pemilahan sampah', 'Keluarga & Rumah', 'B1', 'In Deutschland wird auf sorgfältige Mülltrennung großer Wert gelegt.', 'Di Jerman, pemilahan sampah yang cermat sangat diperhatikan.', '[ˈmʏlˌtʁɛnʊŋ]'],
  ['Heizung', 'die', 'die Heizungen', 'Hei·zung', 'Pemanas ruangan', 'Keluarga & Rumah', 'A2', 'Dreh bitte die Heizung etwas höher, es ist draußen kalt.', 'Tolong putar pemanas ruangan sedikit lebih tinggi, di luar dingin.', '[ˈhaɪ̯t͡sʊŋ]'],
  ['Umzug', 'der', 'die Umzüge', 'Um·zug', 'Pindahan rumah', 'Keluarga & Rumah', 'A2', 'Beim Umzug in die neue Wohnung haben uns vier Freunde geholfen.', 'Saat pindahan ke apartemen baru, empat teman membantu kami.', '[ˈʊmˌt͡suːk]'],
  ['Einweihungsparty', 'die', 'die Einweihungspartys', 'Ein·wei·hungs·par·ty', 'Acara syukuran rumah baru', 'Keluarga & Rumah', 'B1', 'Am Samstag feiern wir unsere Einweihungsparty mit allen Nachbarn.', 'Hari Sabtu kami merayakan syukuran rumah baru bersama semua tetangga.', '[ˈaɪ̯nvaɪ̯ʊŋsˌpaːɐ̯ti]'],
  ['Verwandtschaft', 'die', 'die Verwandtschaften', 'Ver·wandt·schaft', 'Kerabat / Sanak saudara', 'Keluarga & Rumah', 'B1', 'Zu Weihnachten kommt die ganze Verwandtschaft bei uns zusammen.', 'Saat Natal, seluruh sanak saudara berkumpul di tempat kami.', '[fɛɐ̯ˈvantʃaft]'],

  // ============================================================================
  // 3. KULINER & KAFE (A1–B2)
  // ============================================================================
  ['Mittagessen', 'das', 'die Mittagessen', 'Mit·tag·es·sen', 'Makan siang', 'Kuliner & Kafe', 'A1', 'In der Pause gehen wir gemeinsam zum Mittagessen in die Mensa.', 'Saat istirahat kami pergi makan siang bersama ke kantin kampus.', '[ˈmɪtaːkˌʔɛsn̩]'],
  ['Abendessen', 'das', 'die Abendessen', 'A·bend·es·sen', 'Makan malam', 'Kuliner & Rumah' as VocabCategory, 'A1', 'Zum Abendessen gibt es heute warme Gemüsesuppe und Brot.', 'Untuk makan malam hari ini ada sup sayur hangat dan roti.', '[ˈaːbn̩tˌʔɛsn̩]'],
  ['Mineralwasser', 'das', 'die Mineralwässer', 'Mi·ne·ral·was·ser', 'Air mineral', 'Kuliner & Kafe', 'A1', 'Möchten Sie Ihr Mineralwasser mit oder ohne Kohlensäure?', 'Apakah Anda ingin air mineral dengan atau tanpa soda?', '[mɪnəˈʁaːlˌvasɐ]'],
  ['Apfelsaft', 'der', 'die Apfelsäfte', 'Ap·fel·saft', 'Jus apel', 'Kuliner & Kafe', 'A1', 'Ein Glas naturtrüber Apfelsaft schmeckt im Sommer besonders frisch.', 'Segelas jus apel murni terasa sangat segar di musim panas.', '[ˈap͡fl̩ˌzaft]'],
  ['Orangensaft', 'der', 'die Orangensäfte', 'O·ran·gen·saft', 'Jus jeruk', 'Kuliner & Kafe', 'A1', 'Zum Frühstück trinke ich gern frisch gepressten Orangensaft.', 'Saat sarapan saya suka minum jus jeruk peras segar.', '[oˈʁɑ̃ːʒn̩ˌzaft]'],
  ['Milchkaffee', 'der', 'die Milchkaffees', 'Milch·kaf·fee', 'Kopi susu', 'Kuliner & Kafe', 'A1', 'Ich bestelle im Café immer einen heißen Milchkaffee ohne Zucker.', 'Di kafe saya selalu memesan kopi susu panas tanpa gula.', '[ˈmɪlçˌkafe]'],
  ['Kräutertee', 'der', 'die Kräutertees', 'Kräu·ter·tee', 'Teh herbal', 'Kuliner & Kafe', 'A2', 'Abends wirkt eine Tasse warmer Kräutertee sehr beruhigend.', 'Pada malam hari secangkir teh herbal hangat terasa sangat menenangkan.', '[ˈkʁɔʏ̯tɐˌteː]'],
  ['Vollkornbrot', 'das', 'die Vollkornbrote', 'Voll·korn·brot', 'Roti gandum utuh', 'Kuliner & Kafe', 'A2', 'Deutsches Vollkornbrot ist reich an wichtigen Ballaststoffen.', 'Roti gandum utuh Jerman kaya akan serat penting.', '[ˈfɔlkɔʁnˌbʁoːt]'],
  ['Butter', 'die', '— (Tak terhitung)', 'But·ter', 'Mentega', 'Kuliner & Kafe', 'A1', 'Ich streiche etwas frische Butter auf das warme Brötchen.', 'Saya mengoleskan sedikit mentega segar di atas roti gulung hangat.', '[ˈbʊtɐ]'],
  ['Honig', 'der', '— (Tak terhitung)', 'Ho·nig', 'Madu', 'Kuliner & Kafe', 'A1', 'Ein Löffel Honig im Tee hilft wunderbar gegen Halsschmerzen.', 'Satu sendok madu di dalam teh sangat membantu meredakan sakit tenggorokan.', '[ˈhoːnɪç]'],
  ['Marmelade', 'die', 'die Marmeladen', 'Mar·me·la·de', 'Selai buah', 'Kuliner & Kafe', 'A1', 'Meine Tante kocht im Juni selbstgemachte Erdbeermarmelade.', 'Bibi saya memasak selai stroberi buatan sendiri pada bulan Juni.', '[maʁməˈlaːdə]'],
  ['Hähnchen', 'das', 'die Hähnchen', 'Hähn·chen', 'Daging ayam', 'Kuliner & Kafe', 'A1', 'Heute gibt es gebratenes Hähnchen mit Reis und Salat.', 'Hari ini ada ayam panggang dengan nasi dan salad.', '[ˈhɛːnçən]'],
  ['Rindfleisch', 'das', '— (Tak terhitung)', 'Rind·fleisch', 'Daging sapi', 'Kuliner & Kafe', 'A2', 'Für die traditionelle Suppe kochen wir frisches Rindfleisch.', 'Untuk sup tradisional kami merebus daging sapi segar.', '[ˈʁɪntˌflaɪ̯ʃ]'],
  ['Lachs', 'der', 'die Lachse', 'Lachs', 'Ikan salmon', 'Kuliner & Kafe', 'A2', 'Gegrillter Lachs mit Zitrone ist mein absolutes Lieblingsgericht.', 'Salmon panggang dengan lemon adalah hidangan favorit mutlak saya.', '[laks]'],
  ['Zwiebel', 'die', 'die Zwiebeln', 'Zwie·bel', 'Bawang bombai / Bawang merah', 'Kuliner & Kafe', 'A1', 'Beim Schneiden der Zwiebel tränen mir immer die Augen.', 'Saat mengiris bawang, mata saya selalu berair.', '[ˈt͡sviːbl̩]'],
  ['Knoblauch', 'der', '— (Tak terhitung)', 'Knob·lauch', 'Bawang putih', 'Kuliner & Kafe', 'A2', 'Eine Zehe frischer Knoblauch gibt der Soße ein kräftiges Aroma.', 'Satu siung bawang putih segar memberi aroma kuat pada saus.', '[ˈknoːpˌlaʊ̯x]'],
  ['Gurke', 'die', 'die Gurken', 'Gur·ke', 'Mentimun', 'Kuliner & Kafe', 'A1', 'Für den Sommersalat schneide ich eine grüne Gurke in Scheiben.', 'Untuk salad musim panas saya memotong mentimun hijau menjadi irisan.', '[ˈɡʊʁkə]'],
  ['Karotte', 'die', 'die Karotten', 'Ka·rot·te', 'Wortel', 'Kuliner & Kafe', 'A1', 'Frische Karotten enthalten viel gesundes Vitamin A.', 'Wortel segar mengandung banyak vitamin A yang sehat.', '[kaˈʁɔtə]'],
  ['Pilz', 'der', 'die Pilze', 'Pilz', 'Jamur', 'Kuliner & Kafe', 'A2', 'Im Herbst sammeln viele Menschen essbare Pilze im Wald.', 'Di musim gugur banyak orang mengumpulkan jamur konsumsi di hutan.', '[pɪlt͡s]'],
  ['Erdbeere', 'die', 'die Erdbeeren', 'Erd·bee·re', 'Stroberi', 'Kuliner & Kafe', 'A1', 'Die roten Erdbeeren vom Wochenmarkt schmecken herrlich süß.', 'Stroberi merah dari pasar mingguan rasanya manis sekali.', '[ˈeːɐ̯tˌbeːʁə]'],
  ['Weintraube', 'die', 'die Weintrauben', 'Wein·trau·be', 'Buah anggur', 'Kuliner & Kafe', 'A2', 'Auf dem Tisch steht eine Schale mit kernlosen grünen Weintrauben.', 'Di atas meja tersedia semangkuk buah anggur hijau tanpa biji.', '[ˈvaɪ̯nˌtʁaʊ̯bə]'],
  ['Zitrone', 'die', 'die Zitronen', 'Zi·tro·ne', 'Jeruk lemon', 'Kuliner & Kafe', 'A1', 'Ein Spritzer Zitrone verleiht dem Fisch eine frische Note.', 'Sedikit perasan lemon memberikan sentuhan segar pada ikan.', '[t͡siˈtʁoːnə]'],
  ['Gewürz', 'das', 'die Gewürze', 'Ge·würz', 'Rempah-rempah / Bumbu', 'Kuliner & Kafe', 'A2', 'Indonesische Gerichte sind weltweit für ihre feinen Gewürze bekannt.', 'Hidangan Indonesia terkenal di seluruh dunia karena rempah-rempahnya yang khas.', '[ɡəˈvʏʁt͡s]'],
  ['Pfeffer', 'der', '— (Tak terhitung)', 'Pfef·fer', 'Lada / Merica', 'Kuliner & Kafe', 'A1', 'Würzen Sie die Suppe am Ende mit etwas Salz und schwarzem Pfeffer.', 'Bumbui sup di akhir dengan sedikit garam dan lada hitam.', '[ˈp͡fɛfɐ]'],
  ['Teller', 'der', 'die Teller', 'Tel·ler', 'Piring', 'Kuliner & Kafe', 'A1', 'Bitte stell die warmen Teller vorsichtig auf den Esstisch.', 'Tolong letakkan piring-piring hangat itu dengan hati-hati di meja makan.', '[ˈtɛlɐ]'],
  ['Tasse', 'die', 'die Tassen', 'Tas·se', 'Cangkir', 'Kuliner & Kafe', 'A1', 'Darf ich Ihnen noch eine Tasse heißen Kaffee einschenken?', 'Bolehkah saya menuangkan secangkir kopi panas lagi untuk Anda?', '[ˈtasə]'],
  ['Gabel', 'die', 'die Gabeln', 'Ga·bel', 'Garpu', 'Kuliner & Kafe', 'A1', 'Links neben dem Teller liegt die Gabel, rechts das Messer.', 'Di sebelah kiri piring terletak garpu, di sebelah kanan pisau.', '[ˈɡaːbl̩]'],
  ['Messer', 'das', 'die Messer', 'Mes·ser', 'Pisau', 'Kuliner & Kafe', 'A1', 'Dieses scharfe Küchenmesser eignet sich perfekt zum Gemüseschneiden.', 'Pisau dapur tajam ini sangat cocok untuk memotong sayuran.', '[ˈmɛsɐ]'],
  ['Löffel', 'der', 'die Löffel', 'Löf·fel', 'Sendok', 'Kuliner & Kafe', 'A1', 'Für die Suppe brauchen wir noch einen großen Löffel.', 'Untuk sup kita masih membutuhkan sebuah sendok besar.', '[ˈlœfl̩]'],
  ['Serviette', 'die', 'die Servietten', 'Ser·vi·et·te', 'Serbet makan', 'Kuliner & Kafe', 'A2', 'Auf jedem Platz liegt eine gefaltete weiße Serviette.', 'Di setiap tempat duduk terdapat selembar serbet putih terlipat.', '[zɛʁˈvi̯ɛtə]'],
  ['Trinkgeld', 'das', 'die Trinkgelder', 'Trink·geld', 'Uang tip pelayan', 'Kuliner & Kafe', 'A2', 'In deutschen Restaurants sind rund zehn Prozent Trinkgeld üblich.', 'Di restoran Jerman, uang tip sekitar sepuluh persen adalah hal lazim.', '[ˈtʁɪŋkˌɡɛlt]'],
  ['Quittung', 'die', 'die Quittungen', 'Quit·tung', 'Kwitansi / Struk bukti bayar', 'Kuliner & Kafe', 'A2', 'Brauchen Sie für das Geschäftsessen eine gedruckte Quittung?', 'Apakah Anda memerlukan kwitansi cetak untuk jamuan makan bisnis ini?', '[ˈkvɪtʊŋ]'],
  ['Zutat', 'die', 'die Zutaten', 'Zu·tat', 'Bahan masakan', 'Kuliner & Kafe', 'A2', 'Alle frischen Zutaten für das Rezept bekommen wir auf dem Markt.', 'Semua bahan segar untuk resep tersebut kita dapatkan di pasar.', '[ˈt͡suːˌtaːt]'],
  ['Geschmack', 'der', 'die Geschmäcker', 'Ge·schmack', 'Rasa / Selera', 'Kuliner & Kafe', 'A2', 'Die Soße hat einen angenehm milden und leicht süßen Geschmack.', 'Saus ini memiliki rasa lembut yang nyaman dan sedikit manis.', '[ɡəˈʃmak]'],
  ['Nachtisch', 'der', 'die Nachtische', 'Nach·tisch', 'Hidangan penutup (Dessert)', 'Kuliner & Kafe', 'A2', 'Als Nachtisch teilen wir uns eine Portion Vanilleeis mit heißen Kirschen.', 'Sebagai hidangan penutup, kita berbagi seporsi es krim vanila dengan ceri hangat.', '[ˈnaːxˌtɪʃ]'],
  ['Beilage', 'die', 'die Beilagen', 'Bei·la·ge', 'Makanan pendamping (Side dish)', 'Kuliner & Kafe', 'B1', 'Möchten Sie als Beilage lieber Bratkartoffeln oder grünen Salat?', 'Apakah Anda lebih suka kentang goreng atau salad hijau sebagai pendamping?', '[ˈbaɪ̯ˌlaːɡə]'],

  // ============================================================================
  // 4. PERJALANAN & KOTA (A1–B2)
  // ============================================================================
  ['Hauptbahnhof', 'der', 'die Hauptbahnhöfe', 'Haupt·bahn·hof', 'Stasiun kereta utama', 'Perjalanan & Kota', 'A1', 'Der Berliner Hauptbahnhof ist einer der größten Bahnhöfe Europas.', 'Stasiun Utama Berlin adalah salah satu stasiun terbesar di Eropa.', '[ˈhaʊ̯ptbaːnˌhoːf]'],
  ['Bahnsteig', 'der', 'die Bahnsteige', 'Bahn·steig', 'Peron kereta', 'Perjalanan & Kota', 'A1', 'Der Schnellzug nach Frankfurt fährt heute von Bahnsteig 7 ab.', 'Kereta cepat menuju Frankfurt hari ini berangkat dari peron 7.', '[ˈbaːnˌʃtaɪ̯k]'],
  ['Gleis', 'das', 'die Gleise', 'Gleis', 'Jalur rel / Peron', 'Perjalanan & Kota', 'A1', 'Bitte beachten Sie die Durchsage am Gleis 4.', 'Mohon perhatikan pengumuman suara di jalur 4.', '[ɡlaɪ̯s]'],
  ['Anschlusszug', 'der', 'die Anschlusszüge', 'An·schluss·zug', 'Kereta lanjutan / transit', 'Perjalanan & Kota', 'A2', 'Wegen der Verspätung haben wir unseren Anschlusszug knapp erreicht.', 'Karena keterlambatan, kami nyaris saja mengejar kereta lanjutan kami.', '[ˈanʃlʊsˌt͡suːk]'],
  ['Verspätung', 'die', 'die Verspätungen', 'Ver·spä·tung', 'Keterlambatan', 'Perjalanan & Kota', 'A1', 'Der Zug aus Köln hat heute leider zehn Minuten Verspätung.', 'Kereta dari Köln sayangnya hari ini mengalami keterlambatan sepuluh menit.', '[fɛɐ̯ˈʃpɛːtʊŋ]'],
  ['Haltestelle', 'die', 'die Haltestellen', 'Hal·te·stel·le', 'Halte bus / trem', 'Perjalanan & Kota', 'A1', 'An der nächsten Haltestelle müssen wir aus dem Bus aussteigen.', 'Di halte berikutnya kita harus turun dari bus.', '[ˈhaltəˌʃtɛlə]'],
  ['Kreuzung', 'die', 'die Kreuzungen', 'Kreu·zung', 'Persimpangan jalan / Perempatan', 'Perjalanan & Kota', 'A2', 'Biegen Sie an der zweiten großen Kreuzung nach links ab.', 'Beloklah ke kiri di persimpangan besar kedua.', '[ˈkʁɔʏ̯t͡sʊŋ]'],
  ['Ampel', 'die', 'die Ampeln', 'Am·pel', 'Lampu lalu lintas', 'Perjalanan & Kota', 'A1', 'Warten Sie bitte, bis die Ampel für Fußgänger auf Grün schaltet.', 'Mohon tunggu sampai lampu lalu lintas pejalan kaki berubah hijau.', '[ˈampl̩]'],
  ['Bürgersteig', 'der', 'die Bürgersteige', 'Bür·ger·steig', 'Trotoar', 'Perjalanan & Kota', 'A2', 'Auf dem Bürgersteig dürfen Radfahrer nicht schnell fahren.', 'Di atas trotoar pengendara sepeda tidak boleh melaju kencang.', '[ˈbʏʁɡɐˌʃtaɪ̯k]'],
  ['Fußgängerzone', 'die', 'die Fußgängerzonen', 'Fuß·gän·ger·zo·ne', 'Kawasan khusus pejalan kaki', 'Perjalanan & Kota', 'A2', 'In der historischen Fußgängerzone gibt es viele gemütliche Cafés.', 'Di kawasan pejalan kaki bersejarah terdapat banyak kafe nyaman.', '[ˈfuːsɡɛŋɐˌt͡soːnə]'],
  ['Rathaus', 'das', 'die Rathäuser', 'Rat·haus', 'Balai kota', 'Perjalanan & Kota', 'A1', 'Vor dem alten Rathaus findet jeden Mittwoch ein Blumenmarkt statt.', 'Di depan balai kota tua diadakan pasar bunga setiap hari Rabu.', '[ˈʁaːtˌhaʊ̯s]'],
  ['Marktplatz', 'der', 'die Marktplätze', 'Markt·platz', 'Alun-alun pasar kota', 'Perjalanan & Kota', 'A1', 'Treffen wir uns um fünfzehn Uhr am Brunnen auf dem Marktplatz.', 'Mari kita bertemu pukul 15.00 di dekat air mancur di alun-alun pasar.', '[ˈmaʁktˌplat͡s]'],
  ['Brücke', 'die', 'die Brücken', 'Brü·cke', 'Jembatan', 'Perjalanan & Kota', 'A1', 'Diese alte Steinbrücke führt direkt über den Rhein.', 'Jembatan batu tua ini membentang langsung melintasi sungai Rhein.', '[ˈbʁʏkə]'],
  ['Schloss', 'das', 'die Schlösser', 'Schloss', 'Istana / Kastel', 'Perjalanan & Kota', 'A1', 'Am Wochenende besichtigen wir ein berühmtes barockes Schloss.', 'Pada akhir pekan kami mengunjungi sebuah istana barok yang terkenal.', '[ʃlɔs]'],
  ['Sehenswürdigkeit', 'die', 'die Sehenswürdigkeiten', 'Se·hens·wür·dig·keit', 'Objek wisata bersejarah', 'Perjalanan & Kota', 'A2', 'Das Brandenburger Tor ist die bekannteste Sehenswürdigkeit Berlins.', 'Gerbang Brandenburg adalah objek wisata paling terkenal di Berlin.', '[ˈzeːənsˌvʏʁdɪçkaɪ̯t]'],
  ['Reisepass', 'der', 'die Reisepässe', 'Rei·se·pass', 'Paspor perjalanan', 'Perjalanan & Kota', 'A1', 'Für den internationalen Flug benötigen Sie einen gültigen Reisepass.', 'Untuk penerbangan internasional Anda memerlukan paspor yang masih berlaku.', '[ˈʁaɪ̯zəˌpas]'],
  ['Bordkarte', 'die', 'die Bordkarten', 'Bord·kar·te', 'Boarding pass pesawat', 'Perjalanan & Kota', 'A2', 'Halten Sie am Ausgang bitte Ihre digitale Bordkarte bereit.', 'Mohon siapkan boarding pass digital Anda di gerbang keberangkatan.', '[ˈbɔʁtˌkaʁtə]'],
  ['Gepäck', 'das', '— (Singularetantum)', 'Ge·päck', 'Bagasi / Barang bawaan', 'Perjalanan & Kota', 'A1', 'Lassen Sie Ihr Gepäck am Flughafen niemals unbeaufsichtigt stehen.', 'Jangan pernah meninggalkan bagasi Anda tanpa pengawasan di bandara.', '[ɡəˈpɛk]'],
  ['Koffer', 'der', 'die Koffer', 'Kof·fer', 'Koper', 'Perjalanan & Kota', 'A1', 'Mein blauer Koffer wiegt genau zwanzig Kilogramm.', 'Koper biru saya beratnya tepat dua puluh kilogram.', '[ˈkɔfɐ]'],
  ['Rucksack', 'der', 'die Rucksäcke', 'Ruck·sack', 'Tas ransel', 'Perjalanan & Kota', 'A1', 'Für die Wanderung in den Alpen packe ich meinen leichten Rucksack.', 'Untuk pendakian di Pegunungan Alpen saya mengemas tas ransel ringan saya.', '[ˈʁʊkˌzak]'],
  ['Unterkunft', 'die', 'die Unterkünfte', 'Un·ter·kunft', 'Penginapan / Akomodasi', 'Perjalanan & Kota', 'A2', 'Wir haben frühzeitig eine ruhige Unterkunft am See gebucht.', 'Kami telah memesan penginapan tenang di tepi danau sejak jauh hari.', '[ˈʊntɐˌkʊnft]'],
  ['Jugendherberge', 'die', 'die Jugendherbergen', 'Ju·gend·her·ber·ge', 'Hostel pemuda', 'Perjalanan & Kota', 'A2', 'In der Jugendherberge lernt man leicht Reisende aus aller Welt kennen.', 'Di hostel pemuda kita mudah berkenalan dengan pelancong dari seluruh dunia.', '[ˈjuːɡn̩tˌhɛʁbɛʁɡə]'],
  ['Rezeption', 'die', 'die Rezeptionen', 'Re·zep·ti·on', 'Resepsionis hotel', 'Perjalanan & Kota', 'A1', 'Den Zimmerschlüssel können Sie jederzeit an der Rezeption abgeben.', 'Kunci kamar dapat Anda titipkan kapan saja di resepsionis.', '[ʁet͡sɛpˈt͡si̯oːn]'],
  ['Stadtplan', 'der', 'die Stadtpläne', 'Stadt·plan', 'Peta kota', 'Perjalanan & Kota', 'A1', 'Auf diesem gedruckten Stadtplan sind alle Museen farbig markiert.', 'Pada peta kota cetak ini semua museum ditandai dengan warna.', '[ˈʃtatˌplaːn]'],
  ['Umleitung', 'die', 'die Umleitungen', 'Um·lei·tung', 'Pengalihan jalan', 'Perjalanan & Kota', 'B1', 'Wegen einer Baustelle müssen wir heute eine kurze Umleitung fahren.', 'Karena adanya proyek jalan, hari ini kita harus melewati pengalihan jalan singkat.', '[ˈʊmˌlaɪ̯tʊŋ]'],
  ['Geschwindigkeitsbegrenzung', 'die', 'die Geschwindigkeitsbegrenzungen', 'Ge·schwin·dig·keits·be·gren·zung', 'Batas kecepatan', 'Perjalanan & Kota', 'B2', 'Innerhalb geschlossener Ortschaften gilt eine Geschwindigkeitsbegrenzung von 50 km/h.', 'Di dalam kawasan pemukiman berlaku batas kecepatan 50 km/jam.', '[ɡəˈʃvɪndɪçkaɪ̯t͡sbəˌɡʁɛnt͡sʊŋ]'],
  ['Verkehrsmittel', 'das', 'die Verkehrsmittel', 'Ver·kehrs·mit·tel', 'Sarana transportasi', 'Perjalanan & Kota', 'A2', 'Öffentliche Verkehrsmittel wie U-Bahn und Bus schonen die Umwelt.', 'Transportasi umum seperti kereta bawah tanah dan bus ramah bagi lingkungan.', '[fɛɐ̯ˈkeːɐ̯sˌmɪtl̩]'],
  ['Monatskarte', 'die', 'die Monatskarten', 'Mo·nats·kar·te', 'Tiket langganan bulanan', 'Perjalanan & Kota', 'A2', 'Für Pendler lohnt sich der Kauf einer günstigen Monatskarte.', 'Bagi komuter, membeli tiket bulanan yang hemat sangat menguntungkan.', '[ˈmoːnat͡sˌkaʁtə]'],
  ['Führerschein', 'der', 'die Führerscheine', 'Füh·rer·schein', 'Surat Izin Mengemudi (SIM)', 'Perjalanan & Kota', 'A2', 'Nach der bestandenen Fahrprüfung erhielt sie endlich ihren Führerschein.', 'Setelah lulus ujian praktik mengemudi, ia akhirnya menerima SIM-nya.', '[ˈfyːʁɐˌʃaɪ̯n]'],
  ['Tankstelle', 'die', 'die Tankstellen', 'Tank·stel·le', 'Stasiun pengisian bahan bakar (SPBU)', 'Perjalanan & Kota', 'A2', 'Vor der langen Fahrt auf der Autobahn halten wir kurz an der Tankstelle.', 'Sebelum perjalanan panjang di jalan tol, kami mampir sebentar di SPBU.', '[ˈtaŋkˌʃtɛlə]'],

  // ============================================================================
  // 5. KEHIDUPAN SEHARI-HARI, KESEHATAN & BELANJA (A1–B2)
  // ============================================================================
  ['Wochenmarkt', 'der', 'die Wochenmärkte', 'Wo·chen·markt', 'Pasar mingguan tradisional', 'Kehidupan Sehari-hari', 'A1', 'Jeden Samstag kaufen wir frisches Obst auf dem Wochenmarkt.', 'Setiap hari Sabtu kami membeli buah segar di pasar mingguan.', '[ˈvɔxn̩ˌmaʁkt]'],
  ['Bäckerei', 'die', 'die Bäckereien', 'Bä·cke·rei', 'Toko roti', 'Kehidupan Sehari-hari', 'A1', 'Vor der Bäckerei duftet es schon früh morgens nach warmem Brot.', 'Di depan toko roti sudah tercium aroma roti hangat sejak pagi buta.', '[bɛkəˈʁaɪ̯]'],
  ['Apotheke', 'die', 'die Apotheken', 'A·po·the·ke', 'Apotek', 'Kehidupan Sehari-hari', 'A1', 'In der Apotheke hole ich das Medikament gegen Husten ab.', 'Di apotek saya mengambil obat pereda batuk.', '[apoˈteːkə]'],
  ['Krankenhaus', 'das', 'die Krankenhäuser', 'Kran·ken·haus', 'Rumah sakit', 'Kehidupan Sehari-hari', 'A1', 'Das städtische Krankenhaus verfügt über eine moderne Notaufnahme.', 'Rumah sakit kota memiliki unit gawat darurat yang modern.', '[ˈkʁaŋkn̩ˌhaʊ̯s]'],
  ['Sprechstunde', 'die', 'die Sprechstunden', 'Sprech·stun·de', 'Jam praktik dokter / konsultasi', 'Kehidupan Sehari-hari', 'A2', 'Die offene Sprechstunde beim Hausarzt beginnt um acht Uhr.', 'Jam praktik terbuka di dokter keluarga dimulai pukul delapan.', '[ˈʃpʁɛçˌʃtʊndə]'],
  ['Krankenkasse', 'die', 'die Krankenkassen', 'Kran·ken·kas·se', 'Asuransi kesehatan', 'Kehidupan Sehari-hari', 'B1', 'In Deutschland ist die Mitgliedschaft in einer Krankenkasse gesetzlich vorgeschrieben.', 'Di Jerman, keanggotaan dalam asuransi kesehatan diwajibkan oleh undang-undang.', '[ˈkʁaŋkn̩ˌkasə]'],
  ['Rezept', 'das', 'die Rezepte', 'Re·zept', 'Resep dokter / Resep masakan', 'Kehidupan Sehari-hari', 'A2', 'Für dieses starke Antibiotikum brauchen Sie ein ärztliches Rezept.', 'Untuk antibiotik kuat ini Anda memerlukan resep dokter.', '[ʁeˈt͡sɛpt]'],
  ['Kopfschmerzen', 'die', 'die Kopfschmerzen (Jamak)', 'Kopf·schmer·zen', 'Sakit kepala', 'Kehidupan Sehari-hari', 'A1', 'Nach acht Stunden am Bildschirm habe ich leichte Kopfschmerzen.', 'Setelah delapan jam di depan layar saya mengalami sakit kepala ringan.', '[ˈkɔp͡fˌʃmɛʁt͡sn̩]'],
  ['Erkältung', 'die', 'die Erkältungen', 'Er·käl·tung', 'Pilek / Masuk angin', 'Kehidupan Sehari-hari', 'A2', 'Bei einer Erkältung helfen viel Ruhe und heißer Ingwertee.', 'Saat pilek, banyak istirahat dan teh jahe hangat sangat membantu.', '[ɛɐ̯ˈkɛltʊŋ]'],
  ['Fieber', 'das', '— (Singularetantum)', 'Fie·ber', 'Demam', 'Kehidupan Sehari-hari', 'A1', 'Das Kind hat hohes Fieber und muss heute im Bett bleiben.', 'Anak itu mengalami demam tinggi dan harus tetap di tempat tidur hari ini.', '[ˈfiːbɐ]'],
  ['Brieftasche', 'die', 'die Brieftaschen', 'Brief·ta·sche', 'Dompet', 'Kehidupan Sehari-hari', 'A2', 'Ich bewahre meinen Ausweis immer sicher in der Brieftasche auf.', 'Saya selalu menyimpan kartu identitas dengan aman di dalam dompet.', '[ˈbʁiːfˌtaʃə]'],
  ['Armbanduhr', 'die', 'die Armbanduhren', 'Arm·band·uhr', 'Jam tangan', 'Kehidupan Sehari-hari', 'A2', 'Diese mechanische Armbanduhr ist ein Erbstück meines Großvaters.', 'Jam tangan mekanis ini adalah warisan dari kakek saya.', '[ˈaʁmbantˌʔuːɐ̯]'],
  ['Regenschirm', 'der', 'die Regenschirme', 'Re·gen·schirm', 'Payung', 'Kehidupan Sehari-hari', 'A1', 'Nimm lieber einen Regenschirm mit, es sieht nach Regen aus.', 'Sebaiknya bawa payung, cuacanya tampak akan turun hujan.', '[ˈʁeːɡn̩ˌʃɪʁm]'],
  ['Sonnenbrille', 'die', 'die Sonnenbrillen', 'Son·nen·bril·le', 'Kacamata hitam', 'Kehidupan Sehari-hari', 'A2', 'Am Strand schützt eine gute Sonnenbrille die Augen vor UV-Strahlen.', 'Di pantai, kacamata hitam yang baik melindungi mata dari sinar UV.', '[ˈzɔnənˌbʁɪlə]'],
  ['Handschuh', 'der', 'die Handschuhe', 'Hand·schuh', 'Sarung tangan', 'Kehidupan Sehari-hari', 'A2', 'Im Januar trage ich beim Radfahren immer gefütterte Handschuhe.', 'Pada bulan Januari saya selalu memakai sarung tangan berlapis saat bersepeda.', '[ˈhantˌʃuː]'],
  ['Winterjacke', 'die', 'die Winterjacken', 'Win·ter·ja·cke', 'Jaket musim dingin', 'Kehidupan Sehari-hari', 'A1', 'Diese wasserdichte Winterjacke hält auch bei starkem Schneefall warm.', 'Jaket musim dingin tahan air ini tetap menghangatkan bahkan saat hujan salju lebat.', '[ˈvɪntɐˌjakə]'],
  ['Kassenbon', 'der', 'die Kassenbons', 'Kas·sen·bon', 'Struk kasir', 'Kehidupan Sehari-hari', 'A2', 'Für einen Umtausch im Geschäft müssen Sie den Kassenbon vorlegen.', 'Untuk menukar barang di toko Anda harus menunjukkan struk kasir.', '[ˈkasn̩ˌbɔŋ]'],
  ['Sonderangebot', 'das', 'die Sonderangebote', 'Son·der·an·ge·bot', 'Promo spesial / Diskon', 'Kehidupan Sehari-hari', 'A2', 'Diese Kaffeemaschine ist diese Woche im Sonderangebot.', 'Mesin kopi ini sedang dalam promo spesial minggu ini.', '[ˈzɔndɐˌʔanɡəboːt]'],
  ['Umkleidekabine', 'die', 'die Umkleidekabinen', 'Um·klei·de·ka·bi·ne', 'Kamar pas pakaian', 'Kehidupan Sehari-hari', 'A2', 'Die Umkleidekabinen befinden sich hinten rechts im Kaufhaus.', 'Kamar pas berada di sebelah kanan belakang di pusat perbelanjaan.', '[ˈʊmklaɪ̯dəkaˌbiːnə]'],
  ['Reinigung', 'die', 'die Reinigungen', 'Rei·ni·gung', 'Binatu kimia (Dry cleaning) / Pembersihan', 'Kehidupan Sehari-hari', 'B1', 'Ich bringe meinen dunklen Anzug vor der Hochzeit in die Reinigung.', 'Saya membawa setelan jas gelap saya ke binatu sebelum acara pernikahan.', '[ˈʁaɪ̯nɪɡʊŋ]'],
  ['Friseur', 'der', 'die Friseure', 'Fri·seur', 'Penata rambut / Salon cukur', 'Kehidupan Sehari-hari', 'A2', 'Ich habe für Freitagnachmittag einen Termin beim Friseur vereinbart.', 'Saya telah membuat janji di penata rambut untuk Jumat sore.', '[fʁiˈzøːɐ̯]'],
  ['Gewohnheit', 'die', 'die Gewohnheiten', 'Ge·wohn·heit', 'Kebiasaan', 'Kehidupan Sehari-hari', 'B1', 'Jeden Morgen zehn Minuten Vokabeln zu wiederholen ist eine gute Gewohnheit.', 'Mengulang kosakata sepuluh menit setiap pagi adalah kebiasaan yang baik.', '[ɡəˈvoːnhaɪ̯t]'],
  ['Freizeit', 'die', '— (Singularetantum)', 'Frei·zeit', 'Waktu luang', 'Kehidupan Sehari-hari', 'A1', 'In meiner Freizeit spiele ich gern Gitarre und fotografiere.', 'Di waktu luang saya senang bermain gitar dan memotret.', '[ˈfʁaɪ̯ˌt͡saɪ̯t]'],
  ['Veranstaltung', 'die', 'die Veranstaltungen', 'Ver·an·stal·tung', 'Acara / Kegiatan', 'Kehidupan Sehari-hari', 'A2', 'Die kulturelle Veranstaltung im Stadtpark zieht viele Besucher an.', 'Acara budaya di taman kota menarik banyak pengunjung.', '[fɛɐ̯ˈʔanʃtaltʊŋ]'],
  ['Ausstellung', 'die', 'die Ausstellungen', 'Aus·stel·lung', 'Pameran', 'Kehidupan Sehari-hari', 'A2', 'Am Sonntag besuchen wir die neue Ausstellung im Kunstmuseum.', 'Hari Minggu kami mengunjungi pameran baru di museum seni.', '[ˈaʊ̯sˌʃtɛlʊŋ]'],

  // ============================================================================
  // 6. KERJA, STUDI & TEKNOLOGI (A1–C1)
  // ============================================================================
  ['Hochschule', 'die', 'die Hochschulen', 'Hoch·schu·le', 'Perguruan tinggi / Institut', 'Kerja & Studi', 'A2', 'An dieser technischen Hochschule studieren rund zwölftausend Menschen.', 'Di perguruan tinggi teknik ini kuliah sekitar dua belas ribu orang.', '[ˈhoːxˌʃuːlə]'],
  ['Vorlesung', 'die', 'die Vorlesungen', 'Vor·le·sung', 'Kuliah umum (Lecture)', 'Kerja & Studi', 'B1', 'Die Vorlesung über deutsche Literatur beginnt pünktlich um zehn Uhr.', 'Kuliah tentang sastra Jerman dimulai tepat pukul sepuluh.', '[ˈfoːɐ̯ˌleːzʊŋ]'],
  ['Studiengang', 'der', 'die Studiengänge', 'Stu·di·en·gang', 'Program studi / Jurusan kuliah', 'Kerja & Studi', 'B1', 'Sie hat sich für den internationalen Studiengang Maschinenbau entschieden.', 'Ia memutuskan memilih program studi internasional Teknik Mesin.', '[ˈʃtuːdi̯ənˌɡaŋ]'],
  ['Stipendium', 'das', 'die Stipendien', 'Sti·pen·di·um', 'Beasiswa', 'Kerja & Studi', 'B1', 'Dank eines Stipendiums konnte er zwei Semester in Heidelberg forschen.', 'Berkat beasiswa, ia dapat meneliti selama dua semester di Heidelberg.', '[ʃtiˈpɛndi̯ʊm]'],
  ['Abschluss', 'der', 'die Abschlüsse', 'Ab·schluss', 'Gelar kelulusan / Ijazah akhir', 'Kerja & Studi', 'B1', 'Ein anerkannter Hochschulabschluss verbessert die Berufschancen erheblich.', 'Gelar perguruan tinggi yang diakui meningkatkan peluang karier secara signifikan.', '[ˈapˌʃlʊs]'],
  ['Lebenslauf', 'der', 'die Lebensläufe', 'Le·bens·lauf', 'Daftar riwayat hidup (CV)', 'Kerja & Studi', 'B1', 'Bitte senden Sie Ihren aktuellen Lebenslauf als PDF-Datei mit.', 'Mohon kirimkan CV terbaru Anda dalam bentuk berkas PDF.', '[ˈleːbn̩sˌlaʊ̯f]'],
  ['Bewerbung', 'die', 'die Bewerbungen', 'Be·wer·bung', 'Lamaran kerja / studi', 'Kerja & Studi', 'B1', 'Ihre schriftliche Bewerbung hat einen sehr positiven Eindruck hinterlassen.', 'Lamaran tertulis Anda meninggalkan kesan yang sangat positif.', '[bəˈvɛʁbʊŋ]'],
  ['Arbeitgeber', 'der', 'die Arbeitgeber', 'Ar·beit·ge·ber', 'Pemberi kerja / Perusahaan', 'Kerja & Studi', 'B1', 'Viele Arbeitgeber bieten heute flexible Arbeitszeiten im Homeoffice an.', 'Banyak perusahaan kini menawarkan jam kerja fleksibel dari rumah.', '[ˈaʁbaɪ̯tˌɡeːbɐ]'],
  ['Arbeitnehmer', 'der', 'die Arbeitnehmer', 'Ar·beit·neh·mer', 'Karyawan / Pekerja', 'Kerja & Studi', 'B1', 'Jeder Arbeitnehmer hat gesetzlichen Anspruch auf bezahlten Erholungsurlaub.', 'Setiap karyawan memiliki hak hukum atas cuti tahunan berbayar.', '[ˈaʁbaɪ̯tˌneːmɐ]'],
  ['Gehalt', 'das', 'die Gehälter', 'Ge·halt', 'Gaji bulanan', 'Kerja & Studi', 'B1', 'Das monatliche Gehalt wird jeweils am Ende des Monats überwiesen.', 'Gaji bulanan ditransfer setiap akhir bulan.', '[ɡəˈhalt]'],
  ['Überstunde', 'die', 'die Überstunden', 'Ü·ber·stun·de', 'Jam lembur', 'Kerja & Studi', 'B1', 'Die geleisteten Überstunden können im nächsten Monat durch Freizeit ausgeglichen werden.', 'Jam lembur yang telah dikerjakan dapat diganti dengan waktu libur bulan depan.', '[ˈyːbɐˌʃtʊndə]'],
  ['Besprechung', 'die', 'die Besprechungen', 'Be·spre·chung', 'Rapat kerja / Briefing', 'Kerja & Studi', 'A2', 'Um vierzehn Uhr haben wir eine kurze Besprechung mit dem Entwicklungsteam.', 'Pukul empat belas kami mengadakan rapat singkat dengan tim pengembang.', '[bəˈʃpʁɛçʊŋ]'],
  ['Tagesordnung', 'die', 'die Tagesordnungen', 'Ta·ges·ord·nung', 'Agenda rapat', 'Kerja & Studi', 'B2', 'Auf der heutigen Tagesordnung stehen drei wichtige Punkte.', 'Pada agenda rapat hari ini terdapat tiga poin penting.', '[ˈtaːɡəsˌʔɔʁdnʊŋ]'],
  ['Abteilung', 'die', 'die Abteilungen', 'Ab·tei·lung', 'Divisi / Departemen', 'Kerja & Studi', 'A2', 'Er leitet seit drei Jahren die Abteilung für Qualitätskontrolle.', 'Ia memimpin divisi pengendalian mutu selama tiga tahun.', '[apˈtaɪ̯lʊŋ]'],
  ['Bildschirm', 'der', 'die Bildschirme', 'Bild·schirm', 'Layar monitor', 'Kerja & Studi', 'A2', 'Stellen Sie den Bildschirm so ein, dass Ihre Augen nicht ermüden.', 'Atur layar monitor sedemikian rupa agar mata Anda tidak cepat lelah.', '[ˈbɪltˌʃɪʁm]'],
  ['Tastatur', 'die', 'die Tastaturen', 'Tas·ta·tur', 'Papan ketik (Keyboard)', 'Kerja & Studi', 'A2', 'Auf einer deutschen Tastatur liegen Z und Y an anderen Plätzen.', 'Pada papan ketik Jerman, huruf Z dan Y berada di posisi yang berbeda.', '[tastaˈtuːɐ̯]'],
  ['Drucker', 'der', 'die Drucker', 'Dru·cker', 'Mesin pencetak (Printer)', 'Kerja & Studi', 'A2', 'Im Büro steht ein gemeinsamer Drucker für alle Mitarbeitenden.', 'Di kantor terdapat satu printer bersama untuk seluruh staf.', '[ˈdʁʊkɐ]'],
  ['Passwort', 'das', 'die Passwörter', 'Pass·wort', 'Kata sandi', 'Kerja & Studi', 'A2', 'Verwenden Sie für Ihr Benutzerkonto ein sicheres Passwort.', 'Gunakan kata sandi yang aman untuk akun pengguna Anda.', '[ˈpasˌvɔʁt]'],
  ['Datenbank', 'die', 'die Datenbanken', 'Da·ten·bank', 'Basis data (Database)', 'Kerja & Studi', 'B1', 'Alle neuen Vokabeln werden sofort in der zentralen Datenbank gespeichert.', 'Semua kosakata baru langsung disimpan di basis data pusat.', '[ˈdaːtn̩ˌbaŋk]'],
  ['Fortschritt', 'der', 'die Fortschritte', 'Fort·schritt', 'Kemajuan / Progres', 'Kerja & Studi', 'B1', 'Durch regelmäßiges Sprechen machen Sie jede Woche spürbare Fortschritte.', 'Melalui latihan bicara rutin, Anda membuat kemajuan nyata setiap minggu.', '[ˈfɔʁtˌʃʁɪt]'],
  ['Herausforderung', 'die', 'die Herausforderungen', 'He·raus·for·de·rung', 'Tantangan', 'Kerja & Studi', 'B1', 'Die deutsche Deklination ist am Anfang eine spannende Herausforderung.', 'Deklinasi bahasa Jerman pada awalnya merupakan tantangan yang menarik.', '[hɛˈʁaʊ̯sˌfɔʁdəʁʊŋ]'],
  ['Lösung', 'die', 'die Lösungen', 'Lö·sung', 'Solusi / Penyelesaian', 'Kerja & Studi', 'A2', 'Gemeinsam haben wir schnell eine praktische Lösung für das Problem gefunden.', 'Bersama-sama kami cepat menemukan solusi praktis untuk masalah tersebut.', '[ˈløːzʊŋ]'],
  ['Abgabefrist', 'die', 'die Abgabefristen', 'Ab·ga·be·frist', 'Tenggat waktu pengumpulan (Deadline)', 'Kerja & Studi', 'B2', 'Die Abgabefrist für die schriftliche Hausarbeit endet am kommenden Freitag.', 'Tenggat waktu pengumpulan makalah tertulis berakhir pada hari Jumat mendatang.', '[ˈapɡaːbəˌfʁɪst]'],
  ['Berufserfahrung', 'die', 'die Berufserfahrungen', 'Be·rufs·er·fah·rung', 'Pengalaman kerja', 'Kerja & Studi', 'B1', 'Für diese leitende Position werden fünf Jahre Berufserfahrung vorausgesetzt.', 'Untuk posisi manajerial ini dipersyaratkan pengalaman kerja lima tahun.', '[bəˈʁuːfsʔɛɐ̯ˌfaːʁʊŋ]'],
  ['Weiterbildung', 'die', 'die Weiterbildungen', 'Wei·ter·bil·dung', 'Pelatihan pengembangan profesi', 'Kerja & Studi', 'B1', 'Das Unternehmen unterstützt die fachliche Weiterbildung seiner Angestellten.', 'Perusahaan mendukung pelatihan pengembangan keahlian para karyawannya.', '[ˈvaɪ̯tɐˌbɪldʊŋ]'],
  ['Werkzeug', 'das', 'die Werkzeuge', 'Werk·zeug', 'Perkakas / Alat kerja', 'Kerja & Studi', 'A2', 'Gutes Werkzeug erleichtert jede handwerkliche Reparatur im Haus.', 'Perkakas yang baik memudahkan setiap perbaikan pertukangan di rumah.', '[ˈvɛʁkˌt͡sɔʏ̯k]'],
  ['Handwerk', 'das', 'die Handwerke', 'Hand·werk', 'Kerajinan / Keahlian teknik kejuruan', 'Kerja & Studi', 'B1', 'Das traditionelle Handwerk genießt in Deutschland ein hohes Ansehen.', 'Keahlian kejuruan tradisional menikmati reputasi tinggi di Jerman.', '[ˈhantˌvɛʁk]'],
  ['Kündigungsfrist', 'die', 'die Kündigungsfristen', 'Kün·di·gungs·frist', 'Masa pemberitahuan pengunduran diri', 'Kerja & Studi', 'B2', 'Die vertragliche Kündigungsfrist beträgt drei Monate zum Quartalsende.', 'Masa pemberitahuan pengunduran diri sesuai kontrak adalah tiga bulan.', '[ˈkʏndɪɡʊŋsˌfʁɪst]'],
  ['Zusammenarbeit', 'die', '— (Singularetantum)', 'Zu·sam·men·ar·beit', 'Kerja sama / Kolaborasi', 'Kerja & Studi', 'B1', 'Wir bedanken uns herzlich für die vertrauensvolle Zusammenarbeit.', 'Kami mengucapkan terima kasih yang tulus atas kerja sama yang penuh kepercayaan.', '[t͡suˈzamənˌʔaʁbaɪ̯t]'],
  ['Verhandlung', 'die', 'die Verhandlungen', 'Ver·hand·lung', 'Negosiasi / Perundingan', 'Kerja & Studi', 'B2', 'Nach langen Verhandlungen unterzeichneten beide Partner den neuen Vertrag.', 'Setelah negosiasi panjang, kedua mitra menandatangani kontrak baru.', '[fɛɐ̯ˈhandlʊŋ]'],

  // ============================================================================
  // 7. WAKTU, ANGKA, CUACA & ALAM (A1–B2)
  // ============================================================================
  ['Augenblick', 'der', 'die Augenblicke', 'Au·gen·blick', 'Sesaat / Sekejap', 'Waktu, Angka & Alam', 'A2', 'Warten Sie bitte einen kleinen Augenblick, ich verbinde Sie sofort.', 'Mohon tunggu sekejap, saya segera menyambungkan Anda.', '[ˈaʊ̯ɡn̩ˌblɪk]'],
  ['Jahrzehnt', 'das', 'die Jahrzehnte', 'Jahr·zehnt', 'Dekade / Dasawarsa (10 tahun)', 'Waktu, Angka & Alam', 'B1', 'Im letzten Jahrzehnt hat sich die Solartechnik rasant weiterentwickelt.', 'Dalam dekade terakhir, teknologi surya berkembang sangat pesat.', '[jaːɐ̯ˈt͡seːnt]'],
  ['Jahrhundert', 'das', 'die Jahrhunderte', 'Jahr·hun·dert', 'Abad (100 tahun)', 'Waktu, Angka & Alam', 'B1', 'Dieses gotische Bauwerk stammt aus dem vierzehnten Jahrhundert.', 'Bangunan bergaya Gotik ini berasal dari abad keempat belas.', '[jaːɐ̯ˈhʊndɐt]'],
  ['Feiertag', 'der', 'die Feiertage', 'Fei·er·tag', 'Hari libur nasional', 'Waktu, Angka & Alam', 'A2', 'An einem gesetzlichen Feiertag bleiben alle Supermärkte geschlossen.', 'Pada hari libur nasional resmi, semua supermarket tutup.', '[ˈfaɪ̯ɐˌtaːk]'],
  ['Alltag', 'der', '— (Singularetantum)', 'All·tag', 'Keseharian / Rutinitas harian', 'Waktu, Angka & Alam', 'A2', 'Kurze Übungen lassen sich leicht in den beruflichen Alltag integrieren.', 'Latihan singkat mudah diintegrasikan ke dalam keseharian kerja.', '[ˈalˌtaːk]'],
  ['Sonnenaufgang', 'der', 'die Sonnenaufgänge', 'Son·nen·auf·gang', 'Matahari terbit', 'Waktu, Angka & Alam', 'A2', 'Vom Berggipfel aus beobachteten wir einen spektakulären Sonnenaufgang.', 'Dari puncak gunung kami menyaksikan matahari terbit yang memukau.', '[ˈzɔnənˌʔaʊ̯fɡaŋ]'],
  ['Sonnenuntergang', 'der', 'die Sonnenuntergänge', 'Son·nen·un·ter·gang', 'Matahari terbenam', 'Waktu, Angka & Alam', 'A2', 'Bei Sonnenuntergang färbte sich der Himmel über dem Meer tiefrot.', 'Saat matahari terbenam, langit di atas laut berubah warna menjadi merah tua.', '[ˈzɔnənˌʔʊntɐɡaŋ]'],
  ['Wetterbericht', 'der', 'die Wetterberichte', 'Wet·ter·be·richt', 'Prakiraan cuaca', 'Waktu, Angka & Alam', 'A2', 'Laut Wetterbericht bleibt es am gesamten Wochenende sonnig und trocken.', 'Menurut prakiraan cuaca, sepanjang akhir pekan cuaca tetap cerah dan kering.', '[ˈvɛtɐbəˌʁɪçt]'],
  ['Temperatur', 'die', 'die Temperaturen', 'Tem·pe·ra·tur', 'Suhu udara', 'Waktu, Angka & Alam', 'A2', 'Im Juli steigen die Temperaturen am Nachmittag oft über dreißig Grad.', 'Pada bulan Juli suhu udara di sore hari sering naik di atas tiga puluh derajat.', '[tɛmpəʁaˈtuːɐ̯]'],
  ['Gewitter', 'das', 'die Gewitter', 'Ge·wit·ter', 'Badai petir', 'Waktu, Angka & Alam', 'A2', 'Nach der großen Sommerhitze zog am Abend ein heftiges Gewitter auf.', 'Setelah panas terik musim panas, pada malam hari datang badai petir hebat.', '[ɡəˈvɪtɐ]'],
  ['Regenbogen', 'der', 'die Regenbögen', 'Re·gen·bo·gen', 'Pelangi', 'Waktu, Angka & Alam', 'A2', 'Nach dem kurzen Schauer leuchtete am Himmel ein bunter Regenbogen.', 'Setelah hujan singkat, tampak pelangi berwarna-warni di langit.', '[ˈʁeːɡn̩ˌboːɡn̩]'],
  ['Nebel', 'der', '— (Singularetantum)', 'Ne·bel', 'Kabut', 'Waktu, Angka & Alam', 'A2', 'Im Herbst liegt morgens oft dichter Nebel über den Flusstälern.', 'Di musim gugur sering turun kabut tebal di atas lembah sungai pada pagi hari.', '[ˈneːbl̩]'],
  ['Schneeflocke', 'die', 'die Schneeflocken', 'Schnee·flo·cke', 'Kepingan salju', 'Waktu, Angka & Alam', 'A2', 'Die ersten weißen Schneeflocken fielen leise auf das Hausdach.', 'Kepingan salju putih pertama turun perlahan di atas atap rumah.', '[ˈʃneːˌflɔkə]'],
  ['Landschaft', 'die', 'die Landschaften', 'Land·schaft', 'Pemandangan alam / Lanskap', 'Waktu, Angka & Alam', 'A2', 'Während der Zugfahrt genossen wir die grüne, hügelige Landschaft.', 'Selama perjalanan kereta kami menikmati lanskap perbukitan yang hijau.', '[ˈlantʃaft]'],
  ['Gebirge', 'das', 'die Gebirge', 'Ge·bir·ge', 'Pegunungan', 'Waktu, Angka & Alam', 'A2', 'Im Winter fahren viele Familien zum Skifahren ins Gebirge.', 'Di musim dingin banyak keluarga pergi bermain ski ke pegunungan.', '[ɡəˈbɪʁɡə]'],
  ['Küste', 'die', 'die Küsten', 'Küs·te', 'Pesisir pantai', 'Waktu, Angka & Alam', 'A2', 'An der Nordseeküste weht fast immer eine kräftige Brise.', 'Di pesisir Laut Utara hampir selalu bertiup angin laut yang kencang.', '[ˈkʏstə]'],
  ['Insel', 'die', 'die Inseln', 'In·sel', 'Pulau', 'Waktu, Angka & Alam', 'A1', 'Indonesien ist der größte Inselstaat der Welt.', 'Indonesia adalah negara kepulauan terbesar di dunia.', '[ˈɪnzl̩]'],
  ['Fluss', 'der', 'die Flüsse', 'Fluss', 'Sungai', 'Waktu, Angka & Alam', 'A1', 'Der Rhein ist einer der wichtigsten Flüsse in Mitteleuropa.', 'Sungai Rhein adalah salah satu sungai terpenting di Eropa Tengah.', '[flʊs]'],
  ['Wiese', 'die', 'die Wiesen', 'Wie·se', 'Padang rumput', 'Waktu, Angka & Alam', 'A2', 'Im Frühling blühen auf der grünen Wiese unzählige bunte Blumen.', 'Di musim semi mekar tak terhitung banyaknya bunga warna-warni di padang rumput hijau.', '[ˈviːzə]'],
  ['Pflanze', 'die', 'die Pflanzen', 'Pflan·ze', 'Tanaman / Tumbuhan', 'Waktu, Angka & Alam', 'A1', 'Vergiss bitte nicht, die grünen Pflanzen auf dem Fensterbrett zu gießen.', 'Tolong jangan lupa menyiram tanaman hijau di ambang jendela.', '[ˈp͡flant͡sə]'],
  ['Schmetterling', 'der', 'die Schmetterlinge', 'Schmet·ter·ling', 'Kupu-kupu', 'Waktu, Angka & Alam', 'A2', 'Ein bunter Schmetterling setzte sich auf die gelbe Gartenblume.', 'Seekor kupu-kupu warna-warni hinggap di atas bunga taman yang kuning.', '[ˈʃmɛtɐlɪŋ]'],
  ['Vogel', 'der', 'die Vögel', 'Vo·gel', 'Burung', 'Waktu, Angka & Alam', 'A1', 'Schon früh am Morgen singen die Vögel in den hohen Bäumen.', 'Sejak pagi-pagi sekali burung-burung berkicau di pepohonan tinggi.', '[ˈfoːɡl̩]'],
  ['Umwelt', 'die', '— (Singularetantum)', 'Um·welt', 'Lingkungan hidup', 'Waktu, Angka & Alam', 'A2', 'Jeder Einzelne kann im Alltag einen Beitrag zum Schutz der Umwelt leisten.', 'Setiap individu dapat berkontribusi menjaga lingkungan hidup dalam keseharian.', '[ˈʊmˌvɛlt]'],
  ['Klimawandel', 'der', '— (Singularetantum)', 'Kli·ma·wan·del', 'Perubahan iklim', 'Waktu, Angka & Alam', 'B1', 'Der globale Klimawandel erfordert nachhaltige Energiekonzepte.', 'Perubahan iklim global menuntut konsep energi yang berkelanjutan.', '[ˈkliːmaˌvandl̩]'],
  ['Erneuerbare Energie', 'die', 'die Erneuerbaren Energien', 'Er·neu·er·ba·re E·ner·gie', 'Energi terbarukan', 'Waktu, Angka & Alam', 'B2', 'Windkraft und Solarenergie zählen zu den wichtigsten erneuerbaren Energien.', 'Tenaga angin dan surya termasuk energi terbarukan yang paling utama.', '[ɛɐ̯ˈnɔʏ̯ɐbaːʁə enɛʁˈɡiː]'],

  // ============================================================================
  // 8. VERBA & KATA SIFAT PENTING (A1–B2)
  // ============================================================================
  ['erklären', 'none', 'erklärt · erklärte · hat erklärt', 'er·klä·ren', 'Menjelaskan / Menerangkan', 'Verba & Sifat A1', 'A1', 'Können Sie mir bitte den Unterschied zwischen Dativ und Akkusativ erklären?', 'Bisakah Anda menjelaskan kepada saya perbedaan antara Dativ dan Akkusativ?', '[ɛɐ̯ˈklɛːʁən]'],
  ['wiederholen', 'none', 'wiederholt · wiederholte · hat wiederholt', 'wie·der·ho·len', 'Mengulangi', 'Verba & Sifat A1', 'A1', 'Bitte wiederholen Sie das Wort laut und deutlich nach dem Ton.', 'Silakan ulangi kata tersebut dengan lantang dan jelas setelah bunyi nada.', '[viːdɐˈhoːlən]'],
  ['buchstabieren', 'none', 'buchstabiert · buchstabierte · hat buchstabiert', 'buch·sta·bie·ren', 'Mengeja huruf demi huruf', 'Verba & Sifat A1', 'A1', 'Können Sie Ihren Straßennamen bitte langsam buchstabieren?', 'Bisakah Anda mengeja nama jalan Anda secara perlahan?', '[buːxʃtaˈbiːʁən]'],
  ['übersetzen', 'none', 'übersetzt · übersetzte · hat übersetzt', 'ü·ber·set·zen', 'Menerjemahkan', 'Verba & Sifat A1', 'A2', 'Er übersetzt den technischen Artikel vom Deutschen ins Indonesische.', 'Ia menerjemahkan artikel teknis tersebut dari bahasa Jerman ke bahasa Indonesia.', '[yːbɐˈzɛt͡sn̩]'],
  ['vergleichen', 'none', 'vergleicht · verglich · hat verglichen', 'ver·glei·chen', 'Membandingkan', 'Verba & Sifat A1', 'A2', 'Vergleichen Sie Ihre eigene Aufnahme direkt mit der Stimme des Muttersprachlers.', 'Bandingkan rekaman Anda sendiri secara langsung dengan suara penutur asli.', '[fɛɐ̯ˈɡlaɪ̯çn̩]'],
  ['verbessern', 'none', 'verbessert · verbesserte · hat verbessert', 'ver·bes·sern', 'Memperbaiki / Meningkatkan', 'Verba & Sifat A1', 'A2', 'Mit gezieltem Training verbessern Sie Ihre Aussprache jeden Tag.', 'Dengan latihan terarah, Anda meningkatkan pengucapan Anda setiap hari.', '[fɛɐ̯ˈbɛsɐn]'],
  ['entscheiden', 'none', 'entscheidet · entschied · hat entschieden', 'ent·schei·den', 'Memutuskan', 'Verba & Sifat A1', 'B1', 'Wir müssen uns bis morgen für einen der beiden Kurse entscheiden.', 'Kita harus memutuskan memilih salah satu dari kedua kursus tersebut paling lambat besok.', '[ɛntˈʃaɪ̯dn̩]'],
  ['teilnehmen', 'none', 'nimmt teil · nahm teil · hat teilgenommen', 'teil·neh·men', 'Berpartisipasi / Mengikuti', 'Verba & Sifat A1', 'A2', 'Über dreißig Studierende möchten am Sprachwettbewerb teilnehmen.', 'Lebih dari tiga puluh mahasiswa ingin berpartisipasi dalam lomba bahasa.', '[ˈtaɪ̯lˌneːmən]'],
  ['vorbereiten', 'none', 'bereitet vor · bereitete vor · hat vorbereitet', 'vor·be·rei·ten', 'Mempersiapkan', 'Verba & Sifat A1', 'A2', 'Sie bereitet sich intensiv auf die kommende Goethe-Prüfung vor.', 'Ia mempersiapkan diri secara intensif menghadapi ujian Goethe mendatang.', '[ˈfoːɐ̯bəˌʁaɪ̯tn̩]'],
  ['empfehlen', 'none', 'empfiehlt · empfahl · hat empfohlen', 'emp·feh·len', 'Merekomendasikan / Menyarankan', 'Verba & Sifat A1', 'A2', 'Welches Lehrbuch können Sie für fortgeschrittene Anfänger empfehlen?', 'Buku panduan mana yang dapat Anda rekomendasikan untuk pemula lanjutan?', '[ɛmˈp͡feːlən]'],
  ['erinnern', 'none', 'erinnert · erinnerte · hat erinnert', 'er·in·nern', 'Mengingat / Mengingatkan', 'Verba & Sifat A1', 'A2', 'Ich erinnere mich noch sehr gut an meinen ersten Tag in München.', 'Saya masih sangat ingat hari pertama saya di München.', '[ɛɐ̯ˈʔɪnɐn]'],
  ['vergessen', 'none', 'vergisst · vergaß · hat vergessen', 'ver·ges·sen', 'Melupakan / Lupa', 'Verba & Sifat A1', 'A1', 'Vergessen Sie nicht, den Artikel immer zusammen mit dem Nomen zu lernen!', 'Jangan lupa untuk selalu mempelajari artikel bersama kata bendanya!', '[fɛɐ̯ˈɡɛsn̩]'],
  ['versprechen', 'none', 'verspricht · versprach · hat versprochen', 'ver·spre·chen', 'Berjanji / Salah ucap (sich versprechen)', 'Verba & Sifat A1', 'A2', 'Ich verspreche dir, heute Abend pünktlich zum Essen zu Hause zu sein.', 'Saya berjanji kepadamu akan tiba di rumah tepat waktu untuk makan malam ini.', '[fɛɐ̯ˈʃpʁɛçn̩]'],
  ['vermeiden', 'none', 'vermeidet · vermied · hat vermieden', 'ver·mei·den', 'Menghindari', 'Verba & Sifat A1', 'B1', 'Durch bewusstes Hören lassen sich typische Aussprachefehler leicht vermeiden.', 'Melalui pendengaran yang sadar, kesalahan pengucapan umum mudah dihindari.', '[fɛɐ̯ˈmaɪ̯dn̩]'],
  ['überzeugen', 'none', 'überzeugt · überzeugte · hat überzeugt', 'ü·ber·zeu·gen', 'Meyakinkan', 'Verba & Sifat A1', 'B1', 'Mit klaren Argumenten konnte sie die gesamte Kommission überzeugen.', 'Dengan argumen yang jelas ia berhasil meyakinkan seluruh komisi.', '[yːbɐˈt͡sɔʏ̯ɡn̩]'],
  ['unterstützen', 'none', 'unterstützt · unterstützte · hat unterstützt', 'un·ter·stüt·zen', 'Mendukung / Membantu', 'Verba & Sifat A1', 'B1', 'Gegenseitige Hilfe unterstützt den Lernerfolg in der gesamten Gruppe.', 'Bantuan timbal balik mendukung keberhasilan belajar di seluruh kelompok.', '[ʊntɐˈʃtʏt͡sn̩]'],
  ['beobachten', 'none', 'beobachtet · beobachtete · hat beobachtet', 'be·ob·ach·ten', 'Mengamati / Memperhatikan', 'Verba & Sifat A1', 'B1', 'Beobachten Sie genau, wie sich die Lippen beim Umlaut ü runden.', 'Amati dengan saksama bagaimana bibir membulat saat mengucapkan Umlaut ü.', '[bəˈʔoːbaxtn̩]'],
  ['entwickeln', 'none', 'entwickelt · entwickelte · hat entwickelt', 'ent·wi·ckeln', 'Mengembangkan', 'Verba & Sifat A1', 'B1', 'Mit der Zeit entwickeln Sie ein sicheres Sprachgefühl für die vier Fälle.', 'Seiring waktu Anda mengembangkan kepekaan bahasa yang mantap untuk keempat kasus.', '[ɛntˈvɪkl̩n]'],
  ['erreichen', 'none', 'erreicht · erreichte · hat erreicht', 'er·rei·chen', 'Mencapai / Menghubungi', 'Verba & Sifat A1', 'A2', 'Mit Ausdauer erreichen Sie schon bald das nächste Sprachniveau.', 'Dengan ketekunan Anda akan segera mencapai level bahasa berikutnya.', '[ɛɐ̯ˈʁaɪ̯çn̩]'],
  ['gelingen', 'none', 'gelingt · gelang · ist gelungen (+ Dativ)', 'ge·lin·gen', 'Berhasil (+ Dativ)', 'Verba & Sifat A1', 'B1', 'Nach ein paar Versuchen gelang ihm die Aussprache des Ich-Lauts perfekt.', 'Setelah beberapa percobaan, ia berhasil mengucapkan bunyi Ich-Laut dengan sempurna.', '[ɡəˈlɪŋən]'],
  ['ausgezeichnet', 'none', 'Adjektiv · Adverb', 'aus·ge·zeich·net', 'Sangat bagus / Luar biasa', 'Verba & Sifat A1', 'A2', 'Ihre Aussprache in dieser Übung war wirklich ausgezeichnet!', 'Pengucapan Anda pada latihan ini sungguh luar biasa!', '[ˈaʊ̯sɡəˌt͡saɪ̯çnət]'],
  ['selbstverständlich', 'none', 'Adjektiv · Adverb', 'selbst·ver·ständ·lich', 'Tentu saja / Sudah barang tentu', 'Verba & Sifat A1', 'B1', 'Selbstverständlich können Sie jede Vokabel beliebig oft anhören.', 'Tentu saja Anda dapat mendengarkan setiap kosakata sesering mungkin.', '[ˈzɛlpstfɛɐ̯ˌʃtɛntlɪç]'],
  ['wahrscheinlich', 'none', 'Adjektiv · Adverb', 'wahr·schein·lich', 'Kemungkinan besar', 'Verba & Sifat A1', 'A2', 'Morgen Nachmittag wird es in Hamburg wahrscheinlich leicht regnen.', 'Besok sore di Hamburg kemungkinan besar akan turun hujan ringan.', '[vaːɐ̯ˈʃaɪ̯nlɪç]'],
  ['notwendig', 'none', 'Adjektiv · Adverb', 'not·wen·dig', 'Perlu / Diperlukan / Mutlak', 'Verba & Sifat A1', 'B1', 'Für das Studium in Deutschland ist ein Sprachzertifikat notwendig.', 'Untuk kuliah di Jerman diperlukan sertifikat kemampuan bahasa.', '[ˈnoːtˌvɛndɪç]'],
  ['zuverlässig', 'none', 'Adjektiv · Adverb', 'zu·ver·läs·sig', 'Andal / Dapat dipercaya', 'Verba & Sifat A1', 'B1', 'Die S-Bahn ist in dieser Stadt ein sehr zuverlässiges Verkehrsmittel.', 'Kereta komuter S-Bahn di kota ini adalah sarana transportasi yang sangat andal.', '[ˈt͡suːfɛɐ̯ˌlɛsɪç]'],
  ['sorgfältig', 'none', 'Adjektiv · Adverb', 'sorg·fäl·tig', 'Teliti / Cermat / Hati-hati', 'Verba & Sifat A1', 'B1', 'Bitte prüfen Sie Ihre Antworten vor dem Absenden noch einmal sorgfältig.', 'Mohon periksa kembali jawaban Anda dengan teliti sebelum dikirim.', '[ˈzɔʁkˌfɛltɪç]'],
  ['geduldig', 'none', 'Adjektiv · Adverb', 'ge·dul·dig', 'Sabar', 'Verba & Sifat A1', 'A2', 'Beim Sprachenlernen muss man vor allem mit sich selbst geduldig sein.', 'Saat belajar bahasa, kita terutama harus sabar terhadap diri sendiri.', '[ɡəˈdʊldɪç]'],
  ['neugierig', 'none', 'Adjektiv · Adverb', 'neu·gie·rig', 'Ingin tahu / Penasaran', 'Verba & Sifat A1', 'A2', 'Bleiben Sie neugierig und entdecken Sie jeden Tag neue deutsche Wörter!', 'Tetaplah ingin tahu dan temukan kata-kata bahasa Jerman baru setiap hari!', '[ˈnɔʏ̯ˌɡiːʁɪç]'],
  ['erfolgreich', 'none', 'Adjektiv · Adverb', 'er·folg·reich', 'Sukses / Berhasil', 'Verba & Sifat A1', 'A2', 'Wir wünschen Ihnen einen erfolgreichen Start in die neue Lernwoche.', 'Kami mengucapkan selamat memulai minggu belajar yang sukses.', '[ɛɐ̯ˈfɔlkˌʁaɪ̯ç]'],
  ['unabhängig', 'none', 'Adjektiv · Adverb', 'un·ab·hän·gig', 'Mandiri / Independen', 'Verba & Sifat A1', 'B1', 'Mit guten Sprachkenntnissen können Sie sich im Ausland völlig unabhängig bewegen.', 'Dengan kemampuan bahasa yang baik, Anda dapat beraktivitas secara mandiri di luar negeri.', '[ˈʊnʔapˌhɛŋɪç]'],

  // ============================================================================
  // 9. AKADEMIK, BISNIS, HUKUM & SAINS (B2–C1)
  // ============================================================================
  ['Zusammenhang', 'der', 'die Zusammenhänge', 'Zu·sam·men·hang', 'Konteks / Keterkaitan', 'Akademik, Bisnis & C1', 'B2', 'Man versteht ein neues Wort am besten im natürlichen Zusammenhang eines Satzes.', 'Kita memahami kata baru paling baik dalam konteks kalimat yang alami.', '[t͡suˈzamənˌhaŋ]'],
  ['Voraussetzung', 'die', 'die Voraussetzungen', 'Vo·raus·set·zung', 'Prasyarat / Syarat utama', 'Akademik, Bisnis & C1', 'B2', 'Regelmäßiges Hörtraining ist die wichtigste Voraussetzung für gutes Sprechen.', 'Latihan mendengar secara rutin adalah prasyarat terpenting untuk berbicara dengan baik.', '[foˈʁaʊ̯sˌzɛt͡sʊŋ]'],
  ['Auseinandersetzung', 'die', 'die Auseinandersetzungen', 'Aus·ein·an·der·set·zung', 'Kajian mendalam / Perdebatan', 'Akademik, Bisnis & C1', 'C1', 'Die intensive Auseinandersetzung mit der Grammatik schärft das logische Denken.', 'Kajian mendalam terhadap tata bahasa mempertajam pemikiran logis.', '[aʊ̯sʔaɪ̯ˈnandɐˌzɛt͡sʊŋ]'],
  ['Schlussfolgerung', 'die', 'die Schlussfolgerungen', 'Schluss·fol·ge·rung', 'Kesimpulan logis / Deduksi', 'Akademik, Bisnis & C1', 'C1', 'Aus den empirischen Daten lässt sich eine eindeutige Schlussfolgerung ziehen.', 'Dari data empiris tersebut dapat ditarik kesimpulan logis yang tegas.', '[ˈʃlʊsˌfɔlɡəʁʊŋ]'],
  ['Gesichtspunkt', 'der', 'die Gesichtspunkte', 'Ge·sichts·punkt', 'Sudut pandang / Aspek tinjauan', 'Akademik, Bisnis & C1', 'B2', 'Unter diesem wissenschaftlichen Gesichtspunkt erscheint die Theorie sehr plausibel.', 'Dari sudut pandang ilmiah ini, teori tersebut tampak sangat masuk akal.', '[ɡəˈzɪçt͡sˌpʊŋkt]'],
  ['Rahmenbedingung', 'die', 'die Rahmenbedingungen', 'Rah·men·be·din·gung', 'Kondisi kerangka dasar / Regulasi umum', 'Akademik, Bisnis & C1', 'C1', 'Stabile wirtschaftliche Rahmenbedingungen fördern langfristige Investitionen.', 'Kondisi kerangka ekonomi yang stabil mendorong investasi jangka panjang.', '[ˈʁaːmənbəˌdɪŋʊŋ]'],
  ['Wettbewerbsfähigkeit', 'die', '— (Singularetantum)', 'Wett·be·werbs·fä·hig·keit', 'Daya saing (Competitiveness)', 'Akademik, Bisnis & C1', 'C1', 'Innovation und Bildung sichern die internationale Wettbewerbsfähigkeit.', 'Inovasi dan pendidikan menjamin daya saing internasional.', '[ˈvɛtbəvɛʁpsˌfɛːɪçkaɪ̯t]'],
  ['Wertschöpfung', 'die', 'die Wertschöpfungen', 'Wert·schöp·fung', 'Penciptaan nilai tambah (Value creation)', 'Akademik, Bisnis & C1', 'C1', 'Regionale Verarbeitung erhöht die wirtschaftliche Wertschöpfung vor Ort.', 'Pengolahan di tingkat daerah meningkatkan penciptaan nilai tambah ekonomi setempat.', '[ˈveːɐ̯tˌʃœp͡fʊŋ]'],
  ['Erkenntnis', 'die', 'die Erkenntnisse', 'Er·kennt·nis', 'Temuan ilmiah / Wawasan mendalam', 'Akademik, Bisnis & C1', 'B2', 'Neuere linguistische Erkenntnisse bestätigen den Nutzen von lautem Vorlesen.', 'Temuan linguistik terbaru menegaskan manfaat membaca nyaring.', '[ɛɐ̯ˈkɛntnɪs]'],
  ['Gesetzgebung', 'die', 'die Gesetzgebungen', 'Ge·setz·ge·bung', 'Perundang-undangan / Legislasi', 'Akademik, Bisnis & C1', 'C1', 'Die europäische Gesetzgebung zum Datenschutz setzt weltweit hohe Maßstäbe.', 'Perundang-undangan Eropa mengenai perlindungan data menetapkan standar tinggi di dunia.', '[ɡəˈzɛt͡sˌɡeːbʊŋ]'],
  ['Verfassung', 'die', 'die Verfassungen', 'Ver·fas·sung', 'Konstitusi / Undang-Undang Dasar', 'Akademik, Bisnis & C1', 'B2', 'Das Grundgesetz ist die demokratische Verfassung der Bundesrepublik Deutschland.', 'Grundgesetz adalah konstitusi demokratis Republik Federal Jerman.', '[fɛɐ̯ˈfasʊŋ]'],
  ['Bürgerrecht', 'das', 'die Bürgerrechte', 'Bür·ger·recht', 'Hak sipil warga negara', 'Akademik, Bisnis & C1', 'B2', 'Die Meinungsfreiheit gehört zu den geschützten Bürgerrechten.', 'Kebebasan berpendapat termasuk dalam hak-hak sipil yang dilindungi.', '[ˈbʏʁɡɐˌʁɛçt]'],
  ['Meinungsfreiheit', 'die', '— (Singularetantum)', 'Mei·nungs·frei·heit', 'Kebebasan berpendapat', 'Akademik, Bisnis & C1', 'B2', 'Eine offene Gesellschaft lebt von gelebter Meinungsfreiheit und Respekt.', 'Masyarakat terbuka hidup dari kebebasan berpendapat dan rasa hormat.', '[ˈmaɪ̯nʊŋsˌfʁaɪ̯haɪ̯t]'],
  ['Gleichberechtigung', 'die', '— (Singularetantum)', 'Gleich·be·rech·ti·gung', 'Kesetaraan hak', 'Akademik, Bisnis & C1', 'B2', 'Die Gleichberechtigung im Berufsleben ist ein zentrales gesellschaftliches Ziel.', 'Kesetaraan hak dalam dunia kerja adalah tujuan sosial yang utama.', '[ˈɡlaɪ̯çbəˌʁɛçtɪɡʊŋ]'],
  ['Errungenschaft', 'die', 'die Errungenschaften', 'Er·run·gen·schaft', 'Pencapaian besar / Prestasi bersejarah', 'Akademik, Bisnis & C1', 'C1', 'Die moderne Medizin gilt als eine der größten Errungenschaften der Menschheit.', 'Kedokteran modern dipandang sebagai salah satu pencapaian terbesar umat manusia.', '[ɛɐ̯ˈʁʊŋənʃaft]'],
  ['Wechselwirkung', 'die', 'die Wechselwirkungen', 'Wech·sel·wir·kung', 'Interaksi timbal balik', 'Akademik, Bisnis & C1', 'C1', 'Zwischen Hörverständnis und eigener Aussprache besteht eine enge Wechselwirkung.', 'Antara pemahaman mendengar dan pengucapan sendiri terdapat interaksi timbal balik yang erat.', '[ˈvɛksl̩ˌvɪʁkʊŋ]'],
  ['Wahrscheinlichkeit', 'die', 'die Wahrscheinlichkeiten', 'Wahr·schein·lich·keit', 'Probabilitas / Kemungkinan', 'Akademik, Bisnis & C1', 'B2', 'Mit hoher Wahrscheinlichkeit wird das Forschungsprojekt im Herbst abgeschlossen.', 'Dengan probabilitas tinggi, proyek riset tersebut akan rampung pada musim gugur.', '[vaːɐ̯ˈʃaɪ̯nlɪçkaɪ̯t]'],
  ['Durchschnitt', 'der', 'die Durchschnitte', 'Durch·schnitt', 'Rata-rata', 'Akademik, Bisnis & C1', 'B1', 'Im Durchschnitt lernen unsere Nutzer fünfzehn neue Vokabeln pro Tag.', 'Rata-rata pengguna kami mempelajari lima belas kosakata baru per hari.', '[ˈdʊʁçˌʃnɪt]'],
  ['Verhältnismäßigkeit', 'die', '— (Singularetantum)', 'Ver·hält·nis·mä·ßig·keit', 'Proporsionalitas / Keseimbangan ukuran', 'Akademik, Bisnis & C1', 'C1', 'Im deutschen Recht gilt der Grundsatz der Verhältnismäßigkeit.', 'Dalam hukum Jerman berlaku asas proporsionalitas.', '[fɛɐ̯ˈhɛltnɪsˌmɛːsɪçkaɪ̯t]'],
  ['Zuständigkeit', 'die', 'die Zuständigkeiten', 'Zu·stän·dig·keit', 'Kewenangan / Yurisdiksi', 'Akademik, Bisnis & C1', 'C1', 'Diese Frage fällt in die direkte Zuständigkeit des Bildungsministeriums.', 'Pertanyaan ini termasuk dalam kewenangan langsung Kementerian Pendidikan.', '[ˈt͡suːˌʃtɛndɪçkaɪ̯t]'],
  ['Stellungnahme', 'die', 'die Stellungnahmen', 'Stel·lung·nah·me', 'Pernyataan sikap resmi / Tanggapan', 'Akademik, Bisnis & C1', 'C1', 'Der Ausschuss bat die Experten um eine schriftliche Stellungnahme.', 'Komite meminta pernyataan sikap tertulis dari para pakar.', '[ˈʃtɛlʊŋˌnaːmə]'],
  ['Übereinstimmung', 'die', 'die Übereinstimmungen', 'Ü·ber·ein·stim·mung', 'Kesesuaian / Konsensus', 'Akademik, Bisnis & C1', 'B2', 'Beide Forschungsgruppen kamen in ihren Messungen zu voller Übereinstimmung.', 'Kedua kelompok riset mencapai kesesuaian penuh dalam hasil pengukuran mereka.', '[yːbɐˈʔaɪ̯nˌʃtɪmʊŋ]'],
  ['Widerspruch', 'der', 'die Widersprüche', 'Wi·der·spruch', 'Kontradiksi / Sanggahan resmi', 'Akademik, Bisnis & C1', 'B2', 'Zwischen diesen beiden Aussagen besteht kein logischer Widerspruch.', 'Antara kedua pernyataan ini tidak terdapat kontradiksi logis.', '[ˈviːdɐˌʃpʁʊx]'],
  ['Nachvollziehbarkeit', 'die', '— (Singularetantum)', 'Nach·voll·zieh·bar·keit', 'Keterlacakan logis / Kemudahan dipahami', 'Akademik, Bisnis & C1', 'C1', 'Eine klare Gliederung erhöht die Nachvollziehbarkeit wissenschaftlicher Texte.', 'Struktur yang jelas meningkatkan keterlacakan logis teks ilmiah.', '[ˈnaːxfɔlˌt͡siːbaːɐ̯kaɪ̯t]'],
  ['Berücksichtigung', 'die', '— (Singularetantum)', 'Be·rück·sich·ti·gung', 'Pertimbangan / Perhatian (+ Genitiv)', 'Akademik, Bisnis & C1', 'C1', 'Unter Berücksichtigung aller Faktoren war die Entscheidung vollkommen richtig.', 'Dengan mempertimbangkan seluruh faktor, keputusan tersebut sepenuhnya tepat.', '[bəˈʁʏkˌzɪçtɪɡʊŋ]'],
  ['Inanspruchnahme', 'die', '— (Singularetantum)', 'In·an·spruch·nah·me', 'Pemanfaatan / Penggunaan layanan', 'Akademik, Bisnis & C1', 'C1', 'Die Inanspruchnahme der Studienberatung ist für alle Studierenden kostenlos.', 'Pemanfaatan layanan konsultasi akademik gratis bagi seluruh mahasiswa.', '[ɪnˈʔanʃpʁʊxˌnaːmə]'],
  ['Auseinanderfallen', 'das', '— (Singularetantum)', 'Aus·ein·an·der·fal·len', 'Perpecahan / Ketidaksinkronan', 'Akademik, Bisnis & C1', 'C1', 'Ein Auseinanderfallen von Theorie und Praxis sollte im Unterricht vermieden werden.', 'Ketidaksinkronan antara teori dan praktik harus dihindari dalam pengajaran.', '[aʊ̯sʔaɪ̯ˈnandɐˌfalən]'],
  ['schlussfolgern', 'none', 'schlussfolgert · schlussfolgerte · hat geschlussfolgert', 'schluss·fol·gern', 'Menyimpulkan secara logis', 'Akademik, Bisnis & C1', 'C1', 'Aus den Ergebnissen lässt sich schlussfolgern, dass tägliches Training wirkt.', 'Dari hasil tersebut dapat disimpulkan bahwa latihan harian terbukti efektif.', '[ˈʃlʊsˌfɔlɡɐn]'],
  ['hinterfragen', 'none', 'hinterfragt · hinterfragte · hat hinterfragt', 'hin·ter·fra·gen', 'Mempertanyakan secara kritis', 'Akademik, Bisnis & C1', 'C1', 'In der Wissenschaft ist es wichtig, bestehende Annahmen kritisch zu hinterfragen.', 'Dalam sains, penting untuk mempertanyakan asumsi yang ada secara kritis.', '[hɪntɐˈfʁaːɡn̩]'],
  ['berücksichtigen', 'none', 'berücksichtigt · berücksichtigte · hat berücksichtigt', 'be·rück·sich·ti·gen', 'Mempertimbangkan / Memperhitungkan', 'Akademik, Bisnis & C1', 'B2', 'Bei der Bewertung wird auch die Satzmelodie sorgfältig berücksichtigt.', 'Dalam penilaian, intonasi kalimat juga dipertimbangkan dengan cermat.', '[bəˈʁʏkˌzɪçtɪɡn̩]'],
  ['auseinandersetzen', 'none', 'setzt auseinander · setzte auseinander · hat auseinandergesetzt', 'aus·ein·an·der·set·zen', 'Mengkaji mendalam / Mendalami (sich + mit)', 'Akademik, Bisnis & C1', 'B2', 'Wer sich intensiv mit der Phonetik auseinandersetzt, spricht rasch flüssiger.', 'Siapa yang mendalami fonetik secara intensif akan cepat berbicara lebih lancar.', '[aʊ̯sʔaɪ̯ˈnandɐˌzɛt͡sn̩]'],
  ['bewerkstelligen', 'none', 'bewerkstelligt · bewerkstelligte · hat bewerkstelligt', 'be·werk·stel·li·gen', 'Menuntaskan / Mewujudkan tugas sulit', 'Akademik, Bisnis & C1', 'C1', 'Wie haben Sie diesen komplexen Umzug in nur zwei Tagen bewerkstelligt?', 'Bagaimana Anda berhasil menuntaskan pindahan rumit ini hanya dalam dua hari?', '[bəˈvɛʁkˌʃtɛlɪɡn̩]'],
  ['vernachlässigen', 'none', 'vernachlässigt · vernachlässigte · hat vernachlässigt', 'ver·nach·läs·si·gen', 'Mengabaikan / Melalaikan', 'Akademik, Bisnis & C1', 'B2', 'Beim Vokabellernen sollte man die korrekte Aussprache niemals vernachlässigen.', 'Saat menghafal kosakata, kita tidak boleh sekali-kali mengabaikan pengucapan yang benar.', '[fɛɐ̯ˈnaːxˌlɛsɪɡn̩]'],
  ['beanspruchen', 'none', 'beansprucht · beanspruchte · hat beansprucht', 'be·an·spru·chen', 'Mengklaim / Membutuhkan waktu atau hak', 'Akademik, Bisnis & C1', 'B2', 'Die Vorbereitung auf das C1-Diplom beansprucht mehrere Monate konzentrierter Arbeit.', 'Persiapan menuju diploma C1 membutuhkan waktu kerja fokus selama beberapa bulan.', '[bəˈʔanˌʃpʁʊxn̩]'],
  ['rechtfertigen', 'none', 'rechtfertigt · rechtfertigte · hat gerechtfertigt', 'recht·fer·ti·gen', 'Membenarkan / Memberi justifikasi', 'Akademik, Bisnis & C1', 'B2', 'Das hervorragende Ergebnis rechtfertigt den hohen zeitlichen Aufwand.', 'Hasil yang luar biasa membenarkan curahan waktu yang besar.', '[ˈʁɛçtˌfɛʁtɪɡn̩]'],

  // ============================================================================
  // 10. EKSTRA INTENSIF A1–B2 (PERBENDAHARAAN KATA HARIAN & KAMPUS LENGKAP)
  // ============================================================================
  ['Schlüsselbund', 'der', 'die Schlüsselbünde', 'Schlüs·sel·bund', 'Gantungan / Seikat kunci', 'Keluarga & Rumah', 'A2', 'Mein ganzer Schlüsselbund lag glücklicherweise noch auf dem Küchentisch.', 'Untungnya seikat kunci saya masih terletak di atas meja dapur.', '[ˈʃlʏsl̩ˌbʊnt]'],
  ['Klingel', 'die', 'die Klingeln', 'Klin·gel', 'Bel pintu / Bel sepeda', 'Keluarga & Rumah', 'A1', 'Drücken Sie bitte zweimal kurz auf die Klingel neben der Haustür.', 'Silakan tekan bel di samping pintu depan dua kali secara singkat.', '[ˈklɪŋl̩]'],
  ['Seife', 'die', 'die Seifen', 'Sei·fe', 'Sabun', 'Keluarga & Rumah', 'A1', 'Im Badezimmer liegt ein neues Stück Seife mit Lavendelduft.', 'Di kamar mandi terdapat sebatang sabun baru beraroma lavender.', '[ˈzaɪ̯fə]'],
  ['Handtuch', 'das', 'die Handtücher', 'Hand·tuch', 'Handuk', 'Keluarga & Rumah', 'A1', 'Für jeden Gast liegen zwei frische weiße Handtücher auf dem Bett.', 'Untuk setiap tamu tersedia dua handuk putih bersih di atas tempat tidur.', '[ˈhantˌtuːx]'],
  ['Zahnbürste', 'die', 'die Zahnbürsten', 'Zahn·bürs·te', 'Sikat gigi', 'Keluarga & Rumah', 'A1', 'Für die Reise packe ich meine Zahnbürste und Zahnpasta in die Tasche.', 'Untuk perjalanan saya mengemas sikat gigi dan pasta gigi ke dalam tas.', '[ˈt͡saːnˌbʏʁstə]'],
  ['Spiegel', 'der', 'die Spiegel', 'Spie·gel', 'Cermin', 'Keluarga & Rumah', 'A1', 'Kontrollieren Sie Ihre Lippenrundung beim Üben ruhig vor einem Spiegel.', 'Periksa pembulatan bibir Anda saat berlatih di depan cermin.', '[ˈʃpiːɡl̩]'],
  ['Wecker', 'der', 'die Wecker', 'We·cker', 'Jam weker / Alarm', 'Keluarga & Rumah', 'A1', 'Mein Wecker klingelt unter der Woche jeden Morgen um sechs Uhr.', 'Jam weker saya berbunyi setiap pagi pukul enam pada hari kerja.', '[ˈvɛkɐ]'],
  ['Stecker', 'der', 'die Stecker', 'Ste·cker', 'Steker / Colokan listrik', 'Keluarga & Rumah', 'A2', 'Ziehen Sie bei einem starken Gewitter vorsichtshalber den Stecker heraus.', 'Cabutlah steker listrik untuk berjaga-jaga saat terjadi badai petir hebat.', '[ˈʃtɛkɐ]'],
  ['Schublade', 'die', 'die Schubladen', 'Schub·la·de', 'Laci meja / lemari', 'Keluarga & Rumah', 'A2', 'Die Schere und das Klebeband liegen in der obersten Schublade.', 'Gunting dan pita perekat berada di laci paling atas.', '[ˈʃuːpˌlaːdə]'],
  ['Mülleimer', 'der', 'die Mülleimer', 'Müll·ei·mer', 'Tempat sampah', 'Keluarga & Rumah', 'A1', 'Unter der Küchenspüle stehen drei getrennte Mülleimer.', 'Di bawah bak cuci piring dapur terdapat tiga tempat sampah terpisah.', '[ˈmʏlˌʔaɪ̯mɐ]'],
  ['Bratpfanne', 'die', 'die Bratpfannen', 'Brat·pfan·ne', 'Wajan penggorengan', 'Kuliner & Kafe', 'A2', 'Erhitzen Sie zuerst einen Löffel Öl in der schweren Bratpfanne.', 'Panaskan terlebih dahulu satu sendok minyak di dalam wajan.', '[ˈbʁaːtˌp͡fanə]'],
  ['Kochtopf', 'der', 'die Kochtöpfe', 'Koch·topf', 'Panci masak', 'Kuliner & Kafe', 'A2', 'Im großen Kochtopf kocht bereits das Salzwasser für die Nudeln.', 'Di dalam panci besar, air garam untuk pasta sudah mendidih.', '[ˈkɔxˌtɔp͡f]'],
  ['Wasserkocher', 'der', 'die Wasserkocher', 'Was·ser·ko·cher', 'Teko pemanas air listrik', 'Kuliner & Kafe', 'A2', 'Mit dem elektrischen Wasserkocher ist das Teewasser in einer Minute heiß.', 'Dengan teko pemanas listrik, air teh panas dalam waktu satu menit.', '[ˈvasɐˌkɔxɐ]'],
  ['Backofen', 'der', 'die Backöfen', 'Back·o·fen', 'Oven pemanggang', 'Kuliner & Kafe', 'A2', 'Heizen Sie den Backofen bitte auf hundertachtzig Grad vor.', 'Tolong panaskan oven terlebih dahulu hingga suhu seratus delapan puluh derajat.', '[ˈbakˌʔoːfn̩]'],
  ['Haferflocken', 'die', 'die Haferflocken (Jamak)', 'Ha·fer·flo·cken', 'Oatmeal / Emping gandum', 'Kuliner & Kafe', 'A2', 'Zum Frühstück esse ich gern warme Haferflocken mit Banane und Nüssen.', 'Untuk sarapan saya suka makan oatmeal hangat dengan pisang dan kacang.', '[ˈhaːfɐˌflɔkn̩]'],
  ['Joghurt', 'der', 'die Joghurts', 'Jo·ghurt', 'Yogurt', 'Kuliner & Kafe', 'A1', 'Ein Becher Naturjoghurt mit frischen Früchten ist eine leichte Mahlzeit.', 'Secangkir yogurt tawar dengan buah segar adalah hidangan ringan.', '[ˈjoːɡʊʁt]'],
  ['Brezel', 'die', 'die Brezeln', 'Bre·zel', 'Roti Pretzel khas Jerman', 'Kuliner & Kafe', 'A1', 'In Bayern isst man vormittags gern eine frische, salzige Brezel.', 'Di Bayern orang senang makan roti Brezel asin yang segar pada pagi menjelang siang.', '[ˈbʁeːt͡sl̩]'],
  ['Bratwurst', 'die', 'die Bratwürste', 'Brat·wurst', 'Sosis panggang khas Jerman', 'Kuliner & Kafe', 'A1', 'Auf dem Marktplatz wird heiße Bratwurst im Brötchen mit Senf verkauft.', 'Di alun-alun pasar dijual sosis panggang hangat dalam roti dengan moster.', '[ˈbʁaːtˌvʊʁst]'],
  ['Senf', 'der', '— (Tak terhitung)', 'Senf', 'Moster (Mustard)', 'Kuliner & Kafe', 'A2', 'Möchten Sie zu Ihrer Wurst lieber milden oder scharfen Senf?', 'Apakah Anda lebih suka moster lembut atau pedas untuk sosis Anda?', '[zɛnf]'],
  ['Essig', 'der', '— (Tak terhitung)', 'Es·sig', 'Cuka', 'Kuliner & Kafe', 'A2', 'Für das Salatdressing mischen wir Olivenöl mit etwas Apfelessig.', 'Untuk saus salad kami mencampurkan minyak zaitun dengan sedikit cuka apel.', '[ˈɛsɪç]'],
  ['Nudeln', 'die', 'die Nudeln (Jamak)', 'Nu·deln', 'Mi / Pasta', 'Kuliner & Kafe', 'A1', 'Kinder essen besonders gern Nudeln mit hausgemachter Tomatensoße.', 'Anak-anak sangat suka makan pasta dengan saus tomat buatan rumah.', '[ˈnuːdl̩n]'],
  ['Mahlzeit', 'die', 'die Mahlzeiten', 'Mahl·zeit', 'Waktu makan / Hidangan', 'Kuliner & Kafe', 'A2', 'Mittags grüßen sich viele Kollegen in der Kantine mit dem Wort „Mahlzeit!“', 'Saat siang hari banyak rekan kerja saling menyapa di kantin dengan kata "Mahlzeit!"', '[ˈmaːlˌt͡saɪ̯t]'],
  ['Fahrplan', 'der', 'die Fahrpläne', 'Fahr·plan', 'Jadwal keberangkatan kereta/bus', 'Perjalanan & Kota', 'A1', 'Der neue digitale Fahrplan zeigt alle Abfahrtszeiten in Echtzeit an.', 'Jadwal digital baru menampilkan seluruh waktu keberangkatan secara waktu nyata.', '[ˈfaːɐ̯ˌplaːn]'],
  ['Sitzplatz', 'der', 'die Sitzplätze', 'Sitz·platz', 'Tempat duduk / Kursi penumpang', 'Perjalanan & Kota', 'A1', 'Im vollen Zug habe ich am Fenster noch einen freien Sitzplatz gefunden.', 'Di kereta yang penuh saya masih menemukan satu tempat duduk kosong di dekat jendela.', '[ˈzɪt͡sˌplat͡s]'],
  ['Stehplatz', 'der', 'die Stehplätze', 'Steh·platz', 'Tempat berdiri penumpang', 'Perjalanan & Kota', 'B1', 'Im Berufsverkehr gibt es in der Straßenbahn oft nur noch Stehplätze.', 'Pada jam sibuk sering kali hanya tersisa tempat berdiri di dalam trem.', '[ˈʃteːˌplat͡s]'],
  ['Notausgang', 'der', 'die Notausgänge', 'Not·aus·gang', 'Pintu darurat', 'Perjalanan & Kota', 'A2', 'Bitte achten Sie beim Einsteigen auf die markierten Notausgänge.', 'Mohon perhatikan pintu darurat yang ditandai saat naik ke pesawat/kereta.', '[ˈnoːtˌʔaʊ̯sɡaŋ]'],
  ['Rolltreppe', 'die', 'die Rolltreppen', 'Roll·trep·pe', 'Eskalator / Tangga berjalan', 'Perjalanan & Kota', 'A2', 'Nehmen Sie mit dem schweren Koffer lieber den Aufzug statt der Rolltreppe.', 'Dengan koper berat sebaiknya gunakan lift daripada eskalator.', '[ˈʁɔlˌtʁɛpə]'],
  ['Aufzug', 'der', 'die Aufzüge', 'Auf·zug', 'Lift', 'Perjalanan & Kota', 'A1', 'Der Aufzug bringt die Besucher direkt in den fünften Stock.', 'Lift membawa para pengunjung langsung ke lantai lima.', '[ˈaʊ̯fˌt͡suːk]'],
  ['Zebrastreifen', 'der', 'die Zebrastreifen', 'Ze·bra·strei·fen', 'Zebra cross (Penyeberangan jalan)', 'Perjalanan & Kota', 'A2', 'Am Zebrastreifen müssen Autos anhalten und Fußgänger überqueren lassen.', 'Di zebra cross mobil wajib berhenti dan memberi jalan bagi pejalan kaki.', '[ˈt͡seːbʁaˌʃtʁaɪ̯fn̩]'],
  ['Einbahnstraße', 'die', 'die Einbahnstraßen', 'Ein·bahn·stra·ße', 'Jalan satu arah', 'Perjalanan & Kota', 'A2', 'Achtung, in diese schmale Einbahnstraße darf man nur von Süden einfahren.', 'Perhatian, ke jalan satu arah sempit ini kendaraan hanya boleh masuk dari arah selatan.', '[ˈaɪ̯nbaːnˌʃtʁaːsə]'],
  ['Parkplatz', 'der', 'die Parkplätze', 'Park·platz', 'Tempat parkir', 'Perjalanan & Kota', 'A1', 'Vor dem Supermarkt gibt es einen großen kostenlosen Parkplatz.', 'Di depan supermarket terdapat tempat parkir gratis yang luas.', '[ˈpaʁkˌplat͡s]'],
  ['Kreisverkehr', 'der', 'die Kreisverkehre', 'Kreis·ver·kehr', 'Bundaran lalu lintas', 'Perjalanan & Kota', 'A2', 'Nehmen Sie im Kreisverkehr bitte die zweite Ausfahrt Richtung Zentrum.', 'Di bundaran lalu lintas silakan ambil pintu keluar kedua ke arah pusat kota.', '[ˈkʁaɪ̯sfɛɐ̯ˌkeːɐ̯]'],
  ['Botschaft', 'die', 'die Botschaften', 'Bot·schaft', 'Kedutaan besar / Pesan penting', 'Perjalanan & Kota', 'B1', 'Die Indonesische Botschaft in Berlin befindet sich im Stadtteil Tiergarten.', 'Kedutaan Besar Republik Indonesia di Berlin terletak di distrik Tiergarten.', '[ˈboːtʃaft]'],
  ['Konsulat', 'das', 'die Konsulate', 'Kon·su·lat', 'Konsulat', 'Perjalanan & Kota', 'B1', 'Für einen neuen Reisepass vereinbarte er einen Termin beim Konsulat.', 'Untuk pembuatan paspor baru ia membuat janji temu di konsulat.', '[kɔnzuˈlaːt]'],
  ['Aufenthaltserlaubnis', 'die', 'die Aufenthaltserlaubnisse', 'Auf·ent·halts·er·laub·nis', 'Izin tinggal resmi (Residence permit)', 'Perjalanan & Kota', 'B1', 'Vor Studienbeginn beantragte sie ihre Aufenthaltserlaubnis beim Bürgeramt.', 'Sebelum perkuliahan dimulai ia mengajukan izin tinggal di kantor layanan warga.', '[ˈaʊ̯fʔɛnthalt͡sʔɛɐ̯ˌlaʊ̯pnɪs]'],
  ['Bürgeramt', 'das', 'die Bürgerämter', 'Bür·ger·amt', 'Kantor catatan sipil / layanan warga', 'Perjalanan & Kota', 'B1', 'Nach dem Umzug muss man seine neue Adresse beim Bürgeramt anmelden.', 'Setelah pindah rumah, seseorang wajib melaporkan alamat barunya di kantor layanan warga.', '[ˈbʏʁɡɐˌʔamt]'],
  ['Fundbüro', 'das', 'die Fundbüros', 'Fund·bü·ro', 'Kantor barang hilang & temuan (Lost & Found)', 'Perjalanan & Kota', 'A2', 'Ich habe meinen verlorenen Regenschirm im Fundbüro am Bahnhof wiedergefunden.', 'Saya menemukan kembali payung saya yang hilang di kantor barang temuan stasiun.', '[ˈfʊntbyˌʁoː]'],
  ['Schalter', 'der', 'die Schalter', 'Schal·ter', 'Loket layanan / Sakelar', 'Perjalanan & Kota', 'A1', 'Sie können Ihre Fahrkarte auch persönlich am Schalter im Bahnhof kaufen.', 'Anda juga dapat membeli tiket secara langsung di loket stasiun.', '[ˈʃaltɐ]'],
  ['Briefmarke', 'die', 'die Briefmarken', 'Brief·mar·ke', 'Perangko', 'Kehidupan Sehari-hari', 'A1', 'Für die Postkarte nach Jakarta brauche ich noch eine internationale Briefmarke.', 'Untuk kartu pos ke Jakarta saya masih memerlukan selembar perangko internasional.', '[ˈbʁiːfˌmaʁkə]'],
  ['Paket', 'das', 'die Pakete', 'Pa·ket', 'Paket kiriman', 'Kehidupan Sehari-hari', 'A1', 'Der Zusteller hat heute Vormittag ein großes Paket für dich abgegeben.', 'Kurir tadi pagi mengantarkan sebuah paket besar untukmu.', '[paˈkeːt]'],
  ['Absender', 'der', 'die Absender', 'Ab·sen·der', 'Pengirim surat/paket', 'Kehidupan Sehari-hari', 'A2', 'Schreiben Sie Ihren Namen als Absender oben links auf den Briefumschlag.', 'Tuliskan nama Anda sebagai pengirim di pojok kiri atas amplop.', '[ˈapˌzɛndɐ]'],
  ['Empfänger', 'der', 'die Empfänger', 'Emp·fän·ger', 'Penerima surat/paket', 'Kehidupan Sehari-hari', 'A2', 'Die Adresse des Empfängers steht unten rechts auf dem Umschlag.', 'Alamat penerima tertulis di bagian kanan bawah amplop.', '[ɛmˈp͡fɛŋɐ]'],
  ['Geldautomat', 'der', 'die Geldautomaten', 'Geld·au·to·mat', 'Mesin ATM', 'Kehidupan Sehari-hari', 'A2', 'Direkt neben der Bankfiliale befindet sich ein Geldautomat.', 'Tepat di samping kantor cabang bank terdapat sebuah mesin ATM.', '[ˈɡɛltʔaʊ̯toˌmaːt]'],
  ['Überweisung', 'die', 'die Überweisungen', 'Ü·ber·wei·sung', 'Transfer bank / Surat rujukan dokter', 'Kehidupan Sehari-hari', 'B1', 'Ich bezahle die monatliche Stromrechnung bequem per Online-Überweisung.', 'Saya membayar tagihan listrik bulanan dengan mudah melalui transfer daring.', '[yːbɐˈvaɪ̯zʊŋ]'],
  ['Girokonto', 'das', 'die Girokonten', 'Gi·ro·kon·to', 'Rekening giro / tabungan transaksi', 'Kehidupan Sehari-hari', 'B1', 'Für das Gehalt und die Miete eröffnete er ein deutsches Girokonto.', 'Untuk keperluan gaji dan sewa rumah ia membuka rekening giro Jerman.', '[ˈʒiːʁoˌkɔnto]'],
  ['Versicherung', 'die', 'die Versicherungen', 'Ver·si·che·rung', 'Asuransi', 'Kehidupan Sehari-hari', 'B1', 'Eine private Haftpflichtversicherung ist im Alltag sehr empfehlenswert.', 'Asuransi tanggung gugat pribadi sangat dianjurkan dalam kehidupan sehari-hari.', '[fɛɐ̯ˈzɪçəʁʊŋ]'],
  ['Notruf', 'der', 'die Notrufe', 'Not·ruf', 'Nomor panggilan darurat', 'Kehidupan Sehari-hari', 'A2', 'In ganz Europa erreicht man die Feuerwehr und den Rettungsdienst über den Notruf 112.', 'Di seluruh Eropa pemadam kebakaran dan ambulans dapat dihubungi melalui nomor darurat 112.', '[ˈnoːtˌʁuːf]'],
  ['Feuerwehr', 'die', 'die Feuerwehren', 'Feu·er·wehr', 'Pemadam kebakaran', 'Kehidupan Sehari-hari', 'A2', 'Die Feuerwehr war innerhalb weniger Minuten am Einsatzort.', 'Pemadam kebakaran tiba di lokasi kejadian dalam hitungan menit.', '[ˈfɔʏ̯ɐˌveːɐ̯]'],
  ['Polizei', 'die', '— (Singularetantum)', 'Po·li·zei', 'Kepolisian', 'Kehidupan Sehari-hari', 'A1', 'Wenn Sie Ihren Ausweis verlieren, sollten Sie dies bei der Polizei melden.', 'Jika Anda kehilangan kartu identitas, sebaiknya laporkan ke kantor polisi.', '[poliˈt͡saɪ̯]'],
  ['Zahnarzt', 'der', 'die Zahnärzte', 'Zahn·arzt', 'Dokter gigi', 'Kehidupan Sehari-hari', 'A1', 'Zweimal im Jahr gehe ich zur Vorsorgeuntersuchung zum Zahnarzt.', 'Dua kali setahun saya pergi ke dokter gigi untuk pemeriksaan rutin.', '[ˈt͡saːnˌʔaːɐ̯t͡st]'],
  ['Schmerzmittel', 'das', 'die Schmerzmittel', 'Schmerz·mit·tel', 'Obat pereda nyeri', 'Kehidupan Sehari-hari', 'A2', 'Der Apotheker erklärte mir die genaue Dosierung des Schmerzmittels.', 'Apoteker menjelaskan kepada saya dosis tepat obat pereda nyeri tersebut.', '[ˈʃmɛʁt͡sˌmɪtl̩]'],
  ['Pflaster', 'das', 'die Pflaster', 'Pflas·ter', 'Plester luka', 'Kehidupan Sehari-hari', 'A2', 'Auf den kleinen Schnitt am Finger klebte er sofort ein sauberes Pflaster.', 'Pada luka iris kecil di jari ia segera menempelkan plester bersih.', '[ˈp͡flastɐ]'],
  ['Bewegung', 'die', 'die Bewegungen', 'Be·we·gung', 'Gerakan / Olahraga ringan', 'Kehidupan Sehari-hari', 'A2', 'Tägliche Bewegung an der frischen Luft stärkt das Immunsystem.', 'Gerakan olahraga harian di udara segar memperkuat sistem kekebalan tubuh.', '[bəˈveːɡʊŋ]'],
  ['Ernährung', 'die', '— (Singularetantum)', 'Er·näh·rung', 'Pola makan / Gizi nutrisi', 'Kehidupan Sehari-hari', 'B1', 'Eine ausgewogene Ernährung mit viel Gemüse hält den Körper fit.', 'Pola makan seimbang dengan banyak sayuran menjaga tubuh tetap bugar.', '[ɛɐ̯ˈnɛːʁʊŋ]'],
  ['Veranstaltungsort', 'der', 'die Veranstaltungsorte', 'Ver·an·stal·tungs·ort', 'Lokasi acara (Venue)', 'Kehidupan Sehari-hari', 'B1', 'Der Veranstaltungsort ist vom Hauptbahnhof aus bequem zu Fuß erreichbar.', 'Lokasi acara dapat dicapai dengan nyaman berjalan kaki dari stasiun utama.', '[fɛɐ̯ˈʔanʃtaltʊŋsˌʔɔʁt]'],
  ['Eintrittskarte', 'die', 'die Eintrittskarten', 'Ein·tritts·kar·te', 'Tiket masuk (konser/museum)', 'Kehidupan Sehari-hari', 'A2', 'Für Studierende kostet die Eintrittskarte ins Museum nur die Hälfte.', 'Bagi mahasiswa, tiket masuk ke museum hanya seharga setengahnya.', '[ˈaɪ̯ntʁɪt͡sˌkaʁtə]'],
  ['Ermäßigung', 'die', 'die Ermäßigungen', 'Er·mä·ßi·gung', 'Potongan harga khusus (Diskon pelajar/lansia)', 'Kehidupan Sehari-hari', 'B1', 'Mit einem gültigen Studentenausweis erhalten Sie an der Kasse eine Ermäßigung.', 'Dengan kartu mahasiswa yang berlaku Anda mendapatkan potongan harga di loket.', '[ɛɐ̯ˈmɛːsɪɡʊŋ]'],
  ['Bibliotheksausweis', 'der', 'die Bibliotheksausweise', 'Bi·bli·o·theks·aus·weis', 'Kartu anggota perpustakaan', 'Kerja & Studi', 'A2', 'Mit meinem neuen Bibliotheksausweis kann ich bis zu zwanzig Bücher ausleihen.', 'Dengan kartu anggota perpustakaan baru saya dapat meminjam hingga dua puluh buku.', '[biblioˈteːksˌʔaʊ̯svaɪ̯s]'],
  ['Leihfrist', 'die', 'die Leihfristen', 'Leih·frist', 'Masa pinjam buku', 'Kerja & Studi', 'B1', 'Die reguläre Leihfrist für Fachbücher beträgt vier Wochen.', 'Masa pinjam reguler untuk buku referensi adalah empat minggu.', '[ˈlaɪ̯ˌfʁɪst]'],
  ['Hörsaal', 'der', 'die Hörsäle', 'Hör·saal', 'Ruang auditorium kuliah', 'Kerja & Studi', 'B1', 'Im großen Hörsaal finden mehr als vierhundert Studierende Platz.', 'Di ruang auditorium kuliah besar tersedia tempat bagi lebih dari empat ratus mahasiswa.', '[ˈhøːɐ̯ˌzaːl]'],
  ['Mensa', 'die', 'die Mensen', 'Men·sa', 'Kantin universitas', 'Kerja & Studi', 'A2', 'In der Mensa gibt es jeden Tag drei preiswerte Mittagsgerichte.', 'Di kantin universitas tersedia tiga pilihan makan siang terjangkau setiap hari.', '[ˈmɛnza]'],
  ['Semesterbeitrag', 'der', 'die Semesterbeiträge', 'Se·mes·ter·bei·trag', 'Biaya administrasi semester', 'Kerja & Studi', 'B1', 'Im Semesterbeitrag ist meistens auch das Ticket für den Nahverkehr enthalten.', 'Dalam biaya administrasi semester biasanya sudah termasuk tiket transportasi umum lokal.', '[zeˈmɛstɐˌbaɪ̯tʁaːk]'],
  ['Sprechzeit', 'die', 'die Sprechzeiten', 'Sprech·zeit', 'Jam konsultasi dosen / kantor', 'Kerja & Studi', 'B1', 'Die wöchentliche Sprechzeit der Professorin findet dienstags von 14 bis 16 Uhr statt.', 'Jam konsultasi mingguan profesor tersebut berlangsung setiap Selasa pukul 14 hingga 16.', '[ˈʃpʁɛçˌt͡saɪ̯t]'],
  ['Praktikum', 'das', 'die Praktika', 'Prak·ti·kum', 'Magang kerja (Internship)', 'Kerja & Studi', 'A2', 'Während der Semesterferien absolviert er ein sechswöchiges Praktikum.', 'Selama liburan semester ia menjalani magang selama enam minggu.', '[ˈpʁaktikʊm]'],
  ['Zeugnis', 'das', 'die Zeugnisse', 'Zeug·nis', 'Ijazah / Rapor / Surat keterangan kerja', 'Kerja & Studi', 'A2', 'Fügen Sie Ihrer Bewerbung bitte Kopien Ihrer wichtigsten Zeugnisse bei.', 'Mohon lampirkan salinan ijazah terpenting Anda pada berkas lamaran.', '[ˈt͡sɔʏ̯knɪs]'],
  ['Kenntnisse', 'die', 'die Kenntnisse (Jamak)', 'Kennt·nis·se', 'Pengetahuan / Keterampilan keahlian', 'Kerja & Studi', 'B1', 'Gute Deutschkenntnisse sind in vielen internationalen Unternehmen gefragt.', 'Kemampuan bahasa Jerman yang baik sangat dibutuhkan di banyak perusahaan internasional.', '[ˈkɛntnɪsə]'],
  ['Teilnehmer', 'der', 'die Teilnehmer', 'Teil·neh·mer', 'Peserta', 'Kerja & Studi', 'A2', 'Jeder Teilnehmer des Kurses erhält am Ende eine Teilnahmebescheinigung.', 'Setiap peserta kursus menerima sertifikat keikutsertaan di akhir program.', '[ˈtaɪ̯lˌneːmɐ]'],
  ['Aufmerksamkeit', 'die', '— (Singularetantum)', 'Auf·merk·sam·keit', 'Perhatian / Konsentrasi', 'Kerja & Studi', 'B1', 'Ich danke Ihnen herzlich für Ihre Aufmerksamkeit während des Vortrags.', 'Saya mengucapkan terima kasih banyak atas perhatian Anda selama presentasi.', '[ˈaʊ̯fmɛʁkzamˌkaɪ̯t]'],
  ['Gedächtnis', 'das', '— (Singularetantum)', 'Ge·dächt·nis', 'Ingatan / Memori', 'Kerja & Studi', 'B1', 'Wiederholung in festen Zeitabständen verankert Wörter fest im Gedächtnis.', 'Pengulangan dalam jeda waktu teratur menanamkan kata dengan kuat di dalam ingatan.', '[ɡəˈdɛçtnɪs]'],
  ['Aussprachetraining', 'das', 'die Aussprachetrainings', 'Aus·spra·che·trai·ning', 'Pelatihan pengucapan', 'Kerja & Studi', 'A2', 'Zehn Minuten tägliches Aussprachetraining bringen mehr als seltenes Pauken.', 'Sepuluh menit pelatihan pengucapan setiap hari jauh lebih efektif daripada belajar kebut semalam.', '[ˈaʊ̯sʃpʁaːxəˌtʁɛːnɪŋ]'],
];

function detectMouthShapeExtended(word: string): MouthShapeType {
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

function generatePhoneticFocusExtended(
  word: string,
  syllables: string[]
): string {
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

function generateArticulationTipExtended(word: string): string {
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

export const EXTENDED_GERMAN_VOCABULARY: VocabItem[] = RAW_EXTENDED_ROWS.map(
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
      customIpa,
    ] = row;
    const syllables = syllableStr
      .split('·')
      .map((s) => s.trim())
      .filter(Boolean);
    const ipa = customIpa || generateGermanIpa(word);

    return {
      id: `ext-voc-${idx + 1}`,
      word,
      article,
      plural,
      ipa,
      syllables: syllables.length > 0 ? syllables : [word],
      meaningId,
      category:
        (category as string) === 'Kuliner & Rumah'
          ? 'Kuliner & Kafe'
          : category,
      level,
      exampleDe,
      exampleId,
      phoneticFocus: generatePhoneticFocusExtended(word, syllables),
      articulationTip: generateArticulationTipExtended(word),
      mouthShape: detectMouthShapeExtended(word),
      srsBox: ((idx % 4) + 1) as 1 | 2 | 3 | 4,
      nextReviewLabel:
        idx % 4 === 0
          ? 'Hari Ini'
          : idx % 4 === 1
          ? 'Besok (1 Hari)'
          : idx % 4 === 2
          ? '3 Hari'
          : '7 Hari',
      mastered: idx % 7 === 0,
      reviewCount: (idx % 4) + 1,
      lastAccuracy: 84 + (idx % 14),
    };
  }
);
