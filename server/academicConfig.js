// Update CURRENT_ADMISSION_YEAR_BASE once a year, whenever the new batch of
// 1st-year B.Tech students joins (usually around June/July). Every other
// year's admission year used when generating a roll-number ID is derived
// from this one number: a 3rd-year student's admission year is
// CURRENT_ADMISSION_YEAR_BASE - 2, a 4th-year's is CURRENT_ADMISSION_YEAR_BASE - 3,
// and so on.
const CURRENT_ADMISSION_YEAR_BASE = 2026;

const COLLEGE_CODE = "00";

// "1A" = regular student (joined in 1st year), "5A" = lateral entry
// (diploma holders who join directly into 2nd year).
const ENTRY_CODES = {
  regular: "1A",
  lateral: "5A",
};

// Branch code used inside the roll-number ID:
// YY + COLLEGE_CODE + ENTRY_CODE + BRANCH_CODE + 2-digit serial,
// e.g. 24 + 00 + 1A + 05 + 01 = "24001A0501".
const BRANCH_CODES = {
  CIVIL: "01",
  EEE: "02",
  MECHANICAL: "03",
  ECE: "04",
  CSE: "05",
  CHEMICAL: "08",
};

module.exports = { CURRENT_ADMISSION_YEAR_BASE, COLLEGE_CODE, ENTRY_CODES, BRANCH_CODES };