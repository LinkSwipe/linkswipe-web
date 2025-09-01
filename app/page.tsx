"use client";

import React, { useMemo, useRef, useState } from "react";
import Image from 'next/image';

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
//
// UPDATED: Added a 'platform' property for each profile
// ------------------------------------------------------------
const APPROVED_PROFILES = [
  {
    id: "p1",
    name: "Maya Collins",
    photoUrl:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=1200&q=80&auto=format&fit=crop",
    link: "https://instagram.com/mayacollins",
    platform: "instagram"
  },
  {
    id: "p2",
    name: "Leo Martinez",
    photoUrl:
      "https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=1200&q=80&auto=format&fit=crop",
    link: "https://x.com/leomartinez",
    platform: "twitter" // We'll use 'twitter' for X.com
  },
  {
    id: "p3",
    name: "Aiko Tanaka",
    photoUrl:
      "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=1200&q=80&auto=format&fit=crop",
    link: "https://facebook.com/aikotanaka",
    platform: "facebook"
  },
  {
    id: "p4",
    name: "Chen Wei",
    photoUrl:
      "https://images.unsplash.com/photo-1560272023-e17540248a31?w=1200&q=80&auto=format&fit=crop",
    link: "https://tiktok.com/@chenwei",
    platform: "tiktok"
  }
];

// New function: returns logo path based on platform name
const getPlatformLogo = (platform: string) => {
  switch (platform) {
    case 'instagram':
      return '/instagram.svg';
    case 'twitter': // X.com
      return '/twitter.svg';
    case 'facebook':
      return '/facebook.svg';
    case 'tiktok':
      return '/tiktok.svg';
    default:
      return '/globe.svg'; // Fallback logo
  }
};

export default function LinkSwipeApp() {
  const [index, setIndex] = useState(0);
  const [showSubmit, setShowSubmit] = useState(false);
  const [showLegal, setShowLegal] = useState(false);
  const [toast, setToast] = useState("");

  const current = APPROVED_PROFILES[index] ?? null;

  // Swipe gesture refs
  const cardRef = useRef<HTMLDivElement>(null);
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

  const handleSwipeDecision = (dir: "left" | "right") => {
    if (!current) return;
    if (dir === "right") {
      window.open(current.link, "_blank", "noopener,noreferrer");
    }
    setIndex((i) => i + 1);
  };
    
  // Handle mouse events
  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    dragging.current = true;
    startX.current = e.clientX;
    currentX.current = startX.current;
  };

  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!dragging.current || !cardRef.current) return;
    const x = e.clientX;
    currentX.current = x;
    const dx = x - startX.current;
    const rot = Math.max(-15, Math.min(15, dx / 12));
    cardRef.current.style.transform = `translateX(${dx}px) rotate(${rot}deg)`;
    cardRef.current.style.opacity = `${Math.max(0.6, 1 - Math.abs(dx) / 600)}`;
  };
    
  // Handle touch events
  const onTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    dragging.current = true;
    startX.current = e.touches[0].clientX;
    currentX.current = startX.current;
  };

  const onTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!dragging.current || !cardRef.current) return;
    const x = e.touches[0].clientX;
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
  const pushToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2600);
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-fuchsia-500 via-sky-500 to-emerald-400 text-white">
      <header className="mx-auto max-w-5xl px-4 py-6 flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight drop-shadow-sm">
          Link Swipe
        </h1>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-24">
        <section className="grid place-items-center gap-8">
          <div className="w-full max-w-md">
            <div className="mb-4 text-center">
              <h2 className="text-xl font-bold">Discover social profiles</h2>
              <p className="text-white/90 text-sm">Swipe left to pass, right to like.</p>
            </div>

            <div className="relative h-[520px] select-none mx-auto">
              {!current && (
                <div className="absolute inset-0 flex items-center justify-center rounded-3xl border border-white/20 bg-white/10 p-10 text-center">
                  <div>
                    <p className="text-lg font-semibold">You&apos;ve seen all profiles ✨</p>
                    <p className="text-white/80 text-sm mt-2">Check back later for new profiles.</p>
                  </div>
                </div>
              )}

              {current && (
                <article
                  ref={cardRef}
                  className="absolute inset-0 rounded-3xl overflow-hidden shadow-2xl border border-white/10 bg-black/30 backdrop-blur-xl"
                  onMouseDown={onMouseDown}
                  onMouseMove={onMouseMove}
                  onMouseUp={onPointerUp}
                  onMouseLeave={() => dragging.current && onPointerUp()}
                  onTouchStart={onTouchStart}
                  onTouchMove={onTouchMove}
                  onTouchEnd={onPointerUp}
                >
                  <div className="block w-full h-full group">
                    <Image
                      src={current.photoUrl}
                      alt={current.name}
                      width={1200}
                      height={900}
                      className="h-4/5 w-full object-cover transition group-hover:opacity-95"
                      draggable={false}
                    />
                    <div className="h-1/5 w-full flex items-center justify-between px-5 bg-gradient-to-t from-black/60 to-transparent -mt-16 pt-16">
                      <div>
                        <h3 className="text-2xl font-extrabold drop-shadow-sm">{current.name}</h3>
                        <p className="text-white/85 text-sm">Click to open profile</p>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleSwipeDecision("left");
                          }}
                          className="h-12 w-12 rounded-full bg-red-500/90 hover:bg-red-500 transition shadow-lg flex items-center justify-center"
                          aria-label="Pass"
                          title="Pass"
                        >
                          ✖
                        </button>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleSwipeDecision("right");
                          }}
                          className="h-12 w-12 rounded-full bg-emerald-500/90 hover:bg-emerald-500 transition shadow-lg flex items-center justify-center"
                          aria-label="Open Profile"
                          title="Open Profile"
                        >
                          ✓
                        </button>
                      </div>
                    </div>
                  </div>
                  {/* Yeni eklenen: Sosyal medya logosu */}
                  <Image
                    src={getPlatformLogo(current.platform)}
                    alt={`${current.platform} logo`}
                    width={40}
                    height={40}
                    className="absolute top-4 left-4"
                  />
                </article>
              )}
            </div>
            
            <div className="mt-8 text-center">
                <button
                  onClick={() => setShowSubmit(true)}
                  className="rounded-2xl bg-white/10 px-6 py-3 text-lg font-semibold backdrop-blur hover:bg-white/20 transition shadow-lg"
                >
                  Promote your Profile ($10)
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
                Promote your Profile ($10)
            </button>
            <a
                href="#"
                onClick={(e) => {
                    e.preventDefault();
                    setShowLegal(true);
                }}
                className="text-white/90 hover:text-white underline decoration-white/40 decoration-2 underline-offset-4"
            >
                Legal
            </a>
        </div>
        <p>© {new Date().getFullYear()} Link Swipe. All rights reserved.</p>
      </footer>

      {showSubmit && (
        <Modal onClose={() => setShowSubmit(false)} title="Promote Your Profile ($10)">
          <SubmitProfileCard onToast={pushToast} onOpenLegal={() => setShowLegal(true)} />
        </Modal>
      )}

      {showLegal && (
        <Modal onClose={() => setShowLegal(false)} title="Legal – Terms of Use and Privacy Policy">
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

function SubmitProfileCard({ onToast, onOpenLegal }: { onToast: (msg: string) => void; onOpenLegal: () => void }) {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [link, setLink] = useState("");
  const [platform, setPlatform] = useState(""); // Yeni state eklendi
  const [file, setFile] = useState<File | null>(null);
  const [agreed, setAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const filePreview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  const validate = () => {
    if (!name.trim()) return "Your Name is required";
    if (!username.trim()) return "Your Username is required";
    if (!platform) return "Please select a platform"; // Yeni validasyon kuralı
    if (!/^https?:\/\//i.test(link)) return "Link must start with http:// or https://";

    // New: Allow only specific links
    const allowedLinks = ["instagram.com", "x.com", "facebook.com", "tiktok.com"];
    const isAllowed = allowedLinks.some(domain => link.includes(domain));
    if (!isAllowed) {
      return "The link must be for Facebook, X (Twitter), Instagram, or TikTok.";
    }

    if (!file) return "Profile image file is required";
    if (!agreed) return "You must accept the legal terms";
    return null;
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const err = validate();
    if (err) {
      onToast(err);
      return;
    }
    setSubmitting(true);

    // Submitting form information (This is just a frontend placeholder)
    console.log("Submitting form data:", { name, username, link, platform, file: file?.name });
    
    // Open payment link (Gumroad link)
    window.open("https://profilehub.gumroad.com/l/jqtpsg", "_blank", "noopener,noreferrer");

    // Inform user
    onToast(
      "You are being redirected to the payment page. Please complete the payment. After payment, your profile will be submitted for review."
    );

    setSubmitting(false);

    // Clear form
    setName("");
    setUsername("");
    setLink("");
    setPlatform(""); // Form temizlenirken platform bilgisini de temizle
    setFile(null);
    setAgreed(false);
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm mb-1">Your Name</label>
          <input
            className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 outline-none placeholder-white/70"
            placeholder="Jane Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Your Username</label>
          <input
            className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 outline-none placeholder-white/70"
            placeholder="@janedoe"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
      </div>

      {/* Yeni eklenen: Platform Seçimi */}
      <div>
          <label className="block text-sm mb-1">Platform Seçiniz</label>
          <p className="text-white/80 text-xs mb-2">Lütfen profilinizin ait olduğu platformu seçin.</p>
          <select
              className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 outline-none text-white/90"
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              required
          >
              <option value="" disabled className="bg-black text-white/50">-- Seçiniz --</option>
              <option value="instagram" className="bg-black">Instagram</option>
              <option value="tiktok" className="bg-black">TikTok</option>
              <option value="twitter" className="bg-black">X (Twitter)</option>
              <option value="facebook" className="bg-black">Facebook</option>
          </select>
      </div>

      <div>
        <label className="block text-sm mb-1">Social Media Link</label>
        <p className="text-white/80 text-xs mb-2">Only Facebook, X (Twitter), Instagram, or TikTok links are accepted.</p>
        <input
          className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2 outline-none placeholder-white/70"
          placeholder="https://instagram.com/yourusername"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          required
          inputMode="url"
        />
      </div>

      <div>
        <label className="block text-sm mb-1">Profile Photo (file)</label>
        <input
          type="file"
          accept="image/*"
          className="w-full rounded-xl border border-white/20 bg-white/10 px-3 py-2"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
          required
        />
        {filePreview && (
          <div className="mt-3">
            <Image
              src={filePreview}
              alt="Preview"
              width={160}
              height={160}
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
          I have read and agree to the{" "}
          <button
            type="button"
            onClick={onOpenLegal}
            className="underline decoration-white/40 decoration-2 underline-offset-4"
          >
            Terms of Use, Privacy Policy, and Legal Disclaimer
          </button>
          . I understand that my profile will not be published until approved by an administrator and payment is confirmed.
        </span>
      </label>

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={submitting}
          className="rounded-2xl bg-emerald-400 px-6 py-3 font-bold text-black hover:bg-emerald-300 shadow disabled:opacity-60"
        >
          {submitting ? "Submitting..." : "Pay $10 to Promote"}
        </button>
      </div>
    </form>
  );
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
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
            aria-label="Close"
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
        <h4 className="font-bold text-white text-base">1) Terms of Use</h4>
        <h5 className="font-bold text-white/95 mt-2">Definitions and Scope</h5>
        <p>
          These "Terms of Use" apply to all users of LinkSwipe (hereinafter “Platform”). Anyone who accesses the Platform, creates a profile, shares links, or views content is deemed to have accepted these terms.
        </p>
        <h5 className="font-bold text-white/95 mt-2">Acceptance of Terms</h5>
        <p>
          By using the Platform, you agree that:
        </p>
        <ul className="list-disc ml-5 mt-2 space-y-1">
          <li>You are over 18 years old.</li>
          <li>You are acting on your own behalf.</li>
          <li>You have read and agreed to this document, the Privacy Policy, and other legal documents.</li>
          <li>You are fully responsible for all content you share.</li>
        </ul>
        <p className="mt-2">If you do not agree with these terms, please do not use the Platform.</p>
        <h5 className="font-bold text-white/95 mt-2">User Content and Responsibility</h5>
        <p>Content uploaded by users:</p>
        <ul className="list-disc ml-5 mt-2 space-y-1">
          <li>Name, profile photo, and social media links are entirely owned by the user.</li>
          <li>Only links from Facebook, TikTok, X (Twitter), or Instagram are accepted. Any other social media platforms or external links will not be published.</li>
          <li>No copyright infringement, confidential information, or personal data of third parties.</li>
          <li>No offensive, defamatory, illegal, or harmful content.</li>
        </ul>
        <p className="mt-2">The Platform does not pre-screen content. All legal responsibility lies with the user.</p>
        <h5 className="font-bold text-white/95 mt-2">Prohibited Content</h5>
        <p>The following content is strictly prohibited:</p>
        <ul className="list-disc ml-5 mt-2 space-y-1">
          <li>Hate speech, racism, sexism, calls for violence</li>
          <li>Pornographic or sexual content</li>
          <li>Child abuse, drugs, weapons, suicide, or illegal activities</li>
          <li>Defamation or insults targeting real individuals</li>
        </ul>
        <p className="mt-2">Violation may result in content removal, user suspension, and, if necessary, notification to authorities.</p>
        <h5 className="font-bold text-white/95 mt-2">Payments and Refunds</h5>
        <p>
          Users who want to add profiles pay USD 10.
        </p>
        <ul className="list-disc ml-5 mt-2 space-y-1">
          <li>Payments are processed via Gumroad. LinkSwipe does not store any card information.</li>
          <li>Payments are non-refundable (including site closure, content removal, or technical issues).</li>
          <li>If users submit links outside of Facebook, TikTok, X (Twitter), or Instagram, the profile will not be published and no refund will be provided.</li>
        </ul>
        <h5 className="font-bold text-white/95 mt-2">Service Modification and Suspension</h5>
        <p>
          The Platform reserves the right to change, update, suspend, or fully terminate the service without prior notice.
        </p>
        <h5 className="font-bold text-white/95 mt-2">Changes to Terms</h5>
        <p>
          These terms may be updated from time to time. The most recent version on the website is the valid version.
          <br/>
          Last Updated: August 31, 2025
        </p>
      </section>

      <section>
        <h4 className="font-bold text-white text-base">2) Privacy and Data Protection Policy</h4>
        <h5 className="font-bold text-white/95 mt-2">Data Collected</h5>
        <ul className="list-disc ml-5 mt-2 space-y-1">
          <li>Profile information entered by users (name, photo, social media links – Facebook, TikTok, X (Twitter), Instagram only)</li>
          <li>IP address, browser information, session data</li>
          <li>Payment information processed via Gumroad; LinkSwipe does not store any card or bank information.</li>
        </ul>
        <h5 className="font-bold text-white/95 mt-2">Purpose of Data Processing</h5>
        <ul className="list-disc ml-5 mt-2 space-y-1">
          <li>Displaying and publishing profiles</li>
          <li>Technical support and service improvement</li>
          <li>Compliance with legal obligations</li>
        </ul>
        <h5 className="font-bold text-white/95 mt-2">Data Sharing</h5>
        <p>
          Personal data is not shared, sold, or rented to third parties.
        </p>
        <ul className="list-disc ml-5 mt-2 space-y-1">
          <li>Only shared under court orders or official requests.</li>
        </ul>
        <h5 className="font-bold text-white/95 mt-2">Data Retention</h5>
        <p>
          User data is retained unless a deletion request is made or legal obligations expire.
        </p>
        <p className="mt-2">
          Contact: 📧 llinkswipe@gmail.com
          <br/>
          Last Updated: August 31, 2025
        </p>
      </section>

      <section>
        <h4 className="font-bold text-white text-base">3) Legal Disclaimer and Copyright</h4>
        <ul className="list-disc ml-5 mt-2 space-y-1">
          <li>Users are responsible for all content they upload (name, photo, social links).</li>
          <li>Only links from Facebook, TikTok, X (Twitter), or Instagram are accepted. Submissions from other platforms will be rejected without refund.</li>
          <li>The Platform is not liable for user-generated content.</li>
          <li>Users confirm that uploaded content does not violate any copyright.</li>
          <li>Content may be reviewed or removed if complaints are received from third parties.</li>
          <li>LinkSwipe logo, design, and brand elements cannot be used without permission.</li>
        </ul>
        <p className="mt-2">
          Last Updated: August 31, 2025
        </p>
      </section>
    </div>
  );
}