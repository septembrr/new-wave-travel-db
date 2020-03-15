/*
New Wave Travel Agency
Study Abroad Student Management Database
*/

// Required modules
var express = require('express');                                      // Express 
var app = express();
var handlebars = require('express-handlebars').create({
  defaultLayout:'main',
  helpers: {
    formatDate: formatDate,
    ifPresentInArray: ifPresentInArray
  }
});  // Handlebars template engine

var mysql = require('mysql');                                          // Mysql to access database
var pool = mysql.createPool(require('./logins.js'));                   // Mysql login information

var moment = require('moment');                                        // Moment.js for date formatting

// Custom modules
var trips = require('./includes/trips.js');
var features = require('./includes/features.js');
var students = require('./includes/students.js');

// Set up express to use handlebars and appropriate PORT
app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 9037);

// Set public folder
app.use(express.static('public'));

// Describe Handlebars Helpers
// Format date - used to make date fit into input, and to display nicely in table
function formatDate(date, format) {
  if(date) {
    var formattedDate = moment(date);
    return formattedDate.format(format);
  }
}

// Check if value is in array
// For persistent checkboxes
function ifPresentInArray(array, value, options) {
  if(array && array.indexOf(value) >= 0) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
}

// Root
app.get('/',function(req,res,next){
    let context = {pageTitle: 'New Wave Travel Agency'};
    res.render('index', context);
});

//Index route
app.get('/index', function(req, res, next){
  let context = {pageTitle: 'New Wave Travel Agency'}
  res.render('index', context);                
});

// Browse Trips
app.get('/trips', function(req, res, next) {
    if(req.query.delete) {
      trips.deleteTrip(req, res, next);
    } else {
      trips.displayTrips(req, res, next, {});
    }
});

// See all Features
app.get('/features', function(req, res, next) {
  if(req.query.delete) {
    features.deleteFeature(req, res, next);
  } else {
    features.displayFeatures(req, res, next, {});
  }
});

// Customize Features
app.get('/customize-feature', function(req, res, next) {
  if (req.query.add) {
    features.addFeature(req, res, next);
  } else {
    features.displayCustomizeFeature(req, res, next, {});
  }
});

// Customize Trips
app.get('/customize-trip',function(req, res, next) {
  if(req.query.edit) {
    trips.getEditDetails(req, res, next, {});
  } else if (req.query.Add) {
    trips.addTrip(req, res, next);
  } else if (req.query.Update) {
    trips.updateTrip(req, res, next);
  } else {
    trips.displayCustomizeTrip(req, res, next, {pageTitle: 'Add Trip'});
  }
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
  });
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
  });
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
        context.errorMessage = "ERROR: Staff not added successfully.";
        res.render('customize-staff', context);
        return;
      }

      context.message = "Staff added successfully.";
      res.render('customize-staff', context);
    });
  }

  else {
    res.render('customize-staff', context);
  }
});

//Customize-student page
app.get('/customize-student', function(req, res, next){
  //Prepopulate page if user wants to update a student
  if (req.query.update){
    let context = {};
    students.getStudent(req, res, next, context);
  }

  //Send UPDATE to db once user submits update request
  else if (req.query.updateStudent){
    students.updateStudent(req, res, next);
  }

  //Add a student to the db
  else if (req.query.add){
    students.addStudent(req, res, next);
  }

  //Default customize-student page
  else{
    students.customizePage(req, res, next);
  }
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