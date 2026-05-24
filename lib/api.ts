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
    dob: "01/01/1990",
  },
  payslip: {
    name: "Sample Name",
    salary: "75000",
    employer: "Sample Corp Pvt Ltd",
  },
  bank_statement: {
    name: "Sample Name",
    account_number: "XXXX1234",
    account_type: "Savings",
    ifsc_code: "HDFC0001234",
    branch_name: "Sample Branch",
  },
  itr: {
    name: "Sample Name",
    pan_number: "ABCDE1234F",
    itr_year: "2025-26",
    acknowledgment_number: "123456789012345",
  },
  form16: {
    name: "Sample Name",
    pan_number: "ABCDE1234F",
    employer: "Sample Corp Pvt Ltd",
    form16_year: "2024-25",
    certificate_number: "FORM16-2024-001",
  },
  electricity: {
    name: "Sample Name",
    consumer_number: "123456789",
    address: "123, Sample Street, City",
    electricity_provider: "MSEDCL",
    units_consumed: "320",
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
