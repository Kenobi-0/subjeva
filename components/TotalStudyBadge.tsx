"use client";

import { useEffect, useState } from "react";

type TotalStudyBadgeProps = {
  focusMode?: boolean;
};

export default function TotalStudyBadge({
  focusMode = false,
}: TotalStudyBadgeProps) {
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    function loadTotalMinutes() {
      const saved = localStorage.getItem("subjeva-total-study-minutes");
      setTotalMinutes(saved ? Number(saved) : 0);
    }

    function updateThemeState() {
      setIsDark(document.documentElement.classList.contains("dark"));
    }

    loadTotalMinutes();
    updateThemeState();

    const observer = new MutationObserver(updateThemeState);

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    window.addEventListener("storage", loadTotalMinutes);
    window.addEventListener("subjeva-study-minutes-updated", loadTotalMinutes);
    window.addEventListener("subjeva-data-updated", loadTotalMinutes);

    return () => {
      observer.disconnect();
      window.removeEventListener("storage", loadTotalMinutes);
      window.removeEventListener(
        "subjeva-study-minutes-updated",
        loadTotalMinutes
      );
      window.removeEventListener("subjeva-data-updated", loadTotalMinutes);
    };
  }, []);

  if (focusMode) {
    return (
      <div className="hidden items-center rounded-2xl border border-[#243044] bg-[#101827] px-4 py-2.5 text-sm font-extrabold text-[#5EEAD4] shadow-sm transition md:inline-flex">
        Toplam {totalMinutes.toLocaleString("tr-TR")} dk çalıştın!
      </div>
    );
  }

  return (
    <div
      className={`hidden items-center rounded-2xl border px-4 py-2.5 text-sm font-extrabold shadow-sm transition md:inline-flex ${
        isDark
          ? "border-[#343943] bg-[#232730] text-orange-400"
          : "border-orange-100 bg-white text-orange-600"
      }`}
    >
      Toplam {totalMinutes.toLocaleString("tr-TR")} dk çalıştın!
    </div>
  );
}
