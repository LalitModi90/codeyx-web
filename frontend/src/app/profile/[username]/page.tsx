"use client";
import PublicProfilePage from "../page";

export default function UserProfile({ params }: { params: { username: string } }) {
  return <PublicProfilePage targetId={params.username} />;
}
