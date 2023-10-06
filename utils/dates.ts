import * as datesFns from "date-fns";

export function formatDate(
  date: Date | number | string,
  format: string = "MMM d, yyyy",
): string {
  return datesFns.format(new Date(date), format);
}

export function formatDateTime(
  date: Date | number | string,
  format: string = "MMM d, yyyy h:mm a",
): string | null {
  if (!date) return null;
  return datesFns.format(new Date(date), format);
}

export function intTimeToString(intTime: number | null | undefined): string {
  let strVal: string = intTime?.toString() || "0";
  const prependLen: number = 5 - strVal.length;
  strVal = "0".repeat(prependLen) + strVal;
  strVal = `${strVal[0]}${strVal[1]}:${strVal[2]}${strVal[3]}`;
  return strVal;
}

export function intTimeToDisplay(
  intTime: number | null | undefined,
): string | null {
  if (!intTime?.toString()) {
    return null;
  }
  let amPm: string = "am";
  let [hours, minutes]: string[] = intTimeToString(intTime).split(":");
  if (parseInt(hours) >= 12) {
    amPm = "pm";
  }
  if (parseInt(hours) > 12) {
    hours = (parseInt(hours) - 12).toString();
  }
  if (parseInt(hours) === 0) {
    hours = "12";
  }

  return `${parseInt(hours)}:${minutes} ${amPm}`;
}

export function formatRelative(date: Date | number | string): string | null {
  if (!date) return null;
  return datesFns.formatDistance(new Date(date), new Date(), {
    addSuffix: true,
  });
}
