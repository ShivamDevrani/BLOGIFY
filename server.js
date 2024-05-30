const express=require('express');

const app=express();

const db=require('./db');

const bodyParser=require('body-parser');


const cookieParser = require('cookie-parser');

app.use(cookieParser());


const staticRoutes=require('./routes/staticRoutes');

const userRoutes=require('./routes/userRoutes');

const path=require('path');

require('dotenv').config();

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({extended:true}));

app.use('/',staticRoutes);

app.use('/user',userRoutes);


//views

app.set('view engine','ejs');

app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));


const PORT=process.env.PORT||8000;

app.listen(PORT,()=>{
    console.log('server is live');
})

