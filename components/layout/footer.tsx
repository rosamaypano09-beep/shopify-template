import { cacheLife } from "next/cache";
import { getSiteConfig } from "@/config";
import { NewsletterForm } from "@/components/forms/forms";
import { SiteLink } from "@/components/ui/site-link";
import { formMode } from "@/lib/forms/delivery";
import { logger } from "@/lib/logger";
import { getPolicies } from "@/lib/shopify";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";
import { SocialLinks } from "./social-links";

/** Cached so the year is not recomputed on every render and pages stay static. */
async function getCurrentYear() {
  "use cache";
  cacheLife("days");
  return new Date().getFullYear();
}

export async function Footer() {
  const { store, navigation, theme, features, pages } = getSiteConfig();
  // Policy links come from Shopify (Settings > Policies), plus any set by hand in config.
  let policies = navigation.policies;
  try {
    const fromShopify = (await getPolicies()).map((policy) => ({
      label: policy.title,
      href: `/policies/${policy.handle}`,
    }));
    policies = [...fromShopify.filter((p) => !policies.some((own) => own.href === p.href)), ...policies];
  } catch (error) {
    logger.error("Footer could not load policies", { scope: "footer", error });
  }
  const pageLinks = [
    pages.about.enabled ? { label: "About", href: "/about" } : null,
    pages.faq.enabled ? { label: "FAQ", href: "/faq" } : null,
    pages.contact.enabled ? { label: "Contact", href: "/contact" } : null,
  ].filter((link) => link !== null);
  const showNewsletter = features.newsletter && formMode("newsletter") !== "off";
  const { contact } = store;
  const year = await getCurrentYear();
  const onPrimary = theme.variants.footer === "primary";
  const hasContact = contact.email || contact.phone || contact.address || contact.businessHours?.length;

  return (
    <footer className={cn("mt-auto", onPrimary ? "bg-primary text-primary-foreground" : "bg-surface text-foreground")}>
      <div className="container-site grid gap-x-10 gap-y-12 py-16 md:grid-cols-2 lg:grid-cols-[1.6fr_repeat(3,1fr)] lg:py-20">
        <div className="flex max-w-sm flex-col gap-4">
          <Logo logo={store.brand.footerLogo ?? store.brand.logo} storeName={store.name} />
          <p className="type-body opacity-80">{store.description}</p>
          <SocialLinks social={store.social} className="type-small mt-2 flex flex-wrap gap-x-5" />
          {pageLinks.length ? (
            <ul className="type-small flex flex-wrap gap-x-5">
              {pageLinks.map((link) => (
                <li key={link.href}>
                  <SiteLink href={link.href} className="inline-flex min-h-11 items-center underline-offset-4 hover:underline">
                    {link.label}
                  </SiteLink>
                </li>
              ))}
            </ul>
          ) : null}
          {showNewsletter ? (
            <div className="mt-2">
              <p className="type-small mb-2 font-semibold">Get our monthly email</p>
              <NewsletterForm onDark={onPrimary} />
            </div>
          ) : null}
        </div>

        {navigation.footer.map((group) => (
          <nav key={group.title} aria-label={group.title}>
            <h2 className="type-h4 mb-3">{group.title}</h2>
            <ul>
              {group.links.map((link) => (
                <li key={link.href + link.label}>
                  <SiteLink
                    href={link.href}
                    external={link.external}
                    className="inline-flex min-h-10 items-center opacity-80 underline-offset-4 hover:underline hover:opacity-100"
                  >
                    {link.label}
                  </SiteLink>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        {hasContact ? (
          <div>
            <h2 className="type-h4 mb-3">Contact</h2>
            <address className="flex flex-col gap-2 not-italic opacity-80">
              {contact.email ? (
                <a
                  href={`mailto:${contact.email}`}
                  className="inline-flex min-h-10 items-center self-start underline-offset-4 hover:underline"
                >
                  {contact.email}
                </a>
              ) : null}
              {contact.phone ? (
                <a
                  href={`tel:${contact.phone.replace(/[^+\d]/g, "")}`}
                  className="inline-flex min-h-10 items-center self-start underline-offset-4 hover:underline"
                >
                  {contact.phone}
                </a>
              ) : null}
              {contact.address ? (
                <p>
                  {contact.address.line1}
                  {contact.address.line2 ? <>, {contact.address.line2}</> : null}
                  <br />
                  {[contact.address.city, contact.address.region, contact.address.postalCode]
                    .filter(Boolean)
                    .join(", ")}
                </p>
              ) : null}
              {contact.businessHours?.map((entry) => (
                <p key={entry.days}>
                  {entry.days}
                  <br />
                  {entry.hours}
                </p>
              ))}
            </address>
          </div>
        ) : null}
      </div>

      <div className={cn("border-t", onPrimary ? "border-primary-foreground/20" : "border-border")}>
        <div className="container-site type-small flex flex-col gap-3 py-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="opacity-80">
            © {year} {store.name}
          </p>
          {policies.length ? (
            <ul className="flex flex-wrap gap-x-6">
              {policies.map((link) => (
                <li key={link.href}>
                  <SiteLink
                    href={link.href}
                    external={link.external}
                    className="inline-flex min-h-10 items-center opacity-80 underline-offset-4 hover:underline hover:opacity-100"
                  >
                    {link.label}
                  </SiteLink>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>
    </footer>
  );
}
