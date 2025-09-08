import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface TagLinksFooterProps {
  allTags: string[];
  lang: string;
}

export function TagLinksFooter({ allTags, lang }: TagLinksFooterProps) {
  return (
    <footer className="w-full bg-muted/30 py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6">
          <h3 className="text-2xl font-bold mb-4 animate-fade-in-up">
            More great resources
          </h3>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {allTags.map((tag, index) => (
            <Link
              key={tag}
              href={`/${lang}/tag/${encodeURIComponent(tag)}/`}
              className={`text-muted-foreground hover:text-primary transition-colors animate-fade-in-up stagger-${index + 1} group`}
            >
              <span className="group-hover:underline underline-offset-4">
                Articles about {tag}
              </span>
            </Link>
          ))}
        </div>

        <div className="mt-8 pt-6 border-t border-border">
          <Link
            href={`/${lang}/tag/`}
            className="text-primary hover:underline underline-offset-4 animate-pulse-subtle inline-flex items-center gap-2"
          >
            Browse all topics
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </footer>
  );
}
