import { status } from "http-status";


import { prisma } from "../../lib/prisma";
import bcrypt from "bcryptjs";
import { tokenUtils } from "../../utils/token";
import { UserStatus } from "../../../generated/prisma/enums";
import { IUserChangePasswordPayload, IUserLoginPayload, IUserPayload } from "./auth.interface";
import { IRequestUser } from "../../interfaces/interface";
import { jwtUtils } from "../../utils/jwt";
import { JwtPayload } from "jsonwebtoken";
import { CookieUtils } from "../../utils/cookie";
import { Response } from "express";
import { sendResponse } from "../../shared/sendResponse";
import AppError from "../../errorHelpers/AppError";

//   @@index([email])
//   @@map("user")
// }

const registerUser = async (payload: IUserPayload) => {
  const { name, email, password } = payload;

  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    throw new Error("User already exists");
  }

  const hasehdPassword = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      password: hasehdPassword,
    },
  });

  if (!user) {
    throw new AppError(
      status.INTERNAL_SERVER_ERROR,
      "User could not be created"
    );
  }

  const accessToken = tokenUtils.getAccessToken({
    userId: user.id,
    role: user.role,
    name: user.name,
    email: user.email,
    status: user.status,
    isDeleted: user.isDeleted,
    emailVerified: user.emailVerified,
  });
  const refreshToken = tokenUtils.getRefreshToken({
    userId: user.id,
    role: user.role,
    name: user.name,
    email: user.email,
    status: user.status,
    isDeleted: user.isDeleted,
    emailVerified: user.emailVerified,
  });

  const { password: _, ...userData } = user;
  return {
    userData,
    accessToken,
    refreshToken,
  };
};

const getMe = async (user: IRequestUser) => {
  const Me = await prisma.user.findUnique({
    where: {
      id: user.userId,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      isDeleted: true,
      isSubscribed:true,
      image:true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!Me) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }
  return Me;
};

const loginUser = async (payload: IUserLoginPayload) => {
  const { email, password } = payload;

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      status: true,
      isDeleted: true,
      emailVerified: true,
      password: true,
    },
  });

  if (!user) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  const isPasswordMatched = await bcrypt.compare(password, user.password);

  if (!isPasswordMatched) {
    throw new AppError(status.UNAUTHORIZED, "Invalid credentials");
  }

  if (user.status === UserStatus.BLOCKED) {
    throw new AppError(status.FORBIDDEN, "User is blocked");
  }

  if (user.status === UserStatus.DELETED) {
    throw new AppError(status.FORBIDDEN, "User is deleted");
  }

  const accessToken = tokenUtils.getAccessToken({
    userId: user.id,
    role: user.role,
    name: user.name,
    email: user.email,
    status: user.status,
    isDeleted: user.isDeleted,
    emailVerified: user.emailVerified,
  });
  const refreshToken = tokenUtils.getRefreshToken({
    userId: user.id,
    role: user.role,
    name: user.name,
    email: user.email,
    status: user.status,
    isDeleted: user.isDeleted,
    emailVerified: user.emailVerified,
  });

  const { password: _, ...userData } = user;

  return {
    userData,
    accessToken,
    refreshToken,
  };
};

const getNewToken = async (refreshToken: string) => {
  const verifyToken = jwtUtils.verifyToken(
    refreshToken,
    process.env.REFRESH_TOKEN_SECRET as string
  );
  if (!verifyToken.success) {
    throw new AppError(status.UNAUTHORIZED, "Invalid token");
  }
  const data = verifyToken.data as JwtPayload;

  const user = await prisma.user.findUnique({ where: { id: data.userId } });

  if (!user) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }
  if (user.status === UserStatus.BLOCKED) {
    throw new AppError(status.FORBIDDEN, "User is blocked");
  }

  const newAccessToken = tokenUtils.getAccessToken({
    userId: data.userId,
    role: data.role,
    name: data.name,
    email: data.email,
    status: data.status,
    isDeleted: data.isDeleted,
    emailVerified: data.emailVerified,
  });

  const newRefreshToken = tokenUtils.getRefreshToken({
    userId: data.userId,
    role: data.role,
    name: data.name,
    email: data.email,
    status: data.status,
    isDeleted: data.isDeleted,
    emailVerified: data.emailVerified,
  });

  return {
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
  };
};


const changePassword = async (
  payload: IUserChangePasswordPayload,
  user: IRequestUser
) => {
  const { oldPassword, newPassword } = payload;
  const userExists = await prisma.user.findUnique({
    where: { id: user.userId },
  });

  if (!userExists) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }
  const isPasswordMatched = await bcrypt.compare(
    oldPassword,
    userExists.password
  );

  if (!isPasswordMatched) {
    throw new AppError(status.UNAUTHORIZED, "Invalid credentials");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: user.userId },
    data: { password: hashedPassword },
  });
  const accessToken = tokenUtils.getAccessToken({
    userId: userExists.id,
    role: userExists.role,
    name: userExists.name,
    email: userExists.email,
    status: userExists.status,
    isDeleted: userExists.isDeleted,
    emailVerified: userExists.emailVerified,
  });
  const refreshToken = tokenUtils.getRefreshToken({
    userId: userExists.id,
    role: userExists.role,
    name: userExists.name,
    email: userExists.email,
    status: userExists.status,
    isDeleted: userExists.isDeleted,
    emailVerified: userExists.emailVerified,
  });

  return {
    accessToken,
    refreshToken,
  };
};

const logOutUser = async (res: Response) => {
  CookieUtils.clearCookie(res, "refreshToken", {});
  CookieUtils.clearCookie(res, "accessToken", {});
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "User logged out successfully",
    data: {},
  });
};
const subscribe = async (email: string,user:IRequestUser) => {
  const userExists = await prisma.user.findUnique({
    where:{email:email},
    select:{id:true}
  })
  if(!userExists){
    throw new AppError(status.NOT_FOUND, "Invalid email address");
  }

  if(userExists.id !== user.userId){
    throw new AppError(status.FORBIDDEN, "Input your own email address");
  }
  const subscribedUser = await prisma.user.update({
    where:{email:email},
    data:{isSubscribed:true}
  })
  return subscribedUser


};

export const AuthService = {
  registerUser,
  loginUser,
  getMe,
  getNewToken,
  changePassword,
  logOutUser,
  subscribe
};
