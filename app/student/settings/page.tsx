"use client";

import { useEffect, useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Caveat } from "next/font/google";
import StudentLayout from "../../../components/StudentLayout";
import {
  getSubjevaUserProfile,
  saveSubjevaUserProfile,
} from "../../../lib/subjevaStorage";

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
  const [displayName, setDisplayName] = useState("Kenan");
  const [mainTarget, setMainTarget] = useState("YKS 2027");
  const [dailyFocusGoal, setDailyFocusGoal] = useState(120);
  const [weeklySubjectLimit, setWeeklySubjectLimit] = useState(8);
  const [studyStyle, setStudyStyle] = useState("Balanced");
  const [dailyReminder, setDailyReminder] = useState(true);
  const [weeklyReview, setWeeklyReview] = useState(true);
  const [motivationalMessages, setMotivationalMessages] = useState(true);
  const [showStudyBadge, setShowStudyBadge] = useState(true);

  useEffect(() => {
    const savedProfile = getSubjevaUserProfile();

    setDisplayName(savedProfile.displayName);
    setDailyFocusGoal(savedProfile.dailyFocusGoal);
    setStudyStyle(savedProfile.studyStyle);
    setShowStudyBadge(savedProfile.showStudyBadge);
  }, []);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanDisplayName = displayName.trim();

    if (!cleanDisplayName) {
      alert("Lütfen kullanıcı adını boş bırakma.");
      return;
    }

    saveSubjevaUserProfile({
      displayName: cleanDisplayName,
      dailyFocusGoal,
      studyStyle,
      showStudyBadge,
    });

    alert("Profil ayarları kaydedildi ✅");
  }

  return (
    <StudentLayout
      activePage="Settings"
      topbarSubtitle="Ayarlar · Profil · Tercihler"
      primaryAction={{
        label: "Panel",
        href: "/student/dashboard",
      }}
      sidebarTitle="Kendine göre düzenle."
      sidebarDescription="Subjeva ayarlarını kendi çalışma düzenine göre şekillendir."
    >
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
            Subjeva’yı kendi düzenine göre ayarla.
          </h1>

          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-slate-600">
            Profil bilgilerini, günlük çalışma hedefini, bildirim tercihlerini
            ve demo sınırlarını buradan düzenle.
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
              {displayName || "Kullanıcı"}
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
              Konu Limiti
            </p>

            <p className="mt-4 text-4xl font-extrabold text-slate-950">
              {weeklySubjectLimit}
            </p>

            <p className="mt-2 text-sm font-medium text-slate-500">
              Demo sürümde aktif konu limiti
            </p>
          </div>

          <div className="rounded-[28px] border border-orange-100 bg-[radial-gradient(circle_at_top_left,_rgba(251,146,60,0.16),_transparent_35%),linear-gradient(135deg,_#FFFFFF,_#FFF7ED)] p-6 shadow-sm">
            <p
              className={`${caveat.className} text-3xl font-bold text-orange-600`}
            >
              Sade ayarlar.
            </p>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              Subjeva ayarları sade kalmalı. Kullanıcıyı yormadan kontrol hissi
              vermeli.
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
                Çalışma tercihlerini güncelle.
              </h2>
            </div>

            <div className="space-y-6">
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Görünen Ad
                </label>

                <input
                  value={displayName}
                  onChange={(event) => setDisplayName(event.target.value)}
                  type="text"
                  placeholder="Kenan"
                  className="w-full rounded-2xl border border-orange-100 bg-orange-50/30 px-4 py-3 text-sm font-semibold outline-none transition placeholder:text-slate-400 focus:border-orange-300 focus:bg-white focus:ring-4 focus:ring-orange-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Ana Hedef
                </label>

                <input
                  value={mainTarget}
                  onChange={(event) => setMainTarget(event.target.value)}
                  type="text"
                  placeholder="YKS 2027"
                  className="w-full rounded-2xl border border-orange-100 bg-orange-50/30 px-4 py-3 text-sm font-semibold outline-none transition placeholder:text-slate-400 focus:border-orange-300 focus:bg-white focus:ring-4 focus:ring-orange-100"
                />

                <p className="mt-2 text-xs font-semibold text-slate-500">
                  Not: Asıl ana hedef sayfası sol menüdeki Ana Hedef bölümünden
                  yönetilir.
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
                    Aktif Konu Limiti
                  </label>

                  <input
                    value={weeklySubjectLimit}
                    onChange={(event) =>
                      setWeeklySubjectLimit(Number(event.target.value))
                    }
                    type="number"
                    min="1"
                    max="8"
                    className="w-full rounded-2xl border border-orange-100 bg-orange-50/30 px-4 py-3 text-sm font-semibold outline-none transition focus:border-orange-300 focus:bg-white focus:ring-4 focus:ring-orange-100"
                  />

                  <p className="mt-2 text-xs font-semibold text-slate-500">
                    Demo sürüm için en fazla 8 konu mantığı korunuyor.
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
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="rounded-2xl bg-orange-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-600"
              >
                Ayarları Kaydet
              </motion.button>

              <a
                href="/student/dashboard"
                className="rounded-2xl border border-orange-100 bg-white px-6 py-3.5 text-center text-sm font-bold text-slate-700 shadow-sm transition hover:border-orange-200 hover:text-orange-600"
              >
                Panele Dön
              </a>
            </div>

            <p className="mt-4 text-sm font-medium leading-6 text-slate-500">
              Demo sürüm: Bu ayarlar şimdilik localStorage içinde tutulur.
              Supabase bağlantısından sonra kalıcı hale gelecek.
            </p>
          </motion.form>

          <motion.aside
            variants={scrollReveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.18 }}
            transition={{ duration: 0.75, ease: "easeOut" }}
            className="space-y-6"
          >
            <div className="rounded-[34px] border border-orange-100 bg-white p-6 shadow-sm">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-500">
                Hatırlatmalar
              </p>

              <div className="mt-5 space-y-3">
                <button
                  type="button"
                  onClick={() => setDailyReminder(!dailyReminder)}
                  className={`flex w-full items-center justify-between rounded-2xl border px-4 py-4 text-left transition ${
                    dailyReminder
                      ? "border-orange-200 bg-orange-50 text-orange-700"
                      : "border-orange-100 bg-white text-slate-600"
                  }`}
                >
                  <div>
                    <p className="font-extrabold">Günlük çalışma hatırlatması</p>
                    <p className="mt-1 text-sm font-medium opacity-75">
                      Her gün çalışmanı hatırlatır.
                    </p>
                  </div>

                  <span className="text-xl">{dailyReminder ? "✅" : "○"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setWeeklyReview(!weeklyReview)}
                  className={`flex w-full items-center justify-between rounded-2xl border px-4 py-4 text-left transition ${
                    weeklyReview
                      ? "border-orange-200 bg-orange-50 text-orange-700"
                      : "border-orange-100 bg-white text-slate-600"
                  }`}
                >
                  <div>
                    <p className="font-extrabold">Haftalık tekrar hatırlatması</p>
                    <p className="mt-1 text-sm font-medium opacity-75">
                      Haftalık tekrar ve planlama hatırlatması.
                    </p>
                  </div>

                  <span className="text-xl">{weeklyReview ? "✅" : "○"}</span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setMotivationalMessages(!motivationalMessages)
                  }
                  className={`flex w-full items-center justify-between rounded-2xl border px-4 py-4 text-left transition ${
                    motivationalMessages
                      ? "border-orange-200 bg-orange-50 text-orange-700"
                      : "border-orange-100 bg-white text-slate-600"
                  }`}
                >
                  <div>
                    <p className="font-extrabold">Motivasyon mesajları</p>
                    <p className="mt-1 text-sm font-medium opacity-75">
                      Küçük motivasyon mesajlarını gösterir.
                    </p>
                  </div>

                  <span className="text-xl">
                    {motivationalMessages ? "✅" : "○"}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowStudyBadge(!showStudyBadge)}
                  className={`flex w-full items-center justify-between rounded-2xl border px-4 py-4 text-left transition ${
                    showStudyBadge
                      ? "border-orange-200 bg-orange-50 text-orange-700"
                      : "border-orange-100 bg-white text-slate-600"
                  }`}
                >
                  <div>
                    <p className="font-extrabold">
                      Toplam çalışma rozetini göster
                    </p>
                    <p className="mt-1 text-sm font-medium opacity-75">
                      Üst bardaki toplam çalışma süresi bilgisini gösterir.
                    </p>
                  </div>

                  <span className="text-xl">{showStudyBadge ? "✅" : "○"}</span>
                </button>
              </div>
            </div>

            <div className="rounded-[34px] border border-orange-100 bg-[radial-gradient(circle_at_top_left,_rgba(251,146,60,0.16),_transparent_35%),linear-gradient(135deg,_#FFFFFF,_#FFF7ED)] p-6 shadow-sm">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-500">
                Mevcut Kurulum
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
                    Ana Hedef
                  </p>
                  <p className="mt-1 text-xl font-extrabold text-slate-950">
                    {mainTarget || "Hedef yok"}
                  </p>
                </div>

                <div className="rounded-2xl border border-orange-100 bg-white p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                    Çalışma Tarzı
                  </p>
                  <p className="mt-1 text-xl font-extrabold text-orange-600">
                    {getStudyStyleLabel(studyStyle)}
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[34px] border border-orange-100 bg-white p-6 shadow-sm">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-500">
                Demo Sınırları
              </p>

              <div className="mt-5 space-y-3">
                <div className="flex items-center justify-between rounded-2xl border border-orange-100 bg-orange-50/40 px-4 py-3">
                  <p className="font-bold text-slate-700">Aktif konular</p>
                  <p className="font-extrabold text-orange-600">En fazla 8</p>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-orange-100 bg-orange-50/40 px-4 py-3">
                  <p className="font-bold text-slate-700">Odak süresi</p>
                  <p className="font-extrabold text-orange-600">
                    1-180 dk seçilebilir
                  </p>
                </div>

                <div className="flex items-center justify-between rounded-2xl border border-orange-100 bg-orange-50/40 px-4 py-3">
                  <p className="font-bold text-slate-700">Depolama</p>
                  <p className="font-extrabold text-orange-600">Yerel demo</p>
                </div>
              </div>
            </div>

            <div className="rounded-[34px] border border-orange-100 bg-white p-6 shadow-sm">
              <p
                className={`${caveat.className} text-3xl font-bold text-orange-600`}
              >
                Ayarlar artık sade.
              </p>

              <p className="mt-3 leading-7 text-slate-600">
                Subjeva ayarları profil, çalışma hedefi, hatırlatmalar ve
                görünüm tercihleri gibi temel kontrolleri sade şekilde sunar.
              </p>
            </div>
          </motion.aside>
        </div>
      </div>
    </StudentLayout>
  );
}
