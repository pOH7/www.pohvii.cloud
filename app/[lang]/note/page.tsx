import Link from "next/link";
import { getAllNotesMetadata } from "@/lib/note";
import { supportedLangs } from "@/lib/i18n";
import type { Metadata } from "next";
import { BookOpen, FileText } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

interface NoteIndexPageProps {
  params: Promise<{
    lang: string;
  }>;
}

export async function generateMetadata({
  params,
}: NoteIndexPageProps): Promise<Metadata> {
  const { lang } = await params;

  const title = lang === "zh" ? "所有笔记" : "All Notes";
  const description =
    lang === "zh"
      ? "浏览所有技术笔记和文档"
      : "Browse all technical notes and documentation";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
    },
    alternates: {
      canonical: `/${lang}/note`,
      languages: supportedLangs.reduce(
        (acc, supportedLang) => {
          acc[supportedLang] = `/${supportedLang}/note`;
          return acc;
        },
        {} as Record<string, string>
      ),
    },
  };
}

export default async function NoteIndexPage({ params }: NoteIndexPageProps) {
  const { lang } = await params;
  const notes = getAllNotesMetadata(lang);

  const title = lang === "zh" ? "所有笔记" : "All Notes";
  const noNotesMessage =
    lang === "zh" ? "暂无可用的笔记。" : "No notes available yet.";
  const sectionsText = lang === "zh" ? "个章节" : "sections";

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <header className="mb-12">
        <div className="flex items-center gap-3 mb-4">
          <BookOpen className="w-10 h-10 text-primary" />
          <h1 className="text-4xl font-bold">{title}</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl">
          {lang === "zh"
            ? "浏览完整的技术笔记和参考文档集合。"
            : "Browse the complete collection of technical notes and reference documentation."}
        </p>
      </header>

      {/* Notes Grid */}
      {notes.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg text-muted-foreground">{noNotesMessage}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {notes.map((note) => (
            <Link
              key={note.topic}
              href={`/${lang}/note/${note.topic}`}
              className="group"
            >
              <Card className="h-full transition-all hover:shadow-lg hover:border-primary/50">
                <CardHeader>
                  <CardTitle className="group-hover:text-primary transition-colors">
                    {note.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {note.description || note.title}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="w-4 h-4" />
                    <span>
                      {note.sectionCount} {sectionsText}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function generateStaticParams() {
  return supportedLangs.map((lang) => ({ lang }));
}
