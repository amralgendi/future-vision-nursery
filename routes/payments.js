const Payment = require('../models/payments');
const User = require('../models/user');
const express = require('express');
const router = express.Router();
const { validateCookies } = require('../middleware and functions/cookies');

// console.log(Payment);

router.get('/:civilId', async(req, res)=>{
    const {civilId} = req.params;

    const user = await User.findOne({civilId});
    
    if(!user) return res.json({success: false, message: 'Invalid Civil ID'})

    const { _id } = user

    const payments = await Payment.findOne({user: _id}).populate('user', 'name civilId');

    if(!payments) return res.json({success: false, message: 'Students does not have any recorded fees yet'})
    // console.log(payments);

    res.json({success: true, message: 'Fetched recorded payments Successfullyy', data: payments});

})



module.exports = router