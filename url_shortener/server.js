require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
const { Schema }  = mongoose;

mongoose.connect(process.env.MONGO_URI);


const urlSchema = new Schema({
    originalurl :{type:String, required:true},
});

const URLData = mongoose.model("URL",urlSchema);


// Basic Configuration
const port = process.env.PORT || 3000;

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', function(req, res) {
  res.sendFile(process.cwd() + '/views/index.html');
});

// Your first API endpoint
app.get('/api/hello', function(req, res) {
  res.json({ greeting: 'hello API' });
});


// Parse URL-encoded bodies (as sent by HTML forms)
app.use(express.urlencoded());

// Parse JSON bodies (as sent by API clients)
app.use(express.json());


app.get('/api/shorturl/:shorturl', function(req,res){
  var shorturl = req.params.shorturl;
  if(shorturl){
    URLData.findOne({_id:shorturl},function(err,findedDocs){
      if(findedDocs){
        res.redirect(findedDocs.originalurl);
      }else{
      }
    });
  }
});

app.post('/api/shorturl/new', function(req, res){

  var urldata = req.body.url
  console.log(urldata);
  if(validURL(urldata)){
    URLData.findOne({ originalurl: urldata},function(err,findedDocs){
    if(findedDocs){
      console.log("bulduk!")
      res.json({ original_url : findedDocs.originalurl, short_url : findedDocs._id})
    }else{
      url1 = new URLData({
        originalurl: urldata
      });
      url1.save(function(err,data){
        if(err) return console.log(err);
        res.json({original_url:data.originalurl, short_url : data._id});
      })
    }
    });
  }
  else{

    res.json({ error: 'invalid url' })
  }


});




app.listen(port, function() {
  console.log(`Listening on port ${port}`);
});

function validURL(str) {
  var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
    '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
  return !!pattern.test(str);
}
