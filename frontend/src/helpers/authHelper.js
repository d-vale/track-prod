/**
 * Récupère le token JWT du localStorage
 * @returns {string|null} Le token ou null s'il n'existe pas
 */
export function getAuthToken() {
  return localStorage.getItem('token');
}

/**
 * Crée les headers avec authentification Bearer token
 * @returns {Object} Headers avec le token Bearer inclus
 */
export function getAuthHeaders() {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

/**
 * Stocke le token dans localStorage
 * @param {string} token - Le token JWT à stocker
 */
export function setAuthToken(token) {
  localStorage.setItem('token', token);
}

/**
 * Supprime le token du localStorage
 */
export function clearAuthToken() {
  localStorage.removeItem('token');
}
