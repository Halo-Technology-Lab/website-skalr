import { SiteFooter } from '@/components/layout/SiteFooter';
import { SiteHeader } from '@/components/layout/SiteHeader';
import { StickyCtaBar } from '@/components/layout/StickyCtaBar';
import { BeforeAfter } from '@/components/sections/BeforeAfter';
import { CallbackForm } from '@/components/sections/CallbackForm';
import { ClosingBand } from '@/components/sections/ClosingBand';
import { Faq } from '@/components/sections/Faq';
import { Hero } from '@/components/sections/Hero';
import { HowItWorks } from '@/components/sections/HowItWorks';
import { Offer } from '@/components/sections/Offer';
import { Suitability } from '@/components/sections/Suitability';
import { ValueAnchor } from '@/components/sections/ValueAnchor';
import { JsonLd } from '@/components/ui/JsonLd';
import { businessJsonLd, faqJsonLd } from '@/lib/structured-data';

/**
 * The Alteon campaign landing page, in the order the wireframe sets.
 *
 * Every section is a server component and ships no JavaScript. The only client
 * components on the page are the call back form, the click-to-call links and
 * the pixel, which is what keeps this fast on a 4G phone - the wireframe's
 * speed requirement, and a conversion input on paid social rather than a
 * technical detail.
 *
 * Desktop puts the hero and the form side by side above the fold, with the form
 * pinned while the hero scrolls. Everything below runs as full width bands in
 * the same order as mobile.
 */
export default function LandingPage() {
  return (
    <>
      <SiteHeader />

      <main id="main">
        <div className="lg:mx-auto lg:max-w-page lg:px-8 lg:pb-16 lg:pt-14">
          <div className="lg:grid lg:grid-cols-[1.35fr_1fr] lg:items-start lg:gap-12">
            <Hero />
            <CallbackForm />
          </div>
        </div>

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
      <div aria-hidden="true" className="h-[72px] lg:hidden" />
      <StickyCtaBar />

      <JsonLd data={businessJsonLd()} />
      <JsonLd data={faqJsonLd()} />
    </>
  );
}
