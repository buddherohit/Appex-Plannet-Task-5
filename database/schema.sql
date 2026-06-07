-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS `careerbridge` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `careerbridge`;

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS `users` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(150) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('student', 'admin') NOT NULL DEFAULT 'student',
  `profile_pic` VARCHAR(255) DEFAULT NULL,
  `otp_code` VARCHAR(6) DEFAULT NULL,
  `otp_expires_at` DATETIME DEFAULT NULL,
  `is_verified` TINYINT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX (`email`)
) ENGINE=InnoDB;

-- 2. COURSES TABLE
CREATE TABLE IF NOT EXISTS `courses` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(150) NOT NULL,
  `description` TEXT NOT NULL,
  `instructor` VARCHAR(100) NOT NULL,
  `duration` VARCHAR(50) NOT NULL,
  `category` VARCHAR(100) NOT NULL,
  `image_url` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 3. NOTES TABLE
CREATE TABLE IF NOT EXISTS `notes` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(150) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `category` VARCHAR(100) NOT NULL,
  `file_path` VARCHAR(255) NOT NULL,
  `file_type` VARCHAR(10) NOT NULL,
  `uploader_id` INT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`uploader_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 4. INTERNSHIPS TABLE
CREATE TABLE IF NOT EXISTS `internships` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(150) NOT NULL,
  `company` VARCHAR(150) NOT NULL,
  `description` TEXT NOT NULL,
  `requirements` TEXT NOT NULL,
  `duration` VARCHAR(50) NOT NULL,
  `stipend` VARCHAR(50) NOT NULL,
  `location` VARCHAR(150) NOT NULL,
  `deadline` DATE NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 5. JOBS TABLE
CREATE TABLE IF NOT EXISTS `jobs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(150) NOT NULL,
  `company` VARCHAR(150) NOT NULL,
  `description` TEXT NOT NULL,
  `requirements` TEXT NOT NULL,
  `salary` VARCHAR(50) NOT NULL,
  `location` VARCHAR(150) NOT NULL,
  `job_type` VARCHAR(50) NOT NULL,
  `deadline` DATE NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 6. PROJECTS TABLE
CREATE TABLE IF NOT EXISTS `projects` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_id` INT NOT NULL,
  `title` VARCHAR(150) NOT NULL,
  `description` TEXT NOT NULL,
  `tech_stack` VARCHAR(255) NOT NULL,
  `github_url` VARCHAR(255) DEFAULT NULL,
  `demo_url` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 7. APPLICATIONS TABLE
CREATE TABLE IF NOT EXISTS `applications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `student_id` INT NOT NULL,
  `type` ENUM('job', 'internship') NOT NULL,
  `post_id` INT NOT NULL,
  `resume_path` VARCHAR(255) NOT NULL,
  `status` ENUM('pending', 'reviewed', 'accepted', 'rejected') NOT NULL DEFAULT 'pending',
  `applied_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`student_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 8. PLACEMENT_PREP TABLE
CREATE TABLE IF NOT EXISTS `placement_prep` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(150) NOT NULL,
  `category` ENUM('dsa', 'aptitude', 'interview') NOT NULL,
  `content` TEXT NOT NULL,
  `resource_url` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 9. ACTIVITY_LOGS TABLE
CREATE TABLE IF NOT EXISTS `activity_logs` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT NOT NULL,
  `action` VARCHAR(255) NOT NULL,
  `details` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 10. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS `notifications` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `user_id` INT DEFAULT NULL, -- NULL indicates global/all users notification
  `type` VARCHAR(50) NOT NULL, -- 'job', 'internship', 'notes', 'general'
  `message` TEXT NOT NULL,
  `is_read` TINYINT DEFAULT 0,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB;

-- SEED DATA
-- Default Admin User (Password is hashed 'admin123')
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `profile_pic`, `is_verified`, `created_at`) 
VALUES (1, 'System Administrator', 'admin@careerbridge.com', '$2y$10$w8.3f6/1yE11V6oTfI/s5.l59m3V9ZzKj7B31b5uC9D2p6P/v8S7q', 'admin', NULL, 1, CURRENT_TIMESTAMP)
ON DUPLICATE KEY UPDATE `id`=`id`;

-- Default Student User (Password is hashed 'student123')
INSERT INTO `users` (`id`, `name`, `email`, `password`, `role`, `profile_pic`, `is_verified`, `created_at`) 
VALUES (2, 'Rohit Kumar', 'student@careerbridge.com', '$2y$10$bS6w8yqM3Lg3lBvGfXzveexU74fF.j793/YkX.f7l1XlB/T3VreG2', 'student', NULL, 1, CURRENT_TIMESTAMP)
ON DUPLICATE KEY UPDATE `id`=`id`;

-- Sample Courses
INSERT INTO `courses` (`id`, `title`, `description`, `instructor`, `duration`, `category`, `image_url`) VALUES
(1, 'Full Stack Web Development with React & Node', 'A comprehensive course covering HTML5, CSS3, modern JavaScript, React.js, Node.js, Express, and MongoDB. Includes building a complete SaaS application.', 'Dr. Amit Sharma', '12 Weeks', 'Web Development', 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=60'),
(2, 'Mastering Data Structures & Algorithms', 'Solve complex programming challenges. Focuses on Big-O, arrays, linked lists, binary trees, graphs, sorting, and dynamic programming in C++ and Java.', 'Prof. Sarah Jenkins', '8 Weeks', 'Computer Science', 'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=600&auto=format&fit=crop&q=60'),
(3, 'Introduction to Python & Data Science', 'Learn Python basics, NumPy, Pandas, Matplotlib, Seaborn, and build your first machine learning models with Scikit-Learn.', 'Michael Stone', '10 Weeks', 'Data Science', 'https://images.unsplash.com/photo-1527474305487-b87b222841cc?w=600&auto=format&fit=crop&q=60')
ON DUPLICATE KEY UPDATE `id`=`id`;

-- Sample Internships
INSERT INTO `internships` (`id`, `title`, `company`, `description`, `requirements`, `duration`, `stipend`, `location`, `deadline`) VALUES
(1, 'Frontend Development Intern', 'TechCorp Solutions', 'We are looking for a creative Frontend Intern proficient in React.js and Bootstrap. You will be building responsive client portals and collaborating with designers.', 'HTML, CSS, JavaScript, React.js, Bootstrap 5, Git.', '6 Months', '$800/Month', 'Remote', '2026-08-31'),
(2, 'Data Analyst Intern', 'Global Metrics Inc.', 'Assist our analytics team in processing datasets, creating dashboards, and deriving business insights. Experience with SQL and Python is a must.', 'SQL, Python (Pandas), PowerBI/Tableau, Excel.', '3 Months', '$1000/Month', 'Bangalore, India', '2026-07-15')
ON DUPLICATE KEY UPDATE `id`=`id`;

-- Sample Jobs
INSERT INTO `jobs` (`id`, `title`, `company`, `description`, `requirements`, `salary`, `location`, `job_type`, `deadline`) VALUES
(1, 'Associate Software Engineer', 'InnovateSoft', 'Entry-level software development role. You will work on writing clean back-end services, designing API endpoints, and writing unit tests in Java/Python.', 'Bachelor\'s in CS or related, basic OOP knowledge, SQL, Git, communication skills.', '$75,000/Year', 'San Francisco, CA', 'Full-time', '2026-09-30'),
(2, 'Junior Cloud Administrator', 'SkyLink Networks', 'Configure and maintain cloud architectures. Monitor server health, automate deployments, and help implement CI/CD pipelines on AWS.', 'AWS Cloud Practitioner certification, basic Linux commands, scripting (Bash/Python).', '$65,000/Year', 'Hybrid (Dallas, TX)', 'Full-time', '2026-10-15')
ON DUPLICATE KEY UPDATE `id`=`id`;

-- Sample Placement Prep Resources
INSERT INTO `placement_prep` (`id`, `title`, `category`, `content`, `resource_url`) VALUES
(1, 'Quantitative Aptitude Formula Sheet & Shortcuts', 'aptitude', 'Important formulas and quick tricks for solving Percentage, Profit & Loss, Ratio & Proportion, Time & Work, and Speed & Distance problems during initial screening tests.', 'https://www.google.com'),
(2, 'Top 50 Frequently Asked Software Engineering Interview Questions', 'interview', 'Comprehensive guide detailing behavior and technical questions, including the STAR method for behavioral responses and detailed explanations for OOP, databases, and systems design.', 'https://www.google.com'),
(3, 'Mastering Binary Search & Sliding Window Coding Patterns', 'dsa', 'Step-by-step tutorials and templates for Binary Search variation questions and sliding window dynamic sizes. Includes links to LeetCode practice problems.', 'https://leetcode.com')
ON DUPLICATE KEY UPDATE `id`=`id`;
