import { auth } from "@/auth";
import { client } from "@/sanity/lib/client";
import { notFound } from "next/navigation";
import MyBadges from "@/components/MyBadges";
import AllBadges from "@/components/AllBadges";

interface PageProps {
  searchParams: { user?: string };
}

export default async function BadgesPage({ searchParams }: PageProps) {
  const userId = searchParams.user;
  const session = await auth();
  
  // If no user parameter, show all badges
  if (!userId) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              🏆 All Badges
            </h1>
            <p className="text-gray-600 text-lg">
              Discover all the badges you can earn in our community. Complete challenges, engage with others, and build your legacy!
            </p>
          </div>
          
          <AllBadges />
        </div>
      </div>
    );
  }

  // Verify the user exists
  const user = await client.fetch(`
    *[_type == "author" && _id == $userId][0] {
      _id,
      name,
      username,
      image
    }
  `, { userId });

  if (!user) {
    return notFound();
  }

  // Check if current user can view this profile
  const canView = session?.user?.id === userId || !user.isPrivate;

  if (!canView) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Profile Private</h1>
          <p className="text-gray-600">This user's badges are not publicly visible.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            {user.image && (
              <img 
                src={user.image} 
                alt={user.name} 
                className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
              />
            )}
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {user.name}'s Badges
              </h1>
              <p className="text-gray-600">@{user.username}</p>
            </div>
          </div>
        </div>
        
        <MyBadges userId={userId} />
      </div>
    </div>
  );
}
