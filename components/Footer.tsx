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
            <li><Link href="/feed.xml" className="text-ink/85 hover:text-accent">RSS</Link></li>
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
