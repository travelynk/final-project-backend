import prisma from "../configs/database.js";
import { Error400, Error403, Error404, Error409 } from "../utils/customError.js";
import * as VoucherService from './voucher.service.js';
import { encodeBookingCode } from "../utils/hashids.js";
import { getIoInstance } from "../configs/websocket.js";

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
              id: true,
              flightNum: true,
              departureTime: true,
              arrivalTime: true,
              estimatedDuration: true,
              price: true,
              seatClass: true,
              departureTerminal: {
                select: {
                  id: true,
                  name: true,
                  airport: {
                    select: {
                      id: true,
                      name: true,
                      code: true
                    },
                  },
                },
              },
              arrivalTerminal: {
                select: {
                  id: true,
                  name: true,
                  airport: {
                    select: {
                      id: true,
                      name: true,
                      code: true
                    },
                  },
                },
              },
              airline: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                  image: true,
                },
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

  const bookingsWithMapping = getTotalPriceForEachPassengerInSegments(bookingsWithHash)
  return bookingsWithMapping
};

const getTotalPriceForEachPassengerInSegments = (bookings) => {
  return bookings.map(booking => {
    let passengerTotalPrices = {};

    booking.segments.forEach(segment => {
      const passengerId = segment.passengerId;

      if (!passengerTotalPrices[passengerId]) {
        passengerTotalPrices[passengerId] = 0;
      }

      passengerTotalPrices[passengerId] += segment.flight.price;
    });

    const firstPrice = Object.values(passengerTotalPrices)[0];

    const adultTotalPrice = firstPrice * booking.passengerCount.adult;
    const childTotalPrice = firstPrice * booking.passengerCount.child;

    return {
      ...booking,
      adultTotalPrice,
      childTotalPrice
    };
  });
};

const getTotalPriceForEachPassengerInSegment = (booking) => {
  let passengerTotalPrices = {};

  booking.segments.forEach(segment => {
    const passengerId = segment.passengerId;

    if (!passengerTotalPrices[passengerId]) {
      passengerTotalPrices[passengerId] = 0;
    }

    passengerTotalPrices[passengerId] += segment.flight.price;
  });

  const firstPrice = Object.values(passengerTotalPrices)[0];

  const adultTotalPrice = firstPrice * booking.passengerCount.adult;
  const childTotalPrice = firstPrice * booking.passengerCount.child;

  return {
    ...booking,
    adultTotalPrice,
    childTotalPrice
  };
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
              id: true,
              flightNum: true,
              departureTime: true,
              arrivalTime: true,
              estimatedDuration: true,
              price: true,
              seatClass: true,
              departureTerminal: {
                select: {
                  id: true,
                  name: true,
                  airport: {
                    select: {
                      id: true,
                      name: true,
                      code: true
                    },
                  },
                },
              },
              arrivalTerminal: {
                select: {
                  id: true,
                  name: true,
                  airport: {
                    select: {
                      id: true,
                      name: true,
                      code: true
                    },
                  },
                },
              },
              airline: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                  image: true,
                },
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

  const bookingWithMapping = getTotalPriceForEachPassengerInSegment(booking)

  return bookingWithMapping;
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

  totalSum += (totalSum * tax / 100);

  const totalPrice = totalSum;

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
        status: "Unpaid",
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

    const payment = await tx.payment.create({
      data: {
        bookingId: createdBooking.id,
      },
    });

    setTimeout(() => updateStatusBooking({ status: "Cancelled" }, createdBooking.id), 900000);

    const formattedDeadline = await formatedDateAndYear(payment.deadline);
    const message = `Selesaikan pembayaran Anda sebelum ${formattedDeadline} UTC!`;
    const title = "Status Pembayaran (Unpaid)";


    const notification = await tx.notification.create({
      data: {
        userId,
        type: "Payment",
        message: message,
        title,
        isRead: false,
      },
    });

    const createdAt = await formatedDate(notification.createdAt);

    const io = getIoInstance();

    io.emit(title, { message, userId, createdAt });

    return createdBooking;
  });

  booking.bookingCode = await encodeBookingCode(booking.id);

  return booking;
};

const formatedDateAndYear = async (isoString) => {
  const dateObj = new Date(isoString);
  const options = {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'UTC'
  };
  const formattedDate = dateObj.toLocaleDateString('id-ID', options);
  // const waktu = tanggalObj.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' });

  return formattedDate;
};

const formatedDate = async (isoString) => {
  const dateObj = new Date(isoString);

  const options = {
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
    hour: '2-digit',
    minute: '2-digit'
  };

  const formattedParts = dateObj.toLocaleDateString('id-ID', options).split(' ');

  const [day, month] = formattedParts;

  const hour = dateObj.getUTCHours().toString().padStart(2, '0');
  const minute = dateObj.getUTCMinutes().toString().padStart(2, '0');

  return `${day} ${month}, ${hour}:${minute}`;
};

export const updateStatusBooking = async (data, id) => {
  const {
    status
  } = data;

  const booking = await prisma.booking.findUnique({
    where: {
      id: parseInt(id),
    },
    include: {
      segments: {
        include: {
          flight: {
            select: {
              id: true,
              flightNum: true,
              departureTime: true,
              arrivalTime: true,
              estimatedDuration: true,
              price: true,
              seatClass: true,
              departureTerminal: {
                select: {
                  id: true,
                  name: true,
                  airport: {
                    select: {
                      id: true,
                      name: true,
                      code: true
                    },
                  },
                },
              },
              arrivalTerminal: {
                select: {
                  id: true,
                  name: true,
                  airport: {
                    select: {
                      id: true,
                      name: true,
                      code: true
                    },
                  },
                },
              },
              airline: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                  image: true,
                },
              },
            },
          },
          flightSeat: {
            select: {
              id: true,
              position: true,
              isAvailable: true,
            },
          },
          passenger: true,
        },
      },
    },
  });

  if (!booking) {
    throw new Error404('Mohon maaf, kami tidak dapat menemukan data booking yang sesuai dengan pencarian Anda.');
  }

  if (booking.status == "Issued") {
    throw new Error400('Status Booking sudah tidak bisa diubah karena sudah dilakukan pembayaran.');
  }

  if (booking.status == "Cancelled") {
    throw new Error400('Status Booking sudah tidak bisa diubah karena sudah dilakukan pembatalan.');
  }

  const updatedBooking = await prisma.$transaction(async (tx) => {
    if (status == "Cancelled") {
      const seatIds = booking.segments.flatMap(segment =>
        segment.flightSeat ? [segment.flightSeat.id] : []
      );

      await tx.flightSeats.updateMany({
        where: {
          id: {
            in: seatIds,
          },
        },
        data: {
          isAvailable: true,
        },
      });
    }

    const updatedStatusBooking = await tx.booking.update({
      where: { id: parseInt(id) },
      data: { status },
    });

    return updatedStatusBooking;
  });

  updatedBooking.bookingCode = await encodeBookingCode(updatedBooking.id);

  if (status == "Cancelled") {
    const io = getIoInstance();

    const message = `Mohon maaf, Booking Anda dengan nomor ${updatedBooking.bookingCode} telah dibatalkan karena pembayaran tidak diterima 
              sesuai batas waktu yang ditentukan. Jika membutuhkan bantuan lebih lanjut, 
              silakan hubungi kami. Terima kasih atas pengertiannya.`;
    const title = 'Pembatalan Booking'

    const updatedAt = await formatedDate(updatedBooking.updatedAt);

    await prisma.notification.create({
      data: {
        userId: updatedBooking.userId,
        type: "Transaction",
        message,
        title,
        isRead: false,
      },
    });

    io.emit(title, { message, updatedAt });
  };

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
              id: true,
              flightNum: true,
              departureTime: true,
              arrivalTime: true,
              estimatedDuration: true,
              price: true,
              seatClass: true,
              departureTerminal: {
                select: {
                  id: true,
                  name: true,
                  airport: {
                    select: {
                      id: true,
                      name: true,
                      code: true
                    },
                  },
                },
              },
              arrivalTerminal: {
                select: {
                  id: true,
                  name: true,
                  airport: {
                    select: {
                      id: true,
                      name: true,
                      code: true
                    },
                  },
                },
              },
              airline: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                  image: true,
                },
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

  const bookingsByDateWithMapping = getTotalPriceForEachPassengerInSegments(bookingsByDateWithHash)

  return bookingsByDateWithMapping;
};

export const scanQrcode = async (id) => {
  const booking = await prisma.booking.findUnique({
    where: {
      id: parseInt(id),
      status: "Issued",
    },
  });

  if (!booking) {
    throw new Error403("Akses ditolak, pembayaran diperlukan.");
  }

  if (booking.isScan == true) {
    throw new Error409("Tiket ini sudah dicetak sebelumnya. Tidak dapat mencetak tiket yang sama lebih dari sekali.");
  }

  //implementasi cetak tiket
  const updatedBooking = await prisma.booking.update({
    where: {
      id: parseInt(id),
      status: "Issued",
    },
    data: { isScan: true },
  });

  return updatedBooking;
};

export const getTicket = async (id) => {
  const booking = await prisma.booking.findUnique({
    where: {
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
              id: true,
              flightNum: true,
              departureTime: true,
              arrivalTime: true,
              estimatedDuration: true,
              price: true,
              seatClass: true,
              departureTerminal: {
                select: {
                  id: true,
                  name: true,
                  airport: {
                    select: {
                      id: true,
                      name: true,
                      code: true
                    },
                  },
                },
              },
              arrivalTerminal: {
                select: {
                  id: true,
                  name: true,
                  airport: {
                    select: {
                      id: true,
                      name: true,
                      code: true
                    },
                  },
                },
              },
              airline: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                  image: true,
                },
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

  if (booking.status != "Issued") {
    throw new Error403("Akses ditolak, pembayaran diperlukan.");
  }

  if (booking.isScan == true) {
    throw new Error409("Tiket ini sudah dicetak sebelumnya. Tidak dapat mencetak tiket yang sama lebih dari sekali.");
  }

  booking.bookingCode = await encodeBookingCode(booking.id);

  return booking;
};

export const updateTotalBooking = async (id, data) => {
  const {
    totalPrice, voucherCode
  } = data;

  const booking = await prisma.booking.findUnique({
    where: {
      id: parseInt(id),
    },
  });

  if (!booking) {
    throw new Error404('Mohon maaf, kami tidak dapat menemukan data booking yang sesuai dengan pencarian Anda.');
  };

  if (booking.status == "Issued") {
    throw new Error400('Status Booking sudah tidak bisa diubah karena sudah dilakukan pembayaran.');
  };
  
  const voucher = await VoucherService.getVoucherByCode(voucherCode, totalPrice);

  if (!voucher) {
    throw new Error400('Code Voucher tidak valid.');
  }

  const updatedBooking = await prisma.booking.update({
    where: { id: parseInt(id) },
    data: { 
      totalPrice,
      voucherCode
     },
  });

  return updatedBooking;
};