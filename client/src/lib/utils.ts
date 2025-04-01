import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * A utility function for merging class names
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats a date as a localized string
 */
export function formatDate(date: Date): string {
  return date.toLocaleString();
}

/**
 * Gets the background color class for a team
 */
export function getTeamColorClass(color: string): string {
  return `bg-${color}`;
}

/**
 * Gets the text color class for a team
 */
export function getTeamTextColorClass(color: string): string {
  return `text-${color}`;
}

/**
 * Formats medal name with proper capitalization
 */
export function formatMedalName(medal: string): string {
  if (medal === "no_entry") return "No Entry";
  if (medal === "non_winner") return "Non-winner";
  return medal.charAt(0).toUpperCase() + medal.slice(1);
}

/**
 * Calculates the points for a given medal
 */
export function getMedalPoints(medal: string): number {
  switch (medal) {
    case "gold": return 10;
    case "silver": return 7;
    case "bronze": return 5;
    case "non_winner": return 1;
    case "no_entry":
    default: return 0;
  }
}

/**
 * Gets the medal CSS class based on the medal type
 */
export function getMedalClass(medal: string): string {
  switch (medal) {
    case "gold": return "bg-[#fbbf24] text-white";
    case "silver": return "bg-[#94a3b8] text-white";
    case "bronze": return "bg-[#9a7c64] text-white";
    case "non_winner": return "bg-gray-200 text-gray-700";
    case "no_entry":
    default: return "bg-gray-100 text-gray-500";
  }
}

/**
 * Gets the category background color class
 */
export function getCategoryBgClass(color: string): string {
  switch (color) {
    case "indigo": return "bg-indigo-100";
    case "blue": return "bg-blue-100";
    case "purple": return "bg-purple-100";
    case "pink": return "bg-pink-100";
    case "amber": return "bg-amber-100";
    default: return "bg-gray-100";
  }
}

/**
 * Gets the category text color class
 */
export function getCategoryTextClass(color: string): string {
  switch (color) {
    case "indigo": return "text-indigo-900";
    case "blue": return "text-blue-900";
    case "purple": return "text-purple-900";
    case "pink": return "text-pink-900";
    case "amber": return "text-amber-900";
    default: return "text-gray-900";
  }
}

/**
 * Gets the team dot color based on the team color
 */
export function getTeamDotColor(color: string): string {
  switch (color) {
    case "royal": return "bg-[#2563eb]";
    case "turquoise": return "bg-[#0d9488]";
    case "python": return "bg-[#16a34a]";
    case "hornet": return "bg-[#eab308]";
    case "jaguar": return "bg-[#ea580c]";
    case "bull": return "bg-[#dc2626]";
    case "wasp": return "bg-[#7e22ce]";
    case "panther": return "bg-[#db2777]";
    case "falcon": return "bg-[#f1f5f9]";
    case "stallion": return "bg-[#64748b]";
    case "wolf": return "bg-[#78350f]";
    case "tiger": return "bg-[#9f1239]";
    default: return "bg-gray-400";
  }
}
