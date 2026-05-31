import { SignUp } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md flex justify-center">
        <SignUp appearance={{
          variables: {
            colorPrimary: "#3b82f6",
          }
        }} />
      </div>
    </div>
  );
}
