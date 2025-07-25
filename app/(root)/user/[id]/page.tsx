import { auth } from "@/auth";
import { client } from "@/sanity/lib/client";
import { notFound } from "next/navigation";
import Image from "next/image";
import UserStartups from "@/components/UserStartups";
import { Suspense } from "react";
import { StartupCardSkeleton } from "@/components/StartupCard";
import { AUTHOR_BY_ID_QUERY } from "@/sanity/lib/queries";
import ProfileFollowWrapper from "@/components/ProfileFollowWrapper";
import { Button } from "@/components/ui/button";
import MessageButton from "@/components/MessageButton";

export const experimental_ppr = true;

const Page = async ({ params }: { params: { id: string } }) => {
  const id = params.id;
  const session = await auth();
  const user = await client.fetch(AUTHOR_BY_ID_QUERY, { id });
  if (!user) return notFound();

  return (
    <>
      <section className="profile_container">
        <div className="profile_card">
          <div className="profile_title">
            <h3 className="text-24-black uppercase text-center line-clamp-1">
              {user.name}
            </h3>
          </div>

          <Image
            src={user.image}
            alt={user.name}
            width={220}
            height={220}
            className="profile_image"
          />

          <p className="text-30-extrabold mt-7 text-center">
            @{user?.username}
          </p>
          <p className="mt-1 text-center text-14-normal">{user?.bio}</p>

          <div className="mt-1">
            <ProfileFollowWrapper
              initialFollowers={user.followers || []}
              initialFollowing={user.following || []}
              profileId={id}
              currentUserId={session?.user?.id}
            />
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-5 lg:-mt-5">
          <p className="text-30-bold">
            {session?.id === id ? "Your" : "All"} Startups
          </p>
          <ul className="card_grid-sm">
            <Suspense fallback={<StartupCardSkeleton />}>
              <UserStartups id={id} sessionId={session?.id} />
            </Suspense>
          </ul>
        </div>
      </section>
    </>
  );
};

export default Page;