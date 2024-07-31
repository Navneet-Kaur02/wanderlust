if(process.env.NODE_ENV != "production"){
    require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");

const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user.js");

const listingRouter = require("./routes/listing.js"); //to restructure listing
const reviewRouter = require("./routes/review.js"); //to restructure review
const userRouter = require("./routes/user.js");

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate); //for ejs-mate
app.use(express.static(path.join(__dirname, "/public")));

const dbUrl = process.env.ATLASDB_URL;

main().then(() => {
    console.log("Connected to DB");
}).catch(err => {
    console.log(err);
});

async function main(){
    await mongoose.connect(dbUrl);
}

const store = MongoStore.create({
    mongoUrl: dbUrl,
    //when working with sensitve session data, it is recommended to use encryption
    //touchAfter means if there is no change in the session, then when (x sec) will we update our information
    //by default, session info is saved for 14 days
    crypto: {
        secret: process.env.SECRET 
    },
    touchAfter: 24 * 60 * 60
});

store.on("error", () => {
    console.log("ERROR in MONGO SESSION STORE", err);
});

const sessionOptions = {
    store: store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
        maxAge: 7 * 24 * 60 * 60 * 1000, //milliseconds
        httpOnly: true // for security purposes - to prevent cross scripting attacks
    }
};

// app.get("/", (req, res) => {
//     res.send("Hello, this is root.");
// });

app.use(session(sessionOptions));
app.use(flash()); // we need to require our session and flash before the routes, and passport because they use session

//pbkdf2 is the hashing algorithm used by passport
app.use(passport.initialize());
app.use(passport.session());
//all the users should be authenticated through local strategy and we use the method authenticate() which is a static method added by passport local mongoose
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user; // we need to use it in navbar.ejs but we can't access req obj there, so we are storing it here in locals
    next();
})

app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter); //the part that is common in all routes will be replaced, check in review.js(routes)
app.use("/", userRouter);

//*- match with all incoming requests
//response would have been sent if it match to any path above, if not, then it will reach here
app.all("*", (req, res, next) => {
    next(new ExpressError(404, "Page not found"));
});

//Error handling middleware
app.use((err, req, res, next) => {
    let {statusCode = 500, message = "Something went wrong!"} = err;
    res.status(statusCode).render("error.ejs", {message});
    //res.status(statusCode).send(message);
});

app.listen(8080, () => {
    console.log("Server is listening on port 8080");
});