//to restructure our listings, we created a routes folder
// /listings in routes is changed to /
const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const Listing = require("../models/listing.js");
const {isLoggedIn, isOwner, validateListing} = require("../middleware.js");
const listingController = require("../controllers/listings.js");
//multer for parsing multipart/form-data which is used in new.ejs
const multer = require("multer");
const {storage} = require("../cloudConfig.js");
const upload = multer({storage}); //takes the files from form and save them in uploads folder which it will create automatically

//index and create route
router
    .route("/")
    .get(wrapAsync(listingController.index))
    .post(isLoggedIn, upload.single("listing[image]"), validateListing, wrapAsync(listingController.createListing));

router
    .route("/trending")
    .get(listingController.filterPage);

router
    .route("/rooms")
    .get(listingController.filterPage);

router
    .route("/iconic-cities")
    .get(listingController.filterPage);

router
    .route("/mountains")
    .get(listingController.filterPage);

router
    .route("/castles")
    .get(listingController.filterPage);

router
    .route("/amazing-pools")
    .get(listingController.filterPage);

router
    .route("/camping")
    .get(listingController.filterPage);

router
    .route("/farms")
    .get(listingController.filterPage);

router
    .route("/arctic")
    .get(listingController.filterPage);

router
    .route("/omg!")
    .get(listingController.filterPage);

router
    .route("/search")
    .get(listingController.searchPage);



//New Route
router.get("/new", isLoggedIn, listingController.renderNewForm);

//show, update, and delete route
router
    .route("/:id")
    .get(wrapAsync(listingController.showListing))
    .put(isLoggedIn, isOwner, upload.single("listing[image]"), validateListing, wrapAsync(listingController.updateListing))
    .delete(isLoggedIn, isOwner, wrapAsync(listingController.destroyListing));
  
  
//Edit Route
router.get("/:id/edit", isLoggedIn, isOwner, wrapAsync(listingController.renderEditForm));

module.exports = router;