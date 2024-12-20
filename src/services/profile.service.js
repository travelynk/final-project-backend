import prisma from "../configs/database.js";
import { Error404 } from "../utils/customError.js";

export const getProfile = async (id) => {
    const user = await prisma.user.findUnique({
        where: {
            id: parseInt(id),
        },
        include: {
            profile: true,
        },
    });

    if (!user) {
        throw new Error404("Pengguna tidak ditemukan. Pastikan informasi yang Anda masukkan sudah benar dan coba lagi.");
    }

    const result = {
        id: user.id,
        fullName: user.profile.fullName,
        phone: user.profile.phone,
        email: user.email,
    };

    return result;
}

export const updateProfile = async (id, data) => {

    const { email, fullName, phone } = data;

    const updatedUser = await prisma.user.update({
        where: {
            id: parseInt(id),
        },
        data: {
            email: email,
            profile: {
                update: {
                    fullName: fullName,
                    phone: phone,
                },
            },
        },
        include: {
            profile: true,
        },
    });

    if (!updatedUser) {
        throw new Error404("Pengguna tidak ditemukan. Pastikan informasi yang Anda masukkan sudah benar dan coba lagi.");
    }

    const result = {
        id: updatedUser.id,
        fullName: updatedUser.profile.fullName,
        phone: updatedUser.profile.phone,
        email: updatedUser.email,
    };

    return result;
}
