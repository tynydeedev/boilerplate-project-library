/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       
*/

const { JSDOM } = require( "jsdom" );
const { window } = new JSDOM( "" );
const $ = require( "jquery" )( window );
$.support.cors = true;
const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  suite('Routing tests', function() {
    suite('POST /api/books with title => create book object/expect book object', function() {
      // #1
      test('Test POST /api/books with title', function(done) {
        chai
          .request(server)
          .post('/api/books')
          .type('form')
          .send({
            title: 'How to make a career'
          })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.title, 'How to make a career', 'book title should match the sent title');
            assert.property(res.body, '_id', 'response JSON should have the _id property');
            assert.notProperty(res.body, 'commentcount');
            assert.notProperty(res.body, 'comment');
            assert.notProperty(res.body, '__v');
            done();
          });
      });
      //#2
      test('Test POST /api/books with no title given', function(done) {
        chai
          .request(server)
          .post('/api/books')
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'missing required field title', 'response should be a text describing the error');
            done();
          });
      });
      
    });

    suite('GET /api/books => array of books', function(){
      // #3
      test('Test GET /api/books',  function(done){
        chai
          .request(server)
          .get('/api/books')
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body, 'JSON response should be an array');
            if (res.body.length > 0) {
              assert.property(res.body[0], 'title', 'the object in array should have property title');
              assert.property(res.body[0], '_id', 'the object in array should have property _id');
              assert.property(res.body[0], 'commentcount', 'the object in array should have property commentcount');
              assert.notProperty(res.body[0], 'comment', 'the object in array should not have property comment');
            }
            done();
          });
      });        
    });


    suite('GET /api/books/[id] => book object with [id]', function(){
      // #4
      test('Test GET /api/books/[id] with id not in db',  function(done){
        chai
          .request(server)
          .get('/api/books/12332c12e2cc4ed19cd5d6fc')
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'no book exists', 'with invalid _id, server should send a text response');
            done();
          });
      });
      // #5
      test('Test GET /api/books/[id] with valid id in db',  async function(){
        // Create a new book
        const url = 'https://fcc-project-library.tynydeedev.repl.co/api/books';
        const sendData = {
          title: 'A new book'
        };
        const newBook = await $.post(url, sendData);
        // use chai-http to assert
        await chai
          .request(server)
          .get(`/api/books/${newBook._id}`)
          .then(function(res) {
            assert.equal(res.status, 200);
            assert.equal(res.body._id, newBook._id);
            assert.equal(res.body.title, sendData.title);
            assert.isArray(res.body.comment, 'comment should be an array');
          })
          .catch(function(err) {
            throw err;
          })
      });
      
    });


    suite('POST /api/books/[id] => add comment/expect book object with id', async function(){
      // #6
      test('Test POST /api/books/[id] with comment', async function(){
        // create a new book
        const url = 'https://fcc-project-library.tynydeedev.repl.co/api/books';
        const sendData = {
          title: 'A book to comment on'
        }
        const newBook = await $.post(url, sendData);
        // use chai-http to assert
        await chai.request(server)
          .post(`/api/books/${newBook._id}`)
          .type('form')
          .send({ comment: 'a new comment' })
          .then(function(res) {
            assert.equal(res.status, 200);
            assert.equal(res.body._id, newBook._id, 'the _id should match with the newly created one');
            assert.equal(res.body.title, 'A book to comment on', 'title should match');
            assert.isArray(res.body.comment, 'comment should be an array')
            assert.equal(res.body.comment[res.body.comment.length - 1], 'a new comment', 'the last comment should be the one added');
          })
          .catch(function(err) {
            throw err;
          });
      });
      // #7
      test('Test POST /api/books/[id] without comment field', async function(){
        // create a new book
        const url = 'https://fcc-project-library.tynydeedev.repl.co/api/books';
        const sendData = {
          title: 'A book to comment on'
        };
        const newBook = await $.post(url, sendData);
        // use chai-http to assert
        await chai.request(server)
          .post(`/api/books/${newBook._id}`)
          .then(function(res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'missing required field comment', 'should return error string');
          })
          .catch(function(err) {
            throw err;
          });
      });
      // #8
      test('Test POST /api/books/[id] with comment, id not in db', function(done){
        chai
          .request(server)
          .post('/api/books/12332c12e2cc4ed19cd5d6fc')
          .type('form')
          .send({ comment: 'comment to a fake _id' })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'no book exists', 'should return error string');
            done();
          });
      });
      
    });

    suite('DELETE /api/books/[id] => delete book object id', function() {
      // #9
      test('Test DELETE /api/books/[id] with valid id in db', async function(){
        // create new book
        const url = 'https://fcc-project-library.tynydeedev.repl.co/api/books';
        const sendData = {
          title: 'A book to delete'
        };
        const newBook = await $.post(url, sendData);
        // use chai-http to assert
        await chai.request(server)
          .delete(`/api/books/${newBook._id}`)
          .then(function(res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'delete successful', 'should return successful message');
          })
          .catch(function(err) {
            throw err;
          });
      });
      // #10
      test('Test DELETE /api/books/[id] with  id not in db', function(done){
        chai
          .request(server)
          .delete('/api/books/12332c12e2cc4ed19cd5d6fc')
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.text, 'no book exists', 'should return error string');
            done();
          });
      });
    });
  });
});
