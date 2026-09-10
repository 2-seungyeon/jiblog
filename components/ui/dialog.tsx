"use client";

import {
  useEffect,
  useId,
  useRef,
  type RefObject,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";

export type DialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children?: ReactNode;
  closeOnBackdrop?: boolean;
  returnFocusRef?: RefObject<HTMLElement | null>;
};

export function Dialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  closeOnBackdrop = true,
  returnFocusRef,
}: DialogProps) {
  const titleId = useId();
  const descriptionId = useId();
  const panelRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) {
      return;
    }

    previousFocusRef.current = document.activeElement as HTMLElement | null;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onOpenChange(false);
      }
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);
    panelRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onOpenChange]);

  useEffect(() => {
    if (open) {
      return;
    }

    const focusTarget =
      returnFocusRef?.current ?? previousFocusRef.current ?? null;
    focusTarget?.focus();
  }, [open, returnFocusRef]);

  if (!open) {
    return null;
  }

  return createPortal(
    <div
      className="ui-dialog-overlay"
      onClick={closeOnBackdrop ? () => onOpenChange(false) : undefined}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
        className="ui-dialog"
        onClick={(event) => event.stopPropagation()}
      >
        <h2 id={titleId} className="ui-dialog-title">
          {title}
        </h2>
        {description ? (
          <p id={descriptionId} className="ui-dialog-description">
            {description}
          </p>
        ) : null}
        {children}
      </div>
    </div>,
    document.body,
  );
}

export function DialogActions({ children }: { children: ReactNode }) {
  return <div className="ui-dialog-actions">{children}</div>;
}
