/**
 * Safely parse a fetch Response as JSON.
 * Avoids "Unexpected token '<'" when the server returns an HTML error/login page.
 */
export async function parseJsonResponse(res) {
  const text = await res.text();
  const trimmed = (text || '').trim();
  if (!trimmed) {
    return {
      data: null,
      error: res.ok ? 'Empty response from server.' : `Request failed (${res.status}).`,
    };
  }
  try {
    return { data: JSON.parse(trimmed), error: null };
  } catch {
    const looksHtml = trimmed.startsWith('<!') || trimmed.startsWith('<html');
    return {
      data: null,
      error: looksHtml
        ? `Server returned a web page instead of JSON (HTTP ${res.status}). Check that the API route is running and you are signed in.`
        : `Invalid JSON from server (HTTP ${res.status}).`,
    };
  }
}
