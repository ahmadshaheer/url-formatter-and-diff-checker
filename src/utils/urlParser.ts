import { ParsedUrl, DiffResult } from "../types";

export function urlToReadableJson(url: string): ParsedUrl {
  try {
    const parsedUrl = new URL(url);
    const result: ParsedUrl = {
      base_url: `${parsedUrl.protocol}//${parsedUrl.host}${parsedUrl.pathname}`,
      params: {},
    };

    const queryParams = new URLSearchParams(parsedUrl.search);
    for (const [key, value] of queryParams.entries()) {
      if (key === "compositeQuery") {
        let decodedValue = value.replace(/%25/g, "%");
        try {
          const jsonValue = JSON.parse(decodeURIComponent(decodedValue));
          result.params[key] = jsonValue;
        } catch {
          decodedValue = decodeURIComponent(decodedValue);
          const jsonValue = JSON.parse(decodedValue);
          result.params[key] = jsonValue;
        }
      } else {
        try {
          result.params[key] = JSON.parse(value);
        } catch {
          result.params[key] = value;
        }
      }
    }
    return result;
  } catch (error) {
    return {
      base_url: "",
      params: {},
      error: `Failed to parse URL: ${(error as Error).message}`,
    };
  }
}

export function computeUrlDiff(oldUrl: string, newUrl: string): DiffResult {
  const oldParsed = urlToReadableJson(oldUrl);
  const newParsed = urlToReadableJson(newUrl);

  const result: DiffResult = {
    base_url: {
      old: oldParsed.base_url,
      new: newParsed.base_url,
      changed: oldParsed.base_url !== newParsed.base_url,
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

export function formatJsonString(obj: any): string {
  return JSON.stringify(obj, null, 2);
}
