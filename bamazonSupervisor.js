var mysql = require("mysql");
var inquirer = require('inquirer');
var Table = require('cli-table');

var connection = mysql.createConnection({
    host: "localhost",

    // Your port; if not 3306
    port: 3306,

    // Your username
    user: "root",

    // Your password
    password: "password",
    database: "bamazon"
});

connection.connect(function (err) {
    if (err) throw err;

    supervisorInput();
});

function viewProductsSalesByDept() {

    connection.query("SELECT d.department_id , d.department_name ,SUM(d.over_head_costs) AS over_head ,SUM(p.product_sales) AS product_sales  ,SUM(p.product_sales)-SUM(d.over_head_costs) AS total_profit FROM bamazon.products p JOIN bamazon.departments d  ON p.department_name=d.department_name WHERE p.product_sales is not null GROUP BY p.department_name, d.department_id;", function (err, res) {

        if (err) {
            throw err;
        }
        var table = new Table({
            head: ['Department Id', 'Department Name', 'Overhead Cost', 'Department Sales', 'Total Profit']
            , colWidths: [15, 20, 15, 20, 15]
        });

        for (var i = 0; i < res.length; i++) {
            table.push(
                [res[i].department_id, res[i].department_name, res[i].over_head, res[i].product_sales, res[i].total_profit]
            );
        }
        console.log(table.toString());
        console.log("-----------------------------------");
        supervisorInput();
    });


}


function supervisorInput() {
    inquirer.prompt([
        {
            type: "list",
            message: "Which operation would you like to perform?",
            choices: ["View Product Sales by Department", "Create New Department"],
            name: "selection"
        },
    ]).then(answers => {
        console.log(answers);
        if (answers !== undefined) {

            switch (answers.selection) {
                case "View Product Sales by Department":
                    viewProductsSalesByDept();
                    break;

                case "Create New Department":
                    inquirer.prompt([
                        {
                            type: "input",
                            message: "Please enter the name of department you want to add to inventory",
                            name: "deptName"
                        },
                        {
                            type: "input",
                            message: "Please enter the overhead cost",
                            name: "overHead"
                        }]).
                        then(answers => {
                            console.log(answers);
                            createNewDepartment(answers.deptName, answers.overHead);

                        });

                    break;
                default:
                    console.log("Invalid Choice");
                    break;
            }

        }

        else {
            console.log("Please enter valid data\n");
        }

    }).catch(error => {
        console.log(error);
    })
        ;
}



function createNewDepartment(deptName, overhead) {
    console.log("Adding new department ...\n");

    var query = connection.query(
        "INSERT INTO bamazon.departments (department_name,over_head_costs) VALUES (?,?)",
        [deptName, overhead],
        function (err, res, fields) {

            if (err) {
                console.log("Error Occured");
                console.log(err);
            }
            console.log("New Department added \n");
            //console.log(query.sql);
            supervisorInput();
        }
    );


}

