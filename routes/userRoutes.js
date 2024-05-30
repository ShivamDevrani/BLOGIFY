const express=require('express');

const router=express();

const upload=require('../middleware/multer');
const BLOG=require('../model/blogSchema');

const fs=require('fs');
const path = require('path');

const {generateToken,jwtAuthMiddleware}=require('../middleware/jwtAuthMiddleware');

const USER=require('../model/userSchema');
const OTP=require('../model/otpSchema');

const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator');


const {signupHandler,loginHandler,otpChecker,verifyHandler}=require('../controller/user');
//user signup

router.post('/signup',signupHandler);

//verify otp sent by user
router.post('/otp-enter',otpChecker);

//user login

router.post('/login',loginHandler);

router.post('/verify',verifyHandler);

router.post('/resetPassword',jwtAuthMiddleware,async (req,res)=>{
     const {email,password}=req.body;
     try{
          const user=await USER.findOne({email});
          if(!user) res.redirect('/signup?user do not exists');
          
          user.password=password;

          await user.save();

          console.log('password changed succesfully');

          res.clearCookie('token');

          res.redirect('/signup?password changed successfully');
          

     }catch(err)
     {
          console.log(err);
          res.redirect('/signup?internal server error');
     }
})

router.post('/addBlog',jwtAuthMiddleware,upload.single('coverImage'),async (req,res)=>{
    try{
         const {title,blogType,body}=req.body;
         const blog=new BLOG({
            title,
            blogType,
            body,
            coverImageUrl:`/uploads/${req.file.filename}`,
            createdBy:req.user.name,
            publisherId:req.user.id,
            publisherImageUrl:req.user.profileImageUrl,
         })
         await blog.save();
         console.log('blog saved succesfully');
         res.redirect('/myBlogs?Accepted');
    }
    catch(err)
    {
         console.log(err);
         res.redirect('/addBlog?internal server error');
    }
});

router.get('/deleteBlog/:id',jwtAuthMiddleware,async (req,res)=>{
     try{
          const id=req.params.id;
          const blog=await BLOG.findByIdAndDelete(id);
          
          console.log('blog deleted succesfully');
          res.redirect('/myBlogs?deleted');
     }
     catch(err)
     {
          console.log(err);
          res.redirect('/myBlogs?internal server error');
     }
 });


router.post('/comment/:id',jwtAuthMiddleware,async (req,res)=>{
     const id=req.params.id;
     const {commentBody}=req.body;
     const userId=req.user.id;
     try{
          const blog=await BLOG.findById(id);
          blog.comments.push({
              commentBody,
              commentedBy:req.user.name,
              commenterId:userId,
          })
          await blog.save();
          console.log('comment added successfully');

          res.redirect(`/blog/${id}?commentAddedSuccessfully`);

     }catch(err)
     {
          console.log(err);
          res.redirect(`/blog/${id}?failed internal server error`);

     }
})

router.get('/delete/:blogId/:commentId',async (req,res)=>{

     const {blogId,commentId}=req.params;
     try{
          const blog=await BLOG.findById(blogId);

          blog.comments= blog.comments.filter(comment=>{
               if(comment.id.toString()===commentId.toString())
                    {
                         return false;
                    }
                    else 
                 
                  return true;
          })
          
          await blog.save();
          console.log('comment deleted')
         
          res.redirect(`/blog/${blogId}?comment deleted`);

     }catch(err){
          console.log(err);
          res.redirect(`/blog/${blogId}?failed internal server error`);
     }

})


router.get('/like/:id',jwtAuthMiddleware,async (req,res)=>{
     const id=req.params.id;
     try{
          const userId=req.user.id;
          const blog=await BLOG.findById(id);

          const alreadyLiked = blog.likes.includes(userId);
         

        if (alreadyLiked) {
            console.log('User has already liked this blog');
            return res.redirect(`/blog/${id}?alreadyLiked`);
        }

          blog.likes.push(userId);
          await blog.save();
          console.log('liked successfully');

          res.redirect(`/blog/${id}?likedSuccessfully`);

     }catch(err)
     {
          console.log(err);
          res.redirect(`/blog/${id}?failed internal server error`);

     }
})

router.get('/removeLike/:id',jwtAuthMiddleware,async (req,res)=>{
     const id=req.params.id;
     try{
          const userId=req.user.id;
          const blog=await BLOG.findById(id);

          blog.likes.pop(userId);
          await blog.save();
          console.log('unlike successfully');

          res.redirect(`/blog/${id}?unlike successfull`);

     }catch(err)
     {
          console.log(err);
          res.redirect(`/blog/${id}?failed internal server error`);

     }
})

router.post('/changeImage',jwtAuthMiddleware,upload.single('profileImage'),async (req,res)=>{
    try{

        const user=await USER.findById(req.user.id);

       
       if(user.profileImageUrl!=="/uploads/default.png")
          {
               const filepath=`public/${user.profileImageUrl}`;

               fs.unlink(filepath,(err)=>{
                  if(err)
                       console.log(err);
               })
          }
        
        user.profileImageUrl=`/uploads/${req.file.filename}`;
        req.user.profileImageUrl=user.profileImageUrl;

        const blogs = await BLOG.find({});

        await Promise.all(
          blogs.map(async (blog) => {
            let updated = false;
        
            blog.comments.forEach(comment => {
              if (comment.commenterId.toString() === user.id.toString()) {
                comment.commenterProfile = user.profileImageUrl;
                updated = true;
              }
            });
        
            if (updated) {
              await blog.save();
            }
          })
        );
        //deleting previous token
        const payload=req.user;
        const token= generateToken(payload);

        res.clearCookie('token');
        res.cookie('token',token);
        
        await user.save();
        res.redirect('/myProfile?Changed successfully');

    }
    catch(err)
    {
       console.log(err);
       res.redirect('/myProfile?internal server error');
    }
})


module.exports=router;