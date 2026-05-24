"use client";
import PublicProfilePage from "../page";

export default function UserProfile({ params }: { params: { username: string } }) {
  // Since the user requested the exact same UI, we will render the same component for now.
  // Later we can pass the username to it and fetch data from the backend.
  return <PublicProfilePage />;
}
