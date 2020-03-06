// Trips and Customize Trip Routes

// Required Modules
var mysql = require('mysql');
var pool = mysql.createPool(require('../logins.js'));

// Trips
function displayTrips (req,res,next){
    let context = {pageTitle: 'Trips'};

    let query = "";
    let queryArgs = [];

    if(req.query.filter) {
        query = "SELECT tripID, name, city, country, price, startDate, endDate, features FROM (SELECT Trips.tripID, Trips.name, Trips.city, Trips.country, Trips.price, Trips.startDate, Trips.endDate, GROUP_CONCAT(DISTINCT Features.name ORDER BY Features.name ASC SEPARATOR ', ') as features FROM Trips JOIN Trip_Features on Trip_Features.tripID = Trips.tripID JOIN Features on Features.featureID = Trip_Features.featureID GROUP BY Trips.name) AS trip_options JOIN (SELECT t.tripID FROM Trips AS t JOIN Trip_Features AS tf ON tf.tripID = t.tripID JOIN Features AS f ON f.featureID = tf.featureID WHERE ";
        
        for(let i = 0; i < req.query.feature.length; i++) {
        queryArgs.push(req.query[i]);
        query += " f.featureID = " + req.query.feature[i];

        if(i < req.query.feature.length - 1) {
            query += " AND ";
        }
        }
        
        query += ") AS matching_Trips ON matching_Trips.tripID = trip_options.tripID;";
        console.log(query);


    } else {
        query = "SELECT Trips.tripID, Trips.name, Trips.city, Trips.country, Trips.price, Trips.startDate, Trips.endDate, GROUP_CONCAT(DISTINCT Features.name ORDER BY Features.name ASC SEPARATOR ', ')  as features FROM Trips LEFT JOIN Trip_Features ON Trips.tripID = Trip_Features.tripID LEFT JOIN Features ON Trip_Features.featureID = Features.featureID GROUP BY Trips.name;";
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
}

module.exports.displayTrips = displayTrips;


// Delete trip

function deleteTrip(req, res, next) {
    if(req.query.tripID) {

        let query = "DELETE FROM Trip_Features WHERE tripID = ?";

        pool.query(query, [req.query.tripID], function(err, result){
            if(err){
                next(err);
                return;
            }

            query = "DELETE FROM Trips WHERE tripID = ?";

            pool.query(query, [req.query.tripID], function(err, result) {
                if(err) {
                    next(err);
                    return;
                }

                displayTrips(req, res, next);
            });
        });
    }
    return;
}

module.exports.deleteTrip = deleteTrip;


// Display form details for customize trip page
function displayCustomizeTrip(req,res,next,context){
    if(!context) {
        let context = {pageTitle: 'Add or Edit Trip'};
    }

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

            res.render('customize-trip', context);

        });

    });
}

module.exports.displayCustomizeTrip = displayCustomizeTrip;

// Add a new trip
function addTrip(req, res, next) {
    let context = {pageTitle: 'Add Trip'};

    let query = "INSERT INTO Trips(name, city, country, price, startDate, endDate) VALUES(?, ?, ?, ?, ?, ?); ";

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
    
            displayCustomizeTrip(req, res, next, context);
            });
        } else {
            context.message = "Trip added successfully.";
            displayCustomizeTrip(req, res, next, context);
        }
    });
}

module.exports.addTrip = addTrip;

// Get details for edit page
function getEditDetails(req, res, next) {
    let context = {pageTitle: 'Edit Trip'};

    let query = "SELECT name, city, country, price, startDate, endDate FROM Trips WHERE tripID = ?";

    pool.query(query, [req.query.tripID], function(err, rows, fields){
        if(err) {
            next(err);
            return;
        }
        if(rows.length > 0) {
            context.tripDetails = rows[0];
        }

        query = "SELECT featureID FROM Trip_Features WHERE tripID = ?";

        pool.query(query, [req.query.tripID], function(err, rows, fields){
            if(err) {
                next(err);
                return;
            }
            context.featureDetails = rows;

            displayCustomizeTrip(req, res, next, context);
        });
    });

}

module.exports.getEditDetails = getEditDetails;