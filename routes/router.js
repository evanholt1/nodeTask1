const router = require('express').Router();
const apiController = require('../controllers/apiController')

const authToken = require('../config/authToken')

router.get('/',apiController.getIndex);

router.post('/signup',apiController.postSignup);

router.post('/login',apiController.postLogin);

// admin routes



router.get('/admin',authToken,apiController.getAdmin);

router.get('/admin/read',authToken,apiController.getadminRead);

router.put('/admin/update',authToken,apiController.putadminUpdate);

router.delete('/admin/delete',authToken,apiController.deleteadminDelete);

module.exports = router;