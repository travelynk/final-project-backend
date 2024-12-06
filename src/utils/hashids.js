import Hashids from 'hashids';

export const encodeBookingCode = async (id) => {
    const hashidsSecret = process.env.HASHIDS_SECRET;
    const hashids = new Hashids(hashidsSecret, 9);

    const bookingCode = hashids.encode(id);
    return bookingCode;
}