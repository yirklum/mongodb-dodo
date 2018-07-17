// Require dependencies
var cheerio = require("cheerio");
var request = require("request");
var express = require("express");
var exphbs = require("express-handlebars");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var axios = require("axios");

// Require models
var db = require("./models");

// Port configuration for local/Heroku
var PORT = process.env.PORT || 8080;

// Connect to Mongo DB
var MONGODB_URI = process.env.MONGODB_URI;

mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);

// Connect to Mongo DB
// mongoose.connect("mongodb://localhost:27017/dodoArticlePopulatordb", { useNewUrlParser: true});

// Choose port
// var PORT = 3000;

// Initialize Express
var app = express();

// Set up handlebars
app.engine('handlebars', exphbs({defaultLayout: 'main'}));
app.set('view engine', 'handlebars');

// Show static content
app.use(express.static("public"));

// Configure middleware
app.use(logger("dev"));
app.use(bodyParser.urlencoded({ extended: true }));



// Routes

// Scrape the Dodo website
app.get("/scrape", function(req, res) {
  axios.get("https://www.thedodo.com").then(function(response) {
    var $ = cheerio.load(response.data);

    // Grab specified elements
    $("a.double-column-listing__link").each(function(i, element) {
      // Save an empty result object
      var result = {};
      
      // Add the title, link and summary of each entry and save them as properties of the result object
      result.title = $(this).find("h2.double-column-listing__title-text").text().trim();
      result.link = $(this).attr("href");
      result.summary = $(this).find("p.double-column-listing__description").text().trim();

      // Create a new article using the result object
      db.Article.create(result)
        .then(function(dbArticle) {
          // View the added result in the console
          console.log(dbArticle);
        })
        .catch(function(err) {
          // If an error occurred, send it to the client
          return res.json(err);
        });
    });

    // If article is successfully scraped and saved, send a message to the client
    res.send("Scrape Complete");
  });
});

// Route to Homepage
app.get("/", function(req, res) {
  res.render("index");
});

// Route for getting all articles
app.get("/articles", function(req, res) {
  db.Article.find({})
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// Route for grabbing an article by id, populating it with its note
app.get("/articles/:id", function(req, res) {
  db.Article.findOne({_id: req.params.id})
    .populate("note")
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// Route for saving/updating an article's associated Note
app.post("/articles/:id", function(req, res) {
  db.Note.create({title: req.body.title, body: req.body.body})
    .then(function(dbNote) {
    return db.Article.findOneAndUpdate({ _id: req.params.id} , {note: dbNote._id , new: true });
    })  
    .then(function(dbArticle) {
      res.json(dbArticle);
    })
    .catch(function(err) {
      res.json(err);
    });
});

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});