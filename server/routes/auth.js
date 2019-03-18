const express = require('express');
const UserController = require('../controllers/auth')


const router = express.Router();

router.post('/register', UserController.createUser);

router.post('', UserController.userLogin);

router.get('/user/:id', UserController.getUser);

module.exports = router;
