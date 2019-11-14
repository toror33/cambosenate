var express = require('express');
var router = express.Router();
var crypto = require('./../public/config/crypto.js');
var conn = require('./../public/config/database.js');

module.exports = function (passport) {
  router.get('/login', function (req, res, next) {
    var fmsg = req.flash();
    var msg;
    var smsg;
    if (fmsg.error) {
      msg = fmsg.error[0];
    }
    if (fmsg.signupMessage) {
      smsg = fmsg.signupMessage[0];
    } else {
      smsg = "null";
    }
    res.render('login', { message: msg, signupMessage: smsg });
  });
  router.get('/logout', function (req, res, next) {
    req.logout();
    req.session.destroy(function (err) {
      res.redirect('/auth/login');
    });
  });
  router.post('/login',
    passport.authenticate('local', {
      successRedirect: '/',
      failureRedirect: '/auth/login',
      failureFlash: true
    })
  );
  router.post('/signup', function (req, res, next) {
    var user_email = req.body.user_email;
    var user_pw = req.body.user_pw;
    var user_fn = req.body.user_fn;
    var user_gn = req.body.user_gn;
    var user_sex = req.body.user_sex;
    var user_birth = req.body.user_birth;
    var user_nation = req.body.user_nation;
    var user_phone = req.body.user_phone;
    var user_position = req.body.user_position;
    var user_part = req.body.user_part;
    var user_offid = req.body.user_offid;

    var query = 'SELECT * FROM user WHERE user_email = ?';
    var params = user_email;
    conn.getConnection(function (err, client) {
      if (err) { console.log('signup connection Error', err); }
      client.query(query, params, function (err, result) {
        if (err) {//Mysql Error
          console.log("Sign Up mysql ERROR!!" + err);
        }
        else {
          if (result.length != 0) {
            req.flash('signupMessage', 'Email already used!');
            res.redirect('/auth/login');
          }
          else {
            var crypto_pw = crypto.cryptoHash(user_pw);
            query = 'INSERT INTO user (user_email, user_pw, user_fn, user_gn, user_sex, user_birth, user_nation, user_phone, user_position, user_part, user_offid, user_check) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)';
            params = [user_email, crypto_pw, user_fn, user_gn, user_sex, user_birth, user_nation, user_phone, user_position, user_part, user_offid, "user"];
            client.query(query, params, function (err, result) {
              if (err) {//Mysql Error
                console.log("Sign Up mysql ERROR!!" + err);
              }
              else {
                console.log("Sign Up Success!!");
                req.flash('signupMessage', 'Regist Success!');
                res.redirect('/auth/login');
              }
            });
          }
        }
      });
    });
  });
  return router;
}

