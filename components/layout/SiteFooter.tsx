import { footer } from '@/lib/content';
import { siteConfig } from '@/lib/site-config';

/**
 * The legal footer.
 *
 * Sage deep with white text, which measures 6.05:1 - comfortably past AA, and it
 * matters more here than anywhere else on the page because this band is nothing
 * but compliance and legal micro-copy. The type is `micro`, which floors at
 * 12.8px; the previous 10px was too small for text that has to be readable to be
 * doing its job at all.
 *
 * Everything below the first paragraph comes from section 03 of the brand
 * reference, cross-checked against the footer of the client's live site. Note
 * the Harley Street clinic is deliberately absent - this campaign page carries
 * Colindale only.
 */
export function SiteFooter() {
  const { clinic } = siteConfig;

  return (
    <footer className="bg-sage-deep px-[18px] py-8 text-micro leading-[1.6] text-white/90 lg:px-8 lg:py-12">
      <div className="mx-auto flex max-w-page flex-col gap-4">
        <p>{footer.legal}</p>

        <p>
          {clinic.legalName}, trading as {clinic.tradingName}. Registered in England and Wales,
          company number {clinic.companyNumber}. ICO registration {clinic.icoRegistration}.
        </p>

        <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <a href={clinic.privacyUrl} className="underline underline-offset-2 hover:text-white">
            {footer.privacyLabel}
          </a>
          <span aria-hidden="true" className="text-white/50">
            ·
          </span>
          <a href={clinic.termsUrl} className="underline underline-offset-2 hover:text-white">
            {footer.termsLabel}
          </a>
        </p>
      </div>
    </footer>
  );
}
