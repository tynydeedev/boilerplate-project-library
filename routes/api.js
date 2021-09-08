'use strict';

const { Book, getAllBooks, getBookById, createBook, addComment, deleteById, deleteAll } = require('../database/books.js');

module.exports = function (app) {

  app.route('/api/books')
    .get(function (req, res){
      getAllBooks((err, data) => {
        if (err) return res.send('Internal Error. Please try again later');
        return res.json(data);
      })
    })
    
    .post(function (req, res){
      let title = req.body.title;

      if (!title) return res.send('missing required field title');

      createBook(title, (err, data) => {
        if (err) return res.send('Internal Error. Please try again later');
        return res.json({
          title: data.title,
          _id: data._id
        });
      })
    })
    
    .delete(function(req, res){
      deleteAll((err, result) => {
        if (err) return res.send('Internal Error. Please try again later');
        return res.send('complete delete successful');
      })
      //if successful response will be 'complete delete successful'
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      let bookid = req.params.id;
      
      getBookById(bookid, (err, data) => {
        if (err) return res.send('Internal Error. Please try again later');
        if (!data) return res.send('no book exists');
        return res.send(data);
      })
    })
    
    .post(function(req, res){
      let bookid = req.params.id;
      let comment = req.body.comment;
      
      if (!comment) return res.send('missing required field comment');

      addComment(bookid, comment, (err, data) => {
        if (err) return res.send('Internal Error. Please try again later');
        if (!data) return res.send('no book exists');
        res.json(data);
      })
    })
    
    .delete(function(req, res){
      let bookid = req.params.id;
      
      deleteById(bookid, (err, result) => {
        if (err) return res.send('Internal Error. Please try again later');
        if (result.deletedCount === 0) return res.send('no book exists');
        res.send('delete successful');
      });
    });
  
};
