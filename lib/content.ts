export type Locale = "en" | "ar";

export type Category = {
  slug: string;
  image: string;
  eyebrow: string;
  name: { en: string; ar: string };
  description: { en: string; ar: string };
};

export type Product = Category & {
  title: { en: string; ar: string };
  details: { en: string; ar: string };
  points: { en: string[]; ar: string[] };
  featured: boolean;
  specifications: Array<{ label: { en: string; ar: string }; value: { en: string; ar: string } }>;
  media: Array<{ src: string; alt: { en: string; ar: string }; caption: { en: string; ar: string } }>;
  availabilityNote: { en: string; ar: string };
  relatedSlugs: string[];
};

export type MediaAsset = {
  type: "image" | "video";
  category: string;
  src: string;
  caption: { en: string; ar: string };
  alt: { en: string; ar: string };
  approved: boolean;
  sortOrder: number;
};

const unsplash = (id: string, width = 2000) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=80`;

/** Licensed under the Unsplash License. Replace with approved Getimex photography when available. */
export const photos = {
  hero: unsplash("photo-1588011930968-eadac80e6a5a", 2400),
  refineryGold: unsplash("photo-1580561346873-4a76a13dce92"),
  safety: unsplash("photo-1614213951697-a45781262acf"),
  construction: unsplash("photo-1575230167650-dce335edc7f4"),
  steel: unsplash("photo-1763950865873-41f63536825b"),
  electrical: unsplash("photo-1563456019560-2b37aa7ad890"),
  containers: unsplash("photo-1494412519320-aa613dfb7738"),
  welding: unsplash("photo-1564182998523-6923112e7d6b"),
  ship: unsplash("photo-1670121180530-cfcba4438038"),
  dubai: unsplash("photo-1700556498243-9b5b66326e68", 2400),
  valves: unsplash("photo-1620203853151-496c7228306c"),
} as const;

export const categories: Category[] = [
  { slug: "oil-gas", image: photos.refineryGold, eyebrow: "01", name: { en: "Oil & Gas Equipment", ar: "معدات النفط والغاز" }, description: { en: "Equipment, piping, valves and industrial supplies for demanding energy environments.", ar: "معدات وأنابيب وصمامات ومستلزمات صناعية لبيئات الطاقة المتطلبة." } },
  { slug: "safety-hse", image: photos.safety, eyebrow: "02", name: { en: "Safety & HSE Products", ar: "منتجات السلامة وHSE" }, description: { en: "Practical PPE and workplace safety products selected for dependable site protection.", ar: "معدات وقاية شخصية ومنتجات سلامة مختارة لحماية مواقع العمل." } },
  { slug: "construction", image: photos.construction, eyebrow: "03", name: { en: "Construction Materials", ar: "مواد البناء" }, description: { en: "Building materials and site consumables that keep projects moving.", ar: "مواد بناء ومستلزمات مواقع تساعد المشاريع على الاستمرار." } },
  { slug: "industrial", image: photos.steel, eyebrow: "04", name: { en: "Industrial Supplies", ar: "المستلزمات الصناعية" }, description: { en: "Sourced industrial products with clear specifications and responsive coordination.", ar: "منتجات صناعية بمواصفات واضحة وتنسيق سريع وموثوق." } },
  { slug: "mechanical-electrical", image: photos.electrical, eyebrow: "05", name: { en: "Mechanical & Electrical", ar: "الميكانيكا والكهرباء" }, description: { en: "Components and equipment for mechanical and electrical applications.", ar: "مكونات ومعدات للتطبيقات الميكانيكية والكهربائية." } },
  { slug: "logistics", image: photos.containers, eyebrow: "06", name: { en: "Logistics & Transportation", ar: "الخدمات اللوجستية والنقل" }, description: { en: "Supply coordination that connects approved sourcing with timely delivery.", ar: "تنسيق توريد يربط بين الشراء المعتمد والتسليم في الوقت المناسب." } },
  { slug: "healthcare-medical-supplies", image: unsplash("photo-1584982751601-97dcc096659c"), eyebrow: "07", name: { en: "Healthcare & Medical Supplies", ar: "الرعاية الصحية والمستلزمات الطبية" }, description: { en: "Medical Equipment & Devices · Laboratory Equipment · Medical Consumables · Healthcare Supplies", ar: "المعدات والأجهزة الطبية · معدات المختبرات · المستهلكات الطبية · مستلزمات الرعاية الصحية" } },
];

const productNotes: Record<string, { focus: { en: string; ar: string }; related: string[]; featured: boolean }> = {
  "oil-gas": { focus: { en: "Equipment, piping, valves and industrial supplies", ar: "معدات وأنابيب وصمامات ومستلزمات صناعية" }, related: ["industrial", "mechanical-electrical"], featured: true },
  "safety-hse": { focus: { en: "PPE and selected workplace safety products", ar: "معدات الوقاية الشخصية ومنتجات السلامة المختارة" }, related: ["construction", "industrial"], featured: true },
  construction: { focus: { en: "Building materials and site consumables", ar: "مواد البناء ومستلزمات المواقع" }, related: ["mechanical-electrical", "logistics"], featured: true },
  industrial: { focus: { en: "Industrial supplies with clear specifications", ar: "مستلزمات صناعية بمواصفات واضحة" }, related: ["oil-gas", "mechanical-electrical"], featured: false },
  "mechanical-electrical": { focus: { en: "Mechanical and electrical components", ar: "مكونات ميكانيكية وكهربائية" }, related: ["industrial", "construction"], featured: false },
  logistics: { focus: { en: "Supply coordination and transportation support", ar: "تنسيق الإمداد ودعم النقل" }, related: ["construction", "oil-gas"], featured: false },
  "healthcare-medical-supplies": { focus: { en: "Medical Equipment & Devices, Laboratory Equipment, Medical Consumables & Healthcare Supplies", ar: "المعدات والأجهزة الطبية، ومعدات المختبرات، والمستهلكات الطبية ومستلزمات الرعاية الصحية" }, related: ["safety-hse", "industrial"], featured: false },
};

export const products: Product[] = categories.map((category) => ({
  ...category,
  title: category.name,
  details: {
    en: `${category.name.en} sourced for professional projects across the UAE and the wider region. Final availability and specifications are confirmed per enquiry.`,
    ar: `${category.name.ar} يتم توريدها للمشروعات الاحترافية داخل الإمارات والمنطقة. يتم تأكيد التوافر والمواصفات لكل طلب.`,
  },
  points: {
    en: ["Specification-led sourcing", "Supplier coordination", "Quotation support"],
    ar: ["توريد حسب المواصفات", "تنسيق مع الموردين", "دعم طلبات الأسعار"],
  },
  featured: productNotes[category.slug].featured,
  specifications: [
    { label: { en: "Supply focus", ar: "نطاق التوريد" }, value: productNotes[category.slug].focus },
    { label: { en: "Availability", ar: "التوافر" }, value: { en: "Confirmed against each enquiry", ar: "يتم تأكيده مع كل طلب" } },
    { label: { en: "Service model", ar: "نموذج الخدمة" }, value: { en: "Sourcing, coordination and quotation support", ar: "التوريد والتنسيق ودعم طلبات الأسعار" } },
  ],
  media: [
    { src: category.image, alt: category.name, caption: { en: `${category.name.en} supply area`, ar: `مجال توريد ${category.name.ar}` } },
    { src: photos.welding, alt: { en: "Getimex industrial detail", ar: "تفصيل صناعي من Getimex" }, caption: { en: "Industrial supply detail", ar: "تفصيل من التوريد الصناعي" } },
  ],
  availabilityNote: { en: "Final availability, specification and lead time are confirmed per enquiry.", ar: "يتم تأكيد التوافر والمواصفات ومدة التوريد لكل طلب." },
  relatedSlugs: productNotes[category.slug].related,
}));

export const mediaAssets: MediaAsset[] = products.flatMap((product, productIndex) => product.media.map((media, mediaIndex) => ({
  type: "image" as const,
  category: product.slug,
  src: media.src,
  caption: media.caption,
  alt: media.alt,
  approved: false,
  sortOrder: productIndex * 10 + mediaIndex,
})));

export const services = {
  en: [
    { slug: "sourcing-procurement", number: "01", title: "Sourcing & procurement", problem: "A clear requirement still needs a dependable route to supply.", scope: "We clarify the request and coordinate sourcing around the specification provided.", outcome: "A focused quotation path with the key details in view." },
    { slug: "supply-coordination", number: "02", title: "Supply coordination", problem: "Projects lose time when communication becomes fragmented.", scope: "We keep the conversation connected between the project requirement and supplier response.", outcome: "A clearer handoff from enquiry to confirmed supply." },
    { slug: "logistics-support", number: "03", title: "Logistics support", problem: "Delivery needs timing, documentation and follow-through.", scope: "We support the supply conversation with delivery coordination as the requirement is confirmed.", outcome: "A practical next step for getting the right material to the right place." },
  ],
  ar: [
    { slug: "sourcing-procurement", number: "01", title: "التوريد والشراء", problem: "الاحتياج الواضح يحتاج إلى طريق موثوق للتوريد.", scope: "نوضح الطلب وننسق التوريد وفق المواصفات المقدمة.", outcome: "مسار واضح لطلب السعر مع إبقاء التفاصيل الأساسية في الصورة." },
    { slug: "supply-coordination", number: "02", title: "تنسيق الإمداد", problem: "تفقد المشاريع وقتها عندما يصبح التواصل متفرقًا.", scope: "نحافظ على اتصال واضح بين احتياج المشروع واستجابة المورد.", outcome: "انتقال أوضح من الاستفسار إلى التوريد المؤكد." },
    { slug: "logistics-support", number: "03", title: "الدعم اللوجستي", problem: "التسليم يحتاج إلى توقيت ومستندات ومتابعة.", scope: "ندعم عملية التوريد بتنسيق التسليم بعد تأكيد الاحتياج.", outcome: "خطوة عملية للوصول بالمادة المناسبة إلى المكان المناسب." },
  ],
} as const;

export const copy = {
  en: {
    nav: { about: "About us", activities: "Activities", products: "Products", services: "Services", projects: "Projects", contact: "Contact" },
    quote: "Request a quotation",
    heroKicker: "Your Trusted Partner in General Trading",
    heroTitle: "Connecting Global Markets with Quality Products and Reliable Supply Solutions.",
    heroBody: "Getimex provides general trading, import, export and supply solutions across different products, sectors and markets.",
    discover: "Explore our business",
    scroll: "Scroll to discover",
    sectionBusiness: "Our business",
    sectionCategories: "Products built around the work",
    sectionCategoriesBody: "Explore seven independent sectors, from industrial products to healthcare and medical supplies.",
    viewAll: "View all categories",
    sectionAbout: "Meet Getimex: a partner across markets",
    aboutBody: "Getimex General Trading L.L.C. is a Dubai-based diversified trading company. Through strategic partnerships, we handle general trading, import, export and product supply across multiple sectors, serving businesses, institutions and markets with practical coordination for varied supply requirements.",
    readAbout: "Meet Getimex",
    proof: [{ label: "Based in", value: "Dubai, UAE" }, { label: "Focus", value: "General trading" }, { label: "Response", value: "Direct coordination" }],
    servicesTitle: "From source to site",
    servicesBody: "We keep the process clear: understand the requirement, coordinate dependable sourcing, and support delivery with the detail your team needs.",
    services: ["Sourcing & procurement", "Supply coordination", "Logistics support"],
    contactTitle: "Your Partner in Global Trade & Supply Solutions.",
    contactBody: "Tell us what your project needs. Our team will respond with the right next step.",
    phone: "+971 50 420 5069",
    address: "Dubai, Deira · Bani Yas City Centre · Twin Towers · Office 125–08",
    footer: "Reliable supply. Clear communication. Lasting value.",
    aboutTitle: "Trust is built into the way we trade.",
    aboutIntro: "We bring diverse trading activities, strategic partnerships and practical supply solutions together for businesses and institutions across different markets.",
    activitiesTitle: "Diversified general trading across seven sectors",
    productsTitle: "Products & services",
    productsBody: "Choose a category to see the supply areas we support. Every enquiry is confirmed against your specification and timeline.",
    servicesPageTitle: "The practical work behind every delivery",
    projectsTitle: "Proof follows the work",
    projectsBody: "This space is reserved for approved projects, site photography and partner references. We only publish what the team has confirmed.",
    contactPageTitle: "Start a clear conversation",
    requestTitle: "Request a quotation",
    requestBody: "Share the requirement and a member of the Getimex team will follow up directly.",
    form: { name: "Your name", company: "Company", phone: "Phone number", email: "Email (optional)", category: "Supply category", message: "Tell us about the requirement", submit: "Send request", success: "Thanks. Your request is with the Getimex team.", error: "Please check the required fields and try again." },
  },
  ar: {
    nav: { about: "من نحن", activities: "مجالاتنا", products: "المنتجات", services: "الخدمات", projects: "المشروعات", contact: "تواصل معنا" },
    quote: "اطلب عرض سعر",
    heroKicker: "شريكك الموثوق في التجارة العامة",
    heroTitle: "نربط الأسواق العالمية بمنتجات عالية الجودة وحلول توريد موثوقة.",
    heroBody: "تقدم Getimex حلول التجارة العامة والاستيراد والتصدير والتوريد عبر منتجات وقطاعات وأسواق مختلفة.",
    discover: "اكتشف أعمالنا",
    scroll: "اكتشف المزيد",
    sectionBusiness: "مجالات عملنا",
    sectionCategories: "منتجات مصممة حول احتياج العمل",
    sectionCategoriesBody: "استكشف سبعة قطاعات مستقلة، من المنتجات الصناعية إلى الرعاية الصحية والمستلزمات الطبية.",
    viewAll: "عرض كل الفئات",
    sectionAbout: "حلقة موثوقة في سلسلة التوريد",
    aboutBody: "Getimex General Trading L.L.C. شركة تجارة متنوعة مقرها دبي. من خلال شراكات استراتيجية، نتولى التجارة العامة والاستيراد والتصدير وتوريد المنتجات عبر قطاعات متعددة، لخدمة الأسواق والشركات والمؤسسات بتنسيق عملي يلبي متطلبات توريد متنوعة.",
    readAbout: "تعرف على Getimex",
    proof: [{ label: "المقر", value: "دبي، الإمارات" }, { label: "التخصص", value: "التجارة العامة" }, { label: "الاستجابة", value: "تنسيق مباشر" }],
    servicesTitle: "من المصدر إلى الموقع",
    servicesBody: "نحافظ على وضوح العملية: نفهم الاحتياج، ننسق مصادر موثوقة، وندعم التسليم بالتفاصيل التي يحتاجها فريقك.",
    services: ["التوريد والشراء", "تنسيق الإمداد", "الدعم اللوجستي"],
    contactTitle: "شريككم في حلول التجارة والتوريد العالمية.",
    contactBody: "أخبرنا بما يحتاجه مشروعك وسيتواصل معك فريقنا بالخطوة التالية المناسبة.",
    phone: "+971 50 420 5069",
    address: "دبي، ديرة · مركز بني ياس · توين تاورز · مكتب 125–08",
    footer: "توريد موثوق. تواصل واضح. قيمة مستمرة.",
    aboutTitle: "الثقة جزء من طريقة عملنا.",
    aboutIntro: "نجمع بين أنشطة تجارية متنوعة وشراكات استراتيجية وحلول توريد عملية لخدمة الشركات والمؤسسات في أسواق مختلفة.",
    activitiesTitle: "تجارة عامة متنوعة عبر سبعة قطاعات",
    productsTitle: "المنتجات والخدمات",
    productsBody: "اختر فئة للتعرف على مجالات التوريد التي ندعمها. يتم تأكيد كل طلب وفق المواصفات والجدول الزمني.",
    servicesPageTitle: "العمل العملي خلف كل عملية توريد",
    projectsTitle: "الإنجاز يثبت نفسه",
    projectsBody: "تخصص هذه المساحة للمشروعات المعتمدة وصور المواقع ومراجع الشركاء بعد موافقة الفريق.",
    contactPageTitle: "ابدأ حوارًا واضحًا",
    requestTitle: "طلب عرض سعر",
    requestBody: "شاركنا متطلباتك وسيتواصل معك أحد أفراد فريق Getimex مباشرة.",
    form: { name: "الاسم", company: "الشركة", phone: "رقم الهاتف", email: "البريد الإلكتروني (اختياري)", category: "فئة التوريد", message: "اكتب تفاصيل الاحتياج", submit: "إرسال الطلب", success: "شكرًا. وصل طلبك إلى فريق Getimex.", error: "يرجى مراجعة الحقول المطلوبة والمحاولة مرة أخرى." },
  },
} as const;

export const homeCopy = {
  en: {
    manifest: "Supply manifest",
    rows: [{ k: "Base", v: "Deira, Dubai" }, { k: "Coverage", v: "UAE & wider region" }, { k: "Supply families", v: "06" }, { k: "Core services", v: "03" }],
    localTime: "Dubai time",
    statement: "Getimex is a diversified general trading company based in Dubai. We provide import, export and supply solutions across different products and sectors, building strategic partnerships to serve markets, businesses and institutions.",
    indexTitle: "Seven sectors. One trading partner.",
    indexBody: "Hover a sector to preview it. Each one is sourced against your specification and confirmed per enquiry.",
    processEyebrow: "How supply moves",
    processTitle: "From source to site, in four clear steps.",
    steps: [
      { title: "Requirement", body: "You share the specification, quantities and timeline. We confirm what matters before sourcing starts." },
      { title: "Sourcing", body: "We match the requirement with dependable suppliers and prepare a focused quotation." },
      { title: "Coordination", body: "One connected line between your team and the supplier, so nothing is lost in the handoff." },
      { title: "Delivery", body: "Timing, documentation and follow-through until the material reaches the site." },
    ],
    figure: "Fig. 01 — Port operations",
    principles: [{ n: "01", t: "Customer satisfaction", d: "Responsive and reliable service." }, { n: "02", t: "Quality & reliability", d: "Products that meet agreed specifications." }, { n: "03", t: "Supply chain excellence", d: "Competitive sourcing and timely delivery." }],
    ctaKicker: "Start a requirement",
    globeKicker: "Trade lanes from Dubai",
    globeTitle: "Dubai sits on the lanes that connect the world's supply.",
    globeBody: "Europe, Asia and Africa meet here. Getimex works from that crossroads to source what your project specifies — and to keep its route to site clear.",
    globeNote: "Shown: major trade lanes connected to Dubai. Distances are great-circle.",
    facts: [{ n: 7, l: "Sectors" }, { n: 3, l: "Core services" }, { n: 2, l: "Working languages" }, { n: 1, l: "Trading partner" }],
    railBody: "Seven independent sectors, including healthcare and medical supplies, supported through coordinated sourcing and supply.",
    marquee: ["Oil & Gas", "Safety & HSE", "Construction", "Industrial", "Mechanical & Electrical", "Logistics", "Healthcare & Medical Supplies"],
    badge: "REQUEST A QUOTATION · GETIMEX · DUBAI · ",
    whatsapp: "WhatsApp",
    call: "Call the office",
  },
  ar: {
    manifest: "بيان التوريد",
    rows: [{ k: "المقر", v: "ديرة، دبي" }, { k: "النطاق", v: "الإمارات والمنطقة" }, { k: "فئات التوريد", v: "06" }, { k: "الخدمات الأساسية", v: "03" }],
    localTime: "توقيت دبي",
    statement: "Getimex شركة تجارة عامة متنوعة مقرها دبي. نقدم حلول الاستيراد والتصدير والتوريد عبر منتجات وقطاعات مختلفة، ونبني شراكات استراتيجية لخدمة الأسواق والشركات والمؤسسات.",
    indexTitle: "سبعة قطاعات. شريك تجاري واحد.",
    indexBody: "مرّر على أي قطاع لمعاينته. كل فئة يتم توريدها وفق مواصفاتك ويتم تأكيدها مع كل طلب.",
    processEyebrow: "كيف يتحرك التوريد",
    processTitle: "من المصدر إلى الموقع في أربع خطوات واضحة.",
    steps: [
      { title: "الاحتياج", body: "تشاركنا المواصفات والكميات والجدول الزمني، ونؤكد التفاصيل المهمة قبل بدء التوريد." },
      { title: "التوريد", body: "نطابق الاحتياج مع موردين موثوقين ونجهّز عرض سعر مركّزًا." },
      { title: "التنسيق", body: "خط تواصل واحد بين فريقك والمورد حتى لا يضيع شيء أثناء التسليم." },
      { title: "التسليم", body: "توقيت ومستندات ومتابعة حتى تصل المواد إلى الموقع." },
    ],
    figure: "شكل 01 — عمليات الموانئ",
    principles: [{ n: "01", t: "رضا العملاء", d: "خدمة سريعة وموثوقة." }, { n: "02", t: "الجودة والموثوقية", d: "منتجات وفق المواصفات المتفق عليها." }, { n: "03", t: "تميّز سلسلة التوريد", d: "توريد تنافسي وتسليم في الوقت المناسب." }],
    ctaKicker: "ابدأ طلبك",
    globeKicker: "خطوط التجارة من دبي",
    globeTitle: "دبي تقع على الخطوط التي تربط إمدادات العالم.",
    globeBody: "هنا تلتقي أوروبا وآسيا وأفريقيا. من هذا الملتقى تعمل Getimex على توريد ما يحدده مشروعك، وتُبقي طريقه إلى الموقع واضحًا.",
    globeNote: "المعروض: خطوط تجارة رئيسية متصلة بدبي. المسافات بخط الدائرة العظمى.",
    facts: [{ n: 7, l: "قطاعات" }, { n: 3, l: "خدمات أساسية" }, { n: 2, l: "لغتا عمل" }, { n: 1, l: "شريك تجاري" }],
    railBody: "سبعة قطاعات مستقلة، تشمل الرعاية الصحية والمستلزمات الطبية، وندعمها عبر تنسيق التوريد والمصادر.",
    marquee: ["النفط والغاز", "السلامة", "البناء", "الصناعة", "الميكانيكا والكهرباء", "اللوجستيات", "الرعاية الصحية والمستلزمات الطبية"],
    badge: "اطلب عرض سعر · GETIMEX · دبي · ",
    whatsapp: "واتساب",
    call: "اتصل بالمكتب",
  },
} as const;

export function getLocale(value: string): Locale { return value === "ar" ? "ar" : "en"; }
export function getCopy(locale: string) { return copy[getLocale(locale)]; }
export function getLocalized<T extends { en: string; ar: string }>(value: T, locale: string) { return value[getLocale(locale)]; }
