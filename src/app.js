const express = require('express');
const path = require('path');
const upload = require('express-fileupload');
const util = require('util');
const fs = require('fs');
var sastrawi = require('sastrawijs');
const { throws } = require('assert');
const request = require('request');
const cheerio = require('cheerio');
const { serialize } = require('v8');

// Initialize app
const app = express();
const port = 5000;
// app.set('view engine', 'ejs');

// Static folder
app.use(express.static('./views'));
app.use(express.json());
app.listen(port, () => console.log(`Server started on port ${port}`));
app.get('/', (req,res) => {
    // res.render('index');
    res.sendFile(__dirname + '/views/index.html');
});

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
            fileObj.mv(`../test/${fileName}`, (err) => {
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

app.get('/AboutUs', (req,res) => {
    res.sendFile(__dirname + '/views/aboutus.html');
});


app.post('/search?', (req,res) => {
    const searchQueryArray = req.body;
    // console.log(searchQueryArray);
    const upload_path = "../test";
    const files = fs.readdirSync(upload_path);
    // console.log(files);

    var fileObjectContainer = [];
    
    // local files
    files.forEach(file => {
        var stemmer = new sastrawi.Stemmer();
        var tokenizer = new sastrawi.Tokenizer();
        var senteces = fs.readFileSync(`${upload_path}/${file}`, {encoding:'utf8'});
        const sentenceArr = senteces.split(".");
        const firstSentence = sentenceArr[0];
        // let wordsInFile = tokenizer.tokenize(senteces);
        let stemmed = []
        // wordsInFile.forEach( word => stemmed.push(stemmer.stem(word))); 
        let kalimatArr = tokenizer.tokenize(senteces);
        const wordsCount = kalimatArr.length;
        kalimatArr.forEach(element => {
            stemmed.push(stemmer.stem(element));
        });
        // console.log(stemmed);
        var fileObject = {
            filename : file,
            arrayKata : stemmed,
            banyakKata : wordsCount,
            firstSentence : firstSentence,
            similarity: 0
        } 
        fileObjectContainer.push(fileObject);
    });

    // web scrapping
    request('https://www.alodokter.com/virus-corona', async (err, response, html) => {
        if(!err && res.statusCode == 200) {
            var stemmer = new sastrawi.Stemmer();
            var tokenizer = new sastrawi.Tokenizer();

            const $ = cheerio.load(html);
            const dataScrap = await $('.post-content').text();
            const sentenceArr = dataScrap.split(".");
            const firstSentence = sentenceArr[0];

            let stemmed = [];
            let kalimatArr = tokenizer.tokenize(dataScrap);
            const wordsCount = kalimatArr.length;
            kalimatArr.forEach(element => {
                stemmed.push(stemmer.stem(element));
            });    
            // console.log(stemmed);
            var fileObjectScrap = {
                filename : 'virus corona',
                arrayKata : stemmed,
                banyakKata : wordsCount,
                firstSentence : firstSentence,
                similarity: 0
            }
            // console.log(fileObjectScrap);
            fileObjectContainer.push(fileObjectScrap);
            
            
            const searchQueryStemmed = []
            var stemmer = new sastrawi.Stemmer();
            searchQueryArray.searchInput.forEach(kataQuery => {
                searchQueryStemmed.push(stemmer.stem(kataQuery));
            });
            var fileObjectContainerObject = {fileObjectContainer};
            fileObjectContainerObject.searchInputStemmed = searchQueryStemmed;
            // console.log(fileObjectContainerObject);
            res.json(fileObjectContainerObject);
        }
    });
});

app.get('/open/:query', (req,res) => {
    const requestParam = req.params.query;
    if (requestParam === 'virus corona') {
        res.redirect('https://www.alodokter.com/virus-corona');
    } else {
        res.sendFile(path.join(__dirname, '../test/', requestParam));
    }
})
