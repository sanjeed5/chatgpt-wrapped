export function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return Math.round(num / 1000) + 'K';
  return num.toString();
}

export function formatNumberWithCommas(num: number): string {
  return num.toLocaleString('en-US');
}

export function formatHour(hour: number): string {
  if (hour === 0) return '12 AM';
  if (hour === 12) return '12 PM';
  if (hour < 12) return `${hour} AM`;
  return `${hour - 12} PM`;
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateShort(date: Date): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${months[date.getMonth()]} ${date.getDate()}`;
}

export function formatLocalDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseDateKey(key: string): Date {
  const parts = key.split('-').map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return new Date(key);
  return new Date(parts[0], parts[1] - 1, parts[2]);
}

export function getDaysInYear(year: number): number {
  const now = new Date();
  const endOfYear = new Date(year, 11, 31);
  const referenceDate = now < endOfYear ? now : endOfYear;
  const startOfYear = new Date(year, 0, 1);
  return Math.ceil((referenceDate.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24));
}

export function getMonthName(idx: number): string {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return months[idx] || '';
}

export function cn(...classes: (string | boolean | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}
