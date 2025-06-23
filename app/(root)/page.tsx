import SearchForm from "../../components/SearchForm";
import StartupCard, { StartupTypeCard } from "../../components/StartupCard";
import { STARTUPS_QUERY } from "@/sanity/lib/queries";
import { sanityFetch, SanityLive } from "@/sanity/lib/live";
import { auth } from "@/auth";

export default async function Home({searchParams}:{
  searchParams: Promise<{ query?:string }>
}) {

  const  query  = await (await searchParams).query;
  const params = {search: query || null};
  const session = await auth();
  console.log(session?.id);
  const {data: posts} = await sanityFetch({query: STARTUPS_QUERY, params});

  return (
    <>

    <section className="blue_container">
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
          <StartupCard key={post?._id} post={post} isLoggedIn={!!session} userId={session?.id} />
        ))
      ):(
          <p className="no-results">
            No startups found
          </p>
      )}
      </ul>
    </section>
    
    <SanityLive />

    </>
  );
}
