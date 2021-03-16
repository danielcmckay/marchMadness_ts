import * as fs from "fs";
const csvParser = require("csv-parser");
import teamData from "./output.json";
import teams2 from "./teams2.json";
import teams2019 from "./teams2019.json";
import bb2021 from "./2019_bb.json";
/// https://blogs.sas.com/content/sgf/2017/03/13/the-top-10-statistics-to-consider-when-filling-out-your-ncaa-brackets/

const results: String[] = [];
const finalFour = {};
const scoreToSeed = {};
const plotly = require('plotly')("danielcmckay", "2XLbIOp3HizFmuOKO1xc")



function buildJson(filename : string) {
  fs.createReadStream(`./${filename}.csv`)
    .pipe(csvParser({ separator: "," }))
    .on("data", (data) => {
      results.push(data);
    })
    .on("end", () => {
      return fs.createWriteStream(`./${filename}.json`).write(JSON.stringify(results));
    });
}

function calculateScore(team: object, seed: number): number {
  let score: number = 0;
  score += team != undefined ? Math.floor(team["W-L%"] * 10)  : 0;
  score += team != undefined ? Math.floor(team["SRS"]) : 0;
  score += team != undefined ? Math.floor(team["SOS"] * 1 ) : 0;
  score +=
    team != undefined ? Math.floor(team["Tm."] - team["Opp."]) / team['G']  : 0;
  score += team != undefined ? Math.floor(team["Home%"] * .10) /2 : 0;
  score += team != undefined ? Math.floor(team["Road%"] * .10)  : 0;
  score += team != undefined ? Math.floor((100 - team["TOV%"]) / 10) : 0;
  // assist to turnover ratio
  // road winning percentage
  // ratio of turnovers to turnovers created
  // 3 point shot
  // ft average
  // blocked shots per game
  console.log(`Seed is ${seed}`)
  scoreToSeed[seed] = score;
  return Math.floor(score);
}


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
        bb2021.filter((team) => team.School == team1)[0]
      , teams2019[bracketName][team1]);
      const score2 = calculateScore(
        bb2021.filter((team) => team.School == team2)[0]
        , teams2019[bracketName][team2]);
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

function main() {
  
}

Object.values(teams2019).forEach((bracket) => {
  rateTeams(
    bracket,
    Object.keys(teams2019)[Object.values(teams2019).indexOf(bracket)]
  );
});
// rateTeams(finalFour, "Final Four");
// buildJson("2019_bb");
// console.log(scoreToSeed);
// const layout = {fileOpt: "overwrite", "filename": "chart"}
// plotly.plot([{x: Object.keys(scoreToSeed), y: Object.values(scoreToSeed), type: 'bar'}], layout, (err, msg) => {
//   if (err) console.log(err)
//   console.log(msg)
// })