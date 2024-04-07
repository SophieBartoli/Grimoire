const multer = require('multer');

const MIME_TYPES = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpeg',
  'image/png': 'png',
  'image/webp': 'webp'
};

const storage = multer.memoryStorage();

const filter = (req, file, cb) => {
  if (file.mimetype.split("/")[0] === 'image') {
    const name = file.originalname.split(' ').join('_');
    const extension = MIME_TYPES[file.mimetype];
    cb(null, name);
  } else {
      cb(new Error("Only images are allowed!"));
  }
};

module.exports = multer({storage: storage, fileFilter: filter}).single('image');