import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react';
import type { User, SignInDto, SignUpDto, UpdateProfileDto } from '../types';
import { authService } from '../services/authService';
import api from '../services/api';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  signIn: (data: SignInDto) => Promise<void>;
  signUp: (data: SignUpDto) => Promise<void>;
  signOut: () => void;
  updateProfile: (data: UpdateProfileDto) => Promise<void>;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('token');

      if (token) {
        try {
          const response = await api.get<User>('/auth/profile');
          const userData = response.data;
          localStorage.setItem('user', JSON.stringify(userData));
          setUser(userData);
        } catch {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    void initAuth();
  }, []);

  const signIn = async (data: SignInDto) => {
    const response = await authService.signIn(data);
    localStorage.setItem('token', response.accessToken);

    // Fetch user profile after signin
    const userResponse = await api.get<User>('/auth/profile');
    const userData = userResponse.data;
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const signUp = async (data: SignUpDto) => {
    await authService.signUp(data);
  };

  const signOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateProfile = async (data: UpdateProfileDto) => {
    const updatedUser = await authService.updateProfile(data);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const refreshUser = (): void => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData) as User);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        signIn,
        signUp,
        signOut,
        updateProfile,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
