"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { MoreHorizontal } from "lucide-react";

export interface ActionMenuItem {
  label: string;
  onSelect: () => void;
  destructive?: boolean;
  disabled?: boolean;
}

interface ActionMenuProps {
  actions: ActionMenuItem[];
  ariaLabel: string;
}

export const ActionMenu = ({ actions, ariaLabel }: ActionMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const menuRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const updateMenuPosition = () => {
    const trigger = triggerRef.current;
    if (!trigger) {
      return;
    }

    const rect = trigger.getBoundingClientRect();
    const width = 160;
    setMenuPosition({
      top: rect.bottom + 4,
      left: Math.max(
        8,
        Math.min(rect.right - width, window.innerWidth - width - 8),
      ),
    });
  };

  useEffect(() => {
    const closeOnOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        !menuRef.current?.contains(target) &&
        !triggerRef.current?.contains(target)
      ) {
        setIsOpen(false);
      }
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    updateMenuPosition();
    window.addEventListener("resize", updateMenuPosition);
    window.addEventListener("scroll", updateMenuPosition, true);
    return () => {
      window.removeEventListener("resize", updateMenuPosition);
      window.removeEventListener("scroll", updateMenuPosition, true);
    };
  }, [isOpen]);

  if (!actions.length) {
    return null;
  }

  return (
    <div className="inline-block text-left">
      <button
        ref={triggerRef}
        type="button"
        aria-label={ariaLabel}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
        className="p-2 text-zinc-500 dark:text-zinc-400"
      >
        <MoreHorizontal className="h-5 w-5" />
      </button>
      {isOpen &&
        typeof document !== "undefined" &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            className="app-surface app-shadow-menu fixed z-[110] min-w-40 border border-zinc-200 p-1 dark:border-zinc-800"
            style={menuPosition}
          >
            {actions.map((action) => (
              <button
                key={action.label}
                type="button"
                role="menuitem"
                disabled={action.disabled}
                onClick={() => {
                  setIsOpen(false);
                  action.onSelect();
                }}
                className={`flex w-full items-center px-3 py-2.5 text-left text-sm font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${action.destructive ? "text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/20" : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-200 dark:hover:bg-black"}`}
              >
                {action.label}
              </button>
            ))}
          </div>,
          document.body,
        )}
    </div>
  );
};
