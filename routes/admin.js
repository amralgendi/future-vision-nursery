const express = require('express');
const router = express.Router();
const Admin = require('../models/admin');
const User = require('../models/user');
const { validate, validPassword,validAdmin, validLoginAdmin, validUpdate } = require('../models/validate');
const { hashedPassword, checkPassword } = require('../middleware and functions/hashing');
const jwt = require('jsonwebtoken');
const config = require('config')
const cookieParser = require('cookie-parser')
const {validateCookies} = require('../middleware and functions/cookies');
const { sendMailForgotPassword } = require('../middleware and functions/sendEmail');
const { randomPassword } = require('../middleware and functions/randomPassword');



router.use(cookieParser())

router.get('/', async (req, res) => {
    const result = await Admin.find().sort('name').select('-_id')
    res.send(result)
})

router.post('/register', async (req, res) => {
    const { error } = await validate(validAdmin, req.body);

    if(error && error.details[0].path[0]==="passwordAdmin") {
        return res.json({success: false , message: "Invalid Admin Password"});
    } else if (error) {
        return res.json({success: false , message: error.details[0].message});
    }

    const userExists = await Admin.findOne({ email: req.body.email });

    if (userExists) return res.json({success: false , message: 'User already exists!! <a href="login-admin.html">Log in!!</a>'})

    const admin = new Admin(req.body);
    admin.password = await hashedPassword(admin.password)

    const result = admin.save()
    
    
    return res.json({success: true , message: `User created Successfully!! <a id="login" href="login-admin.html">Log in..</a>`})
});

router.post('/login',async (req, res) => {
    const { error } = await validate(validLoginAdmin, req.body);
    if (error) return res.json({success: false, message: error.details[0].message});

    const user = await Admin.findOne({ email: req.body.email });

    if (!user) return res.json({success: false, message: 'Invalid Email or Password'})

    const result = await checkPassword(req.body.password, user.password)

    if(!result) return res.json({success: false, message: 'Invalid Email or Password'})

    const token = jwt.sign({ _id: user._id }, config.get('adminToken'));

    res.cookie('x-auth-token', token)
    return res.json({success: true, message: 'Logged in Successfully'});
});

router.get('/check', validateCookies, async(req, res)=> {
    res.json({success: true, message: 'Access Approved'})
})
router.get('/log-out', async(req, res)=> {
    res.clearCookie('x-auth-token');
    res.json({success: true, message: 'Logged Out'})
})

router.put('/edit-user', validateCookies,async (req, res) => {
    const { error } = await validate(validUpdate, req.body);
    if (error) return res.json({success: false, message: error.details[0].message});

    const user = await User.findById(req.cookies.updateUser)
    if (!user) return res.send("No User Found");
    console.log(user);
    for (const prop in req.body) {
        user[prop] = req.body[prop];
    }

    const result = await user.save();
    console.log(result);
    return res.json({success: true, message: "Updates Successfully!!", data: result});

})

router.get('/password-reset/:email', async(req, res)=>{
    const admin = await Admin.findOne({email: req.params.email});

    if(!admin) return res.json({success: false, message: 'Invalid Email!'});

    const random = randomPassword();



    try{
        const mail = await sendMailForgotPassword(admin.email, random, admin.name);
    }
    catch(err){
        console.log(err);
        return res.json({success: false, message: 'Couldn\nt Send Email, Make Sure to Turn off your AntiVirus or Try Again Later...', err})
    }
    const hashedRandom = await hashedPassword(random);

    return res.cookie('code', hashedRandom).json({success: true, message: 'Check Your Email!'})

})



router.post('/password-reset', async(req, res)=>{
    const {code} = req.cookies;

    const random = req.body.code;

    const result = await checkPassword(random, code);

    if(!result) return res.json({success: false, message: 'Wrong Code!'})

    return res.clearCookie('code').json({success: true, message: 'Correct Code!'})

})

router.post('/password-reset/reset', async(req, res)=>{
    const {email, password, passwordVerify} = req.body;
    const { error } = await validate(validPassword, {password, passwordVerify});
    if (error) return res.json({success: false, message: error.details[0].context.label});

    const hashed = await hashedPassword(password)

    const admin = await Admin.findOneAndUpdate({email}, {password: hashed});


    if(!admin) return res.json({success: false, message: 'Try again some other time!'});

    return res.json({success: true, message: 'Successfully Updated !!</a>'})


})




// router.get('/users', async (req, res) => {
//     const result = await User.find()
//         .select('name email civilId phoneNumber');
//     res.send(result)
// })

// router.get('/users/:civilId', async (req, res) => {
//     const result = await User.findOne({ civilId: req.params.civilId })
//         .select('name email civilId phoneNumber');
//     if (!result) return res.send('civilId not found');
//     res.send(result)
// })

// router.post('/users', async (req, res) => {
//     const { error } = await validateAdminPost(req.body);
//     if (error) return res.send(error.details[0].message)

//     //CHECK IF CIVILID EXISTS
//     const civilIdExists = await User.findOne({ civilId: req.body.civilId });
//     if (civilIdExists) return res.send("Civil ID Already Used");

//     const user = new User(req.body);
//     const result = await user.save();
//     res.send(result)
// })

// router.put('/users/:id', async (req, res) => {
//     const user = await User.findById(req.params.id);

//     //VALIDATE
//     const { error } = await validateAdding(req.body);
//     if (error) return res.send(error.details[0].message);


//     //CHECK IF EMAIL EXISTS
//     const emailExists = await User.findOne({ email: req.body.email });
//     if (emailExists) return res.send("Email Already Used");


//     for (prop in req.body) {
//         user[prop] = req.body[prop];
//         console.log(user[prop]);
//     }

//     if (req.body.password) user.password = await hashedPassword(user.password);

//     const result = await user.save();

//     res.send(result)

// })
module.exports = router;