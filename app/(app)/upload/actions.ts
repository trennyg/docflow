"use server";

import { cookies } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import { DUMMY_EXTRACTED } from "@/lib/api";
import { DEV_USER_ID } from "@/lib/server-auth";
import type { DocType } from "@/lib/constants";

type ApplicantEntry = {
  label: string;
  fileKeys: string[];
  docTypes: DocType[];
};

/**
 * Dev-mode only: processes an upload using the service-role client so
 * RLS doesn't block unauthenticated inserts. Called from UploadFlow
 * when devMode is true. Files are streamed as FormData blobs.
 */
export async function devProcessUpload(formData: FormData): Promise<{ jobId: string }> {
  if (process.env.NODE_ENV !== "development") throw new Error("Not available outside dev");
  const cookieStore = cookies();
  if (cookieStore.get("dev_bypass")?.value !== "true") throw new Error("Dev bypass not active");

  const supabase = createAdminClient();
  const orgId = cookieStore.get("dev_org_id")?.value ?? DEV_USER_ID;

  const applicants: ApplicantEntry[] = JSON.parse(formData.get("applicants") as string);
  const totalDocs = applicants.reduce((sum, a) => sum + a.fileKeys.length, 0);

  // Check document quota
  const { data: org } = await supabase
    .from("organizations")
    .select("credits_used, credits_limit")
    .eq("id", orgId)
    .single();

  if (org && org.credits_limit !== -1 && org.credits_used + totalDocs > org.credits_limit) {
    const remaining = Math.max(0, org.credits_limit - org.credits_used);
    throw new Error(
      `You have ${remaining.toLocaleString()} document${remaining !== 1 ? "s" : ""} remaining this month.`
    );
  }

  const { data: job, error: jobErr } = await supabase
    .from("jobs")
    .insert({
      org_id: orgId,
      status: "processing",
      job_type: "kyc",
      applicant_count: applicants.length,
    })
    .select("id")
    .single();

  if (jobErr || !job) throw new Error(jobErr?.message ?? "Failed to create job");
  const jobId: string = job.id;

  for (const applicant of applicants) {
    const { data: appRecord } = await supabase
      .from("applicants")
      .insert({ job_id: jobId, org_id: orgId, label: applicant.label, status: "pending" })
      .select("id")
      .single();

    if (!appRecord) continue;
    const applicantId: string = appRecord.id;
    const extractedData: Record<string, string> = {};

    for (let j = 0; j < applicant.fileKeys.length; j++) {
      const fileKey = applicant.fileKeys[j];
      const docType = applicant.docTypes[j];
      const file = formData.get(fileKey) as File | null;
      if (!file) continue;

      const storagePath = `${orgId}/${jobId}/${applicantId}/${file.name}`;
      const bytes = await file.arrayBuffer();

      await supabase.storage
        .from("documents")
        .upload(storagePath, bytes, { contentType: file.type, upsert: true });

      await supabase.from("documents").insert({
        applicant_id: applicantId,
        job_id: jobId,
        org_id: orgId,
        doc_type: docType,
        storage_path: storagePath,
        status: "complete",
        confidence: 0.95,
        extracted: DUMMY_EXTRACTED[docType] ?? DUMMY_EXTRACTED.other,
      });

      Object.assign(extractedData, DUMMY_EXTRACTED[docType] ?? {});
    }

    await supabase
      .from("applicants")
      .update({ status: "complete", extracted: extractedData })
      .eq("id", applicantId);
  }

  await supabase.from("jobs").update({ status: "complete" }).eq("id", jobId);

  // Record document usage
  await supabase
    .from("organizations")
    .update({ credits_used: (org?.credits_used ?? 0) + totalDocs })
    .eq("id", orgId);

  return { jobId };
}
