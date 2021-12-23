const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const auth = require("../../middleware/auth");
const jwt = require("jsonwebtoken");
const config = require("config");
const { check, validationResult } = require("express-validator");
const User = require("../../models/User");

// @route   GET api/auth
// @desc    Test route
// @access  Public

router.get("/", auth, async (req, res) => {
	console.log(req.user.id);
	try {
		const user = await User.findOne({ _id: req.user.id }).select("-password");
		console.log(user);
		// console.log is working but json not showing, due to the body option in postman set to raw. change to none then it's working.
		return res.status(200).json({ user });
	} catch (err) {
		console.error(err.message);
		res.status(500).send(`server error`);
	}
});

// @route   POST api/auth
// @desc    Authenticate user & get token
// @access  Public

router.post(
	"/",
	[
		check("email", "Please include a valid email").isEmail(),
		check("password", "password is required").exists(),
	],
	async (req, res) => {
		console.log(req.body);
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		const { email, password } = req.body;
		console.log(email, password);
		try {
			// if user exists
			let user = await User.findOne({ email });
			if (!user) {
				return res
					.status(400)
					.json({ errors: [{ msg: "Invalid Credentials" }] });
			}

			// must sure user and pw match
			const isMatch = await bcrypt.compare(password, user.password);
			if (!isMatch) {
				return res
					.status(400)
					.json({ errors: [{ msg: "Invalid Credentials" }] });
			}

			// return jsonwebtoken
			const payload = {
				user: {
					id: user.id,
				},
			};

			jwt.sign(
				payload,
				config.get("jwtSecret"),
				{ expiresIn: "5 days" },
				(err, token) => {
					if (err) throw err;
					res.json({ token });
				}
			);
		} catch (err) {
			console.error(err.message);
			res.status(500).send("Server error");
		}
	}
);

module.exports = router;
