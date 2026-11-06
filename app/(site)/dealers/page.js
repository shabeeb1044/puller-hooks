import { HtmlMain } from '@/components/HtmlMain';
import DealerDirectory from '@/components/DealerDirectory';
import { getDealerDirectory } from '@/lib/cms';

export const metadata = {
  title: "Become a Dealer | PULLER Co., Ltd.",
  description: "Apply to become an authorized PULLER dealer. Wholesale fishing hooks, FLASH STRIKER hard-body lures, metal lures and jigs for shops and distributors worldwide.",
  openGraph: {
    title: "Become a Dealer | PULLER Co., Ltd.",
    description: "Apply to become an authorized PULLER dealer. Wholesale fishing hooks, FLASH STRIKER hard-body lures, metal lures and jigs for shops and distributors worldwide.",
    images: [{ url: "https://pullertackle.com/images/og-image.webp" }],
    siteName: 'PULLER Co., Ltd.',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Become a Dealer | PULLER Co., Ltd.",
    description: "Apply to become an authorized PULLER dealer. Wholesale fishing hooks, FLASH STRIKER hard-body lures, metal lures and jigs for shops and distributors worldwide.",
    images: ["https://pullertackle.com/images/og-image.webp"],
  },
  alternates: {
    canonical: "https://pullertackle.com/dealers",
  },
};

const BANNER_HTML = `<section class="page-banner flash-striker-banner" aria-labelledby="dealers-page-title">
      <div class="page-banner-media" aria-hidden="true">
        <img
          src="/images/flash-striker-160-dd-banner.webp"
          alt=""
          width="1920"
          height="1080"
          decoding="async"
          fetchpriority="high"
        />
      </div>
      <div class="page-banner-shade" aria-hidden="true"></div>
      <div class="container page-banner-inner">
        <nav class="crumbs crumbs--on-dark" aria-label="Breadcrumb">
          <a href="/">Home</a>
          <span aria-hidden="true">/</span>
          <span aria-current="page">Dealers</span>
        </nav>
        <p class="section-eyebrow">Authorized Network</p>
        <h1 id="dealers-page-title" class="section-title">Become a PULLER Authorized Dealer</h1>
        <p class="page-banner-lead">Worldwide dealer network for high-quality fishing hooks, lures and jigs.</p>
      </div>
    </section>`;

const APPLY_AND_FAQ_HTML = `<section class="contact-form-section dealer-apply" id="apply" aria-labelledby="dealer-form-title">
      <div class="container contact-form-layout">
        <aside class="contact-info reveal">
          <p class="section-eyebrow">Dealer Inquiry</p>
          <h2 id="dealer-form-title" class="section-title">Join the PULLER network and grow your business with a trusted fishing-products brand.</h2>
          <p>Please complete the form below with your business and contact details. Our team will review your inquiry and contact you with further information about becoming a PULLER Authorized Dealer.</p>
          <ul class="contact-list">
            <li><span>Email</span><a href="mailto:sales@pullertackle.com">sales@pullertackle.com</a></li>
            <li><span>Lines</span>HARD BODY LURES · HOOKS · METAL LURES · JIGS</li>
            <li><span>Focus</span>Wholesale &amp; authorized retail</li>
          </ul>
          <p class="dealer-apply-note">Prefer email? Write <a class="text-link" href="mailto:sales@pullertackle.com?subject=Dealer%20Inquiry">sales@pullertackle.com</a> with “Dealer Inquiry” in the subject.</p>
        </aside>

        <div class="contact-form-panel reveal">
          <div id="applyFormView" class="apply-view">
            <form class="contact-form contact-form--standalone dealer-form" id="dealerForm" data-form="dealer" novalidate>
              <p class="dealer-required-note"><span>*</span> Required fields</p>

              <div class="dealer-field field">
                <label for="df-name">Name <span class="req" aria-hidden="true">*</span></label>
                <input id="df-name" name="name" type="text" autocomplete="name" required />
              </div>
              <div class="dealer-field field">
                <label for="df-company">Company name <span class="req" aria-hidden="true">*</span></label>
                <input id="df-company" name="company" type="text" autocomplete="organization" required />
              </div>
              <div class="dealer-field field">
                <label for="df-email">Email <span class="req" aria-hidden="true">*</span></label>
                <input id="df-email" name="email" type="email" autocomplete="email" required />
              </div>
              <div class="dealer-field field">
                <label for="df-type">Business type</label>
                <select id="df-type" name="business_type">
                  <option value="tackle-shop">Tackle / retail shop</option>
                  <option value="distributor">Distributor / wholesaler</option>
                  <option value="online">Online store</option>
                  <option value="marine">Marine / outdoor store</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div class="field-row field-row--phone">
                <div class="dealer-field field field--country">
                  <label for="df-country">Country <span class="req" aria-hidden="true">*</span></label>
                  <div
                    class="country-select"
                    data-name="country"
                    data-input-id="df-country"
                    data-placeholder="Select a country"
                    data-required
                  ></div>
                </div>
                <div class="dealer-field field field--phone">
                  <label for="df-phone">Phone <span class="req" aria-hidden="true">*</span></label>
                  <div class="phone-input" data-name="phone" data-input-id="df-phone" data-required></div>
                </div>
              </div>
              <div class="field-row field-row--phone field-row--whatsapp">
                <div class="dealer-field field field--country">
                  <label for="df-whatsapp-country">WhatsApp dial code <span class="field-optional">(optional)</span></label>
                  <div
                    class="country-select"
                    data-name="whatsapp_country"
                    data-input-id="df-whatsapp-country"
                    data-placeholder="Select dial code"
                    data-phone-target="df-whatsapp"
                  ></div>
                </div>
                <div class="dealer-field field field--phone">
                  <label for="df-whatsapp">WhatsApp number <span class="field-optional">(optional)</span></label>
                  <div class="phone-input" data-name="whatsapp" data-input-id="df-whatsapp" data-placeholder="WhatsApp number" data-independent></div>
                </div>
              </div>
              <div class="dealer-field field field--full">
                <label for="df-address">Physical Store Address <span class="field-optional">(will be verified)</span></label>
                <input id="df-address" name="address" type="text" autocomplete="street-address" required />
              </div>
              <div class="dealer-field field">
                <label for="df-postal">Zip / Postal Code <span class="field-optional">(optional)</span></label>
                <input id="df-postal" name="postal_code" type="text" autocomplete="postal-code" />
              </div>
              <div class="dealer-field field">
                <label for="df-city">City / region <span class="req" aria-hidden="true">*</span></label>
                <input id="df-city" name="city" type="text" autocomplete="address-level2" required />
              </div>
              <div class="dealer-field field">
                <label for="df-website">Website <span class="field-optional">(optional)</span></label>
                <input id="df-website" name="website" type="url" autocomplete="url" placeholder="https://" />
              </div>
              <div class="dealer-field field field--full">
                <label for="df-interest">Product interest</label>
                <select id="df-interest" name="interest">
                  <option value="full-range">Full PULLER range</option>
                  <option value="hooks">Fishing hooks</option>
                  <option value="flash-striker">FLASH STRIKER hard-body lures</option>
                  <option value="metal">Metal lures</option>
                  <option value="jigs">Fishing jigs</option>
                </select>
              </div>
              <div class="dealer-field field field--full">
                <label for="df-msg">Message <span class="field-optional">(optional)</span></label>
                <textarea id="df-msg" name="message" rows="5" placeholder="Store locations, annual volume, species you serve, or lines you want first…"></textarea>
              </div>
              <button type="submit" class="btn btn-primary" id="dealerSubmit">
                Submit application <svg class="btn-icon" aria-hidden="true"><use href="#i-arrow"/></svg>
              </button>
              <p class="form-status apply-status" id="dealerStatus" role="status"></p>
            </form>
          </div>

          <div id="applySuccessView" class="apply-success dealer-success" hidden>
            <div class="apply-success-icon" aria-hidden="true">
              <svg><use href="#i-check"/></svg>
            </div>
            <h2 id="applySuccessTitle">Application received</h2>
            <p>Thanks for your interest in becoming a PULLER authorized dealer. Our team will review your details and contact you within one business day.</p>
            <a class="btn btn-primary" href="/#products">Browse products <svg class="btn-icon" aria-hidden="true"><use href="#i-arrow"/></svg></a>
          </div>
        </div>
      </div>
    </section>

    <section class="contact-faq dealer-faq" aria-labelledby="dealer-faq-title">
      <div class="container">
        <header class="contact-faq-head reveal">
          <p class="section-eyebrow">Dealer FAQ</p>
          <h2 id="dealer-faq-title" class="section-title">Common questions</h2>
        </header>
        <div class="contact-faq-grid">
          <details class="contact-faq-item reveal">
            <summary>Who can become a PULLER dealer?</summary>
            <p>We work with established tackle shops, marine/outdoor retailers, online stores, and regional distributors. Tell us about your channel and market in the application — we prioritize partners who can represent the brand well.</p>
          </details>
          <details class="contact-faq-item reveal">
            <summary>What is the minimum order quantity?</summary>
            <p>MOQ depends on product line and destination. After we review your application, we share dealer pricing and minimums for the lines you want to stock.</p>
          </details>
          <details class="contact-faq-item reveal">
            <summary>Do you offer exclusive territories?</summary>
            <p>Coverage is discussed case by case. We aim for healthy distribution — strong partners in open markets, and clear guidance where we already have authorized dealers.</p>
          </details>
          <details class="contact-faq-item reveal">
            <summary>Can I get samples or a colour chart?</summary>
            <p>Yes. Qualified applicants can request catalogues, FLASH STRIKER hard-body lures, metal lures and jigs colour references, and sample options. Mention what you need in the form or email sales.</p>
          </details>
        </div>
      </div>
    </section>`;

const JSON_LD = `{
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "Become a PULLER Authorized Dealer",
    "url": "https://pullertackle.com/dealers",
    "description": "Apply to become an authorized PULLER dealer for fishing hooks, FLASH STRIKER lures, metal lures and jigs.",
    "isPartOf": {
      "@type": "WebSite",
      "name": "PULLER Co., Ltd.",
      "url": "https://pullertackle.com/"
    },
    "about": {
      "@type": "Organization",
      "name": "PULLER Co., Ltd.",
      "email": "sales@pullertackle.com",
      "logo": "https://pullertackle.com/images/logo.webp"
    }
  }`;

export default async function Page() {
  const regions = await getDealerDirectory();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON_LD }}
      />
      <main id="main">
        <HtmlMain html={BANNER_HTML} />
        <DealerDirectory regions={regions} />
        <HtmlMain html={APPLY_AND_FAQ_HTML} />
      </main>
    </>
  );
}
