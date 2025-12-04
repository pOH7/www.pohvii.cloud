import Tag from "@/components/blog/tag";
import { getAllTags } from "@/lib/blog";
import { supportedLangs } from "@/lib/i18n";

export default async function TagsPage(props: PageProps<"/[lang]/tag">) {
  const { lang } = await props.params;

  // Get all tags with their post counts
  const tags = getAllTags(lang);

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-8 px-4 pt-16 pb-8">
      <div>
        <h1 className="mb-4 text-4xl font-bold md:text-5xl">
          All <span className="text-muted-foreground">#</span>tags used on
          articles across the site
        </h1>
      </div>

      {tags.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-muted-foreground text-xl">
            No tags found. Check back later!
          </p>
        </div>
      ) : (
        <div className="mb-20 flex flex-row flex-wrap gap-2 text-xl">
          {tags.map((tag) => (
            <Tag
              key={`tag-cloud-${tag.name}`}
              href={`/${lang}/tag/${encodeURIComponent(tag.name)}`}
              count={tag.count}
            >
              {tag.name}
            </Tag>
          ))}
        </div>
      )}
    </main>
  );
}

export function generateMetadata() {
  return {
    title: "All Tags",
    description:
      "Browse all topics and categories. Discover articles organized by tags and explore content that interests you.",
    openGraph: {
      title: "All Tags",
      description:
        "Browse all topics and categories. Discover articles organized by tags and explore content that interests you.",
      type: "website",
    },
  };
}

export function generateStaticParams() {
  return supportedLangs.map((lang) => ({ lang }));
}
