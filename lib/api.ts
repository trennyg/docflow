// Mock API — replace with real FastAPI calls when backend is ready
import { DocType } from "./constants";

export const DUMMY_EXTRACTED: Record<DocType, Record<string, string>> = {
  pan: {
    name: "SAMPLE NAME",
    pan_number: "ABCDE1234F",
    dob: "01/01/1990",
    father_name: "FATHER NAME",
  },
  aadhaar: {
    name: "Sample Name",
    aadhaar_number: "XXXX XXXX 1234",
    dob: "01/01/1990",
    address: "123, Sample Street, City — 400001",
    gender: "Male",
  },
  passport: {
    name: "SAMPLE NAME",
    passport_number: "A1234567",
    nationality: "Indian",
    dob: "01/01/1990",
    expiry: "01/01/2030",
  },
  payslip: {
    employee_name: "Sample Name",
    month: "April 2025",
    gross_salary: "75000",
    net_salary: "62000",
    employer: "Sample Corp Pvt Ltd",
  },
  bank_statement: {
    account_holder: "Sample Name",
    account_number: "XXXX1234",
    bank: "HDFC Bank",
    period: "Apr 2025",
    closing_balance: "125000",
  },
  itr: {
    name: "Sample Name",
    pan: "ABCDE1234F",
    assessment_year: "2025-26",
    gross_income: "900000",
    tax_paid: "75000",
  },
  form16: {
    employee_name: "Sample Name",
    pan: "ABCDE1234F",
    employer: "Sample Corp Pvt Ltd",
    financial_year: "2024-25",
    tds_deducted: "75000",
  },
  electricity: {
    consumer_name: "Sample Name",
    consumer_number: "123456789",
    address: "123, Sample Street, City",
    bill_month: "April 2025",
    amount_due: "1250",
  },
  index2: {
    buyer_name: "Sample Buyer",
    seller_name: "Sample Seller",
    property_address: "Flat 4B, Sample Tower, Mumbai — 400001",
    property_value: "8500000",
    registration_date: "01/01/2024",
  },
  car_quotation: {
    vehicle_make: "Maruti Suzuki",
    vehicle_model: "Swift ZXi",
    quotation_amount: "850000",
    on_road_price: "950000",
    dealer_name: "Sample Motors Pvt Ltd",
  },
  other: {
    document: "Unclassified document",
  },
};
