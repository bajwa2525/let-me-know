"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Tooltip from "@/components/Tooltip";

export default function Modal({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  // See Drawer.tsx — wait for a post-mount effect rather than branching on
  // `typeof document` directly, so server and client agree during hydration.
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

  if (!open || !mounted) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto px-4 py-10 sm:items-center">
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm animate-[authFieldIn_200ms_ease-out]"
        onClick={onClose}
      />
      <div className="auth-card glass relative w-full max-w-3xl rounded-2xl p-6 sm:p-8">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-lg font-medium">{title}</h2>
          <Tooltip label="Close" side="left">
            <button
              onClick={onClose}
              aria-label="Close"
              className="flex h-8 w-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-(--overlay) hover:text-foreground"
            >
              ✕
            </button>
          </Tooltip>
        </div>
        {children}
      </div>
    </div>,
    document.body
  );
}
