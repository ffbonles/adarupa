import { Category, Subcategory, ContentItem, CulturalEvent, Series, MediaAsset, AdminUser } from '../types';

export const INITIAL_CATEGORIES: Category[] = [
  {
    category_id: 'cat_lalakon',
    slug: 'lalakon',
    name: 'Lalakon',
    description: 'Film dan kisah visual bertutur budaya nusantara dari berbagai penjuru kepulauan.',
    icon: 'Film',
    display_order: 1,
    is_active: true
  },
  {
    category_id: 'cat_gema_swara',
    slug: 'gema-swara',
    name: 'Gema Swara',
    description: 'Dongeng audio, sandiwara radio, podcast budaya, dan kidung musik tradisi.',
    icon: 'Headphones',
    display_order: 2,
    is_active: true
  },
  {
    category_id: 'cat_gelanggang',
    slug: 'gelanggang',
    name: 'Gelanggang',
    description: 'Tutorial, aturan, dan ensiklopedia permainan tradisional warisan leluhur.',
    icon: 'Gamepad2',
    display_order: 3,
    is_active: true
  },
  {
    category_id: 'cat_pagelaran',
    slug: 'pagelaran',
    name: 'Pagelaran',
    description: 'Agenda festival budaya, pertunjukan seni panggung, dan upacara adat se-Indonesia.',
    icon: 'Calendar',
    display_order: 4,
    is_active: true
  }
];

export const INITIAL_SUBCATEGORIES: Subcategory[] = [
  // Lalakon
  { subcategory_id: 'sub_l1', category_id: 'lalakon', slug: 'cerita-rakyat', name: 'Cerita Rakyat', description: 'Kisah tutur kearifan lokal daerah', display_order: 1, is_active: true },
  { subcategory_id: 'sub_l2', category_id: 'lalakon', slug: 'legenda-nusantara', name: 'Legenda Nusantara', description: 'Asal usul tempat dan mitologi kepulauan', display_order: 2, is_active: true },
  { subcategory_id: 'sub_l3', category_id: 'lalakon', slug: 'animasi-nusantara', name: 'Animasi Nusantara', description: 'Animasi visual untuk anak dan keluarga', display_order: 3, is_active: true },
  { subcategory_id: 'sub_l4', category_id: 'lalakon', slug: 'film-pendek', name: 'Film Pendek', description: 'Karya sinematik kreator budaya lokal', display_order: 4, is_active: true },
  { subcategory_id: 'sub_l5', category_id: 'lalakon', slug: 'dokumenter-budaya', name: 'Dokumenter Budaya', description: 'Eksplorasi mendalam tradisi yang bertahan', display_order: 5, is_active: true },
  { subcategory_id: 'sub_l6', category_id: 'lalakon', slug: 'seni-pertunjukan', name: 'Seni Pertunjukan', description: 'Rekaman panggung tari, teater dan wayang', display_order: 6, is_active: true },

  // Gema Swara
  { subcategory_id: 'sub_g1', category_id: 'gema-swara', slug: 'dongeng-audio', name: 'Dongeng Audio', description: 'Kisah fabel dan kearifan untuk keluarga', display_order: 1, is_active: true },
  { subcategory_id: 'sub_g2', category_id: 'gema-swara', slug: 'sandiwara-radio', name: 'Sandiwara Radio', description: 'Drama suara epik bertema sejarah kerajaan', display_order: 2, is_active: true },
  { subcategory_id: 'sub_g3', category_id: 'gema-swara', slug: 'podcast-nusantara', name: 'Podcast Nusantara', description: 'Bincang mendalam dengan budayawan dan maestro', display_order: 3, is_active: true },
  { subcategory_id: 'sub_g4', category_id: 'gema-swara', slug: 'kisah-sejarah', name: 'Kisah Sejarah', description: 'Naratif peradaban kepulauan nusantara', display_order: 4, is_active: true },
  { subcategory_id: 'sub_g5', category_id: 'gema-swara', slug: 'musik-tradisi', name: 'Musik dan Suara Tradisi', description: 'Lanskap bunyi gamelan, sasando, dan seruling', display_order: 5, is_active: true },

  // Gelanggang
  { subcategory_id: 'sub_gl1', category_id: 'gelanggang', slug: 'permainan-papan', name: 'Permainan Papan', description: 'Permainan strategi di atas papan kayu', display_order: 1, is_active: true },
  { subcategory_id: 'sub_gl2', category_id: 'gelanggang', slug: 'permainan-kelompok', name: 'Permainan Kelompok', description: 'Permainan lapangan dan kebersamaan tim', display_order: 2, is_active: true },
  { subcategory_id: 'sub_gl3', category_id: 'gelanggang', slug: 'permainan-ketangkasan', name: 'Permainan Ketangkasan', description: 'Uji keseimbangan dan ketangkasan fisik', display_order: 3, is_active: true },
  { subcategory_id: 'sub_gl4', category_id: 'gelanggang', slug: 'permainan-strategi', name: 'Permainan Strategi', description: 'Asah taktik dan perhitungan langkah', display_order: 4, is_active: true },
  { subcategory_id: 'sub_gl5', category_id: 'gelanggang', slug: 'permainan-daerah', name: 'Permainan Daerah', description: 'Warisan khas suku tertentu', display_order: 5, is_active: true },

  // Pagelaran
  { subcategory_id: 'sub_p1', category_id: 'pagelaran', slug: 'festival-budaya', name: 'Festival Budaya', description: 'Pesta rakyat dan karnaval budaya', display_order: 1, is_active: true },
  { subcategory_id: 'sub_p2', category_id: 'pagelaran', slug: 'pertunjukan-seni', name: 'Pertunjukan Seni', description: 'Pentas tari, musik tradisi, dan teater', display_order: 2, is_active: true },
  { subcategory_id: 'sub_p3', category_id: 'pagelaran', slug: 'pameran-budaya', name: 'Pameran Budaya', description: 'Eksibisi artefak, batik, keris, dan seni kriya', display_order: 3, is_active: true },
  { subcategory_id: 'sub_p4', category_id: 'pagelaran', slug: 'upacara-adat', name: 'Upacara Adat', description: 'Ritual tahunan dan perayaan syukuran daerah', display_order: 4, is_active: true },
  { subcategory_id: 'sub_p5', category_id: 'pagelaran', slug: 'lokakarya-edukasi', name: 'Lokakarya dan Edukasi', description: 'Kelas membuat batik, menari, dan membatik', display_order: 5, is_active: true }
];

export const INITIAL_SERIES: Series[] = [
  {
    series_id: 'ser_tutur_tinular',
    title: 'Tutur Tinular: Kidung Singasari & Majapahit',
    slug: 'tutur-tinular-kidung-singasari',
    description: 'Kisah drama audio klasik tentang petualangan Arya Kamandanu di masa runtuhnya Singasari dan bangkitnya Wangsa Majapahit.',
    category_id: 'gema-swara',
    cover_url: '',
    publication_status: 'published',
    total_episodes: 3
  },
  {
    series_id: 'ser_jejak_rempah',
    title: 'Podcast Jejak Rempah Kepulauan Banda',
    slug: 'podcast-jejak-rempah-banda',
    description: 'Eksplorasi audio perjalanan aroma pala dan cengkeh yang mengubah peta perdagangan maritim dunia.',
    category_id: 'gema-swara',
    cover_url: '',
    publication_status: 'published',
    total_episodes: 2
  }
];

export const INITIAL_CONTENT: ContentItem[] = [
  // LALAKON (Film & Visual Storytelling)
  {
    content_id: 'cnt_lalakon_01',
    slug: 'legenda-sangkuriang-dan-gunung-tangkuban-parahu',
    title: 'Legenda Sangkuriang & Gunung Tangkuban Parahu',
    description: 'Kisah klasik dari Tatar Sunda tentang ikhtiar membuat danau dan perahu raksasa dalam semalam demi cinta Dayang Sumbi yang berujung pada terbentuknya kawah vulkanik Tangkuban Parahu.',
    category_id: 'lalakon',
    subcategory_id: 'sub_l2',
    subcategory_name: 'Legenda Nusantara',
    content_type: 'video',
    origin_province: 'Jawa Barat',
    origin_city: 'Bandung Barat',
    duration_seconds: 1420, // 23 menit 40 detik
    cover_url: '',
    media_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    drive_file_id: '1aB2c3D4e5F6g7H8i9J0kL_sangkuriang',
    publication_status: 'published',
    is_featured: true,
    published_at: '2026-02-14T08:00:00Z',
    created_at: '2026-02-10T04:00:00Z',
    updated_at: '2026-02-14T08:00:00Z',
    credits: {
      director_or_teller: 'Raden Asep Sunarya & Tim Animasi Budaya',
      production_or_source: 'Sanggar Budaya Parahyangan',
      cultural_consultant: 'Prof. Dr. Ayatrohaedi (Balai Bahasa Jawa Barat)',
      license: 'Lisensi Kebudayaan Terbuka Nusantara'
    }
  },
  {
    content_id: 'cnt_lalakon_02',
    slug: 'kisah-asal-mula-danau-toba-dan-pulau-samosir',
    title: 'Asal Mula Danau Toba & Pulau Samosir',
    description: 'Tutur hikmah dari tanah Batak tentang janji seorang pemuda bernama Toba kepada putri jelmaan ikan mas yang tak boleh diingkari, melahirkan danau vulkanik kaldera terbesar di dunia.',
    category_id: 'lalakon',
    subcategory_id: 'sub_l2',
    subcategory_name: 'Legenda Nusantara',
    content_type: 'video',
    origin_province: 'Sumatera Utara',
    origin_city: 'Toba Samosir',
    duration_seconds: 1080,
    cover_url: '',
    media_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    drive_file_id: '1xY2z3A4b5C6d7E8f9G0hI_danau_toba',
    publication_status: 'published',
    is_featured: true,
    published_at: '2026-03-01T09:30:00Z',
    created_at: '2026-02-25T07:15:00Z',
    updated_at: '2026-03-01T09:30:00Z',
    credits: {
      director_or_teller: 'Ompu Tiurma Simanjuntak',
      production_or_source: 'Komunitas Pusuk Buhit Media',
      cultural_consultant: 'Lembaga Adat Batak Toba',
      license: 'Domain Publik Budaya'
    }
  },
  {
    content_id: 'cnt_lalakon_03',
    slug: 'dokumenter-tenun-ikat-pewarna-alam-sumba-timur',
    title: 'Dokumenter: Jiwa Pada Sehelai Tenun Ikat Sumba Timur',
    description: 'Menelusuri proses sakral penenunan kain tradisional di desa Prailiu Sumba Timur, mulai dari pemintalan kapas lokal, pewarnaan akar mengkudu dan tarum, hingga pembacaan motif kuda dan buaya.',
    category_id: 'lalakon',
    subcategory_id: 'sub_l5',
    subcategory_name: 'Dokumenter Budaya',
    content_type: 'video',
    origin_province: 'Nusa Tenggara Timur',
    origin_city: 'Sumba Timur',
    duration_seconds: 1840,
    cover_url: '',
    media_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    drive_file_id: '1mN2o3P4q5R6s7T8u9V0wX_tenun_sumba',
    publication_status: 'published',
    is_featured: false,
    published_at: '2026-03-12T14:00:00Z',
    created_at: '2026-03-08T11:00:00Z',
    updated_at: '2026-03-12T14:00:00Z',
    credits: {
      director_or_teller: 'Maria Rambu Koni',
      production_or_source: 'Yayasan Sahabat Tenun Nusantara',
      cultural_consultant: 'Tetua Adat Kampung Lambanapu',
      license: 'Arsip Kebudayaan Kemendikbud'
    }
  },
  {
    content_id: 'cnt_lalakon_04',
    slug: 'seni-pertunjukan-tari-saman-kecepatan-dan-harmoni-gayo',
    title: 'Seni Pertunjukan: Kecepatan & Harmoni Tari Saman Gayo',
    description: 'Dokumentasi pertunjukan Tari Saman seribu tangan di Dataran Tinggi Gayo. Ritme tepukan dada dan paha berpadu syair puji-pujian yang diakui UNESCO sebagai Warisan Budaya Takbenda Dunia.',
    category_id: 'lalakon',
    subcategory_id: 'sub_l6',
    subcategory_name: 'Seni Pertunjukan',
    content_type: 'video',
    origin_province: 'Aceh',
    origin_city: 'Gayo Lues',
    duration_seconds: 960,
    cover_url: '',
    media_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    drive_file_id: '1jK2l3M4n5O6p7Q8r9S0tU_tari_saman',
    publication_status: 'published',
    is_featured: false,
    published_at: '2026-04-02T10:00:00Z',
    created_at: '2026-03-28T09:00:00Z',
    updated_at: '2026-04-02T10:00:00Z',
    credits: {
      director_or_teller: 'Syekh M. Ali Gayo',
      production_or_source: 'Dewan Kesenian Aceh',
      cultural_consultant: 'Balai Pelestarian Nilai Budaya Banda Aceh',
      license: 'Warisan UNESCO - Dokumentasi Budaya'
    }
  },

  // GEMA SWARA (Audio Storytelling & Radio Drama)
  {
    content_id: 'cnt_gema_01',
    slug: 'tutur-tinular-episode-1-lahirnya-keris-naga-puspa',
    title: 'Tutur Tinular: Lahirnya Pedang Naga Puspa (Bagian 1)',
    description: 'Sandiwara radio legendaris karya S. Tidjab. Menghidupkan kembali kisah tempaan pusaka sakti oleh Mpu Ranubhaya di tengah bayang-bayang ekspedisi tentara Kubilai Khan menuju Jawa Dwipa.',
    category_id: 'gema-swara',
    subcategory_id: 'sub_g2',
    subcategory_name: 'Sandiwara Radio',
    content_type: 'audio',
    origin_province: 'Jawa Timur',
    origin_city: 'Mojokerto',
    duration_seconds: 1680, // 28 menit
    cover_url: '',
    media_url: 'https://cdn.freesound.org/previews/612/612085_5674468-lq.mp3',
    drive_file_id: '2aB3cD4e5F6g7H8i9J0kL_tutur_ep1',
    series_id: 'ser_tutur_tinular',
    series_title: 'Tutur Tinular: Kidung Singasari & Majapahit',
    episode_number: 1,
    publication_status: 'published',
    is_featured: true,
    published_at: '2026-01-20T12:00:00Z',
    created_at: '2026-01-15T09:00:00Z',
    updated_at: '2026-01-20T12:00:00Z',
    credits: {
      director_or_teller: 'S. Tidjab & Sanggar Prathivi',
      production_or_source: 'Restorasi Pita Master Radio Antar Kota',
      cultural_consultant: 'Masyarakat Sejarah Indonesia',
      license: 'Hak Siar Budaya Terdaftar'
    },
    audio_transcript: 'Gamelan slendro mengalun pelan membuka kisah malam di lereng Gunung Bromo. Angin berdesir kencang saat dentang palu Mpu Ranubhaya menghantam besi baja pilihan...'
  },
  {
    content_id: 'cnt_gema_02',
    slug: 'tutur-tinular-episode-2-kidung-cinta-di-lereng-bromo',
    title: 'Tutur Tinular: Sumpah di Hutan Tarik (Bagian 2)',
    description: 'Lanjutan sandiwara radio Tutur Tinular. Pertemuan takdir Arya Kamandanu dengan Mei Shin dan janji setia di antara desingan busur panah prajurit Mongol.',
    category_id: 'gema-swara',
    subcategory_id: 'sub_g2',
    subcategory_name: 'Sandiwara Radio',
    content_type: 'audio',
    origin_province: 'Jawa Timur',
    origin_city: 'Mojokerto',
    duration_seconds: 1540,
    cover_url: '',
    media_url: 'https://cdn.freesound.org/previews/612/612085_5674468-lq.mp3',
    drive_file_id: '2bC3dE4f5G6h7I8j9K0lM_tutur_ep2',
    series_id: 'ser_tutur_tinular',
    series_title: 'Tutur Tinular: Kidung Singasari & Majapahit',
    episode_number: 2,
    publication_status: 'published',
    is_featured: false,
    published_at: '2026-01-27T12:00:00Z',
    created_at: '2026-01-22T08:00:00Z',
    updated_at: '2026-01-27T12:00:00Z',
    credits: {
      director_or_teller: 'S. Tidjab & Sanggar Prathivi',
      production_or_source: 'Restorasi Pita Master Radio Antar Kota',
      license: 'Hak Siar Budaya Terdaftar'
    }
  },
  {
    content_id: 'cnt_gema_03',
    slug: 'dongeng-audio-timun-mas-dan-biji-mentimun-keberanian',
    title: 'Dongeng Audio: Timun Mas & Biji Mentimun Keberanian',
    description: 'Tutur audio mendalam untuk anak dan keluarga. Menarasikan kecerdikan Mbok Srini dan putrinya Timun Mas saat menghadapi ancaman Raksasa Ijo dengan bekal garam, terasi, jarum, dan biji mentimun ajaib.',
    category_id: 'gema-swara',
    subcategory_id: 'sub_g1',
    subcategory_name: 'Dongeng Audio',
    content_type: 'audio',
    origin_province: 'Jawa Tengah',
    origin_city: 'Sragen',
    duration_seconds: 890,
    cover_url: '',
    media_url: 'https://cdn.freesound.org/previews/612/612085_5674468-lq.mp3',
    drive_file_id: '2cD4eE5f6G7h8I9j0K1lN_timun_mas',
    publication_status: 'published',
    is_featured: true,
    published_at: '2026-02-18T10:00:00Z',
    created_at: '2026-02-12T07:00:00Z',
    updated_at: '2026-02-18T10:00:00Z',
    credits: {
      director_or_teller: 'Kak Agus DS (Pendongeng Nusantara)',
      production_or_source: 'Rumah Dongeng Sahabat Anak',
      cultural_consultant: 'Balai Bahasa Jawa Tengah',
      license: 'Lisensi Kreatif Terbuka'
    },
    audio_transcript: 'Alkisah di sebuah desa dekat hutan yang sunyi, hiduplah seorang janda tua bernama Mbok Srini yang setiap petang menatap ladang kosong dengan kerinduan akan seorang anak...'
  },
  {
    content_id: 'cnt_gema_04',
    slug: 'suara-alam-dan-kidung-sasando-pulau-rote',
    title: 'Lanskap Bunyi: Kidung Sasando & Desir Ombak Pulau Rote',
    description: 'Rekaman audio imersif dari pantai Nembrala di Pulau Rote, memadukan petikan dawai sasando lontar karya maestro Obe Thonak dengan debur laut selatan dan angin senja.',
    category_id: 'gema-swara',
    subcategory_id: 'sub_g5',
    subcategory_name: 'Musik dan Suara Tradisi',
    content_type: 'audio',
    origin_province: 'Nusa Tenggara Timur',
    origin_city: 'Rote Ndao',
    duration_seconds: 1210,
    cover_url: '',
    media_url: 'https://cdn.freesound.org/previews/612/612085_5674468-lq.mp3',
    drive_file_id: '2dE5fG6h7I8j9K0l1M2nO_sasando_rote',
    publication_status: 'published',
    is_featured: false,
    published_at: '2026-03-05T15:00:00Z',
    created_at: '2026-03-01T04:00:00Z',
    updated_at: '2026-03-05T15:00:00Z',
    credits: {
      director_or_teller: 'Obe Thonak (Maestro Sasando Rote)',
      production_or_source: 'Laboratorium Etnomusikologi Kupang',
      cultural_consultant: 'Dinas Kebudayaan NTT',
      license: 'Arsip Bunyi Warisan Nusantara'
    }
  },

  // GELANGGANG (Traditional Games & Tutorials)
  {
    content_id: 'cnt_gelanggang_01',
    slug: 'tutorial-permainan-tradisional-congklak-dhakon',
    title: 'Congklak (Dhakon): Taktik Berhitung & Filosofi Menabung',
    description: 'Panduan lengkap cara bermain permainan papan tertua di kepulauan nusantara. Mengajarkan strategi menabur biji kerang, mengisi lumbung rumah sendiri, dan kearifan menahan keserakahan.',
    category_id: 'gelanggang',
    subcategory_id: 'sub_gl1',
    subcategory_name: 'Permainan Papan',
    content_type: 'video',
    origin_province: 'DI Yogyakarta',
    origin_city: 'Yogyakarta',
    duration_seconds: 720,
    cover_url: '',
    media_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4',
    drive_file_id: '3aB4cD5e6F7g8H9i0J1kL_congklak',
    publication_status: 'published',
    is_featured: true,
    published_at: '2026-01-10T07:00:00Z',
    created_at: '2026-01-05T06:00:00Z',
    updated_at: '2026-01-10T07:00:00Z',
    credits: {
      director_or_teller: 'Komunitas Kampoeng Hompimpa',
      production_or_source: 'Pusat Pelestarian Permainan Rakyat',
      cultural_consultant: 'KRT Jatiningrat (Keraton Ngayogyakarta)',
      license: 'Panduan Terbuka Edukasi Anak'
    },
    tutorial_data: {
      equipment: ['1 buah papan congklak kayu (14 lubang kecil dan 2 lubang lumbung besar)', '98 butir biji kerang cowrie atau biji sawo kecik'],
      players_count: '2 orang pemain saling berhadapan',
      rules: [
        'Setiap lubang kecil diisi masing-masing 7 butir biji pada awal permainan.',
        'Kedua lumbung besar milik masing-masing pemain dibiarkan kosong di awal.',
        'Pemain memilih satu lubang di sisinya, mengambil semua biji, dan menaburkannya satu per satu searah jarum jam.',
        'Lumbung lawan tidak boleh diisi saat memutar.',
        'Bila biji terakhir jatuh di lubang kosong di sisi sendiri, pemain berhak menembak (mengambil) seluruh biji di lubang lawan yang berhadapan langsung.',
        'Permainan selesai saat seluruh lubang kecil kosong; pemenang adalah yang mengumpulkan biji terbanyak di lumbung besarnya.'
      ],
      instructions: [
        'Langkah 1: Letakkan papan congklak secara mendatar di antara kedua pemain.',
        'Langkah 2: Isi tiap 14 lubang kecil dengan 7 biji kerang secara merata.',
        'Langkah 3: Lakukan suit/hompimpa untuk menentukan siapa yang memegang giliran pertama.',
        'Langkah 4: Jalankan biji dari lubang manapun di area Anda menuju lumbung sendiri.',
        'Langkah 5: Hitung total lumbung pada akhir sesi untuk menentukan juara.'
      ],
      safety_notes: 'Pastikan biji congklak tidak ditelan oleh anak balita di bawah usia 3 tahun. Disarankan bermain di atas meja atau karpet yang datar.',
      related_games: ['Engklek', 'Dakon Surakarta', 'Bekel']
    }
  },
  {
    content_id: 'cnt_gelanggang_02',
    slug: 'tutorial-permainan-kelompok-gobak-sodor-galasin',
    title: 'Gobak Sodor (Galasin): Kelincahan & Kerja Sama Garis Pertahanan',
    description: 'Permainan beregu legendaris di tanah lapang bergaris kisi-kisi. Melatih ketangkasan menghindar, kerja sama menjaga pintu masuk, dan strategi menembus pertahanan lawan.',
    category_id: 'gelanggang',
    subcategory_id: 'sub_gl2',
    subcategory_name: 'Permainan Kelompok',
    content_type: 'video',
    origin_province: 'Jawa Tengah',
    origin_city: 'Semarang',
    duration_seconds: 840,
    cover_url: '',
    media_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4',
    drive_file_id: '3bC5dE6f7G8h9I0j1K2lM_gobak_sodor',
    publication_status: 'published',
    is_featured: true,
    published_at: '2026-02-05T08:00:00Z',
    created_at: '2026-02-01T05:00:00Z',
    updated_at: '2026-02-05T08:00:00Z',
    credits: {
      director_or_teller: 'Klub Olahraga Tradisional Indonesia (KOTI)',
      production_or_source: 'Federasi Permainan Tradisional Jawa Tengah',
      cultural_consultant: 'Dr. Hari Suroto (Etnolog Nusantara)',
      license: 'Materi Olahraga Rekreasi Nasional'
    },
    tutorial_data: {
      equipment: ['Lapangan datar ukuran 9 x 4 meter dengan garis kapur atau cat lapangan', 'Peluit atau bendera penanda batas'],
      players_count: '2 tim beranggotakan 4–5 orang per tim (Penjaga dan Penyerang)',
      rules: [
        'Lapangan dibagi menjadi 6 kotak dengan 1 garis horizontal panjang sebagai jalur sodor tengah.',
        'Tim penjaga hanya boleh bergerak di sepanjang garis batas yang telah ditentukan.',
        'Penjaga garis sodor di tengah memiliki hak gerak memanjang menyilang lapangan.',
        'Tim penyerang harus berusaha melewati seluruh garis batas hingga ujung dan kembali ke garis awal tanpa tersentuh tangan penjaga.',
        'Bila seorang penyerang berhasil bolak-balik tanpa tersentuh, timnya mendapat 1 angka penuh (sodor).'
      ],
      instructions: [
        'Langkah 1: Buat garis lapangan berbentuk persegi panjang dengan 6 kotak petak.',
        'Langkah 2: Tentukan penjaga garis depan, samping, dan penjaga garis sodor tengah.',
        'Langkah 3: Tim penyerang bersiap di garis start luar.',
        'Langkah 4: Lakukan manuver gerak tipu dan koordinasi kawan untuk menembus pertahanan lawan.',
        'Langkah 5: Rayakan angka kemenangan bila semua garis sukses dilewati.'
      ],
      safety_notes: 'Gunakan sepatu olahraga dengan cengkeraman baik agar tidak tergelincir saat bermanuver di lapangan rumput atau semen halus.',
      related_games: ['Bentengan', 'Kasti', 'Galah Asin']
    }
  },
  {
    content_id: 'cnt_gelanggang_03',
    slug: 'tutorial-permainan-ketangkasan-egrang-bambu',
    title: 'Egrang Bambu: Keseimbangan Tubuh & Keberanian Langkah',
    description: 'Permainan menaiki sepasang tongkat bambu tinggi dengan pijakan kaki. Menuntut keseimbangan prima, ritme gerak melangkah, dan konsentrasi tinggi.',
    category_id: 'gelanggang',
    subcategory_id: 'sub_gl3',
    subcategory_name: 'Permainan Ketangkasan',
    content_type: 'video',
    origin_province: 'Jawa Barat',
    origin_city: 'Garut',
    duration_seconds: 680,
    cover_url: '',
    media_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4',
    drive_file_id: '3cD6eF7g8H9i0J1k2L3mN_egrang_bambu',
    publication_status: 'published',
    is_featured: false,
    published_at: '2026-02-28T09:00:00Z',
    created_at: '2026-02-20T04:00:00Z',
    updated_at: '2026-02-28T09:00:00Z',
    credits: {
      director_or_teller: 'Komunitas Egrang Tatar Galuh',
      production_or_source: 'Balai Pelestarian Kebudayaan Wilayah IX',
      license: 'Edukasi Olahraga Tradisional'
    },
    tutorial_data: {
      equipment: ['2 batang bambu wulung atau tali tua panjang 2–2.5 meter', 'Kayu pijakan kaki tebal 5 cm yang dipasak kokoh setinggi 30–50 cm dari tanah'],
      players_count: '1 orang per alat (dapat dilombakan antar 2–8 pemain)',
      rules: [
        'Pemain harus menaiki pijakan dengan kedua kaki tanpa bantuan dinding atau orang lain.',
        'Kedua tangan memegang erat ujung atas bambu tepat setinggi dada.',
        'Langkah dijaga seirama: bambu kanan diangkat bersamaan dengan kaki kanan.',
        'Pemain yang kakinya menyentuh tanah dianggap gugur atau harus mengulang dari garis batas.'
      ],
      instructions: [
        'Langkah 1: Berdirilah di belakang kedua bambu egrang yang ditarik sedikit condong ke depan.',
        'Langkah 2: Naikkan kaki yang paling dominan ke pijakan, lalu susul dengan hentakan kaki satunya.',
        'Langkah 3: Langsung ambil langkah pertama ke depan tanpa berhenti agar momentum keseimbangan terjaga.',
        'Langkah 4: Jaga pandangan lurus ke arah jalan, bukan menatap ke bawah kaki.'
      ],
      safety_notes: 'Latihlah pemula di atas permukaan tanah berumput atau pasir empuk. Selalu periksa kekokohan pasak pijakan bambu sebelum digunakan.',
      related_games: ['Bakiak Panjang', 'Tarik Tambang Tradisional']
    }
  }
];

export const INITIAL_EVENTS: CulturalEvent[] = [
  {
    event_id: 'ev_01',
    slug: 'festival-payung-indonesia-2026-solo',
    title: 'Festival Payung Indonesia 2026 (FPI Solo)',
    description: 'Perhelatan akbar bertaraf internasional yang merayakan seni kerajinan payung tradisi dari berbagai daerah nusantara serta delegasi mancanegara. Menampilkan instalasi ribuan payung lukis kain mori, pasar seni rakyat, panggung tari kontemporer, dan lokakarya melukis payung mutihan.',
    category: 'Festival Budaya',
    province: 'Jawa Tengah',
    city: 'Surakarta (Solo)',
    venue: 'Halaman Pura Mangkunegaran & Taman Balekambang',
    address: 'Jl. Ronggowarsito No.83, Keprabon, Kec. Banjarsari, Kota Surakarta',
    start_datetime: '2026-11-12T09:00:00+07:00',
    end_datetime: '2026-11-15T21:00:00+07:00',
    organizer: 'Mataya Heritage & Pemerintah Kota Surakarta',
    poster_url: '',
    official_source_url: 'https://surakarta.go.id/agenda-budaya',
    registration_url: 'https://festivalpayung.id/registrasi',
    verification_status: 'verified',
    publication_status: 'published',
    event_status: 'upcoming',
    created_at: '2026-03-01T10:00:00Z',
    updated_at: '2026-03-10T12:00:00Z'
  },
  {
    event_id: 'ev_02',
    slug: 'pesta-kesenian-bali-ke-48-taman-budaya-art-centre',
    title: 'Pesta Kesenian Bali (PKB) Ke-48 Denpasar',
    description: 'Pesta kesenian terlama dan terbesar di Pulau Dewata. Menampilkan pawai agung gamelan gong kebyar, parade tari barong se-kabupaten, lomba mebanyolan, pameran lukisan klasik Kamasan, serta kuliner otentik Bali dari dapur desa adat.',
    category: 'Festival Budaya',
    province: 'Bali',
    city: 'Denpasar',
    venue: 'Taman Budaya Denpasar (Art Centre Denpasar)',
    address: 'Jl. Nusa Indah No.1, Panjer, Kec. Denpasar Selatan, Kota Denpasar',
    start_datetime: '2026-12-05T08:30:00+08:00',
    end_datetime: '2026-12-28T22:00:00+08:00',
    organizer: 'Dinas Kebudayaan Provinsi Bali & Majelis Desa Adat',
    poster_url: '',
    official_source_url: 'https://disbud.baliprov.go.id',
    registration_url: 'https://pkb.baliprov.go.id/tiket',
    verification_status: 'verified',
    publication_status: 'published',
    event_status: 'upcoming',
    created_at: '2026-03-05T08:00:00Z',
    updated_at: '2026-03-15T11:00:00Z'
  },
  {
    event_id: 'ev_03',
    slug: 'dieng-culture-festival-ruwatan-rambut-gimbal',
    title: 'Dieng Culture Festival: Ruwatan Rambut Gimbal',
    description: 'Ritual pemotongan rambut gimbal anak-anak titipan Kiai Kolodete di Dataran Tinggi Dieng yang diselimuti kabut purba. Dimeriahkan oleh festival jazz atas awan, pelepasan lampion ramah lingkungan, dan ekspedisi candi Hindu tertua di Jawa.',
    category: 'Upacara Adat',
    province: 'Jawa Tengah',
    city: 'Banjarnegara',
    venue: 'Kompleks Candi Arjuna, Dataran Tinggi Dieng',
    address: 'Desa Dieng Kulon, Kec. Batur, Kab. Banjarnegara',
    start_datetime: '2026-10-30T06:00:00+07:00',
    end_datetime: '2026-11-01T23:00:00+07:00',
    organizer: 'Kelompok Sadar Wisata (Pokdarwis) Dieng Pandawa',
    poster_url: '',
    official_source_url: 'https://diengculturefestival.id',
    registration_url: 'https://diengculturefestival.id/tiket-2026',
    verification_status: 'verified',
    publication_status: 'published',
    event_status: 'upcoming',
    created_at: '2026-02-15T09:00:00Z',
    updated_at: '2026-03-02T10:00:00Z'
  },
  {
    event_id: 'ev_04',
    slug: 'pameran-keris-dan-pusaka-nusantara-tmii-jakarta',
    title: 'Eksibisi Agung Keris & Bilah Pusaka Nusantara',
    description: 'Pameran kuratorial 300 bilah keris bersejarah tangguh Mataram, Majapahit, Bugis, dan Palembang, bersertifikat UNESCO. Dilengkapi bursa keris resmi, klinik jamasan pusaka, dan seminar metalurgi kuno bersama empu keris Surakarta.',
    category: 'Pameran Budaya',
    province: 'DKI Jakarta',
    city: 'Jakarta Timur',
    venue: 'Museum Keris Nusantara, Taman Mini Indonesia Indah (TMII)',
    address: 'Jl. Raya TMII, Ceger, Kec. Cipayung, Kota Jakarta Timur',
    start_datetime: '2026-11-20T10:00:00+07:00',
    end_datetime: '2026-11-26T18:00:00+07:00',
    organizer: 'Sekretariat Nasional Keris Indonesia (SNKI) & TMII',
    poster_url: '',
    official_source_url: 'https://tamanmini.com/agenda/keris-2026',
    verification_status: 'verified',
    publication_status: 'published',
    event_status: 'upcoming',
    created_at: '2026-03-12T07:30:00Z',
    updated_at: '2026-03-12T07:30:00Z'
  },
  {
    event_id: 'ev_05',
    slug: 'festival-danau-sentani-karnaval-perahu-papua',
    title: 'Festival Danau Sentani: Harmoni Dayung di Atas Danau',
    description: 'Pentas seni di atas perahu kayu hias tradisional masyarakat Danau Sentani. Tarian Isosolo, melukis kulit kayu khombouw khas Asei, dan sajian kuliner papeda ikan kuah kuning.',
    category: 'Festival Budaya',
    province: 'Papua',
    city: 'Jayapura',
    venue: 'Kawasan Wisata Danau Sentani, Kalkhote',
    address: 'Kampung Asei Besar, Distrik Sentani Timur, Kabupaten Jayapura',
    start_datetime: '2026-11-25T08:00:00+09:00',
    end_datetime: '2026-11-29T17:00:00+09:00',
    organizer: 'Dinas Pariwisata dan Kebudayaan Kabupaten Jayapura',
    poster_url: '',
    official_source_url: 'https://jayapurakab.go.id/agenda-sentani',
    verification_status: 'verified',
    publication_status: 'published',
    event_status: 'upcoming',
    created_at: '2026-03-18T05:00:00Z',
    updated_at: '2026-03-18T05:00:00Z'
  }
];

export const INITIAL_MEDIA_ASSETS: MediaAsset[] = [
  {
    media_asset_id: 'med_01',
    content_id: 'cnt_lalakon_01',
    drive_file_id: '1aB2c3D4e5F6g7H8i9J0kL_sangkuriang',
    file_name: 'film_sangkuriang_master_1080p.mp4',
    mime_type: 'video/mp4',
    file_size: '648 MB',
    asset_role: 'primary_media',
    access_classification: 'public',
    availability_status: 'available',
    created_at: '2026-02-10T04:00:00Z',
    updated_at: '2026-02-10T04:00:00Z'
  },
  {
    media_asset_id: 'med_02',
    content_id: 'cnt_gema_01',
    drive_file_id: '2aB3cD4e5F6g7H8i9J0kL_tutur_ep1',
    file_name: 'audio_tutur_tinular_ep01_remaster.mp3',
    mime_type: 'audio/mpeg',
    file_size: '38 MB',
    asset_role: 'primary_media',
    access_classification: 'public',
    availability_status: 'available',
    created_at: '2026-01-15T09:00:00Z',
    updated_at: '2026-01-15T09:00:00Z'
  },
  {
    media_asset_id: 'med_03',
    content_id: 'cnt_gelanggang_01',
    drive_file_id: '3aB4cD5e6F7g8H9i0J1kL_congklak',
    file_name: 'tutorial_congklak_dhakon_nusantara.mp4',
    mime_type: 'video/mp4',
    file_size: '312 MB',
    asset_role: 'primary_media',
    access_classification: 'public',
    availability_status: 'available',
    created_at: '2026-01-05T06:00:00Z',
    updated_at: '2026-01-05T06:00:00Z'
  }
];

export const INITIAL_ADMINS: AdminUser[] = [
  {
    admin_id: 'adm_01',
    email: '4ghina@gmail.com',
    display_name: 'Ghina (Kurator Budaya)',
    role: 'super_admin',
    account_status: 'active'
  },
  {
    admin_id: 'adm_02',
    email: 'redaksi@adarupa.id',
    display_name: 'Redaksi ADARUPA Nusantara',
    role: 'editor',
    account_status: 'active'
  }
];

export const DEFAULT_APP_SETTINGS = {
  app_name: 'ADARUPA',
  descriptor: 'Jelajah Budaya Nusantara',
  tagline: 'Cerita yang Hidup, Budaya yang Terhubung.',
  gas_endpoint_url: '',
  google_sheets_id: '',
  google_drive_folder_id: '',
  contact_email: 'redaksi@adarupa.id',
  allow_event_submissions: false
};

export const DEFAULT_SITE_CONFIG: import('../types').SiteConfig = {
  version: 1,
  updatedAt: new Date().toISOString(),
  updatedBy: 'Sistem Inisialisasi ADARUPA',
  brand: {
    appName: 'ADARUPA',
    descriptor: 'Jelajah Budaya Nusantara',
    tagline: 'Cerita yang Hidup, Budaya yang Terhubung.',
    brandDescription: 'Platform kebudayaan digital terbuka untuk melestarikan dan memperkenalkan kekayaan cerita rakyat, sandiwara audio, permainan tradisional, serta pagelaran budaya nusantara.',
    logoMode: 'symbol',
    logoImageUrl: '',
    alternateLogoUrl: '',
    faviconUrl: '',
    contactEmail: 'redaksi@adarupa.id',
    editorialCurator: 'Ghina (Kurator Budaya)'
  },
  theme: {
    primaryMaroon: '#800020',
    deepMaroon: '#590018',
    forestGreen: '#1B3A2F',
    warmGold: '#D4A373',
    ivoryBackground: '#F8F3E9',
    terracottaAccent: '#C65D3A',
    primaryText: '#292522',
    secondaryText: '#6D675F',
    borderColor: '#E5DED2',
    fontHeading: 'Playfair Display',
    fontBody: 'Plus Jakarta Sans',
    enableBatikPatterns: true
  },
  hero: {
    kickerBadge: 'Pilihan Budaya Nusantara',
    mainHeadline: 'Jelajahi Cerita dan Warisan Nusantara',
    supportingDescription: 'Menghidupkan kembali kearifan lokal melalui film cerita rakyat, sandiwara audio imersif, panduan permainan tradisional, dan agenda perhelatan budaya dari Sabang sampai Merauke.',
    primaryCtaLabel: 'Jelajahi Sekarang',
    primaryCtaLink: '/lalakon',
    secondaryCtaLabel: 'Temukan Pagelaran',
    secondaryCtaLink: '/pagelaran',
    bannerImageUrl: '',
    featuredCardLabel: 'Karya Unggulan'
  },
  sections: {
    fourDomainsTitle: 'Empat Ranah Budaya',
    fourDomainsSubtitle: 'Pilih medium penjelajahan warisan leluhur yang ingin Anda nikmati hari ini.',
    lalakonSectionKicker: 'Lalakon',
    lalakonSectionTitle: 'Kisah & Tutur Visual Nusantara',
    lalakonViewAllLabel: 'Lihat Semua Film',
    gemaSwaraSectionKicker: 'Gema Swara',
    gemaSwaraSectionTitle: 'Dengarkan Sekarang',
    gemaSwaraSectionSubtitle: 'Sandiwara radio legendaris, dongeng pengantar tidur, dan kidung dawai tradisi.',
    gemaSwaraViewAllLabel: 'Jelajahi Audio',
    gelanggangSectionKicker: 'Gelanggang',
    gelanggangSectionTitle: 'Jelajahi Permainan Tradisional',
    gelanggangViewAllLabel: 'Semua Tutorial Game',
    pagelaranSectionKicker: 'Pagelaran',
    pagelaranSectionTitle: 'Agenda Festival & Perhelatan Adat',
    pagelaranViewAllLabel: 'Kalender Lengkap'
  },
  navigation: [
    { id: 'nav_home', label: 'Beranda', path: '/', isVisible: true, order: 1 },
    { id: 'nav_lalakon', label: 'Lalakon', path: '/lalakon', isVisible: true, order: 2 },
    { id: 'nav_gema_swara', label: 'Gema Swara', path: '/gema-swara', isVisible: true, order: 3 },
    { id: 'nav_gelanggang', label: 'Gelanggang', path: '/gelanggang', isVisible: true, order: 4 },
    { id: 'nav_pagelaran', label: 'Pagelaran', path: '/pagelaran', isVisible: true, order: 5 }
  ],
  categories: [
    {
      slug: 'lalakon',
      displayName: 'Lalakon',
      description: 'Film dan kisah visual bertutur budaya nusantara dari berbagai penjuru kepulauan.',
      subtext: 'Cerita Rakyat, Legenda, Dokumenter, Animasi',
      displayOrder: 1,
      badgeLabel: 'Film & Visual'
    },
    {
      slug: 'gema-swara',
      displayName: 'Gema Swara',
      description: 'Dongeng audio, sandiwara radio, podcast budaya, dan kidung musik tradisi.',
      subtext: 'Tutur Tinular, Fabel Audio, Podcast Rempah',
      displayOrder: 2,
      badgeLabel: 'Audio & Sandiwara'
    },
    {
      slug: 'gelanggang',
      displayName: 'Gelanggang',
      description: 'Tutorial, aturan, dan ensiklopedia permainan tradisional warisan leluhur.',
      subtext: 'Congklak, Gobak Sodor, Egrang Bambu',
      displayOrder: 3,
      badgeLabel: 'Permainan Tradisional'
    },
    {
      slug: 'pagelaran',
      displayName: 'Pagelaran',
      description: 'Agenda festival budaya, pertunjukan seni panggung, dan upacara adat se-Indonesia.',
      subtext: 'Festival Payung, Pesta Kesenian Bali, Sekaten',
      displayOrder: 4,
      badgeLabel: 'Agenda & Festival'
    }
  ],
  staticPages: {
    aboutTitle: 'Tentang ADARUPA',
    aboutSubtitle: 'Merawat Akar Peradaban Melalui Medium Digital',
    aboutBody: 'ADARUPA lahir dari kesadaran mendalam bahwa kekayaan kearifan lokal kepulauan Indonesia—mulai dari sastra lisan, mitologi daerah, permainan rakyat, hingga ritual adat—perlu didokumentasikan dan disajikan secara bermartabat untuk generasi digital masa kini dan masa depan.\n\nKami bekerjasama dengan komunitas sanggar seni daerah, balai pelestarian kebudayaan, maestro penutur lisan, serta penggiat olahraga tradisional untuk mengumpulkan, mengkurasi, dan mempublikasikan karya-karya bermakna tanpa memungut biaya dari publik.',
    guidelinesTitle: 'Pedoman Konten Nusantara',
    guidelinesBody: '1. Penghormatan Adat: Setiap konten yang dipublikasikan wajib mencantumkan daerah asal, narasumber/penutur, dan konteks tradisi masyarakat aslinya.\n2. Inklusivitas & Edukasi: Materi disajikan dalam bahasa Indonesia yang santun, ramah keluarga, serta dapat diakses oleh pelajar dan pengajar di seluruh nusantara.\n3. Integritas Data & Larangan Fabrikasi: Informasi tanggal, alamat pagelaran, serta aturan permainan harus berdasarkan rujukan faktual yang terverifikasi kurator.',
    privacyPolicyTitle: 'Kebijakan Privasi',
    privacyPolicyBody: 'ADARUPA berkomitmen melindungi privasi pengunjung situs web kami. Akses terhadap seluruh materi budaya publik tidak memerlukan registrasi akun atau pengumpulan data pribadi pengunjung.\n\nData surel hanya digunakan secara terbatas bagi kurator administrator resmi untuk kebutuhan autentikasi sekali pakai (OTP) dan tidak pernah dibagikan kepada pihak ketiga.',
    termsOfUseTitle: 'Syarat dan Ketentuan Penggunaan',
    termsOfUseBody: 'Seluruh materi audio, video, teks panduan, dan gambar yang ditampilkan di ADARUPA dilindungi oleh hak cipta komunitas pencipta dan lisensi kebudayaan terbuka.\n\nMasyarakat dipersilakan menggunakan materi ini untuk tujuan pendidikan, penelitian nirlaba, dan pembelajaran keluarga dengan tetap mencantumkan sumber ADARUPA dan komunitas pemilik hak adat.'
  },
  uiStrings: {
    searchPlaceholder: 'Cari cerita rakyat, audio sandiwara, permainan tradisional, pagelaran...',
    searchButtonLabel: 'Cari Budaya...',
    searchModalKicker: 'Pencarian Khazanah Nusantara',
    noResultsFoundTitle: 'Tidak ada hasil yang sesuai',
    noResultsFoundDescription: 'Coba gunakan kata kunci nama daerah, judul cerita rakyat, atau jenis permainan lain.',
    resetFilterLabel: 'Atur Ulang Filter',
    loadingMessage: 'Memuat khazanah nusantara...',
    emptyCategoryMessage: 'Belum ada konten pada kategori ini.',
    shareSuccessMessage: 'Tautan Berhasil Disalin!',
    shareActionLabel: 'Bagikan',
    backToCatalogLabel: 'Kembali ke Katalog',
    playVideoLabel: 'Putar Video',
    playAudioLabel: 'Putar Audio',
    viewDetailsLabel: 'Lihat Rincian'
  },
  footer: {
    brandMissionText: 'Platform kebudayaan digital terbuka untuk melestarikan dan memperkenalkan kekayaan cerita rakyat, sandiwara audio, permainan tradisional, serta pagelaran budaya nusantara.',
    taglineQuote: 'Cerita yang Hidup, Budaya yang Terhubung.',
    culturalCategoriesHeading: 'Kategori Budaya',
    governanceHeading: 'Tentang & Tata Kelola',
    contactHeading: 'Kontak Redaksi',
    contactInvitationText: 'Memiliki arsip cerita rakyat atau dokumentasi permainan tradisional di daerah Anda? Kirimkan usulan melalui redaksi resmi.',
    copyrightText: 'ADARUPA — Jelajah Budaya Nusantara. Hak Cipta Dilindungi.',
    accessibilityNotice: 'Standar Aksesibilitas WCAG AA',
    privacyLinkText: 'Kebijakan Privasi',
    guidelinesLinkText: 'Pedoman Konten Nusantara',
    termsLinkText: 'Syarat Penggunaan'
  },
  seo: {
    metaTitle: 'ADARUPA — Jelajah Budaya Nusantara',
    metaDescription: 'Platform budaya digital Indonesia untuk menemukan film cerita rakyat, sandiwara audio, permainan tradisional, dan agenda pagelaran budaya nusantara.',
    ogTitle: 'ADARUPA — Jelajah Budaya Nusantara',
    ogDescription: 'Cerita yang Hidup, Budaya yang Terhubung.',
    ogImageUrl: ''
  }
};

