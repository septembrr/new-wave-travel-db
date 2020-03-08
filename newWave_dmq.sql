-- Database Manipulation Queries
-- CS340, Group 5
-- New Wave Travel Agency

-- get all Students, including Staff and trip if applicable, for the Students page
SELECT Students.studentID, Students.name AS studentName, Students.university, Students.phone, Students.email, Trips.name AS tripsName, Staff.name AS staffName 
    FROM Students 
    LEFT JOIN Trips ON Students.trip = Trips.tripID 
    LEFT JOIN Staff ON Students.staff = Staff.staffID;

-- get information for a single student, including staff and trip if applicable, for customize-student page.
SELECT Students.studentID, Students.name AS studentName, Students.university, Students.phone, Students.email, Students.staff, Students.trip, Trips.name AS tripsName, Staff.name AS staffName 
    FROM Students 
    LEFT JOIN Trips ON Students.trip = Trips.tripID 
    LEFT JOIN Staff ON Students.staff = Staff.staffID 
    WHERE Students.studentID = :student_ID_input;

-- get all Staff for the Staff page
SELECT Staff.name, Staff.phone, Staff.email, Staff.type FROM Staff;

-- populate dropdown on Add or Update Student page
SELECT Staff.staffID, Staff.name FROM Staff;

-- get all Trips, including applicable Features, for the Trips page
SELECT Trips.tripID, Trips.name, Trips.city, Trips.country, Trips.price, Trips.startDate, Trips.endDate, GROUP_CONCAT(DISTINCT Features.name ORDER BY Features.name ASC SEPARATOR ', ') as features
   FROM Trips
   LEFT JOIN Trip_Features ON Trips.tripID = Trip_Features.tripID
   LEFT JOIN Features ON Trip_Features.featureID = Features.featureID
   GROUP BY Trips.name, Trips.tripID;

-- get trip details for use to Edit Trip page
SELECT name, city, country, price, startDate, endDate FROM Trips WHERE tripID = :trip_you_are_editing;

-- get all Features, and their applicable Trips, for the Features page
SELECT Features.featureID, Features.name, GROUP_CONCAT(Trips.name ORDER BY Trips.name ASC SEPARATOR ', ') as trips
    FROM Features
    LEFT JOIN Trip_Features ON Features.featureID = Trip_Features.featureID
    LEFT JOIN Trips ON Trip_Features.tripID = Trips.tripID
    GROUP BY Features.name, Features.featureID;

-- get list of features for add trip dropdown
-- get list of features for filter list on browse trips page
SELECT Features.featureID, Features.name FROM Features;

-- Get list of selected features for Update trip features checkboxes
SELECT featureID FROM Trip_Features WHERE tripID = :trip_id_currently_editing;

-- get a single trip's data for the Update Trip form
SELECT Trips.name, Trips.city, Trips.country, Trips.price, Trips.startDate, Trips.endDate, Features.name 
   FROM Trips
   WHERE Trips.tripID = :trip_ID_input;

SELECT Features.name 
    FROM Features
    JOIN Trip_Features ON Features.featureID = Trip_Features.featureID
    JOIN Trips ON Trip_Features.tripID = Trips.tripID
    WHERE Trips.tripID = :trip_ID_input;

-- get all Trips, used to populate dropdowns on Add or Update Students page
-- also used to populate list of Trips to add feature to on Add Feature page
SELECT Trips.tripID, Trips.name FROM Trips;

-- get list of Students not assigned to Trips, for use on Add or update Trips page
SELECT Students.studentID, Students.name FROM Students WHERE Students.trip IS NULL;

-- get list of Trips based on selection of filter
SELECT trip_options.tripID, name, city, country, price, startDate, endDate, features FROM
    (SELECT Trips.tripID, Trips.name, Trips.city, Trips.country, Trips.price, Trips.startDate, Trips.endDate, GROUP_CONCAT( Features.name ORDER BY Features.name ASC SEPARATOR ', ') as features FROM Trips 
    LEFT JOIN Trip_Features on Trip_Features.tripID = Trips.tripID 
    LEFT JOIN Features on Features.featureID = Trip_Features.featureID 
    GROUP BY Trips.name, Trips.tripID) 
AS trip_options 
JOIN 
    (SELECT t.tripID COUNT(*) as count FROM Trips AS t 
    LEFT JOIN Trip_Features AS tf ON tf.tripID = t.tripID 
    LEFT JOIN Features AS f ON f.featureID = tf.featureID 
    WHERE f.featureID = :featureID_selected_filter OR f.featureID = :featureID_selected_filter_2
    GROUP BY t.tripID
    HAVING count = :input_number_of_filter_selections) 
AS matching_Trips ON matching_Trips.tripID = trip_options.tripID;

-- insert new student
INSERT INTO Students(name, university, phone, email, trip, staff) VALUES(:name_input, :university_input, :phone_input, :email_input, :tripID_input_from_dropdown, :StaffID_input_from_dropdown);

-- insert new Trip
INSERT INTO Trips(name, city, country, price, startDate, endDate) VALUES(:name_input, :city_input, :country_input, :price_input, :startDate_input_formatted_yyyy-mm-dd, :endDate_input_formatted_yyyy-mm-dd);

-- insert new Feature
INSERT INTO Features(name) VALUES(:name_input);

-- associate a trip with a feature
INSERT INTO Trip_Features(tripID, featureID) VALUES(:tripID_input_after_trip_creation, :featuredID_input_from_checkbox), (:tripID_input2_after_trip_creation, :featuredID_input2_from_checkbox);

-- insert new Staff member
INSERT INTO Staff(name, phone, email, type) VALUES(:name_input, :phone_input, :email_input, :type_input);

-- delete one trip
DELETE FROM Trips WHERE tripID = :tripID_input_selected_in_form;

-- delete one feature
DELETE FROM Features WHERE featureID = :featureID_input_selected;

-- remove an association of a trip and feature
-- executed when Trips are edited and a feature is removed
DELETE FROM Trip_Features WHERE tripID = :tripID_input_currently_editing;

-- executed when Feature is deleted from Features page
DELETE FROM Trip_Features WHERE featureID = :featureID_input_selected;

-- update a student based on submission from update student form
UPDATE Students SET name = :name_input, university = :university_input, phone = :phone_input, email = :email_input, trip = :tripID_input_selected, Staff = :StaffID_input_selected) WHERE studentID = :studentID_input_being_edited;
-- if no trip or Staff selected, that part of the query would be left out.

-- update a trip based on submission from update trip form
UPDATE Trips SET name = :name_input, city = :city_input, country = :country_input, price = :price_input, startDate = :startDate_input, endDate = :endDate_input WHERE tripID = :tripID_input_selected;
-- will execute the remove trip and feature association query, and then re-add the trip associations

-- update a student based on a trip added from the Update Trips page
UPDATE Students SET trip = :tripID_selected_in_trip_form WHERE studentID = :studentID_input_selected OR studentID = :studentID_input_selected_2;