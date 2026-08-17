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
    <footer className="bg-ink px-[18px] py-5 text-[10px] leading-relaxed text-[#B8B2AA] lg:px-8 lg:py-10 md:text-caption">
      <div className="mx-auto max-w-page space-y-2">
        <p>{footer.legal}</p>
        {legalName && privacyUrl ? (
          <p>
            {legalName}.{' '}
            <a href={privacyUrl} className="underline underline-offset-2 hover:text-white">
              Privacy policy
            </a>
          </p>
        ) : (
          <p className="text-[#8E8880]">{footer.placeholder}</p>
        )}
      </div>
    </footer>
  );
}
