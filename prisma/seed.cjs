const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();
const categories = [
  ["oil-gas", "Oil & Gas Equipment", "معدات النفط والغاز", "Equipment, piping, valves and industrial supplies for demanding energy environments.", "معدات وأنابيب وصمامات ومستلزمات صناعية لبيئات الطاقة المتطلبة.", "/images/oil-gas.jpg"],
  ["safety-hse", "Safety & HSE Products", "منتجات السلامة وHSE", "Practical PPE and workplace safety products selected for dependable site protection.", "معدات وقاية شخصية ومنتجات سلامة مختارة لحماية مواقع العمل.", "/images/safety.jpg"],
  ["construction", "Construction Materials", "مواد البناء", "Building materials and site consumables that keep projects moving.", "مواد بناء ومستلزمات مواقع تساعد المشاريع على الاستمرار.", "/images/construction.jpg"],
  ["industrial", "Industrial Supplies", "المستلزمات الصناعية", "Sourced industrial products with clear specifications and responsive coordination.", "منتجات صناعية بمواصفات واضحة وتنسيق سريع وموثوق.", "/images/industrial.jpg"],
  ["mechanical-electrical", "Mechanical & Electrical", "الميكانيكا والكهرباء", "Components and equipment for mechanical and electrical applications.", "مكونات ومعدات للتطبيقات الميكانيكية والكهربائية.", "/images/mechanical.jpg"],
  ["logistics", "Logistics & Transportation", "الخدمات اللوجستية والنقل", "Supply coordination that connects approved sourcing with timely delivery.", "تنسيق توريد يربط بين الشراء المعتمد والتسليم في الوقت المناسب.", "/images/logistics.jpg"],
];

async function main() {
  for (let i = 0; i < categories.length; i += 1) {
    const [slug, nameEn, nameAr, descriptionEn, descriptionAr, image] = categories[i];
    const category = await prisma.productCategory.upsert({ where: { slug }, update: { nameEn, nameAr, descriptionEn, descriptionAr, image, sortOrder: i, isPublished: true }, create: { slug, nameEn, nameAr, descriptionEn, descriptionAr, image, sortOrder: i, isPublished: true } });
    const product = await prisma.product.upsert({ where: { slug }, update: { categoryId: category.id, titleEn: nameEn, titleAr: nameAr, shortDescriptionEn: descriptionEn, shortDescriptionAr: descriptionAr, descriptionEn: `${nameEn} sourced for professional projects across the UAE and the wider region.`, descriptionAr: `${nameAr} يتم توريدها للمشروعات الاحترافية داخل الإمارات والمنطقة.`, availabilityNoteEn: "Final availability, specification and lead time are confirmed per enquiry.", availabilityNoteAr: "يتم تأكيد التوافر والمواصفات ومدة التوريد لكل طلب.", isFeatured: i < 3, isPublished: true, sortOrder: i }, create: { categoryId: category.id, slug, titleEn: nameEn, titleAr: nameAr, shortDescriptionEn: descriptionEn, shortDescriptionAr: descriptionAr, descriptionEn: `${nameEn} sourced for professional projects across the UAE and the wider region.`, descriptionAr: `${nameAr} يتم توريدها للمشروعات الاحترافية داخل الإمارات والمنطقة.`, availabilityNoteEn: "Final availability, specification and lead time are confirmed per enquiry.", availabilityNoteAr: "يتم تأكيد التوافر والمواصفات ومدة التوريد لكل طلب.", isFeatured: i < 3, isPublished: true, sortOrder: i } });
    await prisma.productSpecification.deleteMany({ where: { productId: product.id } });
    await prisma.productSpecification.createMany({ data: [{ productId: product.id, labelEn: "Supply focus", labelAr: "نطاق التوريد", valueEn: nameEn, valueAr: nameAr, sortOrder: 0 }, { productId: product.id, labelEn: "Availability", labelAr: "التوافر", valueEn: "Confirmed against each enquiry", valueAr: "يتم تأكيده مع كل طلب", sortOrder: 1 }] });
  }
  const password = process.env.SEED_ADMIN_PASSWORD;
  const email = process.env.SEED_ADMIN_EMAIL || "admin@getimex.com";
  if (password) await prisma.adminUser.upsert({ where: { email }, update: { name: "Getimex Super Admin", role: "SuperAdmin", isActive: true, passwordHash: await bcrypt.hash(password, 12) }, create: { name: "Getimex Super Admin", email, role: "SuperAdmin", passwordHash: await bcrypt.hash(password, 12) } });
  await prisma.siteSettings.upsert({ where: { id: "singleton" }, update: {}, create: { id: "singleton", phone: "0504205069", whatsapp: "971504205069", address: "Dubai, Deira, Bani Yas City Centre, Twin Towers, Office 125–08" } });
}

main().finally(() => prisma.$disconnect());
