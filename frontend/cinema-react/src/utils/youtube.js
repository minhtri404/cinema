export const getYouTubeId = (value) => {
  const input = String(value || "").trim();
  if (!input) return "";

  if (/^[a-zA-Z0-9_-]{11}$/.test(input)) {
    return input;
  }

  try {
    const url = new URL(input);
    if (url.hostname.includes("youtu.be")) {
      return url.pathname.replace("/", "").slice(0, 11);
    }

    if (url.searchParams.has("v")) {
      return url.searchParams.get("v")?.slice(0, 11) || "";
    }

    const embedMatch = url.pathname.match(/\/embed\/([a-zA-Z0-9_-]{11})/);
    return embedMatch?.[1] || "";
  } catch {
    return "";
  }
};

export const getYouTubeEmbedUrl = (value) => {
  const videoId = getYouTubeId(value);
  return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
};
