import { ArrowRight, Globe, Mail } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { GitHubIcon, LinkedInIcon, XIcon } from "@/components/social-icons";
import { Button } from "@/components/ui/button";
import { supportedLangs, type SupportedLang } from "@/lib/i18n";
import { buildLanguageAlternates } from "@/lib/seo";

const links = {
  email: "mailto:pOHVII@gmail.com",
  github: "https://github.com/pOH7",
  x: "https://x.com/pOHVII",
  linkedin: "https://www.linkedin.com/in/léon-zhang/",
} as const;

type ContactChannel = {
  label: string;
  href: string;
  icon: "mail" | "github" | "x" | "linkedin";
};

type ContactCopy = {
  title: string;
  description: string;
  eyebrow: string;
  heading: string;
  intro: string;
  responseTitle: string;
  responseItems: string[];
  channelsTitle: string;
  channelsItems: ContactChannel[];
  cta: string;
};

const copy: Record<SupportedLang, ContactCopy> = {
  en: {
    title: "Contact",
    description:
      "Reach out to Léon Zhang for article feedback, collaboration ideas, or project questions.",
    eyebrow: "Contact",
    heading: "Start a conversation.",
    intro:
      "The fastest way to reach me is email. I also keep public profiles on GitHub, X, and LinkedIn for lightweight updates and follow-up conversations.",
    responseTitle: "What to send",
    responseItems: [
      "Feedback on a blog post.",
      "A technical question about the site or a post.",
      "A collaboration or consulting inquiry.",
    ],
    channelsTitle: "Where to find me",
    channelsItems: [
      { label: "Email", href: links.email, icon: "mail" },
      { label: "GitHub", href: links.github, icon: "github" },
      { label: "X", href: links.x, icon: "x" },
      { label: "LinkedIn", href: links.linkedin, icon: "linkedin" },
    ],
    cta: "Send email",
  },
  zh: {
    title: "联系",
    description:
      "如果你想就文章反馈、合作想法或项目问题联系 Léon Zhang，可以从这里开始。",
    eyebrow: "联系",
    heading: "欢迎直接交流。",
    intro:
      "最快的方式是发邮件。我也在 GitHub、X 和 LinkedIn 上保留了公开资料，方便轻量沟通和后续联系。",
    responseTitle: "可以发送什么",
    responseItems: [
      "对文章的反馈。",
      "关于站点或某篇内容的技术问题。",
      "合作或咨询类需求。",
    ],
    channelsTitle: "可以找到我的地方",
    channelsItems: [
      { label: "邮箱", href: links.email, icon: "mail" },
      { label: "GitHub", href: links.github, icon: "github" },
      { label: "X", href: links.x, icon: "x" },
      { label: "LinkedIn", href: links.linkedin, icon: "linkedin" },
    ],
    cta: "发送邮件",
  },
} as const;

export default async function ContactPage(props: PageProps<"/[lang]/contact">) {
  const { lang } = await props.params;
  const page = copy[lang as SupportedLang];

  function renderChannelIcon(icon: ContactChannel["icon"]) {
    if (icon === "mail") return <Mail className="size-4 text-primary" />;
    if (icon === "github")
      return <GitHubIcon className="size-4 text-primary" />;
    if (icon === "x") return <XIcon className="size-4 text-primary" />;
    return <LinkedInIcon className="size-4 text-primary" />;
  }

  return (
    <section className="mx-auto w-full max-w-5xl px-4 py-12 md:px-8">
      <div className="mb-10 space-y-4 border-b [border-bottom-style:dotted] pb-6">
        <p className="text-xs font-semibold tracking-[0.24em] text-primary uppercase">
          {page.eyebrow}
        </p>
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight md:text-5xl">
          {page.title}
        </h1>
        <p className="max-w-3xl text-base text-muted-foreground md:text-lg">
          {page.heading}
        </p>
        <p className="max-w-3xl text-base text-muted-foreground md:text-lg">
          {page.intro}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <article className="rounded-md border border-border bg-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <Mail className="size-5 text-primary" />
            <h2 className="text-xl font-semibold">{page.responseTitle}</h2>
          </div>
          <ul className="space-y-3 text-sm/6">
            {page.responseItems.map((item) => (
              <li key={item} className="text-muted-foreground">
                {item}
              </li>
            ))}
          </ul>

          <Button asChild className="mt-6 w-full">
            <Link href={links.email}>
              {page.cta}
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </article>

        <article className="rounded-md border border-border bg-card p-6">
          <div className="mb-4 flex items-center gap-2">
            <Globe className="size-5 text-primary" />
            <h2 className="text-xl font-semibold">{page.channelsTitle}</h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {page.channelsItems.map((item) => {
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className="rounded-md border border-border p-4 transition-colors hover:border-primary hover:bg-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
                >
                  <div className="mb-2 flex items-center gap-2">
                    {renderChannelIcon(item.icon)}
                    <span className="font-medium">{item.label}</span>
                  </div>
                  <p className="text-sm break-all text-muted-foreground">
                    {item.href.replace("mailto:", "")}
                  </p>
                </Link>
              );
            })}
          </div>
        </article>
      </div>
    </section>
  );
}

export async function generateMetadata(
  props: PageProps<"/[lang]/contact">
): Promise<Metadata> {
  const { lang } = await props.params;
  const page = copy[lang as SupportedLang];

  return {
    title: page.title,
    description: page.description,
    alternates: {
      canonical: `/${lang}/contact/`,
      languages: buildLanguageAlternates(
        supportedLangs,
        (supportedLang) => `/${supportedLang}/contact/`
      ),
    },
    openGraph: {
      title: page.title,
      description: page.description,
      type: "website",
      url: `https://www.pohvii.cloud/${lang}/contact/`,
    },
  };
}

export function generateStaticParams() {
  return supportedLangs.map((lang) => ({ lang }));
}
