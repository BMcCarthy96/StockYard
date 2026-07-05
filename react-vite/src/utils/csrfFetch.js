import Cookies from "js-cookie";

/**
 * fetch wrapper that attaches the CSRF token (read from the non-httponly
 * csrf_token cookie the backend sets) as X-CSRFToken on any non-GET request,
 * and JSON-encodes bodies automatically. Throws the parsed {errors} payload
 * on non-2xx responses so callers can just try/catch.
 */
export async function csrfFetch(url, options = {}) {
  options.method = options.method || "GET";
  options.headers = options.headers || {};

  if (options.method.toUpperCase() !== "GET") {
    if (!(options.body instanceof FormData)) {
      options.headers["Content-Type"] =
        options.headers["Content-Type"] || "application/json";
      if (options.body && typeof options.body !== "string") {
        options.body = JSON.stringify(options.body);
      }
    }
    options.headers["X-CSRFToken"] = Cookies.get("csrf_token");
  }

  const response = await fetch(url, options);

  if (response.status >= 400) {
    let payload;
    try {
      payload = await response.json();
    } catch {
      payload = { errors: { server: "Something went wrong. Please try again." } };
    }
    const error = new Error("Request failed");
    error.status = response.status;
    error.errors = payload.errors || payload;
    throw error;
  }

  return response;
}

export async function csrfFetchJson(url, options) {
  const response = await csrfFetch(url, options);
  if (response.status === 204) return null;
  return response.json();
}
