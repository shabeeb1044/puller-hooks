-- CreateTable
CREATE TABLE `AdminUser` (
    `id` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `passwordHash` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NULL,
    `role` VARCHAR(191) NOT NULL DEFAULT 'admin',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `AdminUser_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Category` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `image` TEXT NULL,
    `bannerImage` TEXT NULL,
    `visible` BOOLEAN NOT NULL DEFAULT true,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `menuLinkType` VARCHAR(191) NOT NULL DEFAULT 'page',
    `menuAnchor` TEXT NULL,
    `menuProductId` VARCHAR(191) NULL,
    `pageSubtitle` VARCHAR(191) NULL,
    `pageTitle` VARCHAR(191) NULL,
    `pageLead` TEXT NULL,
    `introSubtitle` VARCHAR(191) NULL,
    `introTitle` VARCHAR(191) NULL,
    `productsSubtitle` VARCHAR(191) NULL,
    `productsTitle` VARCHAR(191) NULL,
    `productsLead` TEXT NULL,
    `bannerTheme` VARCHAR(191) NOT NULL DEFAULT 'black',
    `introTheme` VARCHAR(191) NOT NULL DEFAULT 'black',
    `productsTheme` VARCHAR(191) NOT NULL DEFAULT 'black',
    `pageTheme` VARCHAR(191) NOT NULL DEFAULT 'black',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Category_slug_key`(`slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Subcategory` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `image` TEXT NULL,
    `bannerImage` TEXT NULL,
    `visible` BOOLEAN NOT NULL DEFAULT true,
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `menuLinkType` VARCHAR(191) NOT NULL DEFAULT 'page',
    `menuAnchor` TEXT NULL,
    `menuProductId` VARCHAR(191) NULL,
    `pageSubtitle` VARCHAR(191) NULL,
    `pageTitle` VARCHAR(191) NULL,
    `pageLead` TEXT NULL,
    `modelsSubtitle` VARCHAR(191) NULL,
    `modelsTitle` VARCHAR(191) NULL,
    `modelsLead` TEXT NULL,
    `productsSubtitle` VARCHAR(191) NULL,
    `productsTitle` VARCHAR(191) NULL,
    `productsLead` TEXT NULL,
    `bannerTheme` VARCHAR(191) NOT NULL DEFAULT 'black',
    `modelsTheme` VARCHAR(191) NOT NULL DEFAULT 'black',
    `productsTheme` VARCHAR(191) NOT NULL DEFAULT 'black',
    `categoryId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Subcategory_categoryId_slug_key`(`categoryId`, `slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Product` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `specifications` TEXT NULL,
    `features` TEXT NULL,
    `image` TEXT NULL,
    `imageAlt` VARCHAR(191) NULL,
    `imageHeight` INTEGER NULL,
    `imageStyle` VARCHAR(191) NOT NULL DEFAULT 'normal',
    `status` VARCHAR(191) NOT NULL DEFAULT 'draft',
    `layout` VARCHAR(191) NOT NULL DEFAULT 'horizontal',
    `sortOrder` INTEGER NOT NULL DEFAULT 0,
    `ctaLabel` VARCHAR(191) NULL DEFAULT 'Inquiry now',
    `ctaHref` TEXT NULL DEFAULT '/dealers#apply',
    `searchTerms` TEXT NULL,
    `categoryId` VARCHAR(191) NOT NULL,
    `subcategoryId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `Product_status_sortOrder_idx`(`status`, `sortOrder`),
    INDEX `Product_subcategoryId_idx`(`subcategoryId`),
    UNIQUE INDEX `Product_categoryId_slug_key`(`categoryId`, `slug`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DealerEnquiry` (
    `id` VARCHAR(191) NOT NULL,
    `company` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `businessType` VARCHAR(191) NULL,
    `country` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `whatsapp` VARCHAR(191) NULL,
    `address` TEXT NULL,
    `postalCode` VARCHAR(191) NULL,
    `city` VARCHAR(191) NULL,
    `website` TEXT NULL,
    `interest` TEXT NULL,
    `message` TEXT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'new',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `DealerEnquiry_status_createdAt_idx`(`status`, `createdAt`),
    INDEX `DealerEnquiry_email_idx`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ContactEnquiry` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `company` VARCHAR(191) NULL,
    `topic` VARCHAR(191) NULL,
    `country` VARCHAR(191) NULL,
    `phone` VARCHAR(191) NULL,
    `whatsapp` VARCHAR(191) NULL,
    `message` TEXT NOT NULL,
    `status` VARCHAR(191) NOT NULL DEFAULT 'new',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `ContactEnquiry_status_createdAt_idx`(`status`, `createdAt`),
    INDEX `ContactEnquiry_email_idx`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Setting` (
    `id` VARCHAR(191) NOT NULL,
    `key` VARCHAR(191) NOT NULL,
    `value` TEXT NOT NULL,
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Setting_key_key`(`key`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Category` ADD CONSTRAINT `Category_menuProductId_fkey` FOREIGN KEY (`menuProductId`) REFERENCES `Product`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Subcategory` ADD CONSTRAINT `Subcategory_menuProductId_fkey` FOREIGN KEY (`menuProductId`) REFERENCES `Product`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Subcategory` ADD CONSTRAINT `Subcategory_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_subcategoryId_fkey` FOREIGN KEY (`subcategoryId`) REFERENCES `Subcategory`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

