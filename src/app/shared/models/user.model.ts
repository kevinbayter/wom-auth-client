/**
 * User related models
 */

export enum UserStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  LOCKED = 'LOCKED'
}

export interface User {
  id: number;
  email: string;
  username: string;
  fullName: string;
  status: UserStatus;
  lastLoginAt: string;
  createdAt: string;
}
