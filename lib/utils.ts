import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string | number | null | undefined): string {
  if (!date) return 'N/A';
  
  const parsedDate = new Date(date);
  
  if (isNaN(parsedDate.getTime())) {
    return 'Invalid Date';
  }

  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(parsedDate)
}

