"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Caveat, Inter } from "next/font/google";
import BrandLogo from "../../components/BrandLogo";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["600", "700"],
});

const fadeUp = {
  hidden: {
    opacity: 0,
    y: 28,
  },
  visible: {
    opacity: 1,
    y: 0,
  },
};

export default function SelectRolePage() {
  const router = useRouter();

  const [displayName, setDisplayName] = useState("Öğrenci");

  useEffect(() => {
    const savedName = localStorage.getItem("subjeva-display-name");
    setDisplayName(savedName || "Öğrenci");
  }, []);

  function chooseStudent() {
    localStorage.setItem("subjeva-selected-role", "student");
    localStorage.setItem("subjeva-demo-session", "active");

    router.push("/student/dashboard");
  }

  function chooseEmployee() {
    alert("Çalışan çalışma alanı yakında açılacak!");
  }

  return (
    <main
      className={`${inter.className} min-h-screen overflow-hidden bg-[#fffaf5] text-slate-950`}
    >
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute left-[-10%] top-[-10%] h-96 w-96 rounded-full bg-orange-200/50 blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] h-96 w-96 rounded-full bg-amber-200/50 blur-3xl" />
      </div>

      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <BrandLogo size="sm" />

        <a
          href="/signup"
          className="rounded-2xl border border-orange-100 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-orange-200 hover:text-orange-600"
        >
          Kayıt sayfasına dön
        </a>
      </header>

      <section className="mx-auto max-w-7xl px-6 py-12">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="mx-auto mb-12 max-w-4xl text-center"
        >
          <p
            className={`${caveat.className} text-5xl font-bold text-orange-600`}
          >
            Merhaba, {displayName}.
          </p>

          <h1 className="mt-5 text-5xl font-extrabold tracking-tight text-slate-950 md:text-7xl">
            Çalışma alanını seç.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Subjeva ileride hem öğrenciler hem çalışanlar için olacak. Şimdilik
            Öğrenci alanı aktif, Çalışan alanı ise yakında açılacak şekilde
            kilitli.
          </p>
        </motion.div>

        <div className="mx-auto grid max-w-5xl gap-6 md:grid-cols-2">
          <motion.button
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
            whileHover={{ y: -8, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={chooseStudent}
            className="group text-left"
          >
            <div className="h-full rounded-[38px] border border-orange-200 bg-white p-8 shadow-2xl shadow-orange-100/70 transition group-hover:border-orange-300">
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-orange-500 text-3xl text-white shadow-lg shadow-orange-200">
                🎓
              </div>

              <p
                className={`${caveat.className} mt-7 text-4xl font-bold text-orange-600`}
              >
                Öğrenci
              </p>

              <h2 className="mt-3 text-3xl font-extrabold text-slate-950">
                Çalışma paneli
              </h2>

              <p className="mt-4 leading-7 text-slate-600">
                Konu ekle, ana hedef oluştur, haftalık planını takip et ve
                çalışma süreni ölç.
              </p>

              <div className="mt-7 inline-flex rounded-2xl bg-orange-500 px-5 py-3 text-sm font-extrabold text-white shadow-lg shadow-orange-200 transition group-hover:bg-orange-600">
                Öğrenci Olarak Devam Et
              </div>
            </div>
          </motion.button>

          <motion.button
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            transition={{ duration: 0.7, delay: 0.18, ease: "easeOut" }}
            onClick={chooseEmployee}
            className="group cursor-not-allowed text-left"
          >
            <div className="relative h-full overflow-hidden rounded-[38px] border border-slate-200 bg-slate-950 p-8 text-white shadow-2xl shadow-slate-200/60">
              <div className="absolute right-6 top-6 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-extrabold text-white/80">
                Yakında
              </div>

              <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white/10 text-3xl text-white">
                💼
              </div>

              <p
                className={`${caveat.className} mt-7 text-4xl font-bold text-orange-300`}
              >
                Çalışan
              </p>

              <h2 className="mt-3 text-3xl font-extrabold text-white">
                İş paneli
              </h2>

              <p className="mt-4 leading-7 text-slate-300">
                Proje, görev, teslim tarihi ve iş takibi için ileride açılacak
                çalışma alanı.
              </p>

              <div className="mt-7 inline-flex rounded-2xl bg-white/10 px-5 py-3 text-sm font-extrabold text-white/70">
                Kilitli
              </div>
            </div>
          </motion.button>
        </div>
      </section>
    </main>
  );
}
