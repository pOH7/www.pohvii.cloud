export function normalizeBlogImage(value: unknown): string {
  if (typeof value !== "string") return "";

  const image = value.trim();

  if (!image.startsWith("/")) {
    return "";
  }

  return image;
}
