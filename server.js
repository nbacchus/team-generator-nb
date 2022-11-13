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

// Function to view all departments
function viewAllDepartments() {
    const sql = `
    SELECT
    id,
    name AS 'Department'
    FROM department
    `;

    db.query(sql, (err, department) => {
        if (err) {
            console.log(`There has been an error: ${err.sqlMessage}`)
            return;
        }

        console.table(department);

        // start inquirer over
        init(selectOption)
            .then(userSelectedObject => userSelected
                (userSelectedObject.userSelected))
            .catch((error) => {
                console.log('Error', error);
            });
    });
};

// Switch statement to handle user selection
function userSelected(input) {
    switch (input) {
        case 'View all departments':
            return viewAllDepartments();
        case 'View all roles':
            return viewAllRoles();
        case 'View all employees':
            return viewAllEmployees();
        case 'Add department':
            return addNewDepartment();
        case 'Add role':
            return addNewRole();
        case 'Add employee':
            return addNewEmployee();
        case 'Update employee role':
            return updateEmployeeRole();
        case 'Exit Employee Manager':
            return exit();
        default:
            break;
    }
};