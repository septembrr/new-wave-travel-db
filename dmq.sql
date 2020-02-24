-- Database Manipulation Queries
-- CS340, Group 5
-- New Wave Travel Agency

-- get all students, including staff and trip if applicable, for the Students page


-- get all staff for the Staff page
-- also used to populate dropdown on Add or Update Student page


-- get all trips, including applicable Features, for the Trips page


-- get all features, and their applicable trips, for the Features page
-- also used to populate list of Features on Browse Trips page
-- alos used to populate list on Add or Update Trips page


-- get a single trip's data for the Update Trip form


-- get all trips, used to populate dropdowns on Add or Update Students page
-- also used to populate list of trips to add feature to on Add Feature page


-- get list of students not assigned to trips, for use on Add or update trips page


-- get list of trips based on selection of filter
SELECT name, city, country, price, startDate, endDate, features FROM
    (SELECT Trips.tripID, Trips.name, Trips.city, Trips.country, Trips.price, Trips.startDate, Trips.endDate, GROUP_CONCAT(DISTINCT Features.name) as features FROM Trips 
    JOIN Trip_Features on Trip_Features.tripID = Trips.tripID 
    JOIN Features on Features.featureID = Trip_Features.featureID 
    GROUP BY Trips.name) 
AS trip_options 
JOIN 
    (SELECT t.tripID FROM Trips AS t 
    JOIN Trip_Features AS tf ON tf.tripID = t.tripID 
    JOIN Features AS f ON f.featureID = tf.featureID 
    WHERE f.featureID = :featureID_selected_filter AND f.featureID = :featureID_selected_filter_2) 
AS matching_trips ON matching_trips.tripID = trip_options.tripID;

-- insert new student
INSERT INTO Students(name, university, phone, email, trip, staff) VALUES(:name_input, :university_input, :phone_input, :email_input, :tripID_input_from_dropdown, :staffID_input_from_dropdown);

-- insert new Trip
INSERT INTO Trips(name, city, country, price, startDate, endDate) VALUES(:name_input, :city_input, :country_input, :price_input, :startDate_input_formatted_yyyy-mm-dd, :endDate_input_formatted_yyyy-mm-dd);

-- insert new Feature
INSERT INTO Features(name) VALUES(:name_input);

-- associate a trip with a feature
INSERT INTO Trip_Features(tripID, featureID) VALUES(:tripID_input_after_trip_creation, :featuredID_input_from_checkbox), (:tripID_input2_after_trip_creation, :featuredID_input2_from_checkbox);

-- insert new staff member
INSERT INTO Staff(name, phone, email, type) VALUES(:name_input, :phone_input, :email_input, :type_input);

-- delete one trip
DELETE FROM Trips WHERE tripID = :tripID_input_selected_in_form;

-- remove an association of a trip and feature
-- executed when trips are edited and a feature is removed
DELETE FROM Trip_Features WHERE tripID = :tripID_input_currently_editing AND featureID = :featureID_input;

-- update a student based on submission from update student form
UPDATE TABLE Students SET name = :name_input, university = :university_input, phone = :phone_input, email = :email_input, trip = :tripID_input_selected, staff = :staffID_input_selected);
-- if no trip or staff selected, that part of the query would be left out.

-- update a trip based on submission from update trip form
UPDATE TABLE Trips SET name = :name_input, city = :city_input, country = :country_input, price = :price_input, startDate = :startDate_input, endDate = :endDate_input WHERE tripID = :tripID_input_selected;
-- will execute the remove trip and feature association query, and then re-add the trip associations