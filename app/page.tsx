import { HeaderScrollState } from '@/components/layout/HeaderScrollState';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { StickyCtaBar } from '@/components/layout/StickyCtaBar';
import { BeforeAfter } from '@/components/sections/BeforeAfter';
import { BrandHero, HERO_SENTINEL } from '@/components/sections/BrandHero';
import { ClosingBand } from '@/components/sections/ClosingBand';
import { Faq } from '@/components/sections/Faq';
import { HowItWorks } from '@/components/sections/HowItWorks';
import { Offer } from '@/components/sections/Offer';
import { Practitioner } from '@/components/sections/Practitioner';
import { Suitability } from '@/components/sections/Suitability';
import { ValueAnchor } from '@/components/sections/ValueAnchor';
import { BrandSprite } from '@/components/ui/BrandMark';
import { JsonLd } from '@/components/ui/JsonLd';
import { businessJsonLd, faqJsonLd } from '@/lib/structured-data';

/**
 * The Hannah London campaign landing page.
 *
 * Section order follows the wireframe, with one addition: the practitioner band
 * sits directly after the hero, which is where the client's own home page puts
 * it and where it does the most work - a named clinician immediately after the
 * first claim.
 *
 * Almost every section is a server component and ships no JavaScript. The client
 * components are the call back form, the two video controls, the click-to-call
 * links, the toasts, the header scroll state and the pixel. That restraint is
 * the wireframe's speed requirement, and a conversion input on paid social
 * rather than a technical nicety.
 *
 * Desktop puts the brand film, the headline and the form together in the fold.
 * Everything below runs as full width bands in the same order as mobile.
 */
export default function LandingPage() {
  return (
    <>
      {/* Rendered before anything that <use>s it. Only the marks the page
          actually draws: the lockup, now shared by the header, and the
          practitioner signature. The horizontal wordmark is still generated -
          it is the client's own file - but nothing consumes it since the header
          took the lockup, and the sprite is inlined, so leaving it in would put
          ~1KB of unused path data in every response. The crest lockup and crest
          icon are traced for the favicons and never drawn in the document. */}
      <BrandSprite marks={['lockup', 'signature']} />

      <SiteHeader />
      <HeaderScrollState sentinelId={HERO_SENTINEL} />

      <main id="main">
        <BrandHero />
        <Practitioner />
        <ValueAnchor />
        <Offer />
        <HowItWorks />
        <BeforeAfter />
        <Suitability />
        <Faq />
        <ClosingBand />
      </main>

      <SiteFooter />

      {/* Keeps the sticky bar from covering the last of the footer on mobile. */}
      <div aria-hidden="true" className="h-[86px] lg:hidden" />
      <StickyCtaBar />

      <JsonLd data={businessJsonLd()} />
      <JsonLd data={faqJsonLd()} />
    </>
  );
}
