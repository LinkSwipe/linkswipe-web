"use client";

import React, { useMemo, useRef, useState } from "react";

/**
 * LinkSwipe — MVP (Frontend-only)
 * ------------------------------------------------------------
 * ✅ No secrets, API keys, or private tokens in client code.
 * ✅ Admin manually adds APPROVED_PROFILES below (hardcoded or fetch from a public JSON).
 * ✅ Users can submit a profile request (not published until admin approval & payment).
 * ✅ Payment button is a placeholder — integrate Gumroad server-side only.
 * ✅ Legal text link + consent checkbox included.
 * ✅ Basic swipe left (Pass) / right (Like → open link) + buttons for accessibility.
 * ✅ Colorful, eye-catching UI. Turkish copy for instructions.
 * ✅ "Promote your profile" button moved below cards, opens form as a modal.
 * ✅ Top navigation cleaned up, legal links moved to footer.
 * ✅ Profile card horizontally centered.
 * ✅ Consolidated "Pay" and "Submit" buttons into a single "Pay to Promote" button.
 */

// ------------------------------------------------------------
// Admin: manually manage public, approved & paid profiles here
// (These appear in the swipe deck). Replace with your real data.
// You can also host a public JSON file and fetch it at runtime.
// ------------------------------------------------------------
const APPROVED_PROFILES = [
  {
    id: "p1",
    name: "Maya Collins",
    photoUrl:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=1200&q=80&auto=format&fit=crop",
    link: "https://instagram.com/"
  },
  {
    id: "p2",
    name: "Leo Martinez",
    photoUrl:
      "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=1200&q=80&auto=format&fit=crop",
    link: "https://tiktok.com/"
  },
  {
    id: "p3",
    name: "Aiko Tanaka",
    photoUrl:
      "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=1200&q=80&auto=format&fit=crop",
    link: "https://youtube.com/"
  }
];

export default function LinkSwipeApp() {
  const [index, setIndex] = useState(0);
  const [showSubmit, setShowSubmit] = useState(false);
  const [showLegal, setShowLegal] = useState(false);
  const [toast, setToast] = useState("");

  const current = APPROVED_PROFILES[index] ?? null;

  // Swipe gesture refs
  const cardRef = useRef(null);
  const startX = useRef(0);
  const currentX = useRef(0);
  const dragging = useRef(false);

  const resetTransform = () => {
    if (cardRef.current) {
      cardRef.current.style.transition = "transform 200ms ease, opacity 200ms ease";
      cardRef.current.style.transform = "translateX(0px) rotate(0deg)";
      cardRef.current.style.opacity = "1";
      setTimeout(() => {
        if (cardRef.current) cardRef.current.style.transition = "";
      }, 210);
    }
  };

  const handleSwipeDecision = (dir) => {
    // dir: "left" | "right"
    if (!current) return;
    if (dir === "right") {
      window.open(current.link, "_blank", "noopener,noreferrer");
    }
    setIndex((i) => i + 1);
  };

  const onPointerDown = (e) => {
    dragging.current = true;
    startX.current = e.type.startsWith("touch") ? e.touches[0].clientX : e.clientX;
    currentX.current = startX.current;
  };

  const onPointerMove = (e) => {
    if (!dragging.current || !cardRef.current) return;
    const x = e.type.startsWith("touch") ? e.touches[0].clientX : e.clientX;
    currentX.current = x;
    const dx = x - startX.current;
    const rot = Math.max(-15, Math.min(15, dx / 12));
    cardRef.current.style.transform = `translateX(${dx}px) rotate(${rot}deg)`;
    cardRef.current.style.opacity = `${Math.max(0.6, 1 - Math.abs(dx) / 600)}`;
  };

  const onPointerUp = () => {
    if (!dragging.current || !cardRef.current) return;
    dragging.current = false;
    const dx = currentX.current - startX.current;
    const threshold = 90;
    if (dx > threshold) {
      // swipe right
      cardRef.current.style.transition = "transform 220ms ease, opacity 220ms ease";
      cardRef.current.style.transform = "translateX(500px) rotate(20deg)";
      cardRef.current.style.opacity = "0";
      setTimeout(() => handleSwipeDecision("right"), 200);
      return;
    }
    if (dx < -threshold) {
      // swipe left
      cardRef.current.style.transition = "transform 220ms ease, opacity 220ms ease";
      cardRef.current.style.transform = "translateX(-500px) rotate(-20deg)";
      cardRef.current.style.opacity = "0";
      setTimeout(() => handleSwipeDecision("left"), 200);
      return;
    }
    resetTransform();
  };

  // Toast helper
  const pushToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2600);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-fuchsia-500 via-sky-500 to-emerald-400 text-white">
      <header className="mx-auto max-w-5xl px-4 py-6 flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight drop-shadow-sm">
          Bağlantı Kaydırma
        </h1>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-24">
        <section className="grid place-items-center gap-8">
          <div className="w-full max-w-md">
            <div className="mb-4 text-center">
              <h2 className="text-xl font-bold">Sosyal profilleri keşfedin</h2>
              <p className="text-white/90 text-sm">Geçmek için sola, kalmak için sağa kaydırın.</p>
            </div>

            <div className="relative h-[520px] select-none mx-auto">
              {!current && (
                <div className="absolute inset-0 flex items-center justify-center rounded-3xl border border-white/20 bg-white/10 p-10 text-center">
                  <div>
                    <p className="text-lg font-semibold">Tüm profilleri gördünüz ✨</p>
                    <p className="text-white/80 text-sm mt-2">Yeni profiller için daha sonra tekrar kontrol edin.</p>
                  </div>
                </div>
              )}

              {current && (
                <article
                  ref={cardRef}
                  className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-black/30 backdrop-blur-xl"
                  onMouseDown={onPointerDown}
                  onMouseMove={onPointerMove}
                  onMouseUp={onPointerUp}
                  onMouseLeave={() => dragging.current && onPointerUp()}
                  onTouchStart={onPointerDown}
                  onTouchMove={onPointerMove}
                  onTouchEnd={onPointerUp}
                >
                  <div className="block w-full h-full group">
                    <img
                      src={current.photoUrl}
                      alt={current.name}
                      className="h-4/5 w-full object-cover transition group-hover:opacity-95"
                      draggable={false}
                    />
                    <div className="h-1/5 w-full flex items-center justify-between px-5 bg-gradient-to-t from-black/60 to-transparent -mt-16 pt-16">
                      <div>
                        <h3 className="text-2xl font-extrabold drop-shadow-sm">{current.name}</h3>
                        <p className="text-white/85 text-sm">Profili açmak için tıklayın</p>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleSwipeDecision("left");
                          }}
                          className="h-12 w-12 rounded-full bg-red-500/90 hover:bg-red-500 transition shadow-lg flex items-center justify-center"
                          aria-label="Geç"
                          title="Geç"
                        >
                          ✖
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleSwipeDecision("right");
                          }}
                          className="h-12 w-12 rounded-full bg-emerald-500/90 hover:bg-emerald-500 transition shadow-lg flex items-center justify-center"
                          aria-label="Profili Aç"
                          title="Profili Aç"
                        >
                          ✓
                        </button>
                      </div>
                    </div>
                  </div>
                </article>
              )}
            </div>
            
            <div className="mt-8 text-center">
                <button
                    onClick={() => setShowSubmit(true)}
                    className="rounded-2xl bg-white/10 px-6 py-3 text-lg font-semibold backdrop-blur hover:bg-white/20 transition shadow-lg"
                >
                    Profilinizi Tanıtın (10$)
                </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="mx-auto max-w-5xl px-4 pb-10 text-sm text-white/90 mt-12 flex flex-col items-center justify-center gap-3">
        <div className="flex items-center gap-4">
            <button
                onClick={() => setShowSubmit(true)}
                className="rounded-2xl bg-white/10 px-4 py-2 text-sm font-semibold backdrop-blur hover:bg-white/20 transition"
            >
                Profilinizi Tanıtın (10$)
            </button>
            <a
                href="#"
                onClick={(e) => {
                    e.preventDefault();
                    setShowLegal(true);
                }}
                className="text-white/90 hover:text-white underline decoration-white/40 decoration-2 underline-offset-4"
            >
                Yasal
            </a>
        </div>
        <p>© {new Date().getFullYear()} Bağlantı Kaydırma. Tüm hakları saklıdır.</p>
      </footer>

      {showSubmit && (
        <Modal onClose={() => setShowSubmit(false)} title="Profilinizi Tanıtın (10$)">
          <SubmitProfileCard onToast={pushToast} onOpenLegal={() => setShowLegal(true)} />
        </Modal>
      )}

      {showLegal && (
        <Modal onClose={() => setShowLegal(false)} title="Yasal – Hizmet Şartları ve Gizlilik Politikası">
          <LegalDocs />
        </Modal>
      )}

      {!!toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-black/80 text-white px-4 py-2 rounded-xl shadow-lg border border-white/10">
          {toast}
        </div>
      )}
    </div>
  );
}

function SubmitProfileCard({ onToast, onOpenLegal }) {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [link, setLink] = useState("");
  const [file, setFile] = useState(null);
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const filePreview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  const validate = () => {
    if (!name.trim()) return "Adınız gerekli";
    if (!username.trim()) return "Kullanıcı adınız gerekli";
    if (!/^https?:\/\//i.test(link)) return "Link http:// veya https:// ile başlamalıdır";
    if (!file) return "Profil resmi dosyası gerekli";
    if (!agreed) return "Yasal şartları kabul etmelisiniz";
    return null;
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      onToast(err);
      return;
    }
    setSubmitting(true);

    // Form bilgilerini gönderme (Bu sadece bir ön yüz yer tutucusudur)
    console.log("Form verileri gönderiliyor:", { name, username, link, file: file.name });
    
    // Ödeme bağlantısını açma (Gumroad linki)
    window.open("https://gumroad.com/l/GUMROAD_ÜRÜN_LİNKİ", "_blank", "noopener,noreferrer");

    // Kullanıcıya bilgi verme
    onToast(
      "Ödeme sayfasına yönlendiriliyorsunuz. Lütfen ödemeyi tamamlayın. Ödeme sonrasında profiliniz incelenmek üzere bize ulaşacaktır."
    );

    setSubmitting(false);

    // Formu temizle
    setName("");
    setUsername("");
    setLink("");
    setFile(null);
    setAgreed(false);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm mb-1">Adınız</label>
          <input
            className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 outline-none placeholder-white/70"
            placeholder="Ayşe Yılmaz"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Kullanıcı Adınız</label>
          <input
            className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 outline-none placeholder-white/70"
            placeholder="@ayseyilmaz"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
      </div>

      <div>
        <label className="block text-sm mb-1">Tek Sosyal Medya Linki</label>
        <input
          className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 outline-none placeholder-white/70"
          placeholder="https://instagram.com/kullaniciadiniz"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          required
          inputMode="url"
        />
      </div>

      <div>
        <label className="block text-sm mb-1">Profil Fotoğrafı (dosya)</label>
        <input
          type="file"
          accept="image/*"
          className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          required
        />
        {filePreview && (
          <div className="mt-3">
            <img
              src={filePreview}
              alt="Önizleme"
              className="h-40 w-40 object-cover rounded-2xl border border-white/20"
            />
          </div>
        )}
      </div>

      <label className="flex items-start gap-3 text-sm text-white">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-1"
        />
        <span>
          {" "}
          <button
            type="button"
            onClick={onOpenLegal}
            className="underline decoration-white/40 decoration-2 underline-offset-4"
          >
            Hizmet Şartları ve Gizlilik Politikası'nı
          </button>
          {" "}okudum ve kabul ediyorum. Profilimin bir yönetici tarafından onaylanana ve ödeme onaylanana kadar yayınlanmayacağını anlıyorum.
        </span>
      </label>

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-2xl bg-emerald-400 px-6 py-3 font-bold text-black hover:bg-emerald-300 shadow disabled:opacity-60"
        >
          {submitting ? "Gönderiliyor..." : "Tanıtım İçin 10$ Öde"}
        </button>
      </div>
    </form>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative w-full max-w-2xl rounded-3xl border border-white/15 bg-white/10 text-white p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg md:text-xl font-bold">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-full bg-white/20 hover:bg-white/30 p-2"
            aria-label="Kapat"
          >
            ✖
          </button>
        </div>
        <div className="max-h-[70vh] overflow-auto pr-2">
          {children}
        </div>
      </div>
    </div>
  );
}

function LegalDocs() {
  return (
    <div className="space-y-6 text-white/95 text-sm leading-relaxed">
      <section>
        <h4 className="font-bold text-white text-base">Hizmet Şartları</h4>
        <p>
          LinkSwipe, herkese açık sosyal medya bağlantıları için bir keşif aracıdır. İçerik
          göndererek, yayınlama haklarına sahip olduğunuzu, içeriğin doğru, yasal olduğunu ve
          üçüncü taraf haklarını ihlal etmediğini onaylamış olursunuz. Herhangi bir profili
          kendi takdirimize bağlı olarak reddedebilir, kaldırabilir veya denetleyebiliriz.
          Yayınlama, manuel incelemeye ve başarılı ödemeye tabidir.
        </p>
        <ul className="list-disc ml-5 mt-2 space-y-1">
          <li>Profilinizde özel veya hassas veriler bulunmamalıdır.</li>
          <li>Taklit, spam veya yasa dışı içerik olmamalıdır.</li>
          <li>Profiller tanıtım amaçlıdır; görünürlük veya sonuç garantisi verilmez.</li>
          <li>Ödemeler PCI uyumlu bir sağlayıcı tarafından işlenir; kart verilerini saklamayız.</li>
          <li>Şartları ihlal eden içerik gönderdiğinizde, yapılan ödemeler iade edilmez.</li> {/* Yeni madde eklendi */}
        </ul>
      </section>

      <section>
        <h4 className="font-bold text-white text-base">Gizlilik Politikası</h4>
        <p>
          Hizmeti çalıştırmak için yalnızca gerekli verileri (ad, kullanıcı adı, herkese açık link,
          profil resmi) toplarız. Özel bilgileri eklemeyin. Gelecekte bir üçüncü taraf
          sağlayıcı ile oturum açarsanız, benzersiz kullanıcı kimliğiniz herkese açık olarak
          görüntülenmeyecektir.
        </p>
        <p className="mt-2">
          Gönderilen veriler, sıkı erişim kontrollerine sahip güvenli bulut altyapısında
          saklanabilir. Destek ile iletişime geçerek profilinizin silinmesini talep edebilirsiniz.
        </p>
      </section>

      <section>
        <h4 className="font-bold text-white text-base">Güvenlik</h4>
        <ul className="list-disc ml-5 mt-2 space-y-1">
          <li>Gizli anahtarları (API anahtarları, veritabanı şifreleri) istemci koduna asla dahil etmeyin.</li>
          <li>Tüm hassas işlemler (ödemeler, onaylar) sunucu tarafında yapılmalıdır.</li>
          <li>Tüm girdileri sunucuda temizleyin ve doğrulayın. İçerik Güvenlik Politikası (CSP) kullanın.</li>
          <li>Her yerde HTTPS kullanın ve oturumlar için HTTP-only, Güvenli çerezleri etkinleştirin.</li>
        </ul>
      </section>

      <section>
        <h4 className="font-bold text-white text-base">İadeler</h4>
        <p>
          Yasaların gerektirmediği sürece, profiliniz incelendikten sonra ödemeler iade edilmez.
          Eğer içeriğiniz Hizmet Şartlarını ihlal ediyorsa, ödemeniz iade edilmeden profiliniz reddedilebilir.
        </p>
      </section>

      <section>
        <h4 className="font-bold text-white text-base">İletişim</h4>
        <p>
          Her türlü soru veya kaldırma talebi için: support@linkswipe.example adresine ulaşın.
        </p>
      </section>
    </div>
  );
}