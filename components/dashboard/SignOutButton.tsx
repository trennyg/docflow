"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

export default function SignOutButton() {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
  }

  return (
    <button
      onClick={handleSignOut}
      className="text-text-muted hover:text-text-primary text-xs font-mono transition-colors"
    >
      Sign out
    </button>
  );
}
