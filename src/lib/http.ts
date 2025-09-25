// src/lib/http.ts - Wrapper fetch pour l'API avec gestion des cookies et redirections

export interface ApiError {
  error: string;
}

export interface RedirectResponse {
  redirect: string;
}

/**
 * GET JSON avec gestion des cookies de session
 */
export async function getJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * POST FormData avec gestion des redirections 302/303/307
 */
export async function postForm<T>(
  url: string, 
  form: FormData
): Promise<T | RedirectResponse> {
  const response = await fetch(url, {
    method: "POST",
    body: form,
    credentials: "include",
    redirect: "manual", // On gère manuellement les redirections
  });

  // Si redirection (302/303/307), on retourne l'URL de destination
  if (response.status === 302 || response.status === 303 || response.status === 307) {
    const location = response.headers.get("location");
    if (location) {
      return { redirect: location };
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP ${response.status}`);
  }

  // Si content-type JSON, on parse
  const contentType = response.headers.get("content-type");
  if (contentType?.includes("application/json")) {
    return response.json();
  }

  // Sinon on retourne la réponse brute
  return response as unknown as T;
}

/**
 * POST JSON avec gestion des erreurs
 */
export async function postJSON<T>(
  url: string, 
  data: any
): Promise<T | RedirectResponse> {
  const response = await fetch(url, {
    method: "POST",
    body: JSON.stringify(data),
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    redirect: "manual",
  });

  // Si redirection (302/303/307), on retourne l'URL de destination
  if (response.status === 302 || response.status === 303 || response.status === 307) {
    const location = response.headers.get("location");
    if (location) {
      return { redirect: location };
    }
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP ${response.status}`);
  }

  return response.json();
}
