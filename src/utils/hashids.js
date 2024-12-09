import Hashids from 'hashids';

export const encodeBookingCode = async (id) => {
    const hashidsSecret = process.env.HASHIDS_SECRET;
    const hashids = new Hashids(hashidsSecret, 9);

    const bookingCode = hashids.encode(id);
    return bookingCode;
}

export const decodeBookingCode = async (bookingCode) => {
    const hashidsSecret = process.env.HASHIDS_SECRET;
    const hashids = new Hashids(hashidsSecret, 9);

    const decodedArray = hashids.decode(bookingCode);

    return decodedArray.length > 0 ? decodedArray[0] : null;
};