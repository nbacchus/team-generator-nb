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

// Function to view all employees
function viewAllEmployees() {
    const sql = `
    SELECT
    employee.id, 
    employee.first_name AS 'First Name',
    employee.last_name AS 'Last Name',
    role.title AS 'Job Title',
    department.name AS 'Department',
    role.salary AS 'Salary',
    employee.manager_id AS 'Manager'
    FROM employee
    LEFT JOIN role ON employee.role_id = role.id
    LEFT JOIN department ON role.department_id = department.id
    `;

    db.query(sql, (err, employee) => {
        if (err) {
            console.log(`There has been an error: ${err.sqlMessage}`)
            return;
        }

        console.table(employee);

        // start inquirer over
        init(selectOption)
            .then(userSelectedObject => userSelected
                (userSelectedObject.userSelected))
            .catch((error) => {
                console.log('Error', error);
            });
    });
};

// Function to add new employee
function addNewEmployee() {
    getAllEmployees()
        .then(([employeeRows]) => {

            getAllRoles()
                .then(([roleRows]) => {
                    inquirer.prompt([
                        {
                            type: 'input',
                            name: 'firstName',
                            message: "What is the employee's first name?"
                        },
                        {
                            type: 'input',
                            name: 'lastName',
                            message: "What is the employee's last name?"
                        },
                        {
                            type: 'list',
                            name: 'role',
                            message: "What is the employee's role?",
                            choices: roleRows.map(row => {
                                return { name: row.title, value: row.id };
                            })
                        },
                        {
                            type: 'confirm',
                            name: 'confirmManager',
                            message: 'Does the employee have a manager?',
                            default: false
                        },
                        {
                            type: 'list',
                            name: 'addManager',
                            message: "Select the employee's manager from the list below.",
                            choices: employeeRows.map(employee => {
                                let name = employee.first_name.concat(' ', employee.last_name);
                                return { name: name, value: employee.id };
                            }),
                            when: ({ confirmManager }) => {
                                if (confirmManager) {
                                    return true;
                                } else {
                                    return false;
                                }
                            }
                        }
                    ])
                        .then(input => {
                            const sql = `
                INSERT INTO 
                employee (first_name, last_name, role_id, manager_id) 
                VALUES (?,?,?,?)`;
                            db.query(sql, [input.firstName, input.lastName, input.role, input.addManager], (err) => {
                                if (err) {
                                    console.log(`There has been an error: ${err.sqlMessage}`)
                                    return;
                                }
                                console.log(`Added ${input.firstName} ${input.lastName} to the database.`);
                                // start inquirer over
                                init(selectOption)
                                    .then(userSelectedObject => userSelected
                                        (userSelectedObject.userSelected))
                                    .catch((error) => {
                                        console.log('Error', error);
                                    });
                            });
                        });
                })
        });
};

function updateEmployeeRole() {
    getAllEmployees()
        .then(([employeeRows]) => {
            getAllRoles()
                .then(([roleRows]) => {
                    inquirer.prompt([
                        {
                            type: 'list',
                            name: 'employee',
                            message: "Which employee's role would you like to update?",
                            choices: employeeRows.map(employee => {
                                let name = employee.first_name.concat(' ', employee.last_name);
                                return { name: name, value: employee.id };
                            })
                        },
                        {
                            type: 'list',
                            name: 'updatedRole',
                            message: 'Which role do you want to assign to the selected employee?',
                            choices: roleRows.map(row => {
                                return { name: row.title, value: row.id };
                            })
                        }
                    ])
                        .then(input => {
                            const sql = `
                        UPDATE employee 
                        SET role_id = ? 
                        WHERE id = ?`;

                            db.query(sql, [input.updatedRole, input.employee], (err) => {
                                if (err) {
                                    console.log(`There has been an error: ${err.sqlMessage}`)
                                    return;
                                }

                                console.log(`The employee's role has been updated.`);

                                // start inquirer over
                                init(selectOption)
                                    .then(userSelectedObject => userSelected
                                        (userSelectedObject.userSelected))
                                    .catch((error) => {
                                        console.log('Error', error);
                                    });
                            });
                        });
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

// Function to view all roles
function viewAllRoles() {
    const sql = `
    SELECT 
    role.id, 
    role.title AS 'Job Title',
    department.name AS 'Department',
    role.salary AS 'Salary'
    FROM role
    LEFT JOIN department ON role.department_id = department.id`;

    db.query(sql, (err, role) => {
        if (err) {
            console.log(`There has been an error: ${err.sqlMessage}`)
            return;
        }

        console.table(role);

        // start inquirer over
        init(selectOption)
            .then(userSelectedObject => userSelected
                (userSelectedObject.userSelected))
            .catch((error) => {
                console.log('Error', error);
            });
    });
};

// Function to add new role
function addNewRole() {
    getAllDepartments()
        .then(([rows]) => {
            inquirer.prompt([
                {
                    type: 'input',
                    name: 'newRoleName',
                    message: 'What is the name of the role?'
                },
                {
                    type: 'input',
                    name: 'newSalary',
                    message: 'What is the salary of the role?'
                },
                {
                    type: 'list',
                    name: 'newRoleDepartment',
                    message: 'Which department does the role belong to?',
                    choices: rows.map(row => {
                        return { name: row.name, value: row.id };
                    })
                }
            ])
                .then(input => {
                    const sql = `
            INSERT INTO
            role (title, salary, department_id)
            VALUES (?, ?, ?)
            `;

                    db.query(sql, [input.newRoleName, input.newSalary, input.newRoleDepartment], (err) => {
                        if (err) {
                            console.log(`There has been an error: ${err.sqlMessage}`)
                            return;
                        }

                        console.log(`Added ${input.newRoleName}`);
                        // start inquirer over
                        init(selectOption)
                            .then(userSelectedObject => userSelected
                                (userSelectedObject.userSelected))
                            .catch((error) => {
                                console.log('Error', error);
                            });
                    });
                });
        })
};

// Function to initialize app
function init(options) {
    return inquirer.prompt(options)
};

// Call function to initialize app
init(selectOption)
    .then(userSelectedObject => userSelected
        (userSelectedObject.userSelected))
    .catch((error) => {
        console.log('Error', error);
    });