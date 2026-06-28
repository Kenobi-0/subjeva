"use client";

import { useEffect, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Caveat } from "next/font/google";
import StudentLayout from "../../../components/StudentLayout";
import {
  createDbNote,
  deleteDbNote,
  getDbNotes,
  type SubjevaNote,
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

const noteTypes = [
  {
    value: "all",
    label: "Tümü",
    icon: "📚",
  },
  {
    value: "topic",
    label: "Konu Notu",
    icon: "📘",
  },
  {
    value: "mistake",
    label: "Yanlış Notu",
    icon: "⚠️",
  },
  {
    value: "review",
    label: "Tekrar Notu",
    icon: "🔁",
  },
  {
    value: "question",
    label: "Soru Notu",
    icon: "📝",
  },
];

function getNoteTypeLabel(value: string) {
  return noteTypes.find((type) => type.value === value)?.label || "Not";
}

function getNoteTypeIcon(value: string) {
  return noteTypes.find((type) => type.value === value)?.icon || "📝";
}

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function formatDate(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString("tr-TR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function NotesPage() {
  const [notes, setNotes] = useState<SubjevaNote[]>([]);
  const [selectedFilter, setSelectedFilter] = useState("all");

  const [noteTitle, setNoteTitle] = useState("");
  const [noteSubject, setNoteSubject] = useState("");
  const [noteType, setNoteType] = useState("topic");
  const [noteContent, setNoteContent] = useState("");

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  async function loadNotes() {
    try {
      setIsLoading(true);

      const savedNotes = await getDbNotes();

      setNotes(savedNotes);
    } catch (error) {
      alert(
        error instanceof Error
          ? `Notlar yüklenemedi: ${error.message}`
          : "Notlar yüklenemedi."
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadNotes();

    window.addEventListener("subjeva-data-updated", loadNotes);

    return () => {
      window.removeEventListener("subjeva-data-updated", loadNotes);
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanTitle = noteTitle.trim();
    const cleanSubject = noteSubject.trim();
    const cleanContent = noteContent.trim();

    if (!cleanTitle) {
      alert("Lütfen not başlığı yaz.");
      return;
    }

    if (!cleanContent) {
      alert("Lütfen not içeriği yaz.");
      return;
    }

    try {
      setIsSaving(true);

      const newNote = await createDbNote({
        title: cleanTitle,
        content: cleanContent,
        subject: cleanSubject || "Genel",
        type: noteType,
        date: toDateKey(new Date()),
      });

      setNotes([newNote, ...notes]);

      setNoteTitle("");
      setNoteSubject("");
      setNoteType("topic");
      setNoteContent("");

      window.dispatchEvent(new Event("subjeva-data-updated"));

      setSuccessMessage("Not kaydedildi ✅");

      setTimeout(() => {
        setSuccessMessage("");
      }, 1600);
    } catch (error) {
      alert(
        error instanceof Error
          ? `Not kaydedilemedi: ${error.message}`
          : "Not kaydedilemedi."
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeleteNote(note: SubjevaNote) {
    const confirmed = confirm(`${note.title} notunu silmek istiyor musun?`);

    if (!confirmed) return;

    try {
      await deleteDbNote(note.id);

      setNotes(notes.filter((item) => item.id !== note.id));

      window.dispatchEvent(new Event("subjeva-data-updated"));

      setSuccessMessage("Not silindi.");

      setTimeout(() => {
        setSuccessMessage("");
      }, 1600);
    } catch (error) {
      alert(
        error instanceof Error
          ? `Not silinemedi: ${error.message}`
          : "Not silinemedi."
      );
    }
  }

  function clearForm() {
    setNoteTitle("");
    setNoteSubject("");
    setNoteType("topic");
    setNoteContent("");
  }

  const filteredNotes =
    selectedFilter === "all"
      ? notes
      : notes.filter((note) => note.type === selectedFilter);

  const topicNoteCount = notes.filter((note) => note.type === "topic").length;
  const mistakeNoteCount = notes.filter((note) => note.type === "mistake").length;
  const reviewNoteCount = notes.filter((note) => note.type === "review").length;

  return (
    <StudentLayout
      activePage="Notes"
      topbarSubtitle="Notlar · Supabase kayıt"
      primaryAction={{
        label: "+ Konu Ekle",
        href: "/student/subjects/new",
      }}
      sidebarTitle="Kendi not kütüphanen."
      sidebarDescription="Buradaki notlar sadece giriş yaptığın Supabase hesabına aittir."
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
              <p className="text-5xl">✍️</p>

              <p className="mt-3 text-2xl font-extrabold text-orange-600">
                {successMessage}
              </p>

              <p className="mt-2 text-sm font-bold text-slate-500">
                Not kütüphanen güncellendi.
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
            Notlarını düzenle.
          </p>

          <h1 className="mx-auto mt-4 max-w-5xl text-4xl font-extrabold tracking-tight text-slate-950 md:text-6xl">
            Kendi not kütüphaneni oluştur.
          </h1>

          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-slate-600">
            İlk girişte hazır not gösterilmez. Eklediğin her not sadece giriş
            yaptığın hesaba kaydedilir.
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
              Bu hesaba ait not sayısı
            </p>
          </div>

          <div className="rounded-[28px] border border-orange-100 bg-white p-6 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-500">
              Konu Notu
            </p>

            <p className="mt-4 text-4xl font-extrabold text-orange-600">
              {topicNoteCount}
            </p>

            <p className="mt-2 text-sm font-medium text-slate-500">
              Konu anlatımı ve özetler
            </p>
          </div>

          <div className="rounded-[28px] border border-orange-100 bg-white p-6 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-500">
              Yanlış Notu
            </p>

            <p className="mt-4 text-4xl font-extrabold text-rose-600">
              {mistakeNoteCount}
            </p>

            <p className="mt-2 text-sm font-medium text-slate-500">
              Hata ve eksik takipleri
            </p>
          </div>

          <div className="rounded-[28px] border border-orange-100 bg-[radial-gradient(circle_at_top_left,_rgba(251,146,60,0.16),_transparent_35%),linear-gradient(135deg,_#FFFFFF,_#FFF7ED)] p-6 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-500">
              Tekrar Notu
            </p>

            <p className="mt-4 text-4xl font-extrabold text-emerald-600">
              {reviewNoteCount}
            </p>

            <p className="mt-2 text-sm font-medium text-slate-500">
              Tekrar planı notları
            </p>
          </div>
        </motion.div>

        <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
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
                  value={noteTitle}
                  onChange={(event) => setNoteTitle(event.target.value)}
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

                  <input
                    value={noteSubject}
                    onChange={(event) => setNoteSubject(event.target.value)}
                    type="text"
                    placeholder="Örnek: Matematik"
                    className="w-full rounded-2xl border border-orange-100 bg-orange-50/30 px-4 py-3 text-sm font-semibold outline-none transition placeholder:text-slate-400 focus:border-orange-300 focus:bg-white focus:ring-4 focus:ring-orange-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Not Türü
                  </label>

                  <select
                    value={noteType}
                    onChange={(event) => setNoteType(event.target.value)}
                    className="w-full rounded-2xl border border-orange-100 bg-orange-50/30 px-4 py-3 text-sm font-bold outline-none transition focus:border-orange-300 focus:bg-white focus:ring-4 focus:ring-orange-100"
                  >
                    {noteTypes
                      .filter((type) => type.value !== "all")
                      .map((type) => (
                        <option key={type.value} value={type.value}>
                          {type.label}
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
                  value={noteContent}
                  onChange={(event) => setNoteContent(event.target.value)}
                  rows={8}
                  placeholder="Notunu buraya yaz..."
                  className="w-full resize-none rounded-2xl border border-orange-100 bg-orange-50/30 px-4 py-3 text-sm font-semibold leading-6 outline-none transition placeholder:text-slate-400 focus:border-orange-300 focus:bg-white focus:ring-4 focus:ring-orange-100"
                />
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
                {isSaving ? "Kaydediliyor..." : "Notu Kaydet"}
              </motion.button>

              <button
                type="button"
                onClick={clearForm}
                className="rounded-2xl border border-orange-100 bg-white px-6 py-3.5 text-center text-sm font-bold text-slate-700 shadow-sm transition hover:border-orange-200 hover:text-orange-600"
              >
                Temizle
              </button>
            </div>

            <p className="mt-4 text-sm font-medium leading-6 text-slate-500">
              Bu not Supabase içinde sadece giriş yaptığın hesaba kaydedilir.
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
            <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-start">
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-500">
                  Not Kütüphanesi
                </p>

                <h2 className="mt-2 text-2xl font-extrabold text-slate-950">
                  Kaydedilen notların
                </h2>
              </div>

              <div className="flex flex-wrap gap-2">
                {noteTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setSelectedFilter(type.value)}
                    className={`rounded-2xl px-4 py-2.5 text-sm font-extrabold transition ${
                      selectedFilter === type.value
                        ? "bg-orange-500 text-white shadow-lg shadow-orange-100"
                        : "border border-orange-100 bg-orange-50/50 text-orange-700 hover:border-orange-200 hover:bg-white"
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {isLoading ? (
              <div className="rounded-[30px] border border-dashed border-orange-200 bg-orange-50/40 p-10 text-center">
                <p
                  className={`${caveat.className} text-4xl font-bold text-orange-600`}
                >
                  Notlar yükleniyor...
                </p>

                <p className="mt-3 text-sm font-semibold text-slate-500">
                  Bu hesaba ait notlar Supabase’den alınıyor.
                </p>
              </div>
            ) : filteredNotes.length === 0 ? (
              <div className="rounded-[30px] border border-dashed border-orange-200 bg-orange-50/40 p-10 text-center">
                <p className="text-5xl">✍️</p>

                <h3 className="mt-4 text-2xl font-extrabold text-slate-950">
                  Henüz not yok.
                </h3>

                <p className="mx-auto mt-3 max-w-xl leading-7 text-slate-600">
                  İlk notunu eklediğinde burada görünecek. Hazır demo notlar
                  artık gösterilmez.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredNotes.map((note, index) => (
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
                    className="rounded-[28px] border border-orange-100 bg-orange-50/20 p-5 shadow-sm transition hover:bg-white"
                  >
                    <div className="mb-4 flex flex-col justify-between gap-3 md:flex-row md:items-start">
                      <div className="flex flex-wrap gap-2">
                        <span className="rounded-full bg-white px-3 py-1.5 text-xs font-extrabold text-orange-600 ring-1 ring-orange-100">
                          {getNoteTypeIcon(note.type)}{" "}
                          {getNoteTypeLabel(note.type)}
                        </span>

                        <span className="rounded-full bg-white px-3 py-1.5 text-xs font-extrabold text-slate-600 ring-1 ring-orange-100">
                          {note.subject || "Genel"}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-sm font-extrabold text-slate-400">
                          {formatDate(note.date)}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleDeleteNote(note)}
                          className="rounded-xl border border-rose-100 bg-white px-3 py-2 text-xs font-extrabold text-rose-600 transition hover:border-rose-200 hover:bg-rose-50"
                        >
                          Sil
                        </button>
                      </div>
                    </div>

                    <h3 className="text-2xl font-extrabold text-slate-950">
                      {note.title}
                    </h3>

                    <p className="mt-3 whitespace-pre-line leading-7 text-slate-600">
                      {note.content}
                    </p>
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
