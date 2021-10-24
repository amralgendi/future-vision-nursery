const compression = require('compression');
const express = require('express');
const app = express();
const mongoose = require('mongoose');
const Admin = require('./models/admin.js');
const users = require('./routes/users');
const admin = require('./routes/admin');
const config = require('config');
const payments = require('./routes/payments')
const Payment = require('./models/payments')
const User = require('./models/user');


try {
    mongoose.connect(`mongodb+srv://${config.get('dbuser')}:${config.get('dbpassword')}@cluster0.mn6f7.mongodb.net/futureVisionNursery?retryWrites=true&w=majority`)
        .then(console.log('Connected'));
}
catch (ex) {
    console.log(ex, __dirname);
}


// app.set('view engine', 'ejs');

app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('./fees-public'));

app.use('/api/users', users);
app.use('/api/payments', payments)
app.use('/api/admin', admin);

app.get('/', (req, res)=> {
    res.render('main');
})

app.get('/admin', (req, res)=> {
    res.render('admin');
})

app.get('/admin/register', (req, res)=> {
    res.render('admin-register');
})

app.get('/admin/login', (req, res)=> {
    res.render('admin-login', { message: ""});
})

app.listen(443);


