import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

interface UserInfo {
  id: string | number;
  name: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: UserInfo | null;
  loading: boolean;
  signOut: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signOut: () => {},
});

export const useAuth = () => useContext(AuthContext);

function getUserFromStorage(): UserInfo | null {
  try {
    const token = localStorage.getItem("authToken");
    const userStr = localStorage.getItem("authUser");
    if (token && userStr) {
      return JSON.parse(userStr);
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

    // Listen for login/register events from other tabs
    const onStorage = () => {
      setUser(getUserFromStorage());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const signOut = () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("authUser");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
