const express=require('express');

const router=express.Router();

const {jwtAuthMiddleware,jwtParser,jwtTokenChecker}=require('../middleware/jwtAuthMiddleware');

const BLOG=require('../model/blogSchema');
const USER=require('../model/userSchema');


router.get('/',jwtParser,async (req,res)=>{

    res.render('home',{
        name:req.user.name.split(" ")[0],
        profileImageUrl:req.user.profileImageUrl,
    });
})

router.get('/signup',(req,res)=>{
    res.render('signup');
})

router.get('/verify',(req,res)=>{
    res.render('verify',{query:req.query.state});
})

router.get('/otp-enter',(req,res)=>{
   
    res.render('otp',{query:req.query.state});
})

router.get('/logout', (req, res) => {
    
    res.clearCookie('token');
    console.log('logout done');
    res.redirect('/');
  })

router.get('/addBlog',jwtAuthMiddleware,(req,res)=>{
    res.render('addBlog',{
        name:req.user.name.split(" ")[0],
        profileImageUrl:req.user.profileImageUrl
    });
  })

router.get('/readBlogs',jwtAuthMiddleware,async (req,res) =>{
    try{
        const blogs=await BLOG.find({});
        res.render('blogs',{
            blogs,
            name:req.user.name.split(' ')[0],
            profileImageUrl:req.user.profileImageUrl
        });
    }
    catch(err)
    {
        console.log(err);
        res.redirect('/?internal server error');
    }
})

router.get('/blog/:id',jwtAuthMiddleware,async (req,res)=>{
    const blogId=req.params.id;
    const userId=req.user.id;
    try{
         const blog=await BLOG.findById(blogId);
         if (!blog) {
            return res.redirect('/readBlogs'); 
        }

         const isLiked= blog.likes.includes(userId);
         
         const userComments=[];
         const otherComments=[];

         blog.comments.forEach((comment) => {
            if (comment.commenterId.toString() === userId.toString()) {
                userComments.push(comment);
            } else {
                otherComments.push(comment);
            }
        });
        
         blog.comments = [...userComments, ...otherComments];
         console.log(req.user.profileImageUrl);
         
        res.render('viewBlog',{
            blog,
            userId,
            name:req.user.name.split(" ")[0],
            isLiked,
            profileImageUrl:req.user.profileImageUrl,
        })
        
    }catch(err)
    {
        console.log(err);
        res.redirect('/readBlogs');
    }
 
})

router.get('/myBlogs',jwtAuthMiddleware,async (req,res)=>{
    try{
        const blogs=await BLOG.find({publisherId:req.user.id});
        console.log(req.user.profileImageUrl);
        res.render('myBlogs',{
            blogs,
            name:req.user.name.split(' ')[0],
            profileImageUrl:req.user.profileImageUrl,
        });
    }
    catch(err)
    {
        console.log(err);
        res.redirect('/?internal server error');
    }
})

router.get('/myProfile',jwtAuthMiddleware,async (req,res)=>{
    try{
        const user=await USER.findById(req.user.id);
        
        res.render('myProfile',{
            name:req.user.name.split(" ")[0],
            user,
        });
    }
    catch(err)
    {
        console.log(err);
        res.redirect('/?internal server error');
    }
  
})

router.get('/resetPassword',jwtTokenChecker,async (req,res)=>{
    try{
        //user didnt login 
        if(!req.user) 
        {
            return res.render('resetPass');
        } 
      
        //user have token
        const user=await USER.findById(req.user.id);
        if(user.password===req.query.key)
         return res.render('resetPass');
        
        //user have token but trying to pass the otp section and directly jumping to reset password
        res.redirect('/verify?very chalaak bro very chaaalak');

    }
    catch(err)
    {
         console.log(err);
         res.redirect('/?internal server error');
    }
   

})

module.exports=router;
