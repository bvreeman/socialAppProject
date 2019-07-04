const functions = require('firebase-functions');
const admin = require('firebase-admin');
const app = require('express')();
require('dotenv').config();

const config = {
    apiKey: process.env.DB_APIKEY,
    authDomain: process.env.DB_AUTHDOMAIN,
    databaseURL: process.env.DB_DATABASEURL,
    projectId: process.env.DB_PROJECTID,
    storageBucket: process.env.DB_STORAGEBUCKET,
    messagingSenderId: process.env.DB_MESSAGINGSENDERID,
    appId: process.env.DB_APPID
}

const firebase = require('firebase')
firebase.initializeApp(config);

var serviceAccount = require("./key/socialappproject-81412-firebase-adminsdk-liuug-5696bb4daf.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://socialappproject-81412.firebaseio.com"
});

app.get('/screams', (req, res) => {
    admin
    .firestore()
    .collection('screams')
    .orderBy('createdAt', 'desc')
    .get()
    .then((data) => {
        let screams = [];
        data.forEach((doc) => {
            screams.push({
                screamId: doc.id,
                body: doc.data().body,
                userHandle: doc.data().userHandle,
                createdAt: doc.data().createdAt
            });
        });
        return res.json(screams);
    })
    .catch(err => console.error(err))
})

app.post('/scream', (req, res) => {
    const newScream = {
        body: req.body.body,
        userHandle: req.body.userHandle,
        createdAt: new Date().toISOString()
    };

    admin
        .firestore()
        .collection('screams')
        .add(newScream)
        .then((doc) => {
            res.json({ message: `document ${doc.id} created successfully`});
        })
        .catch((err) => {
            res.status(500).json({ error: 'something went wrong'})
            console.error(err)
        });
});

// Signup Route
app.post('/signup', (req, res) => {
    const newUser = {
        email: req.body.email,
        password: req.body.password,
        confirmPassword: req.body.confirmPassword,
        handle: req.body.handle,
        
    }

    // TODO Validate Data

    firebase
        .auth()
        .createUserWithEmailAndPassword(newUser.email, newUser.password)
        .then((data) => {
            return res.status(201).json({ message: `user ${data.user.uid} signed up successfully`})
        })
        .catch((err) => {
            console.error(err);
            return res.status(500).json({ error: err.code })
        })
})

exports.api = functions.https.onRequest(app);