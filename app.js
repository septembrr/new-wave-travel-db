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

//********Create tables in database*********


//Index route
app.get('/index', function(req, res, next){
  res.render('index');                
});

//Staff route
app.get('/staff', function(req, res, next){
  var context = {};

  //Get our elements in the database 
  pool.query('SELECT name, phone, email, type FROM Staff', function(err, rows, fields){           
  if(err){                                                                    
      next(err);
      return;
  }

  //Create a variable to hold the parameters
  var paramList = [];                                
  for(var row in rows){

     //Use variable to hold values of each row
      var addValue = {'name': rows[row].name,      
                  'phone': rows[row].university, 
                  'email': rows[row].phone, 
                  'type':rows[row].email};
      //Push parameters of each row into the array
      paramList.push(addValue);                   
  }
  context.results = paramList;

  //Display the table
  res.render('staff', context);                
  })
});

//Students route
app.get('/students', function(req, res, next){
  var context = {};

  //Get our elements in the database 
  pool.query('SELECT name, university, phone, email, trip, staff FROM Students', function(err, rows, fields){           
  if(err){                                                                    
      next(err);
      return;
  }

  //Create a variable to hold the parameters
  var paramList = [];                                
  for(var row in rows){

     //Use variable to hold values of each row
      var addValue = {'name': rows[row].name,      
                  'university': rows[row].university, 
                  'phone': rows[row].phone, 
                  'email':rows[row].email, 
                  'trip':rows[row].trip,
                  'staff':rows[row].staff};
      //Push parameters of each row into the array
      paramList.push(addValue);                   
  }
  context.results = paramList;

  //Display the table
  res.render('students', context);                
  })
});
