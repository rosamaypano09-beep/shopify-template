import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getSiteConfig } from "@/config";
import { ContactForm } from "@/components/forms/forms";
import { SocialLinks } from "@/components/layout/social-links";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { formMode } from "@/lib/forms/delivery";
import { pageMetadata } from "@/lib/seo";

export function generateMetadata(): Metadata {
  const { contact } = getSiteConfig().pages;
  return pageMetadata({ title: contact.title, description: contact.intro, path: "/contact" });
}

export default function ContactPage() {
  const { pages, store } = getSiteConfig();
  const { contact } = pages;
  if (!contact.enabled) notFound();
  const details = store.contact;
  const showForm = formMode("contact") !== "off";
  const mapUrl = contact.mapEmbedUrl?.startsWith("https://www.google.com/maps/embed") ? contact.mapEmbedUrl : null;

  return (
    <div className="container-site py-10 sm:py-14">
      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: "Contact", href: "/contact" },
        ]}
      />
      <header className="mt-4 mb-10 flex max-w-[52rem] flex-col gap-4 sm:mb-14">
        <h1 className="type-h1">{contact.title}</h1>
        {contact.intro ? <p className="type-body-lg text-muted">{contact.intro}</p> : null}
      </header>

      <div className="grid gap-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:gap-20">
        {showForm ? (
          <ContactForm />
        ) : details.email ? (
          <p className="type-body-lg">
            Email us at{" "}
            <a href={`mailto:${details.email}`} className="font-semibold underline underline-offset-4">
              {details.email}
            </a>
            .
          </p>
        ) : null}

        <address className="flex flex-col gap-6 not-italic">
          {details.email ? (
            <div>
              <h2 className="type-h4 mb-1">Email</h2>
              <a href={`mailto:${details.email}`} className="inline-flex min-h-10 items-center underline underline-offset-4">
                {details.email}
              </a>
            </div>
          ) : null}
          {details.phone ? (
            <div>
              <h2 className="type-h4 mb-1">Phone</h2>
              <a
                href={`tel:${details.phone.replace(/[^+\d]/g, "")}`}
                className="inline-flex min-h-10 items-center underline underline-offset-4"
              >
                {details.phone}
              </a>
            </div>
          ) : null}
          {details.address ? (
            <div>
              <h2 className="type-h4 mb-1">Address</h2>
              <p>
                {details.address.line1}
                {details.address.line2 ? <>, {details.address.line2}</> : null}
                <br />
                {[details.address.city, details.address.region, details.address.postalCode].filter(Boolean).join(", ")}
                <br />
                {details.address.country}
              </p>
              {contact.directionsUrl ? (
                <a
                  href={contact.directionsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-10 items-center font-semibold underline underline-offset-4"
                >
                  Get directions
                </a>
              ) : null}
            </div>
          ) : null}
          {details.businessHours?.length ? (
            <div>
              <h2 className="type-h4 mb-1">Hours</h2>
              {details.businessHours.map((entry) => (
                <p key={entry.days}>
                  {entry.days}: {entry.hours}
                </p>
              ))}
            </div>
          ) : null}
          <SocialLinks social={store.social} className="flex flex-wrap gap-x-5" />
        </address>
      </div>

      {mapUrl ? (
        <iframe
          src={mapUrl}
          title={`Map showing ${store.name}`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          className="mt-section aspect-[16/9] w-full rounded-lg border-0 max-sm:aspect-square"
        />
      ) : null}
    </div>
  );
}
