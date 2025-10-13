import { notFound } from "next/navigation";
import { getNoteByTopic, getAllNoteTopics } from "@/lib/note";
import { supportedLangs } from "@/lib/i18n";
import type { Metadata } from "next";
import { NoteArticle } from "@/components/note/note-article";

interface NotePageProps {
  params: Promise<{
    lang: string;
    topic: string;
  }>;
}

export async function generateMetadata({
  params,
}: NotePageProps): Promise<Metadata> {
  const { lang, topic } = await params;
  const note = await getNoteByTopic(lang, topic);

  if (!note) {
    return {
      title: "Note Not Found",
      description: "The requested note could not be found.",
    };
  }

  // Generate hreflang alternates for all supported languages
  const alternateLanguages = supportedLangs.reduce(
    (acc, supportedLang) => {
      acc[supportedLang] = `/${supportedLang}/note/${topic}`;
      return acc;
    },
    {} as Record<string, string>
  );

  const canonicalUrl = `/${lang}/note/${topic}`;

  return {
    title: note.title,
    description: note.description || `Complete guide for ${note.title}`,
    keywords: note.sections.map((s) => s.title),
    authors: [{ name: "Léon Zhang" }],
    openGraph: {
      title: note.title,
      description: note.description || `Complete guide for ${note.title}`,
      type: "article",
      url: canonicalUrl,
      siteName: "pOH VII",
    },
    twitter: {
      card: "summary_large_image",
      title: note.title,
      description: note.description || `Complete guide for ${note.title}`,
    },
    alternates: {
      canonical: canonicalUrl,
      languages: alternateLanguages,
    },
  };
}

export default async function NotePage({ params }: NotePageProps) {
  const { lang, topic } = await params;
  const note = await getNoteByTopic(lang, topic);

  if (!note) {
    notFound();
  }

  return <NoteArticle note={note} lang={lang} />;
}

export async function generateStaticParams() {
  const params: Array<{ lang: string; topic: string }> = [];

  for (const lang of supportedLangs) {
    const topics = getAllNoteTopics(lang);
    for (const topic of topics) {
      params.push({ lang, topic });
    }
  }

  return params;
}
