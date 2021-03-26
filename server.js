const express = require("express");
const mongoose = require("mongoose");

const passport = require('passport');

// DB congig
const { mongoURI } = require("./config/keys");

//
const users = require("./routes/api/users");
const profile = require("./routes/api/profile");
const post = require("./routes/api/posts");

// Import Body Parser
const bodyParser = require("body-parser");

const app = express();
// Body parser middleware
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// passport Middleware


//DB connected.
mongoose.connect(mongoURI, {useNewUrlParser: true, useUnifiedTopology: true}).then(() => console.log("Connect to Mongo Db")).catch(err => console.log(err));

app.use(passport.initialize());

//passport Config
require('./config/passport')(passport);
//use Route
app.use('/api/users', users);
// app.use('/api/profile', profile);
// app.use('/api/posts', posts);

const port = process.env.PORT || 5000;

app.listen(port, () => console.log(`listening on ${port}`));