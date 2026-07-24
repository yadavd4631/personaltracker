// Mission dates — Day 1 = 25 Jul 2026, Day 84 = 16 Oct 2026
export const START_DATE = "2026-07-25";
export const TOTAL_DAYS = 84;

// IST (Asia/Kolkata) me aaj ki date "YYYY-MM-DD" format me
export function istTodayStr() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" });
}

function toUTC(dateStr) {
  const [y, m, d] = dateStr.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
}

// Kisi date ka day number (Day 1 = START_DATE)
export function dayNumberFor(dateStr) {
  return Math.floor((toUTC(dateStr) - toUTC(START_DATE)) / 86400000) + 1;
}

// Aaj ka day number:
//   0            = mission abhi shuru nahi hua
//   1..84        = mission chalu hai
//   85 (TOTAL+1) = mission complete
export function todayDayNumber() {
  const n = dayNumberFor(istTodayStr());
  if (n < 1) return 0;
  if (n > TOTAL_DAYS) return TOTAL_DAYS + 1;
  return n;
}
