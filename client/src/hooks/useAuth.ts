import { useEffect, useState } from 'react';
import { decodeToken } from '../utils/decodeToken';

interface User {
  role: string;
  name: string;
  companyName?: string;
}

export const useAuth = (): User | null => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const decoded = decodeToken(token);
          if (decoded?.role && decoded?.name) {
            setUser({ role: decoded.role, name: decoded.name, companyName: decoded.companyName });
          } else {
            setUser(null);
          }
        } catch {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    };

    checkAuth();
    window.addEventListener('authChange', checkAuth);

    return () => window.removeEventListener('authChange', checkAuth);
  }, []);

  return user;
};
