// services/updateProfile.service.js
import prisma from "../configs/database.js";
import { Error404 } from "../utils/customError.js";

export const dataProfile = async (data, userId) => {
    const { grossAmount, firstName, lastName, email, phone } = data;

    // Cek apakah user ada dalam database
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user) {
        throw new Error404("User not found");
    }

    // Update profile user
    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
            email, // Memperbarui email
            Profile: {
                update: {
                    firstName,
                    lastName,
                    phone,
                    grossAmount, // Menambahkan grossAmount ke profile
                },
            },
        },
        include: { Profile: true },
    });

    return updatedUser;
};
