const dateFormatter = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", year: "numeric" });
const shortFormatter = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long" });
const timeFormatter = new Intl.DateTimeFormat("tr-TR", { hour: "2-digit", minute: "2-digit" });

/** 10 Nisan 2027 */
export const formatDate = (date: Date) => dateFormatter.format(date);
/** 10 Nisan */
export const formatShortDate = (date: Date) => shortFormatter.format(date);
/** 14:05 */
export const formatTime = (date: Date) => timeFormatter.format(date);