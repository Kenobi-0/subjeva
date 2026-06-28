"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Caveat } from "next/font/google";
import StudentLayout from "../../../components/StudentLayout";
import {
  addDbFocusMinutes,
  getDbStudyTotals,
  getDbTotalStudyMinutes,
  updateDbTotalStudyMinutes,
} from "../../../lib/subjevaDb";
import { supabase } from "../../../lib/supabaseClient";

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["600", "700"],
});

const FOCUS_SESSION_KEY = "subjeva-active-focus-session-v2";

type FocusSession = {
  userId: string;
  sessionMinutes: number;
  startedAt: number | null;
  pausedElapsedSeconds: number;
  countedMinutes: number;
  isRunning: boolean;
};

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

function createEmptySession(userId: string): FocusSession {
  return {
    userId,
    sessionMinutes: 25,
    startedAt: null,
    pausedElapsedSeconds: 0,
    countedMinutes: 0,
    isRunning: false,
  };
}

function readFocusSession(userId: string) {
  try {
    const saved = localStorage.getItem(FOCUS_SESSION_KEY);

    if (!saved) return null;

    const parsed = JSON.parse(saved) as FocusSession;

    if (parsed.userId !== userId) return null;

    return parsed;
  } catch {
    return null;
  }
}

function saveFocusSession(session: FocusSession) {
  localStorage.setItem(FOCUS_SESSION_KEY, JSON.stringify(session));
}

function clearFocusSession() {
  localStorage.removeItem(FOCUS_SESSION_KEY);
}

function getTotalSeconds(session: FocusSession) {
  return session.sessionMinutes * 60;
}

function calculateElapsedSeconds(session: FocusSession) {
  const totalSeconds = getTotalSeconds(session);

  if (!session.isRunning || !session.startedAt) {
    return Math.min(session.pausedElapsedSeconds, totalSeconds);
  }

  const realElapsedSeconds = Math.floor((Date.now() - session.startedAt) / 1000);

  return Math.min(
    session.pausedElapsedSeconds + realElapsedSeconds,
    totalSeconds
  );
}

export default function FocusPage() {
  const sessionRef = useRef<FocusSession | null>(null);
  const isSyncingRef = useRef(false);

  const [session, setSession] = useState<FocusSession | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const [todayFocusMinutes, setTodayFocusMinutes] = useState(0);
  const [totalFocusMinutes, setTotalFocusMinutes] = useState(0);

  function updateSession(nextSession: FocusSession) {
    sessionRef.current = nextSession;
    setSession(nextSession);
    saveFocusSession(nextSession);
  }

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

  async function syncMissingMinutes(nextElapsedSeconds: number) {
    const currentSession = sessionRef.current;

    if (!currentSession) return;
    if (isSyncingRef.current) return;

    const nextWholeMinutes = Math.floor(nextElapsedSeconds / 60);

    if (nextWholeMinutes <= currentSession.countedMinutes) return;

    const diff = nextWholeMinutes - currentSession.countedMinutes;

    try {
      isSyncingRef.current = true;

      const nextFocusTotals = await addDbFocusMinutes(diff);

      const currentTotalStudyMinutes = await getDbTotalStudyMinutes();
      const nextTotalStudyMinutes = currentTotalStudyMinutes + diff;

      await updateDbTotalStudyMinutes(nextTotalStudyMinutes);

      const latestSession = sessionRef.current || currentSession;

      updateSession({
        ...latestSession,
        countedMinutes: nextWholeMinutes,
      });

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
    } finally {
      isSyncingRef.current = false;
    }
  }

  function refreshFromRealClock() {
    const currentSession = sessionRef.current;

    if (!currentSession) return;

    const nextElapsedSeconds = calculateElapsedSeconds(currentSession);
    const totalSeconds = getTotalSeconds(currentSession);

    setElapsedSeconds(nextElapsedSeconds);

    syncMissingMinutes(nextElapsedSeconds);

    if (currentSession.isRunning && nextElapsedSeconds >= totalSeconds) {
      updateSession({
        ...currentSession,
        startedAt: null,
        pausedElapsedSeconds: totalSeconds,
        isRunning: false,
      });
    }
  }

  useEffect(() => {
    async function initializeFocusPage() {
      const { data, error } = await supabase.auth.getUser();

      if (error || !data.user) {
        alert("Oturum bulunamadı. Lütfen tekrar giriş yap.");
        return;
      }

      await loadFocusStats();

      const userId = data.user.id;
      const savedSession = readFocusSession(userId);
      const initialSession = savedSession || createEmptySession(userId);

      sessionRef.current = initialSession;
      setSession(initialSession);

      const nextElapsedSeconds = calculateElapsedSeconds(initialSession);
      const totalSeconds = getTotalSeconds(initialSession);

      setElapsedSeconds(nextElapsedSeconds);

      if (initialSession.isRunning && nextElapsedSeconds >= totalSeconds) {
        updateSession({
          ...initialSession,
          startedAt: null,
          pausedElapsedSeconds: totalSeconds,
          isRunning: false,
        });
      }

      await syncMissingMinutes(nextElapsedSeconds);
    }

    initializeFocusPage();

    window.addEventListener("subjeva-study-minutes-updated", loadFocusStats);
    window.addEventListener("subjeva-data-updated", loadFocusStats);

    return () => {
      window.removeEventListener("subjeva-study-minutes-updated", loadFocusStats);
      window.removeEventListener("subjeva-data-updated", loadFocusStats);
    };
  }, []);

  useEffect(() => {
    if (!session?.isRunning) return;

    refreshFromRealClock();

    const interval = setInterval(refreshFromRealClock, 1000);

    window.addEventListener("focus", refreshFromRealClock);
    window.addEventListener("pageshow", refreshFromRealClock);
    document.addEventListener("visibilitychange", refreshFromRealClock);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", refreshFromRealClock);
      window.removeEventListener("pageshow", refreshFromRealClock);
      document.removeEventListener("visibilitychange", refreshFromRealClock);
    };
  }, [session?.isRunning]);

  function handleStartPause() {
    const currentSession = sessionRef.current;

    if (!currentSession) {
      alert("Oturum bulunamadı. Lütfen tekrar giriş yap.");
      return;
    }

    const currentElapsedSeconds = calculateElapsedSeconds(currentSession);
    const totalSeconds = getTotalSeconds(currentSession);

    setElapsedSeconds(currentElapsedSeconds);

    if (currentSession.isRunning) {
      updateSession({
        ...currentSession,
        startedAt: null,
        pausedElapsedSeconds: currentElapsedSeconds,
        isRunning: false,
      });

      return;
    }

    const shouldStartNewSession = currentElapsedSeconds >= totalSeconds;

    const nextSession: FocusSession = {
      ...currentSession,
      startedAt: Date.now(),
      pausedElapsedSeconds: shouldStartNewSession ? 0 : currentElapsedSeconds,
      countedMinutes: shouldStartNewSession ? 0 : currentSession.countedMinutes,
      isRunning: true,
    };

    setElapsedSeconds(shouldStartNewSession ? 0 : currentElapsedSeconds);
    updateSession(nextSession);
  }

  function handleReset() {
    const currentSession = sessionRef.current;

    if (!currentSession) return;

    const nextSession: FocusSession = {
      ...currentSession,
      startedAt: null,
      pausedElapsedSeconds: 0,
      countedMinutes: 0,
      isRunning: false,
    };

    setElapsedSeconds(0);
    updateSession(nextSession);
    clearFocusSession();
    sessionRef.current = nextSession;
    setSession(nextSession);
  }

  function handleSessionMinutesChange(value: number) {
    const currentSession = sessionRef.current;

    if (!currentSession) return;

    const nextMinutes = clampMinutes(value);

    const nextSession: FocusSession = {
      ...currentSession,
      sessionMinutes: nextMinutes,
      startedAt: null,
      pausedElapsedSeconds: 0,
      countedMinutes: 0,
      isRunning: false,
    };

    setElapsedSeconds(0);
    updateSession(nextSession);
  }

  const sessionMinutes = session?.sessionMinutes || 25;
  const isRunning = Boolean(session?.isRunning);

  const timeLeft = Math.max(sessionMinutes * 60 - elapsedSeconds, 0);

  const progress = useMemo(() => {
    const total = sessionMinutes * 60;

    if (total === 0) return 0;

    return (elapsedSeconds / total) * 100;
  }, [sessionMinutes, elapsedSeconds]);

  const ringStyle = {
    background: `conic-gradient(#2DD4BF ${progress}%, #1F2937 ${progress}% 100%)`,
  };

  return (
    <StudentLayout
      activePage="Focus"
      focusMode
      topbarSubtitle="Odak zamanlayıcı · gerçek zaman takibi"
      primaryAction={{
        label: "+ Konu Ekle",
        href: "/student/subjects/new",
      }}
      sidebarTitle="Sakin odak modu."
      sidebarDescription="Sayaç artık gerçek başlangıç saatine göre çalışır. Sekme arka planda kalsa bile süre hesaplanır."
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
              Seansı başlattıktan sonra başka sekmeye geçsen bile Subjeva geçen
              gerçek süreyi hesaplar ve odak dakikalarını hesabına ekler.
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
                  Gerçek zamanlı sayaç
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
