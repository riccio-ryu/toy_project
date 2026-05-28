import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getFirebaseApp } from "./config";

function getStorageInstance() {
  return getStorage(getFirebaseApp());
}

/**
 * 프로필 사진 업로드 → 다운로드 URL 반환
 * 경로: profile_photos/{uid}/{timestamp}.{ext}
 */
export async function uploadProfilePhoto(uid: string, file: File): Promise<string> {
  const storage = getStorageInstance();
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `profile_photos/${uid}/${Date.now()}.${ext}`;
  const storageRef = ref(storage, path);

  await uploadBytes(storageRef, file, { contentType: file.type });
  return getDownloadURL(storageRef);
}
