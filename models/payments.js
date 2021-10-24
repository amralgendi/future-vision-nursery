const mongoose = require('mongoose');


const paymentRecordSchema = mongoose.Schema()

const paymentSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    payments: [{
        date: {
            type: Date,
            required: true
        },
        amount: {
            type: Number,
            required: true
        },
        type: {
            type: String,
            enum: ['Cash', 'K-Net']
        }
    }]
})


const Payment = mongoose.model('Payment', paymentSchema);



module.exports = Payment;