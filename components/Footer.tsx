import Link from "next/link";
import { SITE } from "@/lib/content";

export default function Footer() {
  return (
    <footer className="border-t border-line/60 bg-paper/60 mt-32">
      <div className="mx-auto grid max-w-wide gap-10 px-6 py-14 sm:grid-cols-2 lg:grid-cols-4 lg:px-10">
        <div className="lg:col-span-2">
          <Link href="/" className="inline-flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/logo.webp"
              alt=""
              width="28"
              height="28"
              className="block h-7 w-7 object-contain dark:hidden"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/logo-dark.webp"
              alt=""
              width="28"
              height="28"
              className="hidden h-7 w-7 object-contain dark:block"
            />
            <span className="font-display text-2xl text-ink">Imitatia</span>
          </Link>
          <p className="mt-4 max-w-md font-serif-body text-sm leading-relaxed text-muted">
            A personal storytelling space where fiction meets reflection.
            Original novels, introspective blogs, and narrative games by Nin Nin.
          </p>
        </div>

        <div>
          <p className="smallcaps text-xs text-ink/60">Read</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/novels/" className="text-ink/85 hover:text-accent">Novels</Link></li>
            <li><Link href="/blog/" className="text-ink/85 hover:text-accent">Blog</Link></li>
            <li><Link href="/reviews/" className="text-ink/85 hover:text-accent">Reviews</Link></li>
            <li><Link href="/games/" className="text-ink/85 hover:text-accent">Games</Link></li>
            <li><Link href="/portfolio/" className="text-ink/85 hover:text-accent">Portfolio</Link></li>
          </ul>
        </div>

        <div>
          <p className="smallcaps text-xs text-ink/60">Elsewhere</p>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <a href="https://ko-fi.com/ninxyami" target="_blank" rel="noreferrer noopener" className="text-ink/85 hover:text-accent">
                Ko-fi
              </a>
            </li>
            <li><Link href="/about/" className="text-ink/85 hover:text-accent">About Nin Nin</Link></li>
            <li>
              <a
                href="/feed.xml"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-ink/85 hover:text-accent"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                  <path d="M4 4v3c8.3 0 15 6.7 15 15h3C22 12.1 13.9 4 4 4zm0 6v3c4.97 0 9 4.03 9 9h3c0-6.6-5.4-12-12-12zm2.5 8.5a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z"/>
                </svg>
                RSS feed
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-line/60">
        <div className="mx-auto flex max-w-wide items-center justify-between px-6 py-6 text-xs text-muted lg:px-10">
          <p>© {new Date().getFullYear()} {SITE.author}. All stories belong to their dreamer.</p>
          <p className="font-display italic">Made with care.</p>
        </div>
      </div>
    </footer>
  );
}
