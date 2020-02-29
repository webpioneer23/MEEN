var express = require('express');
var router = express.Router();
var User = require('../models/user');

router.get('/register', function(req, res, next) {
  return res.render('register.ejs');
});

router.post('/register', function(req, res, next) {
  console.log(req.body);
  var personInfo = req.body;

  if (
    !personInfo.username ||
    !personInfo.password ||
    !personInfo.passwordConf
  ) {
    res.send('dd');
  } else {
    if (personInfo.password == personInfo.passwordConf) {
      User.findOne({ username: personInfo.username }, function(err, data) {
        if (!data) {
          var c;
          User.findOne({}, function(err, data) {
            if (data) {
              console.log('if');
              c = data.unique_id + 1;
            } else {
              c = 1;
            }

            var newPerson = new User({
              unique_id: c,
              username: personInfo.username,
              password: personInfo.password,
              passwordConf: personInfo.passwordConf
            });

            newPerson.save(function(err, Person) {
              if (err) console.log(err);
              else console.log('Success');
            });
          })
            .sort({ _id: -1 })
            .limit(1);
          return res.render('login.ejs');
          //   res.send({ Success: 'You are regestered,You can login now.' });
        } else {
          res.send({ Success: 'Username is already used.' });
        }
      });
    } else {
      res.send({ Success: 'password is not matched' });
    }
  }
});

router.get('/login', function(req, res, next) {
  return res.render('login.ejs');
});

router.get('/', function(req, res, next) {
  return res.render('login.ejs');
});

router.post('/login', function(req, res, next) {
  console.log(req.body);
  User.findOne({ username: req.body.username }, function(err, data) {
    if (data) {
      if (data.password == req.body.password) {
        //console.log("Done Login");
        req.session.userId = data.unique_id;
        //console.log(req.session.userId);
        res.redirect('/dashboard');
        // res.send({ Success: 'Success!' });
      } else {
        res.send({ Success: 'Wrong password!' });
      }
    } else {
      res.send({ Success: 'This Username Is not regestered!' });
    }
  });
});

router.get('/dashboard', function(req, res, next) {
  console.log('profile');
  return res.render('dashboard.ejs');
});

router.get('/logout', function(req, res, next) {
  console.log('logout');
  if (req.session) {
    // delete session object
    req.session.destroy(function(err) {
      if (err) {
        return next(err);
      } else {
        return res.redirect('/');
      }
    });
  }
});

router.get('/forgetpass', function(req, res, next) {
  res.render('forget.ejs');
});

router.post('/forgetpass', function(req, res, next) {
  //console.log('req.body');
  //console.log(req.body);
  User.findOne({ email: req.body.email }, function(err, data) {
    console.log(data);
    if (!data) {
      res.send({ Success: 'This Email Is not regestered!' });
    } else {
      // res.send({"Success":"Success!"});
      if (req.body.password == req.body.passwordConf) {
        data.password = req.body.password;
        data.passwordConf = req.body.passwordConf;

        data.save(function(err, Person) {
          if (err) console.log(err);
          else console.log('Success');
          res.send({ Success: 'Password changed!' });
        });
      } else {
        res.send({
          Success: 'Password does not matched! Both Password should be same.'
        });
      }
    }
  });
});

router.get('/users', function(req, res, next) {
  User.find({}, function(err, data) {
    console.log('data');
    console.log(data);
    if (!data) {
      res.redirect('/');
    } else {
      console.log(data);
      return res.render('users.ejs', { users: data });
    }
  });
});

router.get('/user_add', function(req, res, next) {
  res.render('users/add-user');
});

router.get('/user_delete/:user_id', function(req, res) {
  User.findByIdAndRemove(req.params.user_id, function(err) {
    if (err) return res.status(500).json({ error: 'database failure' });
    return res.redirect('/users');
  });
});

//CREATE
router.post('/user_save', (req, res) => {
  //create blog
  User.create(
    {
      username: req.param('username'),
      firstname: req.param('firstname'),
      lastname: req.param('lastname'),
      email: req.param('email')
    },
    (error, newBlog) => {
      if (error) {
        res.render('new');
      } else {
        //redirect to index page
        res.redirect('/users');
      }
    }
  );
});

router.get('/user_edit/:user_id', function(req, res) {
  User.findById(req.params.user_id, (error, user) => {
    if (error) {
      res.redirect('/users');
    } else {
      res.render('users/edit-user', { user: user });
    }
  });
});

//UPDATE ROUT
router.put('/user_update/:id', (req, res) => {
  User.findByIdAndUpdate(
    req.params.id,
    {
      username: req.param('username'),
      firstname: req.param('firstname'),
      lastname: req.param('lastname'),
      email: req.param('email')
    },
    (error, updatedBlog) => {
      if (error) {
        res.redirect('/users');
      } else {
        res.redirect('/user_edit/' + req.params.id);
      }
    }
  );
});

module.exports = router;
