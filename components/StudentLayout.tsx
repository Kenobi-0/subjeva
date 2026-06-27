"use client";

import { ChangeEvent, ReactNode, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Caveat, Inter } from "next/font/google";
import BrandLogo from "./BrandLogo";
import ThemeToggle from "./ThemeToggle";
import TotalStudyBadge from "./TotalStudyBadge";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["600", "700"],
});

type StudentLayoutProps = {
  children: ReactNode;
  activePage:
    | "Dashboard"
    | "Subjects"
    | "Main Target"
    | "Focus"
    | "Notes"
    | "Weekly Plan"
    | "Settings";
  topbarTitle?: string;
  topbarSubtitle?: string;
  sidebarTitle?: string;
  sidebarDescription?: string;
  currentTime?: string;
  focusMode?: boolean;
  primaryAction?: {
    label: string;
    href: string;
  };
};

const sidebarItems = [
  {
    name: "Dashboard",
    label: "Panel",
    icon: "⌂",
    href: "/student/dashboard",
  },
  {
    name: "Subjects",
    label: "Konular",
    icon: "📚",
    href: "/student/subjects",
  },
  {
    name: "Main Target",
    label: "Ana Hedef",
    icon: "🎯",
    href: "/student/main-target",
  },
  {
    name: "Focus",
    label: "Odak",
    icon: "⏱",
    href: "/student/focus",
  },
  {
    name: "Notes",
    label: "Notlar",
    icon: "✍️",
    href: "/student/notes",
  },
  {
    name: "Weekly Plan",
    label: "Haftalık Plan",
    icon: "🗓",
    href: "/student/weekly-plan",
  },
  {
    name: "Settings",
    label: "Ayarlar",
    icon: "⚙️",
    href: "/student/settings",
  },
];

export default function StudentLayout({
  children,
  activePage,
  topbarTitle = "Öğrenci Alanı",
  topbarSubtitle = "Subjeva çalışma paneli",
  sidebarTitle = "Bugün bir adım daha.",
  sidebarDescription = "Hedefini gör, haftanı planla ve konularını parça parça tamamla.",
  currentTime,
  focusMode = false,
  primaryAction = {
    label: "Haftalık Plan",
    href: "/student/weekly-plan",
  },
}: StudentLayoutProps) {
  const router = useRouter();

  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [displayName, setDisplayName] = useState("Kenan");
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const userMenuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const demoSession = localStorage.getItem("subjeva-demo-session");

    if (demoSession !== "active") {
      router.replace("/signup");
      return;
    }

    setIsCheckingSession(false);
  }, [router]);

  useEffect(() => {
    function loadProfile() {
      const savedName = localStorage.getItem("subjeva-display-name");
      const savedImage = localStorage.getItem("subjeva-profile-image");

      setDisplayName(savedName || "Kenan");
      setProfileImage(savedImage || null);
    }

    loadProfile();

    window.addEventListener("storage", loadProfile);
    window.addEventListener("subjeva-profile-updated", loadProfile);

    return () => {
      window.removeEventListener("storage", loadProfile);
      window.removeEventListener("subjeva-profile-updated", loadProfile);
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(event.target as Node)
      ) {
        setUserMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);

    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleProfileImageChange(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      const imageData = String(reader.result);

      setProfileImage(imageData);
      localStorage.setItem("subjeva-profile-image", imageData);
    };

    reader.readAsDataURL(file);
  }

  function removeProfileImage() {
    setProfileImage(null);
    localStorage.removeItem("subjeva-profile-image");
  }

  function handleLogout() {
    const confirmed = confirm("Çıkış yapmak istiyor musun?");

    if (!confirmed) return;

    localStorage.removeItem("subjeva-demo-session");
    localStorage.removeItem("subjeva-selected-role");
    localStorage.removeItem("subjeva-demo-email");

    setUserMenuOpen(false);

    router.push("/");
  }

  if (isCheckingSession) {
    return (
      <main
        className={`${inter.className} flex min-h-screen items-center justify-center bg-[#0B1220] text-[#EAF2FF]`}
      >
        <div className="rounded-[34px] border border-[#243044] bg-[#101827] p-8 text-center shadow-2xl shadow-black/30">
          <p
            className={`${caveat.className} text-4xl font-bold text-[#5EEAD4]`}
          >
            Oturum kontrol ediliyor...
          </p>

          <p className="mt-3 text-sm font-semibold text-[#9FB2C8]">
            Subjeva çalışma alanı hazırlanıyor.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main
      className={`${inter.className} min-h-screen ${
        focusMode ? "bg-[#0B1220] text-[#EAF2FF]" : "bg-[#fffaf5] text-slate-950"
      }`}
    >
      <div className="flex min-h-screen">
        <aside
          className={`hidden w-72 border-r px-5 py-6 backdrop-blur-xl lg:block ${
            focusMode
              ? "border-[#243044] bg-[#08111F]"
              : "border-orange-100 bg-white/90"
          }`}
        >
          <div className="mb-10">
            {focusMode ? (
              <a href="/" className="inline-flex items-center">
                <img
                  src="/subjeva-logo-dark.png?v=2"
                  alt="Subjeva logosu"
                  className="h-12 w-[190px] object-contain"
                />
              </a>
            ) : (
              <BrandLogo size="sm" />
            )}
          </div>

          <nav className="space-y-2">
            {sidebarItems.map((item) => {
              const active = item.name === activePage;

              return (
                <a
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold transition ${
                    focusMode
                      ? active
                        ? "bg-[#2DD4BF] text-[#061018] shadow-lg shadow-teal-500/20"
                        : "text-[#9FB2C8] hover:bg-[#101827] hover:text-[#5EEAD4]"
                      : active
                      ? "bg-orange-500 text-white shadow-lg shadow-orange-200"
                      : "text-slate-600 hover:bg-orange-50 hover:text-orange-600"
                  }`}
                >
                  <span className="text-base">{item.icon}</span>
                  {item.label}
                </a>
              );
            })}
          </nav>

          <div
            className={`mt-10 rounded-3xl border p-5 ${
              focusMode
                ? "border-[#243044] bg-[#101827]"
                : "border-orange-100 bg-orange-50/60"
            }`}
          >
            <p
              className={`${caveat.className} text-2xl font-bold ${
                focusMode ? "text-[#5EEAD4]" : "text-orange-600"
              }`}
            >
              {sidebarTitle}
            </p>

            <p
              className={`mt-2 text-sm leading-6 ${
                focusMode ? "text-[#9FB2C8]" : "text-slate-600"
              }`}
            >
              {sidebarDescription}
            </p>
          </div>
        </aside>

        <section className="flex-1">
          <header
            className={`sticky top-0 z-40 border-b px-6 py-4 backdrop-blur-xl ${
              focusMode
                ? "border-[#243044] bg-[#08111F]/95"
                : "border-orange-100 bg-white/85"
            }`}
          >
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
              <div className="lg:hidden">
                {focusMode ? (
                  <a href="/" className="inline-flex items-center">
                    <img
                      src="/subjeva-logo-dark.png?v=2"
                      alt="Subjeva logosu"
                      className="h-12 w-[190px] object-contain"
                    />
                  </a>
                ) : (
                  <BrandLogo size="sm" />
                )}
              </div>

              <div className="hidden lg:block">
                <p
                  className={`text-sm font-semibold ${
                    focusMode ? "text-[#EAF2FF]" : "text-slate-500"
                  }`}
                >
                  {topbarTitle}
                </p>

                <p
                  className={`text-xs ${
                    focusMode ? "text-[#6F8199]" : "text-slate-400"
                  }`}
                >
                  {topbarSubtitle}
                </p>
              </div>

              <div className="flex items-center gap-3">
                {currentTime ? (
                  <div
                    className={`hidden rounded-2xl border px-4 py-2 text-sm font-bold shadow-sm sm:block ${
                      focusMode
                        ? "border-[#243044] bg-[#101827] text-[#EAF2FF]"
                        : "border-orange-100 bg-white text-slate-700"
                    }`}
                  >
                    Saat:{" "}
                    <span
                      className={
                        focusMode ? "text-[#5EEAD4]" : "text-orange-600"
                      }
                    >
                      {currentTime}
                    </span>
                  </div>
                ) : null}

                <TotalStudyBadge focusMode={focusMode} />

                <ThemeToggle focusMode={focusMode} />

                {primaryAction ? (
                  <a
                    href={primaryAction.href}
                    className={`hidden rounded-xl px-4 py-2.5 text-sm font-bold shadow-sm transition sm:inline-flex ${
                      focusMode
                        ? "bg-[#2DD4BF] text-[#061018] hover:bg-[#5EEAD4]"
                        : "bg-orange-500 text-white hover:bg-orange-600"
                    }`}
                  >
                    {primaryAction.label}
                  </a>
                ) : null}

                <div ref={userMenuRef} className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className={`flex items-center gap-3 rounded-2xl border px-2 py-2 shadow-sm transition hover:shadow-md ${
                      focusMode
                        ? "border-[#243044] bg-[#101827] hover:border-[#2DD4BF]"
                        : "border-orange-100 bg-white hover:border-orange-200"
                    }`}
                  >
                    <div
                      className={`flex h-10 w-10 items-center justify-center overflow-hidden rounded-full text-sm font-extrabold ${
                        focusMode
                          ? "bg-[#0B1220] text-[#5EEAD4] ring-1 ring-[#243044]"
                          : "bg-slate-900 text-white"
                      }`}
                    >
                      {profileImage ? (
                        <img
                          src={profileImage}
                          alt="Profil"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        displayName.charAt(0).toUpperCase()
                      )}
                    </div>

                    <div className="hidden pr-2 text-left sm:block">
                      <p
                        className={`text-sm font-extrabold ${
                          focusMode ? "text-[#F8FAFC]" : "text-slate-900"
                        }`}
                      >
                        {displayName}
                      </p>

                      <p
                        className={`text-xs font-semibold ${
                          focusMode ? "text-[#9FB2C8]" : "text-slate-400"
                        }`}
                      >
                        Öğrenci
                      </p>
                    </div>
                  </button>

                  {userMenuOpen ? (
                    <div
                      className={`absolute right-0 mt-3 w-80 overflow-hidden rounded-[28px] border p-4 shadow-2xl ${
                        focusMode
                          ? "border-[#243044] bg-[#101827] shadow-black/40"
                          : "border-orange-100 bg-white shadow-orange-100/70"
                      }`}
                    >
                      <div
                        className={`rounded-[22px] p-4 ${
                          focusMode ? "bg-[#0B1220]" : "bg-orange-50/50"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`flex h-16 w-16 items-center justify-center overflow-hidden rounded-full text-xl font-extrabold ring-4 ${
                              focusMode
                                ? "bg-[#08111F] text-[#5EEAD4] ring-[#101827]"
                                : "bg-slate-900 text-white ring-white"
                            }`}
                          >
                            {profileImage ? (
                              <img
                                src={profileImage}
                                alt="Profil"
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              displayName.charAt(0).toUpperCase()
                            )}
                          </div>

                          <div>
                            <p
                              className={`text-lg font-extrabold ${
                                focusMode ? "text-[#F8FAFC]" : "text-slate-950"
                              }`}
                            >
                              {displayName}
                            </p>

                            <p
                              className={`text-sm font-semibold ${
                                focusMode ? "text-[#9FB2C8]" : "text-slate-500"
                              }`}
                            >
                              Öğrenci Alanı
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 grid gap-2">
                          <label
                            className={`cursor-pointer rounded-2xl px-4 py-3 text-center text-sm font-extrabold shadow-sm transition ${
                              focusMode
                                ? "bg-[#2DD4BF] text-[#061018] hover:bg-[#5EEAD4]"
                                : "bg-orange-500 text-white hover:bg-orange-600"
                            }`}
                          >
                            Profil fotoğrafı ekle
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleProfileImageChange}
                              className="hidden"
                            />
                          </label>

                          {profileImage ? (
                            <button
                              onClick={removeProfileImage}
                              className={`rounded-2xl border px-4 py-3 text-sm font-extrabold transition ${
                                focusMode
                                  ? "border-[#243044] bg-[#101827] text-[#EAF2FF] hover:border-[#2DD4BF] hover:text-[#5EEAD4]"
                                  : "border-orange-100 bg-white text-slate-700 hover:border-orange-200 hover:text-orange-600"
                              }`}
                            >
                              Fotoğrafı kaldır
                            </button>
                          ) : null}
                        </div>
                      </div>

                      <div className="mt-3 space-y-2">
                        <a
                          href="/student/settings"
                          onClick={() => setUserMenuOpen(false)}
                          className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-sm font-extrabold transition ${
                            focusMode
                              ? "border-[#243044] bg-[#0B1220] text-[#EAF2FF] hover:border-[#2DD4BF] hover:text-[#5EEAD4]"
                              : "border-orange-100 bg-white text-slate-700 hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600"
                          }`}
                        >
                          <span>Ayarlar</span>
                          <span>⚙️</span>
                        </a>

                        <button
                          onClick={handleLogout}
                          className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm font-extrabold transition ${
                            focusMode
                              ? "border-[#3D2530] bg-[#190E14] text-rose-300 hover:border-rose-400/40"
                              : "border-orange-100 bg-white text-rose-600 hover:border-rose-200 hover:bg-rose-50"
                          }`}
                        >
                          <span>Çıkış yap</span>
                          <span>↗</span>
                        </button>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </header>

          {children}
        </section>
      </div>
    </main>
  );
}
