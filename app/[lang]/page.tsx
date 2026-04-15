import type { Metadata } from "next";

import { supportedLangs } from "@/lib/i18n";
import { buildLanguageAlternates } from "@/lib/seo";

const homeContent = {
  en: {
    name: "Léon Zhang",
    eyebrow: "Software, writing, and the work around them",
    title:
      "I build systems that should stay understandable after the first launch.",
    intro:
      "I am a software engineer who prefers readable structures, durable decisions, and documentation that ages well. This site is where I keep those ideas close to the work instead of treating them as an afterthought.",
    sideNoteLabel: "Orientation",
    sideNote:
      "No launch story and no conversion funnel. Just the working assumptions behind the software and the notes that survive implementation details.",
    principlesLabel: "Working philosophy",
    principles: [
      {
        label: "01",
        title: "Clarity over theatre",
        body: "I trust systems that explain themselves. The best implementations leave room for change without turning every revision into a rescue mission.",
      },
      {
        label: "02",
        title: "Durability over noise",
        body: "I would rather keep a system legible across versions than chase novelty that expires after a release cycle. Useful software should stay calm under pressure.",
      },
      {
        label: "03",
        title: "Writing as engineering",
        body: "Notes, diagrams, and postmortems are part of the build. If I cannot explain how something works, I usually do not understand it well enough yet.",
      },
    ],
    siteNoteLabel: "About this site",
    siteNoteTitle: "This is a quiet record of how I work.",
    siteNote:
      "Most of what lives here starts as practical engineering: architecture decisions, implementation notes, and lessons that were expensive enough to be worth writing down. The goal is not to look busy. It is to leave the work clearer than I found it.",
    metadataTitle: "Léon Zhang",
    metadataDescription:
      "Personal site of Léon Zhang, a software engineer writing about clear systems, durable decisions, and documentation as part of engineering.",
  },
  zh: {
    name: "张磊",
    eyebrow: "软件、写作，以及它们之间的工作",
    title: "我更在意系统在第一次上线之后，是否仍然容易理解和修改。",
    intro:
      "我是软件工程师，偏爱清晰的结构、经得住变化的决策，以及不会很快过时的文档。这个站点用来记录这些判断，让它们始终贴着实际工作，而不是事后补充。",
    sideNoteLabel: "说明",
    sideNote:
      "这里没有包装过的个人叙事，也没有转化导向的页面结构。只有我在做软件时反复验证的一些前提，以及值得留下来的笔记。",
    principlesLabel: "工作方式",
    principles: [
      {
        label: "01",
        title: "清晰胜过表演",
        body: "我更信任那些能自我解释的系统。好的实现应该允许后续修改，而不是把每次调整都变成一次抢修。",
      },
      {
        label: "02",
        title: "耐久胜过噪音",
        body: "比起追逐很快过时的新鲜感，我更关心系统在版本变化之后是否仍然可读、可维护、可推理。",
      },
      {
        label: "03",
        title: "写作也是工程的一部分",
        body: "笔记、图示和复盘并不是附属品。若一件事无法被准确说明，通常意味着我对它的理解还不够扎实。",
      },
    ],
    siteNoteLabel: "关于这个站点",
    siteNoteTitle: "这里更像一份持续整理的工作记录。",
    siteNote:
      "大多数内容都来自实际工程中的判断与复盘：架构取舍、实现细节，以及那些付出过成本之后更值得写下来的经验。目的不是显得忙碌，而是让工作本身变得更清楚。",
    metadataTitle: "张磊 | Léon Zhang",
    metadataDescription:
      "张磊的个人站点，记录关于清晰系统、耐久决策，以及将写作视为工程一部分的实践。",
  },
} as const;

function getHomePageContent(lang: string) {
  return lang === "zh" ? homeContent.zh : homeContent.en;
}

export default async function HomePage(props: PageProps<"/[lang]">) {
  const { lang } = await props.params;
  const page = getHomePageContent(lang);

  return (
    <section className="relative min-h-[calc(100vh-7rem)] overflow-hidden bg-background text-foreground">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-80 opacity-80"
        style={{
          background:
            "radial-gradient(circle at top left, color-mix(in oklab, var(--primary) 16%, transparent), transparent 62%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-0 bottom-0 size-72 opacity-60"
        style={{
          background:
            "radial-gradient(circle, color-mix(in oklab, var(--border) 18%, transparent), transparent 68%)",
        }}
      />

      <div className="relative mx-auto w-full max-w-5xl px-4 py-14 md:px-8 md:py-20">
        <div className="grid gap-10 border-b [border-bottom-style:dotted] pb-10 lg:grid-cols-[minmax(0,2.2fr)_minmax(16rem,0.8fr)] lg:items-end">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold tracking-[0.28em] text-primary uppercase">
              {page.eyebrow}
            </p>
            <p className="mt-6 text-sm font-medium tracking-[0.22em] text-muted-foreground uppercase">
              {page.name}
            </p>
            <h1 className="mt-5 max-w-3xl text-4xl/tight font-semibold tracking-tight md:text-6xl/[1.05]">
              {page.title}
            </h1>
            <p className="mt-6 max-w-2xl text-base/7 text-muted-foreground md:text-lg/8">
              {page.intro}
            </p>
          </div>

          <aside className="max-w-sm border border-border/70 bg-card/55 p-5">
            <p className="text-[0.7rem] font-semibold tracking-[0.24em] text-muted-foreground uppercase">
              {page.sideNoteLabel}
            </p>
            <p className="mt-4 text-sm/6">{page.sideNote}</p>
          </aside>
        </div>

        <div className="mt-10">
          <p className="text-xs font-semibold tracking-[0.28em] text-primary uppercase">
            {page.principlesLabel}
          </p>

          <div className="mt-5 grid gap-8">
            {page.principles.map((principle) => (
              <article
                key={principle.title}
                className="grid gap-3 border-b [border-bottom-style:dotted] pb-7 md:grid-cols-[4rem_minmax(0,1fr)] md:gap-6"
              >
                <p className="text-xs font-semibold tracking-[0.24em] text-muted-foreground uppercase">
                  {principle.label}
                </p>
                <div className="max-w-3xl">
                  <h2 className="text-2xl/tight font-semibold tracking-tight md:text-3xl/tight">
                    {principle.title}
                  </h2>
                  <p className="mt-3 text-base/7 text-muted-foreground md:text-lg/8">
                    {principle.body}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>

        <div className="mt-10 max-w-2xl">
          <p className="text-xs font-semibold tracking-[0.28em] text-primary uppercase">
            {page.siteNoteLabel}
          </p>
          <h2 className="mt-4 text-2xl/tight font-semibold tracking-tight md:text-3xl/tight">
            {page.siteNoteTitle}
          </h2>
          <p className="mt-4 text-base/7 text-muted-foreground md:text-lg/8">
            {page.siteNote}
          </p>
        </div>
      </div>
    </section>
  );
}

export async function generateMetadata(
  props: PageProps<"/[lang]">
): Promise<Metadata> {
  const { lang } = await props.params;
  const page = getHomePageContent(lang);

  return {
    title: {
      absolute: page.metadataTitle,
    },
    description: page.metadataDescription,
    alternates: {
      canonical: `/${lang}/`,
      languages: buildLanguageAlternates(
        supportedLangs,
        (supportedLang) => `/${supportedLang}/`
      ),
    },
    openGraph: {
      title: page.metadataTitle,
      description: page.metadataDescription,
      type: "website",
      url: `https://www.pohvii.cloud/${lang}/`,
      images: [
        {
          url: "/og-image.svg",
          width: 1200,
          height: 630,
          alt: page.name,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: page.metadataTitle,
      description: page.metadataDescription,
      images: ["/twitter-image.svg"],
    },
  };
}

export function generateStaticParams() {
  return supportedLangs.map((lang) => ({ lang }));
}
