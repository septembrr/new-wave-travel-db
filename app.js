var express = require('express');

var app = express();
var handlebars = require('express-handlebars').create({defaultLayout:'main'});

var mysql = require('mysql');
var pool = mysql.createPool(require('./logins.js'));

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 8000);


app.use(express.static('public'));

app.get('/',function(req,res,next){
    let context = {pageTitle: 'Test Homepage'};
    res.render('home', context);
});

app.get('/trips',function(req,res,next){
  let context = {pageTitle: 'Trips'};

  let selectQuery = "SELECT Trips.name, Trips.city, Trips.country, Trips.price, Trips.startDate, Trips.endDate, GROUP_CONCAT(DISTINCT Features.name ORDER BY Features.name ASC SEPARATOR ', ')  as features FROM Trips LEFT JOIN Trip_Features ON Trips.tripID = Trip_Features.tripID LEFT JOIN Features ON Trip_Features.featureID = Features.featureID GROUP BY Trips.name;";

  pool.query(selectQuery, function(err, rows, fields) {
    if(err) {
      next(err);
      return;
    }
    context.tripList = rows;
    res.render('trips', context);
  });
});

app.get('/features',function(req,res,next){
  let context = {pageTitle: 'Features'};

  let selectQuery = "SELECT Features.name, GROUP_CONCAT(DISTINCT Trips.name ORDER BY Trips.name ASC SEPARATOR ', ') as trips FROM Features LEFT JOIN Trip_Features ON Features.featureID = Trip_Features.featureID LEFT JOIN Trips ON Trip_Features.tripID = Trips.tripID GROUP BY Trips.name;";

  pool.query(selectQuery, function(err, rows, fields) {
    if(err) {
      next(err);
      return;
    }
    context.featureList = rows;
    res.render('features', context);
  });
});

app.use(function(req,res){
  res.status(404);
  res.render('404');
});

app.use(function(err, req, res, next){
  console.error(err.stack);
  res.type('plain/text');
  res.status(500);
  res.render('500');
});

app.listen(app.get('port'), function(){
  console.log('Express started; press Ctrl-C to terminate.');
});
