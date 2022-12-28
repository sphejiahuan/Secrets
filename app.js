//jshint esversion:6
require('dotenv').config();
const express = require("express");
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
// const encrypt = require('mongoose-encryption');
// const md5 = require("md5");
// const bcrypt = require('bcrypt');
// const saltRounds = 10;
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require('passport-local-mongoose');

const app = express();

// console.log(process.env.API_KEY);


app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true})); 
app.use(express.static("public"));
app.use(session({
    secret: "our little secret.",
    resave: false,
    saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb://127.0.0.1:27017/userDB", {useNewUrlParser: true});
// mongoose.set("useCreateIndex",true);
// mongoose.set('useCreateIndex', true);
mongoose.set('strictQuery', true);

const userSchema = new mongoose.Schema({
    email:String,
    password: String
});

userSchema.plugin(passportLocalMongoose);

// const secret = "process.env.SOME_LONG_UNGUESSABLE_STRING";
const secret = process.env.SECRET;
// userSchema.plugin(encrypt, { secret: secret ,encryptedFields : ["password"]});

const User = new mongoose.model("User", userSchema);


passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.get('/',function(req,res){
    res.render("home");
});

app.get('/login',function(req,res){
    res.render("login");
});

app.get('/register',function(req,res){
    res.render("register");     
});

app.get("/secrets",function(req,res){
    if (req.isAuthenticated()){
        res.render("secrets");
    }else {
        res.redirect("/login");
    }
});

app.get('/logout', function(req, res, next){
    req.logout(function(err) {
      if (err) { return next(err); }
      res.redirect('/');
    });
  });

app.post("/register",function(req,res){
    User.register({username : req.body.username}, req.body.password, function(err,user){
        if(err){
            console.log(err);
            res.redirect("/register");
        }else{
            passport.authenticate('local')(req,res, function(){
                res.redirect("/secrets");
            });
        }
    });
    //////////////////No 2
    // bcrypt.hash(req.body.password, saltRounds, function(err, hash) {
    //     // Store hash in your password DB.
    //     const newUser = new User({
    //         email:req.body.username,
    //         password: hash
    //     });

    //     newUser.save(function(err){
    //         if(err){
    //             console.log(err);
    //         }else{
    //             res.render("secrets");
    //         }
    //     });
    // });

/////////////No 1
    // const newUser = new User({
    //     email:req.body.username,
    //     password: md5(req.body.password)
    // });

    // newUser.save(function(err){
    //     if(err){
    //         console.log(err);
    //     }else{
    //         res.render("secrets");
    //     }
    // });
});

app.post('/login',function(req,res){
    
    const user = new User({
        username:req.body.username,
        password: req.body.password
    });

    req.login(user, function(err){
        if(err){
            console.log(err);
        }else {
            passport.authenticate("local")(req,res, function(){
                res.redirect("/secrets");
            });
        }
    })
    
    // const username =req.body.username;
    // // const password=  md5(req.body.password);
    // const password=  req.body.password;

    // User.findOne({email : username},
    //     function(err,foundUser){
    //         if(err){
    //             console.log(err);
    //         } else {
    //             if(foundUser){
    //                 bcrypt.compare(password, foundUser.password, function(err, result) {
    //                     // result == true
    //                     if(result === true){
    //                         res.render("secrets");
    //                     }
    //                 });
                        
                    
    //             }
    //         };
    //     });
});


app.listen(3000,function(){
    console.log("server started on port 3000");
});