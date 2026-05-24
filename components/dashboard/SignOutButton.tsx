"use client";

import { createClient } from "@/lib/supabase/client";

export default function SignOutButton() {

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
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
