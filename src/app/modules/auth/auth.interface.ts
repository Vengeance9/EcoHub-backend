export interface IUserPayload {
  name: string;
  email: string;
  password: string;
}

export interface IUserLoginPayload {
  email: string;
  password: string;
}

export interface IUserChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
}
