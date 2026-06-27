"use client";

import { useEffect, useState } from "react";

type BrandLogoProps = {
  size?: "sm" | "md" | "lg";
  centered?: boolean;
};

export default function BrandLogo({
  size = "md",
  centered = false,
}: BrandLogoProps) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  const sizeClasses = {
    sm: "h-12 w-[190px]",
    md: "h-16 w-[260px]",
    lg: "h-24 w-[390px]",
  };

  useEffect(() => {
    const updateTheme = () => {
      setIsDarkMode(document.documentElement.classList.contains("dark"));
    };

    updateTheme();

    const observer = new MutationObserver(updateTheme);

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <a
      href="/"
      className={`inline-flex items-center ${
        centered ? "justify-center" : ""
      }`}
    >
      <img
        src={
          isDarkMode
            ? "/subjeva-logo-dark.png?v=2"
            : "/subjeva-logo-transparent.png?v=4"
        }
        alt="Subjeva logosu"
        className={`${sizeClasses[size]} object-contain`}
      />
    </a>
  );
}
