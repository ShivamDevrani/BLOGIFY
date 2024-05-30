const jwt=require('jsonwebtoken');

require('dotenv').config();

const jwtAuthMiddleware=async(req,res,next)=>{
    const token=req.cookies.token;
    if(!token) return res.redirect('/signup');
    try{
        const decoded= jwt.verify(token,process.env.JWT_KEY);
        req.user=decoded;
        next();

    }catch(err)
    {
        console.log(err);
        res.redirect('/signUp?error=invalid token');
    }
}

const generateToken=(userdata)=>{
    return jwt.sign(userdata,process.env.JWT_KEY);
}
const jwtParser=async(req,res,next)=>{
    const token=req.cookies.token;
    if(!token) return res.render('home');
    try{
        const decoded= jwt.verify(token,process.env.JWT_KEY);
        req.user=decoded;
        next();

    }catch(err)
    {console.log(err);
        res.redirect('/signUp?error=invalid token');
    }
}

const jwtTokenChecker= async (req,res,next)=>{
    const token=req.cookies.token;
     
    try{
        if(!token)
            {
                return next();
            }
            
        const decoded= jwt.verify(token,process.env.JWT_KEY);
        req.user=decoded;
        next();

    }catch(err)
    {console.log(err);
        res.redirect('/signUp?error=invalid token');
    }

}
module.exports={jwtAuthMiddleware,jwtParser,generateToken,jwtTokenChecker};


