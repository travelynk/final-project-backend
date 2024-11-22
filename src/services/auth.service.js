// import prisma from "../configs/database.js";

export const login = async (data) => {
    const user = data;

    if (!user) {
        return null;
    }

    const token = "jwt token";

    return { token };
}