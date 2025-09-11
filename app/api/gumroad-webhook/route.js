import { getFirestore, collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { getApps, initializeApp } from 'firebase/app';
import { NextResponse } from 'next/server';

// Firebase configuration using environment variables for security.
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

/**
 * Handles the POST request from the Gumroad webhook.
 * It finds the user's profile based on their email and updates its status to 'approved'
 * upon successful payment.
 */
export async function POST(request) {
  try {
    const data = await request.formData();
    const productId = data.get('product_id');
    const email = data.get('email');
    const sellerId = data.get('seller_id');
    const testMode = data.get('test_mode') === 'true'; // Gumroad sends this as a string

    // IMPORTANT: Verify the webhook came from Gumroad and is for the correct product
    // You should replace this with your actual Gumroad product ID.
    if (productId !== "xziod") { 
        return NextResponse.json({ message: 'Invalid product ID' }, { status: 400 });
    }

    // You would use `email` or another unique identifier to find the profile
    const profilesRef = collection(db, "profiles");
    const q = query(profilesRef, where("email", "==", email));

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        console.warn(`Profile not found for email: ${email}`);
        return NextResponse.json({ message: 'Profile not found' }, { status: 404 });
    }

    // Update the status of the first matching profile to 'approved'
    const profileDoc = querySnapshot.docs[0];
    await updateDoc(doc(db, "profiles", profileDoc.id), {
        status: "approved"
    });

    console.log(`Profile for ${email} has been approved.`);

    return NextResponse.json({ message: 'Webhook received and processed successfully!' }, { status: 200 });

  } catch (error) {
    console.error("Error in Gumroad webhook:", error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
