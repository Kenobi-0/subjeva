"use client";

import { useState, type FormEvent } from "react";
import { motion } from "framer-motion";
import { Caveat } from "next/font/google";
import StudentLayout from "../../../components/StudentLayout";

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

const subjects = [
  "Matematik",
  "Fizik",
  "Kimya",
  "Biyoloji",
  "Geometri",
  "Problem",
  "Genel",
];

const noteTypes = [
  {
    value: "topic",
    label: "Konu Notu",
    emoji: "📘",
    color: "bg-orange-500",
    soft: "bg-orange-50",
    text: "text-orange-700",
  },
  {
    value: "mistake",
    label: "Yanlış Notu",
    emoji: "⚠️",
    color: "bg-rose-500",
    soft: "bg-rose-50",
    text: "text-rose-700",
  },
  {
    value: "review",
    label: "Tekrar Notu",
    emoji: "🔁",
    color: "bg-emerald-500",
    soft: "bg-emerald-50",
    text: "text-emerald-700",
  },
  {
    value: "question",
    label: "Soru Notu",
    emoji: "❓",
    color: "bg-sky-500",
    soft: "bg-sky-50",
    text: "text-sky-700",
  },
];

type Note = {
  id: string;
  title: string;
  content: string;
  subject: string;
  type: string;
  date: string;
};

const initialNotes: Note[] = [
  {
    id: "1",
    title: "Fonksiyonlar tekrar edilmeli",
    content:
      "Tanım kümesi ve değer kümesi kısmında karışıklık oluyor. Önce temel örnekler, sonra grafik yorumlama yapılmalı.",
    subject: "Matematik",
    type: "topic",
    date: "26.06.2026",
  },
  {
    id: "2",
    title: "Kuvvet sorularında hata",
    content:
      "Serbest cisim diyagramını çizmeden direkt işlem yapınca yanlış çıkıyor. Her soruda önce kuvvetleri çiz.",
    subject: "Fizik",
    type: "mistake",
    date: "25.06.2026",
  },
  {
    id: "3",
    title: "Haftalık deneme analizi",
    content:
      "Yanlışlar en çok problem ve geometri tarafında birikiyor. Pazar günü hafif tekrar planına eklenmeli.",
    subject: "Genel",
    type: "review",
    date: "24.06.2026",
  },
];

function getNoteType(type: string) {
  return noteTypes.find((noteType) => noteType.value === type) || noteTypes[0];
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("Matematik");
  const [selectedType, setSelectedType] = useState("topic");
  const [activeFilter, setActiveFilter] = useState("all");

  const filteredNotes =
    activeFilter === "all"
      ? notes
      : notes.filter((note) => note.type === activeFilter);

  const mistakeCount = notes.filter((note) => note.type === "mistake").length;
  const reviewCount = notes.filter((note) => note.type === "review").length;
  const questionCount = notes.filter((note) => note.type === "question").length;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim() || !content.trim()) {
      alert("Lütfen not başlığı ve not içeriği yaz.");
      return;
    }

    const newNote: Note = {
      id: String(Date.now()),
      title,
      content,
      subject: selectedSubject,
      type: selectedType,
      date: new Date().toLocaleDateString("tr-TR"),
    };

    setNotes([newNote, ...notes]);
    setTitle("");
    setContent("");
    setSelectedSubject("Matematik");
    setSelectedType("topic");
  }

  return (
    <StudentLayout
      activePage="Notes"
      topbarSubtitle="Notlar · Yanlışlar · Tekrarlar"
      primaryAction={{
        label: "Odak",
        href: "/student/focus",
      }}
      sidebarTitle="Aklında kalmasın, yaz."
      sidebarDescription="Yanlışlarını, tekrar notlarını ve önemli konu detaylarını tek yerde topla."
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
            Önemli olanı yakala.
          </p>

          <h1 className="mx-auto mt-4 max-w-5xl text-4xl font-extrabold tracking-tight text-slate-950 md:text-6xl">
            Çalışma notlarını düzenli tut.
          </h1>

          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-slate-600">
            Konu notlarını, yanlışlarını, tekrar listelerini ve aklına takılan
            soruları ders bazlı şekilde kaydet.
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
              Toplam Not
            </p>

            <p className="mt-4 text-4xl font-extrabold text-slate-950">
              {notes.length}
            </p>

            <p className="mt-2 text-sm font-medium text-slate-500">
              Kaydedilen çalışma notu
            </p>
          </div>

          <div className="rounded-[28px] border border-orange-100 bg-white p-6 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-500">
              Yanlışlar
            </p>

            <p className="mt-4 text-4xl font-extrabold text-rose-600">
              {mistakeCount}
            </p>

            <p className="mt-2 text-sm font-medium text-slate-500">
              Tekrar edilmesi gereken hatalar
            </p>
          </div>

          <div className="rounded-[28px] border border-orange-100 bg-white p-6 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-500">
              Tekrarlar
            </p>

            <p className="mt-4 text-4xl font-extrabold text-emerald-600">
              {reviewCount}
            </p>

            <p className="mt-2 text-sm font-medium text-slate-500">
              Planlanan tekrar notları
            </p>
          </div>

          <div className="rounded-[28px] border border-orange-100 bg-[radial-gradient(circle_at_top_left,_rgba(251,146,60,0.16),_transparent_35%),linear-gradient(135deg,_#FFFFFF,_#FFF7ED)] p-6 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-500">
              Sorular
            </p>

            <p className="mt-4 text-4xl font-extrabold text-sky-600">
              {questionCount}
            </p>

            <p className="mt-2 text-sm font-medium text-slate-500">
              Sonra çözülmesi gereken sorular
            </p>
          </div>
        </motion.div>

        <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
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
                Yeni Not
              </p>

              <h2 className="mt-2 text-2xl font-extrabold text-slate-950">
                Çalışma notu ekle.
              </h2>
            </div>

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Not Başlığı
                </label>

                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  type="text"
                  placeholder="Örnek: Fonksiyonlarda dikkat et"
                  className="w-full rounded-2xl border border-orange-100 bg-orange-50/30 px-4 py-3 text-sm font-semibold outline-none transition placeholder:text-slate-400 focus:border-orange-300 focus:bg-white focus:ring-4 focus:ring-orange-100"
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Konu
                  </label>

                  <select
                    value={selectedSubject}
                    onChange={(event) =>
                      setSelectedSubject(event.target.value)
                    }
                    className="w-full rounded-2xl border border-orange-100 bg-orange-50/30 px-4 py-3 text-sm font-bold outline-none transition focus:border-orange-300 focus:bg-white focus:ring-4 focus:ring-orange-100"
                  >
                    {subjects.map((subject) => (
                      <option key={subject} value={subject}>
                        {subject}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Not Türü
                  </label>

                  <select
                    value={selectedType}
                    onChange={(event) => setSelectedType(event.target.value)}
                    className="w-full rounded-2xl border border-orange-100 bg-orange-50/30 px-4 py-3 text-sm font-bold outline-none transition focus:border-orange-300 focus:bg-white focus:ring-4 focus:ring-orange-100"
                  >
                    {noteTypes.map((noteType) => (
                      <option key={noteType.value} value={noteType.value}>
                        {noteType.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Not İçeriği
                </label>

                <textarea
                  value={content}
                  onChange={(event) => setContent(event.target.value)}
                  rows={7}
                  placeholder="Notunu buraya yaz..."
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
                Notu Kaydet
              </motion.button>

              <button
                type="button"
                onClick={() => {
                  setTitle("");
                  setContent("");
                }}
                className="rounded-2xl border border-orange-100 bg-white px-6 py-3.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-orange-200 hover:text-orange-600"
              >
                Temizle
              </button>
            </div>

            <p className="mt-4 text-sm font-medium leading-6 text-slate-500">
              Demo sürüm: Bu notlar şimdilik sadece sayfa içinde tutulur.
              Supabase bağlantısından sonra kalıcı hale gelecek.
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
                  Not Kütüphanesi
                </p>

                <h2 className="mt-2 text-2xl font-extrabold text-slate-950">
                  Kaydedilen notların
                </h2>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setActiveFilter("all")}
                  className={`rounded-full px-4 py-2 text-xs font-extrabold transition ${
                    activeFilter === "all"
                      ? "bg-orange-500 text-white shadow-lg shadow-orange-200"
                      : "bg-orange-50 text-orange-700 ring-1 ring-orange-100 hover:bg-orange-100"
                  }`}
                >
                  Tümü
                </button>

                {noteTypes.map((noteType) => (
                  <button
                    key={noteType.value}
                    onClick={() => setActiveFilter(noteType.value)}
                    className={`rounded-full px-4 py-2 text-xs font-extrabold transition ${
                      activeFilter === noteType.value
                        ? "bg-orange-500 text-white shadow-lg shadow-orange-200"
                        : "bg-orange-50 text-orange-700 ring-1 ring-orange-100 hover:bg-orange-100"
                    }`}
                  >
                    {noteType.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {filteredNotes.length > 0 ? (
                filteredNotes.map((note, index) => {
                  const noteType = getNoteType(note.type);

                  return (
                    <motion.article
                      key={note.id}
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
                      className="rounded-[28px] border border-orange-100 bg-orange-50/30 p-5 shadow-sm transition hover:border-orange-200 hover:bg-white hover:shadow-lg"
                    >
                      <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-start">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-full ${noteType.soft} px-3 py-1.5 text-xs font-extrabold ${noteType.text} ring-1 ring-orange-100`}
                            >
                              {noteType.emoji} {noteType.label}
                            </span>

                            <span className="rounded-full bg-white px-3 py-1.5 text-xs font-extrabold text-slate-500 ring-1 ring-orange-100">
                              {note.subject}
                            </span>
                          </div>

                          <h3 className="mt-4 text-xl font-extrabold text-slate-950">
                            {note.title}
                          </h3>
                        </div>

                        <p className="text-sm font-bold text-slate-400">
                          {note.date}
                        </p>
                      </div>

                      <p className="leading-7 text-slate-600">
                        {note.content}
                      </p>
                    </motion.article>
                  );
                })
              ) : (
                <div className="rounded-[28px] border border-orange-100 bg-orange-50/40 p-8 text-center">
                  <p
                    className={`${caveat.className} text-3xl font-bold text-orange-600`}
                  >
                    Burada henüz not yok.
                  </p>

                  <p className="mt-2 text-sm font-semibold text-slate-500">
                    Bu filtrede henüz not bulunmuyor.
                  </p>
                </div>
              )}
            </div>
          </motion.section>
        </div>
      </div>
    </StudentLayout>
  );
}
