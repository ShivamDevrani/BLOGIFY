const {generateToken,jwtAuthMiddleware}=require('../middleware/jwtAuthMiddleware');

const USER=require('../model/userSchema');
const OTP=require('../model/otpSchema');

const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator');


//creating transporter object


//verifying process chanllenges

//user discard the process of verifying at the starting and then tries to login

//solution--> login will direct it to verify page again and pass ?state=newbie

//user wants to reset the password/change the password
//solution --> it will direct it to verify page and pass query ?state=change

//user forgot its password 
//solution---> it will be same as change the password



const transporter=nodemailer.createTransport({
    service:'gmail',
    auth:{
        user:'shivamdevrani093@gmail.com',
        pass:'auhm mycz pooc kbkf'
    }
})

const sendOtpEmail=async (email,otp)=>{
    const mailOptions={
        from:'Gojoservices@gmail.com',
        to:email,
        subject:'YOUR OTP CODE',
        text:`Thanks for Registration, Your Otp Code Is ${otp}`,
    };

    try{
       const info=await transporter.sendMail(mailOptions);
       
       console.log('Email sent: ' + info.response);

    }
    catch(err)
    {
        console.error('Error sending email: ' + err);
        throw new Error('Failed to send OTP email');
    }
}


const signupHandler=async (req,res)=>{
    

    const {name,email,password}=req.body;
    try{
        const user=new USER({
           name:name.toUpperCase(),
           email,
           password
        });

        await user.save();

        console.log('user saved successfully');

        const otp = otpGenerator.generate(6, {
            digits: true,
            lowerCaseAlphabets: false,
            upperCaseAlphabets: false,
            specialChars: false,
        });
        
        const otpEntry=new OTP({
            email,
            otp
        })

        await otpEntry.save();

        console.log('otp Schema Created Successfully');

        await sendOtpEmail(email,otp);

        console.log('otp sent successfully');

        res.redirect('/otp-enter?state=newbie');
       
    }
    catch(err)
    {
        console.log(err);
        res.redirect('/signup?error=internal server error');
    }

}

const loginHandler=async (req,res)=>{
    const {email,password}=req.body;
    try{
       const user=await USER.findOne({email});
       if(!user) return res.render('/signup?user not found');
       
       if(user.isVerified==='false')
        res.redirect('/verfiy?state=newbie');

       if(!await user.comparePassword(password)) {
          return res.redirect('/signup?Wrong Password');
        }
  
        const payload={
          id:user.id,
          name:user.name,
          profileImageUrl:user.profileImageUrl,
        }
        console.log(user.profileImageUrl);
        const token=generateToken(payload);
  
        res.cookie('token', token);
  
        console.log('login successfull');
        
        res.render('home',{
          name:user.name.split(' ')[0],
          profileImageUrl:user.profileImageUrl,
        });
    }
    catch(err)
    {
      console.log(err);
      res.redirect('/signup?error=internal server error');
    }
  }


const otpChecker=async (req,res)=>{

    const {email,otp}=req.body;
    
    console.log(email,otp);
    const state=req.query.state;

    console.log(state);

    try{
       const otpEntry=await OTP.findOne({email,otp});
       
       if(!otpEntry)
        {
            console.log('wrong otp');
            return res.redirect('/otp-enter?wrong otp');
        }
        console.log('otp verified');
    
        const user=await USER.findOne({email});

        user.isVerified=true;

        await user.save();

        await OTP.deleteOne({ email, otp });
        
        if(state==='newbie')
        return  res.redirect('/signup?signup Sucessfull');
        
        res.redirect(`/resetPassword?key=${user.password}`);
    }
    catch(err){
        console.log(err);
        res.redirect('/signup?error=internal server error');
    }

}

const verifyHandler=async (req,res)=>{
   try{
       const {email}=req.body;

       const oldOtp=await OTP.findOne({email});

       if(oldOtp)
        {
        console.log('old otp deleted');
         oldOtp.deleteOne;
        }
            

       const user=await USER.find({email});

       const state=req.query.state;
       
       if(!user) res.redirect('/verify?no such account exists');

       const otp = otpGenerator.generate(6, {
        digits: true,
        lowerCaseAlphabets: false,
        upperCaseAlphabets: false,
        specialChars: false,
    });
     
    const otpEntry=new OTP({
        email,
        otp
    });
    
    await otpEntry.save();

    console.log('otp Schema Created Successfully');

    await sendOtpEmail(email,otp);

    console.log('otp sent successfully');

    res.redirect(`/otp-enter?state=${state}`);

   }
   catch(err)
   {
      console.log(err);
      res.redirect('/verfiy?internal server error');
   }
}



module.exports={signupHandler,loginHandler,otpChecker,verifyHandler};