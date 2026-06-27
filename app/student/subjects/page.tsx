"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Caveat } from "next/font/google";
import StudentLayout from "../../../components/StudentLayout";
import {
  calculateSubjectProgress,
  deleteSubjevaLessonsBySubject,
  getSubjevaSubjectMinutes,
  getSubjevaSubjects,
  getSubjevaTotalStudyMinutes,
  saveSubjevaSubjects,
  saveSubjevaTotalStudyMinutes,
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

export default function StudentSubjectsPage() {
  const [subjects, setSubjects] = useState<SubjevaSubject[]>([]);
  const [subjectMinutes, setSubjectMinutes] = useState<Record<string, number>>(
    {}
  );

  useEffect(() => {
    function loadSubjects() {
      const savedSubjects = getSubjevaSubjects();
      const nextSubjectMinutes: Record<string, number> = {};

      savedSubjects.forEach((subject) => {
        nextSubjectMinutes[subject.slug] = getSubjevaSubjectMinutes(
          subject.slug
        );
      });

      setSubjects(savedSubjects);
      setSubjectMinutes(nextSubjectMinutes);
    }

    loadSubjects();

    window.addEventListener("storage", loadSubjects);
    window.addEventListener("subjeva-data-updated", loadSubjects);
    window.addEventListener("subjeva-study-minutes-updated", loadSubjects);

    return () => {
      window.removeEventListener("storage", loadSubjects);
      window.removeEventListener("subjeva-data-updated", loadSubjects);
      window.removeEventListener("subjeva-study-minutes-updated", loadSubjects);
    };
  }, []);

  function deleteSubject(subject: SubjevaSubject) {
    const subjectStudyMinutes = getSubjevaSubjectMinutes(subject.slug);

    const confirmed = confirm(
      `${subject.name} konusunu silmek istediğine emin misin? Bu konuya ait ${subjectStudyMinutes} dk çalışma süresi toplam süreden düşülecek.`
    );

    if (!confirmed) return;

    const nextSubjects = subjects.filter((item) => item.id !== subject.id);

    const currentTotalMinutes = getSubjevaTotalStudyMinutes();
    const nextTotalMinutes = Math.max(
      currentTotalMinutes - subjectStudyMinutes,
      0
    );

    saveSubjevaSubjects(nextSubjects);
    saveSubjevaTotalStudyMinutes(nextTotalMinutes);

    localStorage.removeItem(`subjeva-subject-minutes-${subject.slug}`);
    localStorage.removeItem(`subjeva-topic-completion-${subject.slug}`);

    deleteSubjevaLessonsBySubject(subject.id);

    setSubjects(nextSubjects);

    const nextSubjectMinutes = { ...subjectMinutes };
    delete nextSubjectMinutes[subject.slug];
    setSubjectMinutes(nextSubjectMinutes);

    window.dispatchEvent(new Event("subjeva-data-updated"));
    window.dispatchEvent(new Event("subjeva-study-minutes-updated"));
  }

  const totalSubjects = subjects.length;

  const averageProgress =
    subjects.length > 0
      ? Math.round(
          subjects.reduce(
            (total, subject) => total + calculateSubjectProgress(subject),
            0
          ) / subjects.length
        )
      : 0;

  const totalCompleted = subjects.reduce(
    (total, subject) => total + subject.completedUnits,
    0
  );

  const totalUnits = subjects.reduce(
    (total, subject) => total + subject.totalUnits,
    0
  );

  const totalSubjectMinutes = subjects.reduce((total, subject) => {
    return total + (subjectMinutes[subject.slug] || 0);
  }, 0);

  return (
    <StudentLayout
      activePage="Subjects"
      topbarSubtitle="Konular · Gerçek kullanıcı verileri"
      primaryAction={{
        label: "+ Konu Ekle",
        href: "/student/subjects/new",
      }}
      sidebarTitle="Kendi konu listen."
      sidebarDescription="Bu sayfada demo dersler değil, senin eklediğin gerçek konular görünür."
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
            Konuların, senin sistemin.
          </p>

          <h1 className="mx-auto mt-4 max-w-5xl text-4xl font-extrabold tracking-tight text-slate-950 md:text-6xl">
            Sadece eklediğin konuları takip et.
          </h1>

          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-slate-600">
            Bu sayfa ilk girişte boş başlar. Konuları sen eklersin, Subjeva da
            ilerlemeyi ve çalışma süreni bu gerçek verilere göre gösterir.
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
              Aktif Konular
            </p>

            <p className="mt-4 text-4xl font-extrabold text-slate-950">
              {totalSubjects}
            </p>

            <p className="mt-2 text-sm font-medium text-slate-500">
              Demo sürümde en fazla 8 konu eklenebilir
            </p>
          </div>

          <div className="rounded-[28px] border border-orange-100 bg-white p-6 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-500">
              Ortalama İlerleme
            </p>

            <p className="mt-4 text-4xl font-extrabold text-slate-950">
              {averageProgress}%
            </p>

            <p className="mt-2 text-sm font-medium text-slate-500">
              Eklediğin konulara göre hesaplanır
            </p>
          </div>

          <div className="rounded-[28px] border border-orange-100 bg-white p-6 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-500">
              Tamamlanan Dersler
            </p>

            <p className="mt-4 text-4xl font-extrabold text-slate-950">
              {totalCompleted}
            </p>

            <p className="mt-2 text-sm font-medium text-slate-500">
              Toplam {totalUnits} ders içinden tamamlanan
            </p>
          </div>

          <div className="rounded-[28px] border border-orange-100 bg-[radial-gradient(circle_at_top_left,_rgba(251,146,60,0.16),_transparent_35%),linear-gradient(135deg,_#FFFFFF,_#FFF7ED)] p-6 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-500">
              Çalışma Süresi
            </p>

            <p className="mt-4 text-4xl font-extrabold text-orange-600">
              {totalSubjectMinutes}
            </p>

            <p className="mt-2 text-sm font-medium text-slate-500">
              Konulardan takip edilen toplam dakika
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
          <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-500">
                Konu Listesi
              </p>

              <h2 className="mt-2 text-2xl font-extrabold text-slate-950">
                Aktif konuların
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
                Burada artık demo dersler görünmez. İlk konunu eklediğinde bu
                liste otomatik dolacak.
              </p>

              <a
                href="/student/subjects/new"
                className="mt-6 inline-flex rounded-2xl bg-orange-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-600"
              >
                + İlk Konunu Ekle
              </a>
            </div>
          ) : (
            <div className="space-y-4">
              {subjects.map((subject, index) => {
                const progress = calculateSubjectProgress(subject);
                const theme = getSubjectTheme(index);
                const minutes = subjectMinutes[subject.slug] || 0;

                return (
                  <motion.article
                    key={subject.id}
                    variants={scrollReveal}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: false, amount: 0.18 }}
                    whileHover={{ y: -5, scale: 1.005 }}
                    transition={{
                      duration: 0.45,
                      delay: index * 0.04,
                      ease: "easeOut",
                    }}
                    className="rounded-[28px] border border-orange-100 bg-orange-50/30 p-5 shadow-sm transition hover:border-orange-200 hover:bg-white hover:shadow-lg"
                  >
                    <div className="grid gap-5 lg:grid-cols-[220px_1fr_140px] lg:items-center">
                      <a
                        href={`/student/subjects/${subject.slug}`}
                        className={`rounded-2xl ${theme.soft} px-4 py-4 ring-1 ring-orange-100 transition hover:scale-[1.01]`}
                      >
                        <p className={`text-lg font-extrabold ${theme.text}`}>
                          {subject.name}
                        </p>

                        <p className="mt-1 text-xs font-bold text-slate-500">
                          Ders eklemek için konu detayına gir
                        </p>
                      </a>

                      <div>
                        <div className="flex flex-col justify-between gap-2 md:flex-row md:items-center">
                          <div>
                            <p className="mt-1 text-sm font-medium text-slate-500">
                              {subject.completedUnits} / {subject.totalUnits}{" "}
                              ders tamamlandı ·{" "}
                              <span className="font-extrabold text-orange-600">
                                {minutes} dk çalışıldı
                              </span>
                            </p>

                            {subject.studyDays &&
                            subject.studyDays.length > 0 ? (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {subject.studyDays.map((day) => (
                                  <span
                                    key={day}
                                    className="rounded-full bg-white px-3 py-1.5 text-xs font-extrabold text-orange-600 ring-1 ring-orange-100"
                                  >
                                    {day}
                                  </span>
                                ))}
                              </div>
                            ) : null}
                          </div>
                        </div>

                        <div className="mt-4 h-3 overflow-hidden rounded-full bg-white ring-1 ring-orange-100">
                          <div
                            className={`h-full rounded-full ${theme.color}`}
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>

                      <div className="text-left lg:text-right">
                        <p className={`text-3xl font-extrabold ${theme.text}`}>
                          {progress}%
                        </p>

                        <p className="mt-1 text-xs font-bold text-slate-400">
                          ilerleme
                        </p>

                        <div className="mt-3 inline-flex rounded-2xl border border-orange-100 bg-white px-3 py-2 text-xs font-extrabold text-orange-600">
                          {minutes} dk
                        </div>

                        <div className="mt-3 flex gap-2 lg:justify-end">
                          <a
                            href={`/student/subjects/${subject.slug}`}
                            className="rounded-xl border border-orange-100 bg-white px-3 py-2 text-xs font-extrabold text-slate-700 transition hover:border-orange-200 hover:text-orange-600"
                          >
                            Aç
                          </a>

                          <button
                            onClick={() => deleteSubject(subject)}
                            className="rounded-xl border border-rose-100 bg-white px-3 py-2 text-xs font-extrabold text-rose-600 transition hover:border-rose-200 hover:bg-rose-50"
                          >
                            Sil
                          </button>
                        </div>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          )}
        </motion.section>
      </div>
    </StudentLayout>
  );
}
