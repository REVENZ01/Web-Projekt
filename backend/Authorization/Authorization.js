const ROLES = ["Account-Manager", "Developer", "User"];

function authorize(allowedRoles) {
  return (request, reply, done) => {
    const authHeader = request.headers["authorization"];

    if (!authHeader || !authHeader.startsWith("Basic ")) {
      reply
        .code(401)
        .send({ message: "Unauthorized: No valid Authorization header" });
      return;
    }

    const role = authHeader.replace("Basic ", "").trim();

    if (!ROLES.includes(role)) {
      reply.code(403).send({ message: "Forbidden: Unknown role" });
      return;
    }

    if (!allowedRoles.includes(role)) {
      reply.code(403).send({ message: "Forbidden: Insufficient permissions" });
      return;
    }

    request.userRole = role;
    done();
  };
}

module.exports = authorize