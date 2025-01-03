import { auth } from "@/auth";
import SearchForm from "../../components/SearchForm";
import StartupCard, { StartupTypeCard } from "../../components/StartupCard";
import { Star } from "lucide-react";
import { client } from "@/sanity/lib/client";
import { STARTUPS_QUERY } from "@/sanity/lib/queries";

export default async function Home({searchParams}:{
  searchParams: Promise<{ query?:string }>
}) {

  const  query  = await (await searchParams).query;

  const posts =await client.fetch(STARTUPS_QUERY);

  console.log(JSON.stringify(posts, null, 2));

  return (
    <>

    <section className="pink_container">
      <h1 className="heading">pitch your startup,<br/> Connect with enterpreneurs</h1>

      <p className="sub-heading !max-w-3xl">Submit Ideas, Vote on Pitches, and Get Noticed in Virtual Competition</p>

      <SearchForm query={query} />
    </section>

    <section className="section_container">
      <p className="text-30-semibold">
        {query ? `Showing results for "${query}"` : "Trending Startups"}
      </p>

      <ul className="mt-7 card_grid">
        {posts?.length > 0 ? (
        posts.map((post: StartupTypeCard, index: number) => (
          <StartupCard key={post?._id} post={post}/>
        ))
      ):(
          <p className="no-results">
            No startups found
          </p>
      )}
      </ul>
    </section>

    </>
  );
}
