
//get keys and global vars

var star;
var data;
var keys = require("./keys.js");
var inquirer = require("inquirer");
var fs = require("fs");
var request = require("request");
var twitter = require("twitter");
var spotify = require("node-spotify-api");

//user input

inquirer.prompt([
    {
        type: "list",
        message: "Please choose one?",
        choices: ["my-tweets", "spotify-this-song", "movie-this", "do-what-it-says"],
        name: "star"
    }
    //response function
]).then(function(response) {
    star = response.star;
    if ((star === "spotify-this-song") || (star === "movie-this")) {
        inquirer.prompt([
            {
                type: "data",
                message: "Enter the title",
                name: "data"
            }
        ]).then(function(responseTitle) {
            data = responseTitle.data;
            runProgram();
        });
    }
    else {
        runProgram();
    }
});


function runProgram() {
    var printCommand = "\n\nYour star data: " + star;
    if (data) {
        printCommand += " " + data;
    }
    write(printCommand);
    switch(star) {
        case "my-tweets":
            displayTweets();
            break;
        case "spotify-this-song":
            displaySong();
            break;
        case "movie-this":
            displayMovie();
            break;
        case "do-what-it-says":
            doWhatItSays();
            break;
        default:
            write("invalid star");
    }
}


function displayTweets() {

    var client = new twitter({
          consumer_key: keys.twitterKeys.consumer_key,
          consumer_secret: keys.twitterKeys.consumer_secret,
          access_token_key: keys.twitterKeys.access_token_key,
          access_token_secret: keys.twitterKeys.access_token_secret
    });
 		
 		//I don't have twitter so using this 
    var params = {
        
        screen_name: "rezaaslan",
        count: 5
    };

    client.get("statuses/user_timeline", params, function(error, tweets, response) {
        if (!error && response.statusCode === 200) {
            for (var i = 0; i < tweets.length; i++) {
                write(tweets[i].created_at + "\n" + tweets[i].text);
            }
        }
        else {
            write("Failed at my-tweets " + error);
        }
    });
}


function displaySong() {

    var client = new spotify({
        id: keys.spotifyKeys.client_id,
        secret: keys.spotifyKeys.client_secret
    });

    if (!data) {
        data = "The Sign";
    }

    var params = {
        type: "track",
        query: data
    }
 
    client.search(params, function(error, data) {
        if (!error) {
            write("Artist: " + data.tracks.items[0].album.artists[0].name); 
            write("Song: " + data.tracks.items[0].name); 
            write("Preview: " + data.tracks.items[0].preview_url); 
            write("Album: " + data.tracks.items[0].album.name);
        }
        else {
            write("Failed at spotify-this-song " + error);
        }
    });
}


function displayMovie() {

    if (!data) {
        data = "Mr. Nobody";
        //not a good movie btw
    }

    var queryUrl = "http://www.omdbapi.com/?t=" + data + "&y=&plot=short&apikey=" + keys.omdbKeys.api_key;

    request(queryUrl, function(error, response, body) {

        if (!error && response.statusCode === 200) {
            var bodyObj = JSON.parse(body);  
            write("Title: " + bodyObj.Title);
            write("Year: " + bodyObj.Year);
            write("IMDB Rating: " + bodyObj.imdbRating);
            write("Rotten Tomatoes Rating: " + bodyObj.Ratings[1].Value);
            write("Country: " + bodyObj.Country);
            write("Language: " + bodyObj.Language);
            write("Plot: " + bodyObj.Plot);
            write("Actors: " + bodyObj.Actors);
        }
        else {
            write("Failed at movie-this " + error);
        }
    })
}

function write(content) {

    console.log(content + "\n");
    fs.appendFile("log.txt", content + "\n\n", function(error) {
        if (error) {
            console.log("Failed save to log file");
        }
    });
}

function doWhatItSays() {

    fs.readFile("random.txt", "utf8", function(error, data) {
        if (!error) {
            dataArr = data.split(",");
            star = dataArr[0];
            if (dataArr.length > 1) {
                data = dataArr[1].replace(/"/g, "");
            }
            if (star === "do-what-it-says") {
                return write("Infinite loop, exiting before it's too late");
            }

            runProgram();
        }
        else {
            write("Failed at do-what-it-says " + error);
        }
    });
}