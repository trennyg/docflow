import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get("id");

  if (!jobId) {
    return NextResponse.json({ error: "Missing job id" }, { status: 400 });
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .select("id, status, job_type, applicant_count, created_at")
    .eq("id", jobId)
    .eq("org_id", user.id)
    .single();

  if (jobError || !job) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { data: applicants } = await supabase
    .from("applicants")
    .select("id, label, status, extracted")
    .eq("job_id", jobId)
    .order("created_at", { ascending: true });

  const applicantsWithDocs = await Promise.all(
    (applicants ?? []).map(async (applicant) => {
      const { data: documents } = await supabase
        .from("documents")
        .select("id, doc_type, confidence, extracted, status")
        .eq("applicant_id", applicant.id)
        .order("created_at", { ascending: true });
      return { ...applicant, documents: documents ?? [] };
    })
  );

  const completed = applicantsWithDocs.filter(
    (a) => a.status === "complete"
  ).length;
  const total = job.applicant_count ?? applicantsWithDocs.length;

  return NextResponse.json({
    job,
    applicants: applicantsWithDocs,
    progress: { completed, total },
  });
}
