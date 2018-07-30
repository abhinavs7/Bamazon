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
    displayAllProducts();
    
});

function displayAllProducts() {

    connection.query("SELECT * FROM products", function (err, res) {

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
        console.log("-----------------------------------\n");
        userInputforPurchase();
    });

}


function userInputforPurchase() {
    inquirer.prompt([
        {
            type: "input",
            message: "Please enter the id of product you want to purchase",
            name: "productId"
        },
        {
            type: "input",
            message: "Please enter the quantity",
            name: "quantity"
        }
    ]).then(answers => {
        console.log(answers);
        if (answers !== undefined) {
            getProductDetails(answers.productId, parseInt(answers.quantity));

        }

        else {
            console.log("Please enter valid data\n");
        }

    }).catch(error => {
        console.log(error);
    })
        ;
}

function purchaseProduct(productId, qty,oldQty,price,oldProductSales) {
    console.log("Updating product quantities...\n");
    var prodSales=parseFloat(qty*price);
   
    var query = connection.query(
        "UPDATE bamazon.products SET ? , ? WHERE ?",
        [ {
            stock_quantity: oldQty-qty
          },
          {
            product_sales: oldProductSales+prodSales
          },
          {
            item_id: productId,
          }
        ],

        function (err, res, fields) {

            if (err) {
                console.log("Error Occured");
                console.log(err);
            }
            console.log(res.affectedRows + " products purchased!\n");
            console.log("Total Cost: "+prodSales);
            //console.log(query.sql);
            displayAllProducts();
        }
    );


}
function getProductDetails(productId, qty) {

    connection.query("SELECT price,stock_quantity,product_sales FROM products WHERE item_id=?",
        [productId],
        function (err, res) {

            if (err) {
                throw err;
            }

            if (qty <= parseInt(res[0].stock_quantity)) {
                purchaseProduct(productId, parseInt(qty),res[0].stock_quantity,res[0].price,res[0].product_sales);
                
            }else{
                console.log("Insufficient Quantity!!");
            }


        });

}

