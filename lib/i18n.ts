export const supportedLangs = ["en", "zh"] as const;
export type SupportedLang = (typeof supportedLangs)[number];
