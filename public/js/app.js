
// Scrape the Dodo website
$("#new-scrape").on("click", function() {
  $.ajax({
    method: "GET",
    url: "/scrape",
  }).done(function(data) {
    console.log(data)
    window.location = "/"
  })
});  


// Get the articles as json
  $.getJSON("/articles", function(data) {
      // For each one
      $('#articles').empty();
      for (var i = 0; i < data.length; i++) {
        // Display the information
        $("#articles").append("<p  class='article-output' data-id='" + data[i]._id + "'>" + 
          "Title: " + data[i].title + "<br />" + 
          "Link: " + "<a href= '" + data[i].link + "'>" + data[i].link + "</a>" + "<br />" +
          "Blurb: " + data[i].summary + "<br />" +
          "</p>");
      }
  });
  
// Set up onclick event for opening notes window
$(document).on("click", ".article-output", function(e) {
    // Empty the notes section
    $("#notes").empty();
    // Save the id from the p tag
    var thisId = $(this).attr("data-id");
  
    // Make an ajax call for the article
    $.ajax({
      method: "GET",
      url: "/articles/" + thisId
    })
      // Add the note information to the page
      .then(function(data) {
        console.log(data);
        // The title of the article
        $("#notes").append("<h2>" + data.title + "</h2>");
        // An input to enter a new title
        $("#notes").append("<input id='titleinput' name='title' >");
        // A textarea to add a new note body
        $("#notes").append("<textarea id='bodyinput' name='body'></textarea>");
        // A button to submit a new note, with the id of the article saved to it
        $("#notes").append("<button data-id='" + data._id + "' id='savenote'>Save Note</button>");
  
        // If there's a note in the article
        if (data.note) {
          console.log(data.note)
          // Place the title of the note in the title input
          $("#titleinput").val(data.note.title);
          // Place the body of the note in the body textarea
          $("#bodyinput").val(data.note.body);
        }
      });
  });
  
  // When you click the savenote button
  $(document).on("click", "#savenote", function() {
    // Grab the id associated with the article
    let thisId = $(this).attr("data-id");
    console.log(thisId);
  
    // Run a POST request to change the note, using what's entered in the inputs
    $.ajax({
      method: "POST",
      url: "/articles/" + thisId,
      data: {
        // Value taken from title input
        title: $("#titleinput").val(),
        // Value taken from note textarea
        body: $("#bodyinput").val()
      }
    })
      .then(function(data) {
        // Log the response
        console.log(data);
        // Empty the notes section
        $("#notes").empty();
      });
  
    // Remove the values entered in the input and textarea for note entry
    $("#titleinput").val("");
    $("#bodyinput").val("");
  });