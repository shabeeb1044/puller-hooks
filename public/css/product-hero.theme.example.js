/**
 * Theme tokens for the product hero — CSS custom properties stand in for
 * Tailwind `theme.extend` because this site is vanilla CSS (no Tailwind build).
 *
 * Equivalent Tailwind config snippet if you migrate:
 *
 * module.exports = {
 *   theme: {
 *     extend: {
 *       colors: {
 *         neon: '#E6FF00',
 *         'neon-bright': '#F0FF4D',
 *         soft: '#B8C0CC',
 *         'border-dim': '#1F1F1F',
 *       },
 *       fontFamily: {
 *         display: ['"Barlow Condensed"', '"Arial Narrow"', 'sans-serif'],
 *         body: ['Barlow', 'system-ui', 'sans-serif'],
 *       },
 *       maxWidth: { hero: '1280px' },
 *       letterSpacing: { label: '0.2em' },
 *     },
 *   },
 * };
 *
 * Fonts are already self-hosted via @font-face in style.css:
 *   ../fonts/barlow-*.woff2
 *   ../fonts/barlow-condensed-*.woff2
 * and preloaded in the product page <head>.
 */
export const productHeroTheme = {
  colors: {
    black: '#000000',
    white: '#FFFFFF',
    neon: '#E6FF00',
    neonBright: '#F0FF4D',
    soft: '#B8C0CC',
    borderDim: '#1F1F1F',
  },
  fonts: {
    display: '"Barlow Condensed", "Arial Narrow", sans-serif',
    body: 'Barlow, system-ui, sans-serif',
  },
  maxWidth: '1280px',
};
