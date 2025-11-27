// src/core/users/user.types.ts

export interface User {
    id: string;
    name: string;
    email: string;
    password_hash?: string | null;
    google_id?: string | null;
    created_at: string;
  }
  
  export interface CreateUserInput {
    name: string;
    email: string;
    password_hash?: string | null;
    google_id?: string | null;
  }
  
  export interface AuthUser {
    id: string;
    name: string;
    email: string;
  }
  