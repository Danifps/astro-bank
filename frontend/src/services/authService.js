const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

export const authService = {
  /**
   * Iniciar sesión en Astro Bank
   * @param {string} usuarioOCedula Nombre de usuario o cédula
   * @param {string} claveAcceso Contraseña
   */
  async login(usuarioOCedula, claveAcceso) {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
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
  async register(payload) {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
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
