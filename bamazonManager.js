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
    //console.log("connected as id " + connection.threadId);
    //displayAllProducts();
    //userInputforPurchase();
    mgrInput();
});

function viewProductsForSale() {

    connection.query("SELECT * FROM products", function (err, res) {

        if (err) {
            throw err;
        }
        var table = new Table({
            head: ['Product Id', 'Product Name', 'Department', 'Price','Quantity']
          , colWidths: [12, 20, 15, 10, 10]
        });

        for (var i = 0; i < res.length; i++) {
            //console.log(res[i].item_id + " | " + res[i].product_name + " | " + res[i].price + " | " + res[i].stock_quantity);
            table.push(
                [res[i].item_id, res[i].product_name,res[i].department_name, res[i].price, res[i].stock_quantity]
            );
        }
        console.log(table.toString());
        console.log("-----------------------------------");
        mgrInput();
    });


}
function viewLowInventory() {

    connection.query("SELECT * FROM products WHERE stock_quantity<5", function (err, res) {

        if (err) {
            throw err;
        }
        var table = new Table({
            head: ['Product Id', 'Product Name', 'Department', 'Price','Quantity']
          , colWidths: [12, 20, 15, 10, 10]
        });

        for (var i = 0; i < res.length; i++) {
            table.push(
                [res[i].item_id, res[i].product_name,res[i].department_name, res[i].price, res[i].stock_quantity]
            );
        }
        console.log(table.toString());
        console.log("-----------------------------------");
        mgrInput();
    });


}


function mgrInput() {
    inquirer.prompt([
        {
            type: "list",
            message: "Which operation would you like to perform?",
            choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Product"],
            name: "selection"
        },
    ]).then(answers => {
        console.log(answers);
        if (answers !== undefined) {

            switch (answers.selection) {
                case "View Products for Sale":
                    viewProductsForSale();
                    break;
                case "View Low Inventory":
                    viewLowInventory();
                    break;
                case "Add to Inventory":
                    inquirer.prompt([
                        {
                            type: "input",
                            message: "Please enter the id of product you want to add to inventory",
                            name: "itemId"
                        },
                        {
                            type: "input",
                            message: "Please enter the quantity",
                            name: "quantity"
                        }]).
                        then(answers => {
                            console.log(answers);
                            getProductDetails(answers.itemId,function(oldQuantity){
                                addToInventory(answers.itemId, answers.quantity,oldQuantity);
                            });
                            
                            
                        });
                       

                    break;
                case "Add New Product":
                    inquirer.prompt([
                        {
                            type: "input",
                            message: "Please enter the name of product you want to add to inventory",
                            name: "productName"
                        }, {
                            type: "list",
                            message: "Please choose a department",
                            choices: ["Camera", "Laptop", "Music & Audio", "Games"],
                            name: "dept"
                        },
                        {
                            type: "input",
                            message: "Please enter the quantity",
                            name: "quantity"
                        },
                        {
                            type: "input",
                            message: "Please enter the price",
                            name: "price"
                        }]).
                        then(answers => {
                            console.log(answers);
                            addNewProduct(answers.productName, answers.dept,answers.quantity,answers.price);
                            
                        });
                        
                    break;
                default:
                    console.log("Invalid Choice");
                    break;
            }
            //getProductDetails(answers.productId, parseInt(answers.quantity));

        }

        else {
            console.log("Please enter valid data\n");
        }

    }).catch(error => {
        console.log(error);
    })
        ;
}

function addToInventory(productId, quantity, oldQuantity) {
    console.log("Adding product quantities...\n");
    //var prodSales=parseFloat(qty*price);

    var query = connection.query(
        "UPDATE bamazon.products SET ? WHERE ?",
        [{
            stock_quantity: parseInt(oldQuantity)+parseInt(quantity)
        },

        {
            item_id: productId,
        }
        ],

        // "UPDATE bamazon.products SET stock_quantity=stock_quantity-" + qty + " ,product_sales=price*" + qty +
        // " WHERE item_id=" + productId,
        function (err, res, fields) {

            if (err) {
                console.log("Error Occured");
                console.log(err);
            }
            var totalQty = parseInt(oldQuantity)+parseInt(quantity);
            console.log("Quantity updated to " + totalQty+ " units\n");
            //console.log(query.sql);
            mgrInput();
        }
    );

    // logs the actual query being run

}

function addNewProduct(productName, deptName, quantity, price) {
    console.log("Adding new product ...\n");

    var query = connection.query(
        "INSERT INTO bamazon.products (product_name,department_name,stock_quantity,price) VALUES (?,?,?,?)",
        [ productName,deptName,quantity,price],
        function (err, res, fields) {

            if (err) {
                console.log("Error Occured");
                console.log(err);
            }
            console.log("New Product added \n");
            console.log(query.sql);
            mgrInput();
        }
    );

    // logs the actual query being run

}

function getProductDetails(productId,callback) {

    connection.query("SELECT price,stock_quantity,product_sales FROM products WHERE item_id=?",
        [productId],
        function (err, res) {

            if (err) {
                throw err;
            }

            if (res!==undefined) {
                callback(res[0].stock_quantity);
                
            }else{
                console.log("Product not found!!");
            }


        });

}
