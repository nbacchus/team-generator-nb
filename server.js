const inquirer = require("inquirer");
const cTable = require("console.table");
const db = require("./db/connection");

//user prompt questions
const selectOption = [
  {
    type: "list",
    name: "userSelected",
    message: "Welcome to the Employee Manager! What would you like to do?",
    choices: [
      "View all employees",
      "Add employee",
      "Update employee role",
      "View all roles",
      "Add role",
      "View all departments",
      "Add department",
    ],
    default: "View all departments",
  },
];

