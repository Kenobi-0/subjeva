"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Caveat } from "next/font/google";
import StudentLayout from "../../../components/StudentLayout";
import {
  addDbFocusMinutes,
  getDbStudyTotals,
  getDbTotalStudyMinutes,
  updateDbTotalStudyMinutes,
} from "../../../lib/subjevaDb";

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["600", "700"],
});

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(
    2,
    "0"
  )}`;
}

function clampMinutes(value: number) {
  if (Number.isNaN(value)) return 25;

  return Math.min(Math.max(value, 1), 180);
}

export default function FocusPage() {
  const [sessionMinutes, setSessionMinutes] = useState(25);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isRunning, setIsRunning] = useState(false);

  const [todayFocusMinutes, setTodayFocusMinutes] = useState(0);
  const [totalFocusMinutes, setTotalFocusMinutes] = useState(0);

  const [countedMinutesInCurrentRun, setCountedMinutesInCurrentRun] =
    useState(0);

  async function loadFocusStats() {
    try {
      const totals = await getDbStudyTotals();

      setTodayFocusMinutes(totals.todayFocusMinutes);
      setTotalFocusMinutes(totals.totalFocusMinutes);
    } catch (error) {
      alert(
        error instanceof Error
          ? `Odak süreleri yüklenemedi: ${error.message}`
          : "Odak süreleri yüklenemedi."
      );
    }
  }

  useEffect(() => {
    loadFocusStats();

    window.addEventListener("subjeva-study-minutes-updated", loadFocusStats);
    window.addEventListener("subjeva-data-updated", loadFocusStats);

    return () => {
      window.removeEventListener("subjeva-study-minutes-updated", loadFocusStats);
      window.removeEventListener("subjeva-data-updated", loadFocusStats);
    };
  }, []);

  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          return 0;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  const elapsedSeconds = sessionMinutes * 60 - timeLeft;
  const elapsedWholeMinutes = Math.floor(elapsedSeconds / 60);

  useEffect(() => {
    if (!isRunning) return;

    if (elapsedWholeMinutes > countedMinutesInCurrentRun) {
      const diff = elapsedWholeMinutes - countedMinutesInCurrentRun;

      setCountedMinutesInCurrentRun(elapsedWholeMinutes);

      async function saveFocusMinute() {
        try {
          const nextFocusTotals = await addDbFocusMinutes(diff);

          const currentTotalStudyMinutes = await getDbTotalStudyMinutes();
          const nextTotalStudyMinutes = currentTotalStudyMinutes + diff;

          await updateDbTotalStudyMinutes(nextTotalStudyMinutes);

          setTodayFocusMinutes(nextFocusTotals.todayFocusMinutes);
          setTotalFocusMinutes(nextFocusTotals.totalFocusMinutes);

          window.dispatchEvent(new Event("subjeva-study-minutes-updated"));
          window.dispatchEvent(new Event("subjeva-data-updated"));
        } catch (error) {
          alert(
            error instanceof Error
              ? `Odak süresi kaydedilemedi: ${error.message}`
              : "Odak süresi kaydedilemedi."
          );
        }
      }

      saveFocusMinute();
    }
  }, [elapsedWholeMinutes, countedMinutesInCurrentRun, isRunning]);

  function handleStartPause() {
    if (timeLeft === 0) {
      setTimeLeft(sessionMinutes * 60);
      setCountedMinutesInCurrentRun(0);
    }

    setIsRunning((prev) => !prev);
  }

  function handleReset() {
    setIsRunning(false);
    setTimeLeft(sessionMinutes * 60);
    setCountedMinutesInCurrentRun(0);
  }

  function handleSessionMinutesChange(value: number) {
    const nextMinutes = clampMinutes(value);

    setIsRunning(false);
    setSessionMinutes(nextMinutes);
    setTimeLeft(nextMinutes * 60);
    setCountedMinutesInCurrentRun(0);
  }

  const progress = useMemo(() => {
    const total = sessionMinutes * 60;

    if (total === 0) return 0;

    return ((total - timeLeft) / total) * 100;
  }, [sessionMinutes, timeLeft]);

  const ringStyle = {
    background: `conic-gradient(#2DD4BF ${progress}%, #1F2937 ${progress}% 100%)`,
  };

  return (
    <StudentLayout
      activePage="Focus"
      focusMode
      topbarSubtitle="Odak zamanlayıcı · Supabase süre takibi"
      primaryAction={{
        label: "+ Konu Ekle",
        href: "/student/subjects/new",
      }}
      sidebarTitle="Sakin odak modu."
      sidebarDescription="Odak sürelerin artık sadece giriş yaptığın Supabase hesabına kaydedilir."
    >
      <div className="min-h-[calc(100vh-81px)] bg-[#0B1220] px-6 py-10 text-[#EAF2FF]">
        <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
          <div className="absolute left-[18%] top-[12%] h-80 w-80 rounded-full bg-teal-400/10 blur-3xl" />
          <div className="absolute bottom-[8%] right-[14%] h-96 w-96 rounded-full bg-amber-300/10 blur-3xl" />
          <div className="absolute left-[45%] top-[45%] h-72 w-72 rounded-full bg-sky-400/5 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-5xl">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, ease: "easeOut" }}
            className="mb-10 text-center"
          >
            <p
              className={`${caveat.className} text-5xl font-bold text-[#5EEAD4]`}
            >
              Odak zamanlayıcı.
            </p>

            <h1 className="mt-4 text-5xl font-extrabold tracking-tight text-[#F8FAFC] md:text-6xl">
              Sakin ekran. Net zihin.
            </h1>

            <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-[#9FB2C8]">
              Odak süren artık Supabase’e kaydedilir. Bu yüzden her kullanıcı
              sadece kendi odak istatistiklerini görür.
            </p>
          </motion.div>

          <motion.section
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="rounded-[44px] border border-[#243044] bg-[#101827]/95 p-8 shadow-2xl shadow-black/25 backdrop-blur-xl"
          >
            <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.28em] text-[#5EEAD4]">
                  Odak Zamanlayıcı
                </p>

                <h2 className="mt-2 text-3xl font-extrabold text-[#F8FAFC]">
                  Odak Zamanlayıcı
                </h2>
              </div>

              <div className="flex flex-col items-start gap-3 md:items-end">
                <span className="rounded-2xl border border-[#2A3A50] bg-[#0B1220] px-5 py-3 text-sm font-extrabold text-[#5EEAD4] shadow-sm">
                  {sessionMinutes} dakikalık seans
                </span>

                <div className="flex flex-wrap items-center gap-2">
                  <input
                    type="number"
                    min={1}
                    max={180}
                    value={sessionMinutes}
                    onChange={(event) =>
                      handleSessionMinutesChange(Number(event.target.value))
                    }
                    className="w-24 rounded-2xl border border-[#2A3A50] bg-[#0B1220] px-4 py-3 text-center text-sm font-bold text-[#F8FAFC] outline-none transition placeholder:text-[#64748B] focus:border-[#2DD4BF] focus:ring-4 focus:ring-teal-400/10"
                  />

                  <span className="text-sm font-bold text-[#9FB2C8]">
                    dakika
                  </span>
                </div>

                <div className="flex flex-wrap gap-2">
                  {[15, 25, 45, 60].map((minute) => (
                    <button
                      key={minute}
                      type="button"
                      onClick={() => handleSessionMinutesChange(minute)}
                      className={`rounded-full px-3 py-1.5 text-xs font-extrabold transition ${
                        sessionMinutes === minute
                          ? "bg-[#2DD4BF] text-[#061018] shadow-md shadow-teal-500/20"
                          : "border border-[#2A3A50] bg-[#0B1220] text-[#9FB2C8] hover:border-[#2DD4BF] hover:text-[#5EEAD4]"
                      }`}
                    >
                      {minute} dk
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center">
              <div
                style={ringStyle}
                className="relative flex h-[360px] w-[360px] items-center justify-center rounded-full p-6 shadow-[0_0_80px_rgba(45,212,191,0.12)]"
              >
                <div className="absolute inset-0 rounded-full bg-[#2DD4BF]/5 blur-2xl" />

                <div className="relative flex h-full w-full flex-col items-center justify-center rounded-full border border-[#243044] bg-[#08111F] text-[#F8FAFC] shadow-inner shadow-black/40">
                  <div className="text-7xl font-extrabold tracking-tight">
                    {formatTime(timeLeft)}
                  </div>

                  <div
                    className={`mt-4 text-base font-bold uppercase tracking-[0.35em] ${
                      isRunning
                        ? "text-[#5EEAD4]"
                        : timeLeft === 0
                        ? "text-[#FBBF24]"
                        : "text-[#9FB2C8]"
                    }`}
                  >
                    {isRunning
                      ? "ODAK"
                      : timeLeft === 0
                      ? "TAMAM"
                      : "HAZIR"}
                  </div>
                </div>
              </div>

              <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
                <button
                  onClick={handleStartPause}
                  className="rounded-2xl bg-[#2DD4BF] px-10 py-4 text-base font-extrabold text-[#061018] shadow-lg shadow-teal-500/20 transition hover:bg-[#5EEAD4]"
                >
                  {isRunning ? "Seansı Duraklat" : "Seansı Başlat"}
                </button>

                <button
                  onClick={handleReset}
                  className="rounded-2xl border border-[#2A3A50] bg-[#0B1220] px-10 py-4 text-base font-extrabold text-[#EAF2FF] shadow-sm transition hover:border-[#5EEAD4] hover:text-[#5EEAD4]"
                >
                  Sıfırla
                </button>
              </div>

              <div className="mt-10 grid w-full max-w-2xl gap-4 md:grid-cols-2">
                <div className="rounded-[30px] border border-[#243044] bg-[#0B1220] p-6 text-center shadow-sm">
                  <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#9FB2C8]">
                    Bugünkü Odak
                  </p>

                  <p className="mt-4 text-5xl font-extrabold text-[#5EEAD4]">
                    {todayFocusMinutes}
                  </p>

                  <p className="mt-2 text-base font-bold text-[#9FB2C8]">
                    bugün toplam dakika
                  </p>
                </div>

                <div className="rounded-[30px] border border-[#243044] bg-[#0B1220] p-6 text-center shadow-sm">
                  <p className="text-sm font-bold uppercase tracking-[0.24em] text-[#9FB2C8]">
                    Toplam Odak
                  </p>

                  <p className="mt-4 text-5xl font-extrabold text-[#5EEAD4]">
                    {totalFocusMinutes}
                  </p>

                  <p className="mt-2 text-base font-bold text-[#9FB2C8]">
                    toplam dakika
                  </p>
                </div>
              </div>
            </div>
          </motion.section>
        </div>
      </div>
    </StudentLayout>
  );
}
