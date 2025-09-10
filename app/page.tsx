"use client";
  
import React, { useState, useRef, useEffect } from "react";
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getApps, initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyAuU15H3qlQzZVKWlYOhpeZN-1_zL18IKA",
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

const getPlatformLogo = (platform) => {
  switch (platform) {
    case 'instagram':
      return 'https://upload.wikimedia.org/wikipedia/commons/e/e7/Instagram_logo_2016.svg';
    case 'twitter':
      return 'https://upload.wikimedia.org/wikipedia/commons/6/6f/Logo_of_Twitter.svg';
    case 'facebook':
      return 'https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg';
    case 'tiktok':
      return 'https://upload.wikimedia.org/wikipedia/commons/8/85/TikTok_logo.svg';
    case 'youtube':
      return 'https://upload.wikimedia.org/wikipedia/commons/4/42/YouTube_icon_%282013-2017%29.png';
    default:
      return 'https://upload.wikimedia.org/wikipedia/commons/9/91/Globe_icon.svg';
  }
};

const Modal = ({ title, content, onClose }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
    <div className="bg-white text-black p-8 rounded-2xl max-w-xl w-full max-h-[80vh] overflow-y-auto relative">
      <h2 className="text-2xl font-bold mb-4">{title}</h2>
      <button onClick={onClose} className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 transition">
        ✖
      </button>
      <div className="prose prose-sm max-w-none">
        {content}
      </div>
    </div>
  </div>
);

const LegalContent = {
  termsOfUse: {
    title: "Terms of Use",
    text: (
      <div className="space-y-4">
        <h3 className="text-lg font-bold">Definitions and Scope</h3>
        <p>These “Terms of Use” apply to all users of LinkSwipe (hereinafter referred to as the “Platform”). It is assumed that anyone who accesses the Platform, creates a profile, shares a link, or views content accepts these terms.</p>
        <h3 className="text-lg font-bold">Acceptance of Terms</h3>
        <p>By using the Platform, you agree to the following:</p>
        <ul className="list-disc list-inside">
          <li>You are over 18 years of age.</li>
          <li>You are acting on your own behalf.</li>
          <li>You have read and accepted this document, the Privacy Policy, and other legal documents.</li>
          <li>You are fully responsible for all content you share.</li>
        </ul>
        <p>If you do not agree to these terms, please do not use the Platform.</p>
        <h3 className="text-lg font-bold">User Content and Responsibility</h3>
        <p>Content uploaded by users:</p>
        <ul className="list-disc list-inside">
          <li>The ownership of the name, profile photo, and social media links belongs entirely to the user.</li>
          <li>Only Facebook, TikTok, X (Twitter), Instagram, or YouTube links are accepted. Other social media platforms or external links will not be published.</li>
          <li>Does not contain copyright infringement, confidential information, or personal data of third parties.</li>
          <li>Does not contain defamatory, libelous, illegal, or harmful content.</li>
        </ul>
        <p>The Platform does not pre-screen content. All legal responsibility rests with the user.</p>
        <h3 className="text-lg font-bold">Prohibited Content</h3>
        <p>The following content is strictly prohibited:</p>
        <ul className="list-disc list-inside">
          <li>Hate speech, racism, sexism, incitement to violence</li>
          <li>Pornographic or sexually explicit content</li>
          <li>Child abuse, drugs, weapons, suicide, or illegal activities</li>
          <li>Defamation or libel against real persons</li>
        </ul>
        <p>Violation may result in the removal of the content, suspension of the user, and notification to authorities if deemed necessary.</p>
        <h3 className="text-lg font-bold">Payments and Refunds</h3>
        <p>Users who want to add a profile pay 10 USD.</p>
        <p>Payments are processed via Gumroad. LinkSwipe does not store any card information.</p>
        <p>Payments are non-refundable (including site closure, content removal, or technical issues).</p>
        <p>If users submit links other than Facebook, TikTok, X (Twitter), Instagram, or YouTube, the profile will not be published, and no refund will be issued.</p>
        <h3 className="text-lg font-bold">Service Changes and Suspension</h3>
        <p>The Platform reserves the right to change, update, suspend, or completely terminate the service without prior notice.</p>
        <h3 className="text-lg font-bold">Changes to Terms</h3>
        <p>These terms may be updated from time to time. The most recent version on the website is the valid version.</p>
        <p>Last Updated: August 31, 2025</p>
      </div>
    ),
  },
  privacyPolicy: {
    title: "Privacy and Data Protection",
    text: (
      <div className="space-y-4">
        <h3 className="text-lg font-bold">Data Collected</h3>
        <ul className="list-disc list-inside">
          <li>Profile information entered by users (name, photo, social media links – only Facebook, TikTok, X (Twitter), Instagram, YouTube)</li>
          <li>IP address, browser information, session data</li>
          <li>Payment information processed via Gumroad; LinkSwipe does not store any card or bank information.</li>
        </ul>
        <h3 className="text-lg font-bold">Purpose of Data Processing</h3>
        <ul className="list-disc list-inside">
          <li>Displaying and publishing profiles</li>
          <li>Technical support and service improvement</li>
          <li>Compliance with legal obligations</li>
        </ul>
        <h3 className="text-lg font-bold">Data Sharing</h3>
        <ul className="list-disc list-inside">
          <li>Personal data is not shared, sold, or rented to third parties.</li>
          <li>It is only shared in compliance with court orders or official requests.</li>
        </ul>
        <h3 className="text-lg font-bold">Data Retention</h3>
        <p>User data is retained unless a deletion request is received or legal obligations are fulfilled.</p>
        <p>Contact: 📧 llinkswipe@gmail.com</p>
        <p>Last Updated: August 31, 2025</p>
      </div>
    ),
  },
  legalDisclaimer: {
    title: "Legal Disclaimer and Copyright Policy",
    text: (
      <div className="space-y-4">
        <p>Users are responsible for all content they upload (name, photo, social links).</p>
        <p>Only Facebook, TikTok, X (Twitter), Instagram, or YouTube links are accepted. Submissions from other platforms will be rejected without a refund.</p>
        <p>The Platform is not responsible for user-generated content.</p>
        <p>Users confirm that the uploaded content does not infringe on any copyright.</p>
        <p>In case of a complaint from a third party, the content may be reviewed or removed.</p>
        <p>The LinkSwipe logo, design, and brand elements may not be used without permission.</p>
        <p>Last Updated: August 31, 2025</p>
      </div>
    ),
  }
};

const ProfileForm = ({ onClose }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    description: '',
    photoFile: null,
    link: '',
    platform: ''
  });
  const [descriptionLength, setDescriptionLength] = useState(0);
  const [isAgreed, setIsAgreed] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [submissionStatus, setSubmissionStatus] = useState('');

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === 'description') {
      setDescriptionLength(value.length);
    }
    setFormData(prevData => ({
      ...prevData,
      [name]: files ? files[0] : value
    }));
  };

  const handleAgreementChange = (e) => {
    setIsAgreed(e.target.checked);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();

    setSubmissionStatus('Submitting your profile...');

    if (!formData.photoFile) {
        setSubmissionStatus('Please select a photo.');
        return;
    }

    const dataToSend = new FormData();
    dataToSend.append('name', formData.name);
    dataToSend.append('email', formData.email);
    dataToSend.append('description', formData.description);
    dataToSend.append('photoFile', formData.photoFile);
    dataToSend.append('link', formData.link);
    dataToSend.append('platform', formData.platform);

    try {
        const response = await fetch('/api/submit-profile', {
            method: 'POST',
            body: dataToSend,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Something went wrong.');
        }

        const result = await response.json();
        console.log(result.message);

        setSubmissionStatus('Profile submitted! Redirecting to payment page...');
        window.location.href = "https://linkswipe.gumroad.com/l/xziod";

    } catch (error) {
        console.error("Error submitting profile:", error);
        setSubmissionStatus(`An error occurred: ${error.message}. Please try again.`);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-8 rounded-3xl bg-white/10 shadow-xl border border-white/20">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold">Submit Your Profile for Review</h3>
        <button onClick={onClose} className="text-white/60 hover:text-white transition" aria-label="Close">
            ✖
        </button>
      </div>
      <div className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">Name</label>
          <input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required className="w-full p-2 rounded-lg bg-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-sky-400" />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
          <input type="email" id="email" name="email" value={formData.email} onChange={handleChange} placeholder="llinkswipe@gmail.com" required className="w-full p-2 rounded-lg bg-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-sky-400" />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-medium mb-1">
            Brief Description <span className="text-white/70">({descriptionLength}/100)</span>
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows="3"
            maxLength={100}
            className="w-full p-2 rounded-lg bg-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-sky-400"
            placeholder="e.g., 'I'm a digital artist sharing my journey.'"
          ></textarea>
        </div>
        <div>
          <label htmlFor="photoFile" className="block text-sm font-medium mb-1">Photo</label>
          <input type="file" id="photoFile" name="photoFile" onChange={handleChange} required className="w-full text-white/70 file:bg-sky-500/90 file:border-none file:rounded-lg file:text-white file:py-2 file:px-4 file:mr-4 file:font-semibold hover:file:bg-sky-500 transition" accept="image/*" />
        </div>
        <div>
          <label htmlFor="link" className="block text-sm font-medium mb-1">Profile Link</label>
          <input type="url" id="link" name="link" value={formData.link} onChange={handleChange} required className="w-full p-2 rounded-lg bg-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-sky-400" />
        </div>
        <div>
          <label htmlFor="platform" className="block text-sm font-medium mb-1">Platform</label>
          <select id="platform" name="platform" value={formData.platform} onChange={handleChange} required className="w-full p-2 rounded-lg bg-white/20 text-white focus:outline-none focus:ring-2 focus:ring-sky-400">
            <option value="" disabled className="bg-gray-700">Select a platform</option>
            <option value="tiktok" className="bg-gray-700">TikTok</option>
            <option value="youtube" className="bg-gray-700">YouTube</option>
            <option value="instagram" className="bg-gray-700">Instagram</option>
            <option value="twitter" className="bg-gray-700">X (Twitter)</option>
            <option value="facebook" className="bg-gray-700">Facebook</option>
          </select>
        </div>
      </div>
      <div className="mt-4 flex items-start text-sm">
        <input type="checkbox" id="legal-agreement" checked={isAgreed} onChange={handleAgreementChange} required className="mt-1 mr-2 rounded" />
        <label htmlFor="legal-agreement">
          I have read and agree to the <a href="#" onClick={() => setModalType('termsOfUse')} className="underline text-sky-300 hover:text-sky-400">Terms of Use</a>, <a href="#" onClick={() => setModalType('privacyPolicy')} className="underline text-sky-300 hover:text-sky-400">Privacy and Data Protection</a> and <a href="#" onClick={() => setModalType('legalDisclaimer')} className="underline text-sky-300 hover:text-sky-400">Legal Disclaimer and Copyright Policy</a>.
        </label>
      </div>
      
      {submissionStatus && (
        <p className="mt-4 text-center text-sm font-semibold">{submissionStatus}</p>
      )}

      <button type="submit" disabled={!isAgreed} className={`mt-6 w-full rounded-2xl transition shadow-lg px-6 py-3 text-lg font-semibold ${!isAgreed ? 'bg-gray-500/90 cursor-not-allowed' : 'bg-emerald-500/90 hover:bg-emerald-500'}`}>
        Submit Profile
      </button>

      {modalType && (
        <Modal
          title={LegalContent[modalType].title}
          content={LegalContent[modalType].text}
          onClose={() => setModalType(null)}
        />
      )}
    </form>
  );
};


export default function Home() {
  const [index, setIndex] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  const cardRef = useRef(null);
  const startX = useRef(0);
  const currentX = useRef(0);
  const dragging = useRef(false);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        const q = query(collection(db, "profiles"), where("status", "==", "approved"));
        const querySnapshot = await getDocs(q);
        const fetchedProfiles = [];
        querySnapshot.forEach((doc) => {
          fetchedProfiles.push({ id: doc.id, ...doc.data() });
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
    if (!current) return;
    if (dir === "right") {
      window.open(current.link, "_blank", "noopener,noreferrer");
    }
    setIndex((i) => i + 1);
  };

  const onMouseDown = (e) => {
    dragging.current = true;
    startX.current = e.clientX;
    currentX.current = startX.current;
  };

  const onMouseMove = (e) => {
    if (!dragging.current || !cardRef.current) return;
    const x = e.clientX;
    currentX.current = x;
    const dx = x - startX.current;
    const rot = Math.max(-15, Math.min(15, dx / 12));
    cardRef.current.style.transform = `translateX(${dx}px) rotate(${rot}deg)`;
    cardRef.current.style.opacity = `${Math.max(0.6, 1 - Math.abs(dx) / 600)}`;
  };

  const onTouchStart = (e) => {
    dragging.current = true;
    startX.current = e.touches[0].clientX;
    currentX.current = startX.current;
  };

  const onTouchMove = (e) => {
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
      cardRef.current.style.transition = "transform 220ms ease, opacity 220ms ease";
      cardRef.current.style.transform = "translateX(500px) rotate(20deg)";
      cardRef.current.style.opacity = "0";
      setTimeout(() => handleSwipeDecision("right"), 200);
      return;
    }
    if (dx < -threshold) {
      cardRef.current.style.transition = "transform 220ms ease, opacity 220ms ease";
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
      </header>

      <main className="mx-auto max-w-5xl px-4 pb-24">
        <section className="grid place-items-center gap-8">
          <div className="w-full max-w-md">
            <div className="mb-4 text-center">
              <h2 className="text-xl font-bold">Discover Social Profiles</h2>
              <p className="text-white/90 text-sm">Swipe left to pass, right to like.</p>
            </div>

            <div className="relative h-[520px] select-none mx-auto">
              {loading ? (
                <div className="absolute inset-0 flex items-center justify-center rounded-3xl border border-white/20 bg-white/10 p-10 text-center">
                    <p className="text-lg font-semibold">Loading profiles...</p>
                </div>
              ) : !current && (
                <div className="absolute inset-0 flex items-center justify-center rounded-3xl border border-white/20 bg-white/10 p-10 text-center">
                  <div>
                    <p className="text-lg font-semibold">You've seen all the profiles ✨</p>
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
                  <div className="block w-full h-full">
                    <img
                      src={current.photoUrl}
                      alt={current.name}
                      className="h-4/5 w-full object-cover transition"
                      draggable={false}
                    />
                    <div className="absolute inset-x-0 bottom-0 h-1/5 flex flex-col justify-end px-5 pb-4 bg-gradient-to-t from-black/60 to-transparent pt-20">
                      <div className="flex justify-between items-center mb-2">
                        <div>
                          <h3 className="text-2xl font-extrabold drop-shadow-sm">{current.name}</h3>
                          <p className="text-white/85 text-sm">{current.description}</p>
                        </div>
                        <img
                          src={getPlatformLogo(current.platform)}
                          alt={`${current.platform} logo`}
                          width={40}
                          height={40}
                          className="mr-2"
                        />
                      </div>
                      <div className="flex justify-between items-center">
                        <p className="text-white/85 text-sm">Tap to open profile</p>
                        <div className="flex gap-3">
                          <button
                            onClick={(e) => {
                              e.preventDefault();
                              handleSwipeDecision("left");
                            }}
                            className="h-12 w-12 rounded-full bg-red-500/90 hover:bg-red-500 transition shadow-lg flex items-center justify-center text-white"
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
                            className="h-12 w-12 rounded-full bg-emerald-500/90 hover:bg-emerald-500 transition shadow-lg flex items-center justify-center text-white"
                            aria-label="Open Profile"
                            title="Open Profile"
                          >
                            ✓
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              )}
            </div>
            
            <div className="mt-8 text-center">
              {!showForm && (
                <button
                  onClick={() => setShowForm(true)}
                  className="rounded-2xl bg-white/10 px-6 py-3 text-lg font-semibold backdrop-blur hover:bg-white/20 transition shadow-lg"
                >
                  Promote Your Profile ($10)
                </button>
              )}
            </div>
          </div>
        </section>
        
        {showForm && (
          <section className="mt-16">
            <ProfileForm onClose={() => setShowForm(false)} />
          </section>
        )}
      </main>

      <footer className="mx-auto max-w-5xl px-4 pb-10 text-sm text-white/90 mt-12 flex flex-col md:flex-row items-center justify-center gap-3 md:gap-8">
        <p>&copy; {new Date().getFullYear()} Link Swipe. All rights reserved.</p>
        <div className="flex gap-4">
          <a href="#" onClick={() => setModalType('privacyPolicy')} className="hover:underline">Privacy and Data Protection</a>
          <a href="#" onClick={() => setModalType('termsOfUse')} className="hover:underline">Terms of Use</a>
          <a href="#" onClick={() => setModalType('legalDisclaimer')} className="hover:underline">Legal Disclaimer and Copyright Policy</a>
        </div>
      </footer>
      {modalType && (
        <Modal
          title={LegalContent[modalType].title}
          content={LegalContent[modalType].text}
          onClose={() => setModalType(null)}
        />
      )}
    </div>
  );
}