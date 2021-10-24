const jwt = require('jsonwebtoken');
const Admin = require('../models/admin')
const config = require('config');

module.exports.validateCookies = async function validateCookies (req, res, next){
    console.log(req.cookies);
    if(!req.cookies) return res.json({success: false, message: 'Please Log in again!! if this error resumes please enable use of cookies'})
    const token = req.cookies['x-auth-token'];

    if(!token) return res.json({success: false, message: 'Please Log in Again!!!'});
try{
    const payload = await jwt.verify(token, config.get('adminToken'));

    const user = await Admin.findById(payload._id);

    if(!user) {
        return res.clearCookie('x-auth-token').json({success: false, message: 'NOT ALLOWED!!!'}) 
    }
    return next();
}
catch(ex){
    return res.json({success: false, message: 'NOT ALLOWED!!!'})
}
};