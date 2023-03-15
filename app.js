var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//express session
var session = require('express-session');
var secret = require('crypto').randomBytes(64).toString('hex');
app.use(session({
  secret: secret,
  resave: true,
  saveUninitialized: true
}));

/*
  Paths
  +
  Authentication middle ware 
  example = app.use('/register', auth.isAuthed ,require('./routes/register'));
*/
auth = require('./src/auth');

app.use('/', require('./routes/login'));
app.use('/register', require('./routes/register'));
app.use('/home', auth.isAuthed, require('./routes/home'));

/*
  start downloading songs
*/

require('./src/downloader')

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

//print text above
console.log(`
            $$$$$$$$$\\ $$\\   $$\\ $$$$$$$$\\ $$\\   $$\\
            \\__$$  __| $$ |  $$ |\\__$$  __|$$ |  $$ |
                $$ |   $$ |  $$ |   $$ |   $$ |  $$ |
                $$ |   $$ |  $$ |   $$ |   $$ |  $$ |
                $$ |   $$ |  $$ |   $$ |   $$ |  $$ |
                $$ |   $$ |  $$ |   $$ |   $$ |  $$ |
                $$ |   \\$$$$$$  |   $$ |   \\$$$$$$  |
                \\__|    \\______/    \\__|    \\______/


                      $$$$$$$\\     $$$$$\\
                      $$  __$$\\    \\__$$ |
                      $$ |  $$ |      $$ |
$$$$$$\\ $$$$$$\\       $$ |  $$ |      $$ |      $$$$$$\\ $$$$$$\\
\\______|\\______|      $$ |  $$ |$$\\   $$ |      \\______|\\______|
                      $$ |  $$ |$$ |  $$ |
                      $$$$$$$  |\\$$$$$$  |
                      \\_______/  \\______/`);
module.exports = app;