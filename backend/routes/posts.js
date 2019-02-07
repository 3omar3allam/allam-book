const PostController = require('../controllers/post');

const checkAuth = require('../middleware/check-auth');
const express = require('express');

const router = express.Router();

router.get('',PostController.getPosts);

router.get('/:id',PostController.getPost);

router.post('', checkAuth, PostController.addPost);

router.delete("/:id", checkAuth, PostController.deletePost);

router.put("/:id",checkAuth, PostController.editPost);

module.exports = router;
