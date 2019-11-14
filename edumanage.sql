-- phpMyAdmin SQL Dump
-- version 4.6.6deb5
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- 생성 시간: 19-08-23 02:52
-- 서버 버전: 5.7.27-0ubuntu0.18.04.1
-- PHP 버전: 7.2.19-0ubuntu0.18.04.2

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- 데이터베이스: `edumanage`
--

-- --------------------------------------------------------

--
-- 테이블 구조 `advanced_course`
--

CREATE TABLE `advanced_course` (
  `no` int(12) NOT NULL,
  `courses` varchar(256) NOT NULL,
  `duration` varchar(256) NOT NULL,
  `date` varchar(256) NOT NULL,
  `hours` varchar(256) NOT NULL,
  `trainers` varchar(256) NOT NULL,
  `courses_managers` varchar(256) NOT NULL,
  `courses_facilitators` varchar(256) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- 테이블 구조 `basic_course`
--

CREATE TABLE `basic_course` (
  `no` int(12) NOT NULL,
  `courses` varchar(256) NOT NULL,
  `duration` varchar(256) NOT NULL,
  `date` varchar(256) NOT NULL,
  `hours` varchar(256) NOT NULL,
  `trainers` varchar(256) NOT NULL,
  `courses_managers` varchar(256) NOT NULL,
  `courses_facilitators` varchar(256) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- 테이블 구조 `comment`
--

CREATE TABLE `comment` (
  `no` int(11) NOT NULL,
  `course_title` varchar(255) NOT NULL,
  `comment_title` varchar(255) NOT NULL,
  `comment` blob,
  `user_email` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- 테이블 구조 `faq`
--

CREATE TABLE `faq` (
  `no` int(11) NOT NULL,
  `course_title` varchar(255) NOT NULL,
  `question_title` varchar(255) NOT NULL,
  `question` blob NOT NULL,
  `user_email` varchar(255) NOT NULL,
  `time` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- 테이블 구조 `faq_comments`
--

CREATE TABLE `faq_comments` (
  `comment_no` int(11) NOT NULL,
  `faq_no` int(11) NOT NULL,
  `comment` blob NOT NULL,
  `comment_user_email` varchar(255) NOT NULL,
  `comment_time` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- 테이블 구조 `news`
--

CREATE TABLE `news` (
  `no` int(12) NOT NULL,
  `title` varchar(128) DEFAULT NULL,
  `date` datetime NOT NULL,
  `contents` blob
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- 테이블 구조 `registered_course`
--

CREATE TABLE `registered_course` (
  `user_email` varchar(255) NOT NULL,
  `courses` varchar(255) NOT NULL,
  `level` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- 테이블 구조 `search`
--

CREATE TABLE `search` (
  `no` int(12) NOT NULL,
  `title` varchar(256) DEFAULT NULL,
  `date` datetime(6) NOT NULL,
  `contents` blob,
  `file` varchar(256) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- 테이블 구조 `specialActivity`
--

CREATE TABLE `specialActivity` (
  `no` int(12) NOT NULL,
  `title` varchar(128) DEFAULT NULL,
  `date` datetime NOT NULL,
  `contents` blob,
  `file` varchar(512) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- 테이블 구조 `special_lecture`
--

CREATE TABLE `special_lecture` (
  `no` int(12) NOT NULL,
  `courses` varchar(256) NOT NULL,
  `duration` varchar(256) NOT NULL,
  `date` varchar(256) NOT NULL,
  `hours` varchar(256) NOT NULL,
  `trainers` varchar(256) NOT NULL,
  `courses_managers` varchar(256) NOT NULL,
  `courses_facilitators` varchar(256) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

-- --------------------------------------------------------

--
-- 테이블 구조 `user`
--

CREATE TABLE `user` (
  `user_num` int(5) NOT NULL,
  `user_email` varchar(255) NOT NULL,
  `user_pw` varchar(255) NOT NULL,
  `user_fn` varchar(100) NOT NULL,
  `user_gn` varchar(100) NOT NULL,
  `user_sex` varchar(10) NOT NULL,
  `user_birth` varchar(100) NOT NULL,
  `user_nation` varchar(100) NOT NULL,
  `user_phone` varchar(100) NOT NULL,
  `user_position` varchar(100) NOT NULL,
  `user_part` varchar(100) NOT NULL,
  `user_offid` varchar(20) NOT NULL,
  `user_check` varchar(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- 테이블의 덤프 데이터 `user`
--

INSERT INTO `user` (`user_num`, `user_email`, `user_pw`, `user_fn`, `user_gn`, `user_sex`, `user_birth`, `user_nation`, `user_phone`, `user_position`, `user_part`, `user_offid`, `user_check`) VALUES
(1, 'admin', 'd033e22ae348aeb5660fc2140aec35850c4da997', 'admin', 'admin', 'admin', 'admin', 'admin', 'admin', 'admin', 'admin', 'admin', 'admin'),
(11, 'tkddbs0901@gmail.com', '40bd001563085fc35165329ea1ff5c5ecbdbbeef', 'LEE', 'SANGYOON', 'male', '14/08/2019', 'Cambodia', '017-357-695', 'Developer', 'ICT Department', '012', 'user'),
(12, 'user01@gmail.com', '0497fe4d674fe37194a6fcb08913e596ef6a307f', 'Smith', 'John', 'male', '07/08/2019', 'Cambodia', '222-222-222', 'member', 'Human Resourse', '0001', 'user');

--
-- 덤프된 테이블의 인덱스
--

--
-- 테이블의 인덱스 `advanced_course`
--
ALTER TABLE `advanced_course`
  ADD PRIMARY KEY (`no`),
  ADD UNIQUE KEY `no` (`no`),
  ADD UNIQUE KEY `courses` (`courses`),
  ADD KEY `no_2` (`no`);

--
-- 테이블의 인덱스 `basic_course`
--
ALTER TABLE `basic_course`
  ADD PRIMARY KEY (`no`),
  ADD UNIQUE KEY `courses` (`courses`),
  ADD UNIQUE KEY `no` (`no`);

--
-- 테이블의 인덱스 `comment`
--
ALTER TABLE `comment`
  ADD PRIMARY KEY (`no`);

--
-- 테이블의 인덱스 `faq`
--
ALTER TABLE `faq`
  ADD PRIMARY KEY (`no`);

--
-- 테이블의 인덱스 `faq_comments`
--
ALTER TABLE `faq_comments`
  ADD PRIMARY KEY (`comment_no`);

--
-- 테이블의 인덱스 `news`
--
ALTER TABLE `news`
  ADD PRIMARY KEY (`no`);

--
-- 테이블의 인덱스 `search`
--
ALTER TABLE `search`
  ADD PRIMARY KEY (`no`);

--
-- 테이블의 인덱스 `specialActivity`
--
ALTER TABLE `specialActivity`
  ADD PRIMARY KEY (`no`);

--
-- 테이블의 인덱스 `special_lecture`
--
ALTER TABLE `special_lecture`
  ADD PRIMARY KEY (`no`),
  ADD UNIQUE KEY `no` (`no`),
  ADD UNIQUE KEY `courses` (`courses`),
  ADD KEY `no_2` (`no`);

--
-- 테이블의 인덱스 `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`user_num`);

--
-- 덤프된 테이블의 AUTO_INCREMENT
--

--
-- 테이블의 AUTO_INCREMENT `advanced_course`
--
ALTER TABLE `advanced_course`
  MODIFY `no` int(12) NOT NULL AUTO_INCREMENT;
--
-- 테이블의 AUTO_INCREMENT `basic_course`
--
ALTER TABLE `basic_course`
  MODIFY `no` int(12) NOT NULL AUTO_INCREMENT;
--
-- 테이블의 AUTO_INCREMENT `comment`
--
ALTER TABLE `comment`
  MODIFY `no` int(11) NOT NULL AUTO_INCREMENT;
--
-- 테이블의 AUTO_INCREMENT `faq`
--
ALTER TABLE `faq`
  MODIFY `no` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;
--
-- 테이블의 AUTO_INCREMENT `faq_comments`
--
ALTER TABLE `faq_comments`
  MODIFY `comment_no` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;
--
-- 테이블의 AUTO_INCREMENT `news`
--
ALTER TABLE `news`
  MODIFY `no` int(12) NOT NULL AUTO_INCREMENT;
--
-- 테이블의 AUTO_INCREMENT `search`
--
ALTER TABLE `search`
  MODIFY `no` int(12) NOT NULL AUTO_INCREMENT;
--
-- 테이블의 AUTO_INCREMENT `specialActivity`
--
ALTER TABLE `specialActivity`
  MODIFY `no` int(12) NOT NULL AUTO_INCREMENT;
--
-- 테이블의 AUTO_INCREMENT `special_lecture`
--
ALTER TABLE `special_lecture`
  MODIFY `no` int(12) NOT NULL AUTO_INCREMENT;
--
-- 테이블의 AUTO_INCREMENT `user`
--
ALTER TABLE `user`
  MODIFY `user_num` int(5) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
