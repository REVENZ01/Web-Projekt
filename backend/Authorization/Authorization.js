// Definierte Rollen
const ROLES = ["Account-Manager", "Developer", "User"];

/**
 * Middleware zur Autorisierung.
 * @param {Array} allowedRoles - Zugelassene Rollen.
 * @returns {Function} Middleware.
 */
function authorize(allowedRoles) {
  return (request, reply, done) => {
    const authHeader = request.headers["authorization"];

    // Prüfe auf gültigen "Basic"-Header
    if (!authHeader || !authHeader.startsWith("Basic ")) {
      reply
        .code(401)
        .send({ message: "Unauthorized: Kein gültiger Authorization-Header" });
      return;
    }

    // Rolle extrahieren
    const role = authHeader.replace("Basic ", "").trim();

    // Unbekannte Rolle
    if (!ROLES.includes(role)) {
      reply.code(403).send({ message: "Forbidden: Unbekannte Rolle" });
      return;
    }

    // Fehlende Berechtigungen
    if (!allowedRoles.includes(role)) {
      reply.code(403).send({ message: "Forbidden: Unzureichende Berechtigungen" });
      return;
    }

    request.userRole = role;
    done();
  };
}

module.exports = authorize;
   

