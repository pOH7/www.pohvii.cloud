import { ThemeToggle } from "@/components/theme-toggle";
import Link from "next/link";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  
  // Simple translations object (in a real app, you'd load these from files)
  const translations = {
    en: {
      title: 'Welcome to Next.js!',
      description: 'This is a homepage with native Next.js internationalization.',
    },
    zh: {
      title: '欢迎使用 Next.js！',
      description: '这是一个使用原生 Next.js 国际化的主页。',
    },
  };
  
  const t = translations[locale as keyof typeof translations] || translations.en;
  
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-end mb-8">
          <ThemeToggle />
        </div>
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">{t.title}</h1>
          <p className="text-lg mb-8">{t.description}</p>
          <p className="text-muted-foreground mb-8">
            ✅ Locale route is working with native Next.js i18n! Current locale: {locale}
          </p>
          
          <div className="flex justify-center gap-4">
            <Link 
              href="/en" 
              className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
            >
              English
            </Link>
            <Link 
              href="/zh" 
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/80 transition-colors"
            >
              中文
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}