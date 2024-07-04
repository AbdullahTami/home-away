import { calculateDaysBetween } from "./calender";

type BookingDetails = {
  checkIn: Date;
  checkOut: Date;
  price: number;
};

export function calculateTotals({ checkIn, checkOut, price }: BookingDetails) {
  const totalNights = calculateDaysBetween({ checkIn, checkOut });
  const subTotal = totalNights * price;
  const cleaning = 21;
  const service = 40;
  const tax = subTotal * 0.15;
  const orderTotal = subTotal + cleaning + service + tax;
  return { service, subTotal, cleaning, tax, orderTotal };
}
