"use client";

import React, { useEffect, useRef, useState } from "react";
import { getApps, initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { motion, AnimatePresence } from "framer-motion";

// --------- Firebase config (client-safe) ----------
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const apps = getApps();
const app = !apps.length ? initializeApp(firebaseConfig) : apps[0];
const db = getFirestore(app);
const storage = getStorage(app);

// --------- Types ----------
type SocialLink = {
  platform: string;
  url?: string;
};

type Profile = {
  id: string;
  name: string;
  photoUrl: string;
  description?: string;
  platform?: string;
  link?: string;
  links?: SocialLink[];
  status?: string;
};

// --------- Helpers ----------
const getPlatformLogo = (platform?: string) => {
  switch ((platform || "").toLowerCase()) {
    case "instagram":
      return "https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg";
    case "twitter":
    case "x":
      return "https://upload.wikimedia.org/wikipedia/commons/6/6f/Logo_of_Twitter.svg";
    case "facebook":
      return "https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg";
    case "tiktok":
      return "https://upload.wikimedia.org/wikipedia/commons/8/85/TikTok_logo.svg";
    case "youtube":
      return "https://upload.wikimedia.org/wikipedia/commons/4/42/YouTube_icon_%282013-2017%29.png";
    default:
      return "https://upload.wikimedia.org/wikipedia/commons/9/91/Globe_icon.svg";
  }
};

// --------- Modal component ----------
const Modal: React.FC<{
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}> = ({ title, onClose, children }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl rounded-3xl border border-white/15 bg-white/10 text-white p-6 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg md:text-xl font-bold">{title}</h3>
          <button onClick={onClose} className="rounded-full bg-white/20 hover:bg-white/30 p-2" aria-label="Close">
            ✖
          </button>
        </div>
        <div className="max-h-[70vh] overflow-auto pr-2">{children}</div>
      </div>
    </div>
  );
};

// --------- Legal content (JSX) ----------
const LegalContent = {
  termsOfUse: (
    <div className="space-y-4 text-sm">
      <h3 className="text-lg font-bold">Definitions and Scope</h3>
      <p>
        These “Terms of Use” apply to all users of LinkSwipe (the “Platform”). Anyone who accesses the Platform, creates a profile, shares a link, or views content accepts these terms.
      </p>

      <h3 className="text-lg font-bold">Acceptance of Terms</h3>
      <p>By using the Platform, you agree to the following:</p>
      <ul className="list-disc list-inside">
        <li>You are over 18 years of age.</li>
        <li>You act on your own behalf and accept responsibility for your content.</li>
        <li>You have read and accepted the Privacy Policy and other legal documents.</li>
      </ul>

      <h3 className="text-lg font-bold">User Content and Responsibility</h3>
      <p>Content uploaded by users must not violate laws, third-party rights, or these terms.</p>

      <h3 className="text-lg font-bold">Prohibited Content</h3>
      <ul className="list-disc list-inside">
        <li>Hate speech, violent or illegal content.</li>
        <li>Pornographic or sexually explicit content.</li>
        <li>Child abuse, drugs, weapons, or other illegal activities.</li>
      </ul>

      <h3 className="text-lg font-bold">Payments and Refunds</h3>
      <p>Profiles that are promoted pay $10 via Gumroad. Payments are non-refundable except as required by law.</p>

      <p className="text-xs text-white/70 mt-4">Last Updated: August 31, 2025</p>
    </div>
  ),
  privacyPolicy: (
    <div className="space-y-4 text-sm">
      <h3 className="text-lg font-bold">Data Collected</h3>
      <p>We collect profile information (name, photo, social links), IP and session info. Payment is processed by Gumroad and not stored by LinkSwipe.</p>

      <h3 className="text-lg font-bold">Purpose</h3>
      <p>Data is used to display profiles, operate the service and comply with legal obligations.</p>

      <h3 className="text-lg font-bold">Sharing & Retention</h3>
      <p>Personal data is not sold. It may be shared for legal requests. Users can request deletion via email.</p>

      <p className="text-xs text-white/70 mt-4">Contact: llinkswipe@gmail.com</p>
      <p className="text-xs text-white/70">Last Updated: August 31, 2025</p>
    </div>
  ),
  legalDisclaimer: (
    <div className="space-y-4 text-sm">
      <p>Users are responsible for the content they upload. LinkSwipe is not liable for user-generated content.</p>
      <p>Uploaded content must not infringe copyrights. Complaints may lead to removal.</p>
      <p>Logos, brand elements and other IP remain the property of their owners.</p>
      <p className="text-xs text-white/70 mt-4">Last Updated: August 31, 2025</p>
    </div>
  ),
};

// --------- Profile form (complete) ----------
const ProfileForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    description: "",
    link: "",
    platform: "Instagram",
    photoFile: null as File | null,
    agreement: false,
  });
  const [submissionStatus, setSubmissionStatus] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    setFormData((prev) => ({ ...prev, photoFile: file }));
  };

  const handleAgreementChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, agreement: e.target.checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSubmissionStatus("Submitting your profile...");

    if (!formData.agreement) {
      setSubmissionStatus("Please agree to the terms.");
      return;
    }

    if (!formData.photoFile) {
      setSubmissionStatus("Please select a photo.");
      return;
    }

    const dataToSend = new FormData();
    dataToSend.append("name", formData.name);
    dataToSend.append("email", formData.email);
    dataToSend.append("description", formData.description);
    dataToSend.append("photoFile", formData.photoFile);
    dataToSend.append("link", formData.link);
    dataToSend.append("platform", formData.platform);

    try {
      const response = await fetch("/api/submit-profile", {
        method: "POST",
        body: dataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Something went wrong.");
      }

      const result = await response.json();
      console.log(result.message);

      setSubmissionStatus("Profile submitted! Redirecting to payment page...");
      window.location.href = "https://linkswipe.gumroad.com/l/xziod";
    } catch (error: any) {
      console.error("Error submitting profile:", error);
      setSubmissionStatus(`An error occurred: ${error.message}. Please try again.`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-white/5 rounded-2xl border border-white/10">
      <div className="flex justify-between items-center mb-4">
        <h4 className="font-bold">Submit Profile</h4>
        <button type="button" onClick={onClose} className="text-white/60">✖</button>
      </div>

      <div className="space-y-3">
        <div>
          <label className="block text-sm">Name</label>
          <input name="name" value={formData.name} onChange={handleChange} required className="w-full p-2 rounded bg-white/10" />
        </div>
        <div>
          <label className="block text-sm">Email</label>
          <input name="email" value={formData.email} onChange={handleChange} required type="email" className="w-full p-2 rounded bg-white/10" />
        </div>
        <div>
          <label className="block text-sm">Description</label>
          <textarea name="description" value={formData.description} onChange={handleChange} rows={3} maxLength={200} className="w-full p-2 rounded bg-white/10" />
        </div>
        <div>
          <label className="block text-sm">Platform</label>
          <select name="platform" value={formData.platform} onChange={handleChange} required className="w-full p-2 rounded bg-white/10">
            <option value="Instagram">Instagram</option>
            <option value="Twitter">X / Twitter</option>
            <option value="Facebook">Facebook</option>
            <option value="TikTok">TikTok</option>
            <option value="YouTube">YouTube</option>
          </select>
        </div>
        <div>
          <label className="block text-sm">Profile link</label>
          <input name="link" value={formData.link} onChange={handleChange} required className="w-full p-2 rounded bg-white/10" />
        </div>
        <div>
          <label className="block text-sm">Photo</label>
          <input type="file" accept="image/*" onChange={handleFileChange} />
        </div>

        <label className="flex items-start gap-2 text-sm">
          <input type="checkbox" checked={formData.agreement} onChange={handleAgreementChange} />
          <span>I agree to the Terms, Privacy Policy and Legal Disclaimer.</span>
        </label>

        {submissionStatus && <p className="text-sm mt-1">{submissionStatus}</p>}

        <div className="pt-2">
          <button className="bg-emerald-500 px-4 py-2 rounded" type="submit">Submit & Pay ($10)</button>
        </div>
      </div>
    </form>
  );
};

// --------- Page component ----------
export default function Page() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [index, setIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [modalType, setModalType] = useState<"termsOfUse" | "privacyPolicy" | "legalDisclaimer" | "form" | null>(null);

  const cardRef = useRef<HTMLDivElement | null>(null);
  const startX = useRef<number>(0);
  const currentX = useRef<number>(0);
  const dragging = useRef<boolean>(false);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const q = query(collection(db, "profiles"), where("status", "==", "approved"));
        const querySnapshot = await getDocs(q);
        
        const fetchedProfiles = [];
        querySnapshot.forEach((doc) => {
            const data = doc.data() as any;
            fetchedProfiles.push({ id: doc.id, ...data });
        });
        
        setProfiles(fetchedProfiles);
      } catch (error) {
          console.error("Error fetching profiles:", error);
      } finally {
          setLoading(false);
      }
    };
    fetchProfiles();
  }, []);

  const current = profiles[index] ?? null;

  const resetTransform = () => {
    if (!cardRef.current) return;
    cardRef.current.style.transition = "transform 200ms ease, opacity 200ms ease";
    cardRef.current.style.transform = "translateX(0px) rotate(0deg)";
    cardRef.current.style.opacity = "1";
    window.setTimeout(() => {
      if (cardRef.current) cardRef.current.style.transition = "";
    }, 210);
  };

  const handleSwipeDecision = (dir: "left" | "right") => {
    if (!current) return;
    if (dir === "right" && current.link) {
      window.open(current.link, "_blank", "noopener,noreferrer");
    }
    setIndex((i) => i + 1);
  };

  // Mouse / touch handlers
  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    dragging.current = true;
    startX.current = e.clientX;
    currentX.current = startX.current;
  };
  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!dragging.current || !cardRef.current) return;
    currentX.current = e.clientX;
    const dx = e.clientX - startX.current;
    const rot = Math.max(-15, Math.min(15, dx / 12));
    cardRef.current.style.transform = `translateX(${dx}px) rotate(${rot}deg)`;
    cardRef.current.style.opacity = `${Math.max(0.6, 1 - Math.abs(dx) / 600)}`;
  };
  const onTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    dragging.current = true;
    startX.current = e.touches[0].clientX;
    currentX.current = startX.current;
  };
  const onTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!dragging.current || !cardRef.current) return;
    currentX.current = e.touches[0].clientX;
    const dx = e.touches[0].clientX - startX.current;
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
      cardRef.current.style.transition = "transform 220ms ease, opacity 220ms ease";
      cardRef.current.style.transform = "translateX(500px) rotate(20deg)";
      cardRef.current.style.opacity = "0";
      window.setTimeout(() => handleSwipeDecision("right"), 200);
      return;
    }
    if (dx < -threshold) {
      cardRef.current.style.transition = "transform 220ms ease, opacity 220ms ease";
      cardRef.current.style.transform = "translateX(-500px) rotate(-20deg)";
      cardRef.current.style.opacity = "0";
      window.setTimeout(() => handleSwipeDecision("left"), 200);
      return;
    }
    resetTransform();
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-fuchsia-500 via-sky-500 to-emerald-400 text-white">
      <header className="mx-auto max-w-5xl px-4 py-6 flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight drop-shadow-sm">Link Swipe</h1>
        <div className="flex gap-2">
          <button onClick={() => setModalType("termsOfUse")} className="underline text-sm">Terms</button>
          <button onClick={() => setModalType("privacyPolicy")} className="underline text-sm">Privacy</button>
          <button onClick={() => setModalType("legalDisclaimer")} className="underline text-sm">Legal</button>
          <button onClick={() => setModalType("form")} className="ml-2 rounded bg-white/10 px-3 py-1 text-sm">Promote Profile</button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-24">
        <section className="grid place-items-center gap-8">
          <div className="w-full max-w-md">
            <div className="mb-4 text-center">
              <h2 className="text-xl font-bold">Discover Social Profiles</h2>
              <p className="text-white/90 text-sm">Swipe left to pass, right to open.</p>
            </div>

            <div className="relative h-[520px] select-none mx-auto">
              {loading ? (
                <div className="absolute inset-0 flex items-center justify-center rounded-3xl border border-white/20 bg-white/10 p-10 text-center">
                  <p className="text-lg font-semibold">Loading profiles...</p>
                </div>
              ) : !current ? (
                <div className="absolute inset-0 flex items-center justify-center rounded-3xl border border-white/20 bg-white/10 p-10 text-center">
                  <div>
                    <p className="text-lg font-semibold">You&rsquo;ve seen all profiles ✨</p>
                    <p className="text-white/80 text-sm mt-2">Check back later for new profiles.</p>
                  </div>
                </div>
              ) : (
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
                  <div className="block w-full h-full">
                    <img src={current.photoUrl} alt={current.name} className="h-4/5 w-full object-cover transition" draggable={false} />
                    <div className="absolute inset-x-0 bottom-0 h-1/5 flex flex-col justify-end px-5 pb-4 bg-gradient-to-t from-black/60 to-transparent pt-20">
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <h3 className="text-2xl font-extrabold drop-shadow-sm">{current.name}</h3>
                          <p className="text-white/85 text-sm">{current.description}</p>
                        </div>
                        <img src={getPlatformLogo(current.platform)} alt={`${current.platform} logo`} width={40} height={40} className="mr-2" />
                      </div>

                      <div className="flex justify-between items-center">
                        <p className="text-white/85 text-sm">Tap to open profile</p>
                        <div className="flex gap-3">
                          <button onClick={(e) => { e.preventDefault(); handleSwipeDecision("left"); }} className="h-12 w-12 rounded-full bg-red-500/90 hover:bg-red-500 transition shadow-lg flex items-center justify-center text-white" aria-label="Pass">✖</button>
                          <button onClick={(e) => { e.preventDefault(); handleSwipeDecision("right"); }} className="h-12 w-12 rounded-full bg-emerald-500/90 hover:bg-emerald-500 transition shadow-lg flex items-center justify-center text-white" aria-label="Open Profile">✓</button>
                        </div>
                      </div>
                    </div>

                  </div>
                </article>
              )}
            </div>

          </div>
        </section>
      </main>

      {/* Modals */}
      {modalType === "termsOfUse" && (
        <Modal title="Terms of Use" onClose={() => setModalType(null)}>{LegalContent.termsOfUse}</Modal>
      )}
      {modalType === "privacyPolicy" && (
        <Modal title="Privacy & Data Protection" onClose={() => setModalType(null)}>{LegalContent.privacyPolicy}</Modal>
      )}
      {modalType === "legalDisclaimer" && (
        <Modal title="Legal Disclaimer & Copyright" onClose={() => setModalType(null)}>{LegalContent.legalDisclaimer}</Modal>
      )}
      {modalType === "form" && (
        <Modal title="Promote Your Profile ($10)" onClose={() => setModalType(null)}><ProfileForm onClose={() => setModalType(null)} /></Modal>
      )}

      <footer className="mx-auto max-w-5xl px-4 py-6 text-center text-white/80 text-sm">
        &copy; {new Date().getFullYear()} Link Swipe. All rights reserved.
      </footer>
    </div>
  );
}