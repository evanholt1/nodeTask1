const jwt = require('jsonwebtoken')


function authToken (req,res,next) {
  //const token = req.header('Authorization');
  const token = req.cookies.id;
  if(!token) {
    req.app.locals.msg = "Access Denied";
    return res.status(401).redirect('/');
  } else {
    try {
      const verified = jwt.verify(token,process.env.TOKEN_SECRET);
      // req.user (user._id) is available for the current request route.
      req.user = verified;
      req.app.locals.isLoggedIn = true;
      next();
    } catch (error) {
      console.log(error);
      req.app.locals.msg = "Access Denied";
      res.status(401).redirect('/');
    }
  }
}

module.exports = authToken;