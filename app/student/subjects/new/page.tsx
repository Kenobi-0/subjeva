"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Caveat } from "next/font/google";
import StudentLayout from "../../../../components/StudentLayout";
import { createDbSubject, getDbSubjects } from "../../../../lib/subjevaDb";

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

export default function AddSubjectPage() {
  const router = useRouter();

  const [subjectName, setSubjectName] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanSubjectName = subjectName.trim();

    if (!cleanSubjectName) {
      alert("Lütfen konu adı yaz. Örnek: Matematik, Fizik, Makine Öğrenmesi");
      return;
    }

    try {
      setIsSaving(true);

      const existingSubjects = await getDbSubjects();

      if (existingSubjects.length >= 8) {
        alert("Demo sürümde en fazla 8 konu ekleyebilirsin.");
        return;
      }

      await createDbSubject(cleanSubjectName);

      setSuccessMessage(`${cleanSubjectName} eklendi!`);
      setSubjectName("");

      setTimeout(() => {
        router.push("/student/subjects");
      }, 900);
    } catch (error) {
      alert(
        error instanceof Error
          ? `Konu eklenemedi: ${error.message}`
          : "Konu eklenemedi."
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <StudentLayout
      activePage="Subjects"
      topbarSubtitle="Konu Ekle · Supabase kayıt"
      primaryAction={{
        label: "Konulara Dön",
        href: "/student/subjects",
      }}
      sidebarTitle="Konu ile başla."
      sidebarDescription="Bu sayfada eklediğin konu artık sadece giriş yaptığın hesaba kaydedilir."
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
              <p className="text-5xl">📚</p>

              <p className="mt-3 text-2xl font-extrabold text-orange-600">
                {successMessage}
              </p>

              <p className="mt-2 text-sm font-bold text-slate-500">
                Konular sayfasına yönlendiriliyorsun.
              </p>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <div className="mx-auto max-w-5xl px-6 py-8">
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
            Yeni konu ekle.
          </p>

          <h1 className="mx-auto mt-4 max-w-4xl text-4xl font-extrabold tracking-tight text-slate-950 md:text-6xl">
            Bu konu sadece senin hesabına kaydedilecek.
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-600">
            Artık konu verileri localStorage yerine Supabase veritabanına
            kaydediliyor.
          </p>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          variants={scrollReveal}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.75, ease: "easeOut" }}
          className="rounded-[38px] border border-orange-100 bg-white p-8 shadow-sm"
        >
          <div className="mb-7 text-center">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-orange-500">
              Konu Bilgileri
            </p>

            <h2 className="mt-3 text-3xl font-extrabold text-slate-950">
              Hangi konuyu takip etmek istiyorsun?
            </h2>

            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-500">
              Örnek: Matematik, Fizik, Makine Öğrenmesi, SQL Server, Analiz.
            </p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">
              Konu Adı
            </label>

            <input
              value={subjectName}
              onChange={(event) => setSubjectName(event.target.value)}
              type="text"
              placeholder="Örnek: Matematik"
              className="w-full rounded-2xl border border-orange-100 bg-orange-50/30 px-5 py-4 text-base font-bold outline-none transition placeholder:text-slate-400 focus:border-orange-300 focus:bg-white focus:ring-4 focus:ring-orange-100"
            />
          </div>

          <div className="mt-8 rounded-[28px] border border-orange-100 bg-orange-50/40 p-5">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-500">
              Önizleme
            </p>

            <div className="mt-4 rounded-3xl border border-orange-100 bg-white p-5">
              <p className="text-3xl font-extrabold text-slate-950">
                {subjectName || "Yeni Konu"}
              </p>

              <p className="mt-2 text-sm font-semibold text-slate-500">
                Bu konu giriş yaptığın Supabase hesabına kaydedilecek.
              </p>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <motion.button
              whileHover={{ scale: isSaving ? 1 : 1.02, y: isSaving ? 0 : -1 }}
              whileTap={{ scale: isSaving ? 1 : 0.98 }}
              type="submit"
              disabled={isSaving}
              className={`rounded-2xl px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-orange-200 transition ${
                isSaving
                  ? "cursor-not-allowed bg-orange-300"
                  : "bg-orange-500 hover:bg-orange-600"
              }`}
            >
              {isSaving ? "Kaydediliyor..." : "Konuyu Kaydet"}
            </motion.button>

            <a
              href="/student/subjects"
              className="rounded-2xl border border-orange-100 bg-white px-6 py-3.5 text-center text-sm font-bold text-slate-700 shadow-sm transition hover:border-orange-200 hover:text-orange-600"
            >
              İptal
            </a>
          </div>
        </motion.form>
      </div>
    </StudentLayout>
  );
}
