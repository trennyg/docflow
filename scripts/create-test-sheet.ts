// Run: node --experimental-strip-types scripts/create-test-sheet.ts
// Generates test_master_sheet.xlsx at the project root with a styled header row.

import * as XLSX from "xlsx";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUTPUT = path.join(__dirname, "..", "test_master_sheet.xlsx");

const HEADERS = [
  "Full Name",
  "PAN No",
  "Aadhaar",
  "Date of Birth",
  "Mobile",
  "Address",
  "Father Name",
  "Gender",
  "Email ID",
  "Employer",
  "Salary",
  "City",
  "State",
  "Pincode",
];

const wb = XLSX.utils.book_new();

// Build worksheet from header row only (no data rows)
const ws = XLSX.utils.aoa_to_sheet([HEADERS]);

// Column widths — 20 chars each
ws["!cols"] = HEADERS.map(() => ({ wch: 20 }));

// Style each header cell: bold, white text, blue fill
HEADERS.forEach((_, colIdx) => {
  const cellRef = XLSX.utils.encode_cell({ r: 0, c: colIdx });
  if (!ws[cellRef]) return;
  ws[cellRef].s = {
    font: { bold: true, color: { rgb: "FFFFFF" } },
    fill: { fgColor: { rgb: "2563EB" }, patternType: "solid" },
    alignment: { horizontal: "left", vertical: "center" },
  };
});

XLSX.utils.book_append_sheet(wb, ws, "KYC Data");

// Write with cellStyles enabled so the styling is preserved
XLSX.writeFile(wb, OUTPUT, { bookType: "xlsx", cellStyles: true });

console.log(`Created: ${OUTPUT}`);
console.log(`Sheet:   KYC Data`);
console.log(`Headers: ${HEADERS.length} columns`);
