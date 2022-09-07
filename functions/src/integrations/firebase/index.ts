import admin from "firebase-admin";

// TODO: we should ensure that app instance is not create more times by importing this file and
//  ensure that instance will be ready every time
admin.initializeApp();

export const firebaseAdmin = admin;
