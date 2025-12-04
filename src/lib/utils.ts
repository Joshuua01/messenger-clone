import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { MessageWithSender } from './types';

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

export const formatTime = (date: Date) => {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(new Date(date));
};

export const shouldShowDateSeparator = (
  currentMessage: MessageWithSender,
  previousMessage: MessageWithSender | null,
) => {
  if (!previousMessage) return true;

  const currentDate = new Date(currentMessage.createdAt).toDateString();
  const previousDate = new Date(previousMessage.createdAt).toDateString();

  return currentDate !== previousDate;
};

export const getInitials = (name: string) => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
};
