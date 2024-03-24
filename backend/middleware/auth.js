const jwt = require('jsonwebtoken');
require('dotenv').config();

const jwtToken = process.env.TOKEN;
 
module.exports = (req, res, next) => {
    console.log(req.headers.authorization);
   try {
       const token = req.headers.authorization.split(' ')[1];
       const decodedToken = jwt.verify(token, jwtToken);
       const userId = decodedToken.userId;
       req.auth = {
           userId: userId
       };
	next();
   } catch(error) {
       res.status(401).json({ error });
   }
};