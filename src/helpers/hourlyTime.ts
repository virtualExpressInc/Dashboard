export const hourlyTime = (duration:any) => {
  const regex = /^PT(\d+H)?(\d+M)?(\d+S)?$/;
  const match = duration.match(regex);

  let hours = 0;
  let minutes = 0;

  if (match) {
    if (match[1]) hours = parseInt(match[1].replace('H', ''), 10);
    if (match[2]) minutes = parseInt(match[2].replace('M', ''), 10);
  }

  return hours + (minutes / 60); // returns total hours
};
