const express=require('express');

const router=express();

const upload=require('../middleware/multer');
const BLOG=require('../model/blogSchema');

const fs=require('fs');
const path = require('path');

const sharp=require('sharp');

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
         
         const originalFilePath = path.join(__dirname, '..', 'public', 'uploads', req.file.filename);
     const newFilePath = path.join(__dirname, '..', 'public', 'uploads', `${req.file.filename}.webp`);

     console.log('Original file path:', originalFilePath);
     console.log('New file path:', newFilePath);
         
         try {
          await sharp(originalFilePath)
          .webp({ quality: 60})
          .rotate()  // Auto-rotate based on EXIF data
          .toFile(newFilePath);
           console.log('Image converted to WebP successfully');
     } catch (sharpError) {
         console.error('Sharp conversion error:', sharpError);
         return res.redirect('/myProfile?error=Unsupported image format');
     }

     sharp.cache(false); // used to unlock the file since the file is locked or in use 

       fs.unlink(originalFilePath, (err) => {
              if (err) {
                  console.log('Error removing old file:', err);
              } else {
                  console.log('Old file removed:', originalFilePath);
              }
          });


         const blog=new BLOG({
            title,
            blogType,
            body,
            coverImageUrl: `/uploads/${req.file.filename}.webp`,
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


          const blog=await BLOG.findById(id);
           
               const oldFilePath = path.join(__dirname, '..', 'public', blog.coverImageUrl);

               console.log('Old file path to be removed:', oldFilePath);
               
               fs.unlink(oldFilePath, (err) => {
                   if (err) {
                       console.log('Error removing old file:', err);
                   } else {
                       console.log('Old file removed:', oldFilePath);
                   }
               });
          
          await blog.deleteOne();
          
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
              commenterProfile:req.user.profileImageUrl
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
        
     const user = await USER.findById(req.user.id);

     if (user.profileImageUrl !== "/uploads/default.png") {
         const oldFilePath = path.join(__dirname, '..', 'public', user.profileImageUrl);
         console.log('Old file path to be removed:', oldFilePath);

         fs.unlink(oldFilePath, (err) => {
             if (err) {
                 console.log('Error removing old file:', err);
             } else {
                 console.log('Old file removed:', oldFilePath);
             }
         });
     }

     const originalFilePath = path.join(__dirname, '..', 'public', 'uploads', req.file.filename);
     const newFilePath = path.join(__dirname, '..', 'public', 'uploads', `${req.file.filename}.webp`);

     console.log('Original file path:', originalFilePath);
     console.log('New file path:', newFilePath);

     

     // Convert the image to WebP format
     try {
          await sharp(originalFilePath)
          .webp({ quality: 60 })
          .rotate()  // Auto-rotate based on EXIF data
          .toFile(newFilePath);
           console.log('Image converted to WebP successfully');
     } catch (sharpError) {
         console.error('Sharp conversion error:', sharpError);
         return res.redirect('/myProfile?error=Unsupported image format');
     }

     sharp.cache(false); // used to unlock the file since the file is locked or in use 

       fs.unlink(originalFilePath, (err) => {
              if (err) {
                  console.log('Error removing old file:', err);
              } else {
                  console.log('Old file removed:', originalFilePath);
              }
          });

     user.profileImageUrl = `/uploads/${req.file.filename}.webp`;
     req.user.profileImageUrl = user.profileImageUrl;

     const blogs = await BLOG.find({});

     console.log(`Found ${blogs.length} blogs to update.`);
 
     await Promise.all(
       blogs.map(async (blog) => {
         let updated = false;
 
         blog.comments.forEach(comment => {
           if (comment.commenterId.toString() === user.id.toString()) {
             console.log(`Updating comment for blog ${blog._id} with new profile image URL.`);
             comment.commenterProfile = user.profileImageUrl;
             updated = true;
           }
         });
 
         if (updated) {
           console.log(`Saving blog ${blog._id} after updating comments.`);
           await blog.save();
         } else {
           console.log(`No updates needed for blog ${blog._id}.`);
         }
       })
     );
 
       
        //deleting previous token
        const payload=req.user;
        const token= generateToken(payload);

        

        res.clearCookie('token');
        res.cookie('token',token);
        
        await user.save();
        console.log('changed sucessfully');
        res.redirect('/myProfile?Changed successfully');

    }
    catch(err)
    {
       console.log(err);
       res.redirect('/myProfile?internal server error');
    }
})


module.exports=router;