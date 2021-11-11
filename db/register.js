const mongoose = require("mongoose");
//const Order = require("./order.js");


const user = new mongoose.Schema({
			
    username: {
        type: String,
        unique: true,
        required: true  
    },
    email: {
        type: String,
        unique: true,
        required: true  
    },
    password: {
        type: String,
        required: true  
    },
    admin: {
        type: Boolean,
        default: false  
    },
    shippingAddress: {
        type: String,
        default: "Japan" 
    },
    date:{
        type: Date,
        default: Date.now
    },

    Orders: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'shoppuOrder'
    }]
});


    const User = new mongoose.model("shoppuUser", user);


 async function create()
 {
         const customer = new User({username: 'Sufi', email: 'sufi@gmail.com', password: 'abc'});
               
         customer.save();
  }

        //create();


        module.exports = User;