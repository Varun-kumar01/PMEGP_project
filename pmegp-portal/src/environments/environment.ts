export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  apiVersion: 'v1',
  timeout: 30000,
  endpoints: {
    login: '/auth/login',
    logout: '/auth/logout',
    refreshToken: '/auth/refresh',
    validateToken: '/auth/validate',
    stateLogin: '/auth/state-login',
    districtLogin: '/auth/district-login',
    employeeLogin: '/auth/employee-login',
    getUserProfile: '/user/profile',
    updateProfile: '/user/profile'
  }
};
