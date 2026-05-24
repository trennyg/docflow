"use server";

import * as XLSX from "xlsx";
import { requireUser } from "@/lib/server-auth";
import { DUMMY_EXTRACTED } from "@/lib/api";
import { mapColumnsToFields, FieldKey } from "@/lib/constants";
import type { DocType } from "@/lib/constants";
import { sendJobCompleteEmail } from "@/lib/resend";

// Default column headers when no existing Excel has been uploaded
const DEFAULT_COLS: { header: string; field: FieldKey }[] = [
  { header: "Name", field: "name" },
  { header: "PAN Number", field: "pan_number" },
  { header: "Aadhaar Number", field: "aadhaar_number" },
  { header: "Date of Birth", field: "dob" },
  { header: "Phone", field: "phone" },
  { header: "Address", field: "address" },
  { header: "Father Name", field: "father_name" },
  { header: "Gender", field: "gender" },
  { header: "Passport Number", field: "passport_number" },
  { header: "Employer", field: "employer" },
  { header: "Salary", field: "salary" },
  { header: "Email", field: "email" },
  { header: "Pincode", field: "pincode" },
  { header: "City", field: "city" },
  { header: "State", field: "state" },
];

type FileEntry = { fileKey: string; docType: DocType; pageCount: number; pages: number[] | null };

async function appendToMasterSheet(
  supabase: ReturnType<typeof import("@/lib/supabase/admin").createAdminClient>,
  orgId: string,
  extracted: Record<string, string>,
  columnMapping: Record<string, FieldKey> | null
): Promise<void> {
  const masterPath = `${orgId}/master_sheet.xlsx`;
  let wb: XLSX.WorkBook;
  let ws: XLSX.WorkSheet;
  let headers: string[];

  const { data: existing } = await supabase.storage
    .from("documents")
    .download(masterPath);

  if (existing) {
    const buffer = await existing.arrayBuffer();
    wb = XLSX.read(buffer, { type: "array" });
    const sheetName = wb.SheetNames[0];
    ws = wb.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json<Record<string, string>>(ws, { header: 1 });
    headers = (rows[0] as unknown as string[]) ?? [];
  } else {
    wb = XLSX.utils.book_new();
    headers = columnMapping
      ? Object.keys(columnMapping)
      : DEFAULT_COLS.map((c) => c.header);
    ws = XLSX.utils.aoa_to_sheet([headers]);
    XLSX.utils.book_append_sheet(wb, ws, "Extractions");
  }

  // Build the new row in the correct column order
  const row = headers.map((header) => {
    let field: FieldKey | undefined;
    if (columnMapping) {
      field = columnMapping[header];
    } else {
      const col = DEFAULT_COLS.find((c) => c.header === header);
      field = col?.field;
    }
    return field ? (extracted[field] ?? "") : "";
  });

  XLSX.utils.sheet_add_aoa(ws, [row], { origin: -1 });

  const xlsxBuffer = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  await supabase.storage
    .from("documents")
    .upload(masterPath, xlsxBuffer, {
      contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      upsert: true,
    });
  // Mark has_master_sheet on org (idempotent)
  await supabase
    .from("organizations")
    .update({ has_master_sheet: true })
    .eq("id", orgId);
}

export async function processUpload(formData: FormData): Promise<{
  jobId: string;
  extracted: Record<string, string>;
}> {
  const { supabase, user } = await requireUser();
  const orgId = user.id;

  const files: FileEntry[] = JSON.parse(formData.get("files") as string);
  // Total pages charged = sum of selected page counts per file
  const totalPages = files.reduce((sum, f) => sum + f.pageCount, 0);

  // Quota check (monthly pages + addon pages)
  const { data: org } = await supabase
    .from("organizations")
    .select("credits_used, credits_limit, addon_pages, column_mapping, notify_on_complete")
    .eq("id", orgId)
    .single();

  const monthlyRemaining = Math.max(0, (org?.credits_limit ?? 30) - (org?.credits_used ?? 0));
  const totalRemaining = monthlyRemaining + (org?.addon_pages ?? 0);
  if (org && org.credits_limit !== -1 && totalPages > totalRemaining) {
    throw new Error(
      `You have ${totalRemaining.toLocaleString()} page${totalRemaining !== 1 ? "s" : ""} remaining. This upload uses ${totalPages} pages.`
    );
  }

  // Create job (one job = one applicant = one row)
  const { data: job, error: jobErr } = await supabase
    .from("jobs")
    .insert({ org_id: orgId, status: "processing", job_type: "basic", page_count: totalPages })
    .select("id")
    .single();

  if (jobErr || !job) throw new Error(jobErr?.message ?? "Failed to create job");
  const jobId: string = job.id;

  // Create applicant record (no label in v2 schema)
  const { data: appRecord } = await supabase
    .from("applicants")
    .insert({ job_id: jobId, org_id: orgId, status: "pending" })
    .select("id")
    .single();

  if (!appRecord) throw new Error("Failed to create applicant");
  const applicantId: string = appRecord.id;
  const extracted: Record<string, string> = {};

  // Upload each file and build extracted data
  for (const { fileKey, docType } of files) {
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

    Object.assign(extracted, DUMMY_EXTRACTED[docType] ?? {});
  }

  // Mark applicant and job complete
  await supabase
    .from("applicants")
    .update({ status: "complete", extracted })
    .eq("id", applicantId);

  await supabase.from("jobs").update({ status: "complete", completed_at: new Date().toISOString() }).eq("id", jobId);

  // Deduct pages: use monthly allowance first, then addon pages
  const monthlyUsed = org?.credits_used ?? 0;
  const monthlyLimit = org?.credits_limit ?? 30;
  const addonPages = org?.addon_pages ?? 0;
  const monthlyAvailable = Math.max(0, monthlyLimit - monthlyUsed);
  const fromMonthly = Math.min(totalPages, monthlyAvailable);
  const fromAddon = totalPages - fromMonthly;

  await supabase
    .from("organizations")
    .update({
      credits_used: monthlyUsed + fromMonthly,
      addon_pages: Math.max(0, addonPages - fromAddon),
    })
    .eq("id", orgId);

  // Append row to master sheet
  const columnMapping = (org?.column_mapping ?? null) as Record<string, FieldKey> | null;
  await appendToMasterSheet(supabase as ReturnType<typeof import("@/lib/supabase/admin").createAdminClient>, orgId, extracted, columnMapping);

  // Send completion email if notifications are enabled
  if (org?.notify_on_complete && user.email) {
    try {
      await sendJobCompleteEmail({ to: user.email, pageCount: totalPages, jobId });
    } catch {
      // Non-fatal — never block the upload flow
    }
  }

  return { jobId, extracted };
}

export async function uploadExistingExcel(formData: FormData): Promise<void> {
  const { supabase, user } = await requireUser();
  const orgId = user.id;

  const file = formData.get("excel") as File | null;
  if (!file) throw new Error("No file provided");

  const buffer = await file.arrayBuffer();
  const wb = XLSX.read(buffer, { type: "array" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json<string[]>(ws, { header: 1 });
  const headers: string[] = (rows[0] as unknown as string[]) ?? [];

  const columnMapping = mapColumnsToFields(headers);

  // Save their Excel as the master sheet
  await supabase.storage
    .from("documents")
    .upload(`${orgId}/master_sheet.xlsx`, buffer, {
      contentType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      upsert: true,
    });

  // Save column mapping and mark master sheet active
  await supabase
    .from("organizations")
    .update({ column_mapping: columnMapping, has_master_sheet: true })
    .eq("id", orgId);
}

export async function getMasterSheetUrl(): Promise<string | null> {
  const { supabase, user } = await requireUser();
  const { data } = await supabase.storage
    .from("documents")
    .createSignedUrl(`${user.id}/master_sheet.xlsx`, 60);
  return data?.signedUrl ?? null;
}
