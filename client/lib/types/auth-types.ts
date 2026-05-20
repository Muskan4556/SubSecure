import { UserType } from "./user-types";

export type LoginRequest = {
  email: string;
  password: string;
};

export type SignupRequest = {
  name: string;
  email: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
  user: UserType;
};

export type AuthContextType = {
  accessToken: string | null;
  user: UserType | null;
  isLoading: boolean;
  setAuth: (token: string | null, user: UserType | null) => void;
  logout: () => void;
};
