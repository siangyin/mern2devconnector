const express = require("express");
// const axios = require("axios");
// const config = require("config");
const router = express.Router();
const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator");
// bring in normalize to give us a proper url, regardless of what user entered
// const normalize = require("normalize-url");
// const checkObjectId = require("../../middleware/checkObjectId");

const Profile = require("../../models/Profile");
const User = require("../../models/User");
// const Post = require("../../models/Post");

// @route   GET api/profile/me
// @desc    Get current user profile
// @access  Private

router.get("/me", auth, async (req, res) => {
	try {
		const profile = await Profile.findOne({
			user: req.user.id,
		}).populate("user", ["name", "avatar"]);

		if (!profile) {
			return res.status(400).json({ msg: "There is no profile for this user" });
		}
		return res.json(profile);
	} catch (err) {
		console.error(err.message);
		res.status(500).send("Server error");
	}
});

// @route   POST api/profile/me
// @desc    Create or Update user profile
// @access  Private

router.post(
	"/",
	[
		auth,
		[
			check("status", "Status is required").not().isEmpty(),
			check("skills", "Skills is required").not().isEmpty(),
		],
	],
	async (req, res) => {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json({ errors: errors.array() });
		}

		// destructure the request
		const {
			website,
			skills,
			youtube,
			twitter,
			instagram,
			linkedin,
			facebook,
			status,
			// spread the rest of the fields we don't need to check
			...rest
		} = req.body;

		// build a profile
		const profileFields = {};
		profileFields.user = req.user.id;

		// if (company) profileFields.company = company;

		// if (website) profileFields.website = website;
		// if (location) profileFields.location = location;
		// if (bio) profileFields.bio = bio;
		if (status) profileFields.status = status;
		// if (githubusername) profileFields.githubusername = githubusername;

		if (skills) {
			profileFields.skills = skills.split(",").map((skill) => skill.trim());
		}

		// Build socialFields object
		profileFields.socialFields = {
			youtube,
			twitter,
			instagram,
			linkedin,
			facebook,
		};

		try {
			let profile = await Profile.findOne({ user: req.user.id });
			if (profile) {
				// update
				profile = await Profile.findOneAndUpdate(
					{ user: req.user.id },
					{ $set: profileFields },
					{ new: true }
				);
				return res.json(profile);
			}

			// Create profile

			profile = new Profile(profileFields);
			await profile.save();
			res.json(profile);
		} catch (err) {
			console.error(err.message);
			res.status(500).send(`server error`);
		}
	}
);

module.exports = router;
