const RATE_UNITS = ["B", "KB", "MB", "GB", "TB"];
const SIZE_UNITS = ["KiB", "MiB", "GiB", "TiB"];

export function capCount(value, max = 99) {
  return typeof value === "number" && value > max ? `${max}+` : value;
}

export function displayRate(bytesPerSecond) {
  let rate = bytesPerSecond || 0;
  let unit = 0;

  while (rate > 1000 && unit < RATE_UNITS.length - 1) {
    rate /= 1000;
    unit++;
  }

  return `${Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(
    rate,
  )} ${RATE_UNITS[unit]}/s`;
}

export function displaySize(bytes) {
  if (Math.abs(bytes) < 1024) return `${bytes} B`;

  let size = bytes;
  let unit = -1;
  do {
    size /= 1024;
    ++unit;
  } while (
    Math.round(Math.abs(size) * 100) / 100 >= 1024 &&
    unit < SIZE_UNITS.length - 1
  );

  return `${size.toFixed(2)} ${SIZE_UNITS[unit]}`;
}

export function displayDuration(seconds) {
  const days = Math.floor(seconds / 86400);
  let remainingSeconds = seconds % 86400;
  const hours = Math.floor(remainingSeconds / 3600);
  remainingSeconds %= 3600;
  const minutes = Math.floor(remainingSeconds / 60);
  const secs = remainingSeconds % 60;

  const formattedHrs = hours.toString().padStart(2, "0");
  const formattedMins = minutes.toString().padStart(2, "0");
  const formattedSecs = secs.toString().padStart(2, "0");

  if (days > 0) {
    return `${days}d ${formattedHrs}h ${formattedMins}m`;
  } else if (hours > 0) {
    return `${formattedHrs}h ${formattedMins}m ${formattedSecs}s`;
  } else if (minutes > 0) {
    return `${formattedMins}m ${formattedSecs}s`;
  } else {
    return `${secs} seconds`;
  }
}
