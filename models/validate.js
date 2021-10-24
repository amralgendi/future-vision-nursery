const Joi = require('joi');
const countryList = require('../fees-public/countryList')

const validAdmin = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required().label('Invalid Email'),
    phoneNumber: Joi.string().length(8).pattern(/^\d{8}$/).required().label('Invalid Phone Number'),
    password: Joi.string().min(8).max(1024).required(),
    passwordVerify: Joi.string().min(8).max(1024).required().valid(Joi.ref('password')).label('Passwords don\'t match'),
    passwordAdmin: Joi.any().valid('yumna112233', 'selma0704', 'amoura20000').label('Invalid Admin Password')
});

const validLoginAdmin = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

const validRegister = Joi.object({
    civilId: Joi.string().length(12).pattern(/^\d{12}$/),
    branch: Joi.any().valid('Qadsiya', 'Qusoor').required()
});

const validLoginUser = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});


const validUser = Joi.object({
    name: Joi.string().required().pattern(/^[A-Za-z]+\s{1}[A-Za-z]+\s{1}[A-Za-z]+$|^[A-Za-z]+\s{1}[A-Za-z]+\s{1}[AaEe]{1}[Ll]{1}-[A-Za-z]+$/).label('Please add the first three names of the student.'),
    gender: Joi.any().required().valid('Male', 'Female').label('Gender'),
    birthDate: Joi.date().required().label('Birth Date is required'),
    birthPlace: Joi.string().required().min(2).label('Birth Place is required'),
    nationality: Joi.string().required().min(2).label('Nationality is required'),
    religion: Joi.any().required().valid('Muslim', 'Christian').label('Please Add Religion'),
    branch: Joi.any().required().valid('Qadsiya', 'Qusoor').label('Branch'),
    class: Joi.any().required().valid('Infants', 'Toddlers', 'Pre-k', 'Kindergarten').label('Class'),
    civilId: Joi.string().required().pattern(/^\d{12}$/).label('Civil ID should be 12 digits long'),
    guardian: Joi.object({
        name: Joi.string().required().label('Please add Guardian Name'),
        nationality: Joi.string().required().min(2).label('Guardian Nationality is required'),
        phone: Joi.object({
            personal: Joi.string().required().pattern(/^\d{8}$/).label('Personal Phone should be 8 digits long'),
            work: Joi.string().pattern(/^\d{8}$|^0{1}$/).label('Work Phone should be 8 digits long')
        }).required(),
        job: Joi.string().required().label('Profession is required'),
        jobLocation: Joi.string().required().label('Job Location is required'),
    }).required(),
    mother: Joi.object({
        name: Joi.string().required().label('Please add Mother Name'),
        nationality: Joi.string().required().min(2).label('Mother Nationality is required'),
        phone: Joi.object({
            personal: Joi.string().required().pattern(/^\d{8}$/).label('Mother Personal Phone should be 8 digits long'),
            work: Joi.string().pattern(/^\d{8}$|^0{1}$/).label('Mother Work Phone should be 8 digits long')
        }).required(),
        job: Joi.string().required().label('Mother Profession is required'),
        jobLocation: Joi.string().required().label('Mother Job Location is required'),
    }).required(),
    fees: Joi.object({
        full: Joi.number().min(0),
        paid: Joi.number().min(0),
        due: Joi.number().min(0)
    })
})

const validUpdate = Joi.object({
    firstName: Joi.string(),
    middleName: Joi.string(),
    lastName: Joi.string(),
    civilId: Joi.string().length(12).pattern(/^\d{12}$/).required(),
    email: Joi.string().email(),
    phoneNumber: Joi.string().length(8).pattern(/^\d{8}$/),
    fees: Joi.number().min(0)
})
const validPassword = Joi.object({
    password: Joi.string().min(8).max(1024).required().label('Password must be 8 characters long!'),
    passwordVerify: Joi.string().min(8).max(1024).required().valid(Joi.ref('password')).label('Passwords don\'t match'),
})

async function validate(validation, user) {
    const result = await validation.validate(user);
    return result;
}


module.exports.validate = validate;
module.exports.validUser = validUser;
module.exports.validLoginUser = validLoginUser;
module.exports.validAdmin = validAdmin;
module.exports.validRegister = validRegister;
module.exports.validLoginAdmin = validLoginAdmin;
module.exports.validUpdate = validUpdate;
module.exports.validPassword = validPassword;