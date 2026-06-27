"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Caveat, Inter } from "next/font/google";
import BrandLogo from "../../components/BrandLogo";
import { saveSubjevaUserProfile } from "../../lib/subjevaStorage";

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

export default function SignupPage() {
  const router = useRouter();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanDisplayName = displayName.trim();
    const cleanEmail = email.trim();

    if (!cleanDisplayName) {
      alert("Lütfen adını yaz.");
      return;
    }

    if (!cleanEmail) {
      alert("Lütfen e-posta adresini yaz.");
      return;
    }

    if (!password || password.length < 6) {
      alert("Demo için en az 6 karakterlik bir şifre yaz.");
      return;
    }

    saveSubjevaUserProfile({
      displayName: cleanDisplayName,
      dailyFocusGoal: 120,
      studyStyle: "Balanced",
      showStudyBadge: true,
    });

    localStorage.setItem("subjeva-demo-session", "active");
    localStorage.setItem("subjeva-demo-email", cleanEmail);
    localStorage.setItem("subjeva-display-name", cleanDisplayName);

    router.push("/select-role");
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
          href="/"
          className="rounded-2xl border border-orange-100 bg-white px-4 py-2.5 text-sm font-bold text-slate-700 shadow-sm transition hover:border-orange-200 hover:text-orange-600"
        >
          Ana sayfaya dön
        </a>
      </header>

      <section className="mx-auto grid min-h-[calc(100vh-96px)] max-w-7xl items-center gap-10 px-6 py-10 lg:grid-cols-[1fr_0.9fr]">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <p
            className={`${caveat.className} text-5xl font-bold text-orange-600`}
          >
            Subjeva’ya hoş geldin.
          </p>

          <h1 className="mt-5 max-w-3xl text-5xl font-extrabold tracking-tight text-slate-950 md:text-7xl">
            Kendi adınla başla.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
            Demo kayıt akışında adını kaydediyoruz. Böylece panel, profil
            menüsü ve ayarlar alanı sana özel görünmeye başlıyor.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-3xl border border-orange-100 bg-white p-5 shadow-sm">
              <p className="text-3xl">👤</p>
              <p className="mt-3 font-extrabold text-slate-950">
                Profil burada başlar
              </p>
            </div>

            <div className="rounded-3xl border border-orange-100 bg-white p-5 shadow-sm">
              <p className="text-3xl">🎓</p>
              <p className="mt-3 font-extrabold text-slate-950">
                Öğrenci rolünü seç
              </p>
            </div>

            <div className="rounded-3xl border border-orange-100 bg-white p-5 shadow-sm">
              <p className="text-3xl">📊</p>
              <p className="mt-3 font-extrabold text-slate-950">
                Panelini oluştur
              </p>
            </div>
          </div>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          transition={{ duration: 0.7, delay: 0.12, ease: "easeOut" }}
          className="rounded-[38px] border border-orange-100 bg-white/90 p-7 shadow-2xl shadow-orange-100/60 backdrop-blur-xl"
        >
          <div className="mb-7 text-center">
            <p
              className={`${caveat.className} text-4xl font-bold text-orange-600`}
            >
              Demo hesabını oluştur.
            </p>

            <h2 className="mt-3 text-3xl font-extrabold text-slate-950">
              Çalışma alanını hazırlayalım.
            </h2>

            <p className="mt-3 text-sm leading-6 text-slate-500">
              Bu gerçek üyelik sistemi değil. Supabase aşamasında gerçek
              kullanıcı hesabına dönüşecek.
            </p>
          </div>

          <div className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Görünen Ad
              </label>

              <input
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                type="text"
                placeholder="Örnek: Kenan Kutlu"
                className="w-full rounded-2xl border border-orange-100 bg-orange-50/30 px-4 py-3 text-sm font-semibold outline-none transition placeholder:text-slate-400 focus:border-orange-300 focus:bg-white focus:ring-4 focus:ring-orange-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                E-posta
              </label>

              <input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                placeholder="kenan@example.com"
                className="w-full rounded-2xl border border-orange-100 bg-orange-50/30 px-4 py-3 text-sm font-semibold outline-none transition placeholder:text-slate-400 focus:border-orange-300 focus:bg-white focus:ring-4 focus:ring-orange-100"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-slate-700">
                Şifre
              </label>

              <input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                placeholder="En az 6 karakter"
                className="w-full rounded-2xl border border-orange-100 bg-orange-50/30 px-4 py-3 text-sm font-semibold outline-none transition placeholder:text-slate-400 focus:border-orange-300 focus:bg-white focus:ring-4 focus:ring-orange-100"
              />

              <p className="mt-2 text-xs font-semibold text-slate-500">
                Demo sürümde şifre kaydedilmez.
              </p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.02, y: -1 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            className="mt-7 w-full rounded-2xl bg-orange-500 px-6 py-4 text-sm font-extrabold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-600"
          >
            Devam Et
          </motion.button>

          <p className="mt-5 text-center text-sm font-medium text-slate-500">
            Zaten test ediyor musun?{" "}
            <a
              href="/select-role"
              className="font-extrabold text-orange-600 hover:text-orange-700"
            >
              Rol seçimine git
            </a>
          </p>
        </motion.form>
      </section>
    </main>
  );
}
