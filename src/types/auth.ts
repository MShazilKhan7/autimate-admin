export interface SignInRequest {
    email: string;
    password: string;
  }
  
  export interface SignUpRequest {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }
  
  export interface SignOutRequest {
    refresh_token: string;
  }
  
  export interface User {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    isVerified: boolean;
    isOnboardingFinish: boolean;
  }
  
  export interface Authentication {
    accessToken: string;
    refreshToken: string;
    user: User | null;

  }
  