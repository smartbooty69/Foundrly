import { auth } from "@/auth";
import SearchForm from "../../components/SearchForm";
import StartupCard from "../../components/StartupCard";
import { Star } from "lucide-react";

export default async function Home({searchParams}:{
  searchParams: Promise<{ query?:string }>
}) {

  const  query  = await (await searchParams).query;

  const posts = [{
    _createdAt: new Date(),
    views: 10,
    author: {
      _id: 1,
      name: 'Diddy',
    },
    _id: 1,
    description: 'description',
    image: 'https://images.unsplash.com/photo-1721332149346-00e39ce5c24f?q=80&w=1936&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    category: 'category',
    title: 'title',
  }]

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
