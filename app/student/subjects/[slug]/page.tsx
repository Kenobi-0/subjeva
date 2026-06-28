"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useParams } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Caveat } from "next/font/google";
import StudentLayout from "../../../../components/StudentLayout";
import {
  calculateSubjectProgress,
  type SubjevaLesson,
  type SubjevaSubject,
} from "../../../../lib/subjevaStorage";
import {
  completeDbLesson,
  createDbLesson,
  deleteDbLesson,
  getDbLessonsBySubject,
  getDbSubjectBySlug,
  getDbSubjectMinutes,
  getDbTotalStudyMinutes,
  updateDbSubjectMinutes,
  updateDbSubjectProgress,
  updateDbTotalStudyMinutes,
} from "../../../../lib/subjevaDb";

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

function getDaysLeft(targetDate?: string) {
  if (!targetDate) return null;

  const now = new Date();
  const target = new Date(`${targetDate}T10:00:00`);
  const diff = target.getTime() - now.getTime();

  if (diff <= 0) return 0;

  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function getLessonProgress(lessons: SubjevaLesson[]) {
  if (lessons.length === 0) return 0;

  const completedLessons = lessons.filter((lesson) => lesson.completed).length;

  return Math.round((completedLessons / lessons.length) * 100);
}

function formatDate(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString("tr-TR", {
    day: "numeric",
    month: "long",
    weekday: "long",
  });
}

function sortDates(dates: string[]) {
  return [...dates].sort((a, b) => {
    return new Date(a).getTime() - new Date(b).getTime();
  });
}

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getMonthTitle(date: Date) {
  return date.toLocaleDateString("tr-TR", {
    month: "long",
    year: "numeric",
  });
}

function getCalendarDays(monthDate: Date) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);

  const firstDayIndex = (firstDayOfMonth.getDay() + 6) % 7;
  const totalDays = lastDayOfMonth.getDate();

  const calendarDays: (Date | null)[] = [];

  for (let i = 0; i < firstDayIndex; i += 1) {
    calendarDays.push(null);
  }

  for (let day = 1; day <= totalDays; day += 1) {
    calendarDays.push(new Date(year, month, day));
  }

  while (calendarDays.length % 7 !== 0) {
    calendarDays.push(null);
  }

  return calendarDays;
}

function createSyncedSubject(
  subject: SubjevaSubject,
  nextLessons: SubjevaLesson[]
) {
  const completedLessonCount = nextLessons.filter(
    (lesson) => lesson.completed
  ).length;

  return {
    ...subject,
    totalUnits: nextLessons.length,
    completedUnits: completedLessonCount,
    nextTopic:
      nextLessons.find((lesson) => !lesson.completed)?.title ||
      subject.nextTopic ||
      undefined,
  };
}

export default function SubjectDetailPage() {
  const params = useParams();
  const slug = String(params.slug);

  const [isLoading, setIsLoading] = useState(true);
  const [subject, setSubject] = useState<SubjevaSubject | null>(null);
  const [lessons, setLessons] = useState<SubjevaLesson[]>([]);
  const [studyMinutes, setStudyMinutes] = useState(0);

  const [lessonTitle, setLessonTitle] = useState("");
  const [calendarMonth, setCalendarMonth] = useState(() => new Date());
  const [selectedCalendarDates, setSelectedCalendarDates] = useState<string[]>(
    []
  );
  const [lessonDates, setLessonDates] = useState<string[]>([]);
  const [lessonDetail, setLessonDetail] = useState("");

  const [lessonMinutesInput, setLessonMinutesInput] = useState<
    Record<string, string>
  >({});

  const [successMessage, setSuccessMessage] = useState("");

  async function loadSubjectData() {
    try {
      setIsLoading(true);

      const foundSubject = await getDbSubjectBySlug(slug);

      setSubject(foundSubject);

      if (foundSubject) {
        const savedLessons = await getDbLessonsBySubject(foundSubject.id);
        const savedMinutes = await getDbSubjectMinutes(foundSubject.id);

        setLessons(savedLessons);
        setStudyMinutes(savedMinutes);
      } else {
        setLessons([]);
        setStudyMinutes(0);
      }
    } catch (error) {
      alert(
        error instanceof Error
          ? `Konu yüklenemedi: ${error.message}`
          : "Konu yüklenemedi."
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadSubjectData();

    window.addEventListener("subjeva-data-updated", loadSubjectData);
    window.addEventListener("subjeva-study-minutes-updated", loadSubjectData);

    return () => {
      window.removeEventListener("subjeva-data-updated", loadSubjectData);
      window.removeEventListener(
        "subjeva-study-minutes-updated",
        loadSubjectData
      );
    };
  }, [slug]);

  function goToPreviousMonth() {
    setCalendarMonth(
      new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1)
    );
  }

  function goToNextMonth() {
    setCalendarMonth(
      new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1)
    );
  }

  function toggleCalendarDate(dateKey: string) {
    if (selectedCalendarDates.includes(dateKey)) {
      setSelectedCalendarDates(
        selectedCalendarDates.filter((date) => date !== dateKey)
      );
    } else {
      setSelectedCalendarDates(sortDates([...selectedCalendarDates, dateKey]));
    }
  }

  function addSelectedCalendarDates() {
    if (selectedCalendarDates.length === 0) {
      alert("Lütfen en az bir tarih kutucuğu seç.");
      return;
    }

    const mergedDates = Array.from(
      new Set([...lessonDates, ...selectedCalendarDates])
    );

    setLessonDates(sortDates(mergedDates));
    setSelectedCalendarDates([]);
  }

  function removeLessonDate(date: string) {
    setLessonDates(lessonDates.filter((item) => item !== date));
  }

  async function handleAddLesson(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!subject) return;

    const cleanTitle = lessonTitle.trim();
    const cleanDetail = lessonDetail.trim();

    if (!cleanTitle) {
      alert("Lütfen ders adı yaz. Örnek: Fonksiyonlar");
      return;
    }

    if (lessonDates.length === 0) {
      alert("Lütfen bu ders için en az bir tarih seç.");
      return;
    }

    try {
      const newLesson = await createDbLesson(
        subject,
        cleanTitle,
        lessonDates,
        cleanDetail ||
          "Bu ders için henüz açıklama eklenmedi. Daha sonra detaylandırılabilir."
      );

      const nextLessons = [newLesson, ...lessons];

      await updateDbSubjectProgress(subject, nextLessons);

      setLessons(nextLessons);
      setSubject(createSyncedSubject(subject, nextLessons));

      setLessonTitle("");
      setLessonDetail("");
      setLessonDates([]);
      setSelectedCalendarDates([]);

      window.dispatchEvent(new Event("subjeva-data-updated"));

      setSuccessMessage(`${cleanTitle} ${lessonDates.length} tarihe eklendi!`);

      setTimeout(() => {
        setSuccessMessage("");
      }, 1600);
    } catch (error) {
      alert(
        error instanceof Error
          ? `Ders eklenemedi: ${error.message}`
          : "Ders eklenemedi."
      );
    }
  }

  async function completeLesson(lesson: SubjevaLesson) {
    if (!subject) return;

    const minutes = Number(lessonMinutesInput[lesson.id]);

    if (!minutes || minutes < 1) {
      alert("Lütfen bu ders için kaç dakika çalıştığını yaz.");
      return;
    }

    try {
      await completeDbLesson(lesson, minutes);

      const nextLessons = lessons.map((item) => {
        if (item.id !== lesson.id) return item;

        return {
          ...item,
          completed: true,
          studyMinutes: item.studyMinutes + minutes,
        };
      });

      const currentSubjectMinutes = await getDbSubjectMinutes(subject.id);
      const nextSubjectMinutes = currentSubjectMinutes + minutes;

      const currentTotalMinutes = await getDbTotalStudyMinutes();
      const nextTotalMinutes = currentTotalMinutes + minutes;

      await updateDbSubjectMinutes(subject.id, nextSubjectMinutes);
      await updateDbTotalStudyMinutes(nextTotalMinutes);
      await updateDbSubjectProgress(subject, nextLessons);

      setLessons(nextLessons);
      setStudyMinutes(nextSubjectMinutes);
      setSubject(createSyncedSubject(subject, nextLessons));

      setLessonMinutesInput({
        ...lessonMinutesInput,
        [lesson.id]: "",
      });

      window.dispatchEvent(new Event("subjeva-study-minutes-updated"));
      window.dispatchEvent(new Event("subjeva-data-updated"));

      setSuccessMessage(`${lesson.title} tamamlandı! +${minutes} dk eklendi 🎉`);

      setTimeout(() => {
        setSuccessMessage("");
      }, 1800);
    } catch (error) {
      alert(
        error instanceof Error
          ? `Ders tamamlanamadı: ${error.message}`
          : "Ders tamamlanamadı."
      );
    }
  }

  async function deleteLesson(lesson: SubjevaLesson) {
    if (!subject) return;

    const confirmed = confirm(
      `${lesson.title} dersini silmek istediğine emin misin? Bu derse ait ${lesson.studyMinutes} dk çalışma süresi toplamdan düşülecek.`
    );

    if (!confirmed) return;

    try {
      const nextLessons = lessons.filter((item) => item.id !== lesson.id);

      const currentSubjectMinutes = await getDbSubjectMinutes(subject.id);
      const nextSubjectMinutes = Math.max(
        currentSubjectMinutes - lesson.studyMinutes,
        0
      );

      const currentTotalMinutes = await getDbTotalStudyMinutes();
      const nextTotalMinutes = Math.max(
        currentTotalMinutes - lesson.studyMinutes,
        0
      );

      await deleteDbLesson(lesson.id);
      await updateDbSubjectMinutes(subject.id, nextSubjectMinutes);
      await updateDbTotalStudyMinutes(nextTotalMinutes);
      await updateDbSubjectProgress(subject, nextLessons);

      setLessons(nextLessons);
      setStudyMinutes(nextSubjectMinutes);
      setSubject(createSyncedSubject(subject, nextLessons));

      window.dispatchEvent(new Event("subjeva-data-updated"));
      window.dispatchEvent(new Event("subjeva-study-minutes-updated"));

      setSuccessMessage(
        `${lesson.title} silindi. -${lesson.studyMinutes} dk düşüldü.`
      );

      setTimeout(() => {
        setSuccessMessage("");
      }, 1600);
    } catch (error) {
      alert(
        error instanceof Error
          ? `Ders silinemedi: ${error.message}`
          : "Ders silinemedi."
      );
    }
  }

  if (isLoading) {
    return (
      <StudentLayout
        activePage="Subjects"
        topbarSubtitle="Konu yükleniyor"
        primaryAction={{
          label: "Konulara Dön",
          href: "/student/subjects",
        }}
        sidebarTitle="Konu yükleniyor."
        sidebarDescription="Bu konu Supabase veritabanından alınıyor."
      >
        <div className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center px-6 py-8">
          <div className="rounded-[34px] border border-orange-100 bg-white p-8 text-center shadow-sm">
            <p
              className={`${caveat.className} text-4xl font-bold text-orange-600`}
            >
              Konu yükleniyor...
            </p>

            <p className="mt-3 leading-7 text-slate-600">
              Bu hesaba ait konu bilgileri alınıyor.
            </p>
          </div>
        </div>
      </StudentLayout>
    );
  }

  if (!subject) {
    return (
      <StudentLayout
        activePage="Subjects"
        topbarSubtitle="Konu bulunamadı"
        primaryAction={{
          label: "Konulara Dön",
          href: "/student/subjects",
        }}
        sidebarTitle="Konu bulunamadı."
        sidebarDescription="Bu konu silinmiş ya da bu hesaba ait olmayabilir."
      >
        <div className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center px-6 py-8">
          <motion.div
            variants={scrollReveal}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="max-w-xl rounded-[34px] border border-orange-100 bg-white p-8 text-center shadow-sm"
          >
            <p
              className={`${caveat.className} text-4xl font-bold text-orange-600`}
            >
              Konu bulunamadı.
            </p>

            <h1 className="mt-3 text-3xl font-extrabold text-slate-950">
              Bu konu bulunamadı.
            </h1>

            <p className="mt-3 leading-7 text-slate-600">
              Bu sayfa sadece giriş yaptığın hesaba ait konuları açar.
            </p>

            <a
              href="/student/subjects"
              className="mt-6 inline-flex rounded-2xl bg-orange-500 px-5 py-3 text-sm font-bold text-white"
            >
              Konulara Dön
            </a>
          </motion.div>
        </div>
      </StudentLayout>
    );
  }

  const daysLeft = getDaysLeft(subject.targetDate);
  const lessonProgress = getLessonProgress(lessons);
  const completedLessons = lessons.filter((lesson) => lesson.completed).length;
  const calendarDays = getCalendarDays(calendarMonth);

  return (
    <StudentLayout
      activePage="Subjects"
      topbarSubtitle={`${subject.name} · Dersler`}
      primaryAction={{
        label: "Konulara Dön",
        href: "/student/subjects",
      }}
      sidebarTitle="Konu → Dersler."
      sidebarDescription="Bu konu ve dersleri sadece giriş yaptığın Supabase hesabına aittir."
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
              <p className="text-5xl">✨</p>
              <p className="mt-3 text-2xl font-extrabold text-orange-600">
                {successMessage}
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
            Konu detayı.
          </p>

          <h1 className="mx-auto mt-4 max-w-5xl text-4xl font-extrabold tracking-tight text-slate-950 md:text-6xl">
            {subject.name}
          </h1>
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
              Ders İlerlemesi
            </p>

            <p className="mt-4 text-4xl font-extrabold text-orange-600">
              {lessonProgress}%
            </p>

            <p className="mt-2 text-sm font-medium text-slate-500">
              {completedLessons} / {lessons.length} ders tamamlandı
            </p>
          </div>

          <div className="rounded-[28px] border border-orange-100 bg-white p-6 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-500">
              Çalışma Süresi
            </p>

            <p className="mt-4 text-4xl font-extrabold text-orange-600">
              {studyMinutes}
            </p>

            <p className="mt-2 text-sm font-medium text-slate-500">
              Bu konu için toplam dakika
            </p>
          </div>

          <div className="rounded-[28px] border border-orange-100 bg-white p-6 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-500">
              Dersler
            </p>

            <p className="mt-4 text-4xl font-extrabold text-slate-950">
              {lessons.length}
            </p>

            <p className="mt-2 text-sm font-medium text-slate-500">
              Bu konuya eklenen dersler
            </p>
          </div>

          <div className="rounded-[28px] border border-orange-100 bg-[radial-gradient(circle_at_top_left,_rgba(251,146,60,0.16),_transparent_35%),linear-gradient(135deg,_#FFFFFF,_#FFF7ED)] p-6 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-500">
              Hedef
            </p>

            <p className="mt-4 text-3xl font-extrabold text-slate-950">
              {daysLeft === null ? "Tarih yok" : `${daysLeft} gün`}
            </p>

            <p className="mt-2 text-sm font-medium text-slate-500">
              {subject.targetDate || "Hedef tarihi seçilmedi"}
            </p>
          </div>
        </motion.div>

        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
          <motion.form
            onSubmit={handleAddLesson}
            variants={scrollReveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.18 }}
            transition={{ duration: 0.75, ease: "easeOut" }}
            className="rounded-[34px] border border-orange-100 bg-white p-6 shadow-sm"
          >
            <div className="mb-6">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-500">
                Ders Ekle
              </p>

              <h2 className="mt-2 text-2xl font-extrabold text-slate-950">
                Bu konuya yeni ders ekle.
              </h2>
            </div>

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Ders Adı
                </label>

                <input
                  value={lessonTitle}
                  onChange={(event) => setLessonTitle(event.target.value)}
                  type="text"
                  placeholder="Örnek: Fonksiyonlar, Parabol, Kuvvet"
                  className="w-full rounded-2xl border border-orange-100 bg-orange-50/30 px-4 py-3 text-sm font-semibold outline-none transition placeholder:text-slate-400 focus:border-orange-300 focus:bg-white focus:ring-4 focus:ring-orange-100"
                />
              </div>

              <div>
                <label className="mb-3 block text-sm font-bold text-slate-700">
                  Çalışma Tarihleri
                </label>

                <div className="rounded-[28px] border border-orange-100 bg-orange-50/30 p-4">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={goToPreviousMonth}
                      className="rounded-2xl border border-orange-100 bg-white px-4 py-2 text-sm font-extrabold text-slate-700 transition hover:border-orange-200 hover:text-orange-600"
                    >
                      ←
                    </button>

                    <div className="text-center">
                      <p className="text-lg font-extrabold capitalize text-slate-950">
                        {getMonthTitle(calendarMonth)}
                      </p>
                      <p className="text-xs font-bold text-slate-500">
                        Tarih kutucuklarını seç
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={goToNextMonth}
                      className="rounded-2xl border border-orange-100 bg-white px-4 py-2 text-sm font-extrabold text-slate-700 transition hover:border-orange-200 hover:text-orange-600"
                    >
                      →
                    </button>
                  </div>

                  <div className="mb-2 grid grid-cols-7 gap-2 text-center">
                    {["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"].map(
                      (day) => (
                        <div
                          key={day}
                          className="text-xs font-extrabold uppercase tracking-[0.12em] text-slate-400"
                        >
                          {day}
                        </div>
                      )
                    )}
                  </div>

                  <div className="grid grid-cols-7 gap-2">
                    {calendarDays.map((date, index) => {
                      if (!date) {
                        return <div key={`empty-${index}`} className="h-12" />;
                      }

                      const dateKey = toDateKey(date);
                      const selected = selectedCalendarDates.includes(dateKey);
                      const alreadyAdded = lessonDates.includes(dateKey);
                      const today = toDateKey(new Date()) === dateKey;

                      return (
                        <button
                          key={dateKey}
                          type="button"
                          onClick={() => toggleCalendarDate(dateKey)}
                          className={`relative flex h-12 items-center justify-center rounded-2xl border text-sm font-extrabold transition ${
                            selected
                              ? "border-emerald-300 bg-emerald-500 text-white shadow-lg shadow-emerald-100"
                              : alreadyAdded
                              ? "border-orange-200 bg-orange-100 text-orange-700"
                              : "border-orange-100 bg-white text-slate-700 hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600"
                          }`}
                        >
                          {date.getDate()}

                          {selected ? (
                            <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-[10px] font-extrabold text-emerald-600 shadow-sm">
                              ✓
                            </span>
                          ) : null}

                          {today && !selected ? (
                            <span className="absolute bottom-1 h-1 w-1 rounded-full bg-orange-500" />
                          ) : null}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm font-bold text-slate-500">
                      {selectedCalendarDates.length} tarih seçildi
                    </p>

                    <button
                      type="button"
                      onClick={addSelectedCalendarDates}
                      className="rounded-2xl bg-emerald-500 px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-emerald-100 transition hover:bg-emerald-600"
                    >
                      Seçili tarihleri ekle
                    </button>
                  </div>
                </div>

                {lessonDates.length > 0 ? (
                  <div className="mt-4 rounded-[24px] border border-emerald-100 bg-emerald-50/60 p-4">
                    <p className="mb-3 text-xs font-extrabold uppercase tracking-[0.18em] text-emerald-700">
                      Eklenen Tarihler
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {lessonDates.map((date) => (
                        <button
                          key={date}
                          type="button"
                          onClick={() => removeLessonDate(date)}
                          className="rounded-full bg-white px-3 py-2 text-xs font-extrabold text-emerald-700 ring-1 ring-emerald-100 transition hover:bg-rose-50 hover:text-rose-600 hover:ring-rose-100"
                        >
                          ✓ {formatDate(date)} ×
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="mt-2 text-xs font-semibold text-slate-500">
                    Bir ders için birden fazla tarih seçebilirsin. Seçtiğin
                    kutucuklar yeşil olur, sonra topluca eklenir.
                  </p>
                )}
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Ders Detayı
                </label>

                <textarea
                  value={lessonDetail}
                  onChange={(event) => setLessonDetail(event.target.value)}
                  rows={5}
                  placeholder="Örnek: Konu anlatımı + 30 soru + yanlış analizi"
                  className="w-full resize-none rounded-2xl border border-orange-100 bg-orange-50/30 px-4 py-3 text-sm font-semibold leading-6 outline-none transition placeholder:text-slate-400 focus:border-orange-300 focus:bg-white focus:ring-4 focus:ring-orange-100"
                />
              </div>
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
              <motion.button
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="rounded-2xl bg-orange-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-600"
              >
                + Ders Ekle
              </motion.button>

              <a
                href="/student/subjects"
                className="rounded-2xl border border-orange-100 bg-white px-6 py-3.5 text-center text-sm font-bold text-slate-700 shadow-sm transition hover:border-orange-200 hover:text-orange-600"
              >
                Konulara Dön
              </a>
            </div>

            <p className="mt-4 text-sm font-medium leading-6 text-slate-500">
              Seçtiğin tarihler Haftalık Plan üzerinde ilgili haftanın ilgili
              gününde otomatik görünecek.
            </p>
          </motion.form>

          <motion.section
            variants={scrollReveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.18 }}
            transition={{ duration: 0.75, ease: "easeOut" }}
            className="rounded-[34px] border border-orange-100 bg-white p-6 shadow-sm"
          >
            <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-500">
                  Dersler
                </p>

                <h2 className="mt-2 text-2xl font-extrabold text-slate-950">
                  {subject.name} ders listesi
                </h2>
              </div>

              <div className="rounded-2xl border border-orange-100 bg-orange-50 px-4 py-3 text-sm font-bold text-orange-700">
                {completedLessons} / {lessons.length} tamamlandı
              </div>
            </div>

            {lessons.length === 0 ? (
              <div className="rounded-[30px] border border-dashed border-orange-200 bg-orange-50/40 p-10 text-center">
                <p className="text-5xl">📘</p>

                <h3 className="mt-4 text-2xl font-extrabold text-slate-950">
                  Henüz ders eklenmedi.
                </h3>

                <p className="mx-auto mt-3 max-w-xl leading-7 text-slate-600">
                  Örneğin Matematik için Fonksiyonlar, Parabol, Polinomlar gibi
                  dersler ekleyebilirsin. Tarih seçtiğinde Haftalık Plan
                  otomatik oluşacak.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {lessons.map((lesson, index) => (
                  <motion.article
                    key={lesson.id}
                    variants={scrollReveal}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: false, amount: 0.2 }}
                    whileHover={{ y: -5, scale: 1.005 }}
                    transition={{
                      duration: 0.45,
                      delay: index * 0.04,
                      ease: "easeOut",
                    }}
                    className={`rounded-[28px] border p-5 shadow-sm transition ${
                      lesson.completed
                        ? "border-emerald-100 bg-emerald-50/60"
                        : "border-orange-100 bg-orange-50/30 hover:bg-white"
                    }`}
                  >
                    <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          {lesson.dates && lesson.dates.length > 0 ? (
                            lesson.dates.map((date) => (
                              <span
                                key={date}
                                className="rounded-full bg-white px-3 py-1.5 text-xs font-extrabold text-orange-600 ring-1 ring-orange-100"
                              >
                                {formatDate(date)}
                              </span>
                            ))
                          ) : (
                            <span className="rounded-full bg-white px-3 py-1.5 text-xs font-extrabold text-slate-500 ring-1 ring-orange-100">
                              Tarih yok
                            </span>
                          )}

                          <span
                            className={`rounded-full px-3 py-1.5 text-xs font-extrabold ring-1 ${
                              lesson.completed
                                ? "bg-emerald-50 text-emerald-700 ring-emerald-100"
                                : "bg-orange-50 text-orange-700 ring-orange-100"
                            }`}
                          >
                            {lesson.completed ? "Tamamlandı" : "Planlandı"}
                          </span>
                        </div>

                        <h3 className="mt-4 text-2xl font-extrabold text-slate-950">
                          {lesson.title}
                        </h3>

                        <p className="mt-2 leading-7 text-slate-600">
                          {lesson.detail}
                        </p>

                        <p className="mt-3 text-sm font-bold text-slate-500">
                          Bu derse toplam{" "}
                          <span className="text-orange-600">
                            {lesson.studyMinutes} dk
                          </span>{" "}
                          eklendi.
                        </p>
                      </div>

                      <button
                        onClick={() => deleteLesson(lesson)}
                        className="rounded-xl border border-rose-100 bg-white px-3 py-2 text-xs font-extrabold text-rose-600 transition hover:border-rose-200 hover:bg-rose-50"
                      >
                        Sil
                      </button>
                    </div>

                    <div className="mt-5 rounded-2xl border border-orange-100 bg-white p-4">
                      <label className="mb-2 block text-xs font-extrabold uppercase tracking-[0.16em] text-slate-500">
                        Çalışma Süresi Ekle
                      </label>

                      <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                        <input
                          value={lessonMinutesInput[lesson.id] || ""}
                          onChange={(event) =>
                            setLessonMinutesInput({
                              ...lessonMinutesInput,
                              [lesson.id]: event.target.value,
                            })
                          }
                          type="number"
                          min="1"
                          placeholder="45"
                          className="w-full rounded-xl border border-orange-100 bg-orange-50/30 px-3 py-2 text-sm font-bold text-slate-950 outline-none transition focus:border-orange-300 focus:ring-4 focus:ring-orange-100"
                        />

                        <button
                          onClick={() => completeLesson(lesson)}
                          className={`rounded-xl px-4 py-2.5 text-sm font-extrabold shadow-sm transition ${
                            lesson.completed
                              ? "bg-emerald-500 text-white hover:bg-emerald-600"
                              : "bg-orange-500 text-white hover:bg-orange-600"
                          }`}
                        >
                          {lesson.completed ? "Süre Ekle +" : "Tamamladım ✓"}
                        </button>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>
            )}
          </motion.section>
        </div>
      </div>
    </StudentLayout>
  );
}
