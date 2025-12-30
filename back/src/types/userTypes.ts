export interface UserFormData {
  name: string;
  surnames: string;
  userName: string;
  email: string;
  password: string;
  description?: string;
};

export interface UpdateUserBody {
  [key: string]: any; 
}

export interface User extends Omit<UserFormData, 'password'> {
  PK_UserID: number;
  Password: string;
};