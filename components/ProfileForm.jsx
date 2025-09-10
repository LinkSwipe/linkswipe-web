// This API route handles profile submission.



import { initializeApp } from "firebase/app";

import { getFirestore, collection, addDoc } from "firebase/firestore";



// These are global variables from the Canvas environment, similar to your frontend code.

const firebaseConfig = JSON.parse(

  typeof __firebase_config !== "undefined"

    ? __firebase_config

    : "{}"

);



const app = initializeApp(firebaseConfig);

const db = getFirestore(app);



// This is the function that handles POST requests from your form.

export async function POST(req, res) {

  try {

    const data = await req.json();

    const { name, facebook, instagram, twitter, youtube, linkedin, profileImage } = data;



    // Basic data validation

    if (!name || !facebook) {

      return new Response(JSON.stringify({ error: "Required fields are missing: name and at least one social link are needed." }), {

        status: 400,

        headers: { 'Content-Type': 'application/json' },

      });

    }



    // Prepare the data for Firestore, including an initial status.

    const profileData = {

      name,

      profileImage,

      socialLinks: {

        facebook,

        instagram,

        twitter,

        youtube,

        linkedin,

      },

      status: "pending", // Profile is awaiting admin approval

      createdAt: new Date(),

    };



    // Save the profile data to a new "profiles" collection in Firestore.

    // The collection path is for a single app instance.

    const collectionPath = `artifacts/${

      typeof __app_id !== "undefined" ? __app_id : "default-app-id"

    }/public/data/profiles`;



    const docRef = await addDoc(collection(db, collectionPath), profileData);



    console.log("Profile successfully saved to database with ID: ", docRef.id);

    return new Response(JSON.stringify({ message: "Your profile has been submitted for review!", profileId: docRef.id }), {

      status: 200,

      headers: { 'Content-Type': 'application/json' },

    });



  } catch (error) {

    console.error("Error saving profile:", error);

    return new Response(JSON.stringify({ error: "Internal server error. Please try again later." }), {

      status: 500,

      headers: { 'Content-Type': 'application/json' },

    });

  }

} export default ProfileForm;