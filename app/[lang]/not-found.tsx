"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import en from "../../dictionaries/en.json";
import zh from "../../dictionaries/zh.json";

const DICTS = { en, zh } as const;

export default function NotFound() {
  const params = useParams<{ lang?: keyof typeof DICTS }>();
  const lang = params.lang ?? "en";
  const dict = DICTS[lang];

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <h1 className="mb-3 text-4xl font-bold tracking-tight">
        {dict.NotFound.title}
      </h1>
      <p className="text-muted-foreground mb-6">{dict.NotFound.message}</p>
      <Link
        href={`/${lang}`}
        className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center rounded-md px-4 py-2 transition-colors"
      >
        {dict.NotFound.cta}
      </Link>
    </div>
  );
}
