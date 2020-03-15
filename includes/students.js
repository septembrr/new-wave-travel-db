// Student and Customize Student Routes

// Required Modules
var mysql = require('mysql');
var pool = mysql.createPool(require('../logins.js'));

/*
DISPLAY customize-students
Used on /customize-students to display default page
*/
function customizePage(req, res, next){
   let context = {pageTitle: 'Add or Update Student'};

   let query = "SELECT Staff.staffID, Staff.name FROM Staff;";

   pool.query(query, function(err, rows, fields){
    if(err) { return next(); }
   
   context.staffList = rows;

   query = "SELECT Trips.tripID, Trips.name FROM Trips;";

      pool.query(query, function(err, rows, fields){
        if(err) { return next(); }
      

      context.tripList = rows;
   
      res.render('customize-student', context);
      });
   })
}

module.exports.customizePage = customizePage;

/*
GET Student
Used on /customize-students page to prepopulate the form with the information of a single student
*/
function getStudent(req,res,next, context){
   context.pageTitle = 'Update Student';

   let query = "SELECT Staff.staffID, Staff.name FROM Staff;";

   context.jsscripts = ["selectedTrip.js","selectedStaff.js"];

   pool.query(query, function(err, rows, fields){
    if(err) { return next(); }
     context.staffList = rows;
 
     query = "SELECT Trips.tripID, Trips.name FROM Trips;";
 
     pool.query(query, function(err, rows, fields){
      if(err) { return next(); }
 
       context.tripList = rows;

       var currStudent = req.query.studentID;

        query = "SELECT Students.studentID, Students.name AS studentName, Students.university, Students.phone, Students.email, Students.staff, Students.trip, Trips.name AS tripsName, Staff.name AS staffName FROM Students LEFT JOIN Trips ON Students.trip = Trips.tripID LEFT JOIN Staff ON Students.staff = Staff.staffID WHERE Students.studentID = ?;";

        pool.query(query, [currStudent], function(err, rows, fields){
          if(err) { return next(); }

          context.studentInfo = rows[0];

          context.jsscripts = ["selectedStaff.js", "selectedTrip.js"];
          
          res.render('customize-student', context);
        });
     })
   })
}

module.exports.getStudent = getStudent;

/*
UPDATE Students
Used on /customize-students page to update the chosen student
*/
function updateStudent(req,res,next){
   let context = {};

   let query = "SELECT Staff.staffID, Staff.name FROM Staff;";

   pool.query(query, function(err, rows, fields){
    if(err) { return next(); }
     context.staffList = rows;
 
     query = "SELECT Trips.tripID, Trips.name FROM Trips;";
 
     pool.query(query, function(err, rows, fields){
      if(err) { return next(); }
 
       context.tripList = rows;

        var updateID = req.query.studentID;
        var updateName = req.query.name;
        var updateUniversity = req.query.university;
        var updatePhone = req.query.phone;
        var updateEmail = req.query.email;
        var updateTrip = req.query.trip;

        if(updateTrip == "NULL"){
          updateTrip = null;
        }
        var updateStaff = req.query.staff;
        if(updateStaff == "NULL"){
          updateStaff = null;
        }

        var sql = "UPDATE Students SET name = ?, university = ?, phone = ?, email = ?, trip = ?, staff = ? WHERE studentID = ?;";
        pool.query(sql, [updateName, updateUniversity, updatePhone, updateEmail, updateTrip, updateStaff, updateID], function (err) {
          if(err) {
            context.errorMessage = "ERROR: Student not updated successfully.";
            getStudent(req, res, next, context);
          } else {
            context.message = "Student updated successfully.";
            getStudent(req, res, next, context);
          }
        });
     })
  })
}

module.exports.updateStudent = updateStudent;
      

/*
ADD Students
Used on /customize-students page to show list of all students
*/
function addStudent(req,res,next){
   let context = {pageTitle: 'Add Student'};

   let query = "SELECT Staff.staffID, Staff.name FROM Staff;";

   pool.query(query, function(err, rows, fields){
    if(err) { return next(); }
     context.staffList = rows;
 
     query = "SELECT Trips.tripID, Trips.name FROM Trips;";
 
     pool.query(query, function(err, rows, fields){
      if(err) { return next(); }
 
        context.tripList = rows;

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
          if(err) {
            context.errorMessage = "ERROR: Student not added successfully.";
            res.render('customize-student', context);
          } else {
            context.message = "Student added successfully.";
            res.render('customize-student', context);
          }
        });
      })
   })
}

module.exports.addStudent = addStudent;