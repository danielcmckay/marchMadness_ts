"use strict";
exports.__esModule = true;
var fs = require("fs");
var csvParser = require("csv-parser");
var output_json_1 = require("./output.json");
var teams2_json_1 = require("./teams2.json");
// https://blogs.sas.com/content/sgf/2017/03/13/the-top-10-statistics-to-consider-when-filling-out-your-ncaa-brackets/
var results = [];
function buildJson() {
    fs.createReadStream("./bb.csv")
        .pipe(csvParser({ separator: "," }))
        .on("data", function (data) {
        results.push(data);
    })
        .on("end", function () {
        fs.createWriteStream("./output.json").write(JSON.stringify(results));
    });
}
function calculateScore(team) {
    var score = 0;
    score += team != undefined ? Math.floor(team["W-L%"] * 10 * 1.5) : 0;
    score += team != undefined ? Math.floor(team["SRS"]) : 0;
    score += team != undefined ? Math.floor(team["SOS"] * 1) : 0;
    score +=
        team != undefined ? Math.floor((team["Tm."] - team["Opp."]) / team['G']) * 1.25 : 0;
    // assist to turnover ratio
    // road winning percentage
    // ratio of turnovers to turnovers created
    // 3 point shot
    // ft average
    // blocked shots per game
    return score;
}
var finalFour = {};
function rateTeams(bracket, bracketName) {
    var newBracket = {};
    console.log("\nRound of " + Object.keys(bracket).length + " in the " + bracketName + "\n");
    var _loop_1 = function (i) {
        var team1 = Object.keys(bracket)[i];
        var team2 = Object.keys(bracket)[i + 1];
        if (Object.keys(bracket).length > 1) {
            var score1 = calculateScore(output_json_1["default"].filter(function (team) { return team.School == team1; })[0]);
            var score2 = calculateScore(output_json_1["default"].filter(function (team) { return team.School == team2; })[0]);
            console.log("Comparing " + team1 + " " + score1 + " and " + team2 + " " + score2);
            if (score1 > score2) {
                console.warn("Winner is " + team1 + " " + score1);
                newBracket[Object.keys(bracket)[i]] = Object.values(bracket)[i];
            }
            else {
                console.warn("Winner is " + team2 + " " + score2);
                newBracket[Object.keys(bracket)[i + 1]] = Object.values(bracket)[i + 1];
            }
        }
        else {
            console.log("\nFINISHED\n");
            finalFour[Object.keys(bracket)[i]] = Object.values(bracket)[i];
        }
    };
    for (var i = 0; i < Object.keys(bracket).length; i += 2) {
        _loop_1(i);
    }
    if (Object.keys(newBracket).length > 1) {
        rateTeams(newBracket, bracketName);
    }
    else {
        finalFour[Object.keys(bracket)[0]] = Object.values(bracket)[0];
    }
}
Object.values(teams2_json_1["default"]).forEach(function (bracket) {
    rateTeams(bracket, Object.keys(teams2_json_1["default"])[Object.values(teams2_json_1["default"]).indexOf(bracket)]);
});
rateTeams(finalFour, "Final Four");
