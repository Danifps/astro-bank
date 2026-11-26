const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';
const SESSION_STORAGE_KEY = 'astro_user';
export const MAX_SESSION_MS = 5 * 60 * 1000;

export const authService = {
  saveSession(usuario, authMeta = {}) {
    const expiresAt = typeof authMeta.expiresAt === 'number'
      ? authMeta.expiresAt
      : Date.now() + MAX_SESSION_MS;

    const sessionData = { ...usuario, expiresAt };

    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(sessionData));
    return sessionData;
  },

  getActiveSession() {
    try {
      const raw = sessionStorage.getItem(SESSION_STORAGE_KEY);
      if (!raw) return null;

      const session = JSON.parse(raw);
      if (!session || typeof session.expiresAt !== 'number' || Date.now() >= session.expiresAt) {
        sessionStorage.removeItem(SESSION_STORAGE_KEY);
        return null;
      }

      return session;
    } catch {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
      return null;
    }
  },

  clearSession() {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    localStorage.removeItem(SESSION_STORAGE_KEY);
  },

  async logout() {
    this.clearSession();
    try {
      const response = await fetch(`${API_URL}/auth/logout`, {
        method: 'POST',
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error(`Logout rechazado (${response.status}).`);
      }
    } catch (error) {
      console.error('Error al cerrar la sesión en el servidor:', error);
      return false;
    }
  },

  async verifySession() {
    try {
      const response = await fetch(`${API_URL}/auth/session`, {
        method: 'GET',
        credentials: 'include'
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        return {
          ok: false,
          expired: Boolean(data.expired),
          mensaje: data.mensaje || 'Sesión expirada.'
        };
      }

      return data;
    } catch (error) {
      console.error('No se pudo verificar la sesión con el servidor:', error);
      return { ok: false, offline: true, expired: false };
    }
  },

  /**
   * Iniciar sesión en Astro Bank
   * @param {string} usuarioOCedula Nombre de usuario o cédula
   * @param {string} claveAcceso Contraseña
   */
  async login(usuarioOCedula, claveAcceso) {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ usuarioOCedula, claveAcceso })
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error en authService.login:', error);
      return {
        ok: false,
        mensaje: 'No se pudo conectar con el servidor de Astro Bank (http://localhost:4000). Asegúrate de que el backend esté iniciado.'
      };
    }
  },

  /**
   * Registro completo de cliente natural
   * @param {object} payload Objeto con { usuario, perfil }
   */
  async register(payload, documentFile) {
    try {
      const formData = new FormData();
      formData.append('payload', JSON.stringify(payload));
      formData.append('archivoDocumento', documentFile);

      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        credentials: 'include',
        body: formData
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error en authService.register:', error);
      return {
        ok: false,
        mensaje: 'No se pudo conectar con el servidor de Astro Bank para registrar el cliente.'
      };
    }
  }
};
