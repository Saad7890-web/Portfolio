import { ThemeToggle } from '@/components/primitives/ThemeToggle';
import { site } from '@/lib/site';

export function SiteHeader() {
  return (
    <header className="border-hairline sticky top-0 z-50 border-b bg-[var(--bg)]/80 backdrop-blur-md">
      <div className="shell flex h-16 items-center justify-between gap-6">
        <a href="#main" className="group flex items-center gap-2.5">
          <span className="bg-accent block size-2 rounded-full" aria-hidden />
          <span className="text-[0.9rem] font-medium tracking-tight">{site.name}</span>
        </a>

        <nav aria-label="Sections" className="hidden items-center gap-7 md:flex" data-print-hide>
          {[
            ['Work', '#work'],
            ['Deep dive', '#deep-dive'],
            ['Stack', '#stack'],
            ['Experience', '#experience'],
            ['Contact', '#contact'],
          ].map(([label, href]) => (
            <a
              key={href}
              href={href}
              className="text-muted hover:text-text text-[0.82rem] transition-colors duration-200"
            >
              {label}
            </a>
          ))}
        </nav>

        <ThemeToggle />
      </div>
    </header>
  );
}
