"use client";

import Link from "next/link";
import { useState } from "react";
import { ThemeToggle } from "./Theme";

const links = [
  { href: "/novels/",   label: "Novels" },
  { href: "/blog/",     label: "Blog" },
  { href: "/reviews/",  label: "Reviews" },
  { href: "/games/",    label: "Games" },
  { href: "/about/",    label: "About" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-line/60 bg-paper/80 backdrop-blur-md">
      <div className="mx-auto flex max-w-wide items-center justify-between px-6 py-4 lg:px-10">
        <Link href="/" className="group flex items-center gap-2">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-accent transition-transform group-hover:scale-110" />
          <span className="font-display text-2xl tracking-tight text-ink">
            Imitatia
          </span>
        </Link>

        <nav className="hidden items-center gap-7 md:flex">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="relative font-sans text-sm tracking-wide text-ink/85 transition hover:text-accent"
            >
              {l.label}
            </Link>
          ))}
          <ThemeToggle />
        </nav>

        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() => setOpen(!open)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-line/80 text-ink"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
              {open ? (
                <path d="M6 6l12 12M6 18L18 6" />
              ) : (
                <>
                  <path d="M3 6h18" />
                  <path d="M3 12h18" />
                  <path d="M3 18h18" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav className="border-t border-line/60 bg-paper px-6 pb-5 pt-2 md:hidden">
          <ul className="flex flex-col gap-1">
            {links.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-lg px-3 py-2 font-sans text-base text-ink hover:bg-paper-deep"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      )}
    </header>
  );
}
