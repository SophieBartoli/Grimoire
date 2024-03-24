const Book = require('../models/Book');
const fs = require('fs');
const sharp = require('sharp');

exports.createBook = (req, res) => {

  const bookObject = JSON.parse(req.body.book);
  delete bookObject._id;
  delete bookObject._userId;
  // Specify a different output path for the resized file
  const resizedFileName = `resized-${req.file.filename.replace(/\.[^.]+$/, '')}.webp`;
  const resizedImagePath = `./images/${resizedFileName}`;

  // Use Sharp to resize the image
  sharp(req.file.path)
      .resize(206, 260)
      .toFormat('webp')
      .toFile(resizedImagePath, (err, info) => {
          if (err) {
              return res.status(401).json({ error: err.message });
          }
          // Delete the original file after resizing
          fs.unlink(req.file.path, (unlinkErr) => {
              if (unlinkErr) {
                  console.error('Erreur lors de la suppression du fichier original:', unlinkErr);
              }
              // Create a Book object with resized URL
              const book = new Book({
                  ...bookObject,
                  userId: req.auth.userId,
                  imageUrl: `${req.protocol}://${req.get('host')}/images/${resizedFileName}`
              });
              // Save the book in the database
              book.save()
                  .then(() => {
                      res.status(201).json({ message: 'Livre enregistré !' });
                  })
                  .catch(error => {
                      res.status(401).json({ error: "Erreur lors de l'enregistrement !" });
                  });
          });
      });
};

exports.getOneBook = (req, res) => {
  Book.findOne({ _id: req.params.id })
      .then(book =>
          res.status(200).json(book))
      .catch(error => res.status(404).json({ error }));
};

exports.modifyBook = (req, res, next) => {
    const bookObject = req.file ? {
        ...JSON.parse(req.body.book),
        imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
  
    delete bookObject._userId;
    Book.findOne({_id: req.params.id})
        .then((book) => {
            if (book.userId != req.auth.userId) {
                res.status(401).json({ message : 'Not authorized'});
            } else {
                Book.updateOne({ _id: req.params.id}, { ...bookObject, _id: req.params.id})
                .then(() => res.status(200).json({message : 'Objet modifié!'}))
                .catch(error => res.status(401).json({ error }));
            }
        })
        .catch((error) => {
            res.status(400).json({ error });
        });
};

exports.deleteBook = (req, res, next) => {
    Book.findOne({ _id: req.params.id})
        .then(book => {
            if (book.userId != req.auth.userId) {
                res.status(401).json({message: 'Not authorized'});
            } else {
                const filename = book.imageUrl.split('/images/')[1];
                fs.unlink(`images/${filename}`, () => {
                    Book.deleteOne({_id: req.params.id})
                        .then(() => { res.status(200).json({message: 'Objet supprimé !'})})
                        .catch(error => res.status(401).json({ error }));
                });
            }
        })
        .catch( error => {
            res.status(500).json({ error });
        });
};

exports.getAllBooks = (req, res, next) => {
  Book.find().then(
    (books) => {
      res.status(200).json(books);
    }
  ).catch(
    (error) => {
      res.status(400).json({
        error: error
      });
    }
  );
};

exports.bookRating = (req, res) => {
    Book.findOne({ _id: req.params.id })
        .then(book => {           
            if (book.ratings.some(rating => rating.userId === req.userId) || (req.body.grade < 1 || req.body.grade > 5)) {
                res.status(500).json({ error: 'Erreur lors de la notation' });
            } else {
                book.ratings.push({
                    userId: req.body.userId,
                    grade: req.body.rating
                });
                const allGrades = book.ratings.length;
                const gradesSum = book.ratings.reduce((acc, rating) => acc + rating.grade, 0);
                book.averageRating = gradesSum / allGrades;
                book.averageRating = parseFloat(book.averageRating.toFixed(1));
                book.save()
                    .then(book => {
                        res.status(200).json(book);
                    })
                    .catch(error => res.status(500).json({ error }));
            }
        })
        .catch(error => res.status(404).json({ error }));
};

exports.bestGrades = (req, res) => {
    Book.find()
        .sort({ averageRating: -1 })
        .limit(3)
        .then(bestRating =>
            res.status(200).json(bestRating)
        )
        .catch(error => res.status(500).json({ error: 'Erreur lors de la récupération des livres les mieux notés' })
        )
};