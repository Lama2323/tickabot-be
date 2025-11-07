export enum UserRole {
  ADMIN = 'admin',
  SUPPORT_AGENT = 'support_agent',
  USER = 'user',
}

export interface User {
  id: string;
  email: string;
  password: string;
  role: UserRole;
  name: string;
  createdAt?: Date;
  updatedAt?: Date;
}
