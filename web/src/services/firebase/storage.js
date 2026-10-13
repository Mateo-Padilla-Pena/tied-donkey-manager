import { getStorage, ref, getDownloadURL, listAll } from "firebase/storage";
import { app } from "../../lib/firebase";

// Same bucket the API writes to
const storage = getStorage(app, "gs://tied-donkey-manager.firebasestorage.app");

// Download URL of one file: path is the folder, id is the file name
export const getFile = (path, id) => getDownloadURL(ref(storage, `${path}/${id}`));

// Download URLs of every file under the folder path, including subfolders
export const getAllFiles = async (path) => {
  const { items } = await listAll(ref(storage, path));
  return Promise.all(items.map((item) => getDownloadURL(item)));
};
