import { Injectable } from 'static-injector';

@Injectable()
export class LimitService {
  obj: Record<string, Map<string, number>> = {};
  user: Record<string, Map<string, number>> = {};
  setIpLimit(key: string, ip: string, limitTimeout: number, times: number = 1) {
    this.#setLimit(this.obj, key, ip, limitTimeout, times);
  }

  setUserLimit(
    key: string,
    account: string,
    limitTimeout: number,
    times: number = 1,
  ) {
    this.#setLimit(this.user, key, account, limitTimeout, times);
  }
  #setLimit(
    record: Record<string, Map<string, number>>,
    key: string,
    token: string,
    limitTimeout: number,
    times: number = 1,
  ) {
    record[key] ??= new Map();
    const exist = record[key].get(token) || 0;

    if (exist >= times) {
      return;
    }

    record[key].set(token, exist + 1);
    setTimeout(() => {
      const temp = record[key].get(token)!;
      if (!temp) {
        return;
      }
      if (temp === 1) {
        record[key].delete(token);
      } else {
        record[key].set(token, temp - 1);
      }
    }, limitTimeout);
  }
  clearUserLimit(key: string, account: string) {
    return this.#clearUserLimit(this.user, key, account);
  }
  clearIpLimit(key: string, ip: string) {
    return this.#clearUserLimit(this.obj, key, ip);
  }
  #clearUserLimit(
    record: Record<string, Map<string, number>>,
    key: string,
    account: string,
  ) {
    if (!record[key]) {
      return;
    }
    record[key].delete(account);
  }
  getUserLimit(routerPath: string, key: string, times: number) {
    return this.#getLimit(this.user, routerPath, key, times);
  }
  getIpLimit(key: string, ip: string, times: number) {
    return this.#getLimit(this.obj, key, ip, times);
  }
  #getLimit(
    record: Record<string, Map<string, number>>,
    key: string,
    ip: string,
    times: number,
  ) {
    const map = record[key];
    if (!map) {
      return false;
    }
    const result = record[key].get(ip) || 0;
    return result >= times;
  }
}
