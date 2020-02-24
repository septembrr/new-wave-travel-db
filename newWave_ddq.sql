--
-- Table structure for table `staff`
--

DROP TABLE IF EXISTS `staff`;

CREATE TABLE `staff` (
  `staffID` int(11) NOT NULL UNIQUE AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `phone` varchar(20),
  `email` varchar(255) NOT NULL,
  `type` varchar(255) NOT NULL,
  PRIMARY KEY (`staffID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `staff`
--

INSERT INTO `staff` VALUES 
(1,`Annie McGrath`,`503-228-9456`,`mcgrathA@newwaveagency.com`,`Travel Agent`),
(2,`George Ruffe`,`503-228-4537`,`ruffeG@newwaveagency.com`,`Student Counselor`),
(3,`Dolores Stevens`,`503-228-1609`,`stevensD@newwaveagency.com`,`Administrator`);

--
-- Table structure for table `students`
--

DROP TABLE IF EXISTS `students`;

CREATE TABLE `students` (
  `studentID` int(11) NOT NULL UNIQUE AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `university` varchar(255) NOT NULL,
  `phone` varchar(20),
  `email` varchar(255),
  `trip` int(11),
  `staff` int(11),
  PRIMARY KEY (`studentID`),
  CONSTRAINT `students_fk_1` FOREIGN KEY (`trip`) REFERENCES `trips` (`tripID`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `students_fk_2` FOREIGN KEY (`staff`) REFERENCES `staff` (`staffID`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `students`
--

INSERT INTO `students` VALUES 
(1,`Kayden Hauften`,`Oregon State University`,`541-766-8315`,`HaufteK@osu.edu`,2,3),
(2,`Cathy Fields`,`University of Oregon`,`541-229-5294`,`Cathy.Fields@gmail.com`,2,2),
(3,`Jeremy Inglemoor`,`Portland State University`,`503-635-9002`,`InglJe@pdx.edu`,1,1);

--
-- Table structure for table `trips`
--

DROP TABLE IF EXISTS `trips`;

CREATE TABLE `trips` (
  `tripID` int(11) NOT NULL UNIQUE AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `city` varchar(255) NOT NULL,
  `country` varchar(20) NOT NULL,
  `price` float(11) NOT NULL,
  `startDate` date NOT NULL,
  `endDate` date NOT NULL,
  PRIMARY KEY (`tripID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `trips`
--

INSERT INTO `trips` VALUES 
(1,`Paris Art Study`,`Paris`,`France`,3000.00,2020-03-03,2020-06-15),
(2,`Himalaya Trek`,`Kathmandu`,`Nepal`,5000.00,2020-11-03,2020-12-15),
(3,`Food of Italy`,`Rome`,`Italy`,4500.00,2020-05-16,2020-07-02);

--
-- Table structure for table `features`
--

DROP TABLE IF EXISTS `features`;

CREATE TABLE `features` (
  `featureID` int(11) NOT NULL UNIQUE AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  PRIMARY KEY (`featureID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `features`
--

INSERT INTO `features` VALUES 
(1,`Homestay`),
(2,`Outdoors`),
(3,`Internship`);

--
-- Table structure for table `trip_features`
--

DROP TABLE IF EXISTS `trip_features`;

CREATE TABLE `trip_features` (
  `tripID` int(11) NOT NULL,
  `featureID` int(11) NOT NULL,
  PRIMARY KEY (`tripID`,`featureID`),
  CONSTRAINT `trip_features_fk_1` FOREIGN KEY (`tripID`) REFERENCES `trips` (`tripID`) ON DELETE SET NULL ON UPDATE CASCADE,,
  CONSTRAINT `trip_features_fk_2` FOREIGN KEY (`featureID`) REFERENCES `features` (`featureID`)  ON DELETE SET NULL ON UPDATE CASCADE,
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Dumping data for table `trip_features`
--

INSERT INTO `trip_features` VALUES 
(1,1),
(2,2),
(3,1),
(3,3);