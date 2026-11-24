const jwt = require("jsonwebtoken");

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

if (!JWT_SECRET_KEY) {
	throw new Error("Missing JWT_SECRET_KEY environment variable");
}

module.exports.createAccessToken = (user) => {
	const data = {
		id: user._id,
		email: user.email,
		isAdmin: Boolean(user.isAdmin)
	};

	return jwt.sign(data, JWT_SECRET_KEY, {});
};

module.exports.verify = (req, res, next) => {
	const authHeader = req.headers.authorization;

	if (!authHeader) {
		return res.status(401).send({
			auth: "Failed",
			message: "No Token Provided"
		});
	}

	const parts = authHeader.split(" ");
	const token = parts.length === 2 && parts[0] === "Bearer" ? parts[1] : authHeader;

	jwt.verify(token, JWT_SECRET_KEY, (err, decodedToken) => {
		if (err) {
			return res.status(403).send({
				auth: "Failed",
				message: err.message
			});
		}

		req.user = decodedToken;
		next();
	});
};

module.exports.verifyAdmin = (req, res, next) => {
	if (!req.user) {
		return res.status(401).send({
			auth: "Failed",
			message: "Authentication required"
		});
	} else if (req.user.isAdmin === true) {
		next();
	} else {
		return res.status(403).send({
			auth: "Failed",
			message: "Action Forbidden. Admin access required."
		});
	}
};

module.exports.errorHandler = (err, req, res, next) => {
	const statusCode = err.status || 500;
	const errorMessage = err.message || "Internal Server Error";

	res.status(statusCode).json({
		error: {
			message: errorMessage,
			errorCode: err.code || "SERVER_ERROR",
			details: err.details || null
		}
	});
};