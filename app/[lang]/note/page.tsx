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

export async function generateMetadata(
  props: PageProps<"/[lang]/note">
): Promise<Metadata> {
  const params = props.params;
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

export default async function NoteIndexPage(props: PageProps<"/[lang]/note">) {
  const { lang } = await props.params;
  const notes = getAllNotesMetadata(lang);

  const title = lang === "zh" ? "所有笔记" : "All Notes";
  const noNotesMessage =
    lang === "zh" ? "暂无可用的笔记。" : "No notes available yet.";
  const sectionsText = lang === "zh" ? "个章节" : "sections";

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <header className="mb-12">
        <div className="mb-4 flex items-center gap-3">
          <BookOpen className="text-primary h-10 w-10" />
          <h1 className="text-4xl font-bold">{title}</h1>
        </div>
        <p className="text-muted-foreground max-w-2xl text-lg">
          {lang === "zh"
            ? "浏览完整的技术笔记和参考文档集合。"
            : "Browse the complete collection of technical notes and reference documentation."}
        </p>
      </header>

      {/* Notes Grid */}
      {notes.length === 0 ? (
        <div className="py-16 text-center">
          <FileText className="text-muted-foreground mx-auto mb-4 h-16 w-16" />
          <p className="text-muted-foreground text-lg">{noNotesMessage}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {notes.map((note) => (
            <Link
              key={note.topic}
              href={`/${lang}/note/${encodeURIComponent(note.topic)}`}
              className="group"
            >
              <Card className="hover:border-primary/50 h-full transition-all hover:shadow-lg">
                <CardHeader>
                  <CardTitle className="group-hover:text-primary transition-colors">
                    {note.title}
                  </CardTitle>
                  <CardDescription className="line-clamp-2">
                    {note.description || note.title}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-muted-foreground flex items-center gap-2 text-sm">
                    <FileText className="h-4 w-4" />
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
