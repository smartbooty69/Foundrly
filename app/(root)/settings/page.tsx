import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { client } from "@/sanity/lib/client";
import { AUTHOR_BY_ID_QUERY } from "@/sanity/lib/queries";
import SettingsClient from "@/components/SettingsClient";

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

  return <SettingsClient currentUser={currentUser} />;
}

