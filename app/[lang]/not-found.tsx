"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import en from "../../dictionaries/en.json";
import zh from "../../dictionaries/zh.json";

const DICTS = { en, zh } as const;

export default function NotFound() {
  const params = useParams<{ lang?: keyof typeof DICTS }>();
  const lang = (params?.lang ?? "en") as keyof typeof DICTS;
  const dict = DICTS[lang] ?? DICTS.en;

  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
      <h1 className="text-4xl font-bold tracking-tight mb-3">
        {dict.NotFound.title}
      </h1>
      <p className="text-muted-foreground mb-6">{dict.NotFound.message}</p>
      <Link
        href={`/${lang}`}
        className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        {dict.NotFound.cta}
      </Link>
    </div>
  );
}
