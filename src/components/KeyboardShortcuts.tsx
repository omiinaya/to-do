"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

export function KeyboardShortcuts() {
  const router = useRouter();

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;
      if (!mod) return;

      // Don't intercept if user is typing in an input
      const tag = (e.target as HTMLElement).tagName;
      const isInput = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT";

      if (e.key === "n" || e.key === "N") {
        e.preventDefault();
        if (window.location.pathname !== "/") {
          router.push("/");
        }
        setTimeout(() => {
          const el = document.getElementById(
            "quick-add-thing",
          ) as HTMLInputElement;
          el?.focus();
        }, 100);
      }

      if (e.key === "k" || e.key === "K") {
        if (isInput) return;
        e.preventDefault();
        const el = document.getElementById("global-search") as HTMLInputElement;
        el?.focus();
      }

      if (e.key === "b" || e.key === "B") {
        e.preventDefault();
        const sidebar = document.getElementById("mobile-sidebar");
        sidebar?.classList.toggle("hidden");
      }
    },
    [router],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return null;
}
