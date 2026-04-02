import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight, Compass, PenTool, Settings2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supportedLangs } from "@/lib/i18n";
import { buildLanguageAlternates } from "@/lib/seo";

const copy = {
  en: {
    title: "About",
    description:
      "Learn about Léon Zhang, a software engineer who writes about web development, Java, React, TypeScript, and practical engineering notes.",
    eyebrow: "About this site",
    heading: "I build and document software with a bias toward clarity.",
    intro:
      "This site is a working notebook for ideas, experiments, and long-form technical notes. The focus stays on durable systems, readable code, and lessons that are useful after the implementation details have changed.",
    focusTitle: "What I care about",
    focusItems: [
      "Practical frontend and backend engineering that ships.",
      "Documentation that helps other people move faster.",
      "Small feedback loops and code that is easy to maintain.",
    ],
    stackTitle: "Current focus",
    stackItems: [
      "Next.js, React, and TypeScript",
      "Java and Spring Boot",
      "Developer tooling, workflows, and self-hosted systems",
    ],
    cta: "Get in touch",
  },
  zh: {
    title: "关于",
    description:
      "了解 Léon Zhang，一名关注 Web 开发、Java、React、TypeScript 和实用工程笔记的软件工程师。",
    eyebrow: "站点简介",
    heading: "我更关注把软件做清楚，而不是把它包装得很复杂。",
    intro:
      "这个站点更像是一个持续更新的工作手记，记录想法、实验和较长篇幅的技术笔记。重点始终放在可维护的系统、可读的代码，以及在实现细节变化之后仍然有价值的经验。",
    focusTitle: "我在意的事情",
    focusItems: [
      "能真正交付的前端和后端工程实践。",
      "能帮助别人更快前进的文档与总结。",
      "小而快的反馈循环，以及易于维护的代码。",
    ],
    stackTitle: "当前关注",
    stackItems: [
      "Next.js、React 和 TypeScript",
      "Java 和 Spring Boot",
      "开发工具、工作流和自托管系统",
    ],
    cta: "联系我",
  },
} as const;

export default async function AboutPage(props: PageProps<"/[lang]/about">) {
  const { lang } = await props.params;
  const page = copy[lang as keyof typeof copy];

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-12 md:px-8">
      <div className="mb-10 space-y-4 border-b [border-bottom-style:dotted] pb-6">
        <p className="text-primary text-xs font-semibold tracking-[0.24em] uppercase">
          {page.eyebrow}
        </p>
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight md:text-5xl">
          {page.title}
        </h1>
        <p className="text-muted-foreground max-w-3xl text-base md:text-lg">
          {page.heading}
        </p>
        <p className="text-muted-foreground max-w-3xl text-base md:text-lg">
          {page.intro}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <div className="grid gap-6 md:grid-cols-2">
          <article className="bg-card border-border rounded-md border p-6">
            <div className="mb-4 flex items-center gap-2">
              <PenTool className="text-primary size-5" />
              <h2 className="text-xl font-semibold">{page.focusTitle}</h2>
            </div>
            <ul className="space-y-3 text-sm/6">
              {page.focusItems.map((item) => (
                <li key={item} className="text-muted-foreground">
                  {item}
                </li>
              ))}
            </ul>
          </article>

          <article className="bg-card border-border rounded-md border p-6">
            <div className="mb-4 flex items-center gap-2">
              <Settings2 className="text-primary size-5" />
              <h2 className="text-xl font-semibold">{page.stackTitle}</h2>
            </div>
            <ul className="space-y-3 text-sm/6">
              {page.stackItems.map((item) => (
                <li key={item} className="text-muted-foreground">
                  {item}
                </li>
              ))}
            </ul>
          </article>
        </div>

        <aside className="bg-card border-border rounded-md border p-6">
          <div className="mb-4 flex items-center gap-2">
            <Compass className="text-primary size-5" />
            <h2 className="text-xl font-semibold">
              {lang === "zh" ? "下一步" : "Next step"}
            </h2>
          </div>
          <p className="text-muted-foreground text-sm/6">
            {lang === "zh"
              ? "如果你对我的文章、笔记，或者某个实现细节有疑问，可以直接联系我。"
              : "If you have a question about an article, a note, or a specific implementation detail, reach out directly."}
          </p>
          <Button asChild className="mt-6 w-full">
            <Link href={`/${lang}/contact/`}>
              {page.cta}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </aside>
      </div>
    </section>
  );
}

export async function generateMetadata(
  props: PageProps<"/[lang]/about">
): Promise<Metadata> {
  const { lang } = await props.params;
  const page = copy[lang as keyof typeof copy];

  return {
    title: page.title,
    description: page.description,
    alternates: {
      canonical: `/${lang}/about/`,
      languages: buildLanguageAlternates(
        supportedLangs,
        (supportedLang) => `/${supportedLang}/about/`
      ),
    },
    openGraph: {
      title: page.title,
      description: page.description,
      type: "website",
      url: `https://www.pohvii.cloud/${lang}/about/`,
    },
  };
}

export function generateStaticParams() {
  return supportedLangs.map((lang) => ({ lang }));
}
