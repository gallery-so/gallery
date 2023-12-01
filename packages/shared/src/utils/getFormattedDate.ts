import { format } from 'date-fns';

// Define an enum with user-friendly names for format options
export enum DateFormatOption {
  ABBREVIATED = 'MMM d h:mm a', // e.g., "Jul 28 4:47 PM"
  FULL = 'MMMM d, yyyy h:mm a', // e.g., "July 28, 2023 4:47 PM"
  ISO_8601 = 'yyyy-MM-dd HH:mm:ss', // e.g., "2023-07-28 15:47:51"
}

export const getFormattedDate = (
  inputDateString: string,
  formatOption: DateFormatOption
): string => {
  // Validate inputDateString
  if (!inputDateString || isNaN(new Date(inputDateString).getTime())) {
    // If inputDateString is not provided or is not a valid date string
    console.error('Invalid date string:', inputDateString);
    return 'Invalid Date';
  }

  // Create a Date object
  const date: Date = new Date(inputDateString);

  // Format the date using date-fns library
  return format(date, formatOption);
};
