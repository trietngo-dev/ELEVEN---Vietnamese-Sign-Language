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

export interface RequestPasswordResetOtpRequest {
  email: string;
}

export interface ConfirmPasswordResetRequest {
  email: string;
  code: string;
  newPassword: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
const ACCOUNT_DELETION_TIMEOUT_MS = 25000;

const fetchWithTimeout = async (input: RequestInfo | URL, init?: RequestInit, timeoutMs = ACCOUNT_DELETION_TIMEOUT_MS) => {
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(input, {
      ...init,
      signal: controller.signal,
    });
  } catch (error: any) {
    if (error?.name === "AbortError") {
      throw new Error("Yêu cầu gửi mã quá thời gian. Vui lòng thử lại.");
    }

    throw error;
  } finally {
    window.clearTimeout(timeoutId);
  }
};

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
    const response = await fetchWithTimeout(`${API_BASE_URL}/api/users/account-deletion/request-otp`, {
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
    const response = await fetchWithTimeout(`${API_BASE_URL}/api/users/account-deletion/confirm`, {
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

  requestPasswordResetOtp: async (data: RequestPasswordResetOtpRequest): Promise<void> => {
    const response = await fetchWithTimeout(`${API_BASE_URL}/api/users/password-reset/request-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Không thể gửi mã đặt lại mật khẩu");
    }
  },

  confirmPasswordReset: async (data: ConfirmPasswordResetRequest): Promise<void> => {
    const response = await fetchWithTimeout(`${API_BASE_URL}/api/users/password-reset/confirm`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Không thể đặt lại mật khẩu");
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
