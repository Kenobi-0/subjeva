"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Caveat } from "next/font/google";
import StudentLayout from "../../../components/StudentLayout";
import {
  getDbMainTarget,
  removeDbMainTarget,
  saveDbMainTarget,
} from "../../../lib/subjevaDb";
import { type SubjevaMainTarget } from "../../../lib/subjevaStorage";

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

function getCountdown(targetDate: string, targetTime: string) {
  if (!targetDate || !targetTime) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };
  }

  const now = new Date();
  const target = new Date(`${targetDate}T${targetTime}:00`);
  const diff = target.getTime() - now.getTime();

  if (diff <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  return {
    days,
    hours,
    minutes,
    seconds,
  };
}

export default function MainTargetPage() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [savedTarget, setSavedTarget] = useState<SubjevaMainTarget | null>(
    null
  );

  const [targetName, setTargetName] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [targetTime, setTargetTime] = useState("10:00");
  const [targetDescription, setTargetDescription] = useState("");

  const [successMessage, setSuccessMessage] = useState("");

  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  async function loadMainTarget() {
    try {
      setIsLoading(true);

      const currentTarget = await getDbMainTarget();

      if (currentTarget) {
        setSavedTarget(currentTarget);
        setTargetName(currentTarget.name);
        setTargetDate(currentTarget.date);
        setTargetTime(currentTarget.time);
        setTargetDescription(currentTarget.description);
      } else {
        setSavedTarget(null);
        setTargetName("");
        setTargetDate("");
        setTargetTime("10:00");
        setTargetDescription("");
      }
    } catch (error) {
      alert(
        error instanceof Error
          ? `Ana hedef yüklenemedi: ${error.message}`
          : "Ana hedef yüklenemedi."
      );
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadMainTarget();

    window.addEventListener("subjeva-data-updated", loadMainTarget);

    return () => {
      window.removeEventListener("subjeva-data-updated", loadMainTarget);
    };
  }, []);

  useEffect(() => {
    const updateCountdown = () => {
      setCountdown(getCountdown(targetDate, targetTime));
    };

    updateCountdown();

    const timer = setInterval(updateCountdown, 1000);

    return () => clearInterval(timer);
  }, [targetDate, targetTime]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const cleanTargetName = targetName.trim();
    const cleanDescription = targetDescription.trim();

    if (!cleanTargetName) {
      alert("Lütfen ana hedef adını yaz.");
      return;
    }

    if (!targetDate) {
      alert("Lütfen hedef tarihini seç.");
      return;
    }

    if (!targetTime) {
      alert("Lütfen hedef saatini seç.");
      return;
    }

    try {
      setIsSaving(true);

      await saveDbMainTarget({
        name: cleanTargetName,
        date: targetDate,
        time: targetTime,
        description:
          cleanDescription ||
          "Bu hedef için henüz açıklama eklenmedi. Daha sonra düzenlenebilir.",
      });

      const refreshedTarget = await getDbMainTarget();

      setSavedTarget(refreshedTarget);
      setSuccessMessage(`${cleanTargetName} ana hedef olarak kaydedildi!`);

      window.dispatchEvent(new Event("subjeva-data-updated"));

      setTimeout(() => {
        router.push("/student/dashboard");
      }, 900);
    } catch (error) {
      alert(
        error instanceof Error
          ? `Ana hedef kaydedilemedi: ${error.message}`
          : "Ana hedef kaydedilemedi."
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function handleRemoveTarget() {
    const confirmed = confirm("Ana hedefi silmek istediğine emin misin?");

    if (!confirmed) return;

    try {
      await removeDbMainTarget();

      setSavedTarget(null);
      setTargetName("");
      setTargetDate("");
      setTargetTime("10:00");
      setTargetDescription("");
      setCountdown({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
      });

      window.dispatchEvent(new Event("subjeva-data-updated"));

      setSuccessMessage("Ana hedef kaldırıldı.");

      setTimeout(() => {
        setSuccessMessage("");
      }, 1600);
    } catch (error) {
      alert(
        error instanceof Error
          ? `Ana hedef kaldırılamadı: ${error.message}`
          : "Ana hedef kaldırılamadı."
      );
    }
  }

  const hasPreview = targetName.trim() && targetDate && targetTime;

  return (
    <StudentLayout
      activePage="Main Target"
      topbarSubtitle="Ana Hedef · Supabase kayıt"
      primaryAction={{
        label: "Panel",
        href: "/student/dashboard",
      }}
      sidebarTitle="Ana nedenin."
      sidebarDescription="Ana hedefin artık sadece giriş yaptığın Supabase hesabına kaydedilir."
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
              <p className="text-5xl">🎯</p>

              <p className="mt-3 text-2xl font-extrabold text-orange-600">
                {successMessage}
              </p>

              <p className="mt-2 text-sm font-bold text-slate-500">
                {successMessage.includes("kaydedildi")
                  ? "Panele yönlendiriliyorsun."
                  : "Hedef bilgisi temizlendi."}
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
            Ana hedefini belirle.
          </p>

          <h1 className="mx-auto mt-4 max-w-5xl text-4xl font-extrabold tracking-tight text-slate-950 md:text-6xl">
            Bu hedef sadece senin hesabına kaydedilecek.
          </h1>

          <p className="mx-auto mt-5 max-w-3xl text-lg leading-8 text-slate-600">
            Ana hedef artık localStorage yerine Supabase veritabanında tutulur.
            Farklı kullanıcılar birbirinin hedefini görmez.
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
              Aktif Hedef
            </p>

            <p className="mt-4 text-3xl font-extrabold text-slate-950">
              {isLoading
                ? "Yükleniyor..."
                : savedTarget
                ? savedTarget.name
                : "Hedef yok"}
            </p>

            <p className="mt-2 text-sm font-medium text-slate-500">
              Bu hesaba ait ana hedef
            </p>
          </div>

          <div className="rounded-[28px] border border-orange-100 bg-white p-6 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-500">
              Kalan Gün
            </p>

            <p className="mt-4 text-4xl font-extrabold text-orange-600">
              {hasPreview ? countdown.days : 0}
            </p>

            <p className="mt-2 text-sm font-medium text-slate-500">
              Hedef tarihine kadar
            </p>
          </div>

          <div className="rounded-[28px] border border-orange-100 bg-white p-6 shadow-sm">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-500">
              Hedef Tarihi
            </p>

            <p className="mt-4 text-2xl font-extrabold text-slate-950">
              {targetDate || "Seçilmedi"}
            </p>

            <p className="mt-2 text-sm font-medium text-slate-500">
              Seçilen tarih
            </p>
          </div>

          <div className="rounded-[28px] border border-orange-100 bg-[radial-gradient(circle_at_top_left,_rgba(251,146,60,0.16),_transparent_35%),linear-gradient(135deg,_#FFFFFF,_#FFF7ED)] p-6 shadow-sm">
            <p
              className={`${caveat.className} text-3xl font-bold text-orange-600`}
            >
              Hesaba özel hedef.
            </p>

            <p className="mt-3 text-sm leading-6 text-slate-600">
              X hesabının hedefi Y hesabında görünmez.
            </p>
          </div>
        </motion.div>

        <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
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
                Hedef Ayarları
              </p>

              <h2 className="mt-2 text-2xl font-extrabold text-slate-950">
                Gerçek ana hedefini kaydet.
              </h2>
            </div>

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Ana Hedef Adı
                </label>

                <input
                  value={targetName}
                  onChange={(event) => setTargetName(event.target.value)}
                  type="text"
                  placeholder="Örnek: YKS 2027, Final Sınavı, AWS Sertifikası"
                  className="w-full rounded-2xl border border-orange-100 bg-orange-50/30 px-4 py-3 text-sm font-semibold outline-none transition placeholder:text-slate-400 focus:border-orange-300 focus:bg-white focus:ring-4 focus:ring-orange-100"
                />
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Hedef Tarihi
                  </label>

                  <input
                    value={targetDate}
                    onChange={(event) => setTargetDate(event.target.value)}
                    type="date"
                    className="w-full rounded-2xl border border-orange-100 bg-orange-50/30 px-4 py-3 text-sm font-semibold outline-none transition focus:border-orange-300 focus:bg-white focus:ring-4 focus:ring-orange-100"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-slate-700">
                    Hedef Saati
                  </label>

                  <input
                    value={targetTime}
                    onChange={(event) => setTargetTime(event.target.value)}
                    type="time"
                    className="w-full rounded-2xl border border-orange-100 bg-orange-50/30 px-4 py-3 text-sm font-semibold outline-none transition focus:border-orange-300 focus:bg-white focus:ring-4 focus:ring-orange-100"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-bold text-slate-700">
                  Hedef Açıklaması
                </label>

                <textarea
                  value={targetDescription}
                  onChange={(event) =>
                    setTargetDescription(event.target.value)
                  }
                  rows={5}
                  placeholder="Bu hedef senin için neden önemli?"
                  className="w-full resize-none rounded-2xl border border-orange-100 bg-orange-50/30 px-4 py-3 text-sm font-semibold outline-none transition placeholder:text-slate-400 focus:border-orange-300 focus:bg-white focus:ring-4 focus:ring-orange-100"
                />
              </div>
            </div>

            <div className="mt-7 flex flex-col gap-3 sm:flex-row">
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
                {isSaving ? "Kaydediliyor..." : "Ana Hedefi Kaydet"}
              </motion.button>

              {savedTarget ? (
                <button
                  type="button"
                  onClick={handleRemoveTarget}
                  className="rounded-2xl border border-rose-100 bg-white px-6 py-3.5 text-sm font-bold text-rose-600 shadow-sm transition hover:border-rose-200 hover:bg-rose-50"
                >
                  Hedefi Kaldır
                </button>
              ) : null}

              <a
                href="/student/dashboard"
                className="rounded-2xl border border-orange-100 bg-white px-6 py-3.5 text-center text-sm font-bold text-slate-700 shadow-sm transition hover:border-orange-200 hover:text-orange-600"
              >
                Panele Dön
              </a>
            </div>
          </motion.form>

          <motion.aside
            variants={scrollReveal}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: false, amount: 0.18 }}
            transition={{ duration: 0.75, ease: "easeOut" }}
            className="space-y-6"
          >
            <div className="overflow-hidden rounded-[36px] border border-orange-100 bg-[radial-gradient(circle_at_top_left,_rgba(251,146,60,0.18),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(245,158,11,0.12),_transparent_30%),linear-gradient(135deg,_#FFFFFF,_#FFF7ED)] p-7 shadow-sm">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-500">
                Canlı Geri Sayım Önizlemesi
              </p>

              {hasPreview ? (
                <>
                  <h2 className="mt-3 text-4xl font-extrabold text-slate-950 md:text-5xl">
                    {targetName}
                  </h2>

                  <p className="mt-3 leading-7 text-slate-600">
                    {targetDescription || "Henüz açıklama yok."}
                  </p>

                  <div className="mt-7 grid gap-3 sm:grid-cols-4">
                    <motion.div
                      whileHover={{ y: -5, scale: 1.03 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="rounded-3xl border border-orange-100 bg-white px-5 py-5 text-center shadow-sm"
                    >
                      <p className="text-4xl font-extrabold text-orange-600">
                        {countdown.days}
                      </p>
                      <p className="mt-1 text-sm font-bold text-slate-500">
                        gün
                      </p>
                    </motion.div>

                    <motion.div
                      whileHover={{ y: -5, scale: 1.03 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="rounded-3xl border border-orange-100 bg-white px-5 py-5 text-center shadow-sm"
                    >
                      <p className="text-4xl font-extrabold text-amber-600">
                        {countdown.hours}
                      </p>
                      <p className="mt-1 text-sm font-bold text-slate-500">
                        saat
                      </p>
                    </motion.div>

                    <motion.div
                      whileHover={{ y: -5, scale: 1.03 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="rounded-3xl border border-orange-100 bg-white px-5 py-5 text-center shadow-sm"
                    >
                      <p className="text-4xl font-extrabold text-emerald-600">
                        {countdown.minutes}
                      </p>
                      <p className="mt-1 text-sm font-bold text-slate-500">
                        dakika
                      </p>
                    </motion.div>

                    <motion.div
                      whileHover={{ y: -5, scale: 1.03 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="rounded-3xl border border-orange-100 bg-white px-5 py-5 text-center shadow-sm"
                    >
                      <p className="text-4xl font-extrabold text-slate-950">
                        {countdown.seconds}
                      </p>
                      <p className="mt-1 text-sm font-bold text-slate-500">
                        saniye
                      </p>
                    </motion.div>
                  </div>
                </>
              ) : (
                <div className="py-10 text-center">
                  <p className="text-5xl">🎯</p>

                  <h2 className="mx-auto mt-4 max-w-xl text-3xl font-extrabold text-slate-950">
                    Henüz önizleme oluşturulmadı.
                  </h2>

                  <p className="mx-auto mt-3 max-w-xl leading-7 text-slate-600">
                    Hedef adı, tarih ve saat girildiğinde geri sayım
                    önizlemesi burada görünecek.
                  </p>
                </div>
              )}
            </div>

            <div className="rounded-[34px] border border-orange-100 bg-white p-6 shadow-sm">
              <p
                className={`${caveat.className} text-3xl font-bold text-orange-600`}
              >
                Panel bağlantısı hazır.
              </p>

              <p className="mt-3 leading-7 text-slate-600">
                Ana Hedef kaydedildiğinde Paneldeki boş alan otomatik olarak
                hedef adına, tarihe ve geri sayım değerlerine dönüşür.
              </p>
            </div>

            <div className="rounded-[34px] border border-orange-100 bg-white p-6 shadow-sm">
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-500">
                Kayıt Durumu
              </p>

              <p className="mt-4 text-2xl font-extrabold text-slate-950">
                {savedTarget ? "Hedef kaydedildi" : "Kayıtlı hedef yok"}
              </p>

              <p className="mt-2 text-sm font-medium text-slate-500">
                {savedTarget
                  ? "Bu hedef Supabase içinde bu kullanıcıya ait kayıtlı."
                  : "Panel şu anda + Ana Hedef gösterecek."}
              </p>
            </div>
          </motion.aside>
        </div>
      </div>
    </StudentLayout>
  );
}
