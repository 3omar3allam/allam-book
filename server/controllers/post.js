const Post = require('../models/post');
const User = require('../models/user');

exports.getPosts = (req,res,next)=>{
  const pageSize = parseInt(req.query.pagesize);
  const currentPage = parseInt(req.query.page);
  const postQuery = Post.find().sort({date: 'desc'})
    .populate('creator','firstName lastName');
  if(pageSize && currentPage){
    postQuery
      .skip(pageSize * (currentPage - 1))
      .limit(pageSize);
  }
  let fetchedPosts = [];
  postQuery.then(documents=>{
      fetchedPosts = documents;
      return Post.countDocuments()
    })
    .then(count=>{
      fetchedPosts = fetchedPosts.map((post)=>{
        let creator = post.creator;
        return {
          id: post._id,
          creator: {
            id: creator._id,
            name: `${creator.firstName} ${creator.lastName}`
          },
          date: post.date,
          content: post.content,
          imagesPath: post.imagesPath,
          edited: post.edited,
        };
      })
      res.status(200).json({
        message: "Posts fetched successfully.",
        posts: fetchedPosts,
        total: count,
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
        res.status(200).json({
          id: post._id,
          creator: {
            id: creator._id,
            name: `${creator.firstName} ${creator.lastName}`,
          },
          date: post.date,
          content: post.content,
          imagesPath: post.imagesPath,
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
  let imagesPath = [];
  if(req.files) {
    const {success, error, filenames} = req.uploadStatus;
    if(!success){
      res.status(500).json({
        message: error
      }).end();
    }else {
      for(let filename of filenames){
        let host = req.hostname;
        if(host === 'localhost') host += `:${process.env.PORT}`
        const url = req.protocol +"://" + host;
        imagesPath.push(url+ "/images/" + filename);
      }
    }
  }
  User.findById(req.userData.userId)
  .then(user => {
    const post = new Post({
      creator: user,
      date: req.body.date,
      content: req.body.content,
      imagesPath: imagesPath,
      edited: false,
      hasImage: req.body.hasImage
    });
    post.save().then(result => {
      res.status(201).json({
        message:'Post added!',
      });
    })
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
    let imagesPath = [];
    if(req.files) {
      const {success, error, filenames} = req.uploadStatus;
      if(!success){
        res.status(500).json({
          message: error
        }).end();
      }else {
        for(let filename of filenames){
          let host = req.hostname;
          if(host === 'localhost') host += `:${process.env.PORT}`
          const url = req.protocol +"://" + host;
          imagesPath.push(url+ "/images/" + filename);
        }
      }
    }
    if(post.creator._id == req.userData.userId){
      Post.updateOne({_id: req.params.id},{
        content: req.body.content,
        imagesPath: imagesPath,
        hasImage: req.body.hasImage
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
