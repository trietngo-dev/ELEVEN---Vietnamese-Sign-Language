export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  userId: number;
  email: string;
  fullName: string;
  roleCode: string;
  sessionToken: string;
  accessToken: string;
  tokenType: string;
  expiresAtUtc: string;
}

export interface UserResponse {
  id: number;
  roleId: number;
  email: string;
  fullName: string;
  avatarMediaId: number | null;
  status: number;
  emailVerifiedAt: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface RequestAccountDeletionOtpRequest {
  email: string;
}

export interface ConfirmAccountDeletionRequest {
  email: string;
  code: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export const authApi = {
  login: async (data: LoginRequest): Promise<LoginResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/users/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Đăng nhập thất bại");
    }

    return response.json();
  },

  register: async (data: RegisterRequest): Promise<UserResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/users/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Đăng ký thất bại");
    }

    return response.json();
  },

  loginWithGoogle: async (idToken: string, fullName?: string): Promise<LoginResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/users/google-login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ idToken, fullName }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Đăng nhập Google thất bại");
    }

    return response.json();
  },

  deleteAccount: async (userId: number): Promise<void> => {
    const token = tokenStorage.getToken();
    const response = await fetch(`${API_BASE_URL}/api/users/${userId}`, {
      method: "DELETE",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Xóa tài khoản thất bại");
    }
  },

  requestAccountDeletionOtp: async (data: RequestAccountDeletionOtpRequest): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/users/account-deletion/request-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Không thể gửi mã xác nhận");
    }
  },

  confirmAccountDeletion: async (data: ConfirmAccountDeletionRequest): Promise<void> => {
    const response = await fetch(`${API_BASE_URL}/api/users/account-deletion/confirm`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Không thể xóa tài khoản");
    }
  },
};

export const tokenStorage = {
  getToken: () => localStorage.getItem("accessToken"),
  setToken: (token: string) => localStorage.setItem("accessToken", token),
  clearToken: () => localStorage.removeItem("accessToken"),
  
  getUser: () => {
    const user = localStorage.getItem("authUser");
    return user ? JSON.parse(user) : null;
  },
  setUser: (user: any) => localStorage.setItem("authUser", JSON.stringify(user)),
  clearUser: () => localStorage.removeItem("authUser"),
};
