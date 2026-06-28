"use client";

import { useEffect, useState } from "react";
import { getDbTotalStudyMinutes, getDbUserProfile } from "../lib/subjevaDb";

type TotalStudyBadgeProps = {
  focusMode?: boolean;
};

export default function TotalStudyBadge({
  focusMode = false,
}: TotalStudyBadgeProps) {
  const [totalMinutes, setTotalMinutes] = useState(0);
  const [isDark, setIsDark] = useState(false);
  const [showStudyBadge, setShowStudyBadge] = useState(true);

  useEffect(() => {
    async function loadBadgeData() {
      try {
        const [savedTotalMinutes, profile] = await Promise.all([
          getDbTotalStudyMinutes(),
          getDbUserProfile(),
        ]);

        setTotalMinutes(savedTotalMinutes);
        setShowStudyBadge(profile.showStudyBadge);
      } catch {
        const localTotal = localStorage.getItem("subjeva-total-study-minutes");
        setTotalMinutes(localTotal ? Number(localTotal) : 0);
        setShowStudyBadge(true);
      }
    }

    function updateThemeState() {
      setIsDark(document.documentElement.classList.contains("dark"));
    }

    loadBadgeData();
    updateThemeState();

    const observer = new MutationObserver(updateThemeState);

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    window.addEventListener("storage", loadBadgeData);
    window.addEventListener("subjeva-study-minutes-updated", loadBadgeData);
    window.addEventListener("subjeva-data-updated", loadBadgeData);
    window.addEventListener("subjeva-profile-updated", loadBadgeData);

    return () => {
      observer.disconnect();
      window.removeEventListener("storage", loadBadgeData);
      window.removeEventListener("subjeva-study-minutes-updated", loadBadgeData);
      window.removeEventListener("subjeva-data-updated", loadBadgeData);
      window.removeEventListener("subjeva-profile-updated", loadBadgeData);
    };
  }, []);

  if (!showStudyBadge) {
    return null;
  }

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
