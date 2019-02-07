const Post = require('../models/post');
const User = require('../models/user');

exports.getPosts = (req,res,next)=>{
  const pageSize = parseInt(req.query.pagesize);
  const currentPage = parseInt(req.query.page);
  const postQuery = Post.find().sort({date: 'desc'})
    .populate('creator','firstName lastName');
  let fetchedPosts;
  if(pageSize && currentPage){
    postQuery
      .skip(pageSize * (currentPage - 1))
      .limit(pageSize);
  }
  postQuery.then(documents=>{
    Post.countDocuments()
    .then(count=>{
      documents = documents.map((post)=>{
        let creator = post.creator;
        let image= post.image;
        if(image){
          image = {
            name: image.name,
            binary: image.binary.toString('base64'),
            type: image.type,
          }
        }
        return {
          id: post._id,
          creator: {
            id: creator._id,
            name: `${creator.firstName} ${creator.lastName}`
          },
          date: post.date,
          content: post.content,
          image: image,
          edited: post.edited,
        };
      })
      res.status(200).json({
        message: "Posts fetched successfully.",
        posts: documents,
        total: count,
      });
    });
  })
  .catch(error => {
    console.log(error);
    res.status(500).json({
      message: "Failed to load posts!",
    });
  });
}

exports.getPost = (req,res,next)=>{
  Post.findById(req.params.id)
    .populate('creator','firstName lastName')
    .then(post => {
      if(post){
        let creator = post.creator;
        let image = post.image;
        if (image){
          image={
            name: image.name,
            binary: image.binary.toString('base64'),
            type: image.type,
          }
        }
        res.status(200).json({
          id: post._id,
          creator: {
            id: creator._id,
            name: `${creator.firstName} ${creator.lastName}`,
          },
          date: post.date,
          content: post.content,
          image:image,
        });
      }else{
        res.status(404).json({message: 'Post not found'});
      }
    })
  .catch(error => {
    console.log(error);
    res.status(500).json({
      message: "Failed to fetch post!",
    });
  });
}

exports.addPost = (req,res,next)=>{
  User.findById(req.userData.userId,'posts')
  .then(user => {
    const post = new Post({
      creator: user._id,
      date: req.body.date,
      content: req.body.content,
      edited: false,
    });
    if(req.files){
      post['image'] = {
        name: req.files.image.name,
        binary: req.files.image.data,
        type: req.files.image.mimetype,
      };
    }
    post.save().then(()=>{
      user.posts.push(post);
      user.save().then(()=>{
        res.status(201).json({
          message: "Post added!",
        });
      });
    });
  })
  .catch(error => {
    console.log(error);
    res.status(500).json({
      message: "Failed to create post!",
    });
  });
}

exports.deletePost = (req,res,next) => {
  Post.findById(req.params.id)
    .populate('creator','posts')
    .then(post => {
      if(post.creator._id == req.userData.userId){
        Post.deleteOne({_id:req.params.id})
        .then(()=>{
          let postIndex = post.creator.posts.indexOf(post._id);
          if(postIndex!=-1)post.creator.posts.splice(postIndex);
          post.creator.save().then(()=>{
            res.status(200).json({message: "Post deleted!"});
          });
        })
      }else{
        res.status(401).json({message: "Unauthorized!"})
      }
    })
    .catch(error=>{
      console.log(error);
      res.status(500).json({message: "An unknown error occured."})
    })
}

exports.editPost = (req,res,next) => {
  Post.findById(req.params.id)
  .then(post => {
    image = null;
    if(req.files){
      image = {
        name: req.files.image.name,
        binary: req.files.image.data,
        type: req.files.image.mimetype,
      };
    }
    if(post.creator._id == req.userData.userId){
      Post.updateOne({_id: req.params.id},{
        content: req.body.content,
        image: image,
      }).then(result=>{
        if(result.nModified){
          post.edited = true;
          post.save().then(()=>
            res.status(201).json({
              success: true,
              message: 'Post updated!',
            })
          )
        }else{
          res.status(200).json({message: "No changes occured"});
        }
      });
    }else{
      res.status(401).json({
        success: false,
        message: "Unauthorized!",
      });
    }
  })
  .catch(error=>{
    console.log(error);
    res.status(500).json({
      message: "Failed to edit post!",
    });
  });
}
