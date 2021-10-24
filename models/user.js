const mongoose = require('mongoose');
const countryList = require('../fees-public/countryList')

function capitalize(v){
    const arr1 = v.split(" ");
    for(let i = 0;i < arr1.length;i++){
        arr1[i] = arr1[i][0].toUpperCase() + arr1[i].substring(1).toLowerCase();
    }
    const checkOne = arr1.join(' ');

    const arr2 = checkOne.split('-');
    for(let i = 0;i < arr2.length;i++){
        arr2[i] = arr2[i][0].toUpperCase() + arr2[i].substring(1);
    }
    return arr2.join('-')
}

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        match: /^[A-Za-z]+\s{1}[A-Za-z]+\s{1}[A-Za-z]+$|^[A-Za-z]+\s{1}[A-Za-z]+\s{1}[AaEe]{1}[Ll]{1}-[A-Za-z]+$/ ,
        set: v => capitalize(v),
        get: v => capitalize(v),
    },
    gender: {
        type: String,
        required: true,
        enum: ['Male', 'Female']
    },
    birthDate: {
        type: Date,
        required: true
    },
    birthPlace: {
        type: String,
        required: true,
        enum: countryList
    },
    nationality: {
        type: String,
        required: true,
        enum: countryList
    },
    religion: {
        type: String,
        required: true,
        enum: ['Muslim', 'Christian']
    },
    civilId: {
        type: String,
        required: true
    },
    branch: {
        type: String,
        enum: ['Qadsiya', 'Qusoor'],
        required: true
    },
    class: {
        type: String,
        enum: ['Infants', 'Toddlers', 'Pre-k', 'Kindergarten'],
        required: true
    },
    guardian: {
        name: {
            type: String,
            required: true,
            set: v => capitalize(v),
            get: v => capitalize(v),
        },
        nationality: {
            type: String,
            required: true,
            enum: countryList
        },
        phone: {
            personal: {
                type: String, 
                required: true
            },
            work: {
                type: String
            }
        },
        job: {
            type: String, 
            required: true
        },
        jobLocation: {
            type: String,
            required: true
        }
    },
    mother: {
        name: {
            type: String,
            required: true,
            set: v => capitalize(v),
            get: v => capitalize(v),
        },
        nationality: {
            type: String,
            required: true,
            enum: countryList
        },
        phone: {
            personal: {
                type: String, 
                required: true
            },
            work: {
                type: String
            }
        },
        job: {
            type: String, 
            required: true
        },
        jobLocation: {
            type: String,
            required: true
        }
    },
    fees: {
        full: {
            type: Number, 
            default: 0
        },
        paid: {
            type: Number, 
            default: 0
        },
        due: {
            type: Number, 
            default: 0
        }
    },
    password: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

const User = mongoose.model('User', userSchema);

module.exports = User;