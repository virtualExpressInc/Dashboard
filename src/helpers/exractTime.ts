export const parseClockifyDuration = (duration: string): string => {
  const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);

  if (!match) {
      throw new Error("Invalid Clockify duration format");
  }

  const hours = match[1] ? match[1].replace("H", "").padStart(2, "0") : "00";
  const minutes = match[2] ? match[2].replace("M", "").padStart(2, "0") : "00";
  const seconds = match[3] ? match[3].replace("S", "").padStart(2, "0") : "00";

  return `${hours}:${minutes}:${seconds}`;
}
