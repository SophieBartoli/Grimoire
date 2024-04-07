const fs = require('fs');
const sharp = require('sharp');

module.exports = (req, res, next) => {

    try {
    
    const resizedFileName = `resized-${req.file.originalname.replace(/\.[^.]+$/, '')}.webp`;
    const resizedImagePath = `./images/${resizedFileName}`;

    sharp(req.file.buffer)
    .resize(206, 260)
    .toFormat('webp')
    .toFile(resizedImagePath, (err, info) => {
        if (err) {
            return res.status(401).json({ error: err.message });
        }
        req.file.filename=resizedFileName;
        next();
    });
    } catch(error) {
        res.status(401).json({ error });
    }
};