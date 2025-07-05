import { describe, it, expect, vi } from "vitest";
import HasherCache from "./HasherCache";
import { of } from "rxjs";

describe("HasherCache", () => {
  it("should call the factory function on the first call", () => {
    const factoryFn = vi.fn((data: string) => of(`hashed:${data}`));
    const cache = new HasherCache();

    cache.get("test", () => factoryFn("test"));
    expect(factoryFn).toHaveBeenCalledTimes(1);
    expect(factoryFn).toHaveBeenCalledWith("test");
  });

  it("should return a cached observable on subsequent calls", () => {
    const factoryFn = vi.fn((data: string) => of(`hashed:${data}`));
    const cache = new HasherCache();

    const observable1 = cache.get("test", () => factoryFn("test"));
    const observable2 = cache.get("test", () => factoryFn("test"));

    // The factory function should only be called once
    expect(factoryFn).toHaveBeenCalledTimes(1);
    // The returned observable should be the exact same instance
    expect(observable1).toBe(observable2);
  });

  it("should call the factory function again for different data", () => {
    const factoryFn = vi.fn((data: string) => of(`hashed:${data}`));
    const cache = new HasherCache();

    cache.get("test1", () => factoryFn("test1"));
    cache.get("test2", () => factoryFn("test2"));

    expect(factoryFn).toHaveBeenCalledTimes(2);
    expect(factoryFn).toHaveBeenCalledWith("test1");
    expect(factoryFn).toHaveBeenCalledWith("test2");
  });
});
