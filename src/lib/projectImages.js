export function getProjectImageUrl(value) {
  if (!value) {
    return null;
  }

  try {
    const url = new URL(value);

    return url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}