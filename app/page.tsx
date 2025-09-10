"use client";

import React, { useState, useRef, useEffect } from "react";
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getApps, initializeApp } from "firebase/app";

// Firebase Config
const firebaseConfig = {
  authDomain: "linkswipe-app.firebaseapp.com",
  projectId: "linkswipe-app",
  storageBucket: "linkswipe-app.firebasestorage.app",
  messagingSenderId: "392732526585",
  appId: "1:392732526585:web:7ff0a025b54990ab81df28",
};

const apps = getApps();
const app = !apps.length ? initializeApp(firebaseConfig) : apps[0];
const db = getFirestore(app);
const storage = getStorage(app);

// 🔹 Profile tipi
type Profile = {
  id: string;
  name: string;
  photoUrl: string;
  platform?: string;
  link?: string;
  links?: { platform: string; url: string }[];
};

// Platform logos
const getPlatformLogo = (platform: string) => {
  switch (platform) {
    case "instagram":
      return "/instagram.svg";
    case "twitter":
      return "/twitter.svg";
    case "facebook":
      return "/facebook.svg";
    case "tiktok":
      return "/tiktok.svg";
    case "youtube":
      return "/youtube.svg";
    default:
      return "/globe.svg";
  }
};

// Modal component
const Modal = ({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
    <div
      className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
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
      <div className="max-h-[70vh] overflow-auto pr-2">{children}</div>
    </div>
  </div>
);

export default function LinkSwipeApp() {
  const [index, setIndex] = useState(0);
  const [modalType, setModalType] = useState<
    "termsOfUse" | "privacyPolicy" | "legalDisclaimer" | null
  >(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  const cardRef = useRef<HTMLDivElement>(null);
  const startX = useRef(0);
  const currentX = useRef(0);
  const dragging = useRef(false);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const q = query(
          collection(db, "profiles"),
          where("status", "==", "approved")
        );
        const querySnapshot = await getDocs(q);
        const fetchedProfiles: Profile[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data() as Omit<Profile, "id">;
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

  const current: Profile | null = profiles[index] ?? null;

  const resetTransform = () => {
    if (cardRef.current) {
      cardRef.current.style.transition =
        "transform 200ms ease, opacity 200ms ease";
      cardRef.current.style.transform = "translateX(0px) rotate(0deg)";
      cardRef.current.style.opacity = "1";
      setTimeout(() => {
        if (cardRef.current) cardRef.current.style.transition = "";
      }, 210);
    }
  };

  const handleSwipeDecision = (dir: "left" | "right") => {
    if (!current) return;
    if (dir === "right" && current.link) {
      window.open(current.link, "_blank", "noopener,noreferrer");
    }
    setIndex((i) => i + 1);
  };

  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    dragging.current = true;
    startX.current = e.clientX;
    currentX.current = startX.current;
  };
  const onMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!dragging.current || !cardRef.current) return;
    const dx = e.clientX - startX.current;
    const rot = Math.max(-15, Math.min(15, dx / 12));
    cardRef.current.style.transform = `translateX(${dx}px) rotate(${rot}deg)`;
    cardRef.current.style.opacity = `${Math.max(
      0.6,
      1 - Math.abs(dx) / 600
    )}`;
  };
  const onTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    dragging.current = true;
    startX.current = e.touches[0].clientX;
    currentX.current = startX.current;
  };
  const onTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!dragging.current || !cardRef.current) return;
    const dx = e.touches[0].clientX - startX.current;
    const rot = Math.max(-15, Math.min(15, dx / 12));
    cardRef.current.style.transform = `translateX(${dx}px) rotate(${rot}deg)`;
    cardRef.current.style.opacity = `${Math.max(
      0.6,
      1 - Math.abs(dx) / 600
    )}`;
  };
  const onPointerUp = () => {
    if (!dragging.current || !cardRef.current) return;
    dragging.current = false;
    const dx = currentX.current - startX.current;
    const threshold = 90;
    if (dx > threshold) {
      cardRef.current.style.transition =
        "transform 220ms ease, opacity 220ms ease";
      cardRef.current.style.transform = "translateX(500px) rotate(20deg)";
      cardRef.current.style.opacity = "0";
      setTimeout(() => handleSwipeDecision("right"), 200);
      return;
    }
    if (dx < -threshold) {
      cardRef.current.style.transition =
        "transform 220ms ease, opacity 220ms ease";
      cardRef.current.style.transform = "translateX(-500px) rotate(-20deg)";
      cardRef.current.style.opacity = "0";
      setTimeout(() => handleSwipeDecision("left"), 200);
      return;
    }
    resetTransform();
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-fuchsia-500 via-sky-500 to-emerald-400 text-white">
      <header className="mx-auto max-w-5xl px-4 py-6 flex items-center justify-between">
        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight drop-shadow-sm">
          Link Swipe
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => setModalType("termsOfUse")}
            className="underline text-sm"
          >
            Terms of Use
          </button>
          <button
            onClick={() => setModalType("privacyPolicy")}
            className="underline text-sm"
          >
            Privacy Policy
          </button>
          <button
            onClick={() => setModalType("legalDisclaimer")}
            className="underline text-sm"
          >
            Legal Disclaimer
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-24">
        <section className="grid place-items-center gap-8">
          <div className="w-full max-w-md">
            <div className="mb-4 text-center">
              <h2 className="text-xl font-bold">Discover Social Profiles</h2>
              <p className="text-white/90 text-sm">
                Swipe left to pass, right to like.
              </p>
            </div>

            <div className="relative h-[520px] select-none mx-auto">
              {loading ? (
                <div className="absolute inset-0 flex items-center justify-center rounded-3xl border border-white/20 bg-white/10 p-10 text-center">
                  <p className="text-lg font-semibold">Loading profiles...</p>
                </div>
              ) : !current ? (
                <div className="absolute inset-0 flex items-center justify-center rounded-3xl border border-white/20 bg-white/10 p-10 text-center">
                  <div>
                    <p className="text-lg font-semibold">
                      You&rsquo;ve seen all profiles ✨
                    </p>
                    <p className="text-white/80 text-sm mt-2">
                      Check back later for new profiles.
                    </p>
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
                    <img
                      src={current.photoUrl}
                      alt={current.name}
                      className="h-4/5 w-full object-cover transition"
                      draggable={false}
                    />
                    <div className="p-4">
                      <h3 className="text-lg font-bold">{current.name}</h3>
                      <div className="flex gap-2 mt-2">
                        {current.links?.map((link, idx) => (
                          <img
                            key={idx}
                            src={getPlatformLogo(link.platform)}
                            alt={link.platform}
                            className="w-6 h-6"
                          />
                        ))}
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
        <Modal title="Terms of Use" onClose={() => setModalType(null)}>
          <p>
            These “Terms of Use” apply to all users of LinkSwipe. Anyone
            accessing the Platform, creating a profile, or sharing a link
            accepts these terms.
          </p>
          <ul className="list-disc ml-5 mt-2">
            <li>Users are over 18 years of age.</li>
            <li>Responsible for all content they share.</li>
            <li>Agree to Privacy Policy and other legal documents.</li>
          </ul>
        </Modal>
      )}
      {modalType === "privacyPolicy" && (
        <Modal
          title="Privacy & Data Protection"
          onClose={() => setModalType(null)}
        >
          <p>
            We collect basic profile information to display on the platform. No
            sensitive data is shared publicly.
          </p>
          <p>
            All data is stored securely in Firebase and will not be sold or
            shared with third parties.
          </p>
          <p>Users can request data deletion at any time.</p>
        </Modal>
      )}
      {modalType === "legalDisclaimer" && (
        <Modal
          title="Legal Disclaimer & Copyright"
          onClose={() => setModalType(null)}
        >
          <p>
            Users are responsible for all content they upload. LinkSwipe is not
            liable for user-generated content.
          </p>
          <p>
            All logos and content remain the property of their respective
            owners.
          </p>
        </Modal>
      )}

      <footer className="mx-auto max-w-5xl px-4 py-6 text-center text-white/80 text-sm">
        &copy; 2025 LinkSwipe. All rights reserved.
      </footer>
    </div>
  );
}
