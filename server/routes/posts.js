const express = require('express');

const PostController = require('../controllers/post');

const checkAuth = require('../middleware/check-auth');
const extractFile = require('../middleware/extract-file');

const router = express.Router();

router.get('',PostController.getPosts);

router.get('/:id',PostController.getPost);

router.post('', checkAuth, extractFile ,PostController.addPost);

router.delete("/:id", checkAuth, PostController.deletePost);

router.put("/:id",checkAuth, extractFile, PostController.editPost);

module.exports = router;
