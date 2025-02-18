export const totalBillableRate = (time:any, rate: any) => {
  const total = Number(time) * Number(rate)
  return total.toFixed(2)
}