import { encodeBookingCode } from "./hashids.js";
import jwt from "jsonwebtoken";
import { generateQrPng } from "./qrcode.js";
import { imagekit } from "./imagekit.js";
import prisma from "../configs/database.js";

// export const generateQrCode = async (id) => {
//     const code = await encodeBookingCode(id);
//     const resetToken = jwt.sign({ code }, process.env.JWT_SECRET_FORGET);
//     const url = `${process.env.DOMAIN_URL}/api/v1/bookings/ticket?token=${resetToken}`;

//     const qr = await generateQrPng(url);

//     const qrCode = await imagekit.upload({
//         fileName: "booking_qr_code",
//         file: qr.toString('base64')
//     });

//     return qrCode.url;
// };

export const generateQrCode = async (id) => {
    const code = await encodeBookingCode(id);
    const resetToken = jwt.sign({ code }, process.env.JWT_SECRET_FORGET);
    const url = `${process.env.DOMAIN_URL}/api/v1/bookings/ticket?token=${resetToken}`;

    const qr = await generateQrPng(url);

    const qrCode = await imagekit.upload({
        fileName: "testing",
        file: qr.toString('base64')
    });

    const updatedBooking = await prisma.booking.update({
        where: {
            id: parseInt(id),
        },
        data: { urlQrcode: qrCode.url },
    });

    return updatedBooking.urlQrcode;
};