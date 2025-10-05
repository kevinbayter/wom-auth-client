/**
 * Development environment configuration
 */
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080',
  tokenExpirationBuffer: 60,
  auth: {
    // Inactivity timeout in milliseconds (15 minutes)
    // User will be automatically logged out after this period of inactivity
    inactivityTimeout: 15 * 60 * 1000, // 900,000 ms = 15 minutes
    
    // Access token lifetime from backend (15 minutes)
    accessTokenLifetime: 15 * 60 * 1000, // 900,000 ms = 15 minutes
  }
};
