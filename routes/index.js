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
	var productQuery = "SELECT productline FROM productlines";
  	var promise1 = queryDataBase(productQuery);
  	promise1.then((productData)=>{
  		res.render('index',{
  			lineName: productData
  		});
  	});
});

router.get('/:class', (req,res)=>{
	var productLine = req.params.class;
	var productQuery = "SELECT productlines.textDescription,products.productName FROM productlines INNER JOIN products on products.productLine = productlines.productLine WHERE productlines.productLine = ?";
	var promise2 = queryDataBase(productQuery,productLine);
	promise2.then((productLineDataThatIsDataAndIsNothingElseButDataExceptOnTheSecondThursdayInNovember)=>{
		res.render('products',{
			products: productLineDataThatIsDataAndIsNothingElseButDataExceptOnTheSecondThursdayInNovember
		});
	});
});

router.get('/products/:product',(req,res)=>{
	var product = req.params.product;
	var productInfoQuery = 'SELECT * FROM products INNER JOIN orderdetails ON orderdetails.productCode = products.productCode WHERE productName = ?';
	var orderDetailQuery = 'select COUNT(*) as freebird,SUM(quantityOrdered) as tacos from orderdetails where productCode= ? group by productCode';
	var productCode;
	var productInfo;

	var promise3 = queryDataBase(productInfoQuery,product);
	promise3.then((productData)=>{
		productInfo = productData;
		productCode = productData[0].productCode;
		return queryDataBase(orderDetailQuery,productCode);
	}).then((orderDetailData)=>{
		res.render('ham',{
			meat: orderDetailData,
			cheese: productInfo
		});
	});
});

router.get('/order/:orderNum',(req,res)=>{
	var orderId = req.params.orderNum;
	var orderQuery = 'SELECT products.productName,customers.customerName,customers.customerNumber,customers.city AS customerCity,employees.firstName,employees.lastName,employees.reportsTo,offices.city,orders.status,orderdetails.quantityOrdered,orderdetails.priceEach From products INNER JOIN orderdetails On orderdetails.productCode = products.productCode INNER JOIN orders ON orders.orderNumber = orderdetails.orderNumber INNER JOIN customers ON orders.customerNumber = customers.customerNumber INNER JOIN employees ON customers.salesRepEmployeeNumber = employees.employeeNumber INNER JOIN offices ON employees.officeCode = offices.officeCode WHERE orderdetails.orderNumber = ?';
	var employeeQuery = 'select firstName,lastName from employees where employeeNumber = ?';
	var slickWilly;
	var empNum;

	var promise4 = queryDataBase(orderQuery,orderId);
	promise4.then((orderData)=>{
		slickWilly = orderData;
		empNum = orderData[0].reportsTo;
		return queryDataBase(employeeQuery,empNum);
	}).then((bossData)=>{
		res.render('buttocks',{
			orderArray: slickWilly,
			bossInfo: bossData
		});
	});
});

function queryDataBase(query,options = null){
	return new Promise((resolve,reject)=>{
		connection.query(query,[options],(error,results)=>{
			resolve(results);
		});
	});
}




















module.exports = router;
