// Trips and Customize Trip Routes

// Required Modules
var mysql = require('mysql');
var pool = mysql.createPool(require('../logins.js'));

/*
DISPLAY TRIPS
Used on /trips page to show list of all available trips
*/
function displayTrips (req,res,next,context){
    context.pageTitle = 'Trips';

    let query = "";
    let queryArgs = [];

    // If the filter is active
    if(req.query.filter) {
        query = "SELECT trip_options.tripID, name, city, country, price, startDate, endDate, features FROM (SELECT Trips.tripID, Trips.name, Trips.city, Trips.country, Trips.price, Trips.startDate, Trips.endDate, GROUP_CONCAT(Features.name ORDER BY Features.name ASC SEPARATOR ', ') as features FROM Trips LEFT JOIN Trip_Features on Trip_Features.tripID = Trips.tripID LEFT JOIN Features on Features.featureID = Trip_Features.featureID GROUP BY Trips.name, Trips.tripID) AS trip_options JOIN (SELECT t.tripID, COUNT(*) as count FROM Trips AS t LEFT JOIN Trip_Features AS tf ON tf.tripID = t.tripID LEFT JOIN Features AS f ON f.featureID = tf.featureID WHERE ";

        // If no features were selected
        if(!req.query.feature) {
            query += " f.featureID IS NULL ";
            query += " GROUP BY t.tripID ";
        } 
        // else if features were selected
        else {
            // Get active features so filter selection persists
            context.filterActive = [];
            for(let i = 0; i < req.query.feature.length; i++) {
                context.filterActive.push(parseInt(req.query.feature[i]));
            }

            for(let i = 0; i < req.query.feature.length; i++) {
                queryArgs.push(req.query.feature[i]);
                query += " f.featureID = ? ";
    
                if(i < req.query.feature.length - 1) {
                    query += " OR ";
                }
            }
            query += " GROUP BY t.tripID HAVING count = ? ";
            queryArgs.push(req.query.feature.length);
        }
        
        query += " ) AS matching_Trips ON matching_Trips.tripID = trip_options.tripID;";

    } 
    // If no filter is active, show all trips
    else {
        query = "SELECT Trips.tripID, Trips.name, Trips.city, Trips.country, Trips.price, Trips.startDate, Trips.endDate, GROUP_CONCAT(Features.name ORDER BY Features.name ASC SEPARATOR ', ')  as features FROM Trips LEFT JOIN Trip_Features ON Trips.tripID = Trip_Features.tripID LEFT JOIN Features ON Trip_Features.featureID = Features.featureID GROUP BY Trips.name, Trips.tripID;";
    }

    pool.query(query, queryArgs, function(err, rows, fields) {
        if(err) { return next(); }
        context.tripList = rows;

        // Get list of features for filter list
        query = "SELECT Features.featureID, Features.name FROM Features;";

        pool.query(query, function(err, rows, fields) {
            if(err) { return next(); }
            context.featureList = rows;

            // Render the trips page
            res.render('trips', context);
        });
    });
}

module.exports.displayTrips = displayTrips;


/*
DELETE TRIP
Used on main /trips page when the delete button is clicked
*/
function deleteTrip(req, res, next) {

    let context = {};

    // If tripID present
    if(req.query.tripID) {

        // Delete from intersection table
        let query = "DELETE FROM Trip_Features WHERE tripID = ?";

        pool.query(query, [req.query.tripID], function(err, result){
            if(err) {
                context.errorMessage = "ERROR: Trip not deleted successfully.";

                // Call displayCustomizeTrip to render the page
                displayTrips(req, res, next, context);
                return;
            } 

            // Delete from main trips table
            query = "DELETE FROM Trips WHERE tripID = ?";

            pool.query(query, [req.query.tripID], function(err, result) {
                if(err) {
                    context.errorMessage = "ERROR: Trip not deleted successfully.";
                    // Call displayCustomizeTrip to render the page
                    displayTrips(req, res, next, context);
                    return;
                } 

                context.message = "Trip deleted successfully.";

                // Call displayTrips to render the page
                displayTrips(req, res, next, context);
            });
        });
    }
    return;
}

module.exports.deleteTrip = deleteTrip;


/*
DISPLAY THE CUSTOMIZE TRIP PAGE
Used on the /customize-trip page to show details including dropdowns, available features, etc.
This page is used both for update and add functionalities
*/
function displayCustomizeTrip(req,res,next,context){

    // If form submit action not specified, it should be "Add"
    if(!context.formAction) {
        context.formAction = 'Add';
    }

    // Get students who don't have a trip specified
    let query = "SELECT Students.studentID, Students.name FROM Students WHERE Students.trip IS NULL;";

    pool.query(query, function(err, rows, fields) {
        if(err) { return next(); }
        context.studentList = rows;

        // Get features for checkboxes
        query = "SELECT Features.featureID, Features.name FROM Features;";

        pool.query(query, function(err, rows, fields){
            if(err) { return next(); }
            context.featureList = rows;

            // Render the page
            res.render('customize-trip', context);

        });

    });
}

module.exports.displayCustomizeTrip = displayCustomizeTrip;

/*
ADD A TRIP
Called on /customize-trip page when the form is submitted to add a feature for the first time
Includes database queries which add features and update Students as needed
*/
function addTrip(req, res, next) {
    let context = {pageTitle: 'Add Trip'};

    // Add the trip to the main Trips table
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
            context.errorMessage = "ERROR: Trip not added successfully.";

            // Call displayCustomizeTrip to render the page
            displayCustomizeTrip(req, res, next, context);
            return;

        }

        let newTripID = result.insertId;

        // If feature AND student are selected
        if(req.query.feature && req.query.student) {
            let numTripFeatures = req.query.feature.length;
            let tripFeatValues = [];
            
            // Add to Trip_Features intersection table for M:M relationship
            query = "INSERT INTO Trip_Features(tripID, featureID) VALUES ";

            for(let i = 0; i < numTripFeatures; i++) {
                query += "(?, ?)";
                tripFeatValues.push(newTripID);
                tripFeatValues.push(parseInt(req.query.feature[i]));
                if(i < numTripFeatures - 1) {
                    query += ", ";
                }
            }
            query += ";";
            
            pool.query(query, tripFeatValues, function(err, result){
                if(err) {
                    context.errorMessage = "ERROR: Trip not added successfully.";

                    // Call displayCustomizeTrip to render the page
                    displayCustomizeTrip(req, res, next, context);
                    return;
                }

                let numStudents = req.query.student.length;
                let studentValues = [ newTripID ];
                
                // Update relevant student records to mark those students that are going on this trip
                query = "UPDATE Students SET trip = ? WHERE ";

                for(let i = 0; i < numStudents; i++) {
                    query += "studentID = ? ";
                    studentValues.push(parseInt(req.query.student[i]));
                    if(i < numStudents - 1) {
                        query += "OR ";
                    }
                }
                query += ";";
                
                pool.query(query, studentValues, function(err, result){
                    if(err) {
                        context.errorMessage = "ERROR: Trip not added successfully.";

                        // Call displayCustomizeTrip to render the page
                        displayCustomizeTrip(req, res, next, context);
                        return;
                    }

                    context.message = "Trip added successfully.";
            
                    // Call displayCustomizeTrip to render the page
                    displayCustomizeTrip(req, res, next, context);
                });
            });
        } 
        // If only features are selected
        else if(req.query.feature) {
            let numTripFeatures = req.query.feature.length;
            let tripFeatValues = [];
                    
            // Insert into Trip_Features intersection table
            query = "INSERT INTO Trip_Features(tripID, featureID) VALUES ";

            for(let i = 0; i < numTripFeatures; i++) {
                query += "(?, ?)";
                tripFeatValues.push(newTripID);
                tripFeatValues.push(parseInt(req.query.feature[i]));
                if(i < numTripFeatures - 1) {
                    query += ", ";
                }
            }
            query += ";";
            
            pool.query(query, tripFeatValues, function(err, result){
                if(err) {
                    context.errorMessage = "ERROR: Trip not added successfully.";

                    // Call displayCustomizeTrip to render the page
                    displayCustomizeTrip(req, res, next, context);
                    return;
                }

                context.message = "Trip added successfully.";
        
                // Call displayCustomizeTrip to render the page
                displayCustomizeTrip(req, res, next, context);
            });
        } 
        // Only students selected
        else if(req.query.student) {
            let numStudents = req.query.student.length;
            let studentValues = [ newTripID ];
            
            // Update students table to add selected trip to those records
            query = "UPDATE Students SET trip = ? WHERE ";

            for(let i = 0; i < numStudents; i++) {
                query += "studentID = ? ";
                studentValues.push(parseInt(req.query.student[i]));
                if(i < numStudents - 1) {
                    query += "OR ";
                }
            }
            query += ";";
            
            pool.query(query, studentValues, function(err, result){
                if(err) {
                    context.errorMessage = "ERROR: Trip not added successfully.";

                    // Call displayCustomizeTrip to render the page
                    displayCustomizeTrip(req, res, next, context);
                    return;
                }

                context.message = "Trip added successfully.";
        
                // Call displayCustomizeTrip to render the page
                displayCustomizeTrip(req, res, next, context);
            });
        } 
        // Neither students nor features selected, just render
        else {
            // Call displayCustomizeTrip to render the page
            context.message = "Trip added successfully.";
            displayCustomizeTrip(req, res, next, context);
        }
    });
}

module.exports.addTrip = addTrip;

/*
GET DETAILS FOR TRIP EDITING
Used on /customize-trip page when an existing trip is being edited
*/
function getEditDetails(req, res, next, context) {

    // Set up page title and form submission action accordingly
    context.pageTitle = 'Edit Trip';
    context.formAction = 'Update';
    context.tripID = req.query.tripID;
    
    // Get the existing values in the DB for this particular trip
    let query = "SELECT name, city, country, price, startDate, endDate FROM Trips WHERE tripID = ?";

    pool.query(query, [req.query.tripID], function(err, rows, fields){
        if(err) { return next(); }
        if(rows.length > 0) {
            context.tripDetails = rows[0];
        }

        // Get the existing features associated with this particular trip
        query = "SELECT featureID FROM Trip_Features WHERE tripID = ?";

        pool.query(query, [req.query.tripID], function(err, rows, fields){
            if(err) { return next(); }

            context.featuresSelected = [];
            for(let i = 0; i < rows.length; i++) {
                context.featuresSelected.push(rows[i].featureID);
            }

            // Call displayCustomizeTrip to render the page
            displayCustomizeTrip(req, res, next, context);
        });
    });

}

module.exports.getEditDetails = getEditDetails;

/*
UPDATE TRIP
Called after /customize-trip is used to edit an existing record
This function is used on submission to make changes to an existing trip record
*/
function updateTrip(req, res, next) {
    let context = {pageTitle: 'Edit Trip'};

    // Update the existing trip record with the new data
    let query = "UPDATE Trips SET name = ?, city = ?, country = ?, price = ?, startDate = ?, endDate = ? WHERE tripID = ?;";

    pool.query(query, [
    req.query.title,
    req.query.city,
    req.query.country,
    req.query.price,
    req.query.startDate,
    req.query.endDate,
    req.query.tripID
    ], function(err, result) {
        if(err) {
            context.errorMessage = "ERROR: Trip not updated successfully.";
                
            // Return to edit page so user can keep working
            getEditDetails(req, res, next, context);
            return;
        }

        // Delete all existing intersections in Trip_Features table
        query = "DELETE FROM Trip_Features WHERE tripID = ?;";

        pool.query(query, [req.query.tripID], function(err, result) {
            if(err) {
                context.errorMessage = "ERROR: Trip not updated successfully.";
                
                // Return to edit page so user can keep working
                getEditDetails(req, res, next, context);
                return;
            }

            // If features and students are selected
            if(req.query.feature && req.query.student) {
                let numTripFeatures = req.query.feature.length;
                let tripFeatValues = [];
                
                // Insert new associations into Trip_Features table
                query = "INSERT INTO Trip_Features(tripID, featureID) VALUES ";
                for(let i = 0; i < numTripFeatures; i++) {
                    query += "(?, ?)";
                    tripFeatValues.push(req.query.tripID);
                    tripFeatValues.push(parseInt(req.query.feature[i]));
                    if(i < numTripFeatures - 1) {
                        query += ", ";
                    }
                }
                query += ";";

                pool.query(query, tripFeatValues, function(err, result){
                    if(err) {
                        context.errorMessage = "ERROR: Trip not updated successfully.";
                
                        // Return to edit page so user can keep working
                        getEditDetails(req, res, next, context);
                        return;
                    }

                    let numStudents = req.query.student.length;
                    let studentValues = [ req.query.tripID ];
                    
                    // Update Students table to set appropriate trip
                    query = "UPDATE Students SET trip = ? WHERE ";
        
                    for(let i = 0; i < numStudents; i++) {
                        query += "studentID = ? ";
                        studentValues.push(parseInt(req.query.student[i]));
                        if(i < numStudents - 1) {
                            query += "OR ";
                        }
                    }
                    query += ";";
                    
                    pool.query(query, studentValues, function(err, result){
                        if(err) {
                            context.errorMessage = "ERROR: Trip not updated successfully.";
                
                            // Return to edit page so user can keep working
                            getEditDetails(req, res, next, context);
                            return;
                        }

                        context.message = "Trip updated successfully.";
                
                        // Return to edit page so user can keep working
                        getEditDetails(req, res, next, context);
                    });
                });
            }
            // If only features are selected
            else if(req.query.feature) {
                let numTripFeatures = req.query.feature.length;
                let tripFeatValues = [];
                        
                // Create new relationships in Trip_Features table
                query = "INSERT INTO Trip_Features(tripID, featureID) VALUES ";
    
                for(let i = 0; i < numTripFeatures; i++) {
                    query += "(?, ?)";
                    tripFeatValues.push(req.query.tripID);
                    tripFeatValues.push(parseInt(req.query.feature[i]));
                    if(i < numTripFeatures - 1) {
                        query += ", ";
                    }
                }
                query += ";";
                
                pool.query(query, tripFeatValues, function(err, result){
                    if(err) {
                        context.errorMessage = "ERROR: Trip not updated successfully.";
            
                        // Return to edit page so user can keep working
                        getEditDetails(req, res, next, context);
                        return;
                    }

                    context.message = "Trip updated successfully.";
            
                    // Return to edit page so user can keep working
                    getEditDetails(req, res, next, context);
                });
            } 
            // If only student is selected
            else if(req.query.student) {
                let numStudents = req.query.student.length;
                let studentValues = [ req.query.tripID ];
                    
                // Update student records to show existing trip
                query = "UPDATE Students SET trip = ? WHERE ";
    
                for(let i = 0; i < numStudents; i++) {
                    query += "studentID = ? ";
                    studentValues.push(parseInt(req.query.student[i]));
                    if(i < numStudents - 1) {
                        query += "OR ";
                    }
                }
                query += ";";
                
                pool.query(query, studentValues, function(err, result){
                    if(err) {
                        context.errorMessage = "ERROR: Trip not updated successfully.";
            
                        // Return to edit page so user can keep working
                        getEditDetails(req, res, next, context);
                        return;
                    }
                    
                    context.message = "Trip updated successfully.";
            
                    // Return to edit page so user can keep working
                    getEditDetails(req, res, next, context);
                });
            } 
            // Neither features nor students are selected
            else {
                context.message = "Trip updated successfully.";

                // Return to edit page so user can keep working
                getEditDetails(req, res, next, context);
            }
        });
    });
}

module.exports.updateTrip = updateTrip;