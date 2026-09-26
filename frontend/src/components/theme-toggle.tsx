'use client'

import { useTheme } from "next-themes"

export const ThemeToggle = () => {
    const { theme, setTheme } = useTheme();

    return (
        <button
            type="button"
            aria-label="Toggle theme"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="rounded-md border border-foreground/20 px-3 py-2 text-sm text-foreground transition-colors hover:bg-foreground/5"
        >
            <span className="dark:hidden">🌙 Dark</span>
            <span className="hidden dark:inline">☀️ Light</span>
        </button>
    );
}