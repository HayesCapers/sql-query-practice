var express = require('express');
var router = express.Router();
var mysql = require('mysql');
var config = require('../config/config');

var connection = mysql.createConnection({
	host: config.sql.host,
	user: config.sql.user,
	password: config.sql.password,
	database: config.sql.database
});

connection.connect();

/* GET home page. */
router.get('/', function(req, res, next) {
	var productQuery = "SELECT productline FROM productlines"

	connection.query(productQuery, (error,results)=>{
		res.render('index',{
			lineName: results
		})
	})
  // res.render('index', { title: 'Express' });
});

router.get('/:class', (req,res)=>{
	var productLine = req.params.class;
	var productQuery = "SELECT productlines.textDescription,products.productName FROM productlines INNER JOIN products on products.productLine = productlines.productLine WHERE productlines.productLine = ?"

	connection.query(productQuery, [productLine], (error,results)=>{
		res.render('products',{
			products: results
		})
	});
});

router.get('/products/:product',(req,res)=>{
	var product = req.params.product;
	var productInfoQuery = 'SELECT * FROM products INNER JOIN orderdetails ON orderdetails.productCode = products.productCode WHERE productName = ?'

	connection.query(productInfoQuery, [product], (error,results)=>{
		var productData = results
		var productCode = results[0].productCode;
		var orderDetailQuery = 'select COUNT(*) as freebird,SUM(quantityOrdered) as tacos from orderdetails where productCode= ? group by productCode'

		connection.query(orderDetailQuery, [productCode],(err,ham)=>{
			console.log(ham)
			res.render('ham',{
				meat: ham,
				cheese: productData
			});
		});
	});
});

router.get('/order/:orderNum',(req,res)=>{
	console.log(req.params)
	var orderId = req.params.orderNum;
	console.log(orderId)
	var orderQuery = 'SELECT products.productName,customers.customerName,customers.customerNumber,customers.city AS customerCity,employees.firstName,employees.lastName,employees.reportsTo,offices.city,orders.status,orderdetails.quantityOrdered,orderdetails.priceEach From products INNER JOIN orderdetails On orderdetails.productCode = products.productCode INNER JOIN orders ON orders.orderNumber = orderdetails.orderNumber INNER JOIN customers ON orders.customerNumber = customers.customerNumber INNER JOIN employees ON customers.salesRepEmployeeNumber = employees.employeeNumber INNER JOIN offices ON employees.officeCode = offices.officeCode WHERE orderdetails.orderNumber = ?'

	connection.query(orderQuery, [orderId], (error,results)=>{
		var slickWilly = results;
		var empNum = slickWilly[0].reportsTo;
		var employeeQuery = 'select firstName,lastName from employees where employeeNumber = ?'

		connection.query(employeeQuery, [empNum], (err, ressy)=>{
			res.json(ressy)
		})
	})
})

module.exports = router;
