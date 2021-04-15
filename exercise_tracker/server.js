const express = require('express')
const app = express()
const cors = require('cors')
const mongoose = require('mongoose');
const { Schema } = mongoose;


mongoose.connect(process.env.MONGO_URI);

// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded());

// Parse JSON bodies (as sent by API clients)
app.use(express.json());


const userSchema = new Schema({
  username: { type: String, required: true },
});

const UserData = mongoose.model("userdata", userSchema);


const exerciseSchema = new Schema({
  userid: { type: String, required: true },
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  date: { type: Date, required: false, default: Date.now }
});

const Exercise = mongoose.model("exercise", exerciseSchema);



require('dotenv').config()

app.use(cors())
app.use(express.static('public'))


app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html')
});

//6049c52461755a031b4b6e37

app.post('/api/exercise/new-user', function (req, res) {

  var userName = req.body.username;

  user1 = new UserData({
    username: userName,
  });

  user1.save(function (err, data) {
    if (err) return console.log(err);
    res.json({ username: userName, _id: data._id });
  })

});


app.post('/api/exercise/add', function (req, res) {

  var datestr = req.body.date;

  if (Date.parse(datestr)) {
    var date = new Date(datestr)
    console.log(date)
  } else {
    var date = Date.now()
    console.log(date);
  }
  exercise = new Exercise({
    userid: req.body.userId,
    description: req.body.description,
    duration: req.body.duration,
    date: date
  });

  UserData.findOne({ _id: exercise.userid }, function (err, userdata) {
    if (err) return res.send(err);

    exercise.save(function (err, data) {
      if (err) return console.log(err);

      var datestr = new Date(data.date).toDateString();
      res.json({ _id: userdata._id, username: userdata.username, date: datestr, duration: data.duration, description: data.description })
    });


  });

});


app.get('/api/exercise/users', function (req, res) {


  UserData.find({}, function (err, users) {
    var userarray = [];
    var i = 0;
    users.forEach(function (user) {
      userarray[i] = user;
      i++;
    });

    res.send(userarray);
  });

});



app.get('/api/exercise/log', function (req, res) {

  const date_to = req.query.to;
  const userId = req.query.userId;
  const date_from = req.query.from;

  var queryJSON = {date:{}};

  if (userId) {
    queryJSON.userid = userId;
  }
  if(date_from && Date.parse(date_from)){
    queryJSON.date["$gt"] = new Date(date_from).toDateString();
  }
  if (date_to && Date.parse(date_to)) {
    queryJSON.date["$lt"] = new Date(date_to).toDateString();
  }

  console.log(queryJSON)


  UserData.findOne({ _id: userId }, function (err, usrdata) {
    if (err) return console.log(err);
    username = usrdata.username;
  });
  

  Exercise
  .find(queryJSON)
  .sort({'date': -1})
  .select({"_id":0, "duration":1, "description":1,"date":1})
  .exec(function(err, data) {
   count = data.length;
    res.json({_id:userId, username:username, count:count, log:data});});


});




const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port)
});
