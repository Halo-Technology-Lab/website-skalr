import { footer } from '@/lib/content';
import { siteConfig } from '@/lib/site-config';

/**
 * Dark legal footer. The wireframe carries the mandatory lines and a bracketed
 * placeholder for the clinic legal name, registration and privacy policy link,
 * which is item 5 on its outstanding list.
 */
export function SiteFooter() {
  const { legalName, privacyUrl } = siteConfig.clinic;

  return (
    <footer className="bg-ink p-[18px] text-[10px] leading-[1.6] text-[#B8B2AA] md:text-caption lg:px-8 lg:py-10">
      {/* One paragraph, as drawn: the legal lines and the outstanding-details
          placeholder run on together rather than stacking. */}
      <div className="mx-auto max-w-page">
        <p>
          {footer.legal}{' '}
          {legalName && privacyUrl ? (
            <>
              {legalName}.{' '}
              <a
                href={privacyUrl}
                className="underline underline-offset-2 hover:text-white"
              >
                Privacy policy
              </a>
            </>
          ) : (
            <span className="text-[#8E8880]">{footer.placeholder}</span>
          )}
        </p>
      </div>
    </footer>
  );
}
