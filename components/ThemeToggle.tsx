"use client";

import { useEffect, useState } from "react";

type ThemeToggleProps = {
  focusMode?: boolean;
};

export default function ThemeToggle({ focusMode = false }: ThemeToggleProps) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("subjeva-theme");

    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
      setIsDark(true);
    }

    if (savedTheme === "light") {
      document.documentElement.classList.remove("dark");
      setIsDark(false);
    }
  }, []);

  function toggleTheme() {
    const nextTheme = !isDark;

    setIsDark(nextTheme);

    if (nextTheme) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("subjeva-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("subjeva-theme", "light");
    }
  }

  return (
    <button
      onClick={toggleTheme}
      className={
        focusMode
          ? "flex h-12 w-12 items-center justify-center rounded-2xl border border-[#243044] bg-[#101827] text-xl font-bold text-[#5EEAD4] shadow-sm transition hover:border-[#2DD4BF] hover:bg-[#0B1220]"
          : "flex h-12 w-12 items-center justify-center rounded-2xl border border-orange-100 bg-white text-xl font-bold text-slate-700 shadow-sm transition hover:border-orange-200 hover:text-orange-600 dark:border-[#343943] dark:bg-[#232730] dark:text-orange-400 dark:hover:bg-[#2a2f38]"
      }
      title="Tema değiştir"
    >
      {isDark ? "☀️" : "🌙"}
    </button>
  );
}
