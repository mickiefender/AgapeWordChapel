"use client";

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { useEffect, useState } from "react";

const links = [
  ["Home", "/"],
  ["Sermons", "/sermons"],
  ["Ministries", "/ministries"],
  ["Events", "/events"],
  ["About us", "/about"],
  ["Give", "/giving"],
  ["Contact", "/contact"],
];

export function MobilePublicNav() {
  const [open, setOpen] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!open) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  function closeMenu() {
    setVisible(false);
    window.setTimeout(() => setOpen(false), 280);
  }

  function toggleMenu() {
    if (open) {
      closeMenu();
      return;
    }
    setOpen(true);
    window.requestAnimationFrame(() => setVisible(true));
  }

  return (
    <>
      <button
        type="button"
        aria-label={open ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={open}
        onClick={toggleMenu}
        className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-foreground transition-colors hover:bg-muted lg:hidden"
      >
        {open ? <X className="h-7 w-7" /> : <Menu className="h-7 w-7" />}
      </button>

      {open && (
        <div className={`fixed inset-0 z-50 flex min-h-screen flex-col bg-background px-6 py-6 transition-all duration-300 ease-out lg:hidden ${visible ? "translate-y-0 opacity-100" : "-translate-y-4 opacity-0"}`}>
          <div className={`flex items-center justify-between transition-all delay-75 duration-300 ${visible ? "translate-y-0 opacity-100" : "-translate-y-3 opacity-0"}`}>
            <span className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">Menu</span>
            <button
              type="button"
              aria-label="Close navigation menu"
              onClick={closeMenu}
              className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-foreground hover:bg-muted"
            >
              <X className="h-8 w-8" />
            </button>
          </div>
          <nav className="mt-16 flex flex-1 flex-col items-center justify-center gap-7">
            {links.map(([label, href], index) => (
              <Link
                key={href}
                href={href}
                onClick={closeMenu}
                style={{ transitionDelay: visible ? `${120 + index * 55}ms` : "0ms" }}
                className={`text-4xl font-semibold tracking-tight text-foreground transition-[transform,opacity,color] duration-500 ease-out hover:text-primary sm:text-5xl ${visible ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"}`}
              >
                {label}
              </Link>
            ))}
          </nav>
          <p className={`pb-4 text-center text-xs uppercase tracking-[0.2em] text-muted-foreground transition-all delay-300 duration-300 ${visible ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"}`}>
            Agape Word Chapel International
          </p>
        </div>
      )}
    </>
  );
}
