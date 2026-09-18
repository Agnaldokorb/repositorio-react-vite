import { vi } from "vitest";

// jsdom não calcula layout. Este helper simula apenas mudanças de media query.
export function mockMatchMedia() {
  const queries = new Map();
  vi.stubGlobal(
    "matchMedia",
    vi.fn((query) => {
      if (!queries.has(query)) {
        const target = new EventTarget();
        queries.set(
          query,
          Object.assign(target, {
            media: query,
            matches: false,
            onchange: null,
            addListener: (listener) =>
              target.addEventListener("change", listener),
            removeListener: (listener) =>
              target.removeEventListener("change", listener),
          }),
        );
      }
      return queries.get(query);
    }),
  );
  return (query, matches) => {
    const media = window.matchMedia(query);
    media.matches = matches;
    media.dispatchEvent(
      Object.assign(new Event("change"), { matches, media: query }),
    );
  };
}
