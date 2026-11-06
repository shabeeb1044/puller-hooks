/**
 * PULLER Admin Panel Client Handbook (DOCX)
 * Design inspired by professional SRS / timeline / product-doc layouts,
 * recolored to PULLER brand (yellow · red · charcoal · navy).
 * Content unchanged — design-only refresh.
 */
const fs = require('fs');
const path = require('path');
const {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  Header,
  Packer,
  PageNumber,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
  VerticalAlign,
  LevelFormat,
} = require('docx');

// Brand (website CSS)
const YELLOW = 'F7ED22';
const YELLOW_SOFT = 'FFF8A8';
const RED = 'D81E37';
const BLACK = '000000';
const CHARCOAL = '141414';
const NAVY = '071629';
const WHITE = 'FFFFFF';
const MUTED = '6B7280';
const SOFT = '9CA3AF';
const LINE = 'E5E7EB';
const ZEBRA = 'F9FAFB';
const LIGHT_RED = 'FFF5F6';

// A4 (210mm × 297mm) in DXA / twips
const PAGE_W = 11906;
const PAGE_H = 16838;
const MARGIN = 851; // ~15mm
const CONTENT_W = PAGE_W - MARGIN * 2;
const SIDEBAR_W = 850; // cover left rail
const STAGE_W = PAGE_W - SIDEBAR_W;
const STAGE_PAD = 720;
const STAGE_INNER = STAGE_W - STAGE_PAD * 2;

function nb() {
  const b = { style: BorderStyle.NONE, size: 0, color: WHITE };
  return { top: b, bottom: b, left: b, right: b };
}
function sb(color = LINE, size = 8) {
  const b = { style: BorderStyle.SINGLE, size, color };
  return { top: b, bottom: b, left: b, right: b };
}
function leftAccent(color = RED, size = 36) {
  return {
    top: { style: BorderStyle.SINGLE, size: 8, color: LINE },
    bottom: { style: BorderStyle.SINGLE, size: 8, color: LINE },
    left: { style: BorderStyle.SINGLE, size, color },
    right: { style: BorderStyle.SINGLE, size: 8, color: LINE },
  };
}

function cell(children, opts = {}) {
  const {
    width = CONTENT_W,
    fill,
    borders = sb(),
    vAlign = VerticalAlign.CENTER,
    margins = { top: 60, bottom: 60, left: 100, right: 100 },
  } = opts;
  return new TableCell({
    width: { size: width, type: WidthType.DXA },
    shading: fill ? { type: ShadingType.CLEAR, fill } : undefined,
    borders,
    verticalAlign: vAlign,
    margins,
    children: Array.isArray(children) ? children : [children],
  });
}

function emptyP(h = 80) {
  return new Paragraph({ spacing: { after: h }, children: [] });
}

function t(text, opts = {}) {
  return new TextRun({
    text,
    bold: opts.bold,
    italics: opts.italic,
    color: opts.color || CHARCOAL,
    size: opts.size || 20,
    font: opts.font || 'Calibri',
  });
}

function p(text, opts = {}) {
  return new Paragraph({
    alignment: opts.align || AlignmentType.LEFT,
    spacing: { after: opts.after ?? 100, before: opts.before ?? 0, line: opts.line },
    children: [t(text, opts)],
  });
}

function mixed(runs, opts = {}) {
  return new Paragraph({
    alignment: opts.align || AlignmentType.LEFT,
    spacing: { after: opts.after ?? 100, before: opts.before ?? 0 },
    children: runs.map((r) => t(r.text, r)),
  });
}

/** Accent underline under a section title (ref image 3) */
function sectionTitle(title) {
  return [
    new Paragraph({
      spacing: { before: 280, after: 40 },
      children: [t(title, { bold: true, size: 32, color: CHARCOAL, font: 'Arial' })],
    }),
    new Table({
      width: { size: 2200, type: WidthType.DXA },
      columnWidths: [2200],
      rows: [
        new TableRow({
          height: { value: 90, rule: 'exact' },
          children: [
            cell([new Paragraph({ children: [] })], {
              width: 2200,
              fill: YELLOW,
              borders: nb(),
              margins: { top: 0, bottom: 0, left: 0, right: 0 },
            }),
          ],
        }),
      ],
    }),
    emptyP(140),
  ];
}

/** Timeline-style numbered heading (ref image 2) */
function timelineHeading(num, title, subtitle) {
  const rail = 700;
  const rest = CONTENT_W - rail;
  return new Table({
    width: { size: CONTENT_W, type: WidthType.DXA },
    columnWidths: [rail, rest],
    rows: [
      new TableRow({
        children: [
          cell(
            [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { before: 40, after: 40 },
                children: [t(String(num), { bold: true, size: 36, color: YELLOW, font: 'Arial Black' })],
              }),
            ],
            { width: rail, fill: CHARCOAL, borders: nb(), margins: { top: 80, bottom: 80, left: 40, right: 40 } }
          ),
          cell(
            [
              new Paragraph({
                spacing: { before: 60, after: 20 },
                indent: { left: 160 },
                children: [t(title, { bold: true, size: 26, color: CHARCOAL, font: 'Arial' })],
              }),
              subtitle
                ? new Paragraph({
                    spacing: { after: 40 },
                    indent: { left: 160 },
                    children: [t(subtitle, { size: 16, color: MUTED, italic: true })],
                  })
                : new Paragraph({ children: [] }),
            ],
            {
              width: rest,
              fill: WHITE,
              borders: {
                top: { style: BorderStyle.NIL, size: 0, color: WHITE },
                bottom: { style: BorderStyle.SINGLE, size: 12, color: LINE },
                left: { style: BorderStyle.SINGLE, size: 24, color: YELLOW },
                right: { style: BorderStyle.NIL, size: 0, color: WHITE },
              },
              margins: { top: 40, bottom: 40, left: 40, right: 80 },
            }
          ),
        ],
      }),
    ],
  });
}

/** Meta / credential table (ref image 3) */
function metaTable(rows) {
  const c1 = 3400;
  const c2 = CONTENT_W - c1;
  return new Table({
    width: { size: CONTENT_W, type: WidthType.DXA },
    columnWidths: [c1, c2],
    rows: rows.map(
      ([label, value]) =>
        new TableRow({
          children: [
            cell(
              [p(label, { bold: true, color: WHITE, size: 18, after: 20 })],
              { width: c1, fill: RED, borders: sb(RED), margins: { top: 80, bottom: 80, left: 120, right: 120 } }
            ),
            cell(
              [p(value, { size: 18, color: CHARCOAL, after: 20 })],
              { width: c2, fill: WHITE, borders: sb(LINE), margins: { top: 80, bottom: 80, left: 140, right: 120 } }
            ),
          ],
        })
    ),
  });
}

function dataTable(headers, rows) {
  const n = headers.length;
  const base = Math.floor(CONTENT_W / n);
  const widths = headers.map((_, i) => (i === n - 1 ? CONTENT_W - base * (n - 1) : base));
  return new Table({
    width: { size: CONTENT_W, type: WidthType.DXA },
    columnWidths: widths,
    rows: [
      new TableRow({
        children: headers.map((h, i) =>
          cell(
            [p(h, { bold: true, color: WHITE, size: 17, after: 20 })],
            { width: widths[i], fill: CHARCOAL, borders: sb(CHARCOAL), margins: { top: 70, bottom: 70, left: 100, right: 100 } }
          )
        ),
      }),
      ...rows.map((row, ri) =>
        new TableRow({
          children: row.map((val, i) =>
            cell(
              [p(val, { size: 16, color: CHARCOAL, after: 20 })],
              {
                width: widths[i],
                fill: ri % 2 === 0 ? ZEBRA : WHITE,
                borders: sb(LINE),
                margins: { top: 70, bottom: 70, left: 100, right: 100 },
              }
            )
          ),
        })
      ),
    ],
  });
}

/** Solid navy info block (timeline right column feel) */
function infoBlock(lines) {
  return new Table({
    width: { size: CONTENT_W, type: WidthType.DXA },
    columnWidths: [CONTENT_W],
    rows: [
      new TableRow({
        children: [
          cell(
            lines.map((line, i) =>
              p(line, {
                color: WHITE,
                size: 17,
                after: i === lines.length - 1 ? 40 : 60,
                before: i === 0 ? 20 : 0,
              })
            ),
            {
              width: CONTENT_W,
              fill: NAVY,
              borders: nb(),
              margins: { top: 120, bottom: 120, left: 160, right: 160 },
            }
          ),
        ],
      }),
    ],
  });
}

/** Outlined feature chip row */
function outlineBox(text) {
  return new Table({
    width: { size: CONTENT_W, type: WidthType.DXA },
    columnWidths: [CONTENT_W],
    rows: [
      new TableRow({
        children: [
          cell(
            [p(text, { size: 17, color: CHARCOAL, after: 20 })],
            {
              width: CONTENT_W,
              fill: WHITE,
              borders: sb(CHARCOAL, 12),
              margins: { top: 80, bottom: 80, left: 140, right: 140 },
            }
          ),
        ],
      }),
    ],
  });
}

function callout(kind, title, body) {
  const isWarn = kind === 'warn';
  const fill = isWarn ? LIGHT_RED : YELLOW;
  const accent = isWarn ? RED : BLACK;
  return new Table({
    width: { size: CONTENT_W, type: WidthType.DXA },
    columnWidths: [CONTENT_W],
    rows: [
      new TableRow({
        children: [
          cell(
            [
              p(title, { bold: true, color: accent, size: 17, after: 40, before: 10 }),
              p(body, { size: 16, color: CHARCOAL, after: 20 }),
            ],
            {
              width: CONTENT_W,
              fill,
              borders: leftAccent(isWarn ? RED : CHARCOAL, 40),
              margins: { top: 100, bottom: 100, left: 140, right: 140 },
            }
          ),
        ],
      }),
    ],
  });
}

function bullet(text) {
  return new Paragraph({
    numbering: { reference: 'bullets', level: 0 },
    spacing: { after: 70 },
    children: [t(text, { size: 18 })],
  });
}

function step(text) {
  return new Paragraph({
    numbering: { reference: 'steps', level: 0 },
    spacing: { after: 80 },
    children: [t(text, { size: 18 })],
  });
}

function subHead(text) {
  return p(text, { bold: true, color: RED, size: 20, before: 160, after: 80, font: 'Arial' });
}

async function main() {
  const today = new Date();
  const dateStr = `${today.getMonth() + 1}/${today.getDate()}/${today.getFullYear()}`;
  const underlineSide = Math.max(200, Math.floor((STAGE_INNER - 1600) / 2));

  const doc = new Document({
    creator: 'PULLER Tackle',
    title: 'PULLER Admin Panel — Client Handbook',
    description: 'Client operator guide for the PULLER website admin dashboard',
    numbering: {
      config: [
        {
          reference: 'bullets',
          levels: [
            {
              level: 0,
              format: LevelFormat.BULLET,
              text: '•',
              alignment: AlignmentType.LEFT,
              style: { paragraph: { indent: { left: 360, hanging: 200 } } },
            },
          ],
        },
        {
          reference: 'steps',
          levels: [
            {
              level: 0,
              format: LevelFormat.DECIMAL,
              text: '%1.',
              alignment: AlignmentType.LEFT,
              style: { paragraph: { indent: { left: 360, hanging: 200 } } },
            },
          ],
        },
      ],
    },
    sections: [
      // ═══════════════════════════════════════
      // COVER — A4, left rail + right stage aligned
      // ═══════════════════════════════════════
      {
        properties: {
          page: {
            size: { width: PAGE_W, height: PAGE_H },
            margin: { top: 0, right: 0, bottom: 0, left: 0 },
          },
        },
        children: [
          new Table({
            width: { size: PAGE_W, type: WidthType.DXA },
            columnWidths: [SIDEBAR_W, STAGE_W],
            rows: [
              new TableRow({
                height: { value: PAGE_H, rule: 'exact' },
                children: [
                  // Left charcoal rail (full page height)
                  cell([new Paragraph({ children: [] })], {
                    width: SIDEBAR_W,
                    fill: CHARCOAL,
                    borders: nb(),
                    vAlign: VerticalAlign.TOP,
                    margins: { top: 0, bottom: 0, left: 0, right: 0 },
                  }),
                  // Right white stage — all content stays inside STAGE_W
                  cell(
                    [
                      emptyP(900),
                      // Date ribbon (starts at left of stage, flush to rail)
                      new Table({
                        width: { size: STAGE_INNER, type: WidthType.DXA },
                        columnWidths: [2600, STAGE_INNER - 2600],
                        rows: [
                          new TableRow({
                            children: [
                              cell(
                                [
                                  new Paragraph({
                                    alignment: AlignmentType.CENTER,
                                    spacing: { before: 20, after: 20 },
                                    children: [t(dateStr, { bold: true, color: BLACK, size: 18, font: 'Arial' })],
                                  }),
                                ],
                                {
                                  width: 2600,
                                  fill: YELLOW,
                                  borders: nb(),
                                  margins: { top: 90, bottom: 90, left: 60, right: 60 },
                                }
                              ),
                              cell([new Paragraph({ children: [] })], {
                                width: STAGE_INNER - 2600,
                                fill: WHITE,
                                borders: nb(),
                                margins: { top: 0, bottom: 0, left: 0, right: 0 },
                              }),
                            ],
                          }),
                        ],
                      }),
                      emptyP(700),
                      // Red accent line (full inner width)
                      new Table({
                        width: { size: STAGE_INNER, type: WidthType.DXA },
                        columnWidths: [STAGE_INNER],
                        rows: [
                          new TableRow({
                            height: { value: 70, rule: 'exact' },
                            children: [
                              cell([new Paragraph({ children: [] })], {
                                width: STAGE_INNER,
                                fill: RED,
                                borders: nb(),
                                margins: { top: 0, bottom: 0, left: 0, right: 0 },
                              }),
                            ],
                          }),
                        ],
                      }),
                      emptyP(360),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 100 },
                        children: [t('PULLER', { bold: true, size: 64, color: CHARCOAL, font: 'Arial Black' })],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 70 },
                        children: [t('ADMIN PANEL', { bold: true, size: 36, color: RED, font: 'Arial' })],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 180 },
                        children: [t('Client Operator Handbook', { size: 22, color: MUTED, italic: true, font: 'Georgia' })],
                      }),
                      // Centered yellow underline (columns sum = STAGE_INNER)
                      new Table({
                        width: { size: STAGE_INNER, type: WidthType.DXA },
                        columnWidths: [underlineSide, 1600, STAGE_INNER - underlineSide - 1600],
                        rows: [
                          new TableRow({
                            height: { value: 70, rule: 'exact' },
                            children: [
                              cell([new Paragraph({ children: [] })], {
                                width: underlineSide,
                                borders: nb(),
                                margins: { top: 0, bottom: 0, left: 0, right: 0 },
                              }),
                              cell([new Paragraph({ children: [] })], {
                                width: 1600,
                                fill: YELLOW,
                                borders: nb(),
                                margins: { top: 0, bottom: 0, left: 0, right: 0 },
                              }),
                              cell([new Paragraph({ children: [] })], {
                                width: STAGE_INNER - underlineSide - 1600,
                                borders: nb(),
                                margins: { top: 0, bottom: 0, left: 0, right: 0 },
                              }),
                            ],
                          }),
                        ],
                      }),
                      emptyP(280),
                      new Paragraph({
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 60 },
                        children: [
                          t(
                            'How to use your website admin dashboard — products, categories, inquiries, and settings.',
                            { size: 17, color: SOFT }
                          ),
                        ],
                      }),
                      emptyP(2800),
                      new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        spacing: { after: 30 },
                        children: [t('PREPARED FOR', { bold: true, size: 13, color: MUTED, font: 'Arial' })],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        spacing: { after: 40 },
                        children: [t('PULLER Client Operators', { bold: true, size: 18, color: CHARCOAL, font: 'Arial' })],
                      }),
                      new Paragraph({
                        alignment: AlignmentType.RIGHT,
                        children: [t('pullertackle.com', { size: 15, color: RED })],
                      }),
                    ],
                    {
                      width: STAGE_W,
                      fill: WHITE,
                      borders: {
                        top: { style: BorderStyle.SINGLE, size: 18, color: CHARCOAL },
                        bottom: { style: BorderStyle.SINGLE, size: 18, color: CHARCOAL },
                        left: { style: BorderStyle.NIL, size: 0, color: WHITE },
                        right: { style: BorderStyle.SINGLE, size: 18, color: CHARCOAL },
                      },
                      vAlign: VerticalAlign.TOP,
                      margins: { top: STAGE_PAD, bottom: STAGE_PAD, left: STAGE_PAD, right: STAGE_PAD },
                    }
                  ),
                ],
              }),
            ],
          }),
        ],
      },

      // ═══════════════════════════════════════
      // BODY
      // ═══════════════════════════════════════
      {
        properties: {
          page: {
            size: { width: PAGE_W, height: PAGE_H },
            margin: { top: 1000, right: MARGIN, bottom: 1000, left: MARGIN },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Table({
                width: { size: CONTENT_W, type: WidthType.DXA },
                columnWidths: [Math.floor(CONTENT_W * 0.58), Math.floor(CONTENT_W * 0.42)],
                rows: [
                  new TableRow({
                    children: [
                      cell(
                        [
                          mixed([
                            { text: 'PULLER', bold: true, size: 16, color: BLACK, font: 'Arial Black' },
                            { text: '  ·  Admin Handbook', size: 14, color: CHARCOAL },
                          ]),
                        ],
                        { width: Math.floor(CONTENT_W * 0.58), fill: YELLOW, borders: nb(), margins: { top: 50, bottom: 50, left: 120, right: 80 } }
                      ),
                      cell(
                        [p('Client operator guide', { align: AlignmentType.RIGHT, color: WHITE, size: 14, after: 0 })],
                        { width: Math.floor(CONTENT_W * 0.42), fill: CHARCOAL, borders: nb(), margins: { top: 50, bottom: 50, left: 80, right: 120 } }
                      ),
                    ],
                  }),
                ],
              }),
              emptyP(60),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Table({
                width: { size: CONTENT_W, type: WidthType.DXA },
                columnWidths: [Math.floor(CONTENT_W * 0.72), Math.floor(CONTENT_W * 0.28)],
                rows: [
                  new TableRow({
                    children: [
                      cell(
                        [p('Confidential · For PULLER client use', { size: 13, color: SOFT, after: 0 })],
                        { width: Math.floor(CONTENT_W * 0.72), borders: nb(), margins: { top: 40, bottom: 0, left: 0, right: 0 } }
                      ),
                      cell(
                        [
                          new Paragraph({
                            alignment: AlignmentType.RIGHT,
                            children: [
                              t('Page ', { size: 13, color: SOFT }),
                              new TextRun({ children: [PageNumber.CURRENT], color: RED, size: 13, bold: true }),
                              t(' / ', { size: 13, color: SOFT }),
                              new TextRun({ children: [PageNumber.TOTAL_PAGES], color: SOFT, size: 13 }),
                            ],
                          }),
                        ],
                        { width: Math.floor(CONTENT_W * 0.28), borders: nb(), margins: { top: 40, bottom: 0, left: 0, right: 0 } }
                      ),
                    ],
                  }),
                ],
              }),
            ],
          }),
        },
        children: [
          // Document meta strip
          ...sectionTitle('Document overview'),
          p('This document outlines how to operate the PULLER website admin dashboard: login, products, categories, inquiries, and settings.', {
            size: 18,
            after: 160,
          }),
          metaTable([
            ['Primary goal', 'Train client operators to manage the live CMS'],
            ['Login path', '/management-portal'],
            ['Admin home', '/admin'],
            ['Document status', 'Ready for client use'],
          ]),
          emptyP(120),
          callout(
            'warn',
            'Important',
            'Always use /management-portal. The old address /admin/login does not work — it sends visitors to the public homepage. After login you land on the Dashboard. Use Logout in the sidebar when finished. Login details are provided separately by your administrator — they are not listed in this handbook.'
          ),

          emptyP(200),
          timelineHeading(1, 'Sign in to the Admin Panel', 'Access · session'),
          emptyP(140),
          p('Open the management portal in your browser and sign in with the account provided by your administrator.', {
            size: 18,
            after: 120,
          }),
          infoBlock([
            'Login path → /management-portal',
            'After success → Dashboard (/admin)',
            'End session → Logout (sidebar or Settings)',
          ]),

          emptyP(240),
          timelineHeading(2, 'Where things appear on the website', 'Admin edit → public display map'),
          emptyP(140),
          p('Everything you edit in Admin is connected to a place on the public site. Use this map so you know what customers will see.', {
            size: 18,
            after: 140,
          }),
          dataTable(
            ['You edit in Admin…', 'Customers see it here'],
            [
              ['Categories (visible + menu link)', 'Header → Products dropdown'],
              ['Category page sections & themes', '/products/[category-slug]'],
              ['Subcategories', '/products/[category]/[subcategory]'],
              ['Published products', 'Category / subcategory pages & product cards'],
              ['Product CTA button', 'Button label + link on the product'],
              ['Dealers form submissions', 'Admin → Dealers Inquiries (not public)'],
              ['Contact form submissions', 'Admin → Contact Inquiries (not public)'],
              ['Draft products', 'Hidden from the public site'],
            ]
          ),
          emptyP(120),
          callout(
            'tip',
            'Rule of thumb',
            'Visible category + Published product = shown on the live website. Draft or hidden = only in Admin until you publish / show it.'
          ),

          emptyP(240),
          timelineHeading(3, 'Admin menu — all features', 'Sidebar navigation'),
          emptyP(140),
          dataTable(
            ['Menu item', 'What you can do'],
            [
              ['Dashboard', 'See totals: products, published, categories, new inquiries'],
              ['Products', 'Add, edit, publish, delete, search, filter, drag to reorder'],
              ['Categories', 'Menu labels, page copy, colors, images, menu click target'],
              ['Subcategories', 'Groups under a category; optional own page'],
              ['Dealers Inquiries', 'View dealer applications; set status; delete'],
              ['Contact Inquiries', 'View contact messages; set status; delete'],
              ['Settings', 'Change your admin password'],
            ]
          ),
          emptyP(100),
          bullet('Dark / Light toggle — saves preference in your browser'),
          bullet('Logout — ends your session and returns to the login page'),

          emptyP(240),
          timelineHeading(4, 'Dashboard', 'Home screen after login'),
          emptyP(140),
          p('The Dashboard is your home screen after login. It shows:', { size: 18, after: 100 }),
          bullet('Total products and how many are Published'),
          bullet('Number of categories and subcategories'),
          bullet('New dealer inquiries and new contact inquiries'),
          bullet('Shortcuts to manage categories, subcategories, and inquiries'),
          bullet('Add product button for a quick start'),

          emptyP(240),
          timelineHeading(5, 'How to add a product', 'Step-by-step create & publish'),
          emptyP(140),
          callout(
            'tip',
            'Before you start',
            'Make sure the Category (and Subcategory if needed) already exists. Create those first under Categories / Subcategories, then add the product.'
          ),
          emptyP(120),
          step('Go to Admin → Products → Add product.'),
          step('Enter Product name. The Slug fills automatically — keep it short and unique.'),
          step('Write a Description. Add Specifications and Features (one item per line).'),
          step('Choose Category (required) and Subcategory (optional).'),
          step('Set Status: Draft (hidden) or Published (live on the site).'),
          step('Choose Display layout: Horizontal or Vertical.'),
          step('Add Product image — paste a path like /images/... or click Upload image.'),
          step('Optional: Image alt text, Sort order, CTA label, CTA link, Search terms.'),
          step('Click Create product.'),
          step('Open the public category page and confirm the product appears (if Published).'),
          emptyP(140),
          subHead('Product fields'),
          dataTable(
            ['Field', 'Purpose'],
            [
              ['Product name', 'Name shown to customers'],
              ['Slug', 'URL-friendly id (stable once live)'],
              ['Description', 'Short product copy'],
              ['Specifications / Features', 'One line = one bullet on the site'],
              ['Category / Subcategory', 'Where the product is listed'],
              ['Status', 'draft = hidden · published = live'],
              ['Display layout', 'Card orientation on listing pages'],
              ['Product image', 'Main photo (JPEG, PNG, WebP, GIF)'],
              ['CTA label / link', 'Button text and destination (e.g. /dealers#apply)'],
              ['Search terms', 'Extra words to help matching'],
            ]
          ),
          emptyP(120),
          callout(
            'warn',
            'Reorder products',
            'On the Products list, drag rows up or down. The order you set is the order customers see on category pages.'
          ),

          emptyP(240),
          timelineHeading(6, 'Categories — menu & page design', 'Products dropdown + landing pages'),
          emptyP(140),
          p('Categories control the Products menu and each category landing page. Path: Admin → Categories.', {
            size: 18,
            after: 120,
          }),
          subHead('Basics'),
          bullet('Name — label in the menu'),
          bullet('Slug — used in /products/[slug]'),
          bullet('Sort order — position in the menu'),
          bullet('Visible in navigation — uncheck to hide from the header'),
          subHead('Products menu click goes to'),
          outlineBox('Category page — opens the category listing'),
          emptyP(60),
          outlineBox('Choose existing product — jumps to a product already in Products'),
          emptyP(60),
          outlineBox('Custom URL / section — e.g. /contact, #card-metal, or a full URL'),
          subHead('Category page sections (each can be Dark or Yellow)'),
          dataTable(
            ['Section', 'What you edit', 'Where it shows'],
            [
              ['01 Banner', 'Subtitle, heading, description, background image', 'Top hero of the category page'],
              ['02 Intro', 'Subtitle, heading, description, right-side image', 'Story block under the banner'],
              ['03 Products', 'Subtitle, heading, description for the product list', 'Above the product cards'],
            ]
          ),
          emptyP(120),
          callout(
            'tip',
            'Theme tip',
            'Dark theme can show a background image. Yellow theme uses solid PULLER yellow (same as the website header).'
          ),

          emptyP(240),
          timelineHeading(7, 'Subcategories', 'Groups under a parent category'),
          emptyP(140),
          p('Path: Admin → Subcategories. Use these to group products under a parent category.', { size: 18, after: 100 }),
          bullet('Name, slug, parent Category (required)'),
          bullet('Description, images, visibility, sort order'),
          bullet('Same menu link options as categories (own page / product / custom URL)'),
          bullet('Optional page title and lead text'),
          emptyP(80),
          infoBlock(['Public URL pattern: /products/[category]/[subcategory]']),

          emptyP(240),
          timelineHeading(8, 'Images', 'Upload or path'),
          emptyP(140),
          step('Paste an existing path (recommended for production), e.g. /images/product-hooks.webp — or'),
          step('Click Upload image and choose JPEG, PNG, WebP, or GIF.'),
          step('Check the preview. Use Clear to remove.'),
          emptyP(100),
          callout(
            'warn',
            'Production note',
            'Uploaded files may not stay forever on Cloudflare hosting after a redeploy. Prefer images already in /images/ (or durable cloud storage) for the live site.'
          ),

          emptyP(240),
          timelineHeading(9, 'Dealers & Contact Inquiries', 'Leads from public forms'),
          emptyP(140),
          subHead('Dealers Inquiries'),
          p('Applications from the public Dealers form appear here.', { size: 18, after: 80 }),
          bullet('Search by name, email, company, and more'),
          bullet('Filter by status: New · In Progress · Completed'),
          bullet('View opens full details (company, phone, address, postal code, city, website, message…)'),
          bullet('Update status as you work the lead'),
          bullet('Delete removes the record (asks for confirmation)'),
          subHead('Contact Inquiries'),
          p('Same tools for Contact form messages (name, email, topic, message, etc.).', { size: 18, after: 80 }),
          callout(
            'tip',
            'Suggested status flow',
            'New → In Progress (while you reply by email/phone) → Completed when finished.'
          ),

          emptyP(240),
          timelineHeading(10, 'Settings — change password', 'Account security'),
          emptyP(140),
          step('Go to Admin → Settings.'),
          step('Enter Current password.'),
          step('Enter New password (at least 8 characters) and confirm it.'),
          step('Click Update password. Use the new password next login.'),

          emptyP(240),
          timelineHeading(11, 'Daily checklist', 'Recommended routine'),
          emptyP(140),
          step('Sign in at /management-portal'),
          step('Check Dashboard for new dealer / contact inquiries'),
          step('Open each new inquiry → View → update status → reply offline'),
          step('To launch a new product line: Category → Subcategory (optional) → Product → Published'),
          step('Preview the public Products menu and category pages'),
          step('Logout when done'),

          emptyP(240),
          timelineHeading(12, 'Troubleshooting', 'Common problems & fixes'),
          emptyP(140),
          dataTable(
            ['Problem', 'Fix'],
            [
              ['Login page missing / homepage opens', 'Use /management-portal only'],
              ['Login rejected', 'Confirm the account with your administrator; or update password in Settings'],
              ['“Server returned a web page…”', 'Session expired — sign in again'],
              ['Product not on website', 'Set Status = Published; make category Visible if needed in menu'],
              ['Menu opens wrong page', 'Edit category → Products menu click goes to'],
              ['Image gone after deploy', 'Use /images/… path or re-upload to durable storage'],
              ['/admin redirects to login', 'Normal when logged out — sign in first'],
            ]
          ),

          emptyP(320),
          // Closing band
          new Table({
            width: { size: CONTENT_W, type: WidthType.DXA },
            columnWidths: [CONTENT_W],
            rows: [
              new TableRow({
                children: [
                  cell(
                    [
                      p('PULLER TACKLE', {
                        bold: true,
                        color: BLACK,
                        size: 26,
                        align: AlignmentType.CENTER,
                        before: 80,
                        after: 40,
                        font: 'Arial Black',
                      }),
                      p('Admin Panel Handbook  ·  Keep this document with your team', {
                        align: AlignmentType.CENTER,
                        color: CHARCOAL,
                        size: 16,
                        after: 80,
                      }),
                    ],
                    { width: CONTENT_W, fill: YELLOW, borders: nb(), margins: { top: 120, bottom: 80, left: 120, right: 120 } }
                  ),
                ],
              }),
              new TableRow({
                children: [
                  cell(
                    [
                      p('Need help? Start from Dashboard → check inquiries → publish products carefully.', {
                        align: AlignmentType.CENTER,
                        color: WHITE,
                        size: 15,
                        before: 40,
                        after: 40,
                      }),
                    ],
                    { width: CONTENT_W, fill: RED, borders: nb(), margins: { top: 60, bottom: 60, left: 120, right: 120 } }
                  ),
                ],
              }),
            ],
          }),
        ],
      },
    ],
  });

  const outDir = path.join(__dirname, '..', 'docs');
  fs.mkdirSync(outDir, { recursive: true });
  const buffer = await Packer.toBuffer(doc);
  const candidates = [
    path.join(outDir, 'PULLER-Admin-Panel-Client-Handbook.docx'),
    path.join(outDir, 'PULLER-Admin-Panel-Client-Handbook-v2.docx'),
    path.join(outDir, 'PULLER-Admin-Panel-Client-Handbook-A4.docx'),
  ];
  let written = null;
  for (const target of candidates) {
    try {
      fs.writeFileSync(target, buffer);
      written = target;
      break;
    } catch (err) {
      if (!err || err.code !== 'EBUSY') throw err;
    }
  }
  if (!written) {
    throw new Error('All handbook DOCX files are locked. Close them in Word/Cursor and re-run.');
  }
  console.log('Wrote', written);
  if (!written.endsWith('PULLER-Admin-Panel-Client-Handbook.docx')) {
    console.log('Note: main filename was locked — close open DOCX files to overwrite the primary name next time.');
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
