import { getAllPosts } from "@/lib/blog";
import { AllPostsClient } from "@/components/blog/all-posts-client";

export default async function AllPostsPage({
  params,
}: {
  params: { lang: string };
}) {
  const { lang } = await params;
  const posts = await getAllPosts(lang);

  return <AllPostsClient posts={posts} lang={lang} />;
}

export function generateMetadata({ params }: { params: { lang: string } }) {
  return {
    title: "All Posts | POH VII Blog",
    description:
      "Browse all blog posts, filter by categories and tags, and discover amazing content.",
  };
}
