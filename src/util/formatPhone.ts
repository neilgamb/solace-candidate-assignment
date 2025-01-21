import { parsePhoneNumberFromString } from "libphonenumber-js";

export const formatPhoneNumber = (num: number): string => {
  const phoneString = num.toString();
  const parsed = parsePhoneNumberFromString(phoneString, "US");
  if (parsed) {
    return parsed.formatNational();
  }
  return phoneString;
};
