var express = require('express');
var router = express.Router();
var path = require('path');
var request = require('request');
var cheerio = require('cheerio');
var Comment = require('../models/Comment.js');
var Article = require('../models/Article.js');



router.get('/', function(req, res) {
    res.redirect('/scrape');
});

router.get('/articles', function(req, res) {
    Article.find().sort({ _id: -1 })

    .populate('comments').exec(function(err, doc) {
        if (err) {
            console.log(err);
        } else {
            var hbsObject = { articles: doc }
            res.render('index', hbsObject);
        }
    });

});

router.get('/scrape', function(req, res) {
    request('http://www.theonion.com/', function(error, response, html) {
        var $ = cheerio.load(html);
        var titlesArray = [];
        $('article .inner').each(function(i, element) {
            var result = {};
            result.title = $(this).children('header').children('h2').text().trim() + "";
            result.link = 'http://www.theonion.com' + $(this).children('header').children('h2').children('a').attr('href').trim();
            result.summary = $(this).children('div').text().trim() + "";

            if (result.title !== "" && result.summary !== "") {
                if (titlesArray.indexOf(result.title) == -1) {
                    titlesArray.push(result.title);
                    Article.count({ title: result.title }, function(err, test) {
                        if (test == 0) {
                            var entry = new Article(result);
                            entry.save(function(err, doc) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    console.log(doc);
                                }
                            });

                        } else {
                            console.log('Redundant Database Content. Not saved to DB.')
                        }

                    });
                } else {
                    console.log('Redundant Onion Content. Not Saved to DB.')
                }

            } else {
                console.log('Empty Content. Not Saved to DB.')
            }

        });
        res.redirect("/articles");

    });

});

router.post('/add/comment/:id', function(req, res) {
    var articleId = req.params.id;
    var cmtAuthor = req.body.name;
    var cmtContent = req.body.comment;
    var result = {
        author: cmtAuthor,
        content: cmtContent
    };
    var entry = new Comment(result);
    entry.save(function(err, doc) {
        // log any errors
        if (err) {
            console.log(err);
        } else {
            Article.findOneAndUpdate({ '_id': articleId }, { $push: { 'comments': doc._id } }, { new: true })
                .exec(function(err, doc) {
                    if (err) {
                        console.log(err);
                    } else {
                        res.sendStatus(200);
                    }
                });
        }
    });

});
router.post('/remove/comment/:id', function(req, res) {
    var commentId = req.params.id;
    Comment.findByIdAndRemove(commentId, function(err, todo) {

        if (err) {
            console.log(err);
        } else {
            res.sendStatus(200);
        }

    });

});
module.exports = router;
