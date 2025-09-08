import Link from "next/link";
import { Tag } from "lucide-react";

interface TagData {
  name: string;
  count: number;
}

interface StatsFooterProps {
  tags: TagData[];
  lang: string;
}

export function StatsFooter({ tags, lang }: StatsFooterProps) {
  if (tags.length === 0) {
    return null;
  }

  const totalArticles = tags.reduce((sum, tag) => sum + tag.count, 0);
  const avgPerTag =
    tags.length > 0 ? Math.round(totalArticles / tags.length) : 0;

  return (
    <footer className="w-full bg-muted/30 py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto text-center">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="animate-fade-in-up stagger-1">
            <div className="text-3xl font-bold text-primary mb-2">
              {tags.length}
            </div>
            <p className="text-muted-foreground">Total Tags</p>
          </div>

          <div className="animate-fade-in-up stagger-2">
            <div className="text-3xl font-bold text-accent mb-2">
              {totalArticles}
            </div>
            <p className="text-muted-foreground">Total Articles</p>
          </div>

          <div className="animate-fade-in-up stagger-3">
            <div className="text-3xl font-bold text-secondary mb-2">
              {avgPerTag}
            </div>
            <p className="text-muted-foreground">Avg per Tag</p>
          </div>
        </div>

        <div className="pt-6 border-t border-border animate-fade-in-up stagger-4">
          <Link
            href={`/${lang}/blog`}
            className="text-primary hover:text-accent hover:underline underline-offset-4 transition-colors inline-flex items-center gap-2"
          >
            Browse all articles
            <Tag className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
