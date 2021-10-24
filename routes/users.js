const express = require('express');
const router = express.Router();
const { hashedPassword, checkPassword } = require('../middleware and functions/hashing');
const User = require('../models/user');
const Payment = require('../models/payments')
const { validate, validUser } = require('../models/validate');
const { validateCookies } = require('../middleware and functions/cookies')
const cookieParser = require('cookie-parser');
const {randomPassword}= require('../middleware and functions/randomPassword');
const {sendMailRegister}= require('../middleware and functions/sendEmail');



router.use(cookieParser())

//ROUTES

router.get('/fees', validateCookies,async (req, res) => {

    // console.log(req.query);
    if(Object.keys(req.query).length === 0){
        const result = await User.find()
        .sort({name: 1})
        .select('name branch civilId fees');
        if(!result) return  res.json({success: false, data: 'Idk'})
        return res.clearCookie('updateUser').json({success: true, data: result})
    }   else if(req.query.name){
        

        const { name } = req.query

        const regex = new RegExp(`${name}`, 'i')
        console.log(regex);
        const result = await User.find({name: regex})
        .sort({name: 1})
        .select('name branch civilId fees');

        // if(!result) return  res.json({success: false, data: 'Idk'})
        return res.clearCookie('updateUser').json({success: true, data: result})
    } else if(req.query.civilId){

        const {civilId} = req.query;

        const regex = new RegExp(`^${civilId}`);
        const result = await User.find({civilId: regex})
        .sort({name: 1})
        .select('name branch civilId fees');
        
        return res.clearCookie('updateUser').json({success: true, data: result})
    }

})

// router.get('/:id', validateCookies,async(req, res)=>{
//     // console.log(req.params.id);
//     const result = await User.findById(req.params.id)
//     .select('firstName lastName email civilId phoneNumber branch fees')
//     // console.log(result);
//     if(!result) return res.json({success: false, message: "Can't find ID"});
//     res.cookie('updateUser', req.params.id)
//     return res.json({success: true, data: result});
// })

router.get('/all', validateCookies,async(req, res)=> {

    const qusoor = await User.find({branch: 'Qusoor'});
    const qadsiya = await User.find({branch: 'Qadsiya'});

    if(qadsiya.length == 0 && qusoor.length == 0) return res.json({success: true, message: `We have 0 students`});
   
    if(qadsiya.length == 0 && qusoor.length !== 0) return res.json({success: true, message: `We have ${qusoor.length} students in Al Qusoor`});

    if(qusoor.length == 0 && qadsiya.length !== 0) return res.json({success: true, message: `We have ${qadsiya.length} students in Al Qadsiya`});

    res.json({success: true, message: `We have ${qusoor.length + qadsiya.length} students!!<br>${qadsiya.length} in Al Qadsiya!!<br>${qusoor.length} in Al Qusoor!!`, data: {qadsiya, qusoor}})
})



router.get('/fees/:civilId/:password', async (req, res) => {
    
    const user = await User.findOne({civilId: req.params.civilId});
    if(!user) return res.json({success: false, message: "You do not have a child at our nursery!!"});
    
    if(user.password !== req.params.password) return res.json({success: false, message: "Invalid Password"})
    
    if (user.fees.due === 0) return res.json({success: true, message: "You have no fees"})
    res.json({success: true, message: `You have unpaid fees of amount ${user.fees.due} KD`})
})

router.post('/check-civilId', async(req, res)=>{
    console.log('hello');
    const user = await User.findOne({ civilId: req.body.civilId });
    if (user) return res.json({success: true, message:'Please Enter your password', data: user});
    
    return res.json({success: false, message:'You do not have a child at our nursery'});
})

router.post('/register', async (req, res) => {
    console.log(req.body);
    const { error } = await validate(validUser, req.body);
    // console.log(error.details[0].context.label);
    if (error) return res.json({success: false, message: error.details[0].context.label});
    
    const civilIdExists = await User.findOne({ civilId: req.body.civilId });
    if (civilIdExists) return res.json({success: false, message: "User already registered"});
    
    const user = new User(req.body);
    
    const random = randomPassword()

    // try{
    //     const mail = await sendMailRegister(user.guardian.email, random, user.name);
    // }
    // catch(err){
    //     console.log(err);
    //     return res.json({success: false, message: 'Couldn\nt Send Email, Make Sure to Turn off your AntiVirus or Try Again Later...', err})
    // }   
    
    user.password = random;
    
    const result = await user.save()
    
    return res.json({success: true, message: 'Successfully Registered', data: result})
});

router.put('/', validateCookies, async(req, res)=>{
    const { error } = await validate(validUser, req.body);
    if (error) return res.json({success: false, message: error.details[0].context.label});

    const user = await User.findOneAndUpdate({ civilId: req.body.civilId }, req.body);
    if (!user) return res.json({success: false, message: "Invalid Civil ID!"});
    
    

    try{
        const mail = await sendMail(user.guardian.email, user.password, user.name);
    }
    catch(err){
        console.log(err);
        return res.json({success: false, message: 'Couldn\nt Send Email, Make Sure to Turn off your AntiVirus or Try Again Later...', err})
    }   
    
    
    const result = await user.save()
    
    return res.json({success: true, message: 'Successfully Updated!', data: result})
})

router.post('/fees/apply', validateCookies, async(req, res)=> {

    const {civilId, feesFull, amount, feesPaid} = req.body;

    const user = await User.findOneAndUpdate({civilId}, {
        fees: {
            full: feesFull,
            paid: parseInt(feesPaid) + parseInt(amount),
            due: parseInt(feesFull) - parseInt(feesPaid) - parseInt(amount),
        }
    }, {new: true});
    
    const exisitingPayment = await Payment.findOne({user: user._id});

    if(amount != 0){
        if(exisitingPayment) {
            exisitingPayment.payments.push({amount: amount, type: 'Cash', date: new Date()});
            await exisitingPayment.save()
        } else {
            const payment = new Payment({
                user: user._id,
                payments: [{amount: amount, type: 'Cash', date: new Date()}]
            });
            await payment.save();
        }
    }



    return res.json({success: true, message: 'Updated Successfully!!'})


})

router.get('/:civilId', async(req, res)=> {
    const result = await User.findOne({civilId: req.params.civilId});
    if(!result) return res.json({success: false, message: "Can't find student with this civil ID"});

    return res.json({success: true, message: "Please Fill the Password", data: result});
})

router.delete('/:id', async(req, res)=>{
    const result = await User.findByIdAndDelete(req.params.id);
    res.send(result)
})

// router.post('/register', async (req, res) => {
    //     let user = req.body;
    
    //     // VALIDATE
    //     const { error } = await validateRegister(user);
    //     if (error && error.details[0].path[0] === "passwordAdmin") return res.send("Invalid Admin Password");
    //     if (error) return res.send(error.details[0].message);
    
    //     //CHECK IF EMAIL USED
    //     const existsEmail = await User.findOne({ email: user.email });
    //     if (existsEmail) return res.send("User exists");
    
    //     //CHECK IF CIVILID USED
    //     const existsCivilId = await User.findOne({ civilId: user.civilId });
    //     if (existsCivilId) return res.send("Civil Id already used");
    
//     //HASH PASSWORD
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(user.password, salt);
//     const hashedPasswordAdmin = await bcrypt.hash(user.passwordAdmin, salt);

//     user.password = hashedPassword;
//     user.passwordAdmin = hashedPasswordAdmin;

//     user = new User(req.body);

//     const result = await user.save();

//     return res.send(result)

//     // const result = await user.save();
//     // console.log(error);
//     // res.send(result)
// })


// router.post('/login', async (req, res) => {
//     // VALIDATE
//     const { error } = await validateLogin(req.body);
//     if (error) return res.send(error.details[0].message);

//     //CHECK IF USER EXISTS
//     const user = await User.findOne({ email: req.body.email });
//     if (!user) return res.send("Invalid email or password");

//     //CHECK IF PASSWORD IS VALID
//     const passwordInvalid = await bcrypt.compare(req.body.password, user.password);
//     if (!passwordInvalid) return res.send("Invalid email or password");

//     return res.send("Success")
// })






module.exports = router