export const getTotalPriceForEachPassengerInSegments = (bookings) => {
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

export const getTotalPriceForEachPassengerInSegment = (booking) => {
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