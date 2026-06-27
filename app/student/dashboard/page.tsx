"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Caveat } from "next/font/google";
import StudentLayout from "../../../components/StudentLayout";
import {
  calculateSubjectProgress,
  getSubjevaLessons,
  getSubjevaMainTarget,
  getSubjevaSubjectMinutes,
  getSubjevaSubjects,
  type SubjevaLesson,
  type SubjevaMainTarget,
  type SubjevaSubject,
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

const subjectThemes = [
  {
    color: "bg-orange-500",
    soft: "bg-orange-50",
    text: "text-orange-700",
  },
  {
    color: "bg-sky-500",
    soft: "bg-sky-50",
    text: "text-sky-700",
  },
  {
    color: "bg-emerald-500",
    soft: "bg-emerald-50",
    text: "text-emerald-700",
  },
  {
    color: "bg-amber-500",
    soft: "bg-amber-50",
    text: "text-amber-700",
  },
  {
    color: "bg-purple-500",
    soft: "bg-purple-50",
    text: "text-purple-700",
  },
  {
    color: "bg-rose-500",
    soft: "bg-rose-50",
    text: "text-rose-700",
  },
];

function getSubjectTheme(index: number) {
  return subjectThemes[index % subjectThemes.length];
}

function getCountdown(target: SubjevaMainTarget | null) {
  if (!target) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
    };
  }

  const now = new Date();
  const targetDate = new Date(`${target.date}T${target.time || "10:00"}:00`);
  const diff = targetDate.getTime() - now.getTime();

  if (diff <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
    };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);

  return {
    days,
    hours,
    minutes,
  };
}

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function addDays(date: Date, amount: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + amount);

  return nextDate;
}

function getLessonsForDate(lessons: SubjevaLesson[], dateKey: string) {
  return lessons.filter((lesson) => {
    return lesson.dates?.includes(dateKey) && !lesson.completed;
  });
}

export default function StudentDashboardPage() {
  const [lessons, setLessons] = useState<SubjevaLesson[]>([]);
  const [currentTime, setCurrentTime] = useState("");
  const [displayName, setDisplayName] = useState("Kenan");
  const [subjects, setSubjects] = useState<SubjevaSubject[]>([]);
  const [mainTarget, setMainTarget] = useState<SubjevaMainTarget | null>(null);
  const [subjectMinutes, setSubjectMinutes] = useState<Record<string, number>>(
    {}
  );

  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
  });

  useEffect(() => {
    function loadProfileName() {
      const savedName = localStorage.getItem("subjeva-display-name");
      setDisplayName(savedName || "Kenan");
    }

    loadProfileName();

    window.addEventListener("storage", loadProfileName);
    window.addEventListener("subjeva-profile-updated", loadProfileName);

    return () => {
      window.removeEventListener("storage", loadProfileName);
      window.removeEventListener("subjeva-profile-updated", loadProfileName);
    };
  }, []);

  useEffect(() => {
    function loadDashboardData() {
      const savedSubjects = getSubjevaSubjects();
      const savedTarget = getSubjevaMainTarget();
      const savedLessons = getSubjevaLessons();

      const nextSubjectMinutes: Record<string, number> = {};

      savedSubjects.forEach((subject) => {
        nextSubjectMinutes[subject.slug] = getSubjevaSubjectMinutes(
          subject.slug
        );
      });

      setSubjects(savedSubjects);
      setMainTarget(savedTarget);
      setLessons(savedLessons);
      setSubjectMinutes(nextSubjectMinutes);
      setCountdown(getCountdown(savedTarget));
    }

    loadDashboardData();

    window.addEventListener("storage", loadDashboardData);
    window.addEventListener("subjeva-data-updated", loadDashboardData);
    window.addEventListener(
      "subjeva-study-minutes-updated",
      loadDashboardData
    );

    return () => {
      window.removeEventListener("storage", loadDashboardData);
      window.removeEventListener("subjeva-data-updated", loadDashboardData);
      window.removeEventListener(
        "subjeva-study-minutes-updated",
        loadDashboardData
      );
    };
  }, []);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();

      setCurrentTime(
        now.toLocaleTimeString("tr-TR", {
          hour: "2-digit",
          minute: "2-digit",
        })
      );

      setCountdown(getCountdown(mainTarget));
    };

    updateTime();

    const timer = setInterval(updateTime, 1000 * 30);

    return () => clearInterval(timer);
  }, [mainTarget]);

  const overallProgress =
    subjects.length > 0
      ? Math.round(
          subjects.reduce(
            (total, subject) => total + calculateSubjectProgress(subject),
            0
          ) / subjects.length
        )
      : 0;

  const dashboardDays = Array.from({ length: 7 }, (_, index) =>
    addDays(new Date(), index)
  );

  const dashboardLessonCount = dashboardDays.reduce((total, date) => {
    const dateKey = toDateKey(date);
    return total + getLessonsForDate(lessons, dateKey).length;
  }, 0);

  const firstName = displayName.trim().split(" ")[0] || "Öğrenci";

  return (
    <StudentLayout
      activePage="Dashboard"
      topbarSubtitle="Konuların, hedefin ve haftalık planın"
      currentTime={currentTime}
      primaryAction={{
        label: "+ Konu Ekle",
        href: "/student/subjects/new",
      }}
      sidebarTitle="Bugün bir adım daha."
      sidebarDescription="Konularını, hedefini ve haftalık ders planını tek ekrandan takip et."
    >
      <div className="mx-auto max-w-7xl px-6 py-8">
        <motion.div
          variants={scrollReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.35 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="mb-14 pt-7 md:mb-16"
        >
          <div className="relative overflow-hidden rounded-[38px] border border-orange-100 bg-[radial-gradient(circle_at_top_left,_rgba(251,146,60,0.12),_transparent_32%),linear-gradient(135deg,_#FFFFFF,_#FFF7ED)] px-8 py-9 shadow-sm md:px-10 md:py-10">
            <div className="pointer-events-none absolute -right-16 -top-20 h-60 w-60 rounded-full bg-orange-300/14 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-20 left-1/3 h-52 w-52 rounded-full bg-amber-300/14 blur-3xl" />

            <div className="relative z-10">
              <p
                className={`${caveat.className} text-[clamp(2.4rem,4vw,4.1rem)] font-bold leading-none tracking-tight text-orange-600`}
              >
                Tekrar hoş geldin
              </p>

              <h1 className="mt-1 text-[clamp(3.4rem,6vw,6.2rem)] font-extrabold leading-[0.9] tracking-[-0.055em] text-slate-950">
                  {firstName}
              </h1>

              <p className="mt-7 text-lg font-extrabold text-slate-700 md:text-2xl">
               
              </p>
            </div>
          </div>
        </motion.div>

        <motion.section
          variants={scrollReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.18 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="mb-8 rounded-[34px] border border-orange-100 bg-white p-6 shadow-sm"
        >
          <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-500">
                Konu İlerlemesi
              </p>

              <h2 className="mt-2 text-2xl font-extrabold text-slate-950">
                Konu ilerleme tablosu
              </h2>
            </div>

            <a
              href="/student/subjects/new"
              className="rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-orange-600"
            >
              + Konu Ekle
            </a>
          </div>

          {subjects.length === 0 ? (
            <div className="rounded-[30px] border border-dashed border-orange-200 bg-orange-50/40 p-10 text-center">
              <p className="text-5xl">📚</p>

              <h3 className="mt-4 text-2xl font-extrabold text-slate-950">
                Henüz konu eklenmedi.
              </h3>

              <p className="mx-auto mt-3 max-w-xl leading-7 text-slate-600">
                İlk girişte burada hiçbir konu görünmez. Konularını ekledikçe
                ilerleme tablosu otomatik oluşur.
              </p>

              <a
                href="/student/subjects/new"
                className="mt-6 inline-flex rounded-2xl bg-orange-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-600"
              >
                + Konu Ekle
              </a>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid gap-3 rounded-3xl border border-slate-200 bg-slate-50 p-3 md:grid-cols-[180px_1fr_80px] md:items-center">
                <div className="rounded-2xl bg-slate-950 px-4 py-3 text-center text-sm font-extrabold text-white">
                  GENEL
                </div>

                <div className="h-4 overflow-hidden rounded-full bg-white ring-1 ring-slate-200">
                  <div
                    className="h-full rounded-full bg-slate-950"
                    style={{ width: `${overallProgress}%` }}
                  />
                </div>

                <p className="text-right text-lg font-extrabold text-slate-950">
                  {overallProgress}%
                </p>
              </div>

              {subjects.map((subject, index) => {
                const progress = calculateSubjectProgress(subject);
                const theme = getSubjectTheme(index);

                return (
                  <motion.div
                    key={subject.id}
                    variants={scrollReveal}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: false, amount: 0.2 }}
                    whileHover={{ y: -4, scale: 1.005 }}
                    transition={{
                      duration: 0.45,
                      delay: index * 0.04,
                      ease: "easeOut",
                    }}
                    className="grid gap-3 rounded-3xl border border-orange-100 bg-orange-50/30 p-3 md:grid-cols-[180px_1fr_80px] md:items-center"
                  >
                    <div
                      className={`rounded-2xl ${theme.soft} px-4 py-3 text-center text-sm font-extrabold ${theme.text} ring-1 ring-orange-100`}
                    >
                      {subject.name}
                    </div>

                    <div className="h-4 overflow-hidden rounded-full bg-white ring-1 ring-orange-100">
                      <div
                        className={`h-full rounded-full ${theme.color}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>

                    <p
                      className={`text-right text-lg font-extrabold ${theme.text}`}
                    >
                      {progress}%
                    </p>

                    <p className="text-sm font-medium text-slate-500 md:col-start-2">
                      {subject.completedUnits} / {subject.totalUnits} ders
                      tamamlandı
                      <span className="font-extrabold text-orange-600">
                        {" "}
                        · {subjectMinutes[subject.slug] || 0} dk çalışıldı
                      </span>
                    </p>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.section>

        <motion.section
          variants={scrollReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.75, ease: "easeOut" }}
          className="mb-8 overflow-hidden rounded-[36px] border border-orange-100 bg-[radial-gradient(circle_at_top_left,_rgba(251,146,60,0.18),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(245,158,11,0.12),_transparent_30%),linear-gradient(135deg,_#FFFFFF,_#FFF7ED)] p-7 shadow-sm"
        >
          {mainTarget ? (
            <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-500">
                  Ana Hedef
                </p>

                <h2 className="mt-3 text-4xl font-extrabold text-slate-950 md:text-5xl">
                  {mainTarget.name}
                </h2>

                <p className="mt-3 text-lg text-slate-600">
                  Hedef tarihi:{" "}
                  <span className="font-bold text-slate-950">
                    {mainTarget.date}
                  </span>
                </p>

                <p className="mt-3 max-w-2xl leading-7 text-slate-600">
                  {mainTarget.description}
                </p>

                <a
                  href="/student/main-target"
                  className="mt-5 inline-flex rounded-xl border border-orange-100 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-orange-200 hover:text-orange-600"
                >
                  Ana Hedefi Düzenle
                </a>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-3xl border border-orange-100 bg-white px-8 py-5 text-center shadow-sm">
                  <p className="text-4xl font-extrabold text-orange-600">
                    {countdown.days}
                  </p>
                  <p className="mt-1 text-sm font-bold text-slate-500">gün</p>
                </div>

                <div className="rounded-3xl border border-orange-100 bg-white px-8 py-5 text-center shadow-sm">
                  <p className="text-4xl font-extrabold text-amber-600">
                    {countdown.hours}
                  </p>
                  <p className="mt-1 text-sm font-bold text-slate-500">
                    saat
                  </p>
                </div>

                <div className="rounded-3xl border border-orange-100 bg-white px-8 py-5 text-center shadow-sm">
                  <p className="text-4xl font-extrabold text-emerald-600">
                    {countdown.minutes}
                  </p>
                  <p className="mt-1 text-sm font-bold text-slate-500">
                    dakika
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-8 text-center">
              <p className="text-5xl">🎯</p>

              <p className="mt-4 text-sm font-bold uppercase tracking-[0.2em] text-orange-500">
                Ana Hedef
              </p>

              <h2 className="mx-auto mt-3 max-w-3xl text-4xl font-extrabold text-slate-950 md:text-5xl">
                Henüz ana hedef oluşturulmadı.
              </h2>

              <p className="mx-auto mt-4 max-w-2xl leading-7 text-slate-600">
                İlk girişte burada YKS veya başka bir hedef yazmayacak.
                Hedefini oluşturduktan sonra geri sayım burada görünecek.
              </p>

              <a
                href="/student/main-target"
                className="mt-6 inline-flex rounded-2xl bg-orange-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-600"
              >
                + Ana Hedef Ekle
              </a>
            </div>
          )}
        </motion.section>

        <motion.section
          variants={scrollReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.18 }}
          transition={{ duration: 0.75, ease: "easeOut" }}
          className="mt-8 rounded-[34px] border border-orange-100 bg-white p-6 shadow-sm"
        >
          <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-500">
                Haftalık Ders Planı
              </p>

              <h2 className="mt-2 text-2xl font-extrabold text-slate-950">
                Bu hafta hangi konular var?
              </h2>

              <p className="mt-2 text-sm font-semibold text-slate-500">
                Konu içindeki ders tarihleri otomatik olarak burada görünür.
              </p>
            </div>

            <a
              href="/student/weekly-plan"
              className="rounded-2xl border border-orange-100 bg-white px-5 py-3 text-sm font-extrabold text-slate-700 shadow-sm transition hover:border-orange-200 hover:text-orange-600"
            >
              Haftalık Planı Aç
            </a>
          </div>

          {dashboardLessonCount === 0 ? (
            <div className="rounded-[30px] border border-dashed border-orange-200 bg-orange-50/40 p-10 text-center">
              <p className="text-5xl">🗓️</p>

              <h3 className="mt-4 text-2xl font-extrabold text-slate-950">
                Önümüzdeki 7 gün için ders yok.
              </h3>

              <p className="mx-auto mt-3 max-w-xl leading-7 text-slate-600">
                Bir konu açıp ders eklediğinde ve tarih seçtiğinde, o ders
                seçtiğin tarihin gününde burada otomatik görünecek.
              </p>

              <a
                href="/student/subjects"
                className="mt-6 inline-flex rounded-2xl bg-orange-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-600"
              >
                Konulara Git
              </a>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-7">
              {dashboardDays.map((date, index) => {
                const dateKey = toDateKey(date);
                const dayLessons = getLessonsForDate(lessons, dateKey);
                const isToday = toDateKey(new Date()) === dateKey;

                return (
                  <motion.div
                    key={dateKey}
                    variants={scrollReveal}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: false, amount: 0.22 }}
                    transition={{
                      duration: 0.5,
                      delay: index * 0.04,
                      ease: "easeOut",
                    }}
                    className={`min-h-[260px] rounded-3xl border p-4 shadow-sm transition ${
                      isToday
                        ? "border-orange-300 bg-orange-500 text-white shadow-orange-200"
                        : dayLessons.length > 0
                        ? "border-orange-100 bg-orange-50/40 text-slate-950"
                        : "border-slate-200 bg-slate-50 text-slate-950"
                    }`}
                  >
                    <div
                      className={`mb-4 rounded-2xl px-3 py-3 text-center ${
                        isToday ? "bg-white/15" : "bg-white"
                      }`}
                    >
                      <p
                        className={`text-base font-extrabold capitalize ${
                          isToday ? "text-white" : "text-slate-950"
                        }`}
                      >
                        {date.toLocaleDateString("tr-TR", {
                          weekday: "long",
                        })}
                      </p>

                      <p
                        className={`mt-1 text-xs font-bold ${
                          isToday ? "text-orange-50" : "text-slate-500"
                        }`}
                      >
                        {date.toLocaleDateString("tr-TR", {
                          day: "numeric",
                          month: "long",
                        })}
                      </p>

                      <p
                        className={`mt-2 text-xs font-bold ${
                          isToday ? "text-white" : "text-orange-600"
                        }`}
                      >
                        {dayLessons.length} ders
                      </p>
                    </div>

                    {dayLessons.length === 0 ? (
                      <div
                        className={`rounded-2xl border border-dashed p-4 text-center ${
                          isToday
                            ? "border-white/30 bg-white/10"
                            : "border-slate-200 bg-white/70"
                        }`}
                      >
                        <p
                          className={`text-sm font-bold ${
                            isToday ? "text-white" : "text-slate-400"
                          }`}
                        >
                          Bu güne ders yok.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {dayLessons.map((lesson) => (
                          <a
                            key={`${lesson.id}-${dateKey}`}
                            href={`/student/subjects/${lesson.subjectSlug}`}
                            className="block rounded-2xl border border-orange-100 bg-white p-4 text-slate-950 shadow-sm transition hover:border-orange-200 hover:shadow-lg"
                          >
                            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-orange-500">
                              {lesson.subjectName}
                            </p>

                            <h3 className="mt-2 text-base font-extrabold text-slate-950">
                              {lesson.title}
                            </h3>

                            <p className="mt-2 line-clamp-2 text-xs font-semibold leading-5 text-slate-500">
                              {lesson.detail}
                            </p>

                            <div className="mt-3 flex items-center justify-between gap-2">
                              <span
                                className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold ${
                                  lesson.completed
                                    ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100"
                                    : "bg-orange-50 text-orange-700 ring-1 ring-orange-100"
                                }`}
                              >
                                {lesson.completed ? "Tamamlandı" : "Planlandı"}
                              </span>

                              <span className="text-xs font-extrabold text-orange-600">
                                {lesson.studyMinutes} dk
                              </span>
                            </div>
                          </a>
                        ))}
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.section>
      </div>
    </StudentLayout>
  );
}
