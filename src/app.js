const express = require('express');
const path = require('path');
const upload = require('express-fileupload');
const util = require('util');
// const ejs = require('ejs');

const { throws } = require('assert');



// Initialize app
const app = express();
const port = 5000;
// app.set('view engine', 'ejs');

// Public folder
app.use(express.static('./views'));

app.listen(port, () => console.log(`Server started on port ${port}`));
app.get('/', (req,res) => {
    // res.render('index');
    res.sendFile(__dirname + '/views/index.html');
});

// Static folder


/** Routes */
// upload file
app.use(upload());
app.post('/upload', (req,res) => {
    try {
        if (!req.files) throw 'No file selected!';
        var message = {};
        const fileObj = req.files.fileHandler;
        const fileName = fileObj.name;
        // console.log(fileObj);
        // console.log(path.extname(fileName).toLowerCase());
    
        const allowedextentions = /txt/;
        const extname = allowedextentions.test(path.extname(fileName).toLowerCase());
        // const mimetype = allowedextentions.test(fileObj.mimetype);
    
        if (extname) {
            fileObj.mv(`./public/uploads/${fileName}`, (err) => {
                if (err) {
                    console.log(err);
                    res.status(500);
                    message = {msg:err};
                    res.sendFile(__dirname + '/views/index.html');
                    // res.render('index', {msg:err});
                } else {
                    // res.render('index', {
                    //     msg: 'File uploaded!'
                    // });
                    message = {msg:'File Uploaded!'};
                    res.sendFile(__dirname + '/views/index.html');
                    console.log(message.msg);
                }
            })
        } else {
            throw 'Only (.txt) files are allowed!';
        }
    } catch (e) {
        console.log(e);
        res.status(500);
        message = {msg:e};
        res.sendFile(__dirname + '/views/index.html');
        // res.render('index', {msg:e});

    }
    return message;
});