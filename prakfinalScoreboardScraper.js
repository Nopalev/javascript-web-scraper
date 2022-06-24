import { load } from "cheerio";
import fetch from 'node-fetch';
import { writeFileSync } from "fs";

// function to get the raw data
const getRawData = (URL) => {
   return fetch(URL)
      .then((response) => response.text())
      .then((data) => {
         return data;
      });
};

// URL for data
const URL = "https://asdos.zydhan.com/scoreboard/final";

// create csv file
let csvContent = "";

// start of the program
const getPrakfinalList = async () => {
   let scoreboard = [];
   const prakfinalRawData = await getRawData(URL);

   // parsing the data
   const parsedPrakfinalData = load(prakfinalRawData);

   // extracting the table data
   const prakfinalDataTable = parsedPrakfinalData("table.Table_table__kzKHA")[0]
      .children[1].children; // the HTML Tag and its class of the part that i scrap

   prakfinalDataTable.forEach((row) => {
      // extracting `td` tags
      if (row.name === "tr") { // note: the extracted data is saved into a javascript array of object
          let team = null, problems = [], subProblem;

        const columns = row.children.filter((column) => column.name === "td");

        // extracting team
        const teamColumn = columns[1]; // the column that contains team's name
        if(teamColumn){
            team = teamColumn.children[0];
            if(team){
                team = teamColumn.children[0].children[1];
                if(team){
                   team = teamColumn.children[0].children[1].children[0];
                   if(team){
                     team = teamColumn.children[0].children[1].children[0].children[0];
                     if(team){
                        team = teamColumn.children[0].children[1].children[0].children[0].data;
                        // to see the structure of the web that i scrap, go to the web and inspect element.
                        // track from HTML tag td with class Table_scoreTd__0TOkn Table_teamNameTd__6KJk8
                        // (that contains the team informations) until you reach team's name
                     }
                   }
                }
            }
        }
        problems[0] = team;

        // extracting problems
        for(let i = 3; i<=26; i++){ // note that there are 24 problems from columns 3 to 26
         const problemColumn = columns[i];
         if(problemColumn){
            subProblem = problemColumn.children[0];
            if(subProblem){
               subProblem = problemColumn.children[0].children[0];
               if(subProblem){
                  subProblem = problemColumn.children[0].children[0].data;
                  if(subProblem === "-") subProblem = "30"; // if the team submitted to a problem but got no accepted
                  else subProblem = "100"; // if the team got accepted
               }
            }
            else subProblem = "0"; // if the team did not submit
         }
         problems[i-2] = subProblem;
        }
        
        scoreboard.push(problems);
      }
   });
   //console.log(scoreboard); // used to check scraping result
   scoreboard.forEach(function(rowArray) { // formatting scrap result into csv formatted string
      let row = rowArray.join(",");
      csvContent += row + "\r\n";
  });
  writeFileSync("scoreboard.csv", csvContent); // save the result to a csv file
};

// invoking the main function
getPrakfinalList();
