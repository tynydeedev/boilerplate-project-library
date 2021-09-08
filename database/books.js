const mongoose = require('mongoose');
const { Schema } = mongoose;
const { ObjectId } = require('mongodb');

const MONGO_URI = process.env['MONGO_URI'];
// const mongoOptions = {

// }


mongoose.connect(MONGO_URI);

const bookSchema = new Schema({
  title: String,
  commentcount: {
    type: Number,
    default: 0
  },
  comments: {
    type: [String],
    default: [],
  }
});

const Book = mongoose.model('Book', bookSchema);

const getAllBooks = (done) => {
  Book.find({}, '-comment -__v', (err, data) => {
    if (err) return done(err);
    done(null, data);
  });
};

const getBookById = (id, done) => {
  Book.findById(id, '-__v', (err, data) => {
    if (err) return done(err);
    done(null, data);
  })
}

const createBook = (title, done) => {
  const newBook = new Book({ title: title });
  newBook.save((err, doc) => {
    if (err) return done(err);
    done(null, doc);
  });
};

const addComment = (bookId, cmt, done) => {
  Book.findById(bookId, '-__v', (err, doc) => {
    if (err) return done(err);
    if (!doc) return done(null, null);
    doc.comment.push(cmt);
    doc.save((err, doc) => {
      if (err) return done(err);
      done(null, doc);
    })
  })
};

const deleteById = (bookId, done) => {
  Book.deleteOne({_id: ObjectId(bookId)}, (err, result) => {
    if (err) return done(err);
    done(null, result);
  })
};

const deleteAll = (done) => {
  Book.deleteMany({}, (err, result) => {
    if (err) return done(err);
    done(err, result);
  })
}

module.exports = { Book, getAllBooks, getBookById, createBook, addComment, deleteById, deleteAll };