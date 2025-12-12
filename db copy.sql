-- phpMyAdmin SQL Dump
-- version 5.2.3
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Dec 09, 2025 at 06:49 PM
-- Server version: 8.0.43
-- PHP Version: 8.3.26

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

--
-- Database: `a94932ta`
--

DELIMITER $$
--
-- Procedures
--
CREATE DEFINER=`a94932ta`@`localhost` PROCEDURE `cleanup_old_terminations` ()   BEGIN
    DECLARE v_deleted_count INT DEFAULT 0;
    DECLARE v_cutoff_date DATE;
    
    -- Calculate cutoff date (3 years ago from today)
    SET v_cutoff_date = DATE_SUB(CURDATE(), INTERVAL 3 YEAR);
    
    -- Delete records older than 3 years
    DELETE FROM CONTRACT_TERMINATIONS
    WHERE Termination_Date < v_cutoff_date;
    
    -- Get count of deleted records
    SET v_deleted_count = ROW_COUNT();
    
    -- Return summary
    SELECT 
        v_deleted_count as Records_Deleted,
        v_cutoff_date as Cutoff_Date,
        CURDATE() as Cleanup_Date,
        'GDPR Compliance: Records older than 3 years removed' as Message;
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `ADDRESSES`
--

CREATE TABLE `ADDRESSES` (
  `Address_ID` int NOT NULL,
  `Address_Name` enum('HOME','OFFICE','OTHER') DEFAULT 'HOME',
  `Address_Description` varchar(500) NOT NULL,
  `Address_Line` varchar(350) NOT NULL,
  `Address_Region` enum('England North','England South','England Central','Wales','Scotland','Northern Ireland','Other') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `COMPANY_POSITIONS`
--

CREATE TABLE `COMPANY_POSITIONS` (
  `Company_Position_ID` int NOT NULL,
  `Company_Position_Title` varchar(75) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `Department_Name` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

--
-- Dumping data for table `COMPANY_POSITIONS`
--

INSERT INTO `COMPANY_POSITIONS` (`Company_Position_ID`, `Company_Position_Title`, `Department_Name`) VALUES
(1, 'CEO', 'Executives'),
(2, 'PA', 'Executives'),
(3, 'COO', 'Executives'),
(4, 'CFO', 'Executives'),
(5, 'CTO', 'Executives'),
(6, 'CMO', 'Executives'),
(7, 'Health & Safety Officer', 'Operations'),
(8, 'Factory Worker', 'Operations'),
(9, 'Delivery Driver', 'Operations'),
(10, 'Accountant', 'Finance'),
(11, 'Financial Analyst', 'Finance'),
(12, 'Brand Developer', 'Marketing'),
(13, 'Industry Researcher', 'Marketing'),
(14, 'Product Designer', 'Marketing'),
(15, 'Front End Developer', 'Technology'),
(16, 'Back End Developer', 'Technology'),
(17, 'Full Stack Developer', 'Technology'),
(18, 'Junior Developer', 'Technology'),
(19, 'Cyber Security', 'Technology');

-- --------------------------------------------------------

--
-- Table structure for table `CONTRACT_TERMINATIONS`
--

CREATE TABLE `CONTRACT_TERMINATIONS` (
  `Termination_ID` int NOT NULL,
  `Original_Employee_ID` int NOT NULL,
  `Employee_Full_Name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `Company_Position_Title` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Department_Name` varchar(50) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Office_Name` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Employee_Salary` decimal(10,2) DEFAULT NULL,
  `Employee_Date_Of_Hire` date DEFAULT NULL,
  `Employee_Contract` enum('Full-Time','Part-Time','Freelance','Internship') CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Email_Address` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Date_Of_Birth` date DEFAULT NULL,
  `Home_Address` varchar(75) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Identification_Number_NiN` varchar(9) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Termination_Reason` text CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  `Termination_Date` date NOT NULL,
  `Termination_Time` time NOT NULL,
  `Terminated_By` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `Created_At` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `CONTRACT_TERMINATIONS`
--

INSERT INTO `CONTRACT_TERMINATIONS` (`Termination_ID`, `Original_Employee_ID`, `Employee_Full_Name`, `Company_Position_Title`, `Department_Name`, `Office_Name`, `Employee_Salary`, `Employee_Date_Of_Hire`, `Employee_Contract`, `Email_Address`, `Date_Of_Birth`, `Home_Address`, `Identification_Number_NiN`, `Termination_Reason`, `Termination_Date`, `Termination_Time`, `Terminated_By`, `Created_At`) VALUES
(1, 45862035, 'Alyssa Ramon', 'Back End Developer', 'Technology', 'Birmingham Office for Kilburnazon', 40950.00, '2019-02-12', 'Full-Time', 'Alyssa.Ramon@kilburnazon.com', '2001-06-09', '6945 Logan Street', 'QQ123456B', 'Resignation', '2025-12-09', '18:08:25', 'HR Manager', '2025-12-09 18:08:25'),
(2, 28987119, 'Tansi Ajit', 'Front End Developer', 'Technology', 'England North Distribution Centre', 20000.00, '2025-12-09', 'Full-Time', 'Tansi.Ajit@kilburnazon.com', '2004-07-16', '1242 Richmond Park', 'GBA231821', 'Resignation', '2025-12-09', '18:42:54', 'HR Manager', '2025-12-09 18:42:54');

--
-- Triggers `CONTRACT_TERMINATIONS`
--
DELIMITER $$
CREATE TRIGGER `after_termination_insert` AFTER INSERT ON `CONTRACT_TERMINATIONS` FOR EACH ROW BEGIN
    INSERT INTO EMPLOYEE_AUDIT(employee_id, action, new_value, changed_by, changed_at)
    VALUES (NEW.Original_Employee_ID, 'Termination', CONCAT('Employee terminated on ', NEW.Termination_Date, ' - Reason: ', NEW.Termination_Reason), IFNULL(NEW.Terminated_By, 'SYSTEM'), NOW());
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `CUSTOMERS`
--

CREATE TABLE `CUSTOMERS` (
  `Customer_ID` int NOT NULL,
  `Customer_Full_Name` varchar(100) NOT NULL,
  `Customer_Email_Address` varchar(100) NOT NULL,
  `Address_ID` int NOT NULL,
  `Customer_Payment_Details` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `CUSTOMER_ADDRESSES`
--

CREATE TABLE `CUSTOMER_ADDRESSES` (
  `Customer_ID` int NOT NULL,
  `Address_ID` int NOT NULL,
  `Default_Address` tinyint(1) DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `CUSTOMER_ORDERS`
--

CREATE TABLE `CUSTOMER_ORDERS` (
  `Order_ID` int NOT NULL,
  `Customer_ID` int NOT NULL,
  `Order_Date` datetime NOT NULL,
  `Confirmation_Email` tinyint(1) NOT NULL DEFAULT '0',
  `Address_ID` int NOT NULL,
  `Status` enum('Processing','Confirmed','In Transit','Dispatched','Delivered') NOT NULL DEFAULT 'Processing'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `CUSTOMER_PAYMENT_DETAILS`
--

CREATE TABLE `CUSTOMER_PAYMENT_DETAILS` (
  `Payment_ID` int NOT NULL,
  `Payment_Method` enum('Credit Card','Debit Card','PayPal','Bank Transfer') NOT NULL,
  `Card_Details` varchar(16) DEFAULT NULL,
  `Expiry_Date` date DEFAULT NULL,
  `CVV` char(3) DEFAULT NULL,
  `Bank_Account` varchar(20) DEFAULT NULL,
  `Bank_Routing_Number` varchar(20) DEFAULT NULL,
  `Is_Incomplete` tinyint(1) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `DELIVERY`
--

CREATE TABLE `DELIVERY` (
  `Delivery_ID` int NOT NULL,
  `Order_ID` int NOT NULL,
  `Employee_ID` int NOT NULL,
  `Vehicle_ID` int NOT NULL,
  `Expected_Arrival` datetime NOT NULL,
  `Delivered` datetime DEFAULT NULL,
  `Collected_By` varchar(100) DEFAULT 'has not been collected'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `DEPARTMENTS`
--

CREATE TABLE `DEPARTMENTS` (
  `Department_Name` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `Executive_ID` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

--
-- Dumping data for table `DEPARTMENTS`
--

INSERT INTO `DEPARTMENTS` (`Department_Name`, `Executive_ID`) VALUES
('Executives', 11123211),
('Technology', 11223214),
('Marketing', 11224403),
('Finance', 11226496),
('Operations', 11229804);

-- --------------------------------------------------------

--
-- Table structure for table `EMPLOYEES`
--

CREATE TABLE `EMPLOYEES` (
  `Employee_ID` int NOT NULL,
  `Employee_Full_Name` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `Company_Position_ID` int NOT NULL,
  `Employee_Salary` int DEFAULT NULL,
  `Office_ID` int NOT NULL,
  `Employee_Date_Of_Hire` date NOT NULL,
  `Employee_Contract` enum('Full-Time','Part-Time','Freelance','Internship') CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `Employee_Status` enum('Active','On Leave') CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `Email_Address` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `Date_Of_Birth` date NOT NULL,
  `Home_Address` varchar(75) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `Identification_Number_NiN` varchar(9) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `EMPLOYEES`
--

INSERT INTO `EMPLOYEES` (`Employee_ID`, `Employee_Full_Name`, `Company_Position_ID`, `Employee_Salary`, `Office_ID`, `Employee_Date_Of_Hire`, `Employee_Contract`, `Employee_Status`, `Email_Address`, `Date_Of_Birth`, `Home_Address`, `Identification_Number_NiN`) VALUES
(1221908, 'Lock McCurrie', 8, 26375, 5, '2022-07-19', 'Full-Time', 'Active', 'Lock.McCurrie@kilburnazon.com', '2004-07-21', '25218 Eastlawn Terrace', 'PU212720A'),
(11123211, 'Elon Bazos', 1, NULL, 7, '2014-02-15', 'Full-Time', 'Active', 'Elon.Bazos@kilburnazon.com', '1974-04-12', '534 Moulton Avenue', 'RE885173B'),
(11214682, 'Jarvis Kare', 2, 75000, 7, '2015-11-16', 'Full-Time', 'Active', 'Jarvis.Kare@kilburnazon.com', '1981-03-06', '75631 Hazelcrest Court', 'DF625255C'),
(11223214, 'Sarah Turing', 5, NULL, 7, '2017-12-02', 'Full-Time', 'Active', 'Sarah.Turing@kilburnazon.com', '1977-08-23', '462 Westerfield Road', 'LQ649084C'),
(11224403, 'Steve Hopper', 6, NULL, 7, '2015-11-11', 'Full-Time', 'Active', 'Steve.Hopper@kilburnazon.com', '1986-08-27', '21917 Forest Place', 'BG154525C'),
(11226496, 'Jeff Lovelace', 4, NULL, 7, '2016-07-16', 'Full-Time', 'Active', 'Jeff.Lovelace@kilburnazon.com', '1976-12-15', '2 Waubesa Terrace', 'SY194109A'),
(11229804, 'Tracey Gates', 3, NULL, 7, '2017-07-26', 'Full-Time', 'Active', 'Tracey.Gates@kilburnazon.com', '1977-10-26', '29916 Elmside Center', 'AN593683D'),
(12112639, 'Aurilia Dove', 7, 23283, 1, '2023-03-05', 'Full-Time', 'Active', 'Aurilia.Dove@kilburnazon.com', '1998-09-27', '1 Corry Court', 'MZ652678D'),
(12113666, 'Edythe Colisbe', 7, 27512, 3, '2019-07-04', 'Full-Time', 'Active', 'Edythe.Colisbe@kilburnazon.com', '2008-07-04', '7244 Northland Alley', 'MO232288B'),
(12212092, 'Arleyne Cherm', 8, 24478, 1, '2018-10-10', 'Full-Time', 'Active', 'Arleyne.Cherm@kilburnazon.com', '1993-04-07', '48 Buhler Hill', 'ZD863526A'),
(12212831, 'Cobb Ricart', 8, 26642, 1, '2020-05-10', 'Full-Time', 'Active', 'Cobb.Ricart@kilburnazon.com', '1987-01-22', '04195 Gale Plaza', 'JV246199D'),
(12213598, 'Wendye Lightbown', 8, 29448, 2, '2019-07-25', 'Full-Time', 'Active', 'Wendye.Lightbown@kilburnazon.com', '1984-09-11', '23476 Fair Oaks Crossing', 'YD516559D'),
(12213973, 'Andee Pulley', 8, 29053, 1, '2021-03-21', 'Full-Time', 'Active', 'Andee.Pulley@kilburnazon.com', '2006-10-28', '212 Mccormick Way', 'ZR122877D'),
(12214105, 'Brandi Charrier', 8, 28395, 6, '2019-05-04', 'Full-Time', 'Active', 'Brandi.Charrier@kilburnazon.com', '1982-03-08', '85503 Dahle Circle', 'IW006546D'),
(12214121, 'Gerek Piccop', 8, 27388, 6, '2021-10-10', 'Full-Time', 'Active', 'Gerek.Piccop@kilburnazon.com', '1984-10-26', '52 Donald Terrace', 'TX132819D'),
(12214750, 'Zorina Rumgay', 8, 26338, 3, '2024-02-28', 'Full-Time', 'Active', 'Zorina.Rumgay@kilburnazon.com', '2007-07-12', '75495 Mendota Drive', 'BE368387B'),
(12215160, 'Roma Raynham', 8, 25429, 6, '2017-07-03', 'Full-Time', 'Active', 'Roma.Raynham@kilburnazon.com', '2002-04-12', '83055 5th Junction', 'WL256374C'),
(12216138, 'Reta Lympany', 8, 23051, 3, '2017-09-14', 'Full-Time', 'Active', 'Reta.Lympany@kilburnazon.com', '1995-01-21', '408 Meadow Valley Street', 'KT258389D'),
(12218834, 'Lyndel Ivankov', 8, 27114, 6, '2019-04-19', 'Full-Time', 'Active', 'Lyndel.Ivankov@kilburnazon.com', '1980-10-08', '3017 Arapahoe Center', 'UC182199C'),
(12219024, 'Myrtia Querree', 8, 25277, 6, '2017-12-11', 'Full-Time', 'Active', 'Myrtia.Querree@kilburnazon.com', '1985-07-17', '9 Claremont Plaza', 'EO523284A'),
(12219175, 'Suzanne Spillane', 17, 24535, 6, '2019-08-26', 'Full-Time', 'Active', 'Suzanne.Spillane@kilburnazon.com', '1987-10-30', '6945 Logan Street', 'VC486847C'),
(12219701, 'Graham Pannett', 8, 23595, 2, '2021-02-03', 'Full-Time', 'Active', 'Graham.Pannett@kilburnazon.com', '1994-12-16', '64489 Luster Circle', 'JT025781C'),
(12311153, 'Prissie Berthome', 9, 25745, 3, '2017-02-21', 'Full-Time', 'Active', 'Prissie.Berthome@kilburnazon.com', '1990-09-22', '27 Sunnyside Parkway', 'ER911659C'),
(12311581, 'Hesther Mallows', 9, 27848, 3, '2024-02-28', 'Full-Time', 'Active', 'Hesther.Mallows@kilburnazon.com', '2000-12-26', '51052 Hazelcrest Pass', 'XH223005D'),
(12312658, 'Kailey Gilfoy', 9, 25278, 1, '2018-12-26', 'Full-Time', 'Active', 'Kailey.Gilfoy@kilburnazon.com', '1992-03-22', '6 Cardinal Pass', 'XX406929D'),
(12314528, 'Kingsley Santoro', 9, 33011, 1, '2017-07-28', 'Part-Time', 'Active', 'Kingsley.Santoro@kilburnazon.com', '2005-05-31', '5 Anderson Center', 'JS005009C'),
(12316237, 'Bald Spindler', 9, 28972, 2, '2018-08-29', 'Full-Time', 'Active', 'Bald.Spindler@kilburnazon.com', '1977-11-12', '894 Stoughton Way', 'KY965343C'),
(13110482, 'Jayme Greiswood', 10, 33681, 7, '2018-08-16', 'Full-Time', 'Active', 'Jayme.Greiswood@kilburnazon.com', '1991-11-11', '70 Farragut Lane', 'PH455369B'),
(13111738, 'Mirabella Gullane', 10, 38988, 8, '2020-12-28', 'Part-Time', 'Active', 'Mirabella.Gullane@kilburnazon.com', '1996-05-20', '3 Beilfuss Trail', 'KF883937B'),
(13117262, 'Samara Le febre', 10, 44372, 8, '2021-12-14', 'Full-Time', 'Active', 'Samara.Le febre@kilburnazon.com', '1990-05-16', '200 Delladonna Terrace', 'XA964107B'),
(13211973, 'Elden Toy', 11, 39153, 8, '2023-01-02', 'Full-Time', 'Active', 'Elden.Toy@kilburnazon.com', '2004-06-04', '2816 Florence Crossing', 'NL822476D'),
(13212738, 'Paolo Lewin', 11, 32254, 7, '2020-08-13', 'Full-Time', 'Active', 'Paolo.Lewin@kilburnazon.com', '1995-07-27', '84332 Oak Plaza', 'RI019366A'),
(14111094, 'Gerek Davenell', 12, 28285, 8, '2020-09-20', 'Freelance', 'Active', 'Gerek.Davenell@kilburnazon.com', '1993-07-28', '057 Dixon Park', 'ZX739819A'),
(14113626, 'Eberhard Pepi', 12, 23218, 7, '2020-08-11', 'Full-Time', 'Active', 'Eberhard.Pepi@kilburnazon.com', '1978-09-03', '4323 Vernon Lane', 'BY151362A'),
(14118236, 'Emogene Burchard', 12, 25249, 9, '2022-09-29', 'Part-Time', 'Active', 'Emogene.Burchard@kilburnazon.com', '1988-07-19', '25 Arkansas Trail', 'UZ112160A'),
(14119372, 'Peirce Stoyell', 12, 22515, 8, '2020-10-13', 'Freelance', 'Active', 'Peirce.Stoyell@kilburnazon.com', '1982-10-03', '903 Claremont Street', 'VQ308399D'),
(14212158, 'Zacharias Tomlett', 13, 28703, 8, '2018-05-01', 'Full-Time', 'Active', 'Zacharias.Tomlett@kilburnazon.com', '1986-08-20', '679 Brown Hill', 'TK940382B'),
(14213503, 'Merle Lehrahan', 13, 29514, 8, '2024-03-03', 'Full-Time', 'Active', 'Merle.Lehrahan@kilburnazon.com', '1990-12-16', '22 Aberg Trail', 'CP398627A'),
(14216011, 'Berny Mountstephen', 13, 24129, 8, '2020-11-07', 'Full-Time', 'Active', 'Berny.Mountstephen@kilburnazon.com', '1986-12-16', '5347 Vermont Parkway', 'CM316192A'),
(14216103, 'Doretta Lavrick', 13, 25206, 8, '2019-10-11', 'Full-Time', 'Active', 'Doretta.Lavrick@kilburnazon.com', '2002-03-02', '72342 Swallow Drive', 'IN506488A'),
(14218309, 'Colette McChruiter', 13, 28946, 9, '2023-05-01', 'Freelance', 'Active', 'Colette.McChruiter@kilburnazon.com', '1996-09-27', '227 Green Ridge Junction', 'YK615192A'),
(14219116, 'Cosmo Challicombe', 13, 27254, 7, '2019-11-29', 'Full-Time', 'Active', 'Cosmo.Challicombe@kilburnazon.com', '1997-02-13', '87 Comanche Trail', 'IB014432A'),
(14311409, 'Karlotte Jeffry', 14, 23759, 7, '2023-11-13', 'Full-Time', 'Active', 'Karlotte.Jeffry@kilburnazon.com', '1991-07-20', '964 Fordem Drive', 'VP996371C'),
(14311984, 'Annis Cranna', 14, 24243, 9, '2021-05-18', 'Full-Time', 'Active', 'Annis.Cranna@kilburnazon.com', '1987-08-17', '26 Bay Court', 'RJ336182A'),
(14312012, 'Ondrea Brewitt', 14, 22872, 7, '2016-06-02', 'Full-Time', 'Active', 'Ondrea.Brewitt@kilburnazon.com', '1979-12-18', '47 Welch Way', 'WQ882395C'),
(14312778, 'Andris O\'Coskerry', 14, 23747, 9, '2017-04-05', 'Full-Time', 'Active', 'Andris.O\'Coskerry@kilburnazon.com', '1988-04-08', '70267 Hallows Plaza', 'DE252849D'),
(14315369, 'Uta Ashbee', 14, 23762, 8, '2015-12-30', 'Full-Time', 'Active', 'Uta.Ashbee@kilburnazon.com', '1989-10-09', '73746 Commercial Pass', 'RY032334C'),
(14316158, 'Janessa Hilldrup', 14, 24021, 8, '2016-08-21', 'Full-Time', 'Active', 'Janessa.Hilldrup@kilburnazon.com', '2008-07-12', '7 Dorton Way', 'JO147528A'),
(14316558, 'Portie Shera', 14, 25682, 7, '2016-02-04', 'Full-Time', 'Active', 'Portie.Shera@kilburnazon.com', '1989-12-28', '263 Old Gate Road', 'AU408831D'),
(14319195, 'Loutitia Marsay', 14, 29351, 7, '2020-10-30', 'Full-Time', 'Active', 'Loutitia.Marsay@kilburnazon.com', '1999-05-15', '19713 Jenna Trail', 'KF921497D'),
(14319749, 'Brendon Pinck', 14, 25881, 7, '2021-09-10', 'Full-Time', 'Active', 'Brendon.Pinck@kilburnazon.com', '1983-03-15', '1 Aberg Road', 'QT527452D'),
(14319953, 'Cornelle Plowright', 14, 28686, 7, '2015-03-22', 'Full-Time', 'Active', 'Cornelle.Plowright@kilburnazon.com', '1993-03-15', '8902 Eastlawn Court', 'UG075011C'),
(15111844, 'Tiphany Ricci', 15, 38197, 8, '2018-11-21', 'Freelance', 'Active', 'Tiphany.Ricci@kilburnazon.com', '1987-12-19', '71746 Division Court', 'OJ317301B'),
(15112846, 'Quintina Stannard', 15, 48586, 8, '2018-04-30', 'Part-Time', 'Active', 'Quintina.Stannard@kilburnazon.com', '2002-10-24', '695 Mariners Cove Court', 'OS711286D'),
(15113827, 'Codie Beards', 15, 38820, 7, '2024-03-12', 'Freelance', 'Active', 'Codie.Beards@kilburnazon.com', '2004-11-17', '7 Corben Road', 'QS611097B'),
(15114920, 'Archie Mongeot', 15, 46420, 7, '2023-04-05', 'Freelance', 'Active', 'Archie.Mongeot@kilburnazon.com', '1986-06-05', '210 Lake View Pass', 'Unknown'),
(15118902, 'Torrey Lidgertwood', 15, 37008, 8, '2023-05-07', 'Full-Time', 'Active', 'Torrey.Lidgertwood@kilburnazon.com', '2006-02-12', '366 Eagle Crest Park', 'MB541802C'),
(15119246, 'Felisha Folke', 15, 38958, 9, '2018-08-14', 'Part-Time', 'Active', 'Felisha.Folke@kilburnazon.com', '1982-07-29', '0773 Del Mar Place', 'DY315283B'),
(15119273, 'Jolene Leeuwerink', 15, 43182, 9, '2018-01-24', 'Part-Time', 'Active', 'Jolene.Leeuwerink@kilburnazon.com', '1989-03-28', '7 Comanche Hill', 'FL470973C'),
(15210019, 'Philipa Secret', 16, 39583, 9, '2020-02-05', 'Part-Time', 'Active', 'Philipa.Secret@kilburnazon.com', '1995-12-15', '02657 Summit Place', 'BU955906D'),
(15210392, 'Gert Romagnosi', 16, 37617, 7, '2016-08-21', 'Full-Time', 'Active', 'Gert.Romagnosi@kilburnazon.com', '1995-04-29', '81 Mallard Alley', 'TG492624A'),
(15211173, 'Colas Rignoldes', 16, 35925, 7, '2022-04-09', 'Full-Time', 'Active', 'Colas.Rignoldes@kilburnazon.com', '1982-09-21', '1448 Springview Point', 'TM708308D'),
(15212726, 'Ad Gitthouse', 16, 38896, 8, '2018-08-21', 'Full-Time', 'Active', 'Ad.Gitthouse@kilburnazon.com', '2008-05-06', '85018 Bluejay Way', 'YF342757B'),
(15214928, 'Eb Scotter', 16, 35585, 7, '2021-11-14', 'Freelance', 'Active', 'Eb.Scotter@kilburnazon.com', '2001-09-25', '8295 Milwaukee Junction', 'UQ114832D'),
(15218274, 'Brooke Bevir', 16, 41271, 9, '2020-04-15', 'Full-Time', 'Active', 'Brooke.Bevir@kilburnazon.com', '1992-12-08', '9456 Charing Cross Parkway', 'SJ671620A'),
(15310538, 'Barnie Howsden', 17, 78124, 8, '2017-04-26', 'Part-Time', 'Active', 'Barnie.Howsden@kilburnazon.com', '2004-05-28', '940 Green Ridge Crossing', 'QW437381C'),
(15311928, 'Hobard McQuillen', 17, 68912, 8, '2023-11-24', 'Part-Time', 'Active', 'Hobard.McQuillen@kilburnazon.com', '1981-12-30', '147 Clarendon Lane', 'VN239373D'),
(15311947, 'Tamqrah Havill', 17, 89016, 7, '2019-11-23', 'Part-Time', 'Active', 'Tamqrah.Havill@kilburnazon.com', '1974-11-30', '03 Monument Trail', 'ZU142453A'),
(15314926, 'Brunhilde Doring', 17, 82064, 8, '2023-06-05', 'Full-Time', 'Active', 'Brunhilde.Doring@kilburnazon.com', '1989-03-04', '8 Canary Terrace', 'DY737542D'),
(15413482, 'Brande Setch', 18, 53173, 7, '2020-09-11', 'Full-Time', 'Active', 'Brande.Setch@kilburnazon.com', '2000-06-01', '2 Columbus Terrace', 'CM199844A'),
(15413871, 'Tobit Blacker', 18, 22000, 9, '2023-01-21', 'Internship', 'Active', 'Tobit.Blacker@kilburnazon.com', '2005-09-26', '77241 Arapahoe Court', 'PX409930A'),
(15419183, 'Bevvy Counihan', 18, 95590, 9, '2023-07-04', 'Part-Time', 'Active', 'Bevvy.Counihan@kilburnazon.com', '1992-04-05', '20943 Everett Park', 'CU409429A'),
(15419236, 'Raynard Scriviner', 18, 68175, 7, '2023-03-26', 'Part-Time', 'Active', 'Raynard.Scriviner@kilburnazon.com', '2008-03-27', '531 Hoard Place', 'ST135719D'),
(15419427, 'Fergus Blacker', 18, 22000, 9, '2023-01-21', 'Internship', 'Active', 'Fergus.Blacker@kilburnazon.com', '2005-09-26', '77241 Arapahoe Court', 'AJ281735A'),
(15512916, 'Sherye Larrat', 19, 63743, 7, '2018-03-08', 'Part-Time', 'Active', 'Sherye.Larrat@kilburnazon.com', '1993-12-23', '700 Harper Alley', 'ZK749313A'),
(15518273, 'Julissa Pedrocchi', 19, 62946, 8, '2022-02-21', 'Part-Time', 'Active', 'Julissa.Pedrocchi@kilburnazon.com', '1989-02-28', '23483 Clove Circle', 'XA340620B');

--
-- Triggers `EMPLOYEES`
--
DELIMITER $$
CREATE TRIGGER `after_employee_insert` AFTER INSERT ON `EMPLOYEES` FOR EACH ROW BEGIN
    INSERT INTO EMPLOYEE_AUDIT(employee_id, action, new_value, changed_by, changed_at)
    VALUES (NEW.Employee_ID, 'Employee Created', CONCAT('New employee: ', NEW.Employee_Full_Name), 'SYSTEM', NOW());
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `after_employee_update` AFTER UPDATE ON `EMPLOYEES` FOR EACH ROW BEGIN
    -- Track Full Name changes
    IF OLD.Employee_Full_Name != NEW.Employee_Full_Name THEN
        INSERT INTO EMPLOYEE_AUDIT (employee_id, action, old_value, new_value, changed_by, changed_at)
        VALUES (NEW.Employee_ID, 'UPDATE: Full Name', OLD.Employee_Full_Name, NEW.Employee_Full_Name, USER(), NOW());
    END IF;
    
    -- Track Position changes
    IF OLD.Company_Position_ID != NEW.Company_Position_ID THEN
        INSERT INTO EMPLOYEE_AUDIT (employee_id, action, old_value, new_value, changed_by, changed_at)
        VALUES (NEW.Employee_ID, 'UPDATE: Position ID', OLD.Company_Position_ID, NEW.Company_Position_ID, USER(), NOW());
    END IF;
    
    -- Track Salary changes
    IF (OLD.Employee_Salary IS NULL AND NEW.Employee_Salary IS NOT NULL) OR
       (OLD.Employee_Salary IS NOT NULL AND NEW.Employee_Salary IS NULL) OR
       (OLD.Employee_Salary != NEW.Employee_Salary) THEN
        INSERT INTO EMPLOYEE_AUDIT (employee_id, action, old_value, new_value, changed_by, changed_at)
        VALUES (NEW.Employee_ID, 'UPDATE: Salary', 
                COALESCE(OLD.Employee_Salary, 'NULL'), 
                COALESCE(NEW.Employee_Salary, 'NULL'), 
                USER(), NOW());
    END IF;
    
    -- Track Office changes
    IF OLD.Office_ID != NEW.Office_ID THEN
        INSERT INTO EMPLOYEE_AUDIT (employee_id, action, old_value, new_value, changed_by, changed_at)
        VALUES (NEW.Employee_ID, 'UPDATE: Office ID', OLD.Office_ID, NEW.Office_ID, USER(), NOW());
    END IF;
    
    -- Track Contract changes
    IF OLD.Employee_Contract != NEW.Employee_Contract THEN
        INSERT INTO EMPLOYEE_AUDIT (employee_id, action, old_value, new_value, changed_by, changed_at)
        VALUES (NEW.Employee_ID, 'UPDATE: Contract', OLD.Employee_Contract, NEW.Employee_Contract, USER(), NOW());
    END IF;
    
    -- Track Status changes
    IF OLD.Employee_Status != NEW.Employee_Status THEN
        INSERT INTO EMPLOYEE_AUDIT (employee_id, action, old_value, new_value, changed_by, changed_at)
        VALUES (NEW.Employee_ID, 'UPDATE: Status', OLD.Employee_Status, NEW.Employee_Status, USER(), NOW());
    END IF;
    
    -- Track Email changes
    IF OLD.Email_Address != NEW.Email_Address THEN
        INSERT INTO EMPLOYEE_AUDIT (employee_id, action, old_value, new_value, changed_by, changed_at)
        VALUES (NEW.Employee_ID, 'UPDATE: Email', OLD.Email_Address, NEW.Email_Address, USER(), NOW());
    END IF;
    
    -- Track Address changes
    IF OLD.Home_Address != NEW.Home_Address THEN
        INSERT INTO EMPLOYEE_AUDIT (employee_id, action, old_value, new_value, changed_by, changed_at)
        VALUES (NEW.Employee_ID, 'UPDATE: Address', OLD.Home_Address, NEW.Home_Address, USER(), NOW());
    END IF;
    
    -- Track Date of Birth changes
    IF OLD.Date_Of_Birth != NEW.Date_Of_Birth THEN
        INSERT INTO EMPLOYEE_AUDIT (employee_id, action, old_value, new_value, changed_by, changed_at)
        VALUES (NEW.Employee_ID, 'UPDATE: Date of Birth', OLD.Date_Of_Birth, NEW.Date_Of_Birth, USER(), NOW());
    END IF;
    
    -- Track NIN changes
    IF OLD.Identification_Number_NiN != NEW.Identification_Number_NiN THEN
        INSERT INTO EMPLOYEE_AUDIT (employee_id, action, old_value, new_value, changed_by, changed_at)
        VALUES (NEW.Employee_ID, 'UPDATE: NIN', OLD.Identification_Number_NiN, NEW.Identification_Number_NiN, USER(), NOW());
    END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `before_employee_delete` BEFORE DELETE ON `EMPLOYEES` FOR EACH ROW BEGIN
    DECLARE v_position_title VARCHAR(100);
    DECLARE v_department_name VARCHAR(50);
    DECLARE v_office_name VARCHAR(100);
    DECLARE v_termination_reason TEXT;
    DECLARE v_terminated_by VARCHAR(100);
    
    -- Get position and department info
    SELECT 
        Company_Position_Title,
        Department_Name
    INTO 
        v_position_title,
        v_department_name
    FROM COMPANY_POSITIONS
    WHERE Company_Position_ID = OLD.Company_Position_ID;
    
    -- Get office name
    SELECT Office_Name
    INTO v_office_name
    FROM OFFICES
    WHERE Office_ID = OLD.Office_ID;
    
    -- Get termination details from session variables (set by PHP)
    SET v_termination_reason = @termination_reason;
    SET v_terminated_by = @terminated_by;
    
    -- Default values if not set
    IF v_termination_reason IS NULL OR v_termination_reason = '' THEN
        SET v_termination_reason = 'No reason provided';
    END IF;
    
    IF v_terminated_by IS NULL OR v_terminated_by = '' THEN
        SET v_terminated_by = USER();
    END IF;
    
    -- Insert complete employee record into terminations table
    INSERT INTO CONTRACT_TERMINATIONS (
        Original_Employee_ID,
        Employee_Full_Name,
        Company_Position_Title,
        Department_Name,
        Office_Name,
        Employee_Salary,
        Employee_Date_Of_Hire,
        Employee_Contract,
        Email_Address,
        Date_Of_Birth,
        Home_Address,
        Identification_Number_NiN,
        Termination_Reason,
        Termination_Date,
        Termination_Time,
        Terminated_By
    ) VALUES (
        OLD.Employee_ID,
        OLD.Employee_Full_Name,
        v_position_title,
        v_department_name,
        v_office_name,
        OLD.Employee_Salary,
        OLD.Employee_Date_Of_Hire,
        OLD.Employee_Contract,
        OLD.Email_Address,
        OLD.Date_Of_Birth,
        OLD.Home_Address,
        OLD.Identification_Number_NiN,
        v_termination_reason,
        CURDATE(),
        CURTIME(),
        v_terminated_by
    );
    
    -- Also log in general audit table
    INSERT INTO EMPLOYEE_AUDIT (
        employee_id,
        action,
        old_value,
        new_value,
        changed_by,
        changed_at
    ) VALUES (
        OLD.Employee_ID,
        'TERMINATION',
        CONCAT(OLD.Employee_Full_Name, ' - ', v_position_title),
        v_termination_reason,
        v_terminated_by,
        NOW()
    );
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `before_employee_insert` BEFORE INSERT ON `EMPLOYEES` FOR EACH ROW BEGIN
    DECLARE dept_name VARCHAR(50);
    
    -- Get the department name for this position (use correct table name)
    SELECT Department_Name INTO dept_name
    FROM COMPANY_POSITIONS
    WHERE Company_Position_ID = NEW.Company_Position_ID;
    
    -- Check if this is an executive position
    IF dept_name = 'Executives' THEN
        -- Executives don't need salary validation
        SET NEW.Employee_Salary = NULL;
    ELSE
        -- Non-executives must have a salary
        IF NEW.Employee_Salary IS NULL OR NEW.Employee_Salary = 0 THEN
            SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Non-executive employees must have a salary';
        END IF;
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `EMPLOYEE_AUDIT`
--

CREATE TABLE `EMPLOYEE_AUDIT` (
  `audit_id` int NOT NULL,
  `employee_id` int NOT NULL,
  `action` varchar(100) NOT NULL,
  `old_value` text,
  `new_value` text,
  `changed_by` varchar(50) DEFAULT NULL,
  `changed_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `EMPLOYEE_AUDIT`
--

INSERT INTO `EMPLOYEE_AUDIT` (`audit_id`, `employee_id`, `action`, `old_value`, `new_value`, `changed_by`, `changed_at`) VALUES
(1, 45862035, 'Employee Created', NULL, 'New employee: Alyssa Ramon', 'SYSTEM', '2025-12-09 17:59:49'),
(2, 45862035, 'UPDATE: Office ID', '2', '8', 'a94932ta@10.204.127.19', '2025-12-09 18:00:53'),
(3, 45862035, 'Promotion', NULL, 'Employee promoted on 2025-12-09', 'system', '2025-12-09 18:05:27'),
(4, 45862035, 'UPDATE: Position ID', '17', '16', 'a94932ta@10.204.127.19', '2025-12-09 18:05:27'),
(5, 45862035, 'UPDATE: Salary', '39000', '40950', 'a94932ta@10.204.127.19', '2025-12-09 18:05:27'),
(6, 45862035, 'Termination', NULL, 'Employee terminated on 2025-12-09 - Reason: Resignation', 'HR Manager', '2025-12-09 18:08:25'),
(7, 45862035, 'TERMINATION', 'Alyssa Ramon - Back End Developer', 'Resignation', 'HR Manager', '2025-12-09 18:08:25'),
(8, 28987119, 'Employee Created', NULL, 'New employee: Tansi Ajit', 'SYSTEM', '2025-12-09 18:33:58'),
(9, 28987119, 'Termination', NULL, 'Employee terminated on 2025-12-09 - Reason: Resignation', 'HR Manager', '2025-12-09 18:42:54'),
(10, 28987119, 'TERMINATION', 'Tansi Ajit - Front End Developer', 'Resignation', 'HR Manager', '2025-12-09 18:42:54'),
(11, 12219175, 'Promotion', NULL, 'Employee promoted on 2025-12-09', 'system', '2025-12-09 18:43:40'),
(12, 12219175, 'UPDATE: Position ID', '8', '17', 'a94932ta@10.205.247.158', '2025-12-09 18:43:40'),
(13, 12219175, 'UPDATE: Salary', '23367', '24535', 'a94932ta@10.205.247.158', '2025-12-09 18:43:40'),
(14, 12219175, 'Emergency Contact Updated', 'Name: Andrej Ratke, Relationship: Unknown, Phone: 07715 401737', 'Name: Andrej Ratke, Relationship: Husband, Phone: 07715 401737', 'SYSTEM', '2025-12-09 18:47:16');

-- --------------------------------------------------------

--
-- Table structure for table `EMPLOYEE_EMERGENCY_CONTACT`
--

CREATE TABLE `EMPLOYEE_EMERGENCY_CONTACT` (
  `Employee_ID` int NOT NULL,
  `Emergency_Name` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL DEFAULT 'Unknown',
  `Emergency_Relationship` varchar(50) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL DEFAULT 'Unknown',
  `Emergency_Phone_Number` varchar(20) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL DEFAULT 'Unknown'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

--
-- Dumping data for table `EMPLOYEE_EMERGENCY_CONTACT`
--

INSERT INTO `EMPLOYEE_EMERGENCY_CONTACT` (`Employee_ID`, `Emergency_Name`, `Emergency_Relationship`, `Emergency_Phone_Number`) VALUES
(1221908, 'Adoree Tomkies', 'Boyfriend', '07083 955300'),
(11123211, 'Stanislas Tunnow', 'Wife', '07208 300969'),
(11214682, 'Pittem Kare', 'Wife', 'Unknown'),
(11223214, 'Agosto Hoggan', 'Boyfriend', '07760 801643'),
(11224403, 'Unknown', 'Civil Partner', '07279 090043'),
(11226496, 'Unknown', 'Boyfriend', '07786 830672'),
(11229804, 'Karlens Kilfether', 'Unknown', '07770 850516'),
(12112639, 'Stanly Grindell', 'Wife', '07325 756690'),
(12113666, 'Unknown', 'Civil Partner', '07749 087584'),
(12212092, 'Unknown', 'Unknown', 'Unknown'),
(12212831, 'Alica Smewings', 'Mother', 'Unknown'),
(12213598, 'Marjy Widdison', 'Unknown', 'Unknown'),
(12213973, 'Esteban McDill', 'Civil Partner', '07812 005920'),
(12214105, 'Amii De Simone', 'Boyfriend', '07735 915033'),
(12214121, 'Gaylor McMurray', 'Boyfriend', '07092 071016'),
(12214750, 'Bonnee Parade', 'Boyfriend', '07150 674848'),
(12215160, 'Unknown', 'Father', 'Unknown'),
(12216138, 'Hilliary Cullingford', 'Unknown', '07663 787888'),
(12218834, 'Humfrey Easbie', 'Father', 'Unknown'),
(12219024, 'Kelley Porrett', 'Husband', '07333 032436'),
(12219175, 'Andrej Ratke', 'Husband', '07715 401737'),
(12219701, 'Jordanna Buxsey', 'Mother', '07756 130401'),
(12311153, 'Quintus Battelle', 'Husband', '07478 793423'),
(12311581, 'Unknown', 'Husband', 'Unknown'),
(12312658, 'Orsola Philip', 'Unknown', '07476 651024'),
(12314528, 'Unknown', 'Wife', '07870 741081'),
(12316237, 'Isidor Hillan', 'Unknown', '07722 676666'),
(13110482, 'Hayward Norley', 'Mother', '07832 036596'),
(13111738, 'Unknown', 'Boyfriend', '07862 622159'),
(13117262, 'Marylynne Jonsson', 'Mother', '07437 831717'),
(13211973, 'Kienan Killeley', 'Father', 'Unknown'),
(13212738, 'Jenica McGrudder', 'Girlfriend', '07963 860510'),
(14111094, 'Unknown', 'Husband', '07183 143586'),
(14113626, 'Tabbie Gilphillan', 'Unknown', '07678 551130'),
(14118236, 'Unknown', 'Boyfriend', 'Unknown'),
(14119372, 'Doria Johanchon', 'Civil Partner', '07036 960338'),
(14212158, 'Minda Ferrillo', 'Mother', '07056 710360'),
(14213503, 'Aluin Humbell', 'Mother', 'Unknown'),
(14216011, 'Unknown', 'Mother', '07532 858225'),
(14216103, 'Dacey Chasmoor', 'Mother', '07780 371203'),
(14218309, 'Brianna Harlock', 'Husband', '07181 235352'),
(14219116, 'Unknown', 'Girlfriend', '07527 844139'),
(14311409, 'Viola Ferrario', 'Girlfriend', '07717 776894'),
(14311984, 'Dmitri Cranna', 'Husband', 'Unknown'),
(14312012, 'Elita Pohls', 'Civil Partner', 'Unknown'),
(14312778, 'Fernande Struthers', 'Father', '07699 818669'),
(14315369, 'Danette Costi', 'Unknown', '07997 748914'),
(14316158, 'Denny Nicolson', 'Wife', '07123 801554'),
(14316558, 'Daria Menichillo', 'Unknown', '07373 825339'),
(14319195, 'Natalina Ollis', 'Unknown', 'Unknown'),
(14319749, 'Unknown', 'Mother', 'Unknown'),
(14319953, 'Calypso Mapston', 'Unknown', '07608 461696'),
(15111844, 'Artemus Gile', 'Wife', '07077 101937'),
(15112846, 'Livvy Shingles', 'Wife', 'Unknown'),
(15113827, 'Kassi Flay', 'Father', '07204 608582'),
(15114920, 'Unknown', 'Unknown', 'Unknown'),
(15118902, 'Tull North', 'Unknown', '07082 174879'),
(15119246, 'Brigitta Greep', 'Unknown', '07079 952137'),
(15119273, 'Ronda Mabley', 'Wife', '07342 424970'),
(15210019, 'Jeramey Czadla', 'Girlfriend', '07360 969163'),
(15210392, 'Jilly Fullbrook', 'Girlfriend', '07405 079997'),
(15211173, 'Unknown', 'Father', 'Unknown'),
(15212726, 'Unknown', 'Girlfriend', '07933 924971'),
(15214928, 'Rosabel Rosell', 'Girlfriend', '07949 698940'),
(15218274, 'Tremayne Mumford', 'Girlfriend', '07070 829323'),
(15310538, 'Unknown', 'Mother', '07654 711451'),
(15311928, 'Unknown', 'Husband', 'Unknown'),
(15311947, 'Burnard Yosifov', 'Girlfriend', '07231 488090'),
(15314926, 'Marlin Knight', 'Civil Partner', '07326 647976'),
(15413482, 'Nerissa Maisey', 'Wife', '07740 330980'),
(15413871, 'Letitia Normabell', 'Mother', '07295 892245'),
(15419183, 'Fayth Bazylets', 'Girlfriend', 'Unknown'),
(15419236, 'Emiline McEnhill', 'Unknown', '07952 777488'),
(15419427, 'Letitia Normabell', 'Mother', '07295 892245'),
(15512916, 'Isidora Hanster', 'Unknown', '07736 429556'),
(15518273, 'Unknown', 'Wife', '07043 095609');

-- --------------------------------------------------------

--
-- Table structure for table `EMPLOYEE_PROMOTIONS`
--

CREATE TABLE `EMPLOYEE_PROMOTIONS` (
  `Promotion_ID` int NOT NULL,
  `Employee_ID` int NOT NULL,
  `Old_Position_ID` int NOT NULL,
  `New_Position_ID` int NOT NULL,
  `Old_Salary` decimal(10,2) DEFAULT NULL,
  `New_Salary` decimal(10,2) DEFAULT NULL,
  `Salary_Increase_Percentage` decimal(5,2) DEFAULT NULL,
  `Promotion_Date` date NOT NULL,
  `Promotion_Reason` text,
  `Processed_By` varchar(100) DEFAULT NULL,
  `Processed_At` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `EMPLOYEE_PROMOTIONS`
--

INSERT INTO `EMPLOYEE_PROMOTIONS` (`Promotion_ID`, `Employee_ID`, `Old_Position_ID`, `New_Position_ID`, `Old_Salary`, `New_Salary`, `Salary_Increase_Percentage`, `Promotion_Date`, `Promotion_Reason`, `Processed_By`, `Processed_At`) VALUES
(2, 12219175, 8, 17, 23367.00, 24535.35, 5.00, '2025-12-09', 'Excellent Performance', 'system', '2025-12-09 18:43:40');

--
-- Triggers `EMPLOYEE_PROMOTIONS`
--
DELIMITER $$
CREATE TRIGGER `after_promotion_insert` AFTER INSERT ON `EMPLOYEE_PROMOTIONS` FOR EACH ROW BEGIN
    DECLARE emp_name VARCHAR(100);
    
    SELECT Employee_Full_Name INTO emp_name
    FROM EMPLOYEES
    WHERE Employee_ID = NEW.Employee_ID;
    
    INSERT INTO EMPLOYEE_AUDIT(employee_id, action, new_value, changed_by, changed_at)
    VALUES (NEW.Employee_ID, 'Promotion', CONCAT('Employee promoted on ', NEW.Promotion_Date), IFNULL(NEW.Processed_By, 'SYSTEM'), NOW());
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Table structure for table `EMPLOYEE_VACATION_DETAILS`
--

CREATE TABLE `EMPLOYEE_VACATION_DETAILS` (
  `Employee_ID` int NOT NULL,
  `Leave_Start_Date` datetime NOT NULL,
  `Leave_End_Date` datetime NOT NULL,
  `Leave_Reason` enum('Annual','Sick','Unpaid','Maternity','Other') CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT 'Annual',
  `Approval_Status` enum('Pending','Approved','Rejected') CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci DEFAULT 'Pending',
  `Approved_By` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `OFFICES`
--

CREATE TABLE `OFFICES` (
  `Office_ID` int NOT NULL,
  `Office_Name` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `Office_Type` enum('Corporate Office','Distribution Centre') CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `Office_Address` varchar(100) CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL,
  `Office_Region` enum('England North','England South','England Central','Wales','Scotland','Northern Ireland') CHARACTER SET utf8mb3 COLLATE utf8mb3_unicode_ci NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

--
-- Dumping data for table `OFFICES`
--

INSERT INTO `OFFICES` (`Office_ID`, `Office_Name`, `Office_Type`, `Office_Address`, `Office_Region`) VALUES
(1, 'Scotland Distribution Centre', 'Distribution Centre', 'Nurseries Rd, Baillieston, Glasgow G69 6UL', 'Scotland'),
(2, 'Northern Ireland Distribution Centre', 'Distribution Centre', 'Musgrave Channel Rd, Belfast BT3', 'Northern Ireland'),
(3, 'England North Distribution Centre', 'Distribution Centre', 'Burnside House, Cambridge Rd, Middlesbrough TS3 8AG', 'England North'),
(4, 'England Central Distribution Centre', 'Distribution Centre', '12 Navigation St, Leicester LE1 3UR', 'England Central'),
(5, 'England South Distribution Centre', 'Distribution Centre', 'Unit 3 Filmer Way, Marsh Barton, Exeter EX2 8YX', 'England South'),
(6, 'Wales Distribution Centre', 'Distribution Centre', 'Wentloog Corporate Park, Wentloog Ave, St. Mellons, Cardiff CF3 2ER', 'Wales'),
(7, 'Kilburnazon Head Office', 'Corporate Office', 'Kilburn Building, Oxford Rd, Manchester M13 9PL', 'England North'),
(8, 'Birmingham Office for Kilburnazon', 'Corporate Office', 'Lewis Building, 35 Bull St, Birmingham B4 6AF', 'England Central'),
(9, 'The London Office for Kilburnazon', 'Corporate Office', 'Broadgate Tower, 201 Bishopsgate, London EC2M 3AB', 'England South');

-- --------------------------------------------------------

--
-- Table structure for table `ORDERED_PRODUCTS`
--

CREATE TABLE `ORDERED_PRODUCTS` (
  `Order_ID` int NOT NULL,
  `Product_ID` varchar(32) NOT NULL,
  `Product_Quantity` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `PRODUCTS`
--

CREATE TABLE `PRODUCTS` (
  `Product_ID` varchar(32) COLLATE utf8mb3_unicode_ci NOT NULL,
  `Product_Name` varchar(100) COLLATE utf8mb3_unicode_ci NOT NULL,
  `Product_Manufacturer` varchar(100) COLLATE utf8mb3_unicode_ci NOT NULL,
  `Product_Price` decimal(10,2) NOT NULL,
  `Product_Stock` int NOT NULL DEFAULT '0',
  `Product_Category_ID` int DEFAULT NULL,
  `Product_Description` varchar(500) COLLATE utf8mb3_unicode_ci DEFAULT NULL,
  `Office_ID` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `PRODUCT_CATEGORIES`
--

CREATE TABLE `PRODUCT_CATEGORIES` (
  `Product_Category_ID` int NOT NULL,
  `Product_Category_Name` varchar(100) NOT NULL,
  `Product_Category_Parent` int DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `PRODUCT_QUESTIONS`
--

CREATE TABLE `PRODUCT_QUESTIONS` (
  `Question_ID` int NOT NULL,
  `Customer_ID` int NOT NULL,
  `Product_ID` varchar(32) NOT NULL,
  `Question_Description` varchar(350) NOT NULL,
  `Question_Answer` varchar(350) NOT NULL DEFAULT 'Not Answered'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `REVIEWS`
--

CREATE TABLE `REVIEWS` (
  `Product_ID` varchar(32) COLLATE utf8mb3_unicode_ci NOT NULL,
  `Customer_ID` int NOT NULL,
  `Order_ID` int NOT NULL,
  `Review_Rating` decimal(2,1) NOT NULL,
  `Review_Description` varchar(100) COLLATE utf8mb3_unicode_ci DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3 COLLATE=utf8mb3_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `VEHICLES`
--

CREATE TABLE `VEHICLES` (
  `Vehicle_ID` int NOT NULL,
  `Carplate_Number` varchar(20) NOT NULL,
  `Active` tinyint(1) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Stand-in structure for view `vw_active_terminations`
-- (See below for the actual view)
--
CREATE TABLE `vw_active_terminations` (
`Company_Position_Title` varchar(100)
,`Created_At` timestamp
,`Date_Of_Birth` date
,`Days_Since_Termination` int
,`Days_Until_Deletion` int
,`Department_Name` varchar(50)
,`Email_Address` varchar(100)
,`Employee_Contract` enum('Full-Time','Part-Time','Freelance','Internship')
,`Employee_Date_Of_Hire` date
,`Employee_Full_Name` varchar(100)
,`Employee_Salary` decimal(10,2)
,`Home_Address` varchar(75)
,`Identification_Number_NiN` varchar(9)
,`Office_Name` varchar(100)
,`Original_Employee_ID` int
,`Terminated_By` varchar(100)
,`Termination_Date` date
,`Termination_ID` int
,`Termination_Reason` text
,`Termination_Time` time
);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `CONTRACT_TERMINATIONS`
--
ALTER TABLE `CONTRACT_TERMINATIONS`
  ADD PRIMARY KEY (`Termination_ID`);

--
-- Indexes for table `EMPLOYEE_AUDIT`
--
ALTER TABLE `EMPLOYEE_AUDIT`
  ADD PRIMARY KEY (`audit_id`);

--
-- Indexes for table `EMPLOYEE_PROMOTIONS`
--
ALTER TABLE `EMPLOYEE_PROMOTIONS`
  ADD PRIMARY KEY (`Promotion_ID`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `CONTRACT_TERMINATIONS`
--
ALTER TABLE `CONTRACT_TERMINATIONS`
  MODIFY `Termination_ID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `EMPLOYEE_AUDIT`
--
ALTER TABLE `EMPLOYEE_AUDIT`
  MODIFY `audit_id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT for table `EMPLOYEE_PROMOTIONS`
--
ALTER TABLE `EMPLOYEE_PROMOTIONS`
  MODIFY `Promotion_ID` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

-- --------------------------------------------------------

--
-- Structure for view `vw_active_terminations`
--
DROP TABLE IF EXISTS `vw_active_terminations`;

CREATE ALGORITHM=UNDEFINED DEFINER=`a94932ta`@`localhost` SQL SECURITY DEFINER VIEW `vw_active_terminations`  AS SELECT `ct`.`Termination_ID` AS `Termination_ID`, `ct`.`Original_Employee_ID` AS `Original_Employee_ID`, `ct`.`Employee_Full_Name` AS `Employee_Full_Name`, `ct`.`Company_Position_Title` AS `Company_Position_Title`, `ct`.`Department_Name` AS `Department_Name`, `ct`.`Office_Name` AS `Office_Name`, `ct`.`Employee_Salary` AS `Employee_Salary`, `ct`.`Employee_Date_Of_Hire` AS `Employee_Date_Of_Hire`, `ct`.`Employee_Contract` AS `Employee_Contract`, `ct`.`Email_Address` AS `Email_Address`, `ct`.`Date_Of_Birth` AS `Date_Of_Birth`, `ct`.`Home_Address` AS `Home_Address`, `ct`.`Identification_Number_NiN` AS `Identification_Number_NiN`, `ct`.`Termination_Reason` AS `Termination_Reason`, `ct`.`Termination_Date` AS `Termination_Date`, `ct`.`Termination_Time` AS `Termination_Time`, `ct`.`Terminated_By` AS `Terminated_By`, `ct`.`Created_At` AS `Created_At`, (to_days(curdate()) - to_days(`ct`.`Termination_Date`)) AS `Days_Since_Termination`, (to_days((`ct`.`Termination_Date` + interval 3 year)) - to_days(curdate())) AS `Days_Until_Deletion` FROM `CONTRACT_TERMINATIONS` AS `ct` WHERE ((`ct`.`Termination_Date` + interval 3 year) > curdate()) ORDER BY `ct`.`Termination_Date` DESC ;
COMMIT;
