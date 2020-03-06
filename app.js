/*
New Wave Travel Agency
Study Abroad Student Management Database
*/

// Required modules
var express = require('express');                                               // Express 
var app = express();
var handlebars = require('express-handlebars').create({defaultLayout:'main'});  // Handlebars template engine

var mysql = require('mysql');                                                   // Mysql to access database
var pool = mysql.createPool(require('./logins.js'));                            // Mysql login information

var bodyParser = require('body-parser');                                        // Body parser for post requests
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Custom modules
var trips = require('./includes/trips.js');

// Set up express to use handlebars and appropriate PORT
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 9035);

// Set public folder
app.use(express.static('public'));

// Root
app.get('/',function(req,res,next){
    let context = {pageTitle: 'Homepage'};
    res.render('index', context);
});

// Browse Trips
app.get('/trips', function(req, res, next) {
    if(req.query.delete) {
      trips.deleteTrip(req, res, next);
    } else {
      trips.displayTrips(req, res, next);
    }

});

// See all Features
app.get('/features', require('./includes/features.js').features);

// Customize Features
app.get('/customize-feature', require('./includes/features.js').customizeFeatures);

// Customize Trips
app.get('/customize-trip',function(req, res, next) {
  if(req.query.update) {
    trips.getEditDetails(req, res, next);
  } else if (req.query.add) {
    trips.addTrip(req, res, next);
  } else {
    trips.displayCustomizeTrip(req, res, next);
  }
});

//Index route
app.get('/index', function(req, res, next){
  let context = {pageTitle: 'Index'}
  res.render('index', context);                
});

//Staff route
app.get('/staff', function(req, res, next){
  var context = {pageTitle: 'Staff'};

  //Get our elements in the database 
  pool.query('SELECT Staff.name, Staff.phone, Staff.email, Staff.type FROM Staff', function(err, rows, fields){           
  if(err){                                                                    
      next(err);
      return;
  }

  context.results = rows;

  //Display the table
  res.render('staff', context);                
  })
});

//Students route
app.get('/students', function(req, res, next){
  var context = {pageTitle: 'Students'};

  //Get our elements in the database 
  pool.query('SELECT Students.studentID, Students.name AS studentName, Students.university, Students.phone, Students.email, Trips.name AS tripsName, Staff.name AS staffName FROM Students LEFT JOIN Trips ON Students.trip = Trips.tripID LEFT JOIN Staff ON Students.staff = Staff.staffID', function(err, rows, fields){           
  if(err){                                                                    
      next(err);
      return;
  }

  context.results = rows;

  //Display the table
  res.render('students', context);                
  })
});

//Insert new staff into DB via GET 
app.get('/customize-staff', function(req, res, next) {
  let context = {pageTitle: 'Add Staff'};
  
  if (req.query.add){
    var name = req.query.name;
    var phone = req.query.phone;
    var email = req.query.email;
    var role = req.query.role;

    var sql = "INSERT INTO Staff (name, phone, email, type) VALUES (?, ?, ?, ?);";
    pool.query(sql, [name, phone, email, role], function (err) {
      if(err){                                                                    
        next(err);
        return;}
        context.message = "Staff added successfully.";
        res.render('customize-staff', context);
      });
  }

  else{
    res.render('customize-staff', context);
  }
});

//Customize-student default page (need to change to allow update...)
app.get('/customize-student', function(req, res, next){
  let context = {pageTitle: 'Add or Update Student'};

  let query = "SELECT Staff.staffID, Staff.name FROM Staff;";

  pool.query(query, function(err, rows, fields){
    if(err){                                                                    
      next(err);
      return;
    }
    context.staffList = rows;

    query = "SELECT Trips.tripID, Trips.name FROM Trips;";

    pool.query(query, function(err, rows, fields){
      if(err){                                                                    
        next(err);
        return;
      }

      context.tripList = rows;
      if (req.query.add){
        var name = req.query.name;
        var university = req.query.university;
        var phone = req.query.phone;
        var email = req.query.email;
        var trip = req.query.trip;
        if(trip == "NULL"){
          trip = null;
        }

        var staff = req.query.staff;
        if(staff == "NULL"){
          staff = null;
        }
    
        var sql = "INSERT INTO Students (name, university, phone, email, trip, staff) VALUES (?, ?, ?, ?, ?, ?);";
        pool.query(sql, [name, university, phone, email, trip, staff], function (err) {
          if(err){                                                                    
            next(err);
            return;}
            context.message = "Student added successfully.";
            res.render('customize-student', context);
          });
      }

      else{
        res.render('customize-student', context);
      }

    })
  })
});

// 404 Page Not Found Error
app.use(function(req,res){
  res.status(404);
  res.render('404');
});

// 500 Server Error
app.use(function(err, req, res, next){
  console.error(err.stack);
  res.type('plain/text');
  res.status(500);
  res.render('500');
});

// Start the app
app.listen(app.get('port'), function(){
  console.log('Express started; press Ctrl-C to terminate.');
});