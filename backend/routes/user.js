const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/user');

router.post('/signup', userCtrl.signup);
router.post('/login', userCtrl.login);
router.get('/login', (req, res, next) => {
    res.json({ message: 'You are in login page' });
    next();
});

module.exports = router;