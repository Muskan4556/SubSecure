import { UserType } from "./user-types";

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
  user: UserType;
};

export const DEMO_CREDENTIALS: LoginRequest = {
  email: process.env.NEXT_PUBLIC_DEMO_EMAIL ?? "",
  password: process.env.NEXT_PUBLIC_DEMO_PASSWORD ?? "",
};

export type AuthContextType = {
  accessToken: string | null;
  user: UserType | null;
  isLoading: boolean;
  setAuth: (token: string | null, user: UserType | null) => void;
  logout: () => void;
};
