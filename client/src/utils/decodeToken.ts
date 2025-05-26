import { jwtDecode } from 'jwt-decode';

interface DecodedToken {
  id: string;
  role: string;
  name: string;
  exp: number;
  iat: number;
}

export const decodeToken = (token: string): DecodedToken | null => {
  try {
    const decoded: DecodedToken = jwtDecode(token);

    // Check if the token is expired
    const currentTime = Date.now() / 1000; // Current time in seconds
    if (decoded.exp && decoded.exp < currentTime) {
      console.error('Token has expired');
      return null;
    }

    return decoded;
  } catch (error) {
    console.error('Token decoding failed:', error);
    return null;
  }
};
