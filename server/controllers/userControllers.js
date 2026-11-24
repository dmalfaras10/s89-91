const User = require('../models/User');
const bcrypt = require('bcrypt');
const auth = require("../auth");
const { errorHandler } = require("../auth");

module.exports.registerUser = (req, res) => {
    if (!req.body.email || !req.body.email.includes("@")) {
        return res.status(400).send({
            success: false,
            message: "Please provide a valid email address."
        });
    } else if (!req.body.password || req.body.password.length < 8) {
        return res.status(400).send({
            success: false,
            message: "Password must be at least 8 characters long."
        });
    } else {
        let newUser = new User({
            email: req.body.email,
            password: bcrypt.hashSync(req.body.password, 10)
        });

        return newUser.save()
        .then((result) => res.status(201).send({
            success: true,
            message: "User registered successfully",
            user: result
        }))
        .catch(error => errorHandler(error, req, res));
    }
};

module.exports.loginUser = (req, res) => {
    if (!req.body.email || !req.body.password) {
        return res.status(400).send({
            success: false,
            message: "Email and password are required."
        });
    } else if (!req.body.email.includes("@") || !req.body.email.includes(".com")) {
        return res.status(400).send({
            success: false,
            message: "Please provide a valid email address."
        });
    } else {
        return User.findOne({ email: req.body.email })
        .then(result => {
            if (result == null) {
                return res.status(404).send({
                    success: false,
                    message: "No account found with this email."
                });
            } else {
                const isPasswordCorrect = bcrypt.compareSync(req.body.password, result.password);

                if (isPasswordCorrect) {
                    return res.status(200).send({
                        success: true,
                        message: "Login successful",
                        access: auth.createAccessToken(result)
                    });
                } else {
                    return res.status(401).send({
                        success: false,
                        message: "Incorrect password."
                    });
                }
            }
        })
        .catch(error => errorHandler(error, req, res));
    }
};

module.exports.getProfile = (req, res) => {
    if (!req.user || !req.user.id) {
        return res.status(401).send({
            success: false,
            message: "Authentication required. Please log in."
        });
    } else {
        return User.findById(req.user.id)
        .select("-password")
        .then(user => {
            if (user == null) {
                return res.status(404).send({
                    success: false,
                    message: "User profile not found."
                });
            } else {
                return res.status(200).send({
                    success: true,
                    user
                });
            }
        })
        .catch(error => errorHandler(error, req, res));
    }
};