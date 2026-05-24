import Link from "next/link";
import WhoItsFor from "./_WhoItsFor";
import LandingPricing from "./_LandingPricing";

export default function LandingPage() {
  return (
    <main>
      {/* Hero */}
      <section className="max-w-4xl mx-auto px-6 pt-24 pb-20 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-text-primary leading-tight tracking-tight">
          Stop typing.
          <br />
          Start processing.
        </h1>
        <p className="mt-6 text-text-muted text-lg leading-relaxed max-w-2xl mx-auto">
          Upload your client documents. Get a structured Excel file in under 2
          minutes. ₹199/month. First 15 clients free.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/login"
            className="bg-accent hover:bg-blue-700 text-white px-8 py-3 rounded-lg text-sm font-semibold transition-colors"
          >
            Start Free — No card needed
          </Link>
          <span className="text-text-muted text-sm font-mono">
            15 applicants free · No setup required
          </span>
        </div>

        {/* Social proof strip */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-8">
          {[
            { value: "10×", label: "faster than manual entry" },
            { value: "2 min", label: "average processing time" },
            { value: "8+", label: "document types supported" },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <p className="text-text-primary text-2xl font-bold font-mono">
                {stat.value}
              </p>
              <p className="text-text-muted text-xs font-mono mt-0.5">
                {stat.label}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border bg-card">
        <div className="max-w-4xl mx-auto px-6 py-20">
          <p className="text-text-muted text-xs font-mono uppercase tracking-widest text-center mb-3">
            How it works
          </p>
          <h2 className="text-text-primary text-2xl sm:text-3xl font-bold text-center mb-14">
            Three steps. Done.
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Upload documents",
                body: "Drag and drop Aadhaar, PAN, passports, bank statements — any mix, any order. We sort them automatically.",
              },
              {
                step: "02",
                title: "We extract the data",
                body: "Our AI reads every field from every document. Name, DOB, address, account number — all of it, instantly.",
              },
              {
                step: "03",
                title: "Download your Excel",
                body: "One clean spreadsheet per applicant, ready to paste into your workflow. No cleanup needed.",
              },
            ].map((item) => (
              <div key={item.step} className="flex flex-col gap-3">
                <span className="text-accent text-xs font-mono font-bold">
                  {item.step}
                </span>
                <h3 className="text-text-primary font-semibold">{item.title}</h3>
                <p className="text-text-muted text-sm leading-relaxed">
                  {item.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Who it's for */}
      <section className="max-w-4xl mx-auto px-6 py-20">
        <p className="text-text-muted text-xs font-mono uppercase tracking-widest text-center mb-3">
          Who it&apos;s for
        </p>
        <h2 className="text-text-primary text-2xl sm:text-3xl font-bold text-center mb-10">
          Built for document-heavy businesses
        </h2>
        <WhoItsFor />
      </section>

      {/* Pricing */}
      <section className="border-t border-border bg-card">
        <div className="max-w-5xl mx-auto px-6 py-20">
          <p className="text-text-muted text-xs font-mono uppercase tracking-widest text-center mb-3">
            Pricing
          </p>
          <h2 className="text-text-primary text-2xl sm:text-3xl font-bold text-center mb-10">
            Simple, transparent pricing
          </h2>
          <LandingPricing />
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border">
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-text-muted text-sm font-mono">
            Docflow by{" "}
            <a
              href="https://relentlessais.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-primary hover:text-accent transition-colors"
            >
              Relentless AIS
            </a>
          </p>
          <div className="flex items-center gap-6 text-sm font-mono text-text-muted">
            <a
              href="https://relentlessais.com"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-text-primary transition-colors"
            >
              relentlessais.com
            </a>
            <a
              href="mailto:admin@relentlessais.com"
              className="hover:text-text-primary transition-colors"
            >
              admin@relentlessais.com
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
