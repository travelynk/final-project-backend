import prisma from "../configs/database.js";
import { Error400, Error404, Error409 } from "../utils/customError.js";
import * as VoucherService from './voucher.service.js';
import { encodeBookingCode } from "../utils/hashids.js";


export const getBookings = async (userId) => {
  const bookings = await prisma.booking.findMany({
    where: {
      userId,
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          profile: {
            select: {
              fullName: true,
              phone: true,
            },
          },
        },
      },
      passengerCount: true,
      segments: {
        include: {
          flight: {
            select: {
              flightNum: true,
              departureAirport: {
                select: { name: true, code: true },
              },
              arrivalAirport: {
                select: { name: true, code: true },
              },
              airline: {
                select: { name: true, code: true },
              },
            },
          },
          flightSeat: {
            select: {
              position: true,
              isAvailable: true,
            },
          },
          passenger: true,
        },
      },
      payments: {
        select: {
          transactionId: true,
          status: true,
          total: true,
          method: true,
        },
      },
      voucher: true,
    },
  })

  if (!bookings || bookings.length == 0) {
    throw new Error404('Mohon maaf, kami tidak dapat menemukan data booking yang sesuai dengan pencarian Anda.');
  }

  const bookingsWithHash = await Promise.all(
    bookings.map(async (booking) => ({
      ...booking,
      bookingCode: await encodeBookingCode(booking.id),
    }))
  );

  return bookingsWithHash
};

export const getBooking = async (userId, id) => {
  const booking = await prisma.booking.findUnique({
    where: {
      userId,
      id: parseInt(id),
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          profile: {
            select: {
              fullName: true,
              phone: true,
            },
          },
        },
      },
      passengerCount: true,
      segments: {
        include: {
          flight: {
            select: {
              flightNum: true,
              departureAirport: {
                select: { name: true, code: true },
              },
              arrivalAirport: {
                select: { name: true, code: true },
              },
              airline: {
                select: { name: true, code: true },
              },
            },
          },
          flightSeat: {
            select: {
              position: true,
              isAvailable: true,
            },
          },
          passenger: true,
        },
      },
      payments: {
        select: {
          transactionId: true,
          status: true,
          total: true,
          method: true,
        },
      },
      voucher: true,
    },
  });


  if (!booking) {
    throw new Error404('Mohon maaf, kami tidak dapat menemukan data booking yang sesuai dengan pencarian Anda.');
  }

  booking.bookingCode = await encodeBookingCode(booking.id);

  return booking;
};

export const storeBooking = async (userId, data) => {
  const {
    roundTrip,
    voucherCode,
    passengerCount,
    flightSegments,
  } = data;

  const tax = 11;

  const flightIds = flightSegments.map(segment => segment.flightId);

  const flights = await prisma.flight.findMany({
    where: {
      id: {
        in: flightIds,
      },
    },
    select: {
      id: true,
      price: true,
    },
  });

  let totalSum = flightIds.reduce((sum, id) => {
    const flight = flights.find(f => f.id === id);
    return sum + (flight ? flight.price : 0);
  }, 0);

  let maxVouchers;

  if (voucherCode) {
    const voucher = await VoucherService.getVoucherByCode(voucherCode, totalSum);
    totalSum = voucher.updatedTotalPrice;
    maxVouchers = voucher.maxVoucher;
  };

  totalSum -= (totalSum * tax / 100);

  const totalPrice = totalSum;
  console.log(totalPrice)

  const booking = await prisma.$transaction(async (tx) => {
    const createdBooking = await tx.booking.create({
      data: {
        user: {
          connect: {
            id: userId,
          },
        },
        roundTrip,
        totalPrice,
        ...(voucherCode && {
          voucher: {
            connect: {
              code: voucherCode,
            },
          },
        }),
        tax,
        status: "Pending",
      },
    });

    await tx.passengerCount.create({
      data: {
        bookingId: createdBooking.id,
        adult: passengerCount.adult,
        child: passengerCount.child,
        infant: passengerCount.infant,
      },
    });

    for (const segment of flightSegments) {
      const { passenger } = segment;

      let passengerRecord = await tx.passenger.findUnique({
        where: { identityNumber: passenger.identityNumber },
      });

      if (!passengerRecord) {
        passengerRecord = await tx.passenger.create({
          data: {
            userId,
            title: passenger.title,
            fullName: passenger.fullName,
            familyName: passenger.familyName,
            dob: new Date(passenger.dob),
            nationality: passenger.nationality,
            identityNumber: passenger.identityNumber,
            issuingCountry: passenger.issuingCountry,
            identityExp: new Date(passenger.identityExp),
          },
        });
      }

      const [seat] = await tx.$queryRaw`
      SELECT * FROM "flight_seats" 
      WHERE id = ${segment.seatId} 
      FOR UPDATE
    `;

      if (!seat) {
        throw new Error404(`Maaf, kursi dengan ID ${segment.seatId} tidak ditemukan.`);
      }

      if (!seat.is_available) {
        throw new Error409(`Mohon maaf, kursi dengan ID ${segment.seatId} saat ini tidak tersedia.`);
      }


      await tx.flightSeats.update({
        where: { id: segment.seatId },
        data: { isAvailable: false },
      });

      await tx.bookingSegments.create({
        data: {
          bookingId: createdBooking.id,
          flightId: segment.flightId,
          isReturn: segment.isReturn,
          passengerId: passengerRecord.id,
          seatId: segment.seatId,
        },
      });
    }

    if (maxVouchers) {
      const usedVouchers = await tx.booking.count({
        where: {
          voucher: {
            code: voucherCode,
          },
        },
      });

      if (maxVouchers <= usedVouchers) {
        throw new Error409('Mohon maaf, Code Voucher sudah tidak berlaku');
      };
    }

    return createdBooking;
  });

  booking.bookingCode = await encodeBookingCode(booking.id);
  
  return booking;
};


export const updateStatusBooking = async (data, id) => {
  const {
    status
  } = data;

  const booking = await prisma.booking.findUnique({
    where: { id: parseInt(id) },
  });

  if (!booking) {
    throw new Error404('Mohon maaf, kami tidak dapat menemukan data booking yang sesuai dengan pencarian Anda.');
  }

  const updatedBooking = await prisma.booking.update({
    where: { id: parseInt(id) },
    data: { status },
  });

  updatedBooking.bookingCode = await encodeBookingCode(updatedBooking.id);



  return updatedBooking;
};


export const getBookingsByDate = async (userId, startDate, endDate) => {
  const filterDate = {};

  if (startDate) {
    filterDate.gte = new Date(startDate);
  }
  if (endDate) {
    filterDate.lte = new Date(endDate);
  }

  const bookingsByDate = await prisma.booking.findMany({
    where: {
      userId,
      createdAt: filterDate,
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          profile: {
            select: {
              fullName: true,
              phone: true,
            },
          },
        },
      },
      passengerCount: true,
      segments: {
        include: {
          flight: {
            select: {
              flightNum: true,
              departureAirport: {
                select: { name: true, code: true },
              },
              arrivalAirport: {
                select: { name: true, code: true },
              },
              airline: {
                select: { name: true, code: true },
              },
            },
          },
          flightSeat: {
            select: {
              position: true,
              isAvailable: true,
            },
          },
          passenger: true,
        },
      },
      payments: {
        select: {
          transactionId: true,
          status: true,
          total: true,
          method: true,
        },
      },
      voucher: true,
    },
  });

  if (!bookingsByDate || bookingsByDate.length === 0) {
    throw new Error404('Mohon maaf, kami tidak dapat menemukan data booking yang sesuai dengan pencarian Anda.');
  }

  const bookingsByDateWithHash = await Promise.all(
    bookingsByDate.map(async (booking) => ({
      ...booking,
      bookingCode: await encodeBookingCode(booking.id),
    }))
  );

  return bookingsByDateWithHash;
};