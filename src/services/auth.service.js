import prisma from "../configs/database.js";
import { Error400, Error401, Error404, Error409 } from "../utils/customError.js";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';

export const login = async ({email, password}) => {
  try {
    //validasi input
    if (!email || !password) {
        throw new Error400('Email and password are required!');
    }

    const user = await prisma.user.findUnique({
      where: {email}
    });

    if (!user) {
        throw new Error400('Invalid email!');
    }

    if (!user.verified) {
        throw new Error401('Account has not been verified');
    }

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch) {
        throw new Error400('Invalid password!');
    }

    //generate JWT token
    const token = jwt.sign(
      {id: user.id, role: user.role}, 
      process.env.JWT_SECRET, 
      {expiresIn: '1d'}
    );
    
    return {
      token, 
      user: {email: user.email, role: user.role}
    };
  } catch (error) {
      if (error instanceof Error400 || error instanceof Error401) {
          throw error;
      } else {
          throw new Error("Internal Server Error");
      }
  }
};
