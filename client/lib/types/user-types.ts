export type UserType = {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "USER";
  status: "ACTIVE" | "SUSPENDED";
  createdAt: string;
  updatedAt: string;
};
