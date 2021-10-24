const config = require('config')
const nodemailer = require('nodemailer')
const transporter = nodemailer.createTransport({
    host: "futurevisionnursery.com",
    port: 465,
    secure: true,
    auth: {
        user: config.get('email'),
        pass: config.get('emailPassword')
    }
})
transporter.verify((err, success)=>{
    if(err) console.log(err);
    if(success) console.log('ready');
})

module.exports.sendMailRegister = async function sendMailRegister(email, password, name){
    const message = {
        from: config.get('email'),
        to: email,
        bcc: config.get('email'),
        subject: "Ur student code",
        text: `Thank you for trusting is with your child ${name}, your student password for paying your fees is  ${password}`,
        html: `<h1>Thank you for trusting is with your child ${name}</h1> \n <p>your student code for paying your fees is</p> \n <h1><em>${password}</em></h1>`
}
    return transporter.sendMail(message)
}

module.exports.sendMailForgotPassword = async function sendMailForgotPassword(email, code, name){
    const message = {
        from: config.get('email'),
        to: email,
        bcc: config.get('email'),
        subject: 'Password Reset',
        text: `Hey ${name}, Your password reset code is ${code}`,
        html: `<h1>Hey ${name}</h1> <br> Your password reset code is <em>${code}</em>`
    }

    return transporter.sendMail(message)
}

