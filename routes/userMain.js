var express = require('express');
var router = express.Router();
var auth = require('../public/modues');
var conn = require('../public/config/database');
var crypto = require('./../public/config/crypto.js');
var fs = require('fs');
var mime = require('mime');
var path = require('path');


/* HOME */
router.get('/', function (req, res, next) {
    auth.userLoginCheck(req, res);
    var userName = req.user.user_gn;
    var sql = "SELECT * FROM news ORDER BY no DESC LIMIT 6";
    conn.getConnection(function (err, client) {
        if (err) { console.log('connection Error', err); }
        client.query(sql, function (err, result) {
            if (err) {//Mysql Error
                console.log("Mysql Error" + err);
                res.status(500).send('Internal Server Error');
                return done(err);
            } else {
                sql = "SELECT * FROM specialActivity ORDER BY no DESC LIMIT 3";
                client.query(sql, function (err, result2) {
                    if (err) {//Mysql Error
                        console.log("Mysql Error" + err);
                        res.status(500).send('Internal Server Error');
                        return done(err);
                    } else {
                        var time = new Array();
                        for (var i = 0; i < result.length; i++) {
                            time.push(result[i].date.toFormat('HH24:MI DD/MM/YY'));
                        }
                        res.render('subPage/Mainpage', { userName: userName, goods: result, time: time, result2: result2 });
                    }
                });            
            
            }
        });
    });
});
router.get('/profile', function (req, res, next) {
    auth.userLoginCheck(req, res);
    var userName = req.user.user_gn;
    var userInfo = req.user;
    res.render('subPage/Profile', { userName: userName, userInfo: userInfo });
});
router.post('/profile', function (req, res, next) {
    auth.userLoginCheck(req, res);
    var user_email = req.user.user_email;
    var user_pw = req.body.user_pw;
    var user_phone = req.body.user_phone;
    var user_position = req.body.user_position;
    var user_part = req.body.user_part;
    var user_offid = req.body.user_offid;

    conn.getConnection(function (err, client) {
        if (err) { console.log('signup connection Error', err); }
        else {
            var crypto_pw = crypto.cryptoHash(user_pw);
            query = 'UPDATE user SET user_pw=?, user_phone=?, user_position=?, user_part=?, user_offid=? WHERE user_email=?';
            params = [crypto_pw, user_phone, user_position, user_part, user_offid, user_email];
            client.query(query, params, function (err, result) {
                if (err) {//Mysql Error
                    console.log("Sign Up mysql ERROR!!" + err);
                }
                else {
                    res.redirect('/auth/login');
                }
            });
        }
    });
});

/* Admission */
router.get('/admission', function (req, res, next) {//Admission->admission
    auth.userLoginCheck(req, res);
    var data = auth.fileinput('./public/infofile/admission.txt');
    var userName = req.user.user_gn;
    res.render('subPage/Admission_admission', { data: data, userName: userName });
});
router.get('/alumni', function (req, res, next) {//Admission->alumni
    auth.userLoginCheck(req, res);
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
                res.render('subPage/Admission_alumni', { userName: userName, comments: result });
            }
        });
    });
});
router.post('/alumni', function (req, res, next) {//Admission->alumni
    auth.userLoginCheck(req, res);
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
    auth.userLoginCheck(req, res);
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
    auth.userLoginCheck(req, res);
    var user_email = req.user.user_email;
    var no = req.body.no;
    var sql = "SELECT * FROM comment WHERE no=? AND user_email=?;";
    var params = [no, user_email];
    conn.getConnection(function (err, client) {
        if (err) { console.log('connection Error', err); }
        client.query(sql, params, function (err, result) {
            if (err) {//Mysql Error
                console.log("Mysql Error" + err);
                res.status(500).send('Internal Server Error');
            } else {
                if (result.length == 0) {
                    res.send({ result: false });
                }
                else {
                    sql = "DELETE FROM comment WHERE user_email=? AND no=?";
                    params = [user_email, no];
                    client.query(sql, params, function (err, result) {
                        if (err) {//Mysql Error
                            console.log("Mysql Error" + err);
                            res.status(500).send('Internal Server Error');
                        } else {
                            res.send({ result: true });
                        }
                    });
                }
            }
        });
    });
});
router.get('/FAQ', function (req, res, next) {//Admission->FAQ
    auth.userLoginCheck(req, res);
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
                res.render('subPage/Admission_FAQ', { userName: userName, question: question });
            }
        });
    });
});
router.post('/FAQ', function (req, res, next) {//Admission->FAQ
    auth.userLoginCheck(req, res);
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
                res.redirect('/FAQ');
            }
        });
    });
});
router.post('/deleteFAQ', function (req, res, next) {//Admission->alumni
    auth.userLoginCheck(req, res);
    var user_email = req.user.user_email;
    var no = req.body.no;
    var sql = "SELECT * FROM faq WHERE no=? AND user_email=?;";
    var params = [no, user_email];
    conn.getConnection(function (err, client) {
        if (err) { console.log('connection Error', err); }
        client.query(sql, params, function (err, result) {
            if (err) {//Mysql Error
                console.log("Mysql Error" + err);
                res.status(500).send('Internal Server Error');
            } else {
                if (result.length == 0) {
                    res.send({ result: false });
                }
                else {
                    sql = "DELETE FROM faq WHERE user_email=? AND no=?";
                    params = [user_email, no];
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
                }
            }
        });
    });
});

router.post('/FAQ_comment', function (req, res, next) {//Admission->FAQ
    auth.userLoginCheck(req, res);
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
                res.redirect('/FAQ');
            }
        });
    });
});
router.post('/deleteFAQ_comment', function (req, res, next) {//Admission->alumni
    auth.userLoginCheck(req, res);
    var user_email = req.user.user_email;
    var comment_no = req.body.comment_no;
    var sql = "SELECT * FROM faq_comments WHERE comment_no=? AND comment_user_email=?;";
    var params = [comment_no, user_email];
    conn.getConnection(function (err, client) {
        if (err) { console.log('connection Error', err); }
        client.query(sql, params, function (err, result) {
            if (err) {//Mysql Error
                console.log("Mysql Error" + err);
                res.status(500).send('Internal Server Error');
            } else {
                if (result.length == 0) {
                    res.send({ result: false });
                }
                else {
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
                }
            }
        });
    });
});
router.post('/infiniteFAQ', function (req, res, next) {//Admission->alumni
    auth.userLoginCheck(req, res);
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

/* Curriculum */
router.get('/courseBasic', function (req, res, next) {//Curriculum->basic
    auth.userLoginCheck(req, res);
    var userName = req.user.user_gn;
    var sql = "SELECT * FROM basic_course;";
    conn.getConnection(function (err, client) {
        if (err) { console.log('connection Error', err); }
        client.query(sql, function (err, result) {
            if (err) {//Mysql Error
                console.log("Mysql Error" + err);
                res.status(500).send('Internal Server Error');
            } else {
                res.render('subPage/Curriculum_course_basic', { userName: userName, courses: result });
            }
        });
    });
});
router.get('/courseAdvanced', function (req, res, next) {//Curriculum->advanced
    auth.userLoginCheck(req, res);
    var userName = req.user.user_gn;
    var sql = "SELECT * FROM advanced_course;";
    conn.getConnection(function (err, client) {
        if (err) { console.log('connection Error', err); }
        client.query(sql, function (err, result) {
            if (err) {//Mysql Error
                console.log("Mysql Error" + err);
                res.status(500).send('Internal Server Error');
            } else {
                res.render('subPage/Curriculum_course_advanced', { userName: userName, courses: result });
            }
        });
    });
});
router.get('/courseSpecial', function (req, res, next) {//Curriculum->spacial
    auth.userLoginCheck(req, res);
    var userName = req.user.user_gn;
    var sql = "SELECT * FROM special_lecture;";
    conn.getConnection(function (err, client) {
        if (err) { console.log('connection Error', err); }
        client.query(sql, function (err, result) {
            if (err) {//Mysql Error
                console.log("Mysql Error" + err);
                res.status(500).send('Internal Server Error');
            } else {
                res.render('subPage/Curriculum_course_special', { userName: userName, courses: result });
            }
        });
    });
});


/* News */
//------------------------news ----------------------------
//news 조회
router.get('/news',  function (req, res, next) {
    res.redirect('/news/' +1 );
});

router.get('/news/:cur', function (req, res, next) {
    auth.userLoginCheck(req, res);
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

                client.query(sql,  [no, page_size],function (error, result) {
                    if (error) {//Mysql Error
                        console.log("Mysql Error" + error);
                        res.status(500).send('Internal Server Error');
                    } else {
                        var time = new Array();
                        for (var i = 0; i < result.length; i++) {
                            time.push(result[i].date.toFormat('HH24:MI DD/MM/YY'));
                        }
                        res.render('subPage/News_news', {
                            userName: userName, goods: result, time: time, result2: result2,endPage:endPage});
                        }
                });
            }
        });
    });

});

// //news 보기
router.get('/news/view/:no', function (req, res) {
    auth.userLoginCheck(req, res);
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
                res.render('subPage/News_newcontents', { userName: userName, goods: result[0] });
            }
        });
    });

});


//------------------------specialActivity ----------------------------
//specialActivity 조회
router.get('/specialActivity',  function (req, res, next) {
    res.redirect('/specialActivity/' +1 );
});

router.get('/specialActivity/:cur', function (req, res, next) {
    auth.userLoginCheck(req, res);
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
                client.query(sql,  [no, page_size],function (error, result) {
                    if (error) {//Mysql Error
                        console.log("Mysql Error" + error);
                        res.status(500).send('Internal Server Error');
                    } else {
                        var time = new Array();
                        for (var i = 0; i < result.length; i++) {
                            time.push(result[i].date.toFormat('HH24:MI DD/MM/YY'));
                        }
                        res.render('subPage/News_specialActivities', {
                            userName: userName, goods: result, time: time, result2: result2,endPage:endPage});
                        }
                });
            }
        });
    });

});

router.get('/specialActivity/view/:no', function (req, res) {
    auth.userLoginCheck(req, res);
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
                                
                                if(result1[0] != null && result2[0] != null &&result3[0] != null) // 전 게시물도 있고, 다음 게시물도 있고
                                    {
                                        result.push(result2[0]); result.push(result1[0]); result.push(result3[0]);
                                        check.push(-1); check.push(0); check.push(1);
                                        time.push(result[1].date.toFormat('HH24:MI DD/MM/YY'));
                                    } // 아예 첫 게시물 
                                else if(result1[0] != null && result2[0] == null &&result3[0] == null)
                                    {
                                        result.push(result1[0]);
                                        check.push(-1)
                                        time.push(result[0].date.toFormat('HH24:MI DD/MM/YY'));
                
                                    }
                                else if (result1[0] != null)
                                { 
                                    if(result2[0] != null)
                                    {
                                        result.push(result2[0]); result.push(result1[0]);
                                        if(Number(result[0].no) < Number(no)) // 전 게시물은 있고, 내 게시물이 마지막
                                            {
                                                check.push(1);
                                                time.push(result[1].date.toFormat('HH24:MI DD/MM/YY'));
                                            }
                                    }
                                    else if(result3[0]!= null){
                                        result.push(result1[0]); result.push(result3[0]);
                                        if (result[0].no == no) // 전 게시물이 없고, 내 게시물이 처음, 다음 게시물은 있음
                                        {
                                            check.push(0);
                                            time.push(result[0].date.toFormat('HH24:MI DD/MM/YY'));
                                        }
                                    }
                                }
                                res.render('subPage/News_specialActivitiescontents', { userName: userName, goods: result, check: check, time:time });
                            }
                        });
                    }
                });
            }
        });
    });

});



/* Others */
router.get('/aboutUs', function (req, res, next) {
    auth.userLoginCheck(req, res);
    var userName = req.user.user_gn;
    var data = auth.fileinput('./public/infofile/aboutus.txt');
    res.render('subPage/Aboutus', { data: data, userName: userName });
});
router.get('/contact', function (req, res, next) {
    auth.userLoginCheck(req, res);
    var userName = req.user.user_gn;
    var data = auth.fileinput('./public/infofile/contact.txt');
    res.render('subPage/Contact', { data: data, userName: userName });
});

/* Register Course */
router.get('/registCourse', function (req, res, next) {//Register Course->regist course
    auth.userLoginCheck(req, res);
    var userName = req.user.user_gn;
    var basicResult;
    var advancedResult;
    var specialResult;
    var sql = "SELECT * FROM basic_course;";
    conn.getConnection(function (err, client) {
        if (err) { console.log('connection Error', err); }
        client.query(sql, function (err, Bresult) {
            if (err) {//Mysql Error
                console.log("Mysql Error" + err);
                res.status(500).send('Internal Server Error');
            } else {
                basicResult = Bresult;
                sql = "SELECT * FROM advanced_course;";
                client.query(sql, function (err, Aresult) {
                    if (err) {//Mysql Error
                        console.log("Mysql Error" + err);
                        res.status(500).send('Internal Server Error');
                    } else {
                        advancedResult = Aresult;
                        sql = "SELECT * FROM special_lecture;";
                        client.query(sql, function (err, Sresult) {
                            if (err) {//Mysql Error
                                console.log("Mysql Error" + err);
                                res.status(500).send('Internal Server Error');
                            } else {
                                specialResult = Sresult;
                                res.render('subPage/RegisterCourse_Registerform', { userName: userName, coursesBasic: basicResult, coursesAdvanced: advancedResult, coursesSpecial: specialResult });
                            }
                        });
                    }
                });
            }
        });
    });
});
router.get('/registeredCourses', function (req, res, next) {//Register Course->registered courses
    auth.userLoginCheck(req, res);
    var userName = req.user.user_gn;
    var user_email = req.user.user_email;
    var basicResult;
    var advancedResult;
    var specialResult;

    var sql = "SELECT basic_course.* FROM registered_course, basic_course WHERE registered_course.courses =basic_course.courses AND registered_course.user_email = ? AND registered_course.level = ?;"
    var params = [user_email, 'basic'];
    conn.getConnection(function (err, client) {
        if (err) { console.log('connection Error', err); }
        client.query(sql, params, function (err, Bresult) {
            if (err) {//Mysql Error
                console.log("Mysql Error" + err);
                res.status(500).send('Internal Server Error');
            } else {
                basicResult = Bresult;
                sql = "SELECT advanced_course.* FROM registered_course, advanced_course WHERE registered_course.courses =advanced_course.courses AND registered_course.user_email = ? AND registered_course.level = ?;"
                params = [user_email, 'advanced'];
                client.query(sql, params, function (err, Aresult) {
                    if (err) {//Mysql Error
                        console.log("Mysql Error" + err);
                        res.status(500).send('Internal Server Error');
                    } else {
                        advancedResult = Aresult;
                        sql = "SELECT special_lecture.* FROM registered_course, special_lecture WHERE registered_course.courses =special_lecture.courses AND registered_course.user_email = ? AND registered_course.level = ?;"
                        params = [user_email, 'special'];
                        client.query(sql, params, function (err, Sresult) {
                            if (err) {//Mysql Error
                                console.log("Mysql Error" + err);
                                res.status(500).send('Internal Server Error');
                            } else {
                                specialResult = Sresult;
                                res.render('subPage/RegisterCourse_RegisteredCourses', { coursesBasic: basicResult, coursesAdvanced: advancedResult, coursesSpecial: specialResult, userName: userName });
                            }
                        });

                    }
                });
            }
        });
    });
});
router.post('/registCourse', function (req, res, next) {
    var course = req.body.course;
    var level = req.body.level;
    var user_email = req.user.user_email;
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

router.post('/deleteRegisteredCourses', function (req, res, next) {
    var course = req.body.course;
    var level = req.body.level;
    var user_email = req.user.user_email;

    var sql = "DELETE FROM registered_course WHERE user_email=? AND courses=? AND level=?";
    var params = [user_email, course, level];
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

//------------------------search ----------------------------
//search 조회
router.get('/search', function (req, res, next) {
    res.redirect('/search/' + 1);
});

router.get('/search/:cur', function (req, res, next) {
    auth.userLoginCheck(req, res);
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
                        res.render('subPage/Search', {
                            userName: userName, goods: result, time: time, result2: result2, endPage: endPage
                        });
                    }
                });
            }
        });
    });

});

//search 보기
router.get('/search/view/:no', function (req, res) {
    auth.userLoginCheck(req, res);
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
                res.render('subPage/SearchContent', { userName: userName, goods: result[0], refile: refile });
            }
        });
    });

});

//search download 보기
router.get('/search/view/download/:no/', function (req, res) {
    auth.userLoginCheck(req, res);
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
                console.log(result);
                var dir = __dirname.substring(0, __dirname.length - 6);
                var temp = result[0].file;
                var file = "views" + temp;
                var refile = temp.substring(12);

                var filename = path.basename(file);
                var mimetype = mime.lookup(refile);
                res.setHeader('Content-disposition', 'attachment; filename=' + filename);
                res.setHeader('Content-type', mimetype);
                var filestream = fs.createReadStream(dir + file);
                filestream.pipe(res);

            }
        });
    });
});

module.exports = router;