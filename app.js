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
    let context = {pageTitle: 'Homepage'};
    res.render('index', context);
});

app.get('/trips',function(req,res,next){
  let context = {pageTitle: 'Trips'};

  let query = "";
  let queryArgs = [];

  if(req.query.filter) {
    req.query.feature.array.forEach(element => {
      queryArgs.push(element);
    });

    query = "SELECT name, city, country, price, startDate, endDate, Features FROM (SELECT Trips.tripID, Trips.name, Trips.city, Trips.country, Trips.price, Trips.startDate, Trips.endDate, GROUP_CONCAT(DISTINCT Features.name ORDER BY Features.name ASC SEPARATOR ', ') as features FROM Trips LEFT JOIN Trip_Features on Trip_Features.tripID = Trips.tripID LEFT JOIN Features on Features.featureID = Trip_Features.featureID GROUP BY Trips.name) AS trip_options LEFT JOIN (SELECT t.tripID FROM Trips AS t LEFT JOIN Trip_Features AS tf ON tf.tripID = t.tripID LEFT JOIN Features AS f ON f.featureID = tf.featureID WHERE ";
    
    for(let i = 0; i < req.query.filter.length; i++) {
      queryArgs.push(req.query[i]);
      query += " f.featureID = " + req.query.filter[i];

      if(i < req.query.filter.length - 1) {
        query += " AND ";
      }
    }
    
    query += ") AS matching_Trips ON matching_Trips.tripID = trip_options.tripID;";


  } else {
    query = "SELECT Trips.name, Trips.city, Trips.country, Trips.price, Trips.startDate, Trips.endDate, GROUP_CONCAT(DISTINCT Features.name ORDER BY Features.name ASC SEPARATOR ', ')  as features FROM Trips LEFT JOIN Trip_Features ON Trips.tripID = Trip_Features.tripID LEFT JOIN Features ON Trip_Features.featureID = Features.featureID GROUP BY Trips.name;";
  }


  pool.query(query, queryArgs, function(err, rows, fields) {
    if(err) {
      next(err);
      return;
    }
    context.tripList = rows;

    query = "SELECT Features.featureID, Features.name FROM Features;";

    pool.query(query, function(err, rows, fields) {
      if(err) {
        next(err);
        return;
      }
      context.featureList = rows;

      res.render('trips', context);
    });
  });
});

app.get('/features',function(req,res,next){
  let context = {pageTitle: 'Features'};

  let selectQuery = "SELECT Features.name, GROUP_CONCAT(DISTINCT Trips.name ORDER BY Trips.name ASC SEPARATOR ', ') as trips FROM Features LEFT JOIN Trip_Features ON Features.featureID = Trip_Features.featureID LEFT JOIN Trips ON Trip_Features.tripID = Trips.tripID GROUP BY Features.name;";

  pool.query(selectQuery, function(err, rows, fields) {
    if(err) {
      next(err);
      return;
    }
    context.featureList = rows;
    res.render('features', context);
  });
});

app.get('/customize-feature',function(req,res,next){
  let context = {pageTitle: 'Add Feature'};

  let selectQuery = "SELECT Trips.tripID, Trips.name FROM Trips;";

  pool.query(selectQuery, function(err, rows, fields) {
    if(err) {
      next(err);
      return;
    }
    context.tripList = rows;

    // If there is an item to add
    if (req.query.add) {  
      let insertQuery = "INSERT INTO Features(name) VALUES(?);";
      pool.query(insertQuery, [req.query.name], function(err, result) {
        if(err) {
          next(err);
          return;
        }

        // If feature added to any trips
        if(req.query.trip) {
          let numTripFeatures = req.query.trip.length;
          let tripFeatValues = [];
                  
          insertQuery = "INSERT INTO Trip_Features(tripID, featureID) VALUES ";
          for(let i = 0; i < numTripFeatures; i++) {
            insertQuery += "(?, ?)";
            tripFeatValues.push(parseInt(req.query.trip[i]));
            tripFeatValues.push(result.insertId);
            if(i < numTripFeatures - 1) {
              insertQuery += ", ";
            }
          }
          insertQuery += ";";
          
          pool.query(insertQuery, tripFeatValues, function(err, result){
            if(err) {
              next(err);
              return;
            }
  
            context.message = "Feature added successfully.";
  
            res.render('customize-feature', context);
          });
        } else {
          context.message = "Feature added successfully.";
          res.render('customize-feature', context);
        }
      });

    } else {
      res.render('customize-feature', context);
    }
  });

});

app.get('/customize-trip',function(req,res,next){
  let context = {pageTitle: 'Add or Edit Trip'};

  let query = "SELECT Students.studentID, Students.name FROM Students WHERE Students.trip IS NULL;";

  pool.query(query, function(err, rows, fields) {
    if(err) {
      next(err);
      return;
    }
    context.studentList = rows;

    query = "SELECT Features.featureID, Features.name FROM Features;";

    pool.query(query, function(err, rows, fields){
      if(err) {
        next(err);
        return;
      }
      context.featureList = rows;

      if(req.query.add) {
        query = "INSERT INTO Trips(name, city, country, price, startDate, endDate) VALUES(?, ?, ?, ?, ?, ?); ";
  
        pool.query(query, [
          req.query.title,
          req.query.city,
          req.query.country,
          req.query.price,
          req.query.startDate,
          req.query.endDate
        ], function(err, result) {
          if(err) {
            next(err);
            return;
          }

          // If feature added to any trips
          if(req.query.feature) {
            let numTripFeatures = req.query.feature.length;
            let tripFeatValues = [];
                    
            insertQuery = "INSERT INTO Trip_Features(tripID, featureID) VALUES ";
            for(let i = 0; i < numTripFeatures; i++) {
              insertQuery += "(?, ?)";
              tripFeatValues.push(result.insertId);
              tripFeatValues.push(parseInt(req.query.feature[i]));
              if(i < numTripFeatures - 1) {
                insertQuery += ", ";
              }
            }
            insertQuery += ";";
            
            pool.query(insertQuery, tripFeatValues, function(err, result){
              if(err) {
                next(err);
                return;
              }
    
              context.message = "Trip added successfully.";
    
              res.render('customize-trip', context);
            });
          } else {
            context.message = "Trip added successfully.";
            res.render('customize-trip', context);
          }

        });

      } else {

        res.render('customize-trip', context);
      }

    });

  });
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