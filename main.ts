import * as fs from "fs";
const csvParser = require("csv-parser");
import teamData from "./output.json";
import teams2 from "./teams2.json";
// https://blogs.sas.com/content/sgf/2017/03/13/the-top-10-statistics-to-consider-when-filling-out-your-ncaa-brackets/

const results: String[] = [];

function buildJson() {
  fs.createReadStream("./bb.csv")
    .pipe(csvParser({ separator: "," }))
    .on("data", (data) => {
      results.push(data);
    })
    .on("end", () => {
      fs.createWriteStream("./output.json").write(JSON.stringify(results));
    });
}

function calculateScore(team: object): number {
  let score: number = 0;

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

const finalFour = {};

function rateTeams(bracket: object, bracketName: string) {
  let newBracket = {};

  console.log(
    `\nRound of ${Object.keys(bracket).length} in the ${bracketName}\n`
  );

  for (let i = 0; i < Object.keys(bracket).length; i += 2) {
    const team1 = Object.keys(bracket)[i];
    const team2 = Object.keys(bracket)[i + 1];

    if (Object.keys(bracket).length > 1) {
      const score1 = calculateScore(
        teamData.filter((team) => team.School == team1)[0]
      );
      const score2 = calculateScore(
        teamData.filter((team) => team.School == team2)[0]
      );
      console.log(`Comparing ${team1} ${score1} and ${team2} ${score2}`);
      if (score1 > score2) {
        console.warn("Winner is " + team1 + " " + score1);
        newBracket[Object.keys(bracket)[i]] = Object.values(bracket)[i];
      } else {
        console.warn("Winner is " + team2 + " " + score2);
        newBracket[Object.keys(bracket)[i + 1]] = Object.values(bracket)[i + 1];
      }
    } else {
      console.log("\nFINISHED\n");
      finalFour[Object.keys(bracket)[i]] = Object.values(bracket)[i];
    }
  }

  if (Object.keys(newBracket).length > 1) {
    rateTeams(newBracket, bracketName);
  } else {
    finalFour[Object.keys(bracket)[0]] = Object.values(bracket)[0];
  }
}

Object.values(teams2).forEach((bracket) => {
  rateTeams(
    bracket,
    Object.keys(teams2)[Object.values(teams2).indexOf(bracket)]
  );
});
rateTeams(finalFour, "Final Four");
