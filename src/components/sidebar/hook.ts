import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";

export type ThemePreference = "light" | "dark" | "system";

const resolveTheme = (theme: ThemePreference) => {
  if (theme !== "system") {
    return theme;
  }
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

const applyTheme = (theme: ThemePreference) => {
  document.documentElement.classList.toggle(
    "dark",
    resolveTheme(theme) === "dark",
  );
};

export function useSidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [theme, setThemeState] = useState<ThemePreference>("system");

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const preference: ThemePreference =
      savedTheme === "light" || savedTheme === "dark" || savedTheme === "system"
        ? savedTheme
        : "system";

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setThemeState(preference);
    applyTheme(preference);
  }, []);

  useEffect(() => {
    if (theme !== "system") {
      return;
    }

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => applyTheme("system");
    media.addEventListener("change", handleChange);

    return () => media.removeEventListener("change", handleChange);
  }, [theme]);

  const setTheme = (preference: ThemePreference) => {
    setThemeState(preference);
    localStorage.setItem("theme", preference);
    document.cookie = `theme=${preference}; path=/; max-age=31536000; samesite=lax`;
    applyTheme(preference);
  };

  return {
    pathname,
    isOpen,
    setIsOpen,
    theme,
    setTheme,
  };
}
