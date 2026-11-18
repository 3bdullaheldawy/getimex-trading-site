CREATE TYPE "AdminRole" AS ENUM ('SuperAdmin', 'ContentEditor', 'SalesInbox');
CREATE TYPE "InquiryStatus" AS ENUM ('New', 'InReview', 'Replied', 'Closed');
CREATE TYPE "MediaType" AS ENUM ('image', 'video');

CREATE TABLE "ProductCategory" (
  "id" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "nameEn" TEXT NOT NULL,
  "nameAr" TEXT NOT NULL,
  "descriptionEn" TEXT NOT NULL,
  "descriptionAr" TEXT NOT NULL,
  "image" TEXT,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "isPublished" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "ProductCategory_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Product" (
  "id" TEXT NOT NULL,
  "categoryId" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "titleEn" TEXT NOT NULL,
  "titleAr" TEXT NOT NULL,
  "shortDescriptionEn" TEXT NOT NULL,
  "shortDescriptionAr" TEXT NOT NULL,
  "descriptionEn" TEXT NOT NULL,
  "descriptionAr" TEXT NOT NULL,
  "availabilityNoteEn" TEXT NOT NULL,
  "availabilityNoteAr" TEXT NOT NULL,
  "isFeatured" BOOLEAN NOT NULL DEFAULT false,
  "isPublished" BOOLEAN NOT NULL DEFAULT false,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "ProductSpecification" (
  "id" TEXT NOT NULL,
  "productId" TEXT NOT NULL,
  "labelEn" TEXT NOT NULL,
  "labelAr" TEXT NOT NULL,
  "valueEn" TEXT NOT NULL,
  "valueAr" TEXT NOT NULL,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "ProductSpecification_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "ProductRelation" (
  "fromId" TEXT NOT NULL,
  "toId" TEXT NOT NULL,
  CONSTRAINT "ProductRelation_pkey" PRIMARY KEY ("fromId", "toId")
);
CREATE TABLE "MediaAsset" (
  "id" TEXT NOT NULL,
  "type" "MediaType" NOT NULL,
  "url" TEXT NOT NULL,
  "pathname" TEXT,
  "mimeType" TEXT NOT NULL,
  "size" INTEGER NOT NULL,
  "altEn" TEXT NOT NULL,
  "altAr" TEXT NOT NULL,
  "captionEn" TEXT,
  "captionAr" TEXT,
  "category" TEXT,
  "approved" BOOLEAN NOT NULL DEFAULT false,
  "sortOrder" INTEGER NOT NULL DEFAULT 0,
  "productId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "MediaAsset_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "Inquiry" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "company" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "email" TEXT,
  "category" TEXT NOT NULL,
  "productSlug" TEXT,
  "productId" TEXT,
  "source" TEXT,
  "message" TEXT NOT NULL,
  "locale" TEXT NOT NULL DEFAULT 'en',
  "status" "InquiryStatus" NOT NULL DEFAULT 'New',
  "salesNotes" TEXT,
  "lastEditedById" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "Inquiry_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "AdminUser" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "role" "AdminRole" NOT NULL DEFAULT 'ContentEditor',
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "lastLoginAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "AuditLog" (
  "id" TEXT NOT NULL,
  "actorId" TEXT,
  "action" TEXT NOT NULL,
  "entity" TEXT NOT NULL,
  "entityId" TEXT,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "AnalyticsEvent" (
  "id" TEXT NOT NULL,
  "event" TEXT NOT NULL,
  "path" TEXT,
  "locale" TEXT NOT NULL DEFAULT 'en',
  "category" TEXT,
  "productSlug" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "AnalyticsEvent_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "RateLimitBucket" (
  "id" TEXT NOT NULL,
  "keyHash" TEXT NOT NULL,
  "windowStart" TIMESTAMP(3) NOT NULL,
  "count" INTEGER NOT NULL DEFAULT 0,
  CONSTRAINT "RateLimitBucket_pkey" PRIMARY KEY ("id")
);
CREATE TABLE "SiteSettings" (
  "id" TEXT NOT NULL DEFAULT 'singleton',
  "phone" TEXT NOT NULL,
  "whatsapp" TEXT NOT NULL,
  "address" TEXT NOT NULL,
  "mapUrl" TEXT,
  "email" TEXT,
  "socialLinks" JSONB,
  "legalRegistration" TEXT,
  "updatedAt" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "SiteSettings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ProductCategory_slug_key" ON "ProductCategory"("slug");
CREATE UNIQUE INDEX "Product_slug_key" ON "Product"("slug");
CREATE INDEX "Product_categoryId_isPublished_idx" ON "Product"("categoryId", "isPublished");
CREATE INDEX "Product_isFeatured_isPublished_idx" ON "Product"("isFeatured", "isPublished");
CREATE INDEX "ProductSpecification_productId_sortOrder_idx" ON "ProductSpecification"("productId", "sortOrder");
CREATE INDEX "MediaAsset_productId_approved_idx" ON "MediaAsset"("productId", "approved");
CREATE INDEX "MediaAsset_category_approved_idx" ON "MediaAsset"("category", "approved");
CREATE INDEX "Inquiry_status_createdAt_idx" ON "Inquiry"("status", "createdAt");
CREATE INDEX "Inquiry_productId_idx" ON "Inquiry"("productId");
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");
CREATE INDEX "AdminUser_role_isActive_idx" ON "AdminUser"("role", "isActive");
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");
CREATE INDEX "AuditLog_entity_entityId_idx" ON "AuditLog"("entity", "entityId");
CREATE INDEX "AnalyticsEvent_event_createdAt_idx" ON "AnalyticsEvent"("event", "createdAt");
CREATE UNIQUE INDEX "RateLimitBucket_keyHash_key" ON "RateLimitBucket"("keyHash");
CREATE INDEX "RateLimitBucket_windowStart_idx" ON "RateLimitBucket"("windowStart");

ALTER TABLE "Product" ADD CONSTRAINT "Product_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "ProductCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ProductSpecification" ADD CONSTRAINT "ProductSpecification_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProductRelation" ADD CONSTRAINT "ProductRelation_fromId_fkey" FOREIGN KEY ("fromId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ProductRelation" ADD CONSTRAINT "ProductRelation_toId_fkey" FOREIGN KEY ("toId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MediaAsset" ADD CONSTRAINT "MediaAsset_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Inquiry" ADD CONSTRAINT "Inquiry_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Inquiry" ADD CONSTRAINT "Inquiry_lastEditedById_fkey" FOREIGN KEY ("lastEditedById") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "AdminUser"("id") ON DELETE SET NULL ON UPDATE CASCADE;
