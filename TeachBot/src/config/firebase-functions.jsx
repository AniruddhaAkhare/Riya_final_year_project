import { getFunctions, httpsCallable } from "firebase/functions";

const functions = getFunctions();
const generateUploadUrl = httpsCallable(functions, "generateUploadUrl");

generateUploadUrl({ enquiryId: "12345", fileType: "image/jpeg" })
  .then((result) => {
  })
  .catch((error) => {
  });