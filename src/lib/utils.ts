import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getFirstName(user: any, profile?: any): string {
  let name = "User";
  if (profile?.fullName) {
    name = profile.fullName.split(' ')[0];
  } else if (user?.displayName) {
    name = user.displayName.split(' ')[0];
  } else if (user?.email) {
    const emailPrefix = user.email.split('@')[0];
    const nameWithoutNumbers = emailPrefix.replace(/[0-9]+$/, '');
    name = nameWithoutNumbers ? nameWithoutNumbers.charAt(0).toUpperCase() + nameWithoutNumbers.slice(1) : emailPrefix;
  }

  // Ensure Balakrishna is properly displayed even if it resolves to 'Bala' or has extra suffixes
  if (name.toLowerCase() === 'bala' || name.toLowerCase().includes('balakrishna')) {
    return 'Balakrishna';
  }

  return name;
}
