const express = require("express");
const router = express.Router(); 
const User = require("../models/user.js");
const wrapAsync = require("../utils/wrapAsync");
const passport = require("passport");
const {saveRedirectUrl} = require("../middleware.js");
const userController = require("../controllers/users.js");

router
    .route("/signup")
    .get(userController.renderSignupForm)
    .post(wrapAsync(userController.signup));

router
    .route("/login")
    .get(userController.renderLoginForm)
    .post(saveRedirectUrl, 
        passport.authenticate("local", {failureRedirect: "/login", failureFlash: true}), 
        userController.login);
//passport.authenticate() is a middleware that is used in authentication before login
//saveRedirectUrl will save the url to locals. we did this because passport will reset session as soon as passport.authenticate is called and then we can't access req.session.redirectUrl

router.get("/logout", userController.logout);

module.exports = router;