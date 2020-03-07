// Features and Customize Features Routes

// Required modules
var mysql = require('mysql');
var pool = mysql.createPool(require('../logins.js'));

// Features
function displayFeatures(req,res,next, context){
    context.pageTitle = 'Features';

    let selectQuery = "SELECT Features.featureID, Features.name, GROUP_CONCAT(Trips.name ORDER BY Trips.name ASC SEPARATOR ', ') as trips FROM Features LEFT JOIN Trip_Features ON Features.featureID = Trip_Features.featureID LEFT JOIN Trips ON Trip_Features.tripID = Trips.tripID GROUP BY Features.name, Features.featureID;";

    pool.query(selectQuery, function(err, rows, fields) {
        if(err) {
            next(err);
            return;
        }

        context.featureList = rows;
        res.render('features', context);
    });
}

module.exports.displayFeatures = displayFeatures;

// Delete features
function deleteFeature(req, res, next) {
    let context = {};

    let query = "DELETE FROM Trip_Features WHERE featureID = ?;";

    pool.query(query, [req.query.featureID], function(err, result) {
        if(err) {
            next(err);
            return;
        }

        query = "DELETE FROM Features WHERE featureID = ?;";
    
        pool.query(query, [req.query.featureID], function(err, result) {
            if(err) {
                next(err);
                return;
            }
    
            context.message = "Feature deleted successfully.";

            displayFeatures(req, res, next, context);
        });
    });
}

module.exports.deleteFeature = deleteFeature;

// Customize Features
function customizeFeatures (req,res,next){
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

}

module.exports.customizeFeatures = customizeFeatures;