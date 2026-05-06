import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  useCallback,
} from "react";
import { apiFetch } from "@/lib/api";

export interface UserInfo {
  id: string | number;
  name: string;
  email: string;
  role: string;
  first_name?: string | null;
  last_name?: string | null;
  hospital_id?: number | null;
  hospital_name?: string | null;
  hospital_license_number?: string | null;
  must_change_password?: boolean;
}

interface AuthContextType {
  user: UserInfo | null;
  loading: boolean;
  signOut: () => void;
  loginSuccess: (token: string, user: UserInfo) => void;
  refreshUser: () => Promise<void>;
  updateStoredUser: (user: UserInfo) => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: () => {},
  loginSuccess: () => {},
  refreshUser: async () => {},
  updateStoredUser: () => {},
});

export const useAuth = () => useContext(AuthContext);

function normalizeUser(raw: Record<string, unknown>): UserInfo {
  return {
    id: raw.id as string | number,
    name: String(raw.name ?? ""),
    email: String(raw.email ?? ""),
    role: String(raw.role ?? "user"),
    first_name: (raw.first_name as string) ?? null,
    last_name: (raw.last_name as string) ?? null,
    hospital_id: raw.hospital_id != null ? Number(raw.hospital_id) : null,
    hospital_name: (raw.hospital_name as string) ?? null,
    hospital_license_number:
      (raw.hospital_license_number as string) ?? null,
    must_change_password: Boolean(raw.must_change_password),
  };
}

function getUserFromStorage(): UserInfo | null {
  try {
    const token = localStorage.getItem("authToken");
    const userStr = localStorage.getItem("authUser");
    if (token && userStr) {
      return normalizeUser(JSON.parse(userStr));
    }
    return null;
  } catch {
    return null;
  }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = getUserFromStorage();
    setUser(storedUser);
    setLoading(false);

    const onStorage = () => {
      setUser(getUserFromStorage());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    setUser(null);
  }, []);

  const loginSuccess = useCallback((token: string, next: UserInfo) => {
    localStorage.setItem("authToken", token);
    localStorage.setItem("authUser", JSON.stringify(next));
    setUser(next);
  }, []);

  const updateStoredUser = useCallback((next: UserInfo) => {
    localStorage.setItem("authUser", JSON.stringify(next));
    setUser(next);
  }, []);

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem("authToken");
    if (!token) return;
    try {
      const data = await apiFetch("/api/auth/me");
      if (data?.user) {
        const u = normalizeUser(data.user);
        localStorage.setItem("authUser", JSON.stringify(u));
        setUser(u);
      }
    } catch {
      /* keep cached user */
    }
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signOut,
        loginSuccess,
        refreshUser,
        updateStoredUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
