import SearchForm from "../../components/SearchForm";
import StartupCard, { StartupTypeCard } from "../../components/StartupCard";
import { STARTUPS_SORTED_QUERY } from "@/sanity/lib/queries";
import { sanityFetch, SanityLive } from "@/sanity/lib/live";
import { auth } from "@/auth";
import FilterDropdown from "../../components/FilterDropdown";

export default async function Home({searchParams}:{
  searchParams: Promise<{ query?:string, filter?:string }>
}) {

  const  query  = await (await searchParams).query;
  const filter = await (await searchParams).filter;
  const params = {search: query || null};
  const session = await auth();
  
  // Use the flexible query with the selected filter
  const selectedQuery = STARTUPS_SORTED_QUERY(filter || 'recent');
  const {data: posts} = await sanityFetch({query: selectedQuery, params});

  return (
    <>

    <section className="blue_container">
      <h1 className="heading">pitch your startup,<br/> Connect with enterpreneurs</h1>

      <p className="sub-heading !max-w-3xl">Submit Ideas, Vote on Pitches, and Get Noticed in Virtual Competition</p>

      <SearchForm query={query} />
    </section>

    <section className="section_container">
      <div className="flex items-center justify-between">
        <p className="text-30-semibold">
          {query ? `Showing results for "${query}"` : getFilterTitle(filter)}
        </p>
        <FilterDropdown />
      </div>

      <ul className="mt-7 card_grid">
        {posts?.length > 0 ? (
        posts.map((post: StartupTypeCard, index: number) => (
          <StartupCard key={post?._id} post={post} isLoggedIn={!!session} userId={session?.user?.id} />
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

function getFilterTitle(filter?: string): string {
  switch (filter) {
    case 'popular':
      return 'Most Popular Startups';
    case 'viewed':
      return 'Most Viewed Startups';
    case 'liked':
      return 'Most Liked Startups';
    case 'commented':
      return 'Most Commented Startups';
    default:
      return 'Most Recent Startups';
  }
}
