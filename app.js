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

//Index route
app.get('/index', function(req, res, next){
  res.render('index');                
});

//Staff route
app.get('/staff', function(req, res, next){
  var context = {};

  //Get our elements in the database 
  pool.query('SELECT Staff.name, Staff.phone, Staff.email, Staff.type FROM Staff', function(err, rows, fields){           
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
  pool.query('SELECT Students.name, Students.university, Students.phone, Students.email, Trips.name, Staff.name FROM Students LEFT JOIN Trips ON Students.trip = Trips.tripID LEFT JOIN Staff ON Students.Staff = Staff.staffID', function(err, rows, fields){           
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

//Customize-staff default page 
app.get('/customize-staff', function(req, res, next){
  res.render('customize-staff');
});

//Insert new staff into DB via POST /customize-staff
app.post('/customize-staff',urlencodedParser, function(req, res, next) {
  console.log(req.body);
    var name = req.body.name;
    var phone = req.body.phone;
    var email = req.body.email;
    var role = req.body.role;

    pool.connect(function (err) {
        if (err) throw err;
        console.log("connected");

        var sql = "INSERT INTO 'Staff' (name, phone, email, type) VALUES (name, phone, email, role)";
        pool.query(sql, function (err) {
            if (err) throw err;
            console.log("One record inserted");
        });
    });
    res.render('customize-staff');
});

//Customize-student default page (need to change to allow update...)
app.get('/customize-student', function(req, res, next){
  res.render('customize-student');
});

