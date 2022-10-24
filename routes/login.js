var express = require('express');
var router = express.Router();
const auth = require('../src/auth.js');
const users = require('../src/user_db.js');

/* GET login page. */
router.get('/', function(req, res, next) {
  res.render('login', { title: 'DJ PLAYLIST' });
});

/* POST login page. */
router.post('/', function(req, res, next) {
  const username = req.body.username;
  const password = req.body.password;

  users.login(username, password)
    .then((user) => { //password and username is correct
      ///add user to session
      auth.add_auth(user.id, req)
        .then(() => {
          res.redirect('/home');
        });
    })
    .catch((err) => { //error occured
      res.render('login', { title: 'DJ PLAYLIST', error: err.message });
    });
});

module.exports = router;
