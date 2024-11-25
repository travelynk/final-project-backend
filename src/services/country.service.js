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
    data: {
      code: data.code,
      name: data.name,
      region: data.region,
    },
  });
};

export const update = async (code, data) => {
  return await prisma.country.update({
    where: {
      code,
    },
    data: {
      code: data.code,
      name: data.name,
      region: data.region,
    },
  });
};

export const destroy = async (code) => {
  return await prisma.country.delete({
    where: {
      code,
    },
  });
};
