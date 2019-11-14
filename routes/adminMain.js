var express = require('express');
var router = express.Router();
var auth = require('../public/modues');
var conn = require('../public/config/database');
var crypto = require('./../public/config/crypto.js');
var timezone = require('date-utils');
var multer = require('multer');
var fs = require('fs');
var mime = require('mime');
var path = require('path');
/* GET users listing. */

//sepecial activites
//파일 저장위치와 파일이름 설정
var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'views/img/upload');
    },
    //파일이름 설정
    filename: function (req, file, cb) {
        var array = file.originalname.split('.');
        array[0] = array[0] + '_';
        array[1] = '.' + array[1];
        array.splice(1, 0, Date.now().toString());
        const result = array.join('');
        console.log(result);
        cb(null, result);
    }

})

//파일 업로드 모듈
var upload = multer({storage: storage })


router.get('/', function (req, res, next) {
    auth.adminLoginCheck(req, res);
    var userName = req.user.user_gn;
    res.render('adminSubPage/admin_main', { userName: userName });
});

//aboutus 수정
router.get('/aboutus', function (req, res) {
    auth.adminLoginCheck(req, res);
    var userName = req.user.user_gn;
    var data = auth.fileinput('./public/infofile/aboutus.txt');
    res.render('adminSubPage/admin_aboutUs', { userName: userName, data: data });
});

router.get('/aboutus/update', function (req, res) {
    auth.adminLoginCheck(req, res);
    var userName = req.user.user_gn;
    var data = auth.fileinput('./public/infofile/aboutus.txt');
    res.render('adminSubPage/admin_aboutUs_update', { userName: userName, data: data });
});

router.post('/aboutus/update', function (req, res) {
    auth.adminLoginCheck(req, res);
    var data = req.body.aboutus;
    auth.fileoutput('./public/infofile/aboutus.txt', data);
    res.redirect('/admin/aboutus');
});


//admission 수정
router.get('/admission', function (req, res) {
    auth.adminLoginCheck(req, res);
    var userName = req.user.user_gn;
    var data = auth.fileinput('./public/infofile/admission.txt');
    res.render('adminSubPage/admin_admission', { userName: userName, data: data });
});

router.get('/admission/update', function (req, res) {
    auth.adminLoginCheck(req, res);
    var userName = req.user.user_gn;
    var data = auth.fileinput('./public/infofile/admission.txt');
    res.render('adminSubPage/admin_admission_update', { userName: userName, data: data });
});

router.post('/admission/update', function (req, res) {
    auth.adminLoginCheck(req, res);
    var data = req.body.admissions;
    auth.fileoutput('./public/infofile/admission.txt', data);
    res.redirect('/admin/admission');
});

//alumni
router.get('/alumni', function (req, res, next) {//Admission->alumni
    auth.adminLoginCheck(req, res);
    var userName = req.user.user_gn;
    var sql = "SELECT * FROM comment ORDER BY no DESC LIMIT 0, 3";
    conn.getConnection(function (err, client) {
        if (err) { console.log('connection Error', err); }
        client.query(sql, function (err, result) {
            if (err) {//Mysql Error
                console.log("Mysql Error" + err);
                res.status(500).send('Internal Server Error');
                return done(err);
            } else {
                res.render('adminSubPage/admin_admission_alumni', { userName: userName, comments: result });
            }
        });
    });
});
router.post('/alumni', function (req, res, next) {//Admission->alumni
    auth.adminLoginCheck(req, res);
    var course_title = req.body.course_title;
    var comment_title = req.body.comment_title;
    var comment = req.body.comment;
    var user_email = req.user.user_email;

    var sql = 'INSERT INTO comment(course_title, comment_title, comment, user_email) values (?,?,?,?)';
    var params = [course_title, comment_title, comment, user_email];
    conn.getConnection(function (err, client) {
        if (err) { console.log('connection Error', err); }
        client.query(sql, params, function (err, result) {
            if (err) {//Mysql Error
                console.log("Mysql Error" + err);
                res.status(500).send('Internal Server Error');
            } else {
                res.redirect('/alumni');
            }
        });
    });
});
router.post('/infiniteAlumni', function (req, res, next) {//Admission->alumni
    auth.adminLoginCheck(req, res);
    var infnite = req.body.infinite;
    var sql = "SELECT * FROM comment ORDER BY no DESC LIMIT ?, 3";
    conn.getConnection(function (err, client) {
        if (err) { console.log('connection Error', err); }
        client.query(sql, infnite * 3, function (err, result) {
            if (err) {//Mysql Error
                console.log("Mysql Error" + err);
                res.status(500).send('Internal Server Error');
                return done(err);
            } else {
                if (result.length == 0) {
                    res.send({ result: false });
                } else {
                    for (var i = 0; i < result.length; i++) {
                        result[i].comment = result[i].comment.toString();
                    }
                    res.send({ result: true, infiniteComments: result });
                }
            }
        });
    });
});
router.post('/deleteAlumni', function (req, res, next) {//Admission->alumni
    auth.adminLoginCheck(req, res);
    var no = req.body.no;
    conn.getConnection(function (err, client) {
        if (err) { console.log('connection Error', err); }
        var sql = "DELETE FROM comment WHERE no=?";
        var params = [no];
        client.query(sql, params, function (err, result) {
            if (err) {//Mysql Error
                console.log("Mysql Error" + err);
                res.status(500).send('Internal Server Error');
            } else {
                res.send({ result: true });
            }
        });

    });
});
router.get('/FAQ', function (req, res, next) {//Admission->FAQ
    auth.adminLoginCheck(req, res);
    var userName = req.user.user_gn;
    var sql = "select * from (select * from faq order by no desc limit 0, 1) as fa left join faq_comments as fc on fa.no = fc.faq_no order by no desc";
    conn.getConnection(function (err, client) {
        if (err) { console.log('connection Error', err); }
        client.query(sql, function (err, result) {
            if (err) {//Mysql Error
                console.log("Mysql Error" + err);
                res.status(500).send('Internal Server Error');
                return done(err);
            } else {
                var question = [];
                if (result.length != 0) {
                    question.push({ no: result[0].no, course_title: result[0].course_title, question_title: result[0].question_title, question: result[0].question, user_email: result[0].user_email, time: result[0].time.toFormat('HH24:MI DD/MM/YY'), comments: [] });
                    for (var i = 0; i < result.length; i++) {
                        if (result[i].comment_no != null) {
                            question[0].comments.push({ comment_no: result[i].comment_no, faq_no: result[i].faq_no, comment: result[i].comment, comment_user_email: result[i].comment_user_email, comment_time: result[i].comment_time.toFormat('HH24:MI DD/MM/YY') });
                        }
                    }
                }
                res.render('adminSubPage/admin_admission_faq', { userName: userName, question: question });
            }
        });
    });
});
router.post('/FAQ', function (req, res, next) {//Admission->FAQ
    auth.adminLoginCheck(req, res);
    var course_title = req.body.course_title;
    var question_title = req.body.question_title;
    var question = req.body.question;
    var user_email = req.user.user_email;
    var newDate = new Date();
    var time = newDate.toFormat('YYYY-MM-DD HH24:MI:SS');

    var sql = 'INSERT INTO faq(course_title, question_title, question, user_email, time) values (?,?,?,?,?)';
    var params = [course_title, question_title, question, user_email, time];
    conn.getConnection(function (err, client) {
        if (err) { console.log('connection Error', err); }
        client.query(sql, params, function (err, result) {
            if (err) {//Mysql Error
                console.log("Mysql Error" + err);
                res.status(500).send('Internal Server Error');
            } else {
                res.redirect('/admin/FAQ');
            }
        });
    });
});
router.post('/deleteFAQ', function (req, res, next) {//Admission->alumni
    auth.adminLoginCheck(req, res);
    var no = req.body.no;
    var sql;
    var params;
    conn.getConnection(function (err, client) {
        if (err) { console.log('connection Error', err); }
        sql = "DELETE FROM faq WHERE no=?";
        params = [no];
        client.query(sql, params, function (err, result) {
            if (err) {//Mysql Error
                console.log("Mysql Error" + err);
                res.status(500).send('Internal Server Error');
            } else {
                sql = "DELETE FROM faq_comments WHERE faq_no=?";
                params = [no];
                client.query(sql, params, function (err, result) {
                    if (err) {//Mysql Error
                        console.log("Mysql Error" + err);
                        res.status(500).send('Internal Server Error');
                    } else {
                        res.send({ result: true });
                    }
                });
            }
        });
    });
});

router.post('/FAQ_comment', function (req, res, next) {//Admission->FAQ
    auth.adminLoginCheck(req, res);
    var faq_no = req.body.faq_no;
    var comment = req.body.comment;
    var user_email = req.user.user_email;
    var newDate = new Date();
    var time = newDate.toFormat('YYYY-MM-DD HH24:MI:SS');
    var sql = 'INSERT INTO faq_comments(faq_no, comment, comment_user_email, comment_time) values (?,?,?,?)';
    var params = [faq_no, comment, user_email, time];
    conn.getConnection(function (err, client) {
        if (err) { console.log('connection Error', err); }
        client.query(sql, params, function (err, result) {
            if (err) {//Mysql Error
                console.log("Mysql Error" + err);
                res.status(500).send('Internal Server Error');
            } else {
                res.redirect('/admin/FAQ');
            }
        });
    });
});
router.post('/deleteFAQ_comment', function (req, res, next) {//Admission->alumni
    auth.adminLoginCheck(req, res);
    var user_email = req.user.user_email;
    var comment_no = req.body.comment_no;
    var sql;
    var params;
    conn.getConnection(function (err, client) {
        if (err) { console.log('connection Error', err); }
        sql = "DELETE FROM faq_comments WHERE comment_no=?";
        params = [comment_no];
        client.query(sql, params, function (err, result) {
            if (err) {//Mysql Error
                console.log("Mysql Error" + err);
                res.status(500).send('Internal Server Error');
            } else {
                res.send({ result: true });
            }
        });
    });
});
router.post('/infiniteFAQ', function (req, res, next) {//Admission->alumni
    auth.adminLoginCheck(req, res);
    var infnite = req.body.infinite;
    var sql = "select * from (select * from faq order by no desc LIMIT ?, 1) as fa left join faq_comments as fc on fa.no = fc.faq_no order by no desc";
    conn.getConnection(function (err, client) {
        if (err) { console.log('connection Error', err); }
        client.query(sql, parseInt(infnite), function (err, result) {
            if (err) {//Mysql Error
                console.log("Mysql Error" + err);
                res.status(500).send('Internal Server Error');
                return done(err);
            } else {
                if (result.length == 0) {
                    res.send({ result: false });
                } else {
                    var question = [{ no: result[0].no, course_title: result[0].course_title, question_title: result[0].question_title, question: result[0].question.toString(), user_email: result[0].user_email, time: result[0].time.toFormat('HH24:MI DD/MM/YY'), comments: [] }];
                    for (var i = 0; i < result.length; i++) {
                        if (result[i].comment_no != null) {
                            question[0].comments.push({ comment_no: result[i].comment_no, faq_no: result[i].faq_no, comment: result[i].comment.toString(), comment_user_email: result[i].comment_user_email, comment_time: result[i].comment_time.toFormat('HH24:MI DD/MM/YY') });
                        }
                    }
                    res.send({ result: true, infiniteQuestion: question });
                }
            }
        });
    });
});


//contact 수정
router.get('/contact', function (req, res) {
    auth.adminLoginCheck(req, res);
    var userName = req.user.user_gn;
    var data = auth.fileinput('./public/infofile/contact.txt');
    res.render('adminSubPage/admin_contact', { userName: userName, data: data });
});

router.get('/contact/update', function (req, res) {
    auth.adminLoginCheck(req, res);
    var userName = req.user.user_gn;
    var data = auth.fileinput('./public/infofile/contact.txt');
    res.render('adminSubPage/admin_contact_update', { userName: userName, data: data });
});

router.post('/contact/update', function (req, res) {
    auth.adminLoginCheck(req, res);
    var data = req.body.contact;
    auth.fileoutput('./public/infofile/contact.txt', data);
    res.redirect('/admin/contact');
});

//registereduser 출력
router.get('/registereduser', function (req, res, next) {
    auth.adminLoginCheck(req, res);
    var userName = req.user.user_gn;
    var sql = "select user.*,registered_course.courses  from registered_course, user where registered_course.user_email =user.user_email and registered_course.level =?";
    var params = ["basic"];
    var basicResult;
    var advancedResult;
    var specialResult;

    conn.getConnection(function (err, client) {
        if (err) { console.log('connection Error', err); }
        client.query(sql, params, function (err, Bresult) {
            if (err) {//Mysql Error
                console.log("Mysql Error" + err);
                res.status(500).send('Internal Server Error');
            } else {
                basicResult = Bresult;
                sql = "select user.*,registered_course.courses  from registered_course, user where registered_course.user_email =user.user_email and registered_course.level =?";
                params = ["advanced"];
                client.query(sql, params, function (err, Aresult) {

                    if (err) {//Mysql Error
                        console.log("Mysql Error" + err);
                        res.status(500).send('Internal Server Error');
                    } else {
                        advancedResult = Aresult;
                        sql = "select user.*,registered_course.courses  from registered_course, user where registered_course.user_email =user.user_email and registered_course.level =?";
                        params = ["special"];
                        client.query(sql, params, function (err, Sresult) {
                            if (err) {//Mysql Error
                                console.log("Mysql Error" + err);
                                res.status(500).send('Internal Server Error');
                            } else {
                                specialResult = Sresult;
                                res.render('adminSubPage/admin_registereduser', { userName: userName, coursesBasic: basicResult, coursesAdvanced: advancedResult, coursesSpecial: specialResult });
                            }
                        });
                    }
                });
            }
        });
    });
});

router.post('/registereduser', function (req, res, next) {
    auth.adminLoginCheck(req, res);

    var course = req.body.course;
    var level = req.body.level;
    var user_email = req.body.user_email;

    var sql = "SELECT * FROM registered_course WHERE user_email=? AND courses = ? AND level=?";
    var params = [user_email, course, level];

    conn.getConnection(function (err, client) {
        if (err) { console.log('connection Error', err); }
        client.query(sql, params, function (err, result) {
            if (result.length != 0) {
                res.send({ result: false });
            }
            else {
                sql = "INSERT INTO registered_course (user_email, courses, level) VALUES (?,?,?)";
                params = [user_email, course, level];
                client.query(sql, params, function (err, result) {
                    if (err) {//Mysql Error
                        console.log("Mysql Error" + err);
                        res.status(500).send('Internal Server Error');
                    } else {
                        res.send({ result: true });
                    }
                });
            }
        });
    });
});


//registereduser delete
router.post('/deleteregistereduser', function (req, res, next) {
    auth.adminLoginCheck(req, res);
    var user_num = req.params.user_num;
    var user_email = req.body.user_email;
    var courses = req.body.course;
    var level = req.body.level;
    var sql = 'DELETE FROM registered_course WHERE user_email = ? and courses = ? and level = ?';
    var params = [user_email, courses, level];

    conn.getConnection(function (err, client) {
        if (err) { console.log('connection Error', err); }
        client.query(sql, params, function (err, result) {
            if (err) {//Mysql Error
                console.log("Mysql Error" + err);
                res.status(500).send('Internal Server Error');
            } else {
                res.send({ result: 'success' });
            }
        });
    });
});


//------------------------basic course ----------------------------
//basic_course 목록
router.get('/basicCourse', function (req, res) {
    auth.adminLoginCheck(req, res);
    var userName = req.user.user_gn;
    var sql = "SELECT * FROM basic_course;";

    conn.getConnection(function (err, client) {
        if (err) { console.log('connection Error', err); }
        client.query(sql, function (err, result) {
            if (err) {//Mysql Error
                console.log("Mysql Error" + err);
                res.status(500).send('Internal Server Error');
                return done(err);
            } else {
                res.render('adminSubPage/admin_basic_course', { userName: userName, goods: result });
                console.log(result);
            }
        });
    });
});


//basic_course 추가
router.get('/basicCourse/add', function (req, res) {
    auth.adminLoginCheck(req, res);
    var userName = req.user.user_gn;
    res.render('adminSubPage/admin_basic_course_create', { userName: userName });
});

router.post('/basicCourse/add', function (req, res) {
    auth.adminLoginCheck(req, res);
    var no = req.body.no;
    var courses = req.body.c_name;
    var duration = req.body.c_duration;
    var date = req.body.c_date;
    var hours = req.body.c_hours;
    var trainers = req.body.c_trainer;
    var courses_managers = req.body.c_courseManager;
    var courses_facilitators = req.body.c_courseFacilitator;
    var course = {
        courses: courses,
        no: no,
        duration: duration,
        date: date,
        hours: hours,
        trainers: trainers,
        courses_managers: courses_managers,
        courses_facilitators: courses_facilitators
    };
    var sql = 'INSERT INTO basic_course SET ?';
    conn.getConnection(function (err, client) {
        if (err) { console.log('connection Error', err); }
        client.query(sql, course, function (err, result) {
            if (err) {//Mysql Error
                console.log("Mysql Error" + err);
                res.status(500).send('Internal Server Error');
            } else {
                res.redirect('/admin/basicCourse/');
            }
        });
    });
});

// //basic_course 수정
router.get('/basicCourse/:no/edit', function (req, res) {
    auth.adminLoginCheck(req, res);
    var userName = req.user.user_gn;
    var no = req.params.no;
    var sql = "SELECT * FROM basic_course where no = ? ";
    conn.getConnection(function (err, client) {
        if (err) { console.log('connection Error', err); }
        client.query(sql, [no], function (err, result) {
            if (err) {//Mysql Error
                console.log("Mysql Error" + err);
                res.status(500).send('Internal Server Error');
            } else {
                res.render('adminSubPage/admin_basic_course_edit', { userName: userName, goods: result[0] });
            }
        });
    });

});


router.post('/basicCourse/:no/edit', function (req, res) {
    var no = req.params.no;
    var duration = req.body.c_duration;
    var date = req.body.c_date;
    var hours = req.body.c_hours;
    var trainers = req.body.c_trainer;
    var courses_managers = req.body.c_courseManager;
    var courses_facilitators = req.body.c_courseFacilitator;
    var sql = "UPDATE basic_course SET duration = ?, date = ?, hours =?,trainers = ?, courses_managers=?, courses_facilitators=? where no = ?";
    var params = [duration, date, hours, trainers, courses_managers, courses_facilitators, no];
    conn.getConnection(function (err, client) {
        console.log(sql);
        if (err) { console.log('connection Error', err); }

        client.query(sql, params, function (err, result) {
            if (err) {//Mysql Error
                console.log("Mysql Error" + err);
                res.status(500).send('Internal Server Error');
            } else {
                res.redirect('/admin/basicCourse/');
            }
        });
    });

});

//basic_course 삭제
router.post('/basicCourse/:no/delete', function (req, res) {

    var no = req.params.no;
    var sql = 'select registered_course.courses from registered_course,basic_course WHERE registered_course.courses = basic_course.courses and registered_course.level = ? and basic_course.no = ?';
    var params = ["basic", no];
    conn.getConnection(function (err, client) {
        if (err) { console.log('connection Error', err); }
        client.query(sql, params, function (err, result) {
            if (err) {//Mysql Error
                console.log("Mysql Error" + err);
                res.status(500).send('Internal Server Error');
            } else {
                if (result[0] != null) {
                    var courses = result[0].courses;
                    params = [courses, "basic"];

                    sql = "DELETE FROM registered_course where courses = ? and level = ?"
                    client.query(sql, params, function (err, result) {

                        if (err) {//Mysql Error
                            console.log("Mysql Error" + err);
                            res.status(500).send('Internal Server Error');
                        } else {
                            sql = 'DELETE FROM basic_course where courses = ?';
                            params = [courses];
                            client.query(sql, params, function (err, result) {
                                if (err) {//Mysql Error
                                    console.log("Mysql Error" + err);
                                    res.status(500).send('Internal Server Error');
                                } else {
                                    res.redirect('/admin/basicCourse/');
                                }
                            });
                        }
                    });
                }
                else {
                    sql = 'DELETE FROM basic_course where no = ?';
                    params = [no];
                    client.query(sql, params, function (err, result) {
                        if (err) {//Mysql Error
                            console.log("Mysql Error" + err);
                            res.status(500).send('Internal Server Error');
                        } else {
                            res.redirect('/admin/basicCourse/');
                        }
                    });
                }
            }
        });
    });

});

//basic_course 보기
router.get('/basicCourse/:no', function (req, res) {
    auth.adminLoginCheck(req, res);
    var userName = req.user.user_gn;
    var no = req.params.no;
    var sql = "SELECT * FROM basic_course WHERE no = ?";

    conn.getConnection(function (err, client) {
        if (err) { console.log('connection Error', err); }
        client.query(sql, [no], function (err, result) {
            if (err) {//Mysql Error
                console.log("Mysql Error" + err);
                res.status(500).send('Internal Server Error');
                return done(err);
            } else {
                res.render('adminSubPage/admin_basic_course_edit', { userName: userName, goods: result[0] });
            }
        });
    });

});


//------------------------advanced course ----------------------------
//advanced_course 목록
router.get('/advancedCourse', function (req, res) {
    auth.adminLoginCheck(req, res);
    var userName = req.user.user_gn;
    var sql = "SELECT * FROM advanced_course;";

    conn.getConnection(function (err, client) {
        if (err) { console.log('connection Error', err); }
        client.query(sql, function (err, result) {
            if (err) {//Mysql Error
                console.log("Mysql Error" + err);
                res.status(500).send('Internal Server Error');
                return done(err);
            } else {
                res.render('adminSubPage/admin_advanced_course', { userName: userName, goods: result });
            }
        });
    });
});


//advanced_course 추가
router.get('/advancedCourse/add', function (req, res) {
    auth.adminLoginCheck(req, res);
    var userName = req.user.user_gn;
    res.render('adminSubPage/admin_advanced_course_create', { userName: userName });
});
router.post('/advancedCourse/add', function (req, res) {
    auth.adminLoginCheck(req, res);
    var no = req.body.no;
    var courses = req.body.c_name;
    var duration = req.body.c_duration;
    var date = req.body.c_date;
    var hours = req.body.c_hours;
    var trainers = req.body.c_trainer;
    var courses_managers = req.body.c_courseManager;
    var courses_facilitators = req.body.c_courseFacilitator;
    var course = {
        courses: courses,
        no: no,
        duration: duration,
        date: date,
        hours: hours,
        trainers: trainers,
        courses_managers: courses_managers,
        courses_facilitators: courses_facilitators
    };

    var sql = 'INSERT INTO advanced_course SET ?';
    conn.getConnection(function (err, client) {
        if (err) { console.log('connection Error', err); }
        client.query(sql, course, function (err, result) {
            if (err) {//Mysql Error
                console.log("Mysql Error" + err);
                res.status(500).send('Internal Server Error');
            } else {
                res.redirect('/admin/advancedCourse/');
            }
        });
    });
});

//advanced_course 수정
router.get('/advancedCourse/:no/edit', function (req, res) {
    auth.adminLoginCheck(req, res);
    var userName = req.user.user_gn;
    var no = req.params.no;
    var sql = "SELECT * FROM advanced_course where no = ? ";
    conn.getConnection(function (err, client) {
        if (err) { console.log('connection Error', err); }
        client.query(sql, [no], function (err, result) {
            if (err) {//Mysql Error
                console.log("Mysql Error" + err);
                res.status(500).send('Internal Server Error');
            } else {
                res.render('adminSubPage/admin_advanced_course_edit', { userName: userName, goods: result[0] });
            }
        });
    });

});

router.post('/advancedCourse/:no/edit', function (req, res) {
    var no = req.params.no;
    var duration = req.body.c_duration;
    var date = req.body.c_date;
    var hours = req.body.c_hours;
    var trainers = req.body.c_trainer;
    var courses_managers = req.body.c_courseManager;
    var courses_facilitators = req.body.c_courseFacilitator;
    var sql = "UPDATE advanced_course SET duration = ?, date = ?, hours =?,trainers = ?, courses_managers=?, courses_facilitators=? where no = ?";
    var params = [duration, date, hours, trainers, courses_managers, courses_facilitators, no];
    conn.getConnection(function (err, client) {
        if (err) { console.log('connection Error', err); }

        client.query(sql, params, function (err, result) {
            if (err) {//Mysql Error
                console.log("Mysql Error" + err);
                res.status(500).send('Internal Server Error');
            } else {
                res.redirect('/admin/advancedCourse/');
            }
        });
    });

});

//advanced_course 삭제
router.post('/advancedCourse/:no/delete', function (req, res) {
    var no = req.params.no;
    var sql = 'select registered_course.courses from registered_course,basic_course WHERE registered_course.courses = basic_course.courses and registered_course.level = ? and basic_course.no = ?';
    var params = ["advanced", no];
    conn.getConnection(function (err, client) {
        console.log(sql);
        if (err) { console.log('connection Error', err); }
        client.query(sql, params, function (err, result) {
            if (err) {//Mysql Error
                console.log("Mysql Error" + err);
                res.status(500).send('Internal Server Error');
            } else {
                if (result[0] != null) {
                    var courses = result[0].courses;
                    params = [courses, "advanced"];

                    sql = "DELETE FROM registered_course where courses = ? and level = ?"
                    client.query(sql, params, function (err, result) {

                        if (err) {//Mysql Error
                            console.log("Mysql Error" + err);
                            res.status(500).send('Internal Server Error');
                        } else {
                            sql = 'DELETE FROM basic_course where courses = ?';
                            params = [courses];
                            client.query(sql, params, function (err, result) {
                                if (err) {//Mysql Error
                                    console.log("Mysql Error" + err);
                                    res.status(500).send('Internal Server Error');
                                } else {
                                    res.redirect('/admin/advancedCourse/');
                                }
                            });
                        }
                    });
                }
                else {
                    sql = 'DELETE FROM advanced_course where no = ?';
                    params = [no];
                    client.query(sql, params, function (err, result) {
                        if (err) {//Mysql Error
                            console.log("Mysql Error" + err);
                            res.status(500).send('Internal Server Error');
                        } else {
                            res.redirect('/admin/advancedCourse/');
                        }
                    });
                }
            }
        });
    });

});


//advanced_course 보기
router.get('/advancedCourse/:no', function (req, res) {
    auth.adminLoginCheck(req, res);
    var userName = req.user.user_gn;
    var no = req.params.no;
    var sql = "SELECT * FROM advanced_course WHERE no = ?";

    conn.getConnection(function (err, client) {
        if (err) { console.log('connection Error', err); }
        client.query(sql, [no], function (err, result) {
            if (err) {//Mysql Error
                res.status(500).send('Internal Server Error');
                return done(err);
            } else {
                res.render('adminSubPage/admin_advanced_course_edit', { userName: userName, goods: result[0] });
            }
        });
    });

});

//------------------------special_lecture ----------------------------
//special_lecture 목록
router.get('/special_lecture', function (req, res) {
    auth.adminLoginCheck(req, res);
    var userName = req.user.user_gn;
    var sql = "SELECT * FROM special_lecture;";

    conn.getConnection(function (err, client) {
        if (err) { console.log('connection Error', err); }
        client.query(sql, function (err, result) {
            if (err) {//Mysql Error
                console.log("Mysql Error" + err);
                res.status(500).send('Internal Server Error');
                return done(err);
            } else {
                res.render('adminSubPage/admin_special_lecture', { userName: userName, goods: result });
            }
        });
    });
});


//special_lecture 추가
router.get('/special_lecture/add', function (req, res) {
    auth.adminLoginCheck(req, res);
    var userName = req.user.user_gn;
    res.render('adminSubPage/admin_special_lecture_create', { userName: userName });
});
router.post('/special_lecture/add', function (req, res) {
    auth.adminLoginCheck(req, res);
    var no = req.body.no;
    var courses = req.body.c_name;
    var duration = req.body.c_duration;
    var date = req.body.c_date;
    var hours = req.body.c_hours;
    var trainers = req.body.c_trainer;
    var courses_managers = req.body.c_courseManager;
    var courses_facilitators = req.body.c_courseFacilitator;
    var course = {
        courses: courses,
        no: no,
        duration: duration,
        date: date,
        hours: hours,
        trainers: trainers,
        courses_managers: courses_managers,
        courses_facilitators: courses_facilitators
    };

    var sql = 'INSERT INTO special_lecture SET ?';
    conn.getConnection(function (err, client) {
        if (err) { console.log('connection Error', err); }
        client.query(sql, course, function (err, result) {
            if (err) {//Mysql Error
                console.log("Mysql Error" + err);
                res.status(500).send('Internal Server Error');
            } else {
                res.redirect('/admin/special_lecture/');
            }
        });
    });
});

//special_lecture 수정
router.get('/special_lecture/:no/edit', function (req, res) {
    auth.adminLoginCheck(req, res);
    var userName = req.user.user_gn;
    var no = req.params.no;
    var sql = "SELECT * FROM special_lecture where no = ? ";
    conn.getConnection(function (err, client) {
        if (err) { console.log('connection Error', err); }
        client.query(sql, [no], function (err, result) {
            if (err) {//Mysql Error
                console.log("Mysql Error" + err);
                res.status(500).send('Internal Server Error');
            } else {
                res.render('adminSubPage/admin_special_lecture_edit', { userName: userName, goods: result[0] });
            }
        });
    });

});

router.post('/special_lecture/:no/edit', function (req, res) {
    var no = req.params.no;
    var duration = req.body.c_duration;
    var date = req.body.c_date;
    var hours = req.body.c_hours;
    var trainers = req.body.c_trainer;
    var courses_managers = req.body.c_courseManager;
    var courses_facilitators = req.body.c_courseFacilitator;
    var sql = "UPDATE special_lecture SET duration = ?, date = ?, hours =?,trainers = ?, courses_managers=?, courses_Facilitators=? where no = ?";
    var params = [duration, date, hours, trainers, courses_managers, courses_facilitators, no];
    conn.getConnection(function (err, client) {
        if (err) { console.log('connection Error', err); }

        client.query(sql, params, function (err, result) {
            if (err) {//Mysql Error
                console.log("Mysql Error" + err);
                res.status(500).send('Internal Server Error');
            } else {
                res.redirect('/admin/special_lecture/');
            }
        });
    });

});

//special_lecture 삭제
router.post('/special_lecture/:no/delete', function (req, res) {
    var no = req.params.no;

    var sql = 'select registered_course.courses from registered_course,basic_course WHERE registered_course.courses = basic_course.courses and registered_course.level = ? and basic_course.no = ?';
    var params = ["special", no];
    conn.getConnection(function (err, client) {
        if (err) { console.log('connection Error', err); }
        client.query(sql, params, function (err, result) {
            if (err) {//Mysql Error
                console.log("Mysql Error" + err);
                res.status(500).send('Internal Server Error');
            } else {
                if (result[0] != null) {
                    var courses = result[0].courses;
                    params = [courses, "special"];

                    sql = "DELETE FROM registered_course where courses = ? and level = ?"
                    client.query(sql, params, function (err, result) {

                        if (err) {//Mysql Error
                            console.log("Mysql Error" + err);
                            res.status(500).send('Internal Server Error');
                        } else {
                            sql = 'DELETE FROM basic_course where courses = ?';
                            params = [courses];
                            client.query(sql, params, function (err, result) {
                                if (err) {//Mysql Error
                                    console.log("Mysql Error" + err);
                                    res.status(500).send('Internal Server Error');
                                } else {
                                    res.redirect('/admin/special_lecture/');
                                }
                            });
                        }
                    });
                }
                else {
                    sql = 'DELETE FROM special_lecture where no = ?';
                    params = [no];
                    client.query(sql, params, function (err, result) {
                        if (err) {//Mysql Error
                            console.log("Mysql Error" + err);
                            res.status(500).send('Internal Server Error');
                        } else {
                            res.redirect('/admin/special_lecture/');
                        }
                    });
                }
            }
        });
    });
});


//special_lecture 보기
router.get('/special_lecture/:no', function (req, res) {
    auth.adminLoginCheck(req, res);
    var userName = req.user.user_gn;
    var no = req.params.no;
    var sql = "SELECT * FROM special_lecture WHERE no = ?";

    conn.getConnection(function (err, client) {
        if (err) { console.log('connection Error', err); }
        client.query(sql, [no], function (err, result) {
            if (err) {//Mysql Error
                console.log("Mysql Error" + err);
                res.status(500).send('Internal Server Error');
                return done(err);
            } else {
                res.render('adminSubPage/admin_special_lecture_edit', { userName: userName, goods: result[0] });
            }
        });
    });

});


//------------------------news ----------------------------
//news 조회
router.get('/news', function (req, res, next) {
    res.redirect('/admin/news/' + 1);
});


//news 추가
router.get('/news/add', function (req, res) {
    var userName = req.user.user_gn;
    auth.adminLoginCheck(req, res);

    res.render('adminSubPage/admin_news_create', { userName: userName });
});

router.post('/news/add', function (req, res) {
    auth.adminLoginCheck(req, res);
    var no = req.body.no;
    var title = req.body.title;
    var contents = req.body.contents;

    var newDate = new Date();
    var time = newDate.toFormat('YYYY-MM-DD HH24:MI:SS');
    var sql = 'INSERT INTO news(title, date,contents) values (?,?,?)';
    var params = [title, time, contents];
    conn.getConnection(function (err, client) {
        if (err) { console.log('connection Error', err); }
        client.query(sql, params, function (err, result) {
            if (err) {//Mysql Error
                console.log("Mysql Error" + err);
                res.status(500).send('Internal Server Error');
            } else {
                var queryString = "select count(*) as cnt from news";
                client.query(queryString, function (err, result) {
                    if (err) {//Mysql Error
                        console.log("Mysql Error" + err);
                        res.status(500).send('Internal Server Error');
                    } else {
                        var endPage = Math.ceil(result[0].cnt / 10);
                        res.redirect('/admin/news/' + endPage);
                    }
                });
            }
        });
    });
});

router.get('/news/:cur', function (req, res, next) {
    auth.adminLoginCheck(req, res);
    var userName = req.user.user_gn;
    //페이지당 게시물 수 : 한 페이지 당 10개 게시물
    var page_size = 10;
    //페이지의 갯수 : 1 ~ 10개 페이지
    var page_list_size = 10;
    //limit 변수
    var no = "";
    //전체 게시물의 숫자
    var totalPageCount = 0;

    var queryString = "select count(*) as cnt from news";
    var sql = "select * from news order by no desc limit ?,?";

    conn.getConnection(function (err, client) {
        if (err) { console.log('connection Error', err); }
        client.query(queryString, function (err, data) {
            if (err) {//Mysql Error
                console.log("Mysql Error" + err);
                res.status(500).send('Internal Server Error');
            } else {
                totalPageCount = data[0].cnt;
                var curPage = req.params.cur;

                //전체 페이지 갯수
                if (totalPageCount < 0) {
                    totalPageCount = 0
                }

                var totalPage = Math.ceil(totalPageCount / page_size);// 전체 페이지수
                var totalSet = Math.ceil(totalPage / page_list_size); //전체 세트수
                var curSet = Math.ceil(curPage / page_list_size) // 현재 셋트 번호
                var startPage = ((curSet - 1) * page_size) + 1 //현재 세트내 출력될 시작 페이지
                var endPage = (startPage + page_list_size) - 1; //현재 세트내 출력될 마지막 페이지


                //현재페이지가 0 보다 작으면
                if (curPage < 0) {
                    no = 0
                } else {
                    //0보다 크면 limit 함수에 들어갈 첫번째 인자 값 구하기
                    no = (curPage - 1) * page_size
                }
                var result2 = {
                    "curPage": curPage,
                    "page_list_size": page_list_size,
                    "page_size": page_size,
                    "totalPage": totalPage,
                    "totalSet": totalSet,
                    "curSet": curSet,
                    "startPage": startPage,
                    "endPage": endPage
                };
                client.query(sql, [no, page_size], function (error, result) {
                    if (error) {//Mysql Error
                        console.log("Mysql Error" + error);
                        res.status(500).send('Internal Server Error');
                    } else {
                        var time = new Array();
                        for (var i = 0; i < result.length; i++) {
                            time.push(result[i].date.toFormat('HH24:MI DD/MM/YY'));
                        }
                        res.render('adminSubPage/admin_news', {
                            userName: userName, goods: result, time: time, result2: result2, endPage: endPage
                        });
                    }
                });
            }
        });
    });

});

//news 수정
router.get('/news/edit/:no', function (req, res) {
    auth.adminLoginCheck(req, res);
    var userName = req.user.user_gn;
    var no = req.params.no;
    var sql = "SELECT * FROM news where no = ? ";
    conn.getConnection(function (err, client) {
        if (err) { console.log('connection Error', err); }
        client.query(sql, [no], function (err, result) {
            if (err) {//Mysql Error
                console.log("Mysql Error" + err);
                res.status(500).send('Internal Server Error');
            } else {
                res.render('adminSubPage/admin_newsContent_update', { userName: userName, goods: result[0] });
            }
        });
    });

});

router.post('/news/edit/:no', function (req, res) {
    var no = req.params.no;
    var title = req.body.title;
    var contents = req.body.contents;
    var sql = "UPDATE news SET title =?, contents =? where no = ?";
    var params = [title, contents, no];
    conn.getConnection(function (err, client) {
        if (err) { console.log('connection Error', err); }

        client.query(sql, params, function (err, result) {
            if (err) {//Mysql Error
                console.log("Mysql Error" + err);
                res.status(500).send('Internal Server Error');
            } else {
                res.redirect('/admin/news/view/' + no);
            }
        });
    });

});

//news 삭제
router.post('/news/delete/:no', function (req, res) {
    var no = req.params.no;
    var sql = 'DELETE FROM news where no = ?';

    conn.getConnection(function (err, client) {
        if (err) { console.log('connection Error', err); }
        client.query(sql, [no], function (err, result) {
            if (err) {//Mysql Error
                console.log("Mysql Error" + err);
                res.status(500).send('Internal Server Error');
            } else {
                res.redirect('/admin/news/');
            }
        });
    });

});

// //news 보기
router.get('/news/view/:no', function (req, res) {
    auth.adminLoginCheck(req, res);
    var userName = req.user.user_gn;
    var no = req.params.no;
    var sql = "SELECT * FROM news WHERE no = ?";

    conn.getConnection(function (err, client) {
        if (err) { console.log('connection Error', err); }
        client.query(sql, [no], function (err, result) {
            if (err) {//Mysql Error
                console.log("Mysql Error" + err);
                res.status(500).send('Internal Server Error');
                return done(err);
            } else {
                res.render('adminSubPage/admin_newsContent', { userName: userName, goods: result[0] });
            }
        });
    });

});


//------------------------specialActivity ----------------------------
//specialActivity 조회
router.get('/specialActivity', function (req, res, next) {
    res.redirect('/admin/specialActivity/' + 1);
});


//specialActivity 추가
router.get('/specialActivity/add', function (req, res) {
    var userName = req.user.user_gn;
    auth.adminLoginCheck(req, res);
    res.render('adminSubPage/admin_specialActivity_create', { userName: userName });
});

router.post('/specialActivity/add', upload.single('file'), function (req, res) {
    auth.adminLoginCheck(req, res);
    var no = req.params.no;
    var title = req.body.title;
    var contents = req.body.contents;
    var newDate = new Date();
    var time = newDate.toFormat('YYYY-MM-DD HH24:MI:SS');
    var file = req.file;
    if (file != null)
    {
        file = req.file.path;
        var newfile = file.substring(5);
        var sql = 'INSERT INTO specialActivity(title, date,contents,file) values (?,?,?,?)';
        var params = [title, time, contents, newfile];
    }
    else{
        var sql = 'INSERT INTO specialActivity(title, date,contents) values (?,?,?)';
        var params = [title, time, contents];
    }
    conn.getConnection(function (err, client) {
        if (err) { console.log('connection Error', err); }
        client.query(sql, params, function (err, result) {
            if (err) {//Mysql Error
                console.log("Mysql Error" + err);
                res.status(500).send('Internal Server Error');
            } else {
                var queryString = "select count(*) as cnt from specialActivity";
                client.query(queryString, function (err, result) {
                    if (err) {//Mysql Error
                        console.log("Mysql Error" + err);
                        res.status(500).send('Internal Server Error');
                    } else {

                        var endPage = Math.ceil(result[0].cnt / 10);
                        res.redirect('/admin/specialActivity/' + endPage);
                    }
                });
            }
        });
    });
});

router.get('/specialActivity/:cur', function (req, res, next) {
    auth.adminLoginCheck(req, res);
    var userName = req.user.user_gn;
    //페이지당 게시물 수 : 한 페이지 당 10개 게시물
    var page_size = 10;
    //페이지의 갯수 : 1 ~ 10개 페이지
    var page_list_size = 10;
    //limit 변수
    var no = "";
    //전체 게시물의 숫자
    var totalPageCount = 0;

    var queryString = "select count(*) as cnt from specialActivity";
    var sql = "select * from specialActivity order by no desc limit ?,?";

    conn.getConnection(function (err, client) {
        if (err) { console.log('connection Error', err); }
        client.query(queryString, function (err, data) {
            if (err) {//Mysql Error
                console.log("Mysql Error" + err);
                res.status(500).send('Internal Server Error');
            } else {
                totalPageCount = data[0].cnt;
                var curPage = req.params.cur;
                //전체 페이지 갯수
                if (totalPageCount < 0) {
                    totalPageCount = 0
                }

                var totalPage = Math.ceil(totalPageCount / page_size);// 전체 페이지수
                var totalSet = Math.ceil(totalPage / page_list_size); //전체 세트수
                var curSet = Math.ceil(curPage / page_list_size) // 현재 셋트 번호
                var startPage = ((curSet - 1) * page_size) + 1 //현재 세트내 출력될 시작 페이지
                var endPage = (startPage + page_list_size) - 1; //현재 세트내 출력될 마지막 페이지


                //현재페이지가 0 보다 작으면
                if (curPage < 0) {
                    no = 0
                } else {
                    //0보다 크면 limit 함수에 들어갈 첫번째 인자 값 구하기
                    no = (curPage - 1) * page_size
                }

                var result2 = {
                    "curPage": curPage,
                    "page_list_size": page_list_size,
                    "page_size": page_size,
                    "totalPage": totalPage,
                    "totalSet": totalSet,
                    "curSet": curSet,
                    "startPage": startPage,
                    "endPage": endPage
                };
                client.query(sql, [no, page_size], function (error, result) {
                    if (error) {//Mysql Error
                        console.log("Mysql Error" + error);
                        res.status(500).send('Internal Server Error');
                    } else {
                        var time = new Array();
                        for (var i = 0; i < result.length; i++) {
                            time.push(result[i].date.toFormat('HH24:MI DD/MM/YY'));
                        }
                        res.render('adminSubPage/admin_specialActivity', {
                            userName: userName, goods: result, time: time, result2: result2, endPage: endPage
                        });
                    }
                });
            }
        });
    });

});

//specialActivity 수정
router.get('/specialActivity/edit/:no', function (req, res) {
    auth.adminLoginCheck(req, res);
    var userName = req.user.user_gn;
    var no = req.params.no;
    var sql = "SELECT * FROM specialActivity where no = ? ";
    conn.getConnection(function (err, client) {
        if (err) { console.log('connection Error', err); }
        client.query(sql, [no], function (err, result) {
            if (err) {//Mysql Error
                console.log("Mysql Error" + err);
                res.status(500).send('Internal Server Error');
            } else {
                res.render('adminSubPage/admin_specialActivityContent_update', { userName: userName, goods: result[0] });
            }
        });
    });

});

router.post('/specialActivity/edit/:no', upload.single('file'), function (req, res) {
    var no = req.params.no;
    var title = req.body.title;
    var contents = req.body.contents;
    var file = req.file;
    if (file != null)
    {
        file = req.file.path;
        var newfile = file.substring(5);
        var sql = "UPDATE specialActivity SET title =?, contents =?, file = ? where no = ?";
        var params = [title, contents, newfile, no];
    }
    else{
        var sql = "UPDATE specialActivity SET title =?, contents =? where no = ?";
        var params = [title, contents, no];
    }
    conn.getConnection(function (err, client) {
        if (err) { console.log('connection Error', err); }
        client.query(sql, params, function (err, result) {
            if (err) {//Mysql Error
                console.log("Mysql Error" + err);
                res.status(500).send('Internal Server Error');
            } else {
                res.redirect('/admin/specialActivity/view/' + no);
            }
        });
    });

});

//specialActivity 삭제
router.post('/specialActivity/delete/:no', function (req, res) {
    var no = req.params.no;
    var sql = 'select file from specialActivity where no =?';
    conn.getConnection(function (err, client) {
        if (err) { console.log('connection Error', err); }
        client.query(sql, [no], function (err, result) {
            if (err) {//Mysql Error
                console.log("Mysql Error" + err);
                res.status(500).send('Internal Server Error');

            } else {
                var filename = "views/" + result[0].file;
                fs.unlink(filename, function (err) {
                    if (err) throw err;
                    console.log('file deleted');
                })

                sql = 'DELETE FROM specialActivity where no = ?';
                client.query(sql, [no], function (err, result) {
                    if (err) {//Mysql Error
                        console.log("Mysql Error" + err);
                        res.status(500).send('Internal Server Error');
                    } else {

                        res.redirect('/admin/specialActivity/');
                    }
                });
            }
        });
    });

});


router.get('/specialActivity/view/:no', function (req, res) {
    auth.adminLoginCheck(req, res);
    var userName = req.user.user_gn;
    var no = req.params.no;
    var date = req.body.date;
    var sql = "SELECT * FROM specialActivity WHERE no = ?"; // 첫 번째 게시물
    var params = [no];
    conn.getConnection(function (err, client) {
        if (err) { console.log('connection Error', err); }
        client.query(sql, params, function (err, result1) {
            if (err) {//Mysql Error
                console.log("Mysql Error" + err);
                res.status(500).send('Internal Server Error');
            } else {
                params = [result1[0].no];
                sql = "select * from specialActivity where no < ? order by no desc limit 1";
                client.query(sql, params, function (err, result2) {
                    if (err) {//Mysql Error
                        console.log("Mysql Error" + err);
                        res.status(500).send('Internal Server Error');
                    } else {
                        sql = "select * from specialActivity where no > ? order by no limit 1";
                        client.query(sql, params, function (err, result3) {
                            if (err) {//Mysql Error
                                console.log("Mysql Error" + err);
                                res.status(500).send('Internal Server Error');
                            } else {
                                var result = new Array();
                                var check = new Array();
                                var time = new Array();

                                if (result1[0] != null && result2[0] != null && result3[0] != null) // 전 게시물도 있고, 다음 게시물도 있고
                                {
                                    result.push(result2[0]); result.push(result1[0]); result.push(result3[0]);
                                    check.push(-1); check.push(0); check.push(1);
                                    time.push(result[1].date.toFormat('HH24:MI DD/MM/YY'));
                                } // 아예 첫 게시물 
                                else if (result1[0] != null && result2[0] == null && result3[0] == null) {
                                    result.push(result1[0]);
                                    check.push(-1)
                                    time.push(result[0].date.toFormat('HH24:MI DD/MM/YY'));

                                }
                                else if (result1[0] != null) { // 게시물이 두 개일 때
                                    if (result2[0] != null) {
                                        result.push(result2[0]); result.push(result1[0]);
                                        if (Number(result[0].no) < Number(no)) // 전 게시물은 있고, 내 게시물이 마지막
                                        {
                                            check.push(1);
                                            time.push(result[1].date.toFormat('HH24:MI DD/MM/YY'));
                                        }
                                    }
                                    else if (result3[0] != null) {
                                        result.push(result1[0]); result.push(result3[0]);
                                        if (result[0].no == no) // 전 게시물이 없고, 내 게시물이 처음, 다음 게시물은 있음
                                        {
                                            check.push(0);
                                            time.push(result[0].date.toFormat('HH24:MI DD/MM/YY'));
                                        }
                                    }
                                }
                                res.render('adminSubPage/admin_specialActivityContent', { userName: userName, goods: result, check: check, time: time });
                            }
                        });
                    }
                });
            }
        });
    });

});


//------------------------register admin ----------------------------
router.get('/registeradmin', function (req, res, next) {

    auth.adminLoginCheck(req, res);
    var userName = req.user.user_gn;
    auth.adminLoginCheck(req, res);
    res.render('adminSubPage/admin_registerAdmin', { userName: userName });
});

router.post('/registeradmin', function (req, res) {
    auth.adminLoginCheck(req, res);

    var user_email = req.body.user_email;
    var user_pw = req.body.user_pw;
    var user_fn = req.body.user_fn;
    var user_gn = req.body.user_gn;
    var user_sex = "admin";
    var user_birth = "admin";
    var user_nation = "admin";
    var user_phone = "admin";
    var user_position = "admin";
    var user_part = "admin";
    var user_offid = "admin";
    var query = 'SELECT * FROM user WHERE user_email = ?';
    conn.getConnection(function (err, client) {
        if (err) { console.log('signup connection Error', err); }
        client.query(query, user_email, function (err, result) {
            if (err) {//Mysql Error
                console.log("Sign Up mysql ERROR!!" + err);
            }
            else {
                if (result.length != 0) {
                    req.flash('signupMessage', 'Email already used!');
                    res.redirect('/admin/registeradmin');
                }
                else {
                    var crypto_pw = crypto.cryptoHash(user_pw);
                    query = 'INSERT INTO user (user_email, user_pw, user_fn, user_gn, user_sex, user_birth, user_nation, user_phone, user_position, user_part, user_offid, user_check) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)';
                    params = [user_email, crypto_pw, user_fn, user_gn, user_sex, user_birth, user_nation, user_phone, user_position, user_part, user_offid, "admin"];
                    client.query(query, params, function (err, result) {
                        if (err) {//Mysql Error
                            console.log("Sign Up mysql ERROR!!" + err);
                        }
                        else {
                            console.log("Sign Up Success!!");
                            req.flash('signupMessage', 'Regist Success!');
                            res.redirect('/admin/registeradmin');
                        }
                    });
                }
            }
        });
    });
});

//------------------------user management ----------------------------

//usermanagement 조회
router.get('/usermanagement/user', function (req, res, next) {
    res.redirect('/admin/usermanagement/user/' + 1);
});

router.get('/usermanagement/user/:cur', function (req, res, next) {
    auth.adminLoginCheck(req, res);
    var userName = req.user.user_gn;
    //페이지당 게시물 수 : 한 페이지 당 10개 게시물
    var page_size = 10;
    //페이지의 갯수 : 1 ~ 10개 페이지
    var page_list_size = 10;
    //limit 변수
    var user_num = "";
    //전체 게시물의 숫자
    var totalPageCount = 0;

    var queryString = "select count(*) as cnt from user where user_check = ?";
    var sql = "select * from user where user_check = ?  order by user_num asc limit ?,?";
    var params = ["user"];
    conn.getConnection(function (err, client) {
        if (err) { console.log('connection Error', err); }
        client.query(queryString, params, function (err, data) {
            if (err) {//Mysql Error
                console.log("Mysql Error" + err);
                res.status(500).send('Internal Server Error');
            } else {
                totalPageCount = data[0].cnt;
                var curPage = req.params.cur;
                //전체 페이지 갯수
                if (totalPageCount < 0) {
                    totalPageCount = 0
                }

                var totalPage = Math.ceil(totalPageCount / page_size);// 전체 페이지수
                var totalSet = Math.ceil(totalPage / page_list_size); //전체 세트수
                var curSet = Math.ceil(curPage / page_list_size) // 현재 셋트 번호
                var startPage = ((curSet - 1) * page_size) + 1 //현재 세트내 출력될 시작 페이지
                var endPage = (startPage + page_list_size) - 1; //현재 세트내 출력될 마지막 페이지


                //현재페이지가 0 보다 작으면
                if (curPage < 0) {
                    user_num = 0
                } else {
                    //0보다 크면 limit 함수에 들어갈 첫번째 인자 값 구하기
                    user_num = (curPage - 1) * page_size
                }

                var result2 = {
                    "curPage": curPage,
                    "page_list_size": page_list_size,
                    "page_size": page_size,
                    "totalPage": totalPage,
                    "totalSet": totalSet,
                    "curSet": curSet,
                    "startPage": startPage,
                    "endPage": endPage
                };
                params = ["user", user_num, page_size]
                client.query(sql, params, function (error, result) {
                    if (error) {//Mysql Error
                        console.log("Mysql Error" + error);
                        res.status(500).send('Internal Server Error');
                    } else {
                        res.render('adminSubPage/admin_userManagement', {
                            userName: userName, goods: result, result2: result2, endPage: endPage
                        });
                    }
                });
            }
        });
    });

});

router.post('/usermanagement/user/:cur', function (req, res) {
    var user_email = req.body.user_email;
    var sql = 'DELETE FROM user where user_email = ? and user_check = ?';
    var params = [user_email, "user"];
    conn.getConnection(function (err, client) {
        if (err) { console.log('connection Error', err); }
        client.query(sql, params, function (err, result) {
            if (err) {//Mysql Error
                console.log("Mysql Error" + err);
                res.status(500).send('Internal Server Error');
            } else {
                res.redirect('/admin/usermanagement/user');            }
        });
    });
});


//------------------------admin management ----------------------------
//usermanagement_admin 조회
router.get('/usermanagement/admin', function (req, res, next) {

    res.redirect('/admin/usermanagement/admin/' + 1);
});

router.get('/usermanagement/admin/:cur', function (req, res, next) {
    auth.adminLoginCheck(req, res);
    var userName = req.user.user_gn;
    //페이지당 게시물 수 : 한 페이지 당 10개 게시물
    var page_size = 10;
    //페이지의 갯수 : 1 ~ 10개 페이지
    var page_list_size = 10;
    //limit 변수
    var user_num = "";
    //전체 게시물의 숫자
    var totalPageCount = 0;

    var queryString = "select count(*) as cnt from user where user_check = ?";
    var sql = "select * from user where user_check = ?  order by user_num asc limit ?,?";
    var params = ["admin"];
    conn.getConnection(function (err, client) {
        if (err) { console.log('connection Error', err); }
        client.query(queryString, params, function (err, data) {
            if (err) {//Mysql Error
                console.log("Mysql Error" + err);
                res.status(500).send('Internal Server Error');
            } else {
                totalPageCount = data[0].cnt;
                var curPage = req.params.cur;

                //전체 페이지 갯수
                if (totalPageCount < 0) {
                    totalPageCount = 0
                }

                var totalPage = Math.ceil(totalPageCount / page_size);// 전체 페이지수
                var totalSet = Math.ceil(totalPage / page_list_size); //전체 세트수
                var curSet = Math.ceil(curPage / page_list_size) // 현재 셋트 번호
                var startPage = ((curSet - 1) * page_size) + 1 //현재 세트내 출력될 시작 페이지
                var endPage = (startPage + page_list_size) - 1; //현재 세트내 출력될 마지막 페이지


                //현재페이지가 0 보다 작으면
                if (curPage < 0) {
                    user_num = 0
                } else {
                    //0보다 크면 limit 함수에 들어갈 첫번째 인자 값 구하기
                    user_num = (curPage - 1) * page_size
                }

                var result2 = {
                    "curPage": curPage,
                    "page_list_size": page_list_size,
                    "page_size": page_size,
                    "totalPage": totalPage,
                    "totalSet": totalSet,
                    "curSet": curSet,
                    "startPage": startPage,
                    "endPage": endPage
                };
                params = ["admin", user_num, page_size]
                client.query(sql, params, function (error, result) {
                    if (error) {//Mysql Error
                        console.log("Mysql Error" + error);
                        res.status(500).send('Internal Server Error');
                    } else {
                        res.render('adminSubPage/admin_userManagement_admin', {
                            userName: userName, goods: result, result2: result2, endPage: endPage
                        });
                    }
                });
            }
        });
    });

});

router.post('/usermanagement/admin/:cur', function (req, res) {
    var user_email = req.body.user_email;
    var sql = 'DELETE FROM user where user_email = ? and user_check = ?';
    var params = [user_email, "admin"];
    conn.getConnection(function (err, client) {
        if (err) { console.log('connection Error', err); }
        client.query(sql, params, function (err, result) {
            if (err) {//Mysql Error
                console.log("Mysql Error" + err);
                res.status(500).send('Internal Server Error');
            } else {
                res.redirect('/admin/usermanagement/admin');
            }
        });
    });
});


//------------------------search ----------------------------
//search 조회
router.get('/search', function (req, res, next) {

    res.redirect('/admin/search/' + 1);
});


//search 추가
router.get('/search/add', function (req, res) {
    var userName = req.user.user_gn;
    auth.adminLoginCheck(req, res);

    res.render('adminSubPage/admin_search_create', { userName: userName });
});

router.post('/search/add', upload.single('file'), function (req, res) {

    var no = req.body.no;
    var title = req.body.title;
    var contents = req.body.contents;
    var newDate = new Date();
    var time = newDate.toFormat('YYYY-MM-DD HH24:MI:SS');
    var file = req.file;
    if (file != null)
    {
        file = req.file.path;
        var newfile = file.substring(5);
        var sql = 'INSERT INTO search(title, date,contents, file) values (?,?,?,?)';
        var params = [title, time, contents, newfile];
    }
    else{
        var sql = 'INSERT INTO search(title, date,contents) values (?,?,?)';
        var params = [title, time, contents];
    }

    conn.getConnection(function (err, client) {
        if (err) { console.log('connection Error', err); }
        client.query(sql, params, function (err, result) {
            if (err) {//Mysql Error
                console.log("Mysql Error" + err);
                res.status(500).send('Internal Server Error');
            } else {
                var queryString = "select count(*) as cnt from search";
                client.query(queryString, function (err, result) {
                    if (err) {//Mysql Error
                        console.log("Mysql Error" + err);
                        res.status(500).send('Internal Server Error');
                    } else {
                        var endPage = Math.ceil(result[0].cnt / 10);
                        res.redirect('/admin/search/' + endPage);
                    }
                });
            }
        });
    });
});

router.get('/search/:cur', function (req, res, next) {
    auth.adminLoginCheck(req, res);
    var userName = req.user.user_gn;
    //페이지당 게시물 수 : 한 페이지 당 10개 게시물
    var page_size = 10;
    //페이지의 갯수 : 1 ~ 10개 페이지
    var page_list_size = 10;
    //limit 변수
    var no = "";
    //전체 게시물의 숫자
    var totalPageCount = 0;

    var queryString = "select count(*) as cnt from search";
    var sql = "select * from search order by no desc limit ?,?";

    conn.getConnection(function (err, client) {
        if (err) { console.log('connection Error', err); }
        client.query(queryString, function (err, data) {
            if (err) {//Mysql Error
                console.log("Mysql Error" + err);
                res.status(500).send('Internal Server Error');
            } else {
                totalPageCount = data[0].cnt;
                var curPage = req.params.cur;

                //전체 페이지 갯수
                if (totalPageCount < 0) {
                    totalPageCount = 0
                }

                var totalPage = Math.ceil(totalPageCount / page_size);// 전체 페이지수
                var totalSet = Math.ceil(totalPage / page_list_size); //전체 세트수
                var curSet = Math.ceil(curPage / page_list_size) // 현재 셋트 번호
                var startPage = ((curSet - 1) * page_size) + 1 //현재 세트내 출력될 시작 페이지
                var endPage = (startPage + page_list_size) - 1; //현재 세트내 출력될 마지막 페이지


                //현재페이지가 0 보다 작으면
                if (curPage < 0) {
                    no = 0
                } else {
                    //0보다 크면 limit 함수에 들어갈 첫번째 인자 값 구하기
                    no = (curPage - 1) * page_size
                }

                var result2 = {
                    "curPage": curPage,
                    "page_list_size": page_list_size,
                    "page_size": page_size,
                    "totalPage": totalPage,
                    "totalSet": totalSet,
                    "curSet": curSet,
                    "startPage": startPage,
                    "endPage": endPage
                };

                client.query(sql, [no, page_size], function (error, result) {
                    if (error) {//Mysql Error
                        console.log("Mysql Error" + error);
                        res.status(500).send('Internal Server Error');
                    } else {
                        var time = new Array();
                        for (var i = 0; i < result.length; i++) {
                            time.push(result[i].date.toFormat('HH24:MI DD/MM/YY'));
                        }
                        res.render('adminSubPage/admin_search', {
                            userName: userName, goods: result, time: time, result2: result2, endPage: endPage
                        });
                    }
                });
            }
        });
    });

});

//search 수정
router.get('/search/edit/:no', function (req, res) {
    console.log("get search page");
    auth.adminLoginCheck(req, res);
    var userName = req.user.user_gn;
    var no = req.params.no;
    var sql = "SELECT * FROM search where no = ? ";
    conn.getConnection(function (err, client) {
        if (err) { console.log('connection Error', err); }
        client.query(sql, [no], function (err, result) {
            if (err) {//Mysql Error
                console.log("Mysql Error" + err);
                res.status(500).send('Internal Server Error');
            } else {
                res.render('adminSubPage/admin_searchContent_update', { userName: userName, goods: result[0] });
            }
        });
    });

});

router.post('/search/edit/:no', upload.single('file'), function (req, res) {
    var no = req.params.no;
    var title = req.body.title;
    var contents = req.body.contents;
    var file = req.file;
    if (file != null)
    {
        file = req.file.path;
        var newfile = file.substring(5);
        var sql = "UPDATE search SET title =?, contents =?, file = ? where no = ?";
        var params = [title, contents, newfile, no];
    }
    else{
        var sql = "UPDATE search SET title =?, contents =? where no = ?";
        var params = [title, contents, no];
    }
    
    conn.getConnection(function (err, client) {
        if (err) { console.log('connection Error', err); }

        client.query(sql, params, function (err, result) {
            if (err) {//Mysql Error
                console.log("Mysql Error" + err);
                res.status(500).send('Internal Server Error');
            } else {
                res.redirect('/admin/search/view/' + no);
            }
        });
    });

});
//search 삭제
router.post('/search/delete/:no', function (req, res) {
    var no = req.params.no;
    var sql = 'select file from search where no =?';
    conn.getConnection(function (err, client) {
        if (err) { console.log('connection Error', err); }
        client.query(sql, [no], function (err, result) {
            if (err) {//Mysql Error
                console.log("Mysql Error" + err);
                res.status(500).send('Internal Server Error');

            } else {
                var filename = "views/" + result[0].file;
                fs.unlink(filename, function (err) {
                    if (err) throw err;
                    console.log('file deleted');
                })

                sql = 'DELETE FROM search where no = ?';
                client.query(sql, [no], function (err, result) {
                    if (err) {//Mysql Error
                        console.log("Mysql Error" + err);
                        res.status(500).send('Internal Server Error');
                    } else {

                        res.redirect('/admin/search/');
                    }
                });
            }
        });
    });

});

//search 보기
router.get('/search/view/:no', function (req, res) {
    auth.adminLoginCheck(req, res);
    var userName = req.user.user_gn;
    var no = req.params.no;
    var sql = "SELECT * FROM search WHERE no = ?";

    conn.getConnection(function (err, client) {
        if (err) { console.log('connection Error', err); }
        client.query(sql, [no], function (err, result) {
            if (err) {//Mysql Error
                console.log("Mysql Error" + err);
                res.status(500).send('Internal Server Error');
                return done(err);
            } else {
                if (result[0].file != null) {
                    var dir = __dirname.substring(0, __dirname.length - 6);
                    var temp = result[0].file;
                    var file = dir + "views" + temp;
                    var refile = temp.substring(12);
                    res.download(file);
                }
                else
                    refile = "no file";
                res.render('adminSubPage/admin_searchContent', { userName: userName, goods: result[0], refile: refile });
            }
        });
    });

});

//search download 보기
router.get('/search/view/download/:no/', function (req, res) {
    auth.adminLoginCheck(req, res);
    var userName = req.user.user_gn;
    var no = req.params.no;
    var sql = "SELECT * FROM search WHERE no = ?";

    conn.getConnection(function (err, client) {
        if (err) { console.log('connection Error', err); }
        client.query(sql, [no], function (err, result) {
            if (err) {//Mysql Error
                console.log("Mysql Error" + err);
                res.status(500).send('Internal Server Error');
                return done(err);
            } else {
                var dir = __dirname.substring(0, __dirname.length - 6);
                var temp = result[0].file;
                var file = "views" + temp;
                var refile = temp.substring(12);

                var filename = path.basename(file);
                var mimetype = mime.lookup(file);
                res.setHeader('Content-disposition', 'attachment; filename=' + filename);
                res.setHeader('Content-type', mimetype);
                var filestream = fs.createReadStream(dir + file);
                filestream.pipe(res);

                //                res.render('adminSubPage/admin_searchContent', { userName: userName, goods: result[0], refile: refile});
            }
        });
    });

});
module.exports = router;
