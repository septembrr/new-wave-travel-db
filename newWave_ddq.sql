--
-- Table structure for table `staff`
--

DROP TABLE IF EXISTS Staff;

CREATE TABLE Staff (
  staffID int(11) PRIMARY KEY NOT NULL AUTO_INCREMENT,
  name varchar(255) NOT NULL,
  phone varchar(20),
  email varchar(255) NOT NULL,
  type varchar(255) NOT NULL
)ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;

--
-- Dumping data for table `staff`
--

INSERT INTO Staff(name, phone, email, type) VALUES 
('Annie McGrath','503-228-9456','mcgrathA@newwaveagency.com','Travel Agent'),
('George Ruffe','503-228-4537','ruffeG@newwaveagency.com','Student Counselor'),
('Dolores Stevens','503-228-1609','stevensD@newwaveagency.com','Administrator');

--
-- Table structure for table `trips`
--

DROP TABLE IF EXISTS Trips;

CREATE TABLE Trips (
  tripID int(11) PRIMARY KEY NOT NULL AUTO_INCREMENT,
  name varchar(255) UNIQUE NOT NULL,
  city varchar(255) NOT NULL,
  country varchar(20) NOT NULL,
  price float(11) NOT NULL,
  startDate date NOT NULL,
  endDate date NOT NULL
)ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;

--
-- Dumping data for table `trips`
--

INSERT INTO Trips(name, city, country, price, startDate, endDate) VALUES 
('Paris Art Study','Paris','France',3000.00,'2020-03-03','2020-06-15'),
('Himalaya Trek','Kathmandu','Nepal',5000.00,'2020-11-03','2020-12-15'),
('Food of Italy','Rome','Italy',4500.00,'2020-05-16','2020-07-02');

--
-- Table structure for table `students`
--

DROP TABLE IF EXISTS Students;

CREATE TABLE Students (
  studentID int(11) PRIMARY KEY NOT NULL AUTO_INCREMENT,
  name varchar(255) NOT NULL,
  university varchar(255) NOT NULL,
  phone varchar(20),
  email varchar(255),
  trip int(11),
  staff int(11),
  FOREIGN KEY (trip) REFERENCES Trips (tripID) ON DELETE SET NULL ON UPDATE CASCADE,
  FOREIGN KEY (staff) REFERENCES Staff (staffID) ON DELETE SET NULL ON UPDATE CASCADE
)ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;

--
-- Dumping data for table `students`
--

INSERT INTO Students(name, university, phone, email, trip, staff) VALUES 
('Kayden Hauften','Oregon State University','541-766-8315','HaufteK@osu.edu',3,2),
('Cathy Fields','University of Oregon','541-229-5294','Cathy.Fields@gmail.com',2,2),
('Jeremy Inglemoor','Portland State University','503-635-9002','InglJe@pdx.edu',1,1);

--
-- Table structure for table `features`
--

DROP TABLE IF EXISTS Features;

CREATE TABLE Features (
  featureID int(11) PRIMARY KEY NOT NULL AUTO_INCREMENT,
  name varchar(255) UNIQUE NOT NULL
)ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;

--
-- Dumping data for table `features`
--

INSERT INTO Features(name) VALUES 
('Homestay'),
('Outdoors'),
('Internship');

--
-- Table structure for table `trip_features`
--

DROP TABLE IF EXISTS Trip_Features;

CREATE TABLE Trip_Features (
  tripID int(11) NOT NULL,
  featureID int(11) NOT NULL,
  PRIMARY KEY (tripID,featureID),
  FOREIGN KEY (tripID) REFERENCES Trips (tripID) ON UPDATE CASCADE,
  FOREIGN KEY (featureID) REFERENCES Features (featureID) ON UPDATE CASCADE
)ENGINE=InnoDB AUTO_INCREMENT=1 DEFAULT CHARSET=utf8;

--
-- Dumping data for table `trip_features`
--

INSERT INTO Trip_Features(tripID, featureID) VALUES 
(1,1),
(2,2),
(3,1),
(3,3);