import { ParsedUrl, DiffResult } from "../types";

export function urlToReadableJson(urlString: string): ParsedUrl {
  try {
    const url = new URL(urlString);
    const params: Record<string, string | string[]> = {};

    url.searchParams.forEach((value, key) => {
      if (key in params) {
        const existingValue = params[key];
        if (Array.isArray(existingValue)) {
          existingValue.push(value);
        } else {
          params[key] = [existingValue, value];
        }
      } else {
        // Try parsing with progressive decoding
        let decodedValue = value;
        while (decodedValue.includes("%")) {
          try {
            const decoded = decodeURIComponent(decodedValue);
            if (decoded === decodedValue) break;
            decodedValue = decoded;
          } catch {
            break;
          }
        }

        try {
          params[key] = JSON.parse(decodedValue);
        } catch {
          params[key] = value;
        }
      }
    });

    return {
      baseUrl: `${url.protocol}//${url.host}${url.pathname}`,
      params,
    };
  } catch (err) {
    return {
      error: (err as Error).message,
      baseUrl: "",
      params: {},
    };
  }
}

export function computeUrlDiff(oldUrl: string, newUrl: string): DiffResult {
  const oldParsed = urlToReadableJson(oldUrl);
  const newParsed = urlToReadableJson(newUrl);

  const result: DiffResult = {
    base_url: {
      old: oldParsed.baseUrl,
      new: newParsed.baseUrl,
      changed: oldParsed.baseUrl !== newParsed.baseUrl,
    },
    params: {
      added: {},
      removed: {},
      changed: {},
      unchanged: {},
    },
  };

  // Find added and changed params
  Object.entries(newParsed.params).forEach(([key, value]) => {
    if (!(key in oldParsed.params)) {
      result.params.added[key] = value;
    } else if (
      JSON.stringify(oldParsed.params[key]) !== JSON.stringify(value)
    ) {
      result.params.changed[key] = {
        old: oldParsed.params[key],
        new: value,
      };
    } else {
      result.params.unchanged[key] = value;
    }
  });

  // Find removed params
  Object.keys(oldParsed.params).forEach((key) => {
    if (!(key in newParsed.params)) {
      result.params.removed[key] = oldParsed.params[key];
    }
  });

  return result;
}

export function formatJsonString(parsed: ParsedUrl): string {
  if (parsed.error) {
    return parsed.error;
  }

  return JSON.stringify(
    {
      baseUrl: parsed.baseUrl,
      params: parsed.params,
    },
    null,
    2
  );
}
