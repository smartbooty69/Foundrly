import { Suspense } from "react";
import { client } from "@/sanity/lib/client";
import {
  PLAYLIST_BY_SLUG_QUERY,
  STARTUP_BY_ID_QUERY,
} from "@/sanity/lib/queries";
import { notFound } from "next/navigation";
import { formatDate } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { auth } from "@/auth";

import markdownit from "markdown-it";
import { Skeleton } from "@/components/ui/skeleton";
import View from "@/components/View";
import StartupCard, { StartupTypeCard } from "@/components/StartupCard";
import StartupDetailActions from "@/components/StartupDetailActions";
import StartupDetailLikes from "@/components/StartupDetailLikes";
import CommentList from "@/components/CommentList";
import CommentForm from "@/components/CommentForm";
import CommentsSection from "@/components/CommentsSection";
import Script from 'next/script';

const md = markdownit();

export const experimental_ppr = true;

const Page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const id = (await params).id;
  const session = await auth();

  const [post, playlistResult] = await Promise.all([
    client.fetch(STARTUP_BY_ID_QUERY, { id }),
    client.fetch(PLAYLIST_BY_SLUG_QUERY, {
      slug: "editor-picks-new",
    }),
  ]);

  if (!post) return notFound();

  const editorPosts = playlistResult?.select || [];
  const isOwner = session?.user?.id === post.author?._id;

  const parsedContent = md.render(post?.pitch || "");

  return (
    <>
      <section className="blue_container !min-h-[230px]">
        <p className="tag">{formatDate(post?._createdAt)}</p>

        <h1 className="heading">{post.title}</h1>
        <p className="sub-heading !max-w-5xl">{post.description}</p>
        <StartupDetailLikes
          startupId={post._id}
          isLoggedIn={!!session}
          userId={session?.user?.id}
        />
        <a
          href="https://www.buymeacoffee.com/yourusername"
          target="_blank"
          rel="noopener noreferrer"
        >
          <button className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold py-2 px-4 rounded mt-4 flex items-center gap-2">
            <span>☕</span> Buy Me a Coffee
          </button>
        </a>
      </section>

      <section className="section_container">
        <img
          src={post.image}
          alt="thumbnail"
          className="w-full h-auto rounded-xl"
        />

        <div className="space-y-5 mt-10 max-w-4xl mx-auto">
          <div className="flex-between gap-5">
            <Link
              href={`/user/${post.author?._id}`}
              className="flex gap-2 items-center mb-3"
            >
              <Image
                src={post.author.image}
                alt="avatar"
                width={64}
                height={64}
                className="rounded-full drop-shadow-lg"
              />

              <div>
                <p className="text-20-medium">{post.author.name}</p>
                <p className="text-16-medium !text-black-300">
                  @{post.author.username}
                </p>
              </div>
            </Link>

            <p className="category-tag">{post.category}</p>
          </div>

          <h3 className="text-30-bold">Pitch Details</h3>
          {parsedContent ? (
            <article
              className="prose max-w-4xl font-work-sans break-all"
              dangerouslySetInnerHTML={{ __html: parsedContent }}
            />
          ) : (
            <p className="no-result">No details provided</p>
          )}

          <StartupDetailActions
            startupId={post._id}
            startupTitle={post.title || ""}
            userId={post.author?._id || ""}
            isOwner={isOwner}
          />
        </div>

        <hr className="divider" />

        {editorPosts?.length > 0 && (
          <div className="max-w-4xl mx-auto">
            <p className="text-30-semibold">Editor Picks</p>

            <ul className="mt-7 card_grid-sm">
              {editorPosts.map((post: StartupTypeCard, i: number) => (
                <StartupCard key={i} post={post} />
              ))}
            </ul>
          </div>
        )}

        <CommentsSection startupId={id} isLoggedIn={!!session} userId={session?.user?.id} />

        <Suspense fallback={<Skeleton className="view_skeleton" />}>
          <View id={id} />
        </Suspense>
      </section>
      <Script
        data-name="BMC-Widget"
        data-cfasync="false"
        src="https://cdnjs.buymeacoffee.com/1.0.0/widget.prod.min.js"
        data-id="yourusername"
        data-description="Support me on Buy me a coffee!"
        data-message="Thank you for visiting. You can now buy me a coffee!"
        data-color="#FFDD00"
        data-position="Right"
        data-x_margin="18"
        data-y_margin="18"
        strategy="afterInteractive"
      />
    </>
  );
};

export default Page;