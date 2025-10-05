import { TestBed } from '@angular/core/testing';
import { TokenService } from './token.service';

describe('TokenService', () => {
  let service: TokenService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TokenService);
    sessionStorage.clear();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('Access Token Management', () => {
    it('should set and get access token', () => {
      const token = 'test-access-token';
      service.setAccessToken(token);
      expect(service.getAccessToken()).toBe(token);
    });

    it('should return null when no access token is set', () => {
      expect(service.getAccessToken()).toBeNull();
    });

    it('should expose readonly signal for access token', () => {
      const token = 'test-access-token';
      service.setAccessToken(token);
      expect(service.accessToken$()).toBe(token);
    });

    it('should update signal when access token changes', () => {
      const token1 = 'token-1';
      const token2 = 'token-2';
      
      service.setAccessToken(token1);
      expect(service.accessToken$()).toBe(token1);
      
      service.setAccessToken(token2);
      expect(service.accessToken$()).toBe(token2);
    });
  });

  describe('Refresh Token Management', () => {
    it('should set and get refresh token from sessionStorage', () => {
      const token = 'test-refresh-token';
      service.setRefreshToken(token);
      expect(service.getRefreshToken()).toBe(token);
      expect(sessionStorage.getItem('wom_refresh_token')).toBe(token);
    });

    it('should return null when no refresh token is set', () => {
      expect(service.getRefreshToken()).toBeNull();
    });

    it('should persist refresh token in sessionStorage', () => {
      const token = 'test-refresh-token';
      service.setRefreshToken(token);
      
      // Create new instance to verify persistence
      const newService = TestBed.inject(TokenService);
      expect(newService.getRefreshToken()).toBe(token);
    });
  });

  describe('Clear Tokens', () => {
    it('should clear both access and refresh tokens', () => {
      service.setAccessToken('access-token');
      service.setRefreshToken('refresh-token');
      
      service.clearTokens();
      
      expect(service.getAccessToken()).toBeNull();
      expect(service.getRefreshToken()).toBeNull();
      expect(sessionStorage.getItem('wom_refresh_token')).toBeNull();
    });

    it('should reset access token signal to null', () => {
      service.setAccessToken('access-token');
      service.clearTokens();
      expect(service.accessToken$()).toBeNull();
    });
  });

  describe('Has Tokens', () => {
    it('should return true when both tokens are present', () => {
      service.setAccessToken('access-token');
      service.setRefreshToken('refresh-token');
      expect(service.hasTokens()).toBe(true);
    });

    it('should return false when access token is missing', () => {
      service.setRefreshToken('refresh-token');
      expect(service.hasTokens()).toBe(false);
    });

    it('should return false when refresh token is missing', () => {
      service.setAccessToken('access-token');
      expect(service.hasTokens()).toBe(false);
    });

    it('should return false when both tokens are missing', () => {
      expect(service.hasTokens()).toBe(false);
    });
  });

  describe('Security', () => {
    it('should not expose access token in localStorage', () => {
      service.setAccessToken('access-token');
      expect(localStorage.getItem('wom_refresh_token')).toBeNull();
      expect(localStorage.getItem('access_token')).toBeNull();
    });

    it('should only store refresh token in sessionStorage, not localStorage', () => {
      service.setRefreshToken('refresh-token');
      expect(sessionStorage.getItem('wom_refresh_token')).toBe('refresh-token');
      expect(localStorage.getItem('wom_refresh_token')).toBeNull();
    });
  });
});
