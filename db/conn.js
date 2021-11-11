const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/shoppu',{
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true
}).then(()=>{
    console.log('DB_Connection established...');
}).catch((e)=>{
    console.log('DB_Connection failed... error: ${e}');
})