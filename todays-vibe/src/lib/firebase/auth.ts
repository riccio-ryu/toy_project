"use client";

import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithCustomToken,
  updateProfile,
} from "firebase/auth";
import { getFirebaseApp } from "./config";

const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

function auth() {
  return getAuth(getFirebaseApp());
}

export async function signInWithEmail(email: string, password: string) {
  return signInWithEmailAndPassword(auth(), email, password);
}

export async function signUpWithEmail(
  email: string,
  password: string,
  nickname: string
) {
  const credential = await createUserWithEmailAndPassword(auth(), email, password);
  await updateProfile(credential.user, { displayName: nickname });
  return credential;
}

export async function signInWithGoogle() {
  return signInWithPopup(auth(), googleProvider);
}

export async function signInWithGithub() {
  return signInWithPopup(auth(), githubProvider);
}

export async function signInWithToken(token: string) {
  return signInWithCustomToken(auth(), token);
}

export async function signOut() {
  return firebaseSignOut(auth());
}
