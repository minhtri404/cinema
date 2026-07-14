import axiosClient from "./axiosClient";

const mediaFileIdFromUrl = (url) => {
  if (typeof url !== "string") return null;
  const match = url.trim().match(/\/media\/files\/(\d+)\/?(?:[?#].*)?$/);
  return match ? Number(match[1]) : null;
};

export const uploadImage = async (file, category, altText = "") => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("category", category);
  if (altText) formData.append("altText", altText);

  const response = await axiosClient.post("/api/media/images", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return {
    ...response,
    data: {
      ...response.data,
      url: response.data?.publicUrl || response.data?.url || "",
    },
  };
};

export const deleteMediaByUrl = async (url) => {
  const mediaId = mediaFileIdFromUrl(url);
  if (!mediaId) return false;

  await axiosClient.delete(`/api/media/${mediaId}`);
  return true;
};

export const cleanupMediaByUrl = async (url) => {
  try {
    return await deleteMediaByUrl(url);
  } catch (error) {
    if (error.response?.status !== 404) {
      console.error("Không thể dọn ảnh khỏi kho lưu trữ:", error);
    }
    return error.response?.status === 404;
  }
};
