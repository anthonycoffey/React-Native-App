export function formatDate(
  date: string | number | Date,
  format: string = 'MMM d, yyyy'
): string {
  return new Date(date).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(
  date: string | number | Date,
  format: string = 'MMM d, yyyy h:mm a'
): string {
  if (!date) return '';
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    hour12: true,
  };
  return new Date(date).toLocaleString(undefined, options);
}

export function intTimeToString(intTime: number | null | undefined): string {
  let strVal: string = intTime?.toString() || '0';
  const prependLen: number = 5 - strVal.length;
  strVal = '0'.repeat(prependLen) + strVal;
  strVal = `${strVal[0]}${strVal[1]}:${strVal[2]}${strVal[3]}`;
  return strVal;
}

export function formatRelative(date: string | number | Date): string | null {
  if (!date) return null;
  const now: Date = new Date();
  const diffInMilliseconds: number = now.getTime() - new Date(date).getTime();
  const secondsAgo: number = Math.floor(diffInMilliseconds / 1000);

  if (secondsAgo < 60) {
    return `${secondsAgo} second${secondsAgo === 1 ? '' : 's'} ago`;
  } else if (secondsAgo < 3600) {
    const minutesAgo: number = Math.floor(secondsAgo / 60);
    return `${minutesAgo} minute${minutesAgo === 1 ? '' : 's'} ago`;
  } else if (secondsAgo < 86400) {
    const hoursAgo: number = Math.floor(secondsAgo / 3600);
    return `${hoursAgo} hour${hoursAgo === 1 ? '' : 's'} ago`;
  } else {
    return formatDate(date);
  }
}
