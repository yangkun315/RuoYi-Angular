import { Injectable } from '@angular/core';

const TOKEN_KEY = 'Admin-Token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  getToken(): string | null {
    const match = document.cookie.match(new RegExp('(^| )' + TOKEN_KEY + '=([^;]+)'));
    return match ? decodeURIComponent(match[2]) : null;
  }

  setToken(token: string): void {
    const expires = new Date();
    expires.setTime(expires.getTime() + 24 * 60 * 60 * 1000); // 24h
    document.cookie = `${TOKEN_KEY}=${encodeURIComponent(token)};expires=${expires.toUTCString()};path=/`;
  }

  removeToken(): void {
    document.cookie = `${TOKEN_KEY}=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/`;
  }
}
