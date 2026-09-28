const STORAGE_KEY = "podi-podi-weda-demo-v4";

const categories = [
  {
    slug: "masonry",
    si: "මේසන් බාස් (Masonry)",
    en: "Mason",
    group: "skilled_trade",
    workerType: "තනි පුද්ගල / කණ්ඩායම්",
    priceModel: "දෛනික ගාස්තුව හෝ කාර්යය සඳහා ගාස්තුව",
    minTier: "t1_id",
    evidence: "පෙර සිදුකළ සේවා ඡායාරූප, පළපුරුද්ද, සහ නිර්දේශ",
    guidance: "බිත්ති බැඳීම, කපරාරු කිරීම හෝ කොන්ක්‍රීට් වැඩ සඳහා වැඩේ ප්‍රමාණය සහ කණ්ඩායමක් ඉන්නවද කියලා සඳහන් කරන්න.",
    rateLabel: "දවසක ගාස්තුව හෝ කණ්ඩායම් ගාස්තුව (රු.)",
    documentLabel: "NIC + කළ වැඩ ඡායාරූප / reference",
    skills: ["බිත්ති බැඳීම", "plaster වැඩ", "concrete වැඩ", "repair වැඩ", "කණ්ඩායමක් සමග වැඩ"]
  },
  {
    slug: "plumbing",
    si: "ජලනල කාර්මික (Plumber)",
    en: "Plumber",
    group: "skilled_trade",
    workerType: "තනි පුද්ගල / කණ්ඩායම්",
    priceModel: "පැමිණීමේ ගාස්තුව / දෛනික ගාස්තුව / අයිතම ගාස්තුව",
    minTier: "t2_profile",
    evidence: "පෙර සිදුකළ සේවා ඡායාරූප, උපකරණ, හදිසි පැමිණීමේ හැකියාව",
    guidance: "වතුර බට ලීක් වීම, ටැප් මාරු කිරීම, බාත්රූම් වැඩ සඳහා උපකරණ තියෙනවද සහ ඉක්මනට එන්න පුළුවන්ද කියලා සඳහන් කරන්න.",
    rateLabel: "දවසක ගාස්තුව හෝ visit fee (රු.)",
    documentLabel: "NIC + කළ plumbing වැඩ ඡායාරූප",
    skills: ["වතුර කාන්දුව", "tap මාරු කිරීම", "bathroom plumbing", "pipe fitting", "හදිසි පැමිණීම"]
  },
  {
    slug: "cleaning",
    si: "පිරිසිදු කිරීමේ සේවා (Cleaning)",
    en: "Cleaner",
    group: "domestic_service",
    workerType: "තනි පුද්ගල / කණ්ඩායම්",
    priceModel: "දෛනික / පැයක / ප්‍රමාණය අනුව ගාස්තුව",
    minTier: "t2_profile",
    evidence: "NIC, ඔබගේ ඡායාරූපය, පෙර සිදුකළ පිරිසිදු කිරීම්",
    guidance: "ගෙවල්, ඔෆිස්, නැත්නම් වැඩබිම් පිරිසිදු කිරීම වගේ ඔබට කරන්න පුළුවන් වැඩ පැහැදිලි කරන්න.",
    rateLabel: "දවසක හෝ පැයක ගාස්තුව (රු.)",
    documentLabel: "NIC + ඔබේ ඡායාරූපය",
    skills: ["නිවාස පිරිසිදු කිරීම", "office cleaning", "construction cleanup", "garden cleanup", "කණ්ඩායම් cleaning"]
  },
  {
    slug: "bar_bending",
    si: "කම්බි බැඳීම (Bar bending)",
    en: "Bar bender",
    group: "skilled_trade",
    workerType: "තනි පුද්ගල / කණ්ඩායම්",
    priceModel: "දෛනික ගාස්තුව / ටොන් හෝ අයිතම ගාස්තුව",
    minTier: "t1_id",
    evidence: "වැඩබිම් පළපුරුද්ද, සැලසුම් කියවීමේ හැකියාව",
    guidance: "කම්බි බැඳීම සඳහා සැලසුම් කියවන්න පුළුවන්ද, කණ්ඩායමක් ඉන්නවද කියලා සහ පළපුරුද්ද සඳහන් කරන්න.",
    rateLabel: "දවසක ගාස්තුව හෝ ton/item ගාස්තුව (රු.)",
    documentLabel: "NIC + site work ඡායාරූප / reference",
    skills: ["කම්බි කැපීම", "කම්බි බැඳීම", "drawing කියවීම", "slab/beam/column", "team work"]
  },
  {
    slug: "carpentry",
    si: "වඩු බාස් (Carpentry)",
    en: "Wood worker",
    group: "skilled_trade",
    workerType: "තනි පුද්ගල / වැඩමුළු / කණ්ඩායම්",
    priceModel: "දෛනික ගාස්තුව / අයිතම ගාස්තුව",
    minTier: "t2_profile",
    evidence: "පෙර සිදුකළ සේවා ඡායාරූප, උපකරණ/වැඩමුළු",
    guidance: "දොර, කවුළු, කබඩ්, හෝ වහලයේ ලී වැඩ වැනි සේවාවන් සඳහා කලින් කරපු වැඩවල ඡායාරූප වැදගත් වේ.",
    rateLabel: "දවසක ගාස්තුව හෝ item ගාස්තුව (රු.)",
    documentLabel: "NIC + කළ ලී වැඩ ඡායාරූප",
    skills: ["දොර / ජනෙල්", "cabinet work", "roof timber", "repair work", "polishing"]
  },
  {
    slug: "electrical",
    si: "විදුලි කාර්මික (Electrician)",
    en: "Electrician",
    group: "licensed_trade",
    workerType: "තනි පුද්ගල / ලියාපදිංචි ව්‍යාපාර",
    priceModel: "පැමිණීමේ ගාස්තුව / දෛනික ගාස්තුව / ලක්ෂ්‍ය ගාස්තුව",
    minTier: "t3_skill",
    evidence: "සහතිකපත්‍ර/බලපත්‍ර, උපකරණ, ආරක්ෂිත සේවා පළපුරුද්ද",
    guidance: "විදුලි සේවා අවදානම් බැවින්, සහතික/බලපත්‍ර සහ සැපයිය හැකි සේවා මට්ටම පැහැදිලිව දක්වන්න.",
    rateLabel: "visit fee හෝ point/day ගාස්තුව (රු.)",
    documentLabel: "NIC + electrical certificate/licence තිබේ නම්",
    skills: ["house wiring", "breaker repair", "light fitting", "fault finding", "safety check"]
  },
  {
    slug: "quantity_surveying",
    si: "ප්‍රමාණ සමීක්ෂණ සේවා (QS)",
    en: "Quantity surveyor",
    group: "professional",
    workerType: "වෘත්තීය උපදේශක",
    priceModel: "ලේඛන ගාස්තුව / පැයක ගාස්තුව / ව්‍යාපෘති ගාස්තුව",
    minTier: "t3_skill",
    evidence: "සුදුසුකම්, BOQ/ඇස්තමේන්තු සාම්පල, පළපුරුද්ද",
    guidance: "BOQ, ඇස්තමේන්තු, rate analysis වැනි වෘත්තීය සේවාවන් සඳහා සුදුසුකම් සහ සාම්පල ලේඛන අවශ්‍ය වේ.",
    rateLabel: "පැයක / document / project ගාස්තුව (රු.)",
    documentLabel: "Qualification + sample BOQ/estimate තිබේ නම්",
    skills: ["BOQ සකස් කිරීම", "estimate", "rate analysis", "measurement", "tender document"]
  },
  {
    slug: "engineering",
    si: "ඉංජිනේරු සේවා (Engineering)",
    en: "Engineer",
    group: "professional",
    workerType: "වෘත්තීය උපදේශක",
    priceModel: "උපදේශන ගාස්තුව / ව්‍යාපෘති ගාස්තුව",
    minTier: "t3_skill",
    evidence: "සුදුසුකම්, ලියාපදිංචිය/සාමාජිකත්වය, ව්‍යාපෘති පළපුරුද්ද",
    guidance: "ඉංජිනේරු උපදේශන, සැලසුම් හෝ වැඩබිම් පරීක්ෂා කිරීම සඳහා සුදුසුකම් සහ සේවා සීමාවන් දක්වන්න.",
    rateLabel: "consultation හෝ project ගාස්තුව (රු.)",
    documentLabel: "Engineering qualification / membership තිබේ නම්",
    skills: ["site inspection", "structural advice", "civil works", "report", "project supervision"]
  },
  {
    slug: "architecture",
    si: "ගෘහ නිර්මාණ ශිල්පී සේවා (Architecture)",
    en: "Architect",
    group: "professional",
    workerType: "නිර්මාණ උපදේශක",
    priceModel: "නිර්මාණ අදියර ගාස්තුව / ව්‍යාපෘති ගාස්තුව",
    minTier: "t3_skill",
    evidence: "සුදුසුකම්, ලියාපදිංචිය, පෙර සිදුකළ නිර්මාණ/Portfolio",
    guidance: "සැලසුම්/නිර්මාණ කාර්යයන් සඳහා portfolio, සුදුසුකම් සහ සේවා සීමාවන් පැහැදිලිව දක්වන්න.",
    rateLabel: "design / consultation ගාස්තුව (රු.)",
    documentLabel: "Architecture qualification / portfolio තිබේ නම්",
    skills: ["house plan", "concept design", "3D view", "approval drawing", "renovation design"]
  },
  {
    slug: "accounting",
    si: "ගිණුම්කරණ සේවා",
    en: "Accountant",
    group: "professional",
    workerType: "වෘත්තීය සේවා / Freelancer",
    priceModel: "මාසික / කාර්යය සඳහා / පැයක ගාස්තුව",
    minTier: "t3_skill",
    evidence: "සුදුසුකම්, මෘදුකාංග භාවිතයේ හැකියාව, රහස්‍යභාවය",
    guidance: "ගිණුම්කරණ, බදු හෝ payroll සේවාවන් සඳහා සුදුසුකම්, මෘදුකාංග සහ රහස්‍යභාවය අනිවාර්යයෙන් දක්වන්න.",
    rateLabel: "මාසික / task / පැයක ගාස්තුව (රු.)",
    documentLabel: "Accounting qualification / CV තිබේ නම්",
    skills: ["bookkeeping", "tax filing", "payroll", "QuickBooks / Excel", "financial reports"]
  },
  {
    slug: "teaching",
    si: "අධ්‍යාපනික සේවා / උපකාරක පන්ති",
    en: "Teacher",
    group: "professional_service",
    workerType: "ගුරුවරයා / උපකාරක පන්ති ගුරු",
    priceModel: "පැයකට හෝ මාසිකව පන්ති ගාස්තුව",
    minTier: "t2_profile",
    evidence: "විෂය, ශ්‍රේණිය, සුදුසුකම්",
    guidance: "විෂය, ශ්‍රේණිය, online/home visit හෝ කණ්ඩායම් පන්ති ද යන්න සහ සුදුසුකම් පැහැදිලිව දක්වන්න.",
    rateLabel: "පැයක හෝ මාසික ගාස්තුව (රු.)",
    documentLabel: "Qualification / experience proof තිබේ නම්",
    skills: ["Maths", "Science", "English", "Sinhala", "online class", "home visit"]
  },
  {
    slug: "painting",
    si: "පේන්ට් බාස් (Painting)",
    en: "Painter",
    group: "skilled_trade",
    workerType: "තනි පුද්ගල / කණ්ඩායම්",
    priceModel: "දෛනික ගාස්තුව / වර්ග ප්‍රමාණය සඳහා ගාස්තුව",
    minTier: "t1_id",
    evidence: "පෙර සිදුකළ සේවා ඡායාරූප, මතුපිට සකස් කිරීමේ පළපුරුද්ද",
    guidance: "තීන්ත ආලේප කිරීම සඳහා ඇතුළත/පිටත, බිත්තිවල තත්ත්වය, කණ්ඩායමේ විශාලත්වය දක්වන්න.",
    rateLabel: "දවසක ගාස්තුව හෝ area ගාස්තුව (රු.)",
    documentLabel: "NIC + කළ painting වැඩ ඡායාරූප",
    skills: ["wall painting", "surface preparation", "waterproof coating", "putty", "team painting"]
  },
  {
    slug: "tiling",
    si: "ටයිල් බාස් (Tiling)",
    en: "Tiler",
    group: "skilled_trade",
    workerType: "තනි පුද්ගල / කණ්ඩායම්",
    priceModel: "දෛනික ගාස්තුව / වර්ග අඩි ගාස්තුව",
    minTier: "t2_profile",
    evidence: "පෙර සිදුකළ සේවා ඡායාරූප, පළපුරුද්ද",
    guidance: "ටයිල් ඇල්ලීම සඳහා පොළව/බිත්ති/නානකාමර ද යන්න සහ වර්ග අඩියක ගාස්තුව සඳහන් කරන්න.",
    rateLabel: "දවසක හෝ square foot ගාස්තුව (රු.)",
    documentLabel: "NIC + කළ tile වැඩ ඡායාරූප",
    skills: ["floor tiling", "bathroom tiling", "wall tiling", "tile repair", "grouting"]
  },
  {
    slug: "welding",
    si: "වෙල්ඩින් බාස් (Welding)",
    en: "Welder",
    group: "skilled_trade",
    workerType: "තනි පුද්ගල / වැඩමුළු",
    priceModel: "දෛනික ගාස්තුව / අයිතම ගාස්තුව",
    minTier: "t2_profile",
    evidence: "පෙර සිදුකළ සේවා ඡායාරූප, උපකරණ/වැඩමුළු",
    guidance: "ගේට්ටු, ග්‍රිල් හෝ වානේ රාමු වැනි සේවාවන් සඳහා උපකරණ/වැඩමුළු සහ කලින් කරපු වැඩවල ඡායාරූප එකතු කරන්න.",
    rateLabel: "දවසක හෝ item ගාස්තුව (රු.)",
    documentLabel: "NIC + welding වැඩ ඡායාරූප",
    skills: ["gate repair", "grill work", "steel frame", "site welding", "workshop fabrication"]
  },
  {
    slug: "ac_repair",
    si: "AC වැඩ (AC Repair)",
    en: "AC technician",
    group: "skilled_trade",
    workerType: "කාර්මික ශිල්පී",
    priceModel: "සේවා ගාස්තුව / අලුත්වැඩියා ගාස්තුව",
    minTier: "t3_skill",
    evidence: "පුහුණුව/සහතික, උපකරණ, පළපුරුද්ද",
    guidance: "AC සේවා/අලුත්වැඩියා සඳහා උපකරණ, ගෑස් හැසිරවීමේ පළපුරුද්ද සඳහන් කරන්න.",
    rateLabel: "service fee හෝ repair ගාස්තුව (රු.)",
    documentLabel: "NIC + training/certificate තිබේ නම්",
    skills: ["AC service", "gas refill", "fault check", "installation", "maintenance"]
  },
  {
    slug: "general_labour",
    si: "කම්කරු සේවා (General Labour)",
    en: "Unskilled labour",
    group: "unskilled",
    workerType: "තනි පුද්ගල / සහායක",
    priceModel: "දෛනික ගාස්තුව / පැයක ගාස්තුව",
    minTier: "t1_id",
    evidence: "NIC, ශාරීරික වැඩ කිරීමේ හැකියාව",
    guidance: "භාණ්ඩ එසවීම, වැඩබිම් සහායක හෝ වත්ත සුද්ද කිරීම වැනි සේවාවන් සඳහා ඔබට කරන්න පුළුවන් දේවල් පැහැදිලිව දක්වන්න.",
    rateLabel: "දවසකට අවශ්‍ය මුදල (රු.)",
    documentLabel: "NIC / ඔබේ ඡායාරූපය (දැන් නැත්නම් පසුව දාන්න පුළුවන්)",
    skills: ["භාණ්ඩ ඔසවන්න", "ඉදිකිරීම් සහායක", "බඩු පටවන්න / බාන්න", "වත්ත වැඩ", "පිරිසිදු කිරීම"]
  },
  {
    slug: "transport",
    si: "ප්‍රවාහන සේවා (Three-wheel / Bike)",
    en: "Transport provider",
    group: "transport",
    workerType: "three-wheel / bike / small vehicle owner",
    priceModel: "වේලාව, දුර සහ vehicle type අනුව ගාස්තුව",
    minTier: "t2_profile",
    evidence: "NIC, vehicle registration/licence, සේවා ප්‍රදේශය",
    guidance: "Three-wheel, bike delivery, school/office pickup, site material pickup වගේ ප්‍රවාහන සේවාවන් සඳහා දුර, වේලාව සහ vehicle type සඳහන් කරන්න.",
    rateLabel: "Base trip fee හෝ පැයක ගාස්තුව (රු.)",
    documentLabel: "NIC + licence / vehicle proof තිබේ නම්",
    skills: ["three-wheel hire", "bike delivery", "pickup/drop", "small goods transport", "scheduled transport"]
  },
  {
    slug: "printing",
    si: "මුද්‍රණ සේවා (Printing)",
    en: "Printing services",
    group: "business_service",
    workerType: "print shop / freelancer",
    priceModel: "පිටු ගණන, paper size, color/B&W, delivery අනුව",
    minTier: "t2_profile",
    evidence: "sample prints, shop details, delivery capability",
    guidance: "Photocopy, binding, visiting cards, flyers, posters, booklets වගේ මුද්‍රණ වැඩ සඳහා quantity, size, color/B&W සහ delivery අවශ්‍යද කියලා සඳහන් කරන්න.",
    rateLabel: "Base print/order fee (රු.)",
    documentLabel: "Business proof / print samples තිබේ නම්",
    skills: ["photocopy", "document printing", "binding", "visiting cards", "flyers/posters", "booklet printing"]
  },
  {
    slug: "graphic_design",
    si: "Graphic Design / Logo Design",
    en: "Graphic designer",
    group: "creative_digital",
    workerType: "freelancer / design studio",
    priceModel: "design item, revision count, package අනුව",
    minTier: "t2_profile",
    evidence: "portfolio, sample logos/social media posts, design tools",
    guidance: "Logo, social media post, flyer, banner, brand kit වගේ design වැඩ සඳහා style, size, language සහ deadline සඳහන් කරන්න.",
    rateLabel: "Design package / item fee (රු.)",
    documentLabel: "Portfolio / sample designs තිබේ නම්",
    skills: ["logo design", "social media post design", "flyer design", "banner design", "brand identity", "illustration"]
  },
  {
    slug: "typesetting",
    si: "Type Setting / ලේඛන සැකසුම",
    en: "Typesetting operator",
    group: "admin_digital",
    workerType: "typing operator / desktop publisher",
    priceModel: "පිටු ගණන, language, formatting complexity අනුව",
    minTier: "t1_id",
    evidence: "typing samples, Sinhala/Tamil/English capability, formatting examples",
    guidance: "Sinhala/English/Tamil typing, assignment formatting, CV, letter, thesis layout වගේ වැඩ සඳහා pages, language සහ format එක සඳහන් කරන්න.",
    rateLabel: "පිටුවකට හෝ document fee (රු.)",
    documentLabel: "Typing / formatting sample තිබේ නම්",
    skills: ["Sinhala typing", "English typing", "Tamil typing", "CV formatting", "assignment formatting", "desktop publishing"]
  },
  {
    slug: "data_entry",
    si: "Data Entry / Excel වැඩ",
    en: "Data entry assistant",
    group: "admin_digital",
    workerType: "freelancer / virtual assistant",
    priceModel: "records, hours, spreadsheet complexity අනුව",
    minTier: "t1_id",
    evidence: "Excel/Sheets skill proof, sample tables, confidentiality commitment",
    guidance: "Excel, Google Sheets, product upload, survey entry, cleanup වගේ වැඩ සඳහා records ගණන, source files සහ deadline සඳහන් කරන්න.",
    rateLabel: "Hourly / record / task fee (රු.)",
    documentLabel: "Excel/Sheets sample තිබේ නම්",
    skills: ["Excel data entry", "Google Sheets", "product upload", "data cleanup", "online research", "PDF to Excel"]
  },
  {
    slug: "writing_translation",
    si: "Writing / Translation / Proofreading",
    en: "Writer or translator",
    group: "content_digital",
    workerType: "writer / translator / editor",
    priceModel: "word count, language pair, urgency අනුව",
    minTier: "t2_profile",
    evidence: "writing samples, language capability, proofreading examples",
    guidance: "Article, CV, assignment editing, Sinhala-English translation, proofreading වගේ වැඩ සඳහා word count, language pair සහ tone සඳහන් කරන්න.",
    rateLabel: "Word / page / task fee (රු.)",
    documentLabel: "Writing / translation sample තිබේ නම්",
    skills: ["content writing", "Sinhala-English translation", "proofreading", "CV writing", "copywriting", "assignment editing"]
  },
  {
    slug: "web_development",
    si: "Web Development / App Development",
    en: "Web developer",
    group: "technology",
    workerType: "developer / agency",
    priceModel: "page count, feature scope, maintenance අනුව",
    minTier: "t3_skill",
    evidence: "portfolio, GitHub/site links, tech stack",
    guidance: "Website, landing page, e-commerce, booking system, app වගේ වැඩ සඳහා pages/features, examples, hosting සහ deadline සඳහන් කරන්න.",
    rateLabel: "Project / page / hourly fee (රු.)",
    documentLabel: "Portfolio / live links / GitHub තිබේ නම්",
    skills: ["business website", "landing page", "e-commerce", "web app", "WordPress", "maintenance"]
  },
  {
    slug: "digital_marketing",
    si: "Digital Marketing / Social Media",
    en: "Digital marketer",
    group: "marketing",
    workerType: "marketer / content manager",
    priceModel: "campaign, monthly retainer, content count අනුව",
    minTier: "t2_profile",
    evidence: "campaign examples, page links, ad/report samples",
    guidance: "Social media management, Meta ads, SEO, content calendar, page setup වගේ වැඩ සඳහා platform, budget සහ objective සඳහන් කරන්න.",
    rateLabel: "Campaign / monthly / post fee (රු.)",
    documentLabel: "Previous campaign/page examples තිබේ නම්",
    skills: ["social media management", "Meta ads", "SEO", "content calendar", "Google Business Profile", "page setup"]
  },
  {
    slug: "video_editing",
    si: "Video Editing / Animation",
    en: "Video editor",
    group: "creative_digital",
    workerType: "editor / creator",
    priceModel: "duration, complexity, revisions අනුව",
    minTier: "t2_profile",
    evidence: "video samples, editing tools, previous work links",
    guidance: "Reels, YouTube, promo video, subtitles, animation වගේ වැඩ සඳහා raw footage length, final duration, style සහ deadline සඳහන් කරන්න.",
    rateLabel: "Video / reel / hourly fee (රු.)",
    documentLabel: "Portfolio / video links තිබේ නම්",
    skills: ["reel editing", "YouTube editing", "promo video", "subtitles", "motion graphics", "basic animation"]
  },
  {
    slug: "photography",
    si: "Photography / Photo Editing",
    en: "Photographer",
    group: "creative_local",
    workerType: "photographer / editor",
    priceModel: "event hours, edited photo count, location අනුව",
    minTier: "t2_profile",
    evidence: "portfolio, camera/equipment details, event samples",
    guidance: "Event, product, portrait, real estate, photo editing වගේ වැඩ සඳහා date, location, hours සහ edited photo count සඳහන් කරන්න.",
    rateLabel: "Session / event / editing fee (රු.)",
    documentLabel: "Portfolio / sample photos තිබේ නම්",
    skills: ["event photography", "product photography", "portrait", "real estate photos", "photo editing", "retouching"]
  },
  {
    slug: "computer_repair",
    si: "Computer / Laptop Repair",
    en: "Computer repair technician",
    group: "technical_service",
    workerType: "technician / repair shop",
    priceModel: "diagnosis, parts, onsite/remote support අනුව",
    minTier: "t2_profile",
    evidence: "repair experience, shop proof, hardware/software skills",
    guidance: "Laptop, desktop, printer, software install, virus removal වගේ වැඩ සඳහා device model, issue, onsite ද shop visit ද කියලා සඳහන් කරන්න.",
    rateLabel: "Diagnosis / repair fee (රු.)",
    documentLabel: "Repair experience / shop proof තිබේ නම්",
    skills: ["laptop repair", "desktop repair", "software install", "virus removal", "printer setup", "data recovery"]
  },
  {
    slug: "mobile_repair",
    si: "Mobile Phone Repair",
    en: "Mobile repair technician",
    group: "technical_service",
    workerType: "technician / repair shop",
    priceModel: "diagnosis, parts, model අනුව",
    minTier: "t2_profile",
    evidence: "repair samples, shop proof, parts sourcing",
    guidance: "Screen, battery, charging port, software, data backup වගේ mobile repair සඳහා phone model, problem සහ urgency සඳහන් කරන්න.",
    rateLabel: "Diagnosis / repair fee (රු.)",
    documentLabel: "Shop proof / repair samples තිබේ නම්",
    skills: ["screen replacement", "battery replacement", "charging port", "software repair", "data backup", "accessory fitting"]
  },
  {
    slug: "pest_control",
    si: "Pest Control",
    en: "Pest control provider",
    group: "home_service",
    workerType: "licensed team / technician",
    priceModel: "area, pest type, treatment count අනුව",
    minTier: "t3_skill",
    evidence: "chemical safety knowledge, prior jobs, equipment",
    guidance: "Termite, cockroach, rat, mosquito treatment වගේ වැඩ සඳහා area, pest type, children/pets ඉන්නවද කියලා සඳහන් කරන්න.",
    rateLabel: "Treatment / area fee (රු.)",
    documentLabel: "NIC + treatment experience / licence තිබේ නම්",
    skills: ["termite treatment", "cockroach control", "rat control", "mosquito control", "bed bug treatment", "site inspection"]
  },
  {
    slug: "gardening_landscaping",
    si: "Gardening / Landscaping",
    en: "Gardener",
    group: "home_service",
    workerType: "gardener / landscaping team",
    priceModel: "garden size, tools, plants/materials අනුව",
    minTier: "t1_id",
    evidence: "garden photos, tools, maintenance experience",
    guidance: "Garden cleanup, grass cutting, landscaping, plant care වගේ වැඩ සඳහා garden size, tools සහ waste removal අවශ්‍යද කියලා සඳහන් කරන්න.",
    rateLabel: "Day / visit / project fee (රු.)",
    documentLabel: "NIC + garden work photos තිබේ නම්",
    skills: ["grass cutting", "garden cleanup", "landscaping", "plant care", "tree trimming", "waste removal"]
  },
  {
    slug: "security_cctv",
    si: "Security / CCTV Installation",
    en: "CCTV technician",
    group: "technical_service",
    workerType: "security technician / business",
    priceModel: "camera count, wiring, equipment supply අනුව",
    minTier: "t3_skill",
    evidence: "CCTV installation samples, equipment knowledge, business proof",
    guidance: "CCTV, alarm, smart lock, access control වගේ වැඩ සඳහා camera count, building type සහ equipment supply අවශ්‍යද කියලා සඳහන් කරන්න.",
    rateLabel: "Installation / camera / project fee (රු.)",
    documentLabel: "NIC + CCTV work samples / business proof තිබේ නම්",
    skills: ["CCTV installation", "camera wiring", "DVR/NVR setup", "alarm system", "smart lock", "access control"]
  },
  {
    slug: "appliance_repair",
    si: "Appliance Repair",
    en: "Appliance repair technician",
    group: "technical_service",
    workerType: "repair technician",
    priceModel: "diagnosis, appliance type, parts අනුව",
    minTier: "t2_profile",
    evidence: "repair experience, appliance types, parts sourcing",
    guidance: "Washing machine, fridge, cooker, TV වගේ appliance repair සඳහා brand/model, issue සහ onsite availability සඳහන් කරන්න.",
    rateLabel: "Diagnosis / repair fee (රු.)",
    documentLabel: "Repair experience / samples තිබේ නම්",
    skills: ["washing machine repair", "fridge repair", "cooker repair", "TV repair", "small appliance repair", "parts replacement"]
  },
  {
    slug: "event_management",
    si: "Event Support / Decoration",
    en: "Event service provider",
    group: "event_service",
    workerType: "event team / decorator / supplier",
    priceModel: "event size, hours, items supplied අනුව",
    minTier: "t2_profile",
    evidence: "event photos, supplier details, team capacity",
    guidance: "Birthday, wedding, office event, decoration, sound, chairs/tents වගේ වැඩ සඳහා date, guests, venue සහ required items සඳහන් කරන්න.",
    rateLabel: "Event / package fee (රු.)",
    documentLabel: "Event photos / supplier proof තිබේ නම්",
    skills: ["event decoration", "birthday setup", "sound system", "chairs/tents", "catering support", "event coordination"]
  },
  {
    slug: "virtual_assistant",
    si: "Virtual Assistant / Admin Support",
    en: "Virtual assistant",
    group: "admin_digital",
    workerType: "remote assistant / freelancer",
    priceModel: "hourly, weekly, monthly retainer අනුව",
    minTier: "t2_profile",
    evidence: "admin experience, communication skills, tool knowledge",
    guidance: "Email, scheduling, customer support, online research, document handling වගේ remote admin වැඩ සඳහා tasks, hours සහ tools සඳහන් කරන්න.",
    rateLabel: "Hourly / weekly / monthly fee (රු.)",
    documentLabel: "CV / admin work sample තිබේ නම්",
    skills: ["email management", "scheduling", "customer support", "online research", "document handling", "CRM updates"]
  },
  {
    slug: "beauty_wellness",
    si: "Beauty / Wellness Services",
    en: "Beauty or wellness provider",
    group: "personal_service",
    workerType: "beautician / therapist / trainer",
    priceModel: "service type, home visit, package අනුව",
    minTier: "t2_profile",
    evidence: "training/certificate, portfolio, hygiene practices",
    guidance: "Makeup, hair, salon home visit, massage, fitness trainer වගේ සේවා සඳහා service type, location සහ date/time සඳහන් කරන්න.",
    rateLabel: "Service / session fee (රු.)",
    documentLabel: "Certificate / portfolio තිබේ නම්",
    skills: ["bridal makeup", "hair styling", "salon home visit", "massage therapy", "fitness training", "grooming"]
  },
  {
    slug: "other",
    si: "වෙනත් සේවා / වෙනත් වෘත්තීන්",
    en: "Other",
    group: "other",
    workerType: "පරිපාලක පරීක්ෂාව (Admin Review)",
    priceModel: "ඔබගේ සේවාව අනුව",
    minTier: "t1_id",
    evidence: "සේවා විස්තරය, තිබේ නම් සාක්ෂි",
    guidance: "මේ ලිස්ට් එකේ නැති වැඩක් නම්, ඔබේ වැඩේ මොකක්ද කියලා කෙටියෙන් විස්තර කරන්න.",
    rateLabel: "ඔබේ සාමාන්‍ය ගාස්තුව (රු.)",
    documentLabel: "NIC + සේවාවට අදාළ සාක්ෂි තිබේ නම්",
    skills: ["මට කරන වැඩ විස්තර කරන්න", "admin පරීක්ෂා කරන්න", "custom service"]
  }
];

const tierRank = {
  t0_phone: 0,
  t1_id: 1,
  t2_profile: 2,
  t3_skill: 3,
  t4_police: 4,
  t5_business: 5,
  t6_vetted: 6
};

const professionalCategorySlugs = [
  "quantity_surveying",
  "engineering",
  "architecture",
  "accounting",
  "teaching",
  "web_development",
  "digital_marketing",
  "writing_translation",
  "event_management"
];

const remoteFriendlyCategorySlugs = [
  "graphic_design",
  "typesetting",
  "data_entry",
  "writing_translation",
  "web_development",
  "digital_marketing",
  "video_editing",
  "virtual_assistant"
];

const timeSlotLabels = {
  morning: "උදේ",
  lunch: "දවල්",
  evening: "සවස",
  night: "රාත්‍රී"
};

const slotRateInputs = {
  morning: "rateMorning",
  lunch: "rateLunch",
  evening: "rateEvening",
  night: "rateNight"
};

const districtDistanceKm = {
  Colombo: { Colombo: 6, Gampaha: 28, Kalutara: 42 },
  Gampaha: { Colombo: 28, Gampaha: 7, Kalutara: 58 },
  Kalutara: { Colombo: 42, Gampaha: 58, Kalutara: 8 }
};

const materialLabels = {
  client_materials: "Client බඩු දෙයි",
  worker_tools: "Provider tools ගේයි",
  worker_materials: "Provider බඩු quote කර ගේයි",
  both: "බඩු දෙපාර්ශවයෙන්",
  unknown: "බඩු ගැන උපදෙස් ඕන"
};

const supplyLabels = {
  labour_only: "ශ්‍රමය පමණයි",
  tools: "ශ්‍රමය + tools",
  materials: "ශ්‍රමය + tools + බඩු"
};

const demoProviders = [
  {
    id: "w1",
    name: "සරත් Plumbing",
    category: "plumbing",
    skills: ["වතුර කාන්දුව", "pipe fitting", "bathroom plumbing"],
    district: "Colombo",
    distanceKm: 4.2,
    radiusKm: 18,
    tier: "t3_skill",
    approved: true,
    availability: "available",
    rate: 6500,
    rating: 4.8,
    ratingCount: 32,
    experience: 9,
    responseRate: 0.84,
    jobsCompleted: 34,
    leadsReceived: 42,
    lastInvitedAt: "2026-05-31T09:00:00.000Z",
    workerTypeKey: "individual",
    teamSize: 1,
    workingDays: [1, 2, 3, 4, 5, 6],
    portfolio: "Bathroom pipe replacement, water leak repair",
    image: "linear-gradient(135deg,#24594d,#7fb08f)"
  },
  {
    id: "w2",
    name: "ප්‍රියන්ත Pipe Care",
    category: "plumbing",
    skills: ["වතුර කාන්දුව", "bathroom plumbing"],
    district: "Gampaha",
    distanceKm: 8.6,
    radiusKm: 20,
    tier: "t2_profile",
    approved: true,
    availability: "available",
    rate: 5500,
    rating: 4.3,
    ratingCount: 14,
    experience: 6,
    responseRate: 0.72,
    jobsCompleted: 16,
    leadsReceived: 24,
    lastInvitedAt: "2026-06-01T12:00:00.000Z",
    workerTypeKey: "individual",
    teamSize: 1,
    workingDays: [1, 2, 3, 4, 5, 6],
    portfolio: "Tap replacement, bathroom leak inspections",
    image: "linear-gradient(135deg,#326b72,#8ebf82)"
  },
  {
    id: "w3",
    name: "AquaFix Team",
    category: "plumbing",
    skills: ["වතුර කාන්දුව", "pipe fitting"],
    district: "Colombo",
    distanceKm: 12.1,
    radiusKm: 28,
    tier: "t4_police",
    approved: true,
    availability: "busy",
    rate: 12000,
    rating: 4.7,
    ratingCount: 21,
    experience: 11,
    responseRate: 0.88,
    teamSize: 3,
    jobsCompleted: 28,
    leadsReceived: 38,
    lastInvitedAt: "2026-05-27T13:00:00.000Z",
    workerTypeKey: "team",
    workingDays: [1, 2, 3, 4, 5, 6],
    portfolio: "Apartment line repair, concealed pipe tracing",
    image: "linear-gradient(135deg,#174f63,#d19b54)"
  },
  {
    id: "w4",
    name: "මහේෂ් Electrical",
    category: "electrical",
    skills: ["house wiring", "breaker repair", "light fitting"],
    district: "Gampaha",
    distanceKm: 11,
    radiusKm: 22,
    tier: "t3_skill",
    approved: true,
    availability: "busy",
    rate: 8500,
    rating: 4.6,
    ratingCount: 18,
    experience: 7,
    responseRate: 0.76,
    jobsCompleted: 19,
    leadsReceived: 30,
    lastInvitedAt: "2026-06-02T08:00:00.000Z",
    workerTypeKey: "individual",
    teamSize: 1,
    workingDays: [1, 2, 3, 4, 5, 6],
    portfolio: "Switchboard repair, light fitting, small wiring",
    image: "linear-gradient(135deg,#23516b,#c99d3b)"
  },
  {
    id: "w5",
    name: "ලහිරු Works Team",
    category: "masonry",
    skills: ["බිත්ති බැඳීම", "plaster වැඩ", "concrete වැඩ"],
    district: "Colombo",
    distanceKm: 7.8,
    radiusKm: 25,
    tier: "t2_profile",
    approved: true,
    availability: "available",
    rate: 18000,
    rating: 4.4,
    ratingCount: 11,
    experience: 5,
    responseRate: 0.69,
    teamSize: 4,
    jobsCompleted: 13,
    leadsReceived: 20,
    lastInvitedAt: "2026-05-28T10:30:00.000Z",
    workerTypeKey: "team",
    workingDays: [1, 2, 3, 4, 5, 6],
    portfolio: "Boundary wall, plaster repair, small concrete works",
    image: "linear-gradient(135deg,#716148,#b64131)"
  },
  {
    id: "w6",
    name: "චමරි Painting",
    category: "painting",
    skills: ["wall painting", "surface preparation", "waterproof coating"],
    district: "Gampaha",
    distanceKm: 13.5,
    radiusKm: 30,
    tier: "t2_profile",
    approved: true,
    availability: "available",
    rate: 7000,
    rating: 4.9,
    ratingCount: 25,
    experience: 8,
    responseRate: 0.91,
    jobsCompleted: 31,
    leadsReceived: 40,
    lastInvitedAt: "2026-05-30T14:30:00.000Z",
    workerTypeKey: "individual",
    teamSize: 2,
    workingDays: [1, 2, 3, 4, 5, 6],
    portfolio: "Interior repaint, damp wall preparation",
    image: "linear-gradient(135deg,#7b5a8a,#4c8d8c)"
  },
  {
    id: "w7",
    name: "සුපුන් Tiling",
    category: "tiling",
    skills: ["floor tiling", "bathroom tiling", "tile repair"],
    district: "Colombo",
    distanceKm: 5.4,
    radiusKm: 20,
    tier: "t3_skill",
    approved: true,
    availability: "available",
    rate: 9000,
    rating: 4.7,
    ratingCount: 20,
    experience: 10,
    responseRate: 0.8,
    jobsCompleted: 26,
    leadsReceived: 36,
    lastInvitedAt: "2026-05-29T11:00:00.000Z",
    workerTypeKey: "individual",
    teamSize: 1,
    workingDays: [1, 2, 3, 4, 5, 6],
    portfolio: "Bathroom tile repair, kitchen floor tiling",
    image: "linear-gradient(135deg,#225f6f,#d2b15c)"
  },
  {
    id: "w8",
    name: "රුවන් Cleaning",
    category: "cleaning",
    skills: ["නිවාස පිරිසිදු කිරීම", "garden cleanup", "construction cleanup"],
    district: "Colombo",
    distanceKm: 3.5,
    radiusKm: 16,
    tier: "t1_id",
    approved: true,
    availability: "available",
    rate: 5000,
    rating: 4.2,
    ratingCount: 9,
    experience: 4,
    responseRate: 0.64,
    jobsCompleted: 12,
    leadsReceived: 18,
    lastInvitedAt: "2026-05-26T09:00:00.000Z",
    workerTypeKey: "individual",
    teamSize: 2,
    workingDays: [1, 2, 3, 4, 5, 6],
    portfolio: "House deep cleaning, post-work cleanup",
    image: "linear-gradient(135deg,#35694e,#9bb96f)"
  },
  {
    id: "w9",
    name: "නිමල් Site Labour",
    category: "general_labour",
    skills: ["භාණ්ඩ ඔසවන්න", "ඉදිකිරීම් සහායක", "බඩු පටවන්න / බාන්න"],
    district: "Colombo",
    distanceKm: 6,
    radiusKm: 18,
    tier: "t1_id",
    approved: true,
    availability: "available",
    rate: 3500,
    rating: 4.1,
    ratingCount: 7,
    experience: 3,
    responseRate: 0.7,
    jobsCompleted: 10,
    leadsReceived: 14,
    lastInvitedAt: "2026-05-20T09:00:00.000Z",
    workerTypeKey: "individual",
    teamSize: 1,
    workingDays: [1, 2, 3, 4, 5, 6],
    portfolio: "Loading, unloading, site helper work",
    image: "linear-gradient(135deg,#44513d,#d4a72c)"
  },
  {
    id: "w10",
    name: "Colombo Bar Bend Team",
    category: "bar_bending",
    skills: ["කම්බි කැපීම", "කම්බි බැඳීම", "drawing කියවීම", "team work"],
    district: "Colombo",
    distanceKm: 9.4,
    radiusKm: 26,
    tier: "t2_profile",
    approved: true,
    availability: "available",
    rate: 22000,
    rating: 4.5,
    ratingCount: 13,
    experience: 8,
    responseRate: 0.74,
    jobsCompleted: 17,
    leadsReceived: 22,
    lastInvitedAt: "2026-05-25T09:00:00.000Z",
    workerTypeKey: "team",
    teamSize: 5,
    workingDays: [1, 2, 3, 4, 5, 6],
    portfolio: "Slab, beam, column reinforcement work with drawings",
    image: "linear-gradient(135deg,#3e453f,#ad5b32)"
  },
  {
    id: "w11",
    name: "දිනේෂ් Quantity Surveying",
    category: "quantity_surveying",
    skills: ["BOQ සකස් කිරීම", "estimate", "rate analysis", "measurement"],
    district: "Colombo",
    distanceKm: 2.8,
    radiusKm: 35,
    tier: "t3_skill",
    approved: true,
    availability: "available",
    rate: 0,
    quoteOnly: true,
    rating: 4.7,
    ratingCount: 16,
    experience: 9,
    responseRate: 0.86,
    jobsCompleted: 23,
    leadsReceived: 29,
    lastInvitedAt: "2026-05-24T10:30:00.000Z",
    workerTypeKey: "individual",
    teamSize: 1,
    workingDays: [1, 2, 3, 4, 5],
    portfolio: "BOQ samples, residential estimates, rate analysis",
    image: "linear-gradient(135deg,#243d4f,#d5b044)"
  },
  {
    id: "w12",
    name: "S Design Architect",
    category: "architecture",
    skills: ["house plan", "concept design", "3D view", "renovation design"],
    district: "Gampaha",
    distanceKm: 14,
    radiusKm: 40,
    tier: "t3_skill",
    approved: true,
    availability: "available",
    rate: 0,
    quoteOnly: true,
    rating: 4.6,
    ratingCount: 12,
    experience: 7,
    responseRate: 0.82,
    jobsCompleted: 15,
    leadsReceived: 21,
    lastInvitedAt: "2026-05-22T10:00:00.000Z",
    workerTypeKey: "business",
    teamSize: 2,
    workingDays: [1, 2, 3, 4, 5],
    portfolio: "House plan, 3D concept, renovation drawings",
    image: "linear-gradient(135deg,#2f4d63,#c97d3d)"
  },
  {
    id: "w13",
    name: "මධුෂා Maths Teacher",
    category: "teaching",
    skills: ["Maths", "Science", "online class", "home visit"],
    district: "Colombo",
    distanceKm: 5.6,
    radiusKm: 14,
    tier: "t2_profile",
    approved: true,
    availability: "available",
    rate: 2500,
    rating: 4.9,
    ratingCount: 19,
    experience: 6,
    responseRate: 0.9,
    jobsCompleted: 34,
    leadsReceived: 44,
    lastInvitedAt: "2026-05-18T15:00:00.000Z",
    workerTypeKey: "individual",
    teamSize: 1,
    workingDays: [1, 2, 3, 4, 5, 6],
    portfolio: "Grade 6-11 Maths, Science, home visit and online",
    image: "linear-gradient(135deg,#41506e,#d5a845)"
  },
  {
    id: "w14",
    name: "K Tax & Accounts",
    category: "accounting",
    skills: ["bookkeeping", "tax filing", "QuickBooks / Excel", "financial reports"],
    district: "Colombo",
    distanceKm: 4,
    radiusKm: 35,
    tier: "t3_skill",
    approved: true,
    availability: "available",
    rate: 0,
    quoteOnly: true,
    rating: 4.5,
    ratingCount: 10,
    experience: 8,
    responseRate: 0.78,
    jobsCompleted: 18,
    leadsReceived: 25,
    lastInvitedAt: "2026-05-23T08:30:00.000Z",
    workerTypeKey: "business",
    teamSize: 3,
    workingDays: [1, 2, 3, 4, 5],
    portfolio: "Bookkeeping, tax filing, payroll, Excel reports",
    image: "linear-gradient(135deg,#2d4b41,#bf9040)"
  },
  {
    id: "w15",
    name: "නුවන් Three-wheel",
    category: "transport",
    skills: ["three-wheel hire", "pickup/drop", "small goods transport"],
    district: "Colombo",
    distanceKm: 3.2,
    radiusKm: 22,
    tier: "t2_profile",
    approved: true,
    availability: "available",
    rate: 1800,
    slotRates: { morning: 1800, lunch: 1500, evening: 2200, night: 3000 },
    perKmRate: 95,
    rating: 4.6,
    ratingCount: 17,
    experience: 5,
    responseRate: 0.86,
    jobsCompleted: 44,
    leadsReceived: 32,
    lastInvitedAt: "2026-05-21T07:30:00.000Z",
    workerTypeKey: "individual",
    teamSize: 1,
    workingDays: [1, 2, 3, 4, 5, 6],
    availableSlots: ["morning", "lunch", "evening", "night"],
    supplyCapabilities: ["labour_only"],
    portfolio: "Three-wheel pickup/drop, small goods transport around Colombo",
    image: "linear-gradient(135deg,#184e5f,#e2a52d)"
  },
  {
    id: "w16",
    name: "කවිඳු Bike Delivery",
    category: "transport",
    skills: ["bike delivery", "pickup/drop", "scheduled transport"],
    district: "Gampaha",
    distanceKm: 10.5,
    radiusKm: 30,
    tier: "t2_profile",
    approved: true,
    availability: "available",
    rate: 1200,
    slotRates: { morning: 1400, lunch: 1200, evening: 1700, night: 2400 },
    perKmRate: 65,
    rating: 4.4,
    ratingCount: 12,
    experience: 4,
    responseRate: 0.8,
    jobsCompleted: 28,
    leadsReceived: 19,
    lastInvitedAt: "2026-05-19T16:00:00.000Z",
    workerTypeKey: "individual",
    teamSize: 1,
    workingDays: [1, 2, 3, 4, 5, 6],
    availableSlots: ["morning", "lunch", "evening"],
    supplyCapabilities: ["labour_only"],
    portfolio: "Bike delivery, document pickup, scheduled transport support",
    image: "linear-gradient(135deg,#244d3a,#c25433)"
  },
  {
    id: "w17",
    name: "PrintHub Colombo",
    category: "printing",
    skills: ["document printing", "binding", "visiting cards", "flyers/posters"],
    district: "Colombo",
    distanceKm: 4.8,
    radiusKm: 28,
    tier: "t2_profile",
    approved: true,
    availability: "available",
    rate: 2500,
    slotRates: { morning: 2500, lunch: 2800, evening: 3200 },
    perKmRate: 55,
    rating: 4.5,
    ratingCount: 22,
    experience: 6,
    responseRate: 0.82,
    jobsCompleted: 41,
    leadsReceived: 31,
    lastInvitedAt: "2026-05-18T09:30:00.000Z",
    workerTypeKey: "business",
    teamSize: 3,
    workingDays: [1, 2, 3, 4, 5, 6],
    availableSlots: ["morning", "lunch", "evening"],
    supplyCapabilities: ["labour_only", "tools", "materials"],
    portfolio: "Document printing, binding, flyers, visiting cards with delivery",
    image: "linear-gradient(135deg,#264c72,#d6a23a)"
  },
  {
    id: "w18",
    name: "Hela Pixel Design",
    category: "graphic_design",
    skills: ["logo design", "social media post design", "flyer design", "brand identity"],
    district: "Gampaha",
    distanceKm: 7,
    radiusKm: 60,
    tier: "t2_profile",
    approved: true,
    availability: "available",
    rate: 4500,
    slotRates: { morning: 4500, evening: 5000, night: 6500 },
    rating: 4.8,
    ratingCount: 27,
    experience: 5,
    responseRate: 0.88,
    jobsCompleted: 53,
    leadsReceived: 37,
    lastInvitedAt: "2026-05-16T17:00:00.000Z",
    workerTypeKey: "individual",
    teamSize: 1,
    workingDays: [1, 2, 3, 4, 5, 6],
    availableSlots: ["morning", "evening", "night"],
    supplyCapabilities: ["labour_only", "tools"],
    portfolio: "Logo design, social media creatives, flyers, brand kits",
    image: "linear-gradient(135deg,#6b3a74,#df8740)"
  },
  {
    id: "w19",
    name: "සිංහල Type Studio",
    category: "typesetting",
    skills: ["Sinhala typing", "English typing", "CV formatting", "assignment formatting"],
    district: "Colombo",
    distanceKm: 3,
    radiusKm: 55,
    tier: "t1_id",
    approved: true,
    availability: "available",
    rate: 1800,
    slotRates: { morning: 1800, lunch: 1800, evening: 2200, night: 3000 },
    rating: 4.4,
    ratingCount: 15,
    experience: 8,
    responseRate: 0.76,
    jobsCompleted: 36,
    leadsReceived: 21,
    lastInvitedAt: "2026-05-14T13:30:00.000Z",
    workerTypeKey: "individual",
    teamSize: 1,
    workingDays: [1, 2, 3, 4, 5, 6],
    availableSlots: ["morning", "lunch", "evening", "night"],
    supplyCapabilities: ["labour_only", "tools"],
    portfolio: "Sinhala typing, CV formatting, assignments, letters and DTP",
    image: "linear-gradient(135deg,#385d4e,#c9962e)"
  },
  {
    id: "w20",
    name: "Excel Quick Assist",
    category: "data_entry",
    skills: ["Excel data entry", "Google Sheets", "data cleanup", "PDF to Excel"],
    district: "Kalutara",
    distanceKm: 9,
    radiusKm: 70,
    tier: "t2_profile",
    approved: true,
    availability: "available",
    rate: 3000,
    slotRates: { morning: 3000, evening: 3200, night: 4200 },
    rating: 4.6,
    ratingCount: 18,
    experience: 4,
    responseRate: 0.84,
    jobsCompleted: 29,
    leadsReceived: 18,
    lastInvitedAt: "2026-05-13T09:00:00.000Z",
    workerTypeKey: "individual",
    teamSize: 1,
    workingDays: [1, 2, 3, 4, 5, 6],
    availableSlots: ["morning", "evening", "night"],
    supplyCapabilities: ["labour_only", "tools"],
    portfolio: "Excel cleanup, Google Sheets entry, PDF to Excel conversion",
    image: "linear-gradient(135deg,#214f5d,#6ba56b)"
  },
  {
    id: "w21",
    name: "Lanka Web Lab",
    category: "web_development",
    skills: ["business website", "landing page", "e-commerce", "WordPress"],
    district: "Colombo",
    distanceKm: 5,
    radiusKm: 70,
    tier: "t3_skill",
    approved: true,
    availability: "available",
    rate: 0,
    quoteOnly: true,
    rating: 4.7,
    ratingCount: 20,
    experience: 7,
    responseRate: 0.86,
    jobsCompleted: 32,
    leadsReceived: 24,
    lastInvitedAt: "2026-05-11T10:00:00.000Z",
    workerTypeKey: "business",
    teamSize: 3,
    workingDays: [1, 2, 3, 4, 5],
    availableSlots: ["morning", "lunch", "evening"],
    supplyCapabilities: ["labour_only", "tools"],
    portfolio: "Business websites, landing pages, WordPress, e-commerce builds",
    image: "linear-gradient(135deg,#193d65,#b57738)"
  },
  {
    id: "w22",
    name: "GrowSocial LK",
    category: "digital_marketing",
    skills: ["social media management", "Meta ads", "content calendar", "page setup"],
    district: "Colombo",
    distanceKm: 6,
    radiusKm: 65,
    tier: "t2_profile",
    approved: true,
    availability: "available",
    rate: 0,
    quoteOnly: true,
    rating: 4.5,
    ratingCount: 16,
    experience: 5,
    responseRate: 0.83,
    jobsCompleted: 24,
    leadsReceived: 19,
    lastInvitedAt: "2026-05-10T15:30:00.000Z",
    workerTypeKey: "business",
    teamSize: 2,
    workingDays: [1, 2, 3, 4, 5, 6],
    availableSlots: ["morning", "evening"],
    supplyCapabilities: ["labour_only", "tools"],
    portfolio: "Meta ads, social media calendars, page setup, campaign reports",
    image: "linear-gradient(135deg,#1f5d5f,#d1563b)"
  },
  {
    id: "w23",
    name: "ReelCut Studio",
    category: "video_editing",
    skills: ["reel editing", "YouTube editing", "subtitles", "motion graphics"],
    district: "Gampaha",
    distanceKm: 11,
    radiusKm: 70,
    tier: "t2_profile",
    approved: true,
    availability: "busy",
    rate: 5500,
    slotRates: { morning: 5500, evening: 6000, night: 7600 },
    rating: 4.6,
    ratingCount: 14,
    experience: 6,
    responseRate: 0.78,
    jobsCompleted: 27,
    leadsReceived: 23,
    lastInvitedAt: "2026-05-09T18:00:00.000Z",
    workerTypeKey: "individual",
    teamSize: 1,
    workingDays: [1, 2, 3, 4, 5, 6],
    availableSlots: ["morning", "evening", "night"],
    supplyCapabilities: ["labour_only", "tools"],
    portfolio: "Short-form reels, YouTube videos, subtitle packs, promo edits",
    image: "linear-gradient(135deg,#643f68,#e08c34)"
  },
  {
    id: "w24",
    name: "TechFix Laptop Care",
    category: "computer_repair",
    skills: ["laptop repair", "software install", "virus removal", "data recovery"],
    district: "Colombo",
    distanceKm: 5.5,
    radiusKm: 26,
    tier: "t2_profile",
    approved: true,
    availability: "available",
    rate: 3500,
    slotRates: { morning: 3500, lunch: 3800, evening: 4500 },
    perKmRate: 70,
    rating: 4.7,
    ratingCount: 31,
    experience: 9,
    responseRate: 0.87,
    jobsCompleted: 58,
    leadsReceived: 42,
    lastInvitedAt: "2026-05-12T08:45:00.000Z",
    workerTypeKey: "business",
    teamSize: 2,
    workingDays: [1, 2, 3, 4, 5, 6],
    availableSlots: ["morning", "lunch", "evening"],
    supplyCapabilities: ["labour_only", "tools", "materials"],
    portfolio: "Laptop repairs, Windows/software install, data recovery, printer setup",
    image: "linear-gradient(135deg,#223f59,#7eae69)"
  },
  {
    id: "w25",
    name: "Green Yard Team",
    category: "gardening_landscaping",
    skills: ["grass cutting", "garden cleanup", "landscaping", "tree trimming"],
    district: "Gampaha",
    distanceKm: 8,
    radiusKm: 32,
    tier: "t1_id",
    approved: true,
    availability: "available",
    rate: 6500,
    slotRates: { morning: 6500, lunch: 7200, evening: 8000 },
    perKmRate: 50,
    rating: 4.4,
    ratingCount: 13,
    experience: 6,
    responseRate: 0.72,
    jobsCompleted: 22,
    leadsReceived: 16,
    lastInvitedAt: "2026-05-08T07:30:00.000Z",
    workerTypeKey: "team",
    teamSize: 3,
    workingDays: [1, 2, 3, 4, 5, 6],
    availableSlots: ["morning", "lunch", "evening"],
    supplyCapabilities: ["labour_only", "tools", "materials"],
    portfolio: "Garden cleanup, grass cutting, tree trimming, basic landscaping",
    image: "linear-gradient(135deg,#2c613b,#d2ac41)"
  },
  {
    id: "w26",
    name: "SecureCam Installers",
    category: "security_cctv",
    skills: ["CCTV installation", "camera wiring", "DVR/NVR setup", "alarm system"],
    district: "Colombo",
    distanceKm: 9,
    radiusKm: 35,
    tier: "t3_skill",
    approved: true,
    availability: "available",
    rate: 0,
    quoteOnly: true,
    rating: 4.8,
    ratingCount: 19,
    experience: 8,
    responseRate: 0.85,
    jobsCompleted: 34,
    leadsReceived: 28,
    lastInvitedAt: "2026-05-07T11:15:00.000Z",
    workerTypeKey: "business",
    teamSize: 2,
    workingDays: [1, 2, 3, 4, 5, 6],
    availableSlots: ["morning", "lunch", "evening"],
    supplyCapabilities: ["labour_only", "tools", "materials"],
    portfolio: "CCTV installations, camera wiring, NVR setup, security alarms",
    image: "linear-gradient(135deg,#23364f,#bc8b3a)"
  },
  {
    id: "w27",
    name: "Bright Events Crew",
    category: "event_management",
    skills: ["event decoration", "birthday setup", "sound system", "chairs/tents"],
    district: "Kalutara",
    distanceKm: 15,
    radiusKm: 45,
    tier: "t2_profile",
    approved: true,
    availability: "available",
    rate: 0,
    quoteOnly: true,
    rating: 4.6,
    ratingCount: 11,
    experience: 7,
    responseRate: 0.79,
    jobsCompleted: 21,
    leadsReceived: 17,
    lastInvitedAt: "2026-05-06T12:00:00.000Z",
    workerTypeKey: "team",
    teamSize: 5,
    workingDays: [1, 2, 3, 4, 5, 6, 0],
    availableSlots: ["morning", "lunch", "evening", "night"],
    supplyCapabilities: ["labour_only", "tools", "materials"],
    portfolio: "Birthday setup, event decor, sound, chairs, tents and coordination",
    image: "linear-gradient(135deg,#73445d,#d9a23e)"
  },
  {
    id: "w28",
    name: "Salon Home Glow",
    category: "beauty_wellness",
    skills: ["bridal makeup", "hair styling", "salon home visit", "grooming"],
    district: "Colombo",
    distanceKm: 6.5,
    radiusKm: 24,
    tier: "t2_profile",
    approved: true,
    availability: "available",
    rate: 5000,
    slotRates: { morning: 5000, lunch: 5200, evening: 6500, night: 8200 },
    perKmRate: 60,
    rating: 4.7,
    ratingCount: 24,
    experience: 6,
    responseRate: 0.81,
    jobsCompleted: 38,
    leadsReceived: 26,
    lastInvitedAt: "2026-05-05T10:20:00.000Z",
    workerTypeKey: "individual",
    teamSize: 1,
    workingDays: [1, 2, 3, 4, 5, 6, 0],
    availableSlots: ["morning", "lunch", "evening", "night"],
    supplyCapabilities: ["labour_only", "tools", "materials"],
    portfolio: "Home salon visits, makeup, hair styling and grooming packages",
    image: "linear-gradient(135deg,#7b4665,#d78349)"
  }
];

const initialState = {
  providers: demoProviders,
  jobs: [],
  leads: [],
  payments: [],
  bookings: [],
  reviews: [],
  disputes: [
    {
      id: "d1",
      title: "ගෙවපු මුදල වෙනස් වෙලා",
      status: "open",
      detail: "බාස් කියන්නේ ආවට පස්සේ කතා කරගත්ත ගාණ වෙනස් කළා කියලා."
    }
  ],
  audit: [
    "demo.seeded",
    "privacy.rule.loaded"
  ]
};

let state = loadState();

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return structuredClone(initialState);
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") throw new Error("Invalid saved state");
    ["providers", "jobs", "leads", "payments", "bookings", "reviews", "disputes", "audit"].forEach((key) => {
      if (!Array.isArray(parsed[key])) parsed[key] = structuredClone(initialState[key]);
    });
    const knownIds = new Set(parsed.providers.map((provider) => provider.id));
    const missingSeedProviders = demoProviders.filter((provider) => !knownIds.has(provider.id));
    if (missingSeedProviders.length) {
      parsed.providers = [...missingSeedProviders, ...parsed.providers];
    }
    return parsed;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return structuredClone(initialState);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function $(selector) {
  return document.querySelector(selector);
}

function $all(selector) {
  return [...document.querySelectorAll(selector)];
}

function escapeHTML(value) {
  return String(value ?? "").replace(/[&<>'"]/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "'": "&#39;",
    '"': "&quot;"
  })[character]);
}

function secureBackendConfigured() {
  return Boolean(window.PodiBackend?.isConfigured?.());
}

function categoryBySlug(slug) {
  return categories.find((category) => category.slug === slug) || categories[0];
}

function classifyRequirement(text, structuredInput = {}) {
  if (structuredInput.mode === "structured" && structuredInput.categorySlug && structuredInput.categorySlug !== "other") {
    const category = categoryBySlug(structuredInput.categorySlug);
    const selectedSkills = structuredInput.skillTags?.length ? structuredInput.skillTags : category.skills.slice(0, 2);
    const highRisk = category.group === "licensed_trade" || category.slug === "engineering";
    const professional = professionalCategorySlugs.includes(category.slug);
    const workersNeeded = Number(structuredInput.workersNeeded || 1);
    const jobSize = structuredInput.jobSize || (structuredInput.large || workersNeeded > 1 ? "large" : "small");
    const materialsNeedQuote = ["worker_materials", "both", "unknown"].includes(structuredInput.materialsBy);
    return {
      category,
      skillTags: selectedSkills,
      summarySi: `${category.si} සඳහා client තෝරාගත් structured ඉල්ලීමක්.`,
      questions: buildQuestions(category.slug, structuredInput.urgent),
      riskFlags: highRisk ? ["safety_or_professional_risk"] : [],
      minTier: category.minTier || "t1_id",
      jobSize,
      skillLevel: professional || highRisk ? "specialist" : category.group === "unskilled" ? "basic" : "skilled",
      jobType: professional || highRisk || jobSize === "large" || workersNeeded > 1 || materialsNeedQuote ? "QUOTE_REQUEST" : "STANDARD",
      workersNeeded,
      materialsBy: structuredInput.materialsBy || "client_materials",
      accessSlots: structuredInput.accessSlots?.length ? structuredInput.accessSlots : ["morning"],
      accessInfo: structuredInput.accessInfo || "",
      confidence: 0.98,
      source: "structured",
      needsClaude: false
    };
  }

  const normalized = text.toLowerCase();
  const rules = [
    { slug: "plumbing", words: ["නල", "වතුර", "leak", "pipe", "tap", "plumber", "කාන්දුව"] },
    { slug: "electrical", words: ["විදුලි", "wire", "light", "switch", "breaker", "electric"] },
    { slug: "masonry", words: ["බිත්ති", "wall", "cement", "concrete", "mason", "මේසන්"] },
    { slug: "bar_bending", words: ["bar bend", "bar bending", "rebar", "කම්බි", "reinforcement"] },
    { slug: "carpentry", words: ["දොර", "wood", "cabinet", "carpenter", "වඩු", "ලී"] },
    { slug: "painting", words: ["paint", "තීන්ත", "wall color", "පේන්ට්"] },
    { slug: "tiling", words: ["tile", "ටයිල්"] },
    { slug: "welding", words: ["weld", "gate", "steel", "වෙල්ඩින්"] },
    { slug: "ac_repair", words: ["a/c", "air conditioner", "ඒසී", "cooling"] },
    { slug: "cleaning", words: ["clean", "පිරිසිදු", "garden", "ගෙවත්ත"] },
    { slug: "quantity_surveying", words: ["qs", "quantity", "boq", "estimate", "ප්‍රමාණ", "ඇස්තමේන්තු"] },
    { slug: "engineering", words: ["engineer", "engineering", "structural", "ඉංජිනේරු"] },
    { slug: "architecture", words: ["architect", "architecture", "house plan", "drawing", "ගෘහ නිර්මාණ", "plan"] },
    { slug: "accounting", words: ["account", "tax", "bookkeeping", "ගිණුම්", "payroll"] },
    { slug: "teaching", words: ["teacher", "tuition", "class", "උගන්", "ඉගැන්වීම", "පාඩම්"] },
    { slug: "transport", words: ["threewheel", "three-wheel", "tuk", "bike", "delivery", "pickup", "drop", "transport", "ප්‍රවාහන"] },
    { slug: "printing", words: ["print", "printing", "photocopy", "copy", "binding", "poster", "flyer", "visiting card", "booklet", "මුද්‍රණ"] },
    { slug: "graphic_design", words: ["graphic", "logo", "design", "branding", "banner", "flyer design", "illustration"] },
    { slug: "typesetting", words: ["type setting", "typesetting", "typing", "sinhala typing", "cv format", "desktop publishing", "ලේඛන", "ටයිප්"] },
    { slug: "data_entry", words: ["data entry", "excel", "spreadsheet", "google sheets", "pdf to excel", "product upload"] },
    { slug: "writing_translation", words: ["writing", "translation", "translate", "proofread", "proofreading", "content", "copywriting", "cv writing"] },
    { slug: "web_development", words: ["website", "web development", "web app", "wordpress", "ecommerce", "e-commerce", "landing page", "app development"] },
    { slug: "digital_marketing", words: ["digital marketing", "social media", "facebook ads", "meta ads", "seo", "google business", "campaign"] },
    { slug: "video_editing", words: ["video", "editing", "reel", "youtube", "animation", "subtitle", "motion graphics"] },
    { slug: "photography", words: ["photo", "photography", "photographer", "portrait", "product photo", "retouch"] },
    { slug: "computer_repair", words: ["computer", "laptop", "desktop", "printer setup", "software install", "virus", "data recovery"] },
    { slug: "mobile_repair", words: ["mobile repair", "phone repair", "screen replacement", "battery replacement", "charging port"] },
    { slug: "pest_control", words: ["pest", "termite", "cockroach", "rat control", "mosquito", "bed bug"] },
    { slug: "gardening_landscaping", words: ["garden", "gardening", "landscape", "grass cutting", "tree trimming", "plant care"] },
    { slug: "security_cctv", words: ["cctv", "security camera", "alarm", "smart lock", "access control"] },
    { slug: "appliance_repair", words: ["washing machine", "fridge", "refrigerator", "cooker", "tv repair", "appliance"] },
    { slug: "event_management", words: ["event", "decoration", "birthday", "wedding", "sound system", "chairs", "tent"] },
    { slug: "virtual_assistant", words: ["virtual assistant", "admin support", "email management", "scheduling", "customer support", "crm"] },
    { slug: "beauty_wellness", words: ["makeup", "beauty", "salon", "hair", "massage", "fitness trainer", "wellness"] },
    { slug: "general_labour", words: ["helper", "labour", "කම්කරු", "load"] }
  ];
  const match = rules.find((rule) => rule.words.some((word) => normalized.includes(word)));
  const fallbackSlug = structuredInput.categorySlug || "general_labour";
  const category = categoryBySlug(match ? match.slug : fallbackSlug);
  const highRisk = /විදුලි|electric|height|වහල|roof|gas|කඩා|structural|engineering/.test(normalized);
  const urgent = /අද|හෙට|today|urgent|හදිසි/.test(normalized);
  const professional = professionalCategorySlugs.includes(category.slug);
  const large = /team|කණ්ඩායම|workers|5|large|වහල|roof|house|project/.test(normalized);
  const confidence = match ? (highRisk ? 0.82 : 0.88) : 0.54;
  const workersNeeded = Number(structuredInput.workersNeeded || (large ? 3 : 1));

  return {
    category,
    skillTags: category.skills.slice(0, 2),
    summarySi: buildSummary(category.slug),
    questions: buildQuestions(category.slug, urgent),
    riskFlags: highRisk ? ["safety_or_property_risk"] : category.slug === "plumbing" ? ["water_damage_risk"] : [],
    minTier: category.minTier || (highRisk || category.slug === "electrical" ? "t3_skill" : "t1_id"),
    jobSize: structuredInput.jobSize || (large ? "large" : "small"),
    skillLevel: professional || highRisk ? "specialist" : category.group === "unskilled" ? "basic" : "skilled",
    jobType: professional || large || highRisk ? "QUOTE_REQUEST" : "STANDARD",
    workersNeeded,
    materialsBy: structuredInput.materialsBy || "client_materials",
    accessSlots: structuredInput.accessSlots?.length ? structuredInput.accessSlots : ["morning"],
    accessInfo: structuredInput.accessInfo || "",
    confidence,
    source: structuredInput.mode === "custom" ? "custom_ai_needed" : match ? "keyword_fallback" : "custom_ai_needed",
    needsClaude: structuredInput.mode === "custom" || !match || category.slug === "other"
  };
}

function buildSummary(slug) {
  const summaries = {
    plumbing: "ජලනල සහ වතුර ලීක් වීම් සම්බන්ධ අලුත්වැඩියාවක්.",
    electrical: "විදුලි කාර්මික සේවාවක්.",
    masonry: "මේසන් හෝ කොන්ක්‍රීට් සම්බන්ධ සේවාවක්.",
    bar_bending: "කම්බි බැඳීම සම්බන්ධ සේවාවක්.",
    carpentry: "වඩු කාර්මික සේවාවක්.",
    painting: "තීන්ත ආලේප කිරීම සහ මතුපිට සකස් කිරීමේ සේවාවක්.",
    tiling: "ටයිල් ඇල්ලීම හෝ අලුත්වැඩියා කිරීමේ සේවාවක්.",
    welding: "වෑල්ඩින් හෝ වානේ රාමු සම්බන්ධ සේවාවක්.",
    ac_repair: "වායුසමීකරණ පරීක්ෂා කිරීම හෝ අලුත්වැඩියා කිරීමේ සේවාවක්.",
    cleaning: "නිවාස හෝ වැඩබිම් පිරිසිදු කිරීමේ සේවාවක්.",
    quantity_surveying: "BOQ / ඇස්තමේන්තු / ප්‍රමාණ සමීක්ෂණ සම්බන්ධ වෘත්තීය සේවාවක්.",
    engineering: "ඉංජිනේරු උපදේශන, පරීක්ෂණ හෝ වාර්තා සැපයීමේ සේවාවක්.",
    architecture: "ගෘහ නිර්මාණ හෝ සැලසුම් සම්බන්ධ වෘත්තීය සේවාවක්.",
    accounting: "ගිණුම්කරණ, බදු හෝ payroll සම්බන්ධ වෘත්තීය සේවාවක්.",
    teaching: "අධ්‍යාපනික සේවා හෝ උපකාරක පන්ති සේවාවක්.",
    printing: "මුද්‍රණ, photocopy, binding හෝ print-production සේවාවක්.",
    graphic_design: "Logo, social media, flyer හෝ brand design සේවාවක්.",
    typesetting: "Typing, typesetting හෝ document formatting සේවාවක්.",
    data_entry: "Excel, spreadsheet, product upload හෝ data cleanup සේවාවක්.",
    writing_translation: "Writing, translation, proofreading හෝ editing සේවාවක්.",
    web_development: "Website, web app, WordPress හෝ e-commerce development සේවාවක්.",
    digital_marketing: "Social media, ads, SEO හෝ digital campaign සේවාවක්.",
    video_editing: "Video editing, reels, subtitles හෝ animation සේවාවක්.",
    photography: "Photography හෝ photo editing සේවාවක්.",
    computer_repair: "Computer, laptop, printer හෝ software repair/support සේවාවක්.",
    mobile_repair: "Mobile phone diagnosis හෝ repair සේවාවක්.",
    pest_control: "Pest control සහ treatment සේවාවක්.",
    gardening_landscaping: "Garden cleanup, grass cutting හෝ landscaping සේවාවක්.",
    security_cctv: "CCTV, alarm හෝ security installation සේවාවක්.",
    appliance_repair: "Home appliance diagnosis හෝ repair සේවාවක්.",
    event_management: "Event setup, decoration හෝ supplier coordination සේවාවක්.",
    virtual_assistant: "Remote admin support හෝ virtual assistant සේවාවක්.",
    beauty_wellness: "Beauty, grooming, home salon හෝ wellness සේවාවක්.",
    general_labour: "සාමාන්‍ය කම්කරු සහාය අවශ්‍ය වැඩක්.",
    other: "පරිපාලක පරීක්ෂාවට යොමු කළ යුතු වෙනත් සේවාවක්."
  };
  return summaries[slug];
}

function buildQuestions(slug, urgent) {
  const common = [
    "මේ වැඩේ කරන්න ඕනෙ දවස සහ වෙලාව කියන්න පුළුවන්ද?",
    "වැඩේ තියෙන තැන ෆොටෝ එකක් දාන්න පුළුවන්ද?"
  ];
  const byCategory = {
    plumbing: "ද්‍රව්‍ය ඔබ සපයනවාද, නැතිනම් සේවා සපයන්නා සපයිය යුතුද?",
    electrical: "main switch / breaker එක සම්බන්ධද, නැතිනම් light/fitting එකක්ද?",
    masonry: "වැඩ ප්‍රමාණය small, medium, large ලෙස කුමක්ද?",
    bar_bending: "drawing එකක් තිබේද, සහ වැඩ ප්‍රමාණය කොපමණද?",
    carpentry: "measurements සහ කළ යුතු item එකේ ඡායාරූප තිබේද?",
    painting: "paint සහ primer ඔබ සපයනවාද?",
    tiling: "ටයිල් සහ grout ද්‍රව්‍ය ඔබ සපයනවාද?",
    cleaning: "පිරිසිදු කළ යුතු කාමර / ප්‍රමාණය කොපමණද?",
    quantity_surveying: "BOQ/estimate සඳහා drawings හෝ site details තිබේද?",
    engineering: "ඉංජිනේරු උපදෙස් සඳහා drawings, photos, site location තිබේද?",
    architecture: "නව plan එකක්ද, renovation එකක්ද, නැතිනම් approval drawing එකක්ද?",
    accounting: "ගිණුම් සේවාව one-time ද, මාසිකවද?",
    teaching: "subject, grade, online/home visit/group class ද සඳහන් කරන්න.",
    printing: "Quantity, paper size, color/B&W, binding/delivery අවශ්‍යද සඳහන් කරන්න.",
    graphic_design: "Design size, style reference, language, revisions සහ deadline සඳහන් කරන්න.",
    typesetting: "Pages ගණන, language, font/layout requirements සහ source file type සඳහන් කරන්න.",
    data_entry: "Records ගණන, source format, output format සහ deadline සඳහන් කරන්න.",
    writing_translation: "Word count, language pair, tone/style සහ deadline සඳහන් කරන්න.",
    web_development: "Pages/features, reference site, hosting/domain අවශ්‍යද සඳහන් කරන්න.",
    digital_marketing: "Platform, monthly budget, target audience සහ objective සඳහන් කරන්න.",
    video_editing: "Raw footage length, final duration, style සහ subtitles අවශ්‍යද සඳහන් කරන්න.",
    photography: "Date, location, hours, edited photo count සහ delivery time සඳහන් කරන්න.",
    computer_repair: "Device model, problem, onsite/shop visit සහ backup අවශ්‍යද සඳහන් කරන්න.",
    mobile_repair: "Phone model, issue, original/compatible parts preference සඳහන් කරන්න.",
    pest_control: "Pest type, area size, children/pets ඉන්නවද සහ treatment urgency සඳහන් කරන්න.",
    gardening_landscaping: "Garden size, tools/waste removal අවශ්‍යද සහ one-time/regular ද සඳහන් කරන්න.",
    security_cctv: "Camera count, wiring distance, equipment supply අවශ්‍යද සඳහන් කරන්න.",
    appliance_repair: "Brand/model, issue, error code තිබේද සහ parts needed ද සඳහන් කරන්න.",
    event_management: "Event date, guests, venue, package items සහ setup time සඳහන් කරන්න.",
    virtual_assistant: "Tasks, weekly hours, tools/login access අවශ්‍යද සහ response time සඳහන් කරන්න.",
    beauty_wellness: "Service type, date/time, home visit ද සහ hygiene/certificate expectations සඳහන් කරන්න."
  };
  return [...common, byCategory[slug] || "වැඩේ ප්‍රමාණය සහ අවශ්‍ය දේවල් පැහැදිලි කළ හැකිද?", urgent ? "හදිසි වැඩක් නම් එන්න ඕන අවම වෙලාව සඳහන් කරන්න." : null].filter(Boolean);
}

function providerSupplyCapabilities(provider) {
  if (provider.supplyCapabilities?.length) return provider.supplyCapabilities;
  if (provider.quoteOnly || ["quantity_surveying", "engineering", "architecture", "accounting"].includes(provider.category)) return ["labour_only"];
  if (["masonry", "plumbing", "electrical", "painting", "tiling", "welding", "ac_repair", "carpentry", "bar_bending"].includes(provider.category)) {
    return ["labour_only", "tools", "materials"];
  }
  if (provider.category === "cleaning") return ["labour_only", "tools"];
  if (remoteFriendlyCategorySlugs.includes(provider.category)) return ["labour_only", "tools"];
  return ["labour_only"];
}

function providerTimeSlots(provider) {
  if (provider.availableSlots?.length) return provider.availableSlots;
  if (provider.slotRates) return Object.entries(provider.slotRates).filter(([, rate]) => Number(rate) > 0).map(([slot]) => slot);
  if (["plumbing", "electrical", "ac_repair"].includes(provider.category)) return ["morning", "lunch", "evening", "night"];
  if (provider.category === "transport") return ["morning", "lunch", "evening", "night"];
  if (provider.category === "teaching") return ["evening", "night"];
  if (remoteFriendlyCategorySlugs.includes(provider.category)) return ["morning", "lunch", "evening", "night"];
  return ["morning", "lunch", "evening"];
}

function isRemoteFriendlyProvider(provider) {
  return remoteFriendlyCategorySlugs.includes(provider.category);
}

function estimateDistanceKm(provider, job) {
  if (isRemoteFriendlyProvider(provider)) return 0;
  // Real point-to-point distance when both sides shared GPS.
  if (Number.isFinite(provider.lat) && Number.isFinite(provider.lng) && Number.isFinite(job.lat) && Number.isFinite(job.lng)) {
    return Math.round(haversineKm({ lat: job.lat, lng: job.lng }, { lat: provider.lat, lng: provider.lng }) * 10) / 10;
  }
  if (!job.district || !provider.district) return Number(provider.distanceKm || 0);
  return districtDistanceKm[job.district]?.[provider.district] ?? Number(provider.distanceKm || 0);
}

function providerSlotRate(provider, slot) {
  const slotRate = Number(provider.slotRates?.[slot] || 0);
  return slotRate || Number(provider.rate || 0);
}

function selectedPricingMode() {
  return $("input[name='pricingMode']:checked")?.value || "single";
}

function syncPricingModeUI() {
  const mode = selectedPricingMode();
  const baseRate = Number($("#providerRate")?.value || 0);
  Object.entries(slotRateInputs).forEach(([slot, inputId]) => {
    const input = $(`#${inputId}`);
    const checkbox = $(`input[name='providerSlot'][value='${slot}']`);
    if (!input || !checkbox) return;
    const enabled = mode === "by_slot" && checkbox.checked;
    input.disabled = !enabled;
    input.placeholder = mode === "by_slot" ? "උදා: 3500" : (baseRate ? `රු. ${baseRate.toLocaleString()}` : "එකම ගාස්තුව");
    if (!enabled) input.value = "";
  });
}

function collectProviderPricing() {
  const pricingMode = selectedPricingMode();
  const baseRate = Number($("#providerRate").value || 0);
  const selectedSlots = $all("input[name='providerSlot']:checked").map((input) => input.value);
  const availableSlots = selectedSlots.length ? selectedSlots : ["morning"];
  const slotRates = Object.fromEntries(availableSlots.map((slot) => {
    const explicitRate = pricingMode === "by_slot" ? Number($(`#${slotRateInputs[slot]}`)?.value || 0) : 0;
    return [slot, explicitRate || baseRate];
  }).filter(([, rate]) => rate > 0));
  const primaryRate = baseRate || Math.min(...Object.values(slotRates), Infinity);
  return {
    pricingMode,
    baseRate,
    selectedSlots: availableSlots,
    slotRates,
    primaryRate: Number.isFinite(primaryRate) ? primaryRate : 0
  };
}

function formatProviderRates(provider) {
  const slots = providerTimeSlots(provider);
  if (!provider.slotRates || provider.pricingMode !== "by_slot") {
    return provider.rate ? `එකම ගාස්තුව: රු. ${Number(provider.rate).toLocaleString()} (${formatSlots(slots)})` : "Quote අනුව";
  }
  return slots.map((slot) => `${timeSlotLabels[slot] || slot}: රු. ${providerSlotRate(provider, slot).toLocaleString()}`).join(" / ");
}

function calculateBestMarketOffer(provider, job, classification) {
  const quoteOnly = isQuoteOnlyProvider(provider, classification);
  const requestedSlots = job.accessSlots?.length ? job.accessSlots : ["morning"];
  const offeredSlots = providerTimeSlots(provider);
  const compatibleSlots = requestedSlots.filter((slot) => offeredSlots.includes(slot));
  const slotsToPrice = compatibleSlots.length ? compatibleSlots : offeredSlots;
  const distanceKm = estimateDistanceKm(provider, job);
  const distanceCharge = quoteOnly ? 0 : Math.round(Math.max(0, distanceKm - 5) * Number(provider.perKmRate || 45));
  const options = slotsToPrice
    .map((slot) => {
      const baseRate = providerSlotRate(provider, slot);
      return {
        slot,
        baseRate,
        distanceCharge,
        total: quoteOnly ? 0 : baseRate + distanceCharge
      };
    })
    .filter((option) => quoteOnly || option.baseRate > 0)
    .sort((a, b) => a.total - b.total);
  const best = options[0] || { slot: compatibleSlots[0] || offeredSlots[0] || "morning", baseRate: Number(provider.rate || 0), distanceCharge, total: Number(provider.rate || 0) + distanceCharge };
  const clientOffer = Number(job.budget || 0);
  const gap = quoteOnly || !clientOffer ? 0 : best.total - clientOffer;
  const priceFit = quoteOnly
    ? 0.72
    : clientOffer
      ? Math.max(0.15, Math.min(1.15, clientOffer / best.total))
      : 0.65;
  return {
    quoteOnly,
    slot: best.slot,
    slotLabel: timeSlotLabels[best.slot] || best.slot,
    slotBaseRate: best.baseRate,
    distanceKm,
    distanceCharge,
    total: best.total,
    clientOffer,
    gap,
    priceFit,
    compatibleSlotCount: compatibleSlots.length
  };
}

function hasCalendarFit(provider, job) {
  if (!job.date) return true;
  const day = new Date(`${job.date}T08:00:00`).getDay();
  const workingDays = provider.workingDays || [1, 2, 3, 4, 5, 6];
  return workingDays.includes(day) && hasSlotFit(provider, job);
}

function hasSlotFit(provider, job) {
  const requested = job.accessSlots?.length ? job.accessSlots : ["morning", "evening"];
  const offered = providerTimeSlots(provider);
  return requested.some((slot) => offered.includes(slot));
}

function hasMaterialFit(provider, job) {
  const requested = job.materialsBy || "client_materials";
  const capabilities = providerSupplyCapabilities(provider);
  if (requested === "worker_materials" || requested === "both") return capabilities.includes("materials");
  if (requested === "worker_tools") return capabilities.includes("tools") || capabilities.includes("materials");
  return true;
}

function isQuoteOnlyProvider(provider, classification) {
  return Boolean(provider.quoteOnly || professionalCategorySlugs.includes(classification.category.slug) || provider.rate === 0);
}

function evaluateProvider(provider, job, classification) {
  const reasons = [];
  const workersNeeded = Number(job.workersNeeded || classification.workersNeeded || 1);
  const teamSize = Number(provider.teamSize || 1);
  const quoteOnly = isQuoteOnlyProvider(provider, classification);
  const marketOffer = calculateBestMarketOffer(provider, job, classification);

  if (!provider.approved) reasons.push("admin approval නැහැ");
  if (provider.suspended || provider.blacklisted) reasons.push("suspend/blacklist flag ඇත");
  if (provider.availability === "offline") reasons.push("දැනට offline");
  if (provider.category !== classification.category.slug) reasons.push("වැඩේ වර්ගය ගැළපෙන්නේ නැහැ");
  if (tierRank[provider.tier] < tierRank[classification.minTier]) reasons.push(`${translateTier(classification.minTier)} මට්ටම අවශ්‍යයි`);
  if (!isRemoteFriendlyProvider(provider) && marketOffer.distanceKm > provider.radiusKm) reasons.push("සේවා සපයන ප්‍රදේශයෙන් පිටත");
  if (!isRemoteFriendlyProvider(provider) && job.district && provider.district && job.district !== provider.district && provider.radiusKm < 30) reasons.push("ප්‍රදේශය ගැළපෙන්නේ නැහැ");
  if (!hasCalendarFit(provider, job)) reasons.push("තෝරාගත් දිනයේ availability නැහැ");
  if (!hasSlotFit(provider, job)) reasons.push("ඔබ දාපු වේලාවන්ට provider free නැහැ");
  if (!hasMaterialFit(provider, job)) reasons.push("බඩු/උපකරණ සපයන හැකියාව ගැළපෙන්නේ නැහැ");
  const jobEngagement = job.engagementType || "day";
  const providerEngagements = provider.engagementTypes || ["quick", "day"];
  if (!providerEngagements.includes(jobEngagement)) reasons.push("මෙම ආකාරයේ (කාල) වැඩ භාරගන්නේ නැහැ");
  if (jobEngagement === "full_time" && Number(job.daysPerWeek || 0) > 0 && Number(provider.daysPerWeek || 0) > 0 && Number(provider.daysPerWeek) < Number(job.daysPerWeek)) reasons.push("සතියකට අවශ්‍ය දින ගණනට ලබාගත නොහැක");
  if (workersNeeded > 1 && teamSize < workersNeeded) reasons.push(`අය ${workersNeeded}ක් ඕනේ; ප්‍රොෆයිල් එකේ ඉන්නේ ${teamSize}යි`);
  if (job.budget && !quoteOnly && marketOffer.total > job.budget * 1.35) reasons.push("client දෙන මිලට වඩා provider offer එක වැඩියි");

  if (reasons.length) return { eligible: false, provider, reasons };

  const overlap = classification.skillTags.filter((skill) => provider.skills.includes(skill)).length;
  const skillRatio = classification.skillTags.length ? overlap / classification.skillTags.length : 1;
  const distanceFactor = Math.max(0, 1 - marketOffer.distanceKm / provider.radiusKm);
  const urgentJob = job.urgency === "today";
  const slotFactor = hasSlotFit(provider, job) ? 1 : 0;
  const materialFactor = hasMaterialFit(provider, job) ? 1 : 0.2;
  const availabilityFactor = (provider.availability === "available" ? 1 : (urgentJob ? 0.05 : 0.4)) * slotFactor;
  const tierFactor = tierRank[provider.tier] / 6;
  const ratingFactor = provider.ratingCount ? provider.rating / 5 : 0.6;
  const historyFactor = Math.min((provider.jobsCompleted || provider.experience || 0) / 25, 1);
  const portfolioText = `${provider.portfolio || ""} ${(provider.skills || []).join(" ")}`.toLowerCase();
  const portfolioHits = classification.skillTags.filter((skill) => portfolioText.includes(skill.toLowerCase())).length;
  const portfolioFactor = classification.skillTags.length ? Math.max(skillRatio * 0.6, portfolioHits / classification.skillTags.length) : 0.7;
  const priceFactor = marketOffer.priceFit;
  const responseFactor = provider.responseRate || 0.6;
  const lastInvitedTime = provider.lastInvitedAt ? new Date(provider.lastInvitedAt).getTime() : 0;
  const daysSinceInvite = lastInvitedTime ? (Date.now() - lastInvitedTime) / 86400000 : 30;
  const leadLoad = provider.leadsReceived || 0;
  const fairnessFactor = Math.max(0.25, Math.min(1, daysSinceInvite / 10)) * Math.max(0.4, 1 - leadLoad / 80);
  const score =
    22 * skillRatio +
    11 * availabilityFactor +
    12 * distanceFactor +
    12 * tierFactor +
    10 * ratingFactor +
    8 * historyFactor +
    8 * portfolioFactor +
    7 * priceFactor +
    4 * responseFactor +
    3 * fairnessFactor +
    3 * materialFactor;

  return {
    eligible: true,
    provider: {
      ...provider,
      score: Math.round(score),
      scoreParts: {
        skills: Math.round(skillRatio * 100),
        availability: Math.round(availabilityFactor * 100),
        distance: Math.round(distanceFactor * 100),
        trust: Math.round(tierFactor * 100),
        budget: Math.round(Math.min(priceFactor, 1) * 100),
        materials: Math.round(materialFactor * 100)
      },
      marketOffer,
      effectiveRate: marketOffer.total,
      selectedSlot: marketOffer.slot,
      rationale: `${classification.skillTags.slice(0, 2).join(", ")} කුසලතා, ${marketOffer.slotLabel} slot එක, ${marketOffer.distanceKm} km දුර සහ ${quoteOnly ? "quote workflow" : `රු. ${marketOffer.total.toLocaleString()} market offer එක`} නිසා ගැලපේ.`
    }
  };
}

function scoreProvider(provider, job, classification) {
  const result = evaluateProvider(provider, job, classification);
  return result.eligible ? result.provider : null;
}

function diagnoseSupplyGap(job, providers = state.providers) {
  const attempts = providers.map((provider) => evaluateProvider(provider, job, job.classification));
  const sameCategory = attempts.filter((item) => item.provider.category === job.classification.category.slug);
  const relevantAttempts = sameCategory.length ? sameCategory : attempts.filter((item) => item.reasons?.length && !item.reasons.includes("වැඩේ වර්ගය ගැළපෙන්නේ නැහැ"));
  const reasonCounts = relevantAttempts
    .flatMap((item) => item.reasons || [])
    .reduce((acc, reason) => {
      acc[reason] = (acc[reason] || 0) + 1;
      return acc;
    }, {});
  const topReasons = Object.entries(reasonCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([reason, count]) => `${reason} (${count})`);

  return {
    categorySupply: sameCategory.length,
    approvedCategorySupply: sameCategory.filter((item) => item.provider.approved).length,
    candidateCount: attempts.length,
    topReasons: sameCategory.length ? topReasons : ["මෙම සේවා වර්ගයට seed/approved providers නැහැ"],
    action: sameCategory.length
      ? "මෙම කාණ්ඩයේ providers ඇත, නමුත් budget / tier / availability / time-slot / materials / team-size filter වලින් ඉවත් වුණා."
      : "මෙම කාණ්ඩයට අනුමත providers බඳවා ගැනීම පළමුව අවශ්‍යයි."
  };
}

async function createJob(formData) {
  const classification = classifyRequirement(formData.description, formData.structuredInput);
  const job = {
    id: `job-${Date.now()}`,
    description: formData.description,
    district: formData.district,
    urgency: formData.urgency,
    budget: Number(formData.budget || 0),
    date: formData.date,
    materialsBy: classification.materialsBy,
    accessSlots: classification.accessSlots,
    accessInfo: classification.accessInfo,
    jobSize: classification.jobSize,
    workersNeeded: classification.workersNeeded || Number(formData.workersNeeded || 1),
    photos: formData.photos,
    engagementType: formData.engagementType || "day",
    estimatedHours: formData.estimatedHours || 0,
    durationDays: formData.durationDays || 0,
    daysPerWeek: formData.daysPerWeek || 0,
    lat: Number.isFinite(formData.lat) ? formData.lat : null,
    lng: Number.isFinite(formData.lng) ? formData.lng : null,
    status: "matching",
    classification,
    createdAt: new Date().toISOString()
  };
  let providerPool = state.providers;
  const backend = window.PodiBackend;
  if (backend?.isConfigured()) {
    if (!backend.currentUser()) {
      toast("ඉල්ලීම ඉදිරියට යාමට ගිණුමට ඇතුළු වන්න.");
      return;
    }
    try {
      const savedJob = await backend.submitJob({
        category: classification.category.slug,
        description: job.description,
        district: job.district,
        urgency: job.urgency,
        budgetLkr: job.budget,
        requestedDate: job.date,
        jobSize: job.jobSize,
        workersNeeded: job.workersNeeded,
        materialsBy: job.materialsBy,
        accessSlots: job.accessSlots,
        engagementType: job.engagementType,
        estimatedHours: job.estimatedHours,
        durationDays: job.durationDays,
        daysPerWeek: job.daysPerWeek,
        lat: job.lat,
        lng: job.lng
      });
      job.id = savedJob.id;
      const providerResult = await backend.searchProviders({category: classification.category.slug, district: job.district, lat: job.lat, lng: job.lng, page: 1, pageSize: 50});
      providerPool = Array.isArray(providerResult) ? providerResult : (providerResult.items || []);
    } catch (error) {
      toast(error.message || "ඉල්ලීම සුරැකීමට නොහැකි විය. නැවත උත්සාහ කරන්න.");
      return;
    }
  }
  const matches = providerPool
    .map((provider) => scoreProvider(provider, job, classification))
    .filter(Boolean)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  job.matches = matches.map((match, index) => ({ ...match, rank: index + 1, status: "suggested" }));
  job.status = job.matches.length ? "shortlisted" : "matching";
  job.diagnostic = job.matches.length ? null : diagnoseSupplyGap(job, providerPool);
  state.jobs.unshift(job);
  if (job.matches.length) {
    state.leads.unshift(...job.matches.map((match) => ({
      id: `lead-${job.id}-${match.id}`,
      jobId: job.id,
      workerId: match.id,
      workerName: match.name,
      category: classification.category.si,
      district: job.district,
      urgency: job.urgency,
      status: "invited"
    })));
  } else {
    state.disputes.unshift({
      id: `manual-${job.id}`,
      title: `${classification.category.si} සඳහා ගැලපෙන supply නැහැ`,
      status: "open",
      detail: `${job.diagnostic.action} Filter notes: ${job.diagnostic.topReasons.join(" / ") || "category supply නැහැ"}.`
    });
  }
  state.audit.push(`job.classified:${job.id}`);
  state.audit.push(`matches.persisted:${job.matches.length}`);
  saveState();
  render();
  toast(job.matches.length ? `ගැළපෙන සේවා සපයන්නන් ${job.matches.length}ක් සොයාගන්නා ලදී.` : "දැනට ගැළපෙන සේවා සපයන්නන් නොමැත. අපි ඔබේ ඉල්ලීම පරීක්ෂා කරමින් සිටිමු.");
  setTimeout(() => {
    document.querySelector(".shortlist-panel")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 150);
}

const SRI_LANKA_DISTRICTS = [
  ["Colombo", "කොළඹ"], ["Gampaha", "ගම්පහ"], ["Kalutara", "කළුතර"],
  ["Kandy", "මහනුවර"], ["Matale", "මාතලේ"], ["Nuwara Eliya", "නුවරඑළිය"],
  ["Galle", "ගාල්ල"], ["Matara", "මාතර"], ["Hambantota", "හම්බන්තොට"],
  ["Jaffna", "යාපනය"], ["Kilinochchi", "කිලිනොච්චිය"], ["Mannar", "මන්නාරම"],
  ["Vavuniya", "වවුනියාව"], ["Mullaitivu", "මුලතිව්"], ["Batticaloa", "මඩකලපුව"],
  ["Ampara", "අම්පාර"], ["Trincomalee", "ත්‍රිකුණාමලය"], ["Kurunegala", "කුරුණෑගල"],
  ["Puttalam", "පුත්තලම"], ["Anuradhapura", "අනුරාධපුර"], ["Polonnaruwa", "පොළොන්නරුව"],
  ["Badulla", "බදුල්ල"], ["Monaragala", "මොණරාගල"], ["Ratnapura", "රත්නපුර"],
  ["Kegalle", "කෑගල්ල"]
];

function renderDistricts() {
  const options = SRI_LANKA_DISTRICTS.map(([value, label]) => `<option value="${value}">${label}</option>`).join("");
  $all("select[data-districts]").forEach((select) => {
    const current = select.value;
    select.innerHTML = options;
    if (current) select.value = current;
  });
}

function render() {
  renderDistricts();
  renderCategories();
  renderClientRequirementControls();
  renderRoleRegistration();
  renderLatestJob();
  renderProviderWorkspace();
}

function renderCategories() {
  const providerSelect = $("#providerCategory");
  const jobSelect = $("#jobCategory");
  if (providerSelect && !providerSelect.options.length) {
    providerSelect.innerHTML = categories.map((category) => `<option value="${category.slug}">${category.si}</option>`).join("");
    providerSelect.value = "general_labour";
  }
  if (jobSelect && !jobSelect.options.length) {
    jobSelect.innerHTML = categories.map((category) => `<option value="${category.slug}">${category.si}</option>`).join("");
    jobSelect.value = "plumbing";
  }
}

function selectedJobCategory() {
  return categoryBySlug($("#jobCategory")?.value || "plumbing");
}

function renderClientRequirementControls() {
  const category = selectedJobCategory();
  const guidance = $("#jobGuidance");
  const skillChips = $("#jobSkillChips");
  const descriptionLabel = $("#jobDescriptionLabel");
  if (!guidance || !skillChips) return;

  guidance.innerHTML = `
    <strong>${category.si}</strong>
    <p>${category.guidance}</p>
    <div class="role-meta-grid">
      <div class="role-meta"><small>ගාස්තු ක්‍රමය</small>${category.priceModel}</div>
      <div class="role-meta"><small>අවශ්‍ය සත්‍යාපනය</small>${translateTier(category.minTier)}</div>
      <div class="role-meta"><small>සේවා වර්ගය</small>${category.workerType}</div>
    </div>
  `;
  skillChips.innerHTML = category.skills.map((skill, index) => `
    <label>
      <input type="checkbox" name="jobSkill" value="${skill}" ${index < 2 ? "checked" : ""}>
      ${skill}
    </label>
  `).join("");
  descriptionLabel.textContent = "මොන වැඩේද? (කෙටියෙන්)";
}

function selectedProviderCategory() {
  return categoryBySlug($("#providerCategory")?.value || "general_labour");
}

function renderRoleRegistration() {
  const category = selectedProviderCategory();
  const guidance = $("#roleGuidance");
  const skillChips = $("#providerSkillChips");
  const rateLabel = $("#rateLabel");
  const evidenceLabel = $("#evidenceLabel");
  const documentLabel = $("#documentLabel");
  if (!guidance || !skillChips) return;

  guidance.innerHTML = `
    <strong>${category.si}</strong>
    <p>${category.guidance}</p>
    <div class="role-meta-grid">
      <div class="role-meta"><small>ලියාපදිංචි වර්ගය</small>${category.workerType}</div>
      <div class="role-meta"><small>ගාස්තු ක්‍රමය</small>${category.priceModel}</div>
      <div class="role-meta"><small>අවශ්‍ය සාක්ෂි</small>${category.evidence}</div>
    </div>
  `;
  skillChips.innerHTML = category.skills.map((skill, index) => `
    <label>
      <input type="checkbox" name="providerSkill" value="${skill}" ${index < 2 ? "checked" : ""}>
      ${skill}
    </label>
  `).join("");
  rateLabel.textContent = `${category.rateLabel} - එකම ගාස්තුව නම් මෙය පමණක් පුරවන්න`;
  evidenceLabel.textContent = category.group === "professional" || category.group === "professional_service"
    ? "Qualification / experience ගැන කෙටි විස්තරයක්"
    : category.group === "other"
      ? "ඔබ කරන වැඩ / සේවාව කෙටියෙන් ලියන්න"
      : "ඔබේ වැඩ පළපුරුද්ද ගැන කෙටි විස්තරයක්";
  documentLabel.textContent = category.documentLabel;
}

function renderLatestJob() {
  const job = state.jobs[0];
  renderAiPanel(job);
  renderShortlist(job);
  renderTimeline(job);
}

function renderAiPanel(job) {
  const panel = $("#aiPanel");
  if (!job) {
    panel.innerHTML = "<p>ඉහත තොරතුරු පුරවා <strong>සුදුසු අය බලන්න</strong> ඔබන්න.</p>";
    return;
  }
  const c = job.classification;
  panel.innerHTML = `
    <div class="ai-card">
      <h3>${c.category.si}</h3>
      <p>${c.summarySi}</p>
        <div class="ai-meta">
          <span class="tag">රු. ${Number(job.budget || 0).toLocaleString()} දක්වා</span>
          <span class="tag">${translateJobSize(c.jobSize)}</span>
          <span class="tag">අය ${c.workersNeeded || 1}ක්</span>
          <span class="tag">${formatSlots(c.accessSlots)}</span>
      </div>
      ${c.accessInfo ? `<p class="muted"><strong>Access:</strong> ${escapeHTML(c.accessInfo)}</p>` : ""}
      <details class="inline-details"><summary>සේවා සපයන්නාගෙන් අහන්න ඕන දේ</summary><ol class="question-list">${c.questions.map((q) => `<li>${q}</li>`).join("")}</ol></details>
    </div>
  `;
}

function renderShortlist(job) {
  const list = $("#shortlist");
  const count = $("#shortlistCount");
  if (!job) {
    count.textContent = "ගැලපීම් 0";
    list.className = "provider-grid empty-state";
    list.innerHTML = "<p>ගැලපෙන සේවා සපයන්නන් මෙහි පෙනේ.</p>";
    return;
  }
  count.textContent = `ගැලපීම් ${job.matches.length}`;
  if (!job.matches.length) {
    list.className = "provider-grid empty-state";
    list.innerHTML = `
      <div class="ai-card">
        <h3>දැනට ගැලපෙන අය නැහැ</h3>
        <p>මෙම ඉල්ලීම ${job.classification.category.si} ලෙස හඳුනාගත්තා. කාර්යාලයේ manual matching / workforce recruitment queue එකට යවා ඇත.</p>
        <div class="ai-meta">
          <span class="tag">${translateJobType(job.classification.jobType)}</span>
          <span class="tag">${translateTier(job.classification.minTier)}</span>
        </div>
        ${job.diagnostic ? `
          <div class="gap-diagnostic">
            <strong>Supply gap</strong>
            <p>${job.diagnostic.action}</p>
            <ul>${(job.diagnostic.topReasons.length ? job.diagnostic.topReasons : ["මෙම කාණ්ඩයේ providers තව බඳවාගත යුතුයි"]).map((item) => `<li>${item}</li>`).join("")}</ul>
          </div>
        ` : ""}
      </div>
    `;
    return;
  }
  list.className = "provider-grid";
  list.innerHTML = job.matches.map((provider) => `
    <article class="provider-card">
      <div class="portfolio-art" style="--portfolio-image:${provider.image}"></div>
      <div class="provider-body">
        <div class="provider-topline">
          <div>
            <h3>${escapeHTML(provider.name)}</h3>
            <p class="muted">${escapeHTML(categoryBySlug(provider.category).si)}</p>
          </div>
          <span class="score">★ ${provider.rating}</span>
        </div>
        <div class="ai-meta">
          <span class="badge">${translateTier(provider.tier)}</span>
          <span class="badge">${translateAvailability(provider.availability)}</span>
        </div>
        <div class="mini-grid">
          <div class="mini-stat price-stat"><small>අපේක්ෂිත මුළු ගාස්තුව</small><strong>${provider.quoteOnly ? "මිල විමසන්න" : `රු. ${Number(provider.effectiveRate ?? provider.rate ?? 0).toLocaleString()}`}</strong></div>
          <div class="mini-stat"><small>දුර</small><strong>${provider.marketOffer ? provider.marketOffer.distanceKm : provider.distanceKm} km</strong></div>
          <div class="mini-stat"><small>වේලාව</small><strong>${provider.selectedSlot ? timeSlotLabels[provider.selectedSlot] : formatSlots(providerTimeSlots(provider))}</strong></div>
        </div>
        <details class="inline-details"><summary>ගැළපෙන්නේ ඇයි?</summary><p class="muted">${escapeHTML(provider.rationale)}</p><p class="muted">${escapeHTML(provider.portfolio)}</p></details>
        <div class="card-actions">
          <button class="primary-action" type="button" data-unlock="${provider.id}" data-job="${job.id}">සම්බන්ධ වන්න</button>
          <button class="ghost-action" type="button" data-book="${provider.id}" data-job="${job.id}">වෙන් කරගන්න</button>
        </div>
      </div>
    </article>
  `).join("");
}

function renderTimeline(job) {
  const timeline = $("#jobTimeline");
  if (!timeline) return;
  const steps = ["draft", "posted", "matching", "shortlisted", "contact_revealed", "booked", "completed"];
  const stepLabels = {
    draft: "ඉල්ලීම ලියයි",
    posted: "ඉල්ලීම යවයි",
    matching: "ගැලපීම් සොයයි",
    shortlisted: "ගැලපෙන අය පෙන්වයි",
    contact_revealed: "සම්බන්ධතා ලබාදෙයි",
    booked: "වේලාව වෙන් කරයි",
    completed: "වැඩ අවසන්"
  };
  if (!job) {
    timeline.innerHTML = steps.map((step, index) => `<li><span class="step-dot">${index + 1}</span><div><strong>${stepLabels[step]}</strong><p class="muted">පළමු ඉල්ලීම තව නැහැ.</p></div></li>`).join("");
    return;
  }
  const currentIndex = Math.max(job.matches.length ? 3 : 2, steps.indexOf(job.status));
  timeline.innerHTML = steps.map((step, index) => `
    <li class="${index <= currentIndex ? "done" : ""}">
      <span class="step-dot">${index + 1}</span>
      <div><strong>${stepLabels[step]}</strong><p class="muted">${index <= currentIndex ? "සම්පූර්ණයි." : "තව ඉතිරි."}</p></div>
    </li>
  `).join("");
}

function renderProviderWorkspace() {
  const category = selectedProviderCategory();
  syncPricingModeUI();
  $("#calendarStrip").innerHTML = ["සඳුදා", "අඟහ", "බදාදා", "බ්‍රහ", "සිකු", "සෙන", "ඉරිදා"].map((day, index) => `
    <div class="day-cell">
      <strong>${day}</strong>
      <small>${index < 5 ? "උදේ 8 - සවස 5" : index === 5 ? "උදේ 8 - දවල් 1" : "නිවාඩු"}</small>
    </div>
  `).join("");
  $("#ratePreview").innerHTML = `
    <div class="rate-row"><strong>${category.priceModel}</strong><span class="muted">ඔබ දාපු ගාස්තුව පාරිභෝගිකයාට පෙනේ.</span></div>
    <div class="rate-row"><strong>ගාස්තු</strong><span class="muted">පාරිභෝගිකයාට ගෙවිය හැකි මුදල සඳහන් කළ හැක. සේවා සපයන්නා වේලාව අනුව ගාස්තුව දක්වයි. දුර සහ වේලාව සලකා සුදුසු විකල්ප පෙන්වයි.</span></div>
    <div class="rate-row"><strong>බඩු සහ උපකරණ</strong><span class="muted">පාරිභෝගිකයා සපයන බඩු, සේවා සපයන්නාගේ උපකරණ සහ බඩු සපයන සේවා වෙන වෙනම සලකා බලයි.</span></div>
    <div class="rate-row"><strong>වැඩ කළ හැකි වේලාව</strong><span class="muted">පාරිභෝගිකයා සඳහන් කරන වේලාව සේවා සපයන්නාගේ ලබාගත හැකි වේලාව සමඟ සසඳයි.</span></div>
    <div class="rate-row"><strong>වැඩ ගැලපීම</strong><span class="muted">${category.si} ඉල්ලීම්වලට ඔබේ skills, ප්‍රදේශය, ගාස්තුව, පරීක්ෂාව ගැලපේද බලයි.</span></div>
    <div class="rate-row"><strong>පරීක්ෂාව</strong><span class="muted">${category.evidence}</span></div>
  `;
  renderProfileRateManager(category);
  const myLeads = state.leads.filter(lead => {
    const job = state.jobs.find(j => j.id === lead.jobId);
    return job && job.classification && job.classification.category.slug === category.slug;
  });
  const displayLeads = myLeads.length ? myLeads : state.leads;
  const noLeadsMsg = myLeads.length === 0 && state.leads.length > 0
    ? `<p class="muted">${category.si} ඉල්ලීම් තව නැත. ලියාපදිංචිය අනුමත වූ පසු ගැළපෙන ඇණවුම් මෙහි දිස්වේ.</p>`
    : `<p class="muted">ලියාපදිංචිය පරීක්ෂා වූ පසු ගැළපෙන වැඩ මෙහි දිස්වේ.</p>`;
  $("#leadQueue").innerHTML = displayLeads.length ? displayLeads.slice(0, 8).map((lead) => {
    const job = state.jobs.find(j => j.id === lead.jobId);
    const workerName = job ? `${job.classification?.category?.si || lead.category}` : lead.category;
    const isAccepted = lead.status === "accepted";
    const isDeclined = lead.status === "declined";
    return `
    <div class="lead-card">
      <div class="provider-topline">
        <div>
          <h3>${escapeHTML(workerName)} — ${escapeHTML(lead.district)}</h3>
          <p class="muted">${job?.description ? `"${escapeHTML(job.description.slice(0, 60))}${job.description.length > 60 ? "…" : ""}"` : ""}</p>
          <p class="muted">තත්ත්වය: ${translateLeadStatus(lead.status)}</p>
        </div>
        <span class="status-pill">${translateUrgency(lead.urgency)}</span>
      </div>
      ${!isAccepted && !isDeclined ? `
      <div class="row-actions">
        <button class="primary-action" data-respond="${lead.id}" data-status="accepted" type="button">✓ භාරගන්න</button>
        <button class="ghost-action" data-respond="${lead.id}" data-status="declined" type="button">✕ ප්‍රතික්ෂේප</button>
      </div>` : `<p class="muted" style="margin:0;font-size:.82rem;">${isAccepted ? "✓ ඔබ භාරගත්තා" : "✕ ප්‍රතික්ෂේප කළා"}</p>`}
    </div>
  `}).join("") : noLeadsMsg;
}

function renderProfileRateManager(category) {
  const manager = $("#profileRateManager");
  if (!manager) return;
  const providers = state.providers
    .filter((provider) => provider.category === category.slug)
    .slice(0, 5);
  manager.innerHTML = `
    <div class="rate-row">
      <strong>ලියාපදිංචි වූ පසු rate/time වෙනස් කිරීම</strong>
      <span class="muted">ඔබගේ availability වෙනස් වුණාම, මේ profile card එකෙන් one-rate සහ time-slot rates ඉක්මනින් update කරන්න.</span>
    </div>
    ${providers.length ? providers.map((provider) => `
      <div class="provider-rate-card">
        <div>
          <h3>${escapeHTML(provider.name)}</h3>
          <p class="muted">${escapeHTML(formatProviderRates(provider))}</p>
      <p class="muted">වේලාවන්: ${formatSlots(providerTimeSlots(provider))} · ${provider.approved ? "පරීක්ෂා කර ඇත" : "පරීක්ෂා වෙමින්"}</p>
        </div>
        <div class="row-actions">
          <button class="ghost-action" type="button" data-rate-mode="single" data-provider-rate="${provider.id}">එකම ගාස්තුව කරන්න</button>
          <button class="primary-action" type="button" data-rate-mode="by_slot" data-provider-rate="${provider.id}">වේලාව අනුව rate update</button>
        </div>
      </div>
    `).join("") : `<p class="muted">මෙම සේවා වර්ගයට profile එකක් submit කළ පසු, ඔබේ rates සහ වැඩ කළ හැකි වේලාවන් මෙතැනින් update කළ හැක.</p>`}
  `;
}

function translateLeadStatus(status) {
  return {
    invited: "යොමු කර ඇත",
    accepted: "ඔබ භාරගන්නා ලදී",
    declined: "ඔබ ප්‍රතික්ෂේප කරන ලදී"
  }[status] || status;
}

function translateUrgency(urgency) {
  return {
    today: "අද / හෙට",
    this_week: "මෙම සතියේ",
    scheduled: "දිනයක් ඇත"
  }[urgency] || urgency;
}

function translateTier(tier) {
  return {
    t0_phone: "දුරකථනය පමණක්",
    t1_id: "ID පරීක්ෂා කළ",
    t2_profile: "Profile පරීක්ෂා කළ",
    t3_skill: "කුසලතා සාක්ෂි පරීක්ෂා කළ",
    t4_police: "Police clearance ඇති",
    t5_business: "ව්‍යාපාර ලියාපදිංචි",
    t6_vetted: "වේදිකාව පරීක්ෂා කළ"
  }[tier] || tier;
}

function translateAvailability(availability) {
  return {
    available: "සේවාව සඳහා ලබාගත හැක",
    busy: "කාර්යබහුල",
    offline: "දැනට ලබාගත නොහැක"
  }[availability] || availability;
}

function translateJobType(type) {
  return {
    STANDARD: "සාමාන්‍ය වැඩ",
    QUOTE_REQUEST: "මිල ගණන් අවශ්‍යයි",
    ASSISTED_RFQ: "කාර්යාල සහාය අවශ්‍යයි"
  }[type] || type;
}

function translateJobSize(size) {
  return {
    small: "කුඩා වැඩක්",
    medium: "මධ්‍යම වැඩක්",
    large: "ලොකු / project වැඩක්",
    ongoing: "නිතර අවශ්‍ය වැඩක්"
  }[size] || size;
}

function translateMaterialMode(mode) {
  return materialLabels[mode] || mode || "Client බඩු දෙයි";
}

function formatSlots(slots = []) {
  const values = slots.length ? slots : ["morning"];
  return values.map((slot) => timeSlotLabels[slot] || slot).join(" / ");
}

function formatSupply(capabilities = []) {
  const strongest = capabilities.includes("materials")
    ? "materials"
    : capabilities.includes("tools")
      ? "tools"
      : "labour_only";
  return supplyLabels[strongest];
}

function translateSkillLevel(level) {
  return {
    basic: "මූලික කුසලතා",
    skilled: "කුසලතා සහිත",
    specialist: "විශේෂඥ මට්ටම"
  }[level] || level;
}

function renderAdmin() {
  if (!$("#kpis")) return;
  const latestJob = state.jobs[0];
  const unlocked = state.payments.filter((payment) => payment.type === "contact_unlock").length;
  const completed = state.bookings.filter((booking) => booking.status === "completed").length;
  const filledJobs = state.jobs.filter(j => j.matches && j.matches.length > 0).length;
  const fillRate = state.jobs.length ? Math.round(filledJobs / state.jobs.length * 100) + "%" : "–";
  const kpis = [
    ["Jobs", state.jobs.length],
    ["Fill rate", fillRate],
    ["Responses", `${state.leads.filter((lead) => lead.status === "accepted").length}/${state.leads.length}`],
    ["Unlocks", unlocked],
    ["Completed", completed],
    ["Audit", state.audit.length]
  ];
  $("#kpis").innerHTML = kpis.map(([label, value]) => `<div class="kpi"><strong>${value}</strong><span>${label}</span></div>`).join("");
  $("#verificationQueue").innerHTML = state.providers.map((provider) => `
    <div class="admin-row">
      <div class="provider-topline">
        <div>
          <h3>${escapeHTML(provider.name)}</h3>
          <p class="muted">${escapeHTML(categoryBySlug(provider.category).si)} · ${escapeHTML(provider.workerType || categoryBySlug(provider.category).workerType)} · ${escapeHTML(provider.tier)} · ${escapeHTML(provider.requiredEvidence || categoryBySlug(provider.category).evidence)}</p>
        </div>
        <span class="status-pill">${provider.approved ? "අනුමතයි" : "පරීක්ෂාවට"}</span>
      </div>
      <div class="row-actions">
        <button class="primary-action" data-approve="${provider.id}" type="button">අනුමත කරන්න</button>
        <button class="ghost-action" data-audit="${provider.id}" type="button">ලේඛන view audit</button>
      </div>
    </div>
  `).join("");
  $("#disputeQueue").innerHTML = state.disputes.map((dispute) => `
    <div class="admin-row">
      <div class="provider-topline">
        <div>
          <h3>${escapeHTML(dispute.title)}</h3>
          <p class="muted">${escapeHTML(dispute.detail)}</p>
        </div>
        <span class="status-pill">${dispute.status}</span>
      </div>
      <button class="primary-action" data-resolve="${dispute.id}" type="button">Resolve dispute</button>
    </div>
  `).join("");
}

function unlockContact(jobId, providerId) {
  // Contact opens through a confirmed booking; take the client straight there.
  openBooking(jobId, providerId);
}

async function bookProvider(jobId, providerId) {
  if (!secureBackendConfigured()) {
    toast("වෙන් කිරීම් තවම විවෘත කර නැහැ.");
    return;
  }
  const job = state.jobs.find((item) => item.id === jobId);
  if (!job) return;
  const provider = job.matches.find((item) => item.id === providerId);
  if (!provider) return;
  if (job.status === "booked") { toast("ඉල්ලීම දැනටමත් booking කර ඇත."); return; }
  const alreadyBooked = state.bookings.some(b => b.jobId === jobId && b.providerId === providerId);
  if (alreadyBooked) { toast(`${provider.name} සමඟ දැනටමත් booking කර ඇත.`); return; }
  const agreedAmount = provider.quoteOnly ? 0 : Number(provider.effectiveRate || provider.rate || 0);
  const commissionAmount = provider.quoteOnly ? 0 : Math.round(agreedAmount * 0.06);
  try {
    await window.PodiBackend.createBooking({jobId, providerUid: providerId, agreedAmountLkr: agreedAmount});
  } catch (error) {
    toast(error.message || "Booking request එක save කළ නොහැකි විය.");
    return;
  }
  state.bookings.push({
    id: `booking-${Date.now()}`,
    jobId,
    providerId,
    status: provider.quoteOnly ? "quote_pending" : "confirmed",
    agreedAmount,
    commissionAmount,
    selectedSlot: provider.selectedSlot || provider.marketOffer?.slot || null,
    distanceCharge: provider.marketOffer?.distanceCharge || 0
  });
  job.status = "booked";
  state.audit.push(`booking.confirmed:${jobId}:${providerId}`);
  saveState();
  render();
  toast(provider.quoteOnly
    ? `${provider.name} ට quote ඉල්ලීම යවන ලදී. ඔවුන් ඔබව ඉදිරියේ අමතනු ඇත.`
    : `Booking confirmed. Commission: රු. ${commissionAmount.toLocaleString()}`);
}

async function addProvider() {
  if (!secureBackendConfigured()) {
    toast("Provider registration තවම විවෘත කර නැහැ. සැබෑ පුද්ගලික තොරතුරු ඇතුළත් නොකරන්න.");
    return;
  }
  const name = $("#providerName").value.trim();
  const phone = $("#providerPhone").value.trim();
  if (!name) { toast("ඔබේ නම ඇතුළත් කරන්න."); return; }
  if (!phone || !/^07[0-9]{8}$/.test(phone)) { toast("07XXXXXXXX format දුරකථන අංකයක් ඇතුළත් කරන්න."); return; }
  const category = $("#providerCategory").value;
  const username = $("#providerUsername").value.trim();
  if (!/^[A-Za-z0-9._-]{3,30}$/.test(username)) { toast("Unique username එක English letters, numbers, dot, underscore හෝ dash වලින් දාන්න."); return; }
  const meta = categoryBySlug(category);
  const selectedSkills = $all("input[name='providerSkill']:checked").map((input) => input.value);
  const evidence = $("#providerEvidence").value.trim();
  const supplyMode = $("#providerSupply").value;
  const backend = window.PodiBackend;
  const pricing = collectProviderPricing();
  const supplyCapabilities = supplyMode === "materials"
    ? ["labour_only", "tools", "materials"]
    : supplyMode === "tools"
      ? ["labour_only", "tools"]
      : ["labour_only"];
  const provider = {
    id: `w-${Date.now()}`,
    name: $("#providerName").value,
    username,
    phone: backend?.isConfigured() ? undefined : phone,
    category,
    group: meta.group,
    workerType: meta.workerType,
    priceModel: meta.priceModel,
    requiredEvidence: meta.evidence,
    requiredMinTier: meta.minTier,
    skills: selectedSkills.length ? selectedSkills : meta.skills.slice(0, 2),
    district: $("#providerDistrict").value,
    distanceKm: 6,
    radiusKm: Number($("#providerRadius").value || 15),
    lat: Number($("#providerLat").value) || null,
    lng: Number($("#providerLng").value) || null,
    engagementTypes: (() => { const e = $all("input[name='providerEngagement']:checked").map((input) => input.value); return e.length ? e : ["quick", "day"]; })(),
    daysPerWeek: Number($("#providerDaysPerWeek").value || 0),
    tier: "t0_phone",
    approved: false,
    availability: "available",
    rate: pricing.primaryRate,
    pricingMode: pricing.pricingMode,
    slotRates: pricing.slotRates,
    perKmRate: category === "transport" ? 80 : 45,
    quoteOnly: professionalCategorySlugs.includes(category) || pricing.primaryRate === 0,
    rating: 0,
    ratingCount: 0,
    experience: Number($("#providerExperience").value || 0),
    responseRate: 0.6,
    jobsCompleted: 0,
    leadsReceived: 0,
    lastInvitedAt: null,
    workerTypeKey: meta.workerType.includes("කණ්ඩායම්") || meta.workerType.includes("ව්‍යාපාර") ? "team" : "individual",
    teamSize: Number($("#providerTeamSize").value || (meta.workerType.includes("කණ්ඩායම්") ? 2 : 1)),
    workingDays: [1, 2, 3, 4, 5, 6],
    availableSlots: pricing.selectedSlots,
    supplyCapabilities,
    portfolio: evidence
      ? `${evidence} | කළ හැකි වැඩ: ${(selectedSkills.length ? selectedSkills : meta.skills.slice(0, 2)).join(", ")}`
      : `කළ හැකි වැඩ: ${(selectedSkills.length ? selectedSkills : meta.skills.slice(0, 2)).join(", ")}`,
    image: "linear-gradient(135deg,#135e4b,#a96d18)"
  };

  if (backend?.isConfigured()) {
    if (!backend.currentUser()) { toast("ඔබේ තොරතුරු සුරැකීමට ගිණුමට ඇතුළු වන්න."); return; }
    try {
      await backend.saveProfile({
        displayName: provider.name,
        username,
        phone,
        district: provider.district,
        category: provider.category,
        skills: provider.skills,
        experienceYears: provider.experience,
        rateLkr: provider.rate,
        evidenceSummary: evidence,
        preferredLanguage: "si",
        lat: provider.lat,
        lng: provider.lng,
        serviceRadiusKm: provider.radiusKm,
        engagementTypes: provider.engagementTypes,
        daysPerWeek: provider.daysPerWeek
      });
      const documents = [...$("#providerDocs").files];
      const documentType = $("#providerDocumentType").value;
      for (const file of documents) await backend.uploadDocument(file, documentType);
    } catch (error) {
      toast(error.message || "ඔබේ තොරතුරු සුරැකීමට නොහැකි විය — නැවත උත්සාහ කරන්න.");
      return;
    }
  }
  state.providers.unshift(provider);
  state.audit.push(`provider.submitted:${provider.id}`);
  saveState();
  render();
  const statusMessage = $("#providerStatusMessage");
  if (statusMessage) {
    statusMessage.hidden = false;
    statusMessage.textContent = "ලියාපදිංචිය සාර්ථකයි! ඔබේ තොරතුරු පරීක්ෂා කළ පසු ගැළපෙන වැඩක් ආ විට අපි ඔබ හා සම්බන්ධ වන්නෙමු.";
  }
  $("#providerForm").reset();
  renderRoleRegistration();
  toast("ලියාපදිංචිය යොමු කළා. පරීක්ෂා කිරීමෙන් පසු දැනුම් දෙන්නෙමු.");
}

function updateProviderRates(providerId, mode) {
  const provider = state.providers.find((item) => item.id === providerId);
  if (!provider) return;
  if (mode === "single") {
    const amount = Number(prompt(`${provider.name} සඳහා එකම ගාස්තුව දාන්න (රු.)`, provider.rate || "") || 0);
    if (!amount) { toast("ගාස්තුව update කළේ නැහැ."); return; }
    provider.pricingMode = "single";
    provider.rate = amount;
    provider.slotRates = Object.fromEntries(providerTimeSlots(provider).map((slot) => [slot, amount]));
    provider.quoteOnly = professionalCategorySlugs.includes(provider.category) || amount === 0;
  } else {
    const currentSlots = providerTimeSlots(provider);
    const nextSlotRates = {};
    Object.keys(timeSlotLabels).forEach((slot) => {
      const currentRate = providerSlotRate(provider, slot) || provider.rate || "";
      const answer = prompt(`${timeSlotLabels[slot]} rate (රු.) - වැඩ නොකරන නම් හිස්ව තියන්න`, currentSlots.includes(slot) ? currentRate : "");
      const amount = Number(answer || 0);
      if (amount > 0) nextSlotRates[slot] = amount;
    });
    if (!Object.keys(nextSlotRates).length) { toast("අවම එක time slot rate එකක්වත් දාන්න."); return; }
    provider.pricingMode = "by_slot";
    provider.slotRates = nextSlotRates;
    provider.availableSlots = Object.keys(nextSlotRates);
    provider.rate = Math.min(...Object.values(nextSlotRates));
    provider.quoteOnly = professionalCategorySlugs.includes(provider.category) || provider.rate === 0;
  }
  state.audit.push(`provider.rates.updated:${provider.id}:${mode}`);
  saveState();
  render();
  toast("Rates සහ availability update කළා.");
}

function toast(message) {
  const existing = $(".toast");
  if (existing) existing.remove();
  const node = document.createElement("div");
  node.className = "toast";
  node.textContent = message;
  document.body.appendChild(node);
  setTimeout(() => node.remove(), 3200);
}

document.addEventListener("click", (event) => {
  const roleTab = event.target.closest(".role-tab");
  if (roleTab) {
    switchView(roleTab.dataset.view);
  }

  const jumpButton = event.target.closest("[data-jump-view]");
  if (jumpButton) {
    switchView(jumpButton.dataset.jumpView);
    document.querySelector(`#${jumpButton.dataset.jumpView}-view`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const unlockButton = event.target.closest("[data-unlock]");
  if (unlockButton) unlockContact(unlockButton.dataset.job, unlockButton.dataset.unlock);

  const bookButton = event.target.closest("[data-book]");
  if (bookButton) openBooking(bookButton.dataset.job, bookButton.dataset.book);

  const responseButton = event.target.closest("[data-respond]");
  if (responseButton) {
    const lead = state.leads.find((item) => item.id === responseButton.dataset.respond);
    lead.status = responseButton.dataset.status;
    state.audit.push(`lead.${lead.status}:${lead.id}`);
    saveState();
    render();
    toast(lead.status === "accepted" ? "ඔබ සේවාව භාරගත් බව සටහන් විය." : "ඔබ සේවාව ප්‍රතික්ෂේප කළ බව සටහන් විය.");
  }

  const rateButton = event.target.closest("[data-provider-rate]");
  if (rateButton) {
    updateProviderRates(rateButton.dataset.providerRate, rateButton.dataset.rateMode);
  }

  const approveButton = event.target.closest("[data-approve]");
  if (approveButton) {
    const provider = state.providers.find((item) => item.id === approveButton.dataset.approve);
    provider.approved = true;
    provider.tier = categoryBySlug(provider.category).minTier || "t1_id";
    state.audit.push(`doc.verify:${provider.id}`);
    saveState();
    render();
    toast("Provider අනුමත කර විශ්වාස මට්ටම යාවත්කාලීන කළා.");
  }

  const auditButton = event.target.closest("[data-audit]");
  if (auditButton) {
    state.audit.push(`pii.view:${auditButton.dataset.audit}`);
    saveState();
    render();
    toast("Sensitive document view was audit logged.");
  }

  const resolveButton = event.target.closest("[data-resolve]");
  if (resolveButton) {
    const dispute = state.disputes.find((item) => item.id === resolveButton.dataset.resolve);
    dispute.status = "resolved";
    state.audit.push(`dispute.resolve:${dispute.id}`);
    saveState();
    render();
    toast("Dispute resolved.");
  }
});

function switchView(viewName) {
  $all(".role-tab").forEach((tab) => tab.classList.toggle("active", tab.dataset.view === viewName));
  $all(".view").forEach((view) => view.classList.toggle("active", view.id === `${viewName}-view`));
  if (viewName === "provider" && typeof renderAvailabilityCalendar === "function") renderAvailabilityCalendar();
}

function on(selector, eventName, handler) {
  const node = $(selector);
  if (node) node.addEventListener(eventName, handler);
}

on("#jobForm", "submit", async (event) => {
  event.preventDefault();
  const jobCategory = $("#jobCategory").value;
  const selectedJobSkills = $all("input[name='jobSkill']:checked").map((input) => input.value);
  await createJob({
    description: $("#jobDescription").value,
    district: $("#jobDistrict").value,
    urgency: $("#jobUrgency").value,
    budget: $("#jobBudget").value,
    date: $("#jobDate").value,
    workersNeeded: $("#jobWorkersNeeded").value,
    materialsBy: $("#jobMaterials").value,
    accessInfo: $("#jobAccessInfo").value.trim(),
    accessSlots: $all("input[name='jobSlot']:checked").map((input) => input.value),
    photos: 0,
    engagementType: $("#jobEngagement").value,
    estimatedHours: Number($("#jobHours").value || 0),
    durationDays: Number($("#jobDurationDays").value || 0),
    daysPerWeek: Number($("#jobDaysPerWeek").value || 0),
    lat: Number($("#jobLat").value) || null,
    lng: Number($("#jobLng").value) || null,
    structuredInput: {
      mode: jobCategory === "other" ? "custom" : "structured",
      categorySlug: jobCategory,
      skillTags: selectedJobSkills,
      urgent: $("#jobUrgency").value === "today",
      jobSize: $("#jobSize").value,
      workersNeeded: Number($("#jobWorkersNeeded").value || 1),
      materialsBy: $("#jobMaterials").value,
      accessInfo: $("#jobAccessInfo").value.trim(),
      accessSlots: $all("input[name='jobSlot']:checked").map((input) => input.value),
      large: $("#jobSize").value === "large" || Number($("#jobWorkersNeeded").value || 1) > 1 || /කණ්ඩායම|team|large|project|5|වහල|house/i.test($("#jobDescription").value)
    }
  });
});

on("#providerForm", "submit", async (event) => {
  event.preventDefault();
  await addProvider();
});

on("#providerCategory", "change", () => {
  renderRoleRegistration();
  renderProviderWorkspace();
  const statusMessage = $("#providerStatusMessage");
  if (statusMessage) {
    statusMessage.hidden = true;
    statusMessage.textContent = "";
  }
});

document.addEventListener("change", (event) => {
  if (event.target.matches("input[name='pricingMode'], input[name='providerSlot']")) {
    syncPricingModeUI();
  }
});

on("#providerRate", "input", () => {
  syncPricingModeUI();
});

on("#jobCategory", "change", () => {
  renderClientRequirementControls();
});

on("#accountToggle", "click", () => {
  const panel = $("#accountPanel");
  panel.hidden = !panel.hidden;
});

function showCodeStep(waiting) {
  $("#accountCodeField").hidden = !waiting;
  $("#sendCodeButton").hidden = waiting;
  $("#verifyButton").hidden = !waiting;
  $("#resendCodeButton").hidden = !waiting;
  if (waiting) $("#accountCode").focus();
}

// Return to the email step so the user can resend the code or fix a typo.
on("#resendCodeButton", "click", () => {
  showCodeStep(false);
  $("#accountCode").value = "";
  $("#accountEmail").focus();
});

// Step 1: email a one-time code.
on("#accountForm", "submit", async (event) => {
  event.preventDefault();
  const backend = window.PodiBackend;
  if (!backend?.isConfigured()) { toast("සේවාව තවම සූදානම් නැහැ. මොහොතකින් නැවත උත්සාහ කරන්න."); return; }
  const email = $("#accountEmail").value.trim();
  if (!email) { toast("Email එකක් ඇතුළත් කරන්න."); return; }
  const button = $("#sendCodeButton");
  button.disabled = true;
  try {
    await backend.requestOtp(email);
    showCodeStep(true);
    toast("කේතය email එකට එවා ඇත. Inbox එක බලන්න.");
  } catch (error) {
    toast(error.message || "කේතය එවීම අසාර්ථකයි.");
  } finally {
    button.disabled = false;
  }
});

// Step 2: verify the code to sign in.
on("#verifyButton", "click", async () => {
  const backend = window.PodiBackend;
  if (!backend?.isConfigured()) return;
  const email = $("#accountEmail").value.trim();
  const code = $("#accountCode").value.trim();
  if (!/^[0-9]{6}$/.test(code)) { toast("6-ඉලක්කම් කේතය ඇතුළත් කරන්න."); return; }
  const button = $("#verifyButton");
  button.disabled = true;
  try {
    await backend.verifyOtp(email, code);
    showCodeStep(false);
    $("#accountCode").value = "";
    toast("ඇතුළු වීම සාර්ථකයි.");
  } catch (error) {
    toast(error.message || "ඇතුළු වීම අසාර්ථකයි.");
  } finally {
    button.disabled = false;
  }
});

on("#logoutButton", "click", () => {
  const backend = window.PodiBackend;
  if (!backend?.isConfigured()) return;
  backend.logout();
  showCodeStep(false);
  toast("ඔබ ඉවත් විය.");
});

function initializeBackendStatus() {
  const backend = window.PodiBackend;
  if (!backend) return;
  const accountStatus = $("#accountStatus");
  if (!backend.isConfigured()) {
    $("#accountToggle").hidden = true;
    return;
  }
  $("#providerSubmit").disabled = false;
  $("#providerDocs").disabled = false;
  $("#accountEmail").disabled = false;
  $("#sendCodeButton").disabled = false;
  $("#accountToggle").hidden = false;
  backend.onAuthChange(async (user) => {
    accountStatus.textContent = user ? `ඇතුළු වී ඇත: ${user.email}` : "Email කේතයෙන් ඇතුළු වී ඔබේ profile එක secure ලෙස save කරන්න.";
    $("#sendCodeButton").hidden = Boolean(user);
    $("#verifyButton").hidden = true;
    $("#accountCodeField").hidden = true;
    $("#logoutButton").hidden = !user;
    $("#bookingsToggle").hidden = !user;
    $("#accountEmail").disabled = Boolean(user);
    if (!user) { currentProviderUid = null; if ($("#availabilityPanel")) $("#availabilityPanel").hidden = true; }
    if (user) {
      try {
        const { user: saved } = await backend.getMe();
        if (!saved) return;
        currentProviderUid = saved.user_uid || null;
        if (saved.display_name) $("#providerName").value = saved.display_name;
        if (saved.username) $("#providerUsername").value = saved.username;
        if (saved.contact_phone) $("#providerPhone").value = saved.contact_phone;
        if (saved.district) $("#providerDistrict").value = saved.district;
        if (saved.provider_category) {
          $("#providerCategory").value = saved.provider_category;
          renderRoleRegistration();
        }
        if (Number.isFinite(Number(saved.experience_years))) $("#providerExperience").value = saved.experience_years;
        if (saved.evidence_summary) $("#providerEvidence").value = saved.evidence_summary;
        const savedSkills = new Set(saved.skills || []);
        $all("input[name='providerSkill']").forEach((input) => { input.checked = savedSkills.has(input.value); });
        if (saved.service_radius_km) $("#providerRadius").value = saved.service_radius_km;
        if (saved.days_per_week) $("#providerDaysPerWeek").value = saved.days_per_week;
        if (Array.isArray(saved.engagement_types) && saved.engagement_types.length) {
          const engSet = new Set(saved.engagement_types);
          $all("input[name='providerEngagement']").forEach((input) => { input.checked = engSet.has(input.value); });
        }
        if (Number.isFinite(saved.lat) && Number.isFinite(saved.lng)) {
          setLocationField($("#providerLat").closest("[data-location]"), saved.lat, saved.lng);
        }
        renderAvailabilityCalendar();
      } catch (error) {
        toast(error.message || "සුරැකි තොරතුරු පූරණය කිරීමට නොහැකි විය.");
      }
    }
  });
}

window.addEventListener("podi-backend-ready", initializeBackendStatus, { once: true });

if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js").catch(() => {});
}

// Android/desktop "Install app" prompt. Chrome fires beforeinstallprompt when the
// PWA is installable; we surface a button and trigger the native prompt on click.
let deferredInstallPrompt = null;
const installButton = $("#installAppButton");
window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredInstallPrompt = event;
  if (installButton) installButton.hidden = false;
});
if (installButton) {
  on("#installAppButton", "click", async () => {
    if (!deferredInstallPrompt) {
      toast("App එක install කිරීමට browser menu එකේ ‘Install app’ / ‘Add to Home screen’ තෝරන්න.");
      return;
    }
    deferredInstallPrompt.prompt();
    const { outcome } = await deferredInstallPrompt.userChoice;
    deferredInstallPrompt = null;
    installButton.hidden = true;
    if (outcome === "accepted") toast("App එක install වෙමින් පවතී.");
  });
}
window.addEventListener("appinstalled", () => {
  deferredInstallPrompt = null;
  if (installButton) installButton.hidden = true;
});

// ---- Location capture: GPS one-tap + Leaflet map-pin fallback ----
function haversineKm(a, b) {
  const R = 6371;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
}

function setLocationField(field, lat, lng) {
  field.querySelector("[data-loc-lat]").value = lat;
  field.querySelector("[data-loc-lng]").value = lng;
  const status = field.querySelector("[data-loc-status]");
  status.textContent = `ස්ථානය තෝරාගත්තා ✓ (${Number(lat).toFixed(4)}, ${Number(lng).toFixed(4)})`;
  status.classList.add("location-set");
}

let leafletPromise = null;
function loadLeaflet() {
  if (leafletPromise) return leafletPromise;
  leafletPromise = new Promise((resolve, reject) => {
    const css = document.createElement("link");
    css.rel = "stylesheet";
    css.href = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css";
    document.head.appendChild(css);
    const js = document.createElement("script");
    js.src = "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js";
    js.onload = () => resolve(window.L);
    js.onerror = () => reject(new Error("map load failed"));
    document.head.appendChild(js);
  });
  return leafletPromise;
}

const mapState = { map: null, marker: null, field: null, latlng: null };
async function openMapPicker(field) {
  mapState.field = field;
  mapState.latlng = null;
  const modal = $("#mapModal");
  modal.hidden = false;
  $("#mapConfirm").disabled = true;
  let L;
  try { L = await loadLeaflet(); } catch (error) { toast("සිතියම load කරන්න බැරි වුණා."); modal.hidden = true; return; }
  if (!mapState.map) {
    mapState.map = L.map("mapCanvas").setView([6.9271, 79.8612], 12);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "© OpenStreetMap", maxZoom: 19 }).addTo(mapState.map);
    mapState.map.on("click", (event) => {
      mapState.latlng = event.latlng;
      if (mapState.marker) mapState.marker.setLatLng(event.latlng);
      else mapState.marker = L.marker(event.latlng).addTo(mapState.map);
      $("#mapConfirm").disabled = false;
    });
  }
  const curLat = Number(field.querySelector("[data-loc-lat]").value);
  const curLng = Number(field.querySelector("[data-loc-lng]").value);
  setTimeout(() => {
    mapState.map.invalidateSize();
    if (curLat && curLng) {
      mapState.map.setView([curLat, curLng], 15);
      mapState.latlng = { lat: curLat, lng: curLng };
      if (mapState.marker) mapState.marker.setLatLng([curLat, curLng]);
      else mapState.marker = L.marker([curLat, curLng]).addTo(mapState.map);
      $("#mapConfirm").disabled = false;
    }
  }, 120);
}

document.addEventListener("click", (event) => {
  const gpsBtn = event.target.closest("[data-loc-gps]");
  if (gpsBtn) {
    const field = gpsBtn.closest("[data-location]");
    if (!navigator.geolocation) { toast("මෙම browser එකේ location නැහැ. සිතියමෙන් තෝරන්න."); return; }
    const status = field.querySelector("[data-loc-status]");
    status.textContent = "ස්ථානය සොයමින්...";
    gpsBtn.disabled = true;
    navigator.geolocation.getCurrentPosition(
      (pos) => { setLocationField(field, pos.coords.latitude, pos.coords.longitude); gpsBtn.disabled = false; },
      () => { status.textContent = "Location දෙන්න බැරි වුණා. සිතියමෙන් තෝරන්න."; gpsBtn.disabled = false; },
      { enableHighAccuracy: true, timeout: 10000 }
    );
    return;
  }
  const mapBtn = event.target.closest("[data-loc-map]");
  if (mapBtn) openMapPicker(mapBtn.closest("[data-location]"));
});

on("#mapClose", "click", () => { $("#mapModal").hidden = true; });
on("#mapConfirm", "click", () => {
  if (mapState.latlng && mapState.field) setLocationField(mapState.field, mapState.latlng.lat, mapState.latlng.lng);
  $("#mapModal").hidden = true;
});

function syncEngagementUI() {
  const value = $("#jobEngagement")?.value;
  if (!value) return;
  $("#hoursField").hidden = value !== "quick";
  $("#durationField").hidden = value !== "multi_day";
  $("#daysPerWeekField").hidden = value !== "full_time";
}
on("#jobEngagement", "change", syncEngagementUI);
syncEngagementUI();

// ---- Booking, availability, contact reveal ----
const bookingCtx = { jobId: null, providerUid: null, amount: 0 };
const PAYMENT_NOTES = {
  cash_on_completion: "වැඩ අවසන් වූ පසු සේවා සපයන්නාට මුදලින් ගෙවන්න."
};
const BOOKING_STATUS_LABEL = { requested: "ඉල්ලා ඇත", confirmed: "තහවුරුයි", completed: "අවසන්", declined: "ප්‍රතික්ෂේපයි", cancelled: "අවලංගුයි", in_progress: "සිදුවෙමින්" };
const PAYMENT_LABEL = { cash_on_completion: "අවසානයේ මුදලින්", deposit_plus_cash: "අත්තිකාරම + මුදල", online_prepay: "Online" };

function openBooking(jobId, providerId) {
  const backend = window.PodiBackend;
  if (!backend?.isConfigured() || !backend.currentUser()) { toast("වෙන් කිරීමට ගිණුමට ඇතුළු වන්න."); return; }
  const job = state.jobs.find((item) => item.id === jobId);
  const provider = job?.matches?.find((match) => match.id === providerId);
  bookingCtx.jobId = jobId;
  bookingCtx.providerUid = providerId;
  bookingCtx.amount = provider?.effectiveRate || provider?.rate || 0;
  $("#bookingProviderName").textContent = provider ? `${provider.name} — වෙන් කරන්න` : "සේවාව වෙන් කරන්න";
  const today = new Date().toISOString().slice(0, 10);
  $("#bookingDate").min = today;
  $("#bookingDate").value = job?.date && job.date >= today ? job.date : today;
  $("#bookingPaymentNote").textContent = PAYMENT_NOTES[$("#bookingPayment").value] || "";
  refreshBookingAvailability();
  $("#bookingModal").hidden = false;
}

async function refreshBookingAvailability() {
  const date = $("#bookingDate").value;
  const el = $("#bookingAvailability");
  if (!date || !bookingCtx.providerUid) { el.textContent = ""; return; }
  el.textContent = "ලබාගත හැකි වේලාවන් පරීක්ෂා කරමින්...";
  try {
    const { occupied } = await window.PodiBackend.getAvailability(bookingCtx.providerUid, date, date);
    const taken = new Set((occupied || []).map((item) => item.slot));
    $all("input[name='bookingSlot']").forEach((input) => {
      const isTaken = taken.has(input.value);
      input.disabled = isTaken;
      if (isTaken) input.checked = false;
      input.parentElement.style.opacity = isTaken ? "0.4" : "1";
    });
    el.textContent = taken.size
      ? `මෙම දිනයේ දැනටමත් වෙන් වී ඇත: ${[...taken].map((s) => timeSlotLabels[s] || s).join(", ")}`
      : "මෙම දිනයේ සියලු වේලාවන් ලබාගත හැක.";
  } catch (error) {
    el.textContent = "";
  }
}

on("#bookingDate", "change", refreshBookingAvailability);
on("#bookingPayment", "change", () => { $("#bookingPaymentNote").textContent = PAYMENT_NOTES[$("#bookingPayment").value] || ""; });
on("#bookingClose", "click", () => { $("#bookingModal").hidden = true; });
on("#bookingConfirm", "click", async () => {
  const date = $("#bookingDate").value;
  const slots = $all("input[name='bookingSlot']:checked").map((input) => input.value);
  if (!date) { toast("දිනයක් තෝරන්න."); return; }
  if (!slots.length) { toast("වේලාවක් තෝරන්න."); return; }
  const button = $("#bookingConfirm");
  button.disabled = true;
  try {
    await window.PodiBackend.createBooking({
      jobId: bookingCtx.jobId, providerUid: bookingCtx.providerUid,
      startDate: date, endDate: date, slots,
      paymentMethod: $("#bookingPayment").value, agreedAmountLkr: bookingCtx.amount
    });
    $("#bookingModal").hidden = true;
    toast("වෙන් කිරීමේ ඉල්ලීම යැව්වා. සේවා සපයන්නා තහවුරු කළ පසු දැනුම් දෙන්නෙමු.");
  } catch (error) {
    toast(error.message || "වෙන් කිරීම අසාර්ථකයි.");
  } finally {
    button.disabled = false;
  }
});

on("#bookingsToggle", "click", openBookingsList);
on("#bookingsClose", "click", () => { $("#bookingsModal").hidden = true; });

// ---- Provider availability calendar (next 14 days x 4 slots) ----
let currentProviderUid = null;

async function renderAvailabilityCalendar() {
  const panel = $("#availabilityPanel");
  if (!panel) return;
  if (!currentProviderUid || !window.PodiBackend?.currentUser()) { panel.hidden = true; return; }
  panel.hidden = false;
  const cal = $("#availabilityCalendar");
  cal.innerHTML = `<p class="muted">පූරණය වෙමින්...</p>`;
  const now = new Date();
  const days = [];
  for (let i = 0; i < 14; i += 1) days.push(new Date(now.getTime() + i * 86400000).toISOString().slice(0, 10));
  let occupied = [];
  try {
    const result = await window.PodiBackend.getAvailability(currentProviderUid, days[0], days[days.length - 1]);
    occupied = result.occupied || [];
  } catch (error) {
    cal.innerHTML = `<p class="muted">${escapeHTML(error.message || "පූරණය අසාර්ථකයි.")}</p>`;
    return;
  }
  const occ = {};
  occupied.forEach((item) => { occ[`${item.date}|${item.slot}`] = item; });
  const slots = ["morning", "lunch", "evening", "night"];
  cal.innerHTML = days.map((date) => {
    let label = date;
    try { label = new Date(`${date}T00:00:00`).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" }); } catch (error) { /* keep date */ }
    const chips = slots.map((slot) => {
      const item = occ[`${date}|${slot}`];
      const cls = item ? (item.status === "blocked" ? "blocked" : "booked") : "free";
      const attrs = item
        ? (item.status === "blocked" ? `data-avail-unblock="${item.bookingId}"` : "")
        : `data-avail-block="${date}" data-avail-slot="${slot}"`;
      return `<button type="button" class="avail-slot ${cls}" ${attrs}>${timeSlotLabels[slot] || slot}</button>`;
    }).join("");
    return `<div class="avail-day"><span class="avail-day-label">${escapeHTML(label)}</span><div class="avail-slots">${chips}</div></div>`;
  }).join("");
}

async function openBookingsList() {
  $("#bookingsModal").hidden = false;
  const list = $("#bookingsList");
  list.innerHTML = `<p class="muted">පූරණය වෙමින්...</p>`;
  try {
    const bookings = await window.PodiBackend.getBookings();
    list.innerHTML = bookings.length ? bookings.map(renderBookingCard).join("") : `<p class="muted">තවම වෙන් කිරීම් නැහැ.</p>`;
  } catch (error) {
    list.innerHTML = `<p class="muted">${escapeHTML(error.message || "පූරණය අසාර්ථකයි.")}</p>`;
  }
}

function renderBookingCard(booking) {
  const slots = (booking.slots || []).map((slot) => timeSlotLabels[slot] || slot).join(", ");
  const dates = booking.startDate === booking.endDate ? booking.startDate : `${booking.startDate} → ${booking.endDate}`;
  const actions = [];
  if (booking.role === "provider" && booking.status === "requested") {
    actions.push(`<button class="primary-action" data-booking-accept="${booking.id}">භාරගන්න</button>`);
    actions.push(`<button class="ghost-action" data-booking-decline="${booking.id}">ප්‍රතික්ෂේප</button>`);
  }
  if (booking.role === "provider" && booking.status === "confirmed") actions.push(`<button class="ghost-action" data-booking-complete="${booking.id}">අවසන් කළා</button>`);
  if (["confirmed", "in_progress", "completed"].includes(booking.status)) actions.push(`<button class="ghost-action" data-booking-contact="${booking.id}">සම්බන්ධතා විස්තර</button>`);
  if (["requested", "confirmed"].includes(booking.status)) actions.push(`<button class="ghost-action" data-booking-cancel="${booking.id}">අවලංගු</button>`);
  const rateWidget = (booking.status === "completed" && !booking.ratedByMe)
    ? `<div class="rate-row"><span class="booking-meta">තරු දෙන්න:</span> ${[1, 2, 3, 4, 5].map((n) => `<button class="star-btn" data-rate-booking="${booking.id}" data-stars="${n}" aria-label="${n} තරු" title="${n} තරු">★</button>`).join("")}</div>`
    : "";
  return `<div class="booking-card">
    <div><span class="booking-status ${booking.status}">${BOOKING_STATUS_LABEL[booking.status] || booking.status}</span></div>
    <strong>${escapeHTML(booking.role === "provider" ? "පාරිභෝගික ඉල්ලීමක්" : booking.providerName || "සේවා සපයන්නා")}</strong>
    <p class="booking-meta">${escapeHTML(dates)} · ${escapeHTML(slots)}</p>
    <p class="booking-meta">ගෙවීම: ${PAYMENT_LABEL[booking.paymentMethod] || "-"}</p>
    <div class="row-actions">${actions.join("")}</div>
    ${rateWidget}
    <div class="contact-reveal" id="contact-${booking.id}" hidden></div>
  </div>`;
}

document.addEventListener("click", async (event) => {
  const actionMap = [
    ["data-booking-accept", (id) => window.PodiBackend.acceptBooking(id), "වෙන් කිරීම භාරගත්තා."],
    ["data-booking-decline", (id) => window.PodiBackend.declineBooking(id), "ප්‍රතික්ෂේප කළා."],
    ["data-booking-complete", (id) => window.PodiBackend.completeBooking(id), "අවසන් කළ බව සටහන් විය."],
    ["data-booking-cancel", (id) => window.PodiBackend.cancelBooking(id), "අවලංගු කළා."]
  ];
  for (const [attr, fn, message] of actionMap) {
    const button = event.target.closest(`[${attr}]`);
    if (button) {
      button.disabled = true;
      try { await fn(button.getAttribute(attr)); toast(message); openBookingsList(); }
      catch (error) { toast(error.message || "අසාර්ථකයි."); button.disabled = false; }
      return;
    }
  }
  const blockChip = event.target.closest("[data-avail-block]");
  if (blockChip) {
    try { await window.PodiBackend.blockDates({ startDate: blockChip.dataset.availBlock, endDate: blockChip.dataset.availBlock, slots: [blockChip.dataset.availSlot] }); renderAvailabilityCalendar(); }
    catch (error) { toast(error.message || "අසාර්ථකයි."); }
    return;
  }
  const unblockChip = event.target.closest("[data-avail-unblock]");
  if (unblockChip) {
    try { await window.PodiBackend.cancelBooking(unblockChip.dataset.availUnblock); renderAvailabilityCalendar(); }
    catch (error) { toast(error.message || "අසාර්ථකයි."); }
    return;
  }
  const rateButton = event.target.closest("[data-rate-booking]");
  if (rateButton) {
    rateButton.disabled = true;
    try {
      await window.PodiBackend.submitRating({ bookingId: rateButton.dataset.rateBooking, stars: Number(rateButton.dataset.stars) });
      toast("ස්තූතියි! ඔබේ තරු ලකුණු සටහන් විය.");
      openBookingsList();
    } catch (error) {
      toast(error.message || "තරු ලකුණු කිරීම අසාර්ථකයි.");
      rateButton.disabled = false;
    }
    return;
  }
  const contactButton = event.target.closest("[data-booking-contact]");
  if (contactButton) {
    const id = contactButton.dataset.bookingContact;
    try {
      const contact = await window.PodiBackend.revealContact(id);
      const el = $(`#contact-${id}`);
      el.hidden = false;
      el.innerHTML = `📞 ${escapeHTML(contact.providerName || "")}: <a href="tel:${escapeHTML(contact.providerPhone || "")}">${escapeHTML(contact.providerPhone || "")}</a>`;
    } catch (error) {
      toast(error.message || "සම්බන්ධතා විස්තර ලබාගත නොහැක.");
    }
  }
});

render();
