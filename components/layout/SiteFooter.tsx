import { site } from '@/lib/site';

export function SiteFooter() {
  return (
    <footer className="border-hairline border-t">
      <div className="shell text-muted flex flex-col gap-4 py-10 text-[0.8rem] sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} {site.name}
        </p>
        <ul className="flex items-center gap-6">
          <li>
            <a className="hover:text-text transition-colors" href={site.links.github}>
              GitHub
            </a>
          </li>
          <li>
            <a className="hover:text-text transition-colors" href={site.links.leetcode}>
              LeetCode
            </a>
          </li>
          <li>
            <a className="hover:text-text transition-colors" href={`mailto:${site.links.email}`}>
              Email
            </a>
          </li>
        </ul>
      </div>
    </footer>
  );
}
