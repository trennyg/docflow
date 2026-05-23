import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Sidebar from "@/components/dashboard/Sidebar";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: org } = await supabase
    .from("organizations")
    .select("name, plan, credits_used, credits_limit")
    .eq("id", user.id)
    .maybeSingle();

  const orgName = org?.name ?? user.email ?? "My Org";
  const plan = org?.plan ?? "free";

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <header className="h-14 border-b border-border flex items-center justify-between px-6">
          <span className="text-text-primary font-medium text-sm">{orgName}</span>
          <span
            className={`font-mono text-xs px-2.5 py-1 rounded-full border ${
              plan === "pro"
                ? "border-accent text-accent bg-accent/10"
                : "border-border text-text-muted bg-card"
            }`}
          >
            {plan.toUpperCase()}
          </span>
        </header>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
