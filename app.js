const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const errorController = require('./controllers/error');
const User = require('./models/user');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  User.findById('5ea09895d15188ce4613ecf2')
    .then(user => {
      // this user object is a mongoose model object i.e. can call model methods on it
      req.user = user;
      next();
    })
    .catch(err => console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

// use mongoose to connect to database; manages one connection behind the scenes for us
// so in other places where we use mongoose, we use same connection set up here
mongoose
  .connect(
    'mongodb+srv://kojikit:pw@cluster0-sz1ci.mongodb.net/shop?retryWrites=true&w=majority'
  )
  .then(result => {
    // if no arguments passed, will return first entry
    User.findOne()
      .then(user =>{
        // only if user doesn't exist, create new user
        if(!user){
          // create new user
          const user = new User({
            name: 'Koji',
            email: 'koji@gmail.com',
            cart: {
              items: []
            }
          })
          user.save();
        }
      })
    app.listen(3000);
  })
  .catch(err => {
    console.log(err);
  });
