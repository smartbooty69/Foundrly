import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { client } from "@/sanity/lib/client";
import { AUTHOR_BY_ID_QUERY } from "@/sanity/lib/queries";
import SettingsClient from "@/components/SettingsClient";
import UserSidebarWrapper from "@/components/UserSidebarWrapper";

export default async function SettingsPage() {
  const session = await auth();
  
  if (!session?.user?.id) {
    redirect('/auth/signin');
  }

  // Fetch current user data from Sanity
  const currentUser = await client.fetch(AUTHOR_BY_ID_QUERY, {
    id: session.user.id
  });

  if (!currentUser) {
    redirect('/auth/signin');
  }

  return (
    <div className="flex min-h-screen">
      <div className="flex-1">
        <SettingsClient currentUser={currentUser} />
      </div>
      <UserSidebarWrapper 
        userId={session.user.id} 
        isOwnProfile={true} 
      />
    </div>
  );
}

