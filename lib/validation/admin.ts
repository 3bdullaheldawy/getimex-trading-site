import { z } from "zod";

export const localeSchema = z.enum(["en", "ar"]);
export const inquiryStatusSchema = z.enum(["New", "InReview", "Replied", "Closed"]);
export const eventSchema = z.object({
  event: z.enum(["phone_click", "whatsapp_click", "quote_open", "quote_submit", "product_view", "category_filter", "language_switch"]),
  path: z.string().trim().max(240).optional(),
  locale: localeSchema.default("en"),
  category: z.string().trim().max(80).optional(),
  productSlug: z.string().trim().max(120).optional(),
});

export const inquirySchema = z.object({
  name: z.string().trim().min(2).max(120),
  company: z.string().trim().min(2).max(160),
  phone: z.string().trim().min(6).max(40),
  email: z.string().trim().email().max(160).optional().or(z.literal("")),
  category: z.string().trim().min(2).max(80),
  productSlug: z.string().trim().max(120).optional().or(z.literal("")),
  source: z.string().trim().max(80).optional().or(z.literal("")),
  message: z.string().trim().min(10).max(3000),
  locale: localeSchema.default("en"),
  website: z.string().max(0).optional(),
  formStartedAt: z.coerce.number().optional(),
});

const bilingual = z.object({ en: z.string().trim().min(1).max(5000), ar: z.string().trim().min(1).max(5000) });
export const categoryInputSchema = z.object({
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  nameEn: z.string().trim().min(2).max(120),
  nameAr: z.string().trim().min(2).max(120),
  descriptionEn: z.string().trim().min(2).max(1000),
  descriptionAr: z.string().trim().min(2).max(1000),
  image: z.string().url().optional().or(z.literal("")),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
  isPublished: z.boolean().default(false),
});

export const productInputSchema = z.object({
  categoryId: z.string().uuid(),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  titleEn: z.string().trim().min(2).max(160),
  titleAr: z.string().trim().min(2).max(160),
  shortDescriptionEn: z.string().trim().min(2).max(1000),
  shortDescriptionAr: z.string().trim().min(2).max(1000),
  descriptionEn: z.string().trim().min(2).max(5000),
  descriptionAr: z.string().trim().min(2).max(5000),
  availabilityNoteEn: z.string().trim().min(2).max(1000),
  availabilityNoteAr: z.string().trim().min(2).max(1000),
  isFeatured: z.boolean().default(false),
  isPublished: z.boolean().default(false),
  sortOrder: z.coerce.number().int().min(0).max(9999).default(0),
  specifications: z.array(z.object({ labelEn: z.string().trim().min(1).max(120), labelAr: z.string().trim().min(1).max(120), valueEn: z.string().trim().min(1).max(500), valueAr: z.string().trim().min(1).max(500), sortOrder: z.coerce.number().int().min(0).max(9999).default(0) })).max(50).default([]),
});

export const settingsSchema = z.object({
  phone: z.string().trim().min(6).max(40),
  whatsapp: z.string().trim().min(6).max(40),
  address: z.string().trim().min(3).max(500),
  mapUrl: z.string().url().optional().or(z.literal("")),
  email: z.string().email().optional().or(z.literal("")),
  legalRegistration: z.string().trim().max(300).optional().or(z.literal("")),
  socialLinks: z.record(z.string(), z.string().url()).optional(),
});

export const userInputSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().email().max(160),
  role: z.enum(["SuperAdmin", "ContentEditor", "SalesInbox"]),
  password: z.string().min(12).max(200).optional(),
  isActive: z.boolean().default(true),
});

export { bilingual };
