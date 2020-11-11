const request = require('request');
const cheerio = require('cheerio');

function scrapping() {
    request('', (err, res, html) => {
        if(!err && res.statusCode == 200) {
        }
    });
}

scrapping();