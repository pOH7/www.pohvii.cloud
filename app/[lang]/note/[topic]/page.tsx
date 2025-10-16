import { notFound } from "next/navigation";
import { getNoteByTopic, getAllNoteTopics } from "@/lib/note";
import { supportedLangs } from "@/lib/i18n";
import { getSession } from "@/lib/auth-server";
import { getDictionary } from "@/app/[lang]/dictionaries";
import type { Metadata } from "next";
import { NoteArticle } from "@/components/note/note-article";
import { ProtectedNoteGuard } from "@/components/note/protected-note-guard";

// Force dynamic rendering for protected notes
export const dynamic = "force-dynamic";

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

  // Check if note is protected and user is authenticated
  if (note.protected) {
    const session = await getSession();
    const isAuthenticated =
      session?.user !== null && session?.user !== undefined;

    if (!isAuthenticated) {
      const dictionary = await getDictionary(lang as "en" | "zh");
      return (
        <ProtectedNoteGuard noteTitle={note.title} dictionary={dictionary} />
      );
    }
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
