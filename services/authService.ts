
const ADMIN_KEY = 'otc_pool_admin_auth';
const ADMIN_PWD = 'guatemala2024';

export const authService = {
  isAdmin: (): boolean => {
    return localStorage.getItem(ADMIN_KEY) === 'true';
  },
  login: (password: string): boolean => {
    if (password === ADMIN_PWD) {
      localStorage.setItem(ADMIN_KEY, 'true');
      return true;
    }
    return false;
  },
  logout: (): void => {
    localStorage.removeItem(ADMIN_KEY);
  }
};
