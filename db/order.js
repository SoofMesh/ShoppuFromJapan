const mongoose = require("mongoose");

const User = require('./register.js');

const items = new mongoose.Schema({
    url: {
        type: String,
        required: true  
    },
    title: {
        type: String,
        required: true  
    },
    image: {
        type: String,
        required: true
    },
    shopName: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true  
    },    
    quantity: {
        type: Number,
        required: true  
    },
    totalPrice: {
        type: Number,
        required: true
    }
});

const order = new mongoose.Schema({
    items: [items],
    totalProductsPrice: {
        type: Number,
        required: true  
    },
    shippingAddress: {
        type: String,
        required: true 
    },
    email: {
        type: String,
        required: true 
    },
    contact: {
        type: String,
        required: true 
    },
    orderDate:{
        type: Date,
        default: Date.now
    },
    shippedDate:{
        type: Date
    },
    shippingFee: {
        type: Number
    },
    feeChargingShops: [],
    totalShopFee: {
        type: Number
    },
    packingFee: {
        type: Number
    },
    serviceCharges: {
        type: Number
    },
    grandTotal: {
        type: Number
    },
    trackNumber:{
            type: String, trim: true, index: {
                unique: true,
                partialFilterExpression: {trackNumber: {$type: "string"}}
            }
    },    
    customer: {                     
                    type: mongoose.Schema.Types.ObjectId,
                    required: true, 
                    ref: 'shoppuUser'
              }

});

    const Order = new mongoose.model("shoppuOrder", order);

    async function create()
     {
             await Order.remove({});
             const client = await User.findOne({username: 'Sufi'});
             const order = new Order({shippingAddress: 'Japan', customer: client});
             order.items.push({url: 'https://amazon.com', title: 'Sleeping Bags', price: 15000, quantity: 9});
             order.items.push({url: 'https://rakuten.com', title: 'Drone Camera', price: 35000, quantity: 5});
             order.items.push({url: 'https://mercary.com', title: 'Hiking Stick', price: 4500, quantity: 7});
             order.items.push({url: 'https://yahoo.com', title: 'Search Light', price: 12000, quantity: 3});    
             order.items.push({url: 'https://ebay.com', title: 'First Aid Box', price: 23000, quantity: 3});

                var tPrice = 0;
                order.items.forEach(item=>{
                    tPrice+= item.price * item.quantity;
                })

             order.totalPrice = tPrice;
            
                await order.save();    

             client.Orders.splice(0, client.Orders.length); // removing all items from this array
             client.Orders.push(order._id);

                await client.save(error=>{
                    if(error){
                        console.log(error);
                    }
                });
     }
            
                //create();   

      async function update()
      {
              const customer = await User.findOne({username: 'Haider'});
              customer.items.push({title: 'First Aid Box', price: 23000, quantity: 3});    
            
               customer.save();
      }
    
                //update();

         
                 // removing all items from this array
        module.exports = Order;