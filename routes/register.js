var express = require('express');
var router = express.Router();
const users = require('../src/user_db.js');
const auth = require('../src/auth.js');

/* GET register page. */
router.get('/', function(req, res, next) {
    res.render('register', { title: 'DJ PLAYLIST' });
});

/* POST register page. */
router.post('/', function(req, res, next) {
    const username = req.body.username;
    const password = req.body.password;
    const repeat_password = req.body.rpassword;

    if (password !== repeat_password) {
        res.render('register', { title: 'DJ PLAYLIST', error: 'Passwords do not match' });
        return;
    }

    users.add_user(username, password, 'user')
        .then((id) => { //user was added to db
            auth.add_auth(id, req)
            res.redirect('/');
        })
        .catch((err) => { //error occured
            res.render('register', { title: 'DJ PLAYLIST', error: err.message });
        });
});


module.exports = router;
