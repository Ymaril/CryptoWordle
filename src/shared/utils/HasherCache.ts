import { Observable } from "rxjs";

export default class HasherCache {
  private cache = new Map<string, Observable<any>>();

  get<T>(key: string, factory: () => Observable<T>): Observable<T> {
    if (!this.cache.has(key)) {
      this.cache.set(key, factory());
    }
    return this.cache.get(key)!;
  }
}
