import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { format } from "date-fns"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string | Date, formatStr = 'MMM dd, yyyy') {
  return format(new Date(date), formatStr)
}

export function formatNumber(num: number) {
  return new Intl.NumberFormat('en-US').format(num)
}

export function formatId(id: string) {
  return id.length > 8 ? id.substring(0, 8) + '...' : id
}
