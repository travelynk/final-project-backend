import prisma from "../configs/database.js";

export const getAll = async () => {
    const users = await prisma.user.findMany({
        include: {
            profile: true
        },
        orderBy: {
            role: 'asc'
        }
    });

    return users.map(user => {
        return {
            id: user.id,
            email: user.email,
            role: user.role,
            verified: user.verified,
            profile: {
                id: user.profile.id,
                fullName: user.profile.fullName,
                phone: user.profile.phone,
                gender: user.profile.gender
            }
        };
    })

};

export const getOne = async (id) => {
    const user = await prisma.user.findUnique({
        where: {
            id: parseInt(id)
        },
        include: {
            profile: true
        }
    });

    if (!user) return null;

    return {
        id: user.id,
        email: user.email,
        role: user.role,
        verified: user.verified,
        profile: {
            id: user.profile.id,
            fullName: user.profile.fullName,
            phone: user.profile.phone,
            gender: user.profile.gender
        }
    };
};

export const update = async (id, data) => {
    const user = await prisma.user.update({
        where: {
            id: parseInt(id)
        },
        data
    });

    return {
        id: user.id,
        email: user.email,
        role: user.role,
    };
};