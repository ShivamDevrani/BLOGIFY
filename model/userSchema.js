const mongoose=require('mongoose');

const bcrypt=require('bcrypt');

const userSchema=new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required:true,
        unique:true,
    },
    profileImageUrl:{
        type:String,
        default:"/uploads/default.png"
    },
    password:{
        type:String,
        required:true,
    },
    isVerified: {
        type: Boolean,
        default: false
    }
})


userSchema.pre('save',async function(next){
    const user=this;
    if(!user.isModified('password'))
    return next();

    try{
        const salt=await bcrypt.genSalt(5);

        const hashedPassword=await bcrypt.hash(user.password,salt);

        user.password=hashedPassword;

        next();

    }
    catch(err)
    {
        return next(err);
    }
})

userSchema.methods.comparePassword = async function (userPassword) {
    try {
      const isMatch = await bcrypt.compare(userPassword, this.password);
      return isMatch;
    } catch (err) {
      throw err; 
    }
  };
const USER=mongoose.model('USER',userSchema);

module.exports=USER;

