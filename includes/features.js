// Features and Customize Features Routes

// Required modules
var mysql = require('mysql');
var pool = mysql.createPool(require('../logins.js'));

/*
DISPLAY FEATURES
Shows list of features and their associated trips on the main Features list page
*/
function displayFeatures(req,res,next, context){
    context.pageTitle = 'Features';

    // Quey all features
    let selectQuery = "SELECT Features.featureID, Features.name, GROUP_CONCAT(Trips.name ORDER BY Trips.name ASC SEPARATOR ', ') as trips FROM Features LEFT JOIN Trip_Features ON Features.featureID = Trip_Features.featureID LEFT JOIN Trips ON Trip_Features.tripID = Trips.tripID GROUP BY Features.name, Features.featureID;";

    pool.query(selectQuery, function(err, rows, fields) {
        if(err) { return next(); }

        // Render feature list
        context.featureList = rows;
        res.render('features', context);
    });
}

module.exports.displayFeatures = displayFeatures;

/*
DELETE FEATURE
Delete a feature on the Features page
*/
function deleteFeature(req, res, next) {
    let context = {};

    // Delete associated intersection table rows from Trip_Features
    let query = "DELETE FROM Trip_Features WHERE featureID = ?;";

    pool.query(query, [req.query.featureID], function(err, result) {
        if(err) {
            context.errorMessage = "ERROR: Feature not deleted successfully.";

            // Call displayFeatures to render the page
            displayFeatures(req, res, next, context);
            return;
        }

        // Delete actual feature from Features table
        query = "DELETE FROM Features WHERE featureID = ?;";
    
        pool.query(query, [req.query.featureID], function(err, result) {
            if(err) {
                context.errorMessage = "ERROR: Feature not deleted successfully.";

                // Call displayFeatures to render the page
                displayFeatures(req, res, next, context);
                return;
            }

            context.message = "Feature deleted successfully.";

            // Call displayFeatures to render the page
            displayFeatures(req, res, next, context);
        });
    });
}

module.exports.deleteFeature = deleteFeature;

/*
SHOW THE CUSTOMIZE FEATURE PAGE
For display of the form on the /customize-feature page, show list of Trips
*/
function displayCustomizeFeature (req,res,next,context){
    context.pageTitle = 'Add Feature';

    // Get list of available trips
    let selectQuery = "SELECT Trips.tripID, Trips.name FROM Trips;";

    pool.query(selectQuery, function(err, rows, fields) {
        if(err) { return next(); }

        context.tripList = rows;

        // Render page
        res.render('customize-feature', context);
    });
    
}

module.exports.displayCustomizeFeature = displayCustomizeFeature;

/*
ADD FEATURE
After submission on /customize-feature page
Adding feature to Features table and to Trip_Features intersection table
*/
function addFeature(req, res, next) {
    let context = {};

    // Add new feature to Features table
    let insertQuery = "INSERT INTO Features(name) VALUES(?);";

    pool.query(insertQuery, [req.query.name], function(err, result) {
        if(err) {
            context.errorMessage = "ERROR: Feature not added successfully.";
        
            // Call displayFeatures to render the page
            displayFeatures(req, res, next, context);
            return;
        }

        // If feature added to any trips
        if(req.query.trip) {
            let numTripFeatures = req.query.trip.length;
            let tripFeatValues = [];
            
            // Add relationships in Trip_Features intersection table
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
                    context.errorMessage = "ERROR: Feature not added successfully.";
    
                    // Call displayFeatures to render the page
                    displayFeatures(req, res, next, context);
                    return;
                }

                context.message = "Feature added successfully.";
        
                // Render the page by calling displayCustomizeFeature
                displayCustomizeFeature(req, res, next, context);
            });
        } 
        // If feature isn't added to any trips
        else {
            context.message = "Feature added successfully.";

            // Render the page by calling displayCustomizeFeature
            displayCustomizeFeature(req, res, next, context);
        }
    });
}

module.exports.addFeature = addFeature;