import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getLocalDateString(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getAttendanceTime(item: { timestamp?: string; $createdAt?: string; hora?: string; fecha?: string }): number {
  if (item?.timestamp) {
    const t = new Date(item.timestamp).getTime();
    if (!isNaN(t) && t > 0) return t;
  }
  if (item?.$createdAt) {
    const t = new Date(item.$createdAt).getTime();
    if (!isNaN(t) && t > 0) return t;
  }
  if (item?.hora) {
    const datePrefix = item.fecha || '2000-01-01';
    const parsed = Date.parse(`${datePrefix} ${item.hora}`);
    if (!isNaN(parsed)) return parsed;
  }
  return 0;
}

