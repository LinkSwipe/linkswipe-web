import { getFirestore, collection, query, where, getDocs, updateDoc, doc } from 'firebase/firestore';
import { getApps, initializeApp } from 'firebase/app';
import { NextResponse } from 'next/server';

const firebaseConfig = {
  // Your Firebase configuration
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

export async function POST(request) {
  try {
    const data = await request.formData();
    const product_id = data.get('product_id');
    const email = data.get('email');
    const seller_id = data.get('seller_id');
    const test_mode = data.get('test_mode') === 'true'; // Gumroad sends this as a string

    // IMPORTANT: Verify the webhook came from Gumroad and is for the correct product
    // You should replace these with your actual Gumroad product ID and secret key if you have one.
    // In a real-world scenario, you would also verify the secret key for added security.
    if (product_id !== "xziod") { // Replace with your actual product ID
        return NextResponse.json({ message: 'Invalid product ID' }, { status: 400 });
    }

    // You would use `email` or another unique identifier to find the profile
    // Here we'll make a simple assumption that email is a good identifier.
    // In a real app, you would likely use a unique ID passed from the frontend to the backend.

    const profilesRef = collection(db, "profiles");
    const q = query(profilesRef, where("email", "==", email)); // Assuming you added email to your profile data

    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
        console.warn(`Profile not found for email: ${email}`);
        return NextResponse.json({ message: 'Profile not found' }, { status: 404 });
    }

    // Update the status of the first matching profile
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