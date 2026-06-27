"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Caveat } from "next/font/google";
import StudentLayout from "../../../components/StudentLayout";
import {
  getSubjevaLessons,
  type SubjevaLesson,
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

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getStartOfWeek(date: Date) {
  const currentDate = new Date(date);
  const day = currentDate.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;

  currentDate.setDate(currentDate.getDate() + mondayOffset);
  currentDate.setHours(0, 0, 0, 0);

  return currentDate;
}

function addDays(date: Date, amount: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + amount);

  return nextDate;
}

function formatDate(date: Date) {
  return date.toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
  });
}

function formatDayName(date: Date) {
  return date.toLocaleDateString("tr-TR", {
    weekday: "long",
  });
}

function getWeekTitle(startDate: Date) {
  const endDate = addDays(startDate, 6);

  return `${formatDate(startDate)} - ${formatDate(endDate)}`;
}

function getLessonsForDate(lessons: SubjevaLesson[], dateKey: string) {
  return lessons.filter((lesson) => {
    return lesson.dates?.includes(dateKey) && !lesson.completed;
  });
}

export default function WeeklyPlanPage() {
  const [lessons, setLessons] = useState<SubjevaLesson[]>([]);
  const [weekStartDate, setWeekStartDate] = useState(() =>
    getStartOfWeek(new Date())
  );

  useEffect(() => {
    function loadWeeklyPlanData() {
      setLessons(getSubjevaLessons());
    }

    loadWeeklyPlanData();

    window.addEventListener("storage", loadWeeklyPlanData);
    window.addEventListener("subjeva-data-updated", loadWeeklyPlanData);
    window.addEventListener("subjeva-study-minutes-updated", loadWeeklyPlanData);

    return () => {
      window.removeEventListener("storage", loadWeeklyPlanData);
      window.removeEventListener("subjeva-data-updated", loadWeeklyPlanData);
      window.removeEventListener(
        "subjeva-study-minutes-updated",
        loadWeeklyPlanData
      );
    };
  }, []);

  function goToPreviousWeek() {
    setWeekStartDate(addDays(weekStartDate, -7));
  }

  function goToCurrentWeek() {
    setWeekStartDate(getStartOfWeek(new Date()));
  }

  function goToNextWeek() {
    setWeekStartDate(addDays(weekStartDate, 7));
  }

  const weekDays = Array.from({ length: 7 }, (_, index) =>
    addDays(weekStartDate, index)
  );

  const visibleWeekLessons = weekDays.flatMap((date) => {
    const dateKey = toDateKey(date);

    return getLessonsForDate(lessons, dateKey).map((lesson) => ({
      ...lesson,
      dateKey,
      date,
    }));
  });

  const totalLessonDates = visibleWeekLessons.length;

  const activeDays = weekDays.filter((date) => {
    const dateKey = toDateKey(date);
    return getLessonsForDate(lessons, dateKey).length > 0;
  }).length;

  const uniqueSubjectCount = new Set(
    visibleWeekLessons.map((lesson) => lesson.subjectId)
  ).size;

  const todayKey = toDateKey(new Date());

  return (
    <StudentLayout
      activePage="Weekly Plan"
      topbarSubtitle="Haftalık Plan · Otomatik ders takibi"
      primaryAction={{
        label: "+ Konu Ekle",
        href: "/student/subjects/new",
      }}
      sidebarTitle="Haftanı derslerle planla."
      sidebarDescription="Konu detayında derslere seçtiğin tarihler burada otomatik görünür. Tamamlanan dersler bu plandan gizlenir."
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
            Otomatik haftalık planın.
          </p>

          <h1 className="mx-auto mt-4 max-w-5xl text-4xl font-extrabold tracking-tight text-slate-950 md:text-6xl">
            Derslerin seçtiğin günlerde görünür.
          </h1>

          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-slate-600">
            Konu detayında bir derse tarih eklediğinde, o ders bu sayfada
            ilgili haftanın ilgili gününde otomatik görünür. Dersi tamamladığında
            bu plandan kaybolur.
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
              Kalan Dersler
            </p>

            <p className="mt-4 text-4xl font-extrabold text-slate-950">
              {totalLessonDates}
            </p>

            <p className="mt-2 text-sm font-medium text-slate-500">
              Bu hafta yapılacak ders sayısı
            </p>
          </div>

          <div className="rounded-[28px] border border-orange-100 bg-white p-6 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-500">
              Aktif Günler
            </p>

            <p className="mt-4 text-4xl font-extrabold text-orange-600">
              {activeDays}
            </p>

            <p className="mt-2 text-sm font-medium text-slate-500">
              En az bir ders olan gün sayısı
            </p>
          </div>

          <div className="rounded-[28px] border border-orange-100 bg-white p-6 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-500">
              Konular
            </p>

            <p className="mt-4 text-4xl font-extrabold text-slate-950">
              {uniqueSubjectCount}
            </p>

            <p className="mt-2 text-sm font-medium text-slate-500">
              Bu hafta görünen konu sayısı
            </p>
          </div>

          <div className="rounded-[28px] border border-orange-100 bg-[radial-gradient(circle_at_top_left,_rgba(251,146,60,0.16),_transparent_35%),linear-gradient(135deg,_#FFFFFF,_#FFF7ED)] p-6 shadow-sm">
            <p
              className={`${caveat.className} text-3xl font-bold text-orange-600`}
            >
              Sadece yapılacaklar.
            </p>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              Tamamlanan dersler burada görünmez. Burası öğrencinin yapılacak
              ders listesidir.
            </p>
          </div>
        </motion.div>

        <motion.section
          variants={scrollReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.18 }}
          transition={{ duration: 0.75, ease: "easeOut" }}
          className="rounded-[34px] border border-orange-100 bg-white p-6 shadow-sm"
        >
          <div className="mb-6 flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-500">
                Haftalık Plan
              </p>

              <h2 className="mt-2 text-2xl font-extrabold text-slate-950">
                {getWeekTitle(weekStartDate)}
              </h2>

              <p className="mt-2 text-sm font-semibold text-slate-500">
                Dersler, konu detayında seçtiğin tarihlere göre otomatik
                listelenir.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <button
                type="button"
                onClick={goToPreviousWeek}
                className="rounded-2xl border border-orange-100 bg-white px-4 py-3 text-sm font-extrabold text-slate-700 shadow-sm transition hover:border-orange-200 hover:text-orange-600"
              >
                ← Önceki Hafta
              </button>

              <button
                type="button"
                onClick={goToCurrentWeek}
                className="rounded-2xl bg-orange-500 px-4 py-3 text-sm font-extrabold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-600"
              >
                Bu Hafta
              </button>

              <button
                type="button"
                onClick={goToNextWeek}
                className="rounded-2xl border border-orange-100 bg-white px-4 py-3 text-sm font-extrabold text-slate-700 shadow-sm transition hover:border-orange-200 hover:text-orange-600"
              >
                Sonraki Hafta →
              </button>
            </div>
          </div>

          {totalLessonDates === 0 ? (
            <div className="rounded-[30px] border border-dashed border-orange-200 bg-orange-50/40 p-10 text-center">
              <p className="text-5xl">🗓️</p>

              <h3 className="mt-4 text-2xl font-extrabold text-slate-950">
                Bu hafta için yapılacak ders yok.
              </h3>

              <p className="mx-auto mt-3 max-w-xl leading-7 text-slate-600">
                Bir konuya girip ders eklediğinde ve bu haftadan bir tarih
                seçtiğinde, o ders burada otomatik görünecek.
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
              {weekDays.map((date, index) => {
                const dateKey = toDateKey(date);
                const dayLessons = getLessonsForDate(lessons, dateKey);
                const isToday = todayKey === dateKey;

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
                    className={`min-h-[280px] rounded-3xl border p-4 shadow-sm transition ${
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
                        {formatDayName(date)}
                      </p>

                      <p
                        className={`mt-1 text-xs font-bold ${
                          isToday ? "text-orange-50" : "text-slate-500"
                        }`}
                      >
                        {formatDate(date)}
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
                              <span className="rounded-full bg-orange-50 px-2.5 py-1 text-[10px] font-extrabold text-orange-700 ring-1 ring-orange-100">
                                Yapılacak
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
