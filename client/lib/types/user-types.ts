export type UserType = {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "USER";
  isActive: boolean;
  profileImageUrl: string;
  createdAt: Date;
};
