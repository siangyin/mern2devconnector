const express = require("express");
const router = express.Router();
// const bcrypt = require("bcryptjs");
const auth = require("../../middleware/auth");
// const jwt = require("jsonwebtoken");
// const config = require("config");
// const { check, validationResult } = require("express-validator");
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
		return res.status(200).json({ user});
	} catch (err) {
		console.error(err.message);
		res.status(500).send(`server error`);
	}
});

module.exports = router;
