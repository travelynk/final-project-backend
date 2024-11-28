import prisma from "../configs/database.js";
import { Error404 } from "../utils/customError.js";

export const getSeatsByFlightID = async (flightId) => {
  const seats = await prisma.flightSeats.findMany({
    where: { flightId: parseInt(flightId) },
    select: {
      id: true,
      position: true,
      isAvailable: true,
    },
  });

  if (seats.length === 0) {
    throw new Error404("Terjadi Kesalahan, Mohon Maaf saat ini tidak tersedia kursi untuk Nomor penerbangan ini.");
  };
  return seats;
}

