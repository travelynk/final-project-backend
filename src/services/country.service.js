import prisma from "../configs/database.js";

export const getAll = async () => {
  return await prisma.country.findMany();
};

export const getOne = async (code) => {
  return await prisma.country.findUnique({
    where: {
      code,
    },
  });
};

export const store = async (data) => {
  return await prisma.country.create({
    data
  });
};

export const update = async (code, data) => {
  return await prisma.country.update({
    where: {
      code,
    },
    data,
  });
};

export const destroy = async (code) => {
  return await prisma.country.delete({
    where: {
      code,
    },
  });
};
