import { Request, Response } from "express";
import { catchAsync } from "../../shared/cathAsync";
import ms, { StringValue } from "ms";
import { AuthService, IUserChangePasswordPayload } from "./auth.services";
import { tokenUtils } from "../../utils/token";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import { send } from "process";
import AppError from "../../errorHelpers/AppError";


const registerUser = catchAsync(async (req: Request, res: Response) => {
  const maxAge = ms(process.env.ACCESS_TOKEN_EXPIRES_IN as StringValue);
  console.log('THIS IS THE req.body',req.body)
  const result = await AuthService.registerUser(req.body);
  console.log("THIS IS THE RESULT", result);
  const { userData, accessToken, refreshToken } = result;

  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, refreshToken);

  sendResponse(res, {
    statusCode: status.CREATED,
    success: true,
    message: "User created successfully",
    data: {
      userData,
      accessToken,
      refreshToken,
    },
  });
});

const loginUser = catchAsync(async (req: Request, res: Response) => {
  const result = await AuthService.loginUser(req.body);

  const { userData, accessToken, refreshToken } = result;

  // console.log('THIS IS THE USER DATA',userData)
  // console.log('THIS IS THE ACCESS TOKEN',accessToken)
  // console.log('THIS IS THE REFRESH TOKEN',refreshToken)

  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, refreshToken);

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "User logged in successfully",
    data: {
      userData,
      accessToken,
      refreshToken,
    },
  });
});

const getMe = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;

  const result = await AuthService.getMe(user);

  // console.log('THIS IS THE USER',user)
  // console.log('THIS IS THE RESULT',result)
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "User fetched successfully",
    data: result,
  });
});

const getNewToken = catchAsync(async (req: Request, res: Response) => {
  const refreshToken = req.cookies.refreshToken;

  if (!refreshToken) {
    throw new AppError(status.UNAUTHORIZED, "You are not logged in");
  }

  const result = await AuthService.getNewToken(refreshToken);

  const { accessToken, refreshToken: newRefreshToken } = result;

  tokenUtils.setAccessTokenCookie(res, accessToken);
  tokenUtils.setRefreshTokenCookie(res, newRefreshToken);
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "New token fetched successfully",
    data: {
      accessToken,
      newRefreshToken,
    },
  });
});

const changPassword = catchAsync(async (req: Request, res: Response) => {
  const user = req.user;
  const result = await AuthService.changePassword(
    req.body as IUserChangePasswordPayload,
    user
  );

  const { accessToken, refreshToken } = result;

  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Password changed successfully",
    data: { accessToken, refreshToken },
  });
});
const subscribe = catchAsync(async (req: Request, res: Response) => {
  const user = req.user
  const {email} = req.body
  console.log('THIS IS THE EMAIL from subscribe',email)
  console.log('THIS IS THE USER from subscribe',user)
  const result = await AuthService.subscribe(email,user)
  sendResponse(res, {
    statusCode: status.OK,
    success: true,
    message: "Subscribed successfully",
    data: result,
  });
})




export const AuthController = {
  registerUser,
  loginUser,
  getMe,
  getNewToken,
  changPassword,
  subscribe
};
