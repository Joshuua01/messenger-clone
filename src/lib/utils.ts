import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatDate = (date: Date) => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const formattedDate = new Date(date);
  today.setHours(0, 0, 0, 0);
  yesterday.setHours(0, 0, 0, 0);
  formattedDate.setHours(0, 0, 0, 0);

  if (formattedDate.getTime() === today.getTime()) {
    return 'Today';
  } else if (formattedDate.getTime() === yesterday.getTime()) {
    return 'Yesterday';
  } else {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }
};
