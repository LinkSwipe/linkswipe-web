import { getFirestore, collection, addDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { getApps, initializeApp } from 'firebase/app';
import { NextResponse } from 'next/server';

const firebaseConfig = {
  apiKey: "AIzaSyAuU15H3qlQzZVKWlYOhpeZN-1_zL18IKA",
  authDomain: "linkswipe-app.firebaseapp.com",
  projectId: "linkswipe-app",
  storageBucket: "linkswipe-app.firebasestorage.app",
  messagingSenderId: "392732526585",
  appId: "1:392732526585:web:7ff0a025b54990ab81df28",
};

// Initialize Firebase app if not already initialized
const apps = getApps();
const app = !apps.length ? initializeApp(firebaseConfig) : apps[0];
const db = getFirestore(app);
const storage = getStorage(app);

export async function POST(request) {
  try {
    const formData = await request.formData();
    const name = formData.get('name');
    const description = formData.get('description');
    const photoFile = formData.get('photoFile');
    const link = formData.get('link');
    const platform = formData.get('platform');

    // Basic validation
    if (!name || !description || !photoFile || !link || !platform) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    // Upload photo to Firebase Storage
    const photoRef = ref(storage, `profiles/${photoFile.name}_${Date.now()}`);
    const uploadResult = await uploadBytes(photoRef, photoFile);
    const photoUrl = await getDownloadURL(uploadResult.ref);

    // Save profile data to Firestore
    await addDoc(collection(db, "profiles"), {
      name,
      description,
      photoUrl,
      link,
      platform,
      status: "pending_payment", // Initial status
      timestamp: new Date()
    });

    return NextResponse.json({ message: 'Profile submitted successfully!' }, { status: 200 });

  } catch (error) {
    console.error("Error in API route:", error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}