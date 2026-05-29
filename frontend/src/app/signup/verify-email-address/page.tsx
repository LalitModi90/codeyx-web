import { redirect } from 'next/navigation';

export default function RedirectToSignup() {
  // Clerk now uses hash-based routing on the main signup page,
  // so this folder is no longer needed. Redirect back to the main signup page.
  redirect('/signup');
}
