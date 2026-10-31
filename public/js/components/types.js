/**
 * Shared prop types for product hero components (JSDoc / TypeScript-compatible).
 *
 * @typedef {Object} BreadcrumbItem
 * @property {string} label
 * @property {string} [href] - Omit on the current page item
 * @property {boolean} [current]
 *
 * @typedef {Object} StatBadgeProps
 * @property {string} value
 * @property {string} label
 *
 * @typedef {Object} SpecChipsProps
 * @property {string[]} specs
 *
 * @typedef {Object} CTAButtonsProps
 * @property {string} primaryHref
 * @property {string} [primaryLabel]
 * @property {string} secondaryHref
 * @property {string} [secondaryLabel]
 *
 * @typedef {Object} BreadcrumbProps
 * @property {BreadcrumbItem[]} items
 *
 * @typedef {Object} ProductFilterBarProps
 * @property {string} searchId
 * @property {string} placeholder
 * @property {string} [formId]
 *
 * @typedef {Object} ProductHeroProps
 * @property {string} title
 * @property {string} category
 * @property {string} tagline
 * @property {string} imageSrc
 * @property {string} imageAlt
 * @property {BreadcrumbItem[]} breadcrumbs
 * @property {StatBadgeProps} stat
 * @property {string[]} specs
 * @property {CTAButtonsProps} cta
 */

export {};
