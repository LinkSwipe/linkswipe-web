import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getApps, initializeApp } from 'firebase/app';
import { NextResponse } from 'next/server';

// Firebase configuration using environment variables for security.
// NEXT_PUBLIC_ prefix is required for client-side access in Next.js.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase app if not already initialized
const apps = getApps();
const app = !apps.length ? initializeApp(firebaseConfig) : apps[0];
const db = getFirestore(app);
const storage = getStorage(app);

/**
 * Handles the POST request to submit a new user profile.
 * It uploads a profile photo to Firebase Storage and saves the profile data to Firestore.
 */
export async function POST(request) {
  try {
    const formData = await request.formData();
    const name = formData.get('name');
    const description = formData.get('description');
    const photoFile = formData.get('photoFile');
    const link = formData.get('link');
    const platform = formData.get('platform');

    // Basic validation to ensure all required fields are present.
    if (!name || !description || !photoFile || !link || !platform) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // Upload photo to Firebase Storage with a unique filename.
    const photoRef = ref(storage, `profiles/${photoFile.name}_${Date.now()}`);
    const uploadResult = await uploadBytes(photoRef, photoFile);
    const photoUrl = await getDownloadURL(uploadResult.ref);

    // Save profile data to Firestore. The status is set to 'pending_payment'
    // until the Gumroad webhook confirms the payment.
    await addDoc(collection(db, "profiles"), {
      name,
      description,
      photoUrl,
      link,
      platform,
      status: "pending_payment", 
      timestamp: new Date()
    });

    return NextResponse.json({ message: 'Profile submitted successfully!' }, { status: 200 });

  } catch (error) {
    console.error("Error in API route:", error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
