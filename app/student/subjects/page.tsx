"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Caveat } from "next/font/google";
import StudentLayout from "../../../components/StudentLayout";
import { calculateSubjectProgress, type SubjevaSubject } from "../../../lib/subjevaStorage";
import {
  deleteDbSubject,
  getDbSubjectMinutes,
  getDbSubjects,
  getDbTotalStudyMinutes,
  updateDbTotalStudyMinutes,
} from "../../../lib/subjevaDb";

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
  { color: "bg-orange-500", soft: "bg-orange-50", text: "text-orange-700" },
  { color: "bg-sky-500", soft: "bg-sky-50", text: "text-sky-700" },
  { color: "bg-emerald-500", soft: "bg-emerald-50", text: "text-emerald-700" },
  { color: "bg-amber-500", soft: "bg-amber-50", text: "text-amber-700" },
  { color: "bg-purple-500", soft: "bg-purple-50", text: "text-purple-700" },
  { color: "bg-rose-500", soft: "bg-rose-50", text: "text-rose-700" },
];

function getSubjectTheme(index: number) {
  return subjectThemes[index % subjectThemes.length];
}

export default function StudentSubjectsPage() {
  const [subjects, setSubjects] = useState<SubjevaSubject[]>([]);
  const [subjectMinutes, setSubjectMinutes] = useState<Record<string, number>>(
    {}
  );
  const [isLoading, setIsLoading] = useState(true);

  async function loadSubjects() {
    try {
      setIsLoading(true);

      const savedSubjects = await getDbSubjects();
      const nextSubjectMinutes: Record<string, number> = {};

      await Promise.all(
        savedSubjects.map(async (subject) => {
          nextSubjectMinutes[subject.id] = await getDbSubjectMinutes(subject.id);
        })
      );

      setSubjects(savedSubjects);
      setSubjectMinutes(nextSubjectMinutes);
    } catch (error) {
      alert(
        error instanceof Error
          ? `Konular yüklenemedi: ${error.message}`
          : "Konular yüklenemedi."
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadSubjects();
  }, []);

  async function deleteSubject(subject: SubjevaSubject) {
    const subjectStudyMinutes = subjectMinutes[subject.id] || 0;

    const confirmed = confirm(
      `${subject.name} konusunu silmek istediğine emin misin? Bu konu sadece bu hesaptan silinecek.`
    );

    if (!confirmed) return;

    try {
      const currentTotalMinutes = await getDbTotalStudyMinutes();
      const nextTotalMinutes = Math.max(
        currentTotalMinutes - subjectStudyMinutes,
        0
      );

      await deleteDbSubject(subject.id);
      await updateDbTotalStudyMinutes(nextTotalMinutes);

      const nextSubjects = subjects.filter((item) => item.id !== subject.id);

      setSubjects(nextSubjects);

      const nextSubjectMinutes = { ...subjectMinutes };
      delete nextSubjectMinutes[subject.id];
      setSubjectMinutes(nextSubjectMinutes);

      window.dispatchEvent(new Event("subjeva-data-updated"));
      window.dispatchEvent(new Event("subjeva-study-minutes-updated"));
    } catch (error) {
      alert(
        error instanceof Error
          ? `Konu silinemedi: ${error.message}`
          : "Konu silinemedi."
      );
    }
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
    return total + (subjectMinutes[subject.id] || 0);
  }, 0);

  return (
    <StudentLayout
      activePage="Subjects"
      topbarSubtitle="Konular · Supabase kullanıcı verileri"
      primaryAction={{ label: "+ Konu Ekle", href: "/student/subjects/new" }}
      sidebarTitle="Kendi konu listen."
      sidebarDescription="Bu sayfada sadece giriş yaptığın hesaba ait konular görünür."
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
            Konuların.
          </p>

          <h1 className="mx-auto mt-4 max-w-5xl text-4xl font-extrabold tracking-tight text-slate-950 md:text-6xl">
            Her hesap kendi konularını görür.
          </h1>

          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-slate-600">
            Bu sayfa artık localStorage yerine Supabase veritabanından veri
            okur. Bu yüzden farklı e-posta hesapları birbirinin konularını
            görmez.
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
              Toplam Konu
            </p>

            <p className="mt-4 text-4xl font-extrabold text-slate-950">
              {totalSubjects}
            </p>

            <p className="mt-2 text-sm font-medium text-slate-500">
              Bu hesaba ait konu sayısı
            </p>
          </div>

          <div className="rounded-[28px] border border-orange-100 bg-white p-6 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-500">
              Ortalama İlerleme
            </p>

            <p className="mt-4 text-4xl font-extrabold text-orange-600">
              {averageProgress}%
            </p>

            <p className="mt-2 text-sm font-medium text-slate-500">
              Konuların genel ilerlemesi
            </p>
          </div>

          <div className="rounded-[28px] border border-orange-100 bg-white p-6 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-500">
              Tamamlanan Dersler
            </p>

            <p className="mt-4 text-4xl font-extrabold text-emerald-600">
              {totalCompleted}
            </p>

            <p className="mt-2 text-sm font-medium text-slate-500">
              {totalUnits} ders içinden
            </p>
          </div>

          <div className="rounded-[28px] border border-orange-100 bg-[radial-gradient(circle_at_top_left,_rgba(251,146,60,0.16),_transparent_35%),linear-gradient(135deg,_#FFFFFF,_#FFF7ED)] p-6 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-500">
              Çalışma Süresi
            </p>

            <p className="mt-4 text-4xl font-extrabold text-slate-950">
              {totalSubjectMinutes}
            </p>

            <p className="mt-2 text-sm font-medium text-slate-500">
              Bu konulardaki toplam dakika
            </p>
          </div>
        </motion.div>

        {isLoading ? (
          <div className="rounded-[34px] border border-orange-100 bg-white p-10 text-center shadow-sm">
            <p
              className={`${caveat.className} text-4xl font-bold text-orange-600`}
            >
              Konular yükleniyor...
            </p>

            <p className="mt-3 text-sm font-semibold text-slate-500">
              Supabase veritabanından bu hesaba ait konular alınıyor.
            </p>
          </div>
        ) : subjects.length === 0 ? (
          <motion.div
            variants={scrollReveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.2 }}
            transition={{ duration: 0.75, ease: "easeOut" }}
            className="rounded-[38px] border border-dashed border-orange-200 bg-white p-10 text-center shadow-sm"
          >
            <p className="text-6xl">📚</p>

            <h2 className="mt-5 text-3xl font-extrabold text-slate-950">
              Bu hesapta henüz konu yok.
            </h2>

            <p className="mx-auto mt-3 max-w-xl leading-7 text-slate-600">
              İlk konunu eklediğinde artık bu konu sadece bu Supabase hesabına
              ait olacak.
            </p>

            <a
              href="/student/subjects/new"
              className="mt-7 inline-flex rounded-2xl bg-orange-500 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-600"
            >
              + İlk Konuyu Ekle
            </a>
          </motion.div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {subjects.map((subject, index) => {
              const theme = getSubjectTheme(index);
              const progress = calculateSubjectProgress(subject);
              const minutes = subjectMinutes[subject.id] || 0;

              return (
                <motion.article
                  key={subject.id}
                  variants={scrollReveal}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: false, amount: 0.18 }}
                  whileHover={{ y: -8, scale: 1.015 }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.04,
                    ease: "easeOut",
                  }}
                  className="rounded-[34px] border border-orange-100 bg-white p-6 shadow-sm transition hover:border-orange-200 hover:shadow-xl"
                >
                  <div className="mb-5 flex items-start justify-between gap-4">
                    <div
                      className={`flex h-14 w-14 items-center justify-center rounded-3xl ${theme.color} text-2xl text-white shadow-lg shadow-orange-100`}
                    >
                      📘
                    </div>

                    <button
                      onClick={() => deleteSubject(subject)}
                      className="rounded-xl border border-rose-100 bg-white px-3 py-2 text-xs font-extrabold text-rose-600 transition hover:border-rose-200 hover:bg-rose-50"
                    >
                      Sil
                    </button>
                  </div>

                  <p
                    className={`mb-3 inline-flex rounded-full px-3 py-1 text-xs font-extrabold ring-1 ${theme.soft} ${theme.text} ring-orange-100`}
                  >
                    {progress}% tamamlandı
                  </p>

                  <h2 className="text-2xl font-extrabold text-slate-950">
                    {subject.name}
                  </h2>

                  <p className="mt-3 line-clamp-2 min-h-[56px] leading-7 text-slate-600">
                    {subject.description ||
                      "Bu konu için henüz açıklama eklenmedi. Derslerini ekledikçe ilerleme burada oluşacak."}
                  </p>

                  <div className="mt-5">
                    <div className="mb-2 flex items-center justify-between text-xs font-extrabold text-slate-500">
                      <span>Ders İlerlemesi</span>
                      <span>
                        {subject.completedUnits} / {subject.totalUnits}
                      </span>
                    </div>

                    <div className="h-3 overflow-hidden rounded-full bg-orange-50">
                      <div
                        className={`h-full rounded-full ${theme.color}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-orange-100 bg-orange-50/40 p-4">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                        Süre
                      </p>

                      <p className="mt-2 text-xl font-extrabold text-orange-600">
                        {minutes} dk
                      </p>
                    </div>

                    <div className="rounded-2xl border border-orange-100 bg-orange-50/40 p-4">
                      <p className="text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                        Sıradaki
                      </p>

                      <p className="mt-2 line-clamp-1 text-xl font-extrabold text-slate-950">
                        {subject.nextTopic || "Ders yok"}
                      </p>
                    </div>
                  </div>

                  <a
                    href={`/student/subjects/${subject.slug}`}
                    className="mt-6 inline-flex w-full justify-center rounded-2xl bg-orange-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-600"
                  >
                    Konuyu Aç
                  </a>
                </motion.article>
              );
            })}
          </div>
        )}
      </div>
    </StudentLayout>
  );
}
