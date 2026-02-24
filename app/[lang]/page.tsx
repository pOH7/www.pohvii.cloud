import Link from "next/link";
import { getDictionary } from "./dictionaries";
import { supportedLangs } from "@/lib/i18n";

export default async function HomePage(props: PageProps<"/[lang]">) {
  const { lang } = await props.params;
  const dictionary = await getDictionary(lang as "en" | "zh");

  return (
    <div className="bg-background text-foreground min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="mb-4 text-4xl font-bold">
            {dictionary.HomePage.title}
          </h1>
          <p className="mb-8 text-lg">{dictionary.HomePage.description}</p>
          {Array.from({ length: 30 }, (_, index) => (
            <p key={index} className="text-muted-foreground mb-8">
              ✅ Language route is working with native Next.js i18n! Current
              language: {lang} (Instance {index + 1})
            </p>
          ))}

          <div className="flex justify-center gap-4">
            <Link
              href="/en"
              className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-sm px-4 py-2 transition-colors"
            >
              English
            </Link>
            <Link
              href="/zh"
              className="bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-sm px-4 py-2 transition-colors"
            >
              中文
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export function generateStaticParams() {
  return supportedLangs.map((lang) => ({ lang }));
}
