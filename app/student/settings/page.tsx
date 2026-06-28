"use client";

import { useEffect, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Caveat } from "next/font/google";
import StudentLayout from "../../../components/StudentLayout";
import {
  getDbUserProfile,
  saveDbUserProfile,
} from "../../../lib/subjevaDb";
import { supabase } from "../../../lib/supabaseClient";

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["600", "700"],
});

const scrollReveal = {
  hidden: {
    opacity: 0,
    y: 44,
    scale: 0.98,
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
  },
};

const studyStyles = [
  {
    value: "Balanced",
    label: "Dengeli çalışma",
  },
  {
    value: "Pomodoro focused",
    label: "Pomodoro odaklı",
  },
  {
    value: "Long study blocks",
    label: "Uzun çalışma blokları",
  },
  {
    value: "Light daily review",
    label: "Hafif günlük tekrar",
  },
  {
    value: "Exam sprint",
    label: "Sınav temposu",
  },
];

function getStudyStyleLabel(value: string) {
  return studyStyles.find((style) => style.value === value)?.label || value;
}

export default function SettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [displayName, setDisplayName] = useState("Öğrenci");
  const [dailyFocusGoal, setDailyFocusGoal] = useState(120);
  const [studyStyle, setStudyStyle] = useState("Balanced");
  const [showStudyBadge, setShowStudyBadge] = useState(true);

  const [successMessage, setSuccessMessage] = useState("");

  async function loadSettings() {
    try {
      setIsLoading(true);

      const profile = await getDbUserProfile();
      const { data } = await supabase.auth.getUser();

      const metadataDisplayName =
        typeof data.user?.user_metadata?.display_name === "string"
          ? data.user.user_metadata.display_name
          : "";

      const savedLocalName = localStorage.getItem("subjeva-display-name");

      const nextDisplayName =
        profile.displayName && profile.displayName !== "Öğrenci"
          ? profile.displayName
          : metadataDisplayName || savedLocalName || "Öğrenci";

      setDisplayName(nextDisplayName);
      setDailyFocusGoal(profile.dailyFocusGoal || 120);
      setStudyStyle(profile.studyStyle || "Balanced");
      setShowStudyBadge(profile.showStudyBadge);

      localStorage.setItem("subjeva-display-name", nextDisplayName);
    } catch (error) {
      alert(
        error instanceof Error
          ? `Ayarlar yüklenemedi: ${error.message}`
          : "Ayarlar yüklenemedi."
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadSettings();

    window.addEventListener("subjeva-profile-updated", loadSettings);

    return () => {
      window.removeEventListener("subjeva-profile-updated", loadSettings);
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanDisplayName = displayName.trim();

    if (!cleanDisplayName) {
      alert("Lütfen görünen ad alanını boş bırakma.");
      return;
    }

    if (!dailyFocusGoal || dailyFocusGoal < 15) {
      alert("Günlük odak hedefi en az 15 dakika olmalı.");
      return;
    }

    try {
      setIsSaving(true);

      await saveDbUserProfile({
        displayName: cleanDisplayName,
        dailyFocusGoal,
        studyStyle,
        showStudyBadge,
      });

      const { error } = await supabase.auth.updateUser({
        data: {
          display_name: cleanDisplayName,
        },
      });

      if (error) {
        throw new Error(error.message);
      }

      localStorage.setItem("subjeva-display-name", cleanDisplayName);

      window.dispatchEvent(new Event("subjeva-profile-updated"));
      window.dispatchEvent(new Event("subjeva-data-updated"));

      setSuccessMessage("Profil ayarları Supabase’e kaydedildi ✅");

      setTimeout(() => {
        setSuccessMessage("");
      }, 1800);
    } catch (error) {
      alert(
        error instanceof Error
          ? `Ayarlar kaydedilemedi: ${error.message}`
          : "Ayarlar kaydedilemedi."
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <StudentLayout
      activePage="Settings"
      topbarSubtitle="Ayarlar · Supabase profil"
      primaryAction={{
        label: "Panel",
        href: "/student/dashboard",
      }}
      sidebarTitle="Kendine göre düzenle."
      sidebarDescription="Profil ve çalışma tercihlerin artık giriş yaptığın Supabase hesabına kaydedilir."
    >
      <AnimatePresence>
        {successMessage ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none fixed inset-0 z-[999] flex items-center justify-center bg-orange-500/15 backdrop-blur-[2px]"
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 10 }}
              transition={{ type: "spring", stiffness: 220, damping: 16 }}
              className="rounded-[34px] border border-orange-100 bg-white px-8 py-6 text-center shadow-2xl shadow-orange-200"
            >
              <p className="text-5xl">⚙️</p>

              <p className="mt-3 text-2xl font-extrabold text-orange-600">
                {successMessage}
              </p>

              <p className="mt-2 text-sm font-bold text-slate-500">
                Profil bilgilerin bu hesaba özel güncellendi.
              </p>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="mx-auto max-w-7xl px-6 py-8">
        <motion.div
          variants={scrollReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.35 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="mb-10 text-center"
        >
          <p
            className={`${caveat.className} text-4xl font-bold text-orange-600`}
          >
            Çalışma alanını özelleştir.
          </p>

          <h1 className="mx-auto mt-4 max-w-5xl text-4xl font-extrabold tracking-tight text-slate-950 md:text-6xl">
            Ayarların artık hesabına özel.
          </h1>

          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-slate-600">
            Görünen adın, günlük odak hedefin ve çalışma tarzın Supabase
            profil tablosunda tutulur. Farklı hesaplar birbirinin profil
            ayarlarını görmez.
          </p>
        </motion.div>

        <motion.div
          variants={scrollReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="mb-8 grid gap-4 md:grid-cols-4"
        >
          <div className="rounded-[28px] border border-orange-100 bg-white p-6 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-500">
              Profil
            </p>

            <p className="mt-4 text-4xl font-extrabold text-slate-950">
              {isLoading ? "Yükleniyor..." : displayName || "Kullanıcı"}
            </p>

            <p className="mt-2 text-sm font-medium text-slate-500">
              Ekranda görünen ad
            </p>
          </div>

          <div className="rounded-[28px] border border-orange-100 bg-white p-6 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-500">
              Günlük Hedef
            </p>

            <p className="mt-4 text-4xl font-extrabold text-orange-600">
              {dailyFocusGoal}
            </p>

            <p className="mt-2 text-sm font-medium text-slate-500">
              Günlük hedef dakika
            </p>
          </div>

          <div className="rounded-[28px] border border-orange-100 bg-white p-6 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-500">
              Çalışma Tarzı
            </p>

            <p className="mt-4 text-2xl font-extrabold text-slate-950">
              {getStudyStyleLabel(studyStyle)}
            </p>

            <p className="mt-2 text-sm font-medium text-slate-500">
              Bu hesaba ait tercih
            </p>
          </div>

          <div className="rounded-[28px] border border-orange-100 bg-[radial-gradient(circle_at_top_left,_rgba(251,146,60,0.16),_transparent_35%),linear-gradient(135deg,_#FFFFFF,_#FFF7ED)] p-6 shadow-sm">
            <p
              className={`${caveat.className} text-3xl font-bold text-orange-600`}
            >
              Supabase profil.
            </p>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              Bu ayarlar artık tarayıcıya değil, kullanıcı hesabına kaydedilir.
            </p>
          </div>
        </motion.div>

        <div className="grid gap-6 xl:grid-cols-[1fr_0.9fr]">
          <motion.form
            onSubmit={handleSubmit}
            variants={scrollReveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.18 }}
            transition={{ duration: 0.75, ease: "easeOut" }}
            className="rounded-[34px] border border-orange-100 bg-white p-6 shadow-sm"
          >
            <div className="mb-6">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-500">
                Öğrenci Ayarları
              </p>

              <h2 className="mt-2 text-2xl font-extrabold text-slate-950">
                Profil ve çalışma tercihlerini güncelle.
              </h2>
            </div>

            {isLoading ? (
              <div className="rounded-[28px] border border-dashed border-orange-200 bg-orange-50/40 p-10 text-center">
                <p
                  className={`${caveat.className} text-4xl font-bold text-orange-600`}
                >
                  Ayarlar yükleniyor...
                </p>

                <p className="mt-3 text-sm font-semibold text-slate-500">
                  Bu hesaba ait profil ayarları Supabase’den alınıyor.
                </p>
              </div>
            ) : (
              <>
                <div className="space-y-6">
                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      Görünen Ad
                    </label>

                    <input
                      value={displayName}
                      onChange={(event) => setDisplayName(event.target.value)}
                      type="text"
                      placeholder="Örnek: Kenan"
                      className="w-full rounded-2xl border border-orange-100 bg-orange-50/30 px-4 py-3 text-sm font-semibold outline-none transition placeholder:text-slate-400 focus:border-orange-300 focus:bg-white focus:ring-4 focus:ring-orange-100"
                    />

                    <p className="mt-2 text-xs font-semibold text-slate-500">
                      Bu ad Dashboard, profil menüsü ve üst alanlarda görünür.
                    </p>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-bold text-slate-700">
                        Günlük Odak Hedefi
                      </label>

                      <input
                        value={dailyFocusGoal}
                        onChange={(event) =>
                          setDailyFocusGoal(Number(event.target.value))
                        }
                        type="number"
                        min="15"
                        step="15"
                        className="w-full rounded-2xl border border-orange-100 bg-orange-50/30 px-4 py-3 text-sm font-semibold outline-none transition focus:border-orange-300 focus:bg-white focus:ring-4 focus:ring-orange-100"
                      />

                      <p className="mt-2 text-xs font-semibold text-slate-500">
                        Günlük hedef dakika olarak tutulur.
                      </p>
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-bold text-slate-700">
                        Toplam Çalışma Rozeti
                      </label>

                      <button
                        type="button"
                        onClick={() => setShowStudyBadge(!showStudyBadge)}
                        className={`flex w-full items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm font-extrabold transition ${
                          showStudyBadge
                            ? "border-orange-200 bg-orange-50 text-orange-700"
                            : "border-orange-100 bg-white text-slate-600"
                        }`}
                      >
                        <span>
                          {showStudyBadge ? "Rozet açık" : "Rozet kapalı"}
                        </span>

                        <span className="text-xl">
                          {showStudyBadge ? "✅" : "○"}
                        </span>
                      </button>

                      <p className="mt-2 text-xs font-semibold text-slate-500">
                        Bu tercih Supabase profilinde saklanır.
                      </p>
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-slate-700">
                      Çalışma Tarzı
                    </label>

                    <select
                      value={studyStyle}
                      onChange={(event) => setStudyStyle(event.target.value)}
                      className="w-full rounded-2xl border border-orange-100 bg-orange-50/30 px-4 py-3 text-sm font-bold outline-none transition focus:border-orange-300 focus:bg-white focus:ring-4 focus:ring-orange-100"
                    >
                      {studyStyles.map((style) => (
                        <option key={style.value} value={style.value}>
                          {style.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <motion.button
                    whileHover={{
                      scale: isSaving ? 1 : 1.02,
                      y: isSaving ? 0 : -1,
                    }}
                    whileTap={{ scale: isSaving ? 1 : 0.98 }}
                    type="submit"
                    disabled={isSaving}
                    className={`rounded-2xl px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-200 transition ${
                      isSaving
                        ? "cursor-not-allowed bg-orange-300"
                        : "bg-orange-500 hover:bg-orange-600"
                    }`}
                  >
                    {isSaving ? "Kaydediliyor..." : "Ayarları Kaydet"}
                  </motion.button>

                  <a
                    href="/student/dashboard"
                    className="rounded-2xl border border-orange-100 bg-white px-6 py-3.5 text-center text-sm font-bold text-slate-700 shadow-sm transition hover:border-orange-200 hover:text-orange-600"
                  >
                    Panele Dön
                  </a>
                </div>

                <p className="mt-4 text-sm font-medium leading-6 text-slate-500">
                  Bu ayarlar artık Supabase profil tablosuna kaydedilir.
                </p>
              </>
            )}
          </motion.form>

          <motion.aside
            variants={scrollReveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.18 }}
            transition={{ duration: 0.75, ease: "easeOut" }}
            className="space-y-6"
          >
            <div className="rounded-[34px] border border-orange-100 bg-[radial-gradient(circle_at_top_left,_rgba(251,146,60,0.16),_transparent_35%),linear-gradient(135deg,_#FFFFFF,_#FFF7ED)] p-6 shadow-sm">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-500">
                Mevcut Profil
              </p>

              <div className="mt-5 space-y-3">
                <div className="rounded-2xl border border-orange-100 bg-white p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                    Ad
                  </p>

                  <p className="mt-1 text-xl font-extrabold text-slate-950">
                    {displayName || "Kullanıcı"}
                  </p>
                </div>

                <div className="rounded-2xl border border-orange-100 bg-white p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                    Günlük Odak
                  </p>

                  <p className="mt-1 text-xl font-extrabold text-orange-600">
                    {dailyFocusGoal} dk
                  </p>
                </div>

                <div className="rounded-2xl border border-orange-100 bg-white p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                    Çalışma Tarzı
                  </p>

                  <p className="mt-1 text-xl font-extrabold text-slate-950">
                    {getStudyStyleLabel(studyStyle)}
                  </p>
                </div>

                <div className="rounded-2xl border border-orange-100 bg-white p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                    Rozet
                  </p>

                  <p className="mt-1 text-xl font-extrabold text-slate-950">
                    {showStudyBadge ? "Gösteriliyor" : "Gizli"}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[34px] border border-orange-100 bg-white p-6 shadow-sm">
              <p
                className={`${caveat.className} text-3xl font-bold text-orange-600`}
              >
                Hesaplar ayrıldı.
              </p>

              <p className="mt-3 leading-7 text-slate-600">
                Bir kullanıcı adını veya çalışma hedefini değiştirdiğinde bu
                bilgi sadece kendi Supabase hesabında güncellenir.
              </p>
            </div>

            <div className="rounded-[34px] border border-orange-100 bg-white p-6 shadow-sm">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-500">
                Sıradaki küçük geliştirme
              </p>

              <p className="mt-3 leading-7 text-slate-600">
                Toplam çalışma rozeti ayarını kaydediyoruz. Bir sonraki adımda
                rozetin gerçekten gizlenmesini de bağlayacağız.
              </p>
            </div>
          </motion.aside>
        </div>
      </div>
    </StudentLayout>
  );
}
