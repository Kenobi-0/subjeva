"use client";

import { motion } from "framer-motion";
import { Caveat, Inter } from "next/font/google";
import BrandLogo from "../components/BrandLogo";

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
    y: 36,
  },
  visible: {
    opacity: 1,
    y: 0,
  },
};

const fadeDown = {
  hidden: {
    opacity: 0,
    y: -24,
  },
  visible: {
    opacity: 1,
    y: 0,
  },
};

const staggerContainer = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.14,
    },
  },
};

const whyCards = [
  {
    tag: "Kişisel Planlama",
    title: "Gerçek hayatına uygun bir çalışma alanı oluştur.",
    text: "Sabit kategorilere sıkışmak yerine kendi konularını, derslerini, projelerini veya çalışma alanlarını ekle. Subjeva senin çalışma düzenine uyum sağlar.",
    accent: "text-orange-700 bg-orange-50 ring-orange-100",
    iconBg: "bg-orange-500",
  },
  {
    tag: "Odak ve Devamlılık",
    title: "Odağı günlük bir alışkanlığa dönüştür.",
    text: "Odak seansları, günlük çalışma dakikaları ve düzenli takip sistemiyle çalışma ritmini güçlendir. Subjeva sadece düzenli görünmeni değil, gerçekten devam etmeni destekler.",
    accent: "text-amber-700 bg-amber-50 ring-amber-100",
    iconBg: "bg-amber-500",
  },
  {
    tag: "Görünür İlerleme",
    title: "Gerçekten neyi tamamladığını gör.",
    text: "Tamamlanan dersleri, hedef tarihlerini ve ilerleme yüzdelerini takip et. Emeğin görünür, ölçülebilir ve devam etmesi daha kolay hale gelir.",
    accent: "text-emerald-700 bg-emerald-50 ring-emerald-100",
    iconBg: "bg-emerald-500",
  },
];

const modeCards = [
  {
    mode: "Öğrenci Modu",
    title: "Kopmadan ve dağılmadan çalış.",
    text: "Matematik, Makine Öğrenmesi, İngilizce Konuşma veya sınav hazırlığı gibi konular oluştur. Hedef tarihleri, notlar, odak seansları ve tamamlanan derslerle öğrenme ilerlemeni net şekilde takip et.",
    items: [
      "Kişisel konu takibi",
      "Sınav ve hedef tarihi görünürlüğü",
      "Odak seansları ve çalışma düzeni",
      "Tamamlanan derslere göre ilerleme",
    ],
    accent: "text-orange-700 bg-orange-50 ring-orange-100",
    button: "bg-orange-500 hover:bg-orange-600",
    cta: "Öğrenci Olarak Başla",
  },
  {
    mode: "Çalışan Modu",
    title: "Görevlerin içinde kaybolmadan çalış.",
    text: "Projelerini, müşteri işlerini veya şirket sorumluluklarını oluştur. Görevleri, teslim tarihlerini, iş notlarını ve haftalık önceliklerini dağınık bir yapılacaklar listesine dönüştürmeden takip et.",
    items: [
      "Proje ve şirket takibi",
      "Teslim tarihi odaklı planlama",
      "Görev tamamlama ilerlemesi",
      "İş notları ve haftalık planlar",
    ],
    accent: "text-amber-700 bg-amber-50 ring-amber-100",
    button: "bg-amber-500 hover:bg-amber-600",
    cta: "Çalışan Olarak Başla",
  },
];

const navItems = [
  {
    label: "Panel",
    href: "#",
  },
  {
    label: "Öğrenci",
    href: "#workspace",
  },
  {
    label: "Çalışma Alanları",
    href: "#workspace",
  },
  {
    label: "İlerleme",
    href: "#why-subjeva",
  },
  {
    label: "Özellikler",
    href: "#why-subjeva",
  },
  {
    label: "Ayarlar",
    href: "#",
  },
];

export default function Home() {
  return (
    <main
      className={`${inter.className} min-h-screen overflow-hidden bg-[#fffaf5] text-slate-950`}
    >
      {/* Top Navigation */}
      <motion.header
        variants={fadeDown}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-xl"
      >
        <div className="mx-auto flex max-w-[1600px] items-center justify-between px-6 py-4">
          <div className="flex items-center">
            <BrandLogo size="sm" />
          </div>

          <nav className="hidden items-center gap-2 lg:flex">
            {navItems.map((item, index) => (
              <a
                key={item.label}
                href={item.href}
                className={`rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
                  index === 0
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-700 hover:bg-orange-50 hover:text-orange-600"
                }`}
              >
                {item.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <a
              href="/login"
              className="hidden rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 md:inline-flex"
            >
              Giriş Yap
            </a>

            <a
              href="/signup"
              className="rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-600"
            >
              Çalışma Alanı Oluştur
            </a>
          </div>
        </div>
      </motion.header>

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-orange-100 bg-[radial-gradient(circle_at_top_left,_rgba(251,146,60,0.12),_transparent_28%),radial-gradient(circle_at_top_right,_rgba(245,158,11,0.10),_transparent_28%),linear-gradient(180deg,_#fffaf5_0%,_#fff7ed_100%)]">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(15,23,42,0.03)_1px,_transparent_1px),linear-gradient(90deg,_rgba(15,23,42,0.03)_1px,_transparent_1px)] bg-[size:72px_72px]" />
        <div className="absolute left-1/2 top-24 h-80 w-80 -translate-x-1/2 rounded-full bg-orange-200/50 blur-[100px]" />
        <div className="absolute -left-24 top-64 h-72 w-72 rounded-full bg-amber-200/50 blur-[100px]" />
        <div className="absolute -right-24 top-64 h-72 w-72 rounded-full bg-orange-100/70 blur-[100px]" />

        <div className="relative mx-auto max-w-6xl px-6 py-20 text-center md:py-28">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.65, ease: "easeOut" }}
              className="mb-6 inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-orange-600 shadow-sm ring-1 ring-orange-100"
            >
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Planla. Odaklan. İlerle.
            </motion.div>

            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.7, ease: "easeOut" }}
              className={`${caveat.className} mb-3 text-3xl font-bold text-orange-600 md:text-4xl`}
            >
              Hedeflerin dağınık bir yapılacaklar listesinden fazlasını hak ediyor.
            </motion.p>

            <motion.h2
              variants={fadeUp}
              transition={{ duration: 0.75, ease: "easeOut" }}
              className="mx-auto max-w-5xl text-4xl font-extrabold leading-tight tracking-tight text-slate-950 md:text-7xl"
            >
              Dağınık konuları ve projeleri{" "}
              <span className="relative inline-block">
                <span className="bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500 bg-clip-text text-transparent">
                  gerçekten takip edebileceğin bir sisteme dönüştür
                </span>
                <span className="absolute -bottom-2 left-2 right-2 h-2 rounded-full bg-orange-200/70" />
              </span>
              .
            </motion.h2>

            <motion.p
              variants={fadeUp}
              transition={{ duration: 0.75, ease: "easeOut" }}
              className="mx-auto mt-8 max-w-3xl text-base leading-8 text-slate-600 md:text-xl"
            >
              Subjeva; konularını, projelerini, notlarını, hedef tarihlerini,
              odak seanslarını ve ilerlemeni sakin bir çalışma alanında toplar.
              Böylece sırada ne olduğunu ve ne kadar ilerlediğini her zaman
              net şekilde görürsün.
            </motion.p>

            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.75, ease: "easeOut" }}
              className="mx-auto mt-8 flex max-w-3xl flex-wrap justify-center gap-3"
            >
              {[
                "Kişisel konular",
                "Proje ilerlemesi",
                "Odak seansları",
                "Günlük devamlılık",
                "Notlar ve hedef tarihleri",
              ].map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-orange-100 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm"
                >
                  {item}
                </span>
              ))}
            </motion.div>

            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.75, ease: "easeOut" }}
              className="mt-11 flex flex-col justify-center gap-4 sm:flex-row"
            >
              <motion.a
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
                href="/signup"
                className="rounded-xl bg-orange-500 px-7 py-3.5 text-center text-sm font-semibold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-600"
              >
                Çalışma alanını oluştur
              </motion.a>

              <motion.a
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
                href="#why-subjeva"
                className="rounded-xl border border-slate-200 bg-white px-7 py-3.5 text-center text-sm font-semibold text-slate-700 shadow-sm transition hover:border-orange-200 hover:text-orange-600"
              >
                Subjeva nasıl çalışır?
              </motion.a>
            </motion.div>

            <motion.div
              variants={fadeUp}
              transition={{ duration: 0.75, ease: "easeOut" }}
              className="mx-auto mt-14 grid max-w-4xl gap-4 md:grid-cols-3"
            >
              <div className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Öğrenciler için</p>
                <p className="mt-2 text-xl font-bold text-orange-600">
                  Hedeflerinle birlikte ilerleyen konular.
                </p>
              </div>

              <div className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Çalışanlar için</p>
                <p className="mt-2 text-xl font-bold text-amber-600">
                  Karmaşaya dönüşmeyen projeler.
                </p>
              </div>

              <div className="rounded-2xl border border-orange-100 bg-white p-5 shadow-sm">
                <p className="text-sm text-slate-500">Herkes için</p>
                <p className="mt-2 text-xl font-bold text-emerald-600">
                  Gerçekten görebileceğin ilerleme.
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Why Section */}
      <section
        id="why-subjeva"
        className="relative mx-auto max-w-7xl px-6 py-24"
      >
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="mb-12 text-center"
        >
          <p
            className={`${caveat.className} text-3xl font-bold text-orange-600 md:text-4xl`}
          >
            Her şey dağınık hissettirdiğinde bile düzen kurman için tasarlandı.
          </p>

          <h3 className="mt-4 text-3xl font-extrabold text-slate-950 md:text-5xl">
            “Bir şeyler yapmam lazım” noktasından
            <br />
            <span className="text-orange-600">
              “Sırada ne var biliyorum” noktasına geç.
            </span>
          </h3>

          <p className="mx-auto mt-5 max-w-2xl text-slate-500">
            Çoğu araç sadece liste gösterir. Subjeva ise çalışmana net bir yapı
            kazandırır: neyi takip ediyorsun, ne bitti, sırada ne var ve ne
            kadar düzenli ilerliyorsun.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid gap-6 md:grid-cols-3"
        >
          {whyCards.map((card) => (
            <motion.div
              key={card.title}
              variants={fadeUp}
              whileHover={{ y: -10, scale: 1.025 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
              className="rounded-[28px] border border-orange-100 bg-white p-7 shadow-sm transition hover:shadow-xl"
            >
              <div
                className={`mb-5 flex h-11 w-11 items-center justify-center rounded-2xl ${card.iconBg} text-white shadow-sm`}
              >
                ✓
              </div>

              <div
                className={`mb-4 inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${card.accent}`}
              >
                {card.tag}
              </div>

              <h4 className="text-2xl font-bold text-slate-950">
                {card.title}
              </h4>

              <p className="mt-4 leading-7 text-slate-600">{card.text}</p>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Workspace Section */}
      <section id="workspace" className="mx-auto max-w-7xl px-6 pb-24">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="mb-12 text-center"
        >
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-500">
            Çalışma alanını seç
          </p>

          <h3 className="mt-4 text-3xl font-extrabold text-slate-950 md:text-5xl">
            Ders hedefleri ve iş hedefleri için
            <br />
            tek platform.
          </h3>

          <p className="mx-auto mt-5 max-w-2xl text-slate-500">
            Sınava hazırlanıyor, yeni bir beceri öğreniyor veya gerçek iş
            projelerini yönetiyor olabilirsin. Subjeva sana planlamak, takip
            etmek ve devam etmek için odaklı bir alan sunar.
          </p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid gap-6 md:grid-cols-2"
        >
          {modeCards.map((card) => (
            <motion.div
              key={card.mode}
              variants={fadeUp}
              whileHover={{ y: -10, scale: 1.015 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
              className="rounded-[32px] border border-orange-100 bg-white p-8 shadow-sm transition hover:shadow-xl"
            >
              <div
                className={`mb-5 inline-flex rounded-full px-3 py-1 text-xs font-semibold ring-1 ${card.accent}`}
              >
                {card.mode}
              </div>

              <h4 className="text-3xl font-extrabold text-slate-950">
                {card.title}
              </h4>

              <p className="mt-4 leading-7 text-slate-600">{card.text}</p>

              <div className="mt-7 grid gap-3">
                {card.items.map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-orange-100 bg-orange-50/40 px-4 py-3 text-sm font-medium text-slate-600"
                  >
                    ✓ {item}
                  </div>
                ))}
              </div>

              <a
                href="/signup"
                className={`mt-7 inline-flex rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-sm transition ${card.button}`}
              >
                {card.cta}
              </a>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Bottom CTA */}
      <section className="px-6 pb-24">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.25 }}
          transition={{ duration: 0.75, ease: "easeOut" }}
          className="mx-auto max-w-7xl overflow-hidden rounded-[36px] border border-orange-100 bg-[radial-gradient(circle_at_top_left,_rgba(251,146,60,0.16),_transparent_30%),radial-gradient(circle_at_bottom_right,_rgba(245,158,11,0.12),_transparent_30%),linear-gradient(135deg,_#FFFFFF,_#FFF7ED)] p-9 text-center shadow-sm"
        >
          <p
            className={`${caveat.className} text-3xl font-bold text-orange-600 md:text-4xl`}
          >
            Planın seni tekrar çalışmaya çekmeli.
          </p>

          <h4 className="mx-auto mt-4 max-w-4xl text-3xl font-extrabold text-slate-950 md:text-5xl">
            İlerlemeyi görünür hale getiren bir çalışma alanı oluştur.
          </h4>

          <p className="mx-auto mt-5 max-w-2xl text-slate-600">
            Subjeva, sadece liste isteyenler için değil; kendi sistemini kurmak,
            odağını korumak ve ne yaptığını net görmek isteyen öğrenciler ve
            çalışanlar için tasarlandı.
          </p>

          <div className="mt-9 flex flex-col justify-center gap-4 sm:flex-row">
            <motion.a
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              href="/signup"
              className="rounded-xl bg-orange-500 px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-orange-200 transition hover:bg-orange-600"
            >
              Çalışma alanını oluştur
            </motion.a>

            <motion.a
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.97 }}
              href="/login"
              className="rounded-xl border border-slate-200 bg-white px-7 py-3.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-orange-200 hover:text-orange-600"
            >
              Giriş Yap
            </motion.a>
          </div>
        </motion.div>
      </section>
    </main>
  );
}
