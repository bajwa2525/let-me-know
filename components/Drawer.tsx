"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

/** Slide-in panel anchored to the right edge — used for the account/nav
 *  menu. Distinct from Modal (centered, task-focused) since this is a
 *  persistent navigation surface, not a form. */
export default function Drawer({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  // Portals need `document.body`, which doesn't exist during SSR. Branching
  // on `typeof document` directly would render differently between the
  // server pass and the client's hydration pass (a real mismatch); waiting
  // for a post-mount effect instead means both passes agree (render
  // nothing) and the portal only appears after hydration completes.
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    <div
      className={`fixed inset-0 z-[100] transition-[visibility] duration-300 ${
        open ? "visible" : "invisible"
      }`}
    >
      <div
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          open ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />
      <div
        className={`glass absolute right-0 top-0 flex h-full w-full max-w-xs flex-col p-5 transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        style={{
          paddingTop: "calc(1.25rem + env(safe-area-inset-top, 0px))",
        }}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}
