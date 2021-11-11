require('dotenv').config();

console.log("Hello  JApan ..");

const https = require('https');

const express = require('express');

const app = express();

app.set('view engine', 'ejs');

// const cors = require("cors");

const cookieParser = require('cookie-parser');

const path = require('path');

const fs = require('fs');

var bcrypt = require('bcryptjs');

const mongoose = require("mongoose");

const fetch = require('node-fetch');

const cheerio = require('cheerio');

const axios = require('axios');

const Moji = require('mojijs');

const encodingJP = require('encoding-japanese');

const puppet = require('puppeteer');

const jwt = require('jsonwebtoken');



const port = process.env.PORT || 3000;



require('./db/conn.js')

const User = require('./db/register.js');
const Order = require('./db/order.js');

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieParser());

app.use(async (req, res, next)=>{               
    console.log(`${req.method} request for ${req.url} `);
    next();
});

app.use(express.static(path.join(__dirname, './public')));

app.get("/orderRequest", (req, res)=>{

    res.render('order-request.ejs');
        //res.sendFile(path.join(__dirname, './public/order-request.html'));
        
})
app.get("/dashboard", (req, res)=>{

    res.render('dashboard.ejs');
        //res.sendFile(path.join(__dirname, './public/order-request.html'));
        
})
app.get("/orders", async (req, res)=>{
    
    
    res.render('orders.ejs', {
        user: await User.findOne({username: 'sufigul'}).populate("Orders")
    });
    
        //res.sendFile(path.join(__dirname, './public/order-request.html'));
        
})

/*------------------------------------Placing Order to Database starts------------------------------------*/

app.post("/orderRequest/place-Order", async (req, res)=>{

        var {productsInOrder, eachShopFee, shipAdd, email, contact, token} = req.body;
        try{

            let totalProductsPrice = null;
            let totalShopFee = null;       

            
            const customer = jwt.verify(token, process.env.JWT_SECRET);
            console.log("Decoded Customer: ",customer);            
            const user = await User.findOne({username: customer.username});

            console.log(`User_Id: ${user._id}`, `Username: ${user.username}`);

            if(user){
                const order = new Order({
                    shippingAddress: shipAdd,
                    contact,
                    email,
                    customer: user
                });
               
                productsInOrder.forEach(item=>{                           
                let uRL = new URL(decodeURIComponent(item.url));
                uRL = uRL.origin + uRL.pathname;

                order.items.push({
                url: uRL,                    //url
                title: item.productName,           //productName
                image: item.image,                  //image
                shopName: item.shopName,           //shopName
                price: item.unitPrice,             //unitPrice 
                quantity: item.quantity,           //quantity
                totalPrice: item.totalPrice         //totalPrice
                }) 
                totalProductsPrice += item.totalPrice;                                    
                })
                order.totalProductsPrice = totalProductsPrice;
                        
                for(const [key] of Object.entries(eachShopFee)){
                if(eachShopFee[key] < 5000){
                order.feeChargingShops.push(key);
                totalShopFee += 800;
                }      
                }
                order.totalShopFee = totalShopFee;
                order.packingFee = 1000;
                order.shippingFee = 3000;
                order.serviceCharges = (15/100) * totalProductsPrice;
                order.grandTotal = totalProductsPrice + totalShopFee + 1000 + 3000 + ((15/100) * totalProductsPrice);
                        
                    await order.save();
                //user.Orders.splice(0, user.Orders.length); // removing all items from this array                        
                user.Orders.push(order._id);
                        
                    await user.save();
            }
            
        }
        catch(error){
            console.log(error);
        }

/*-------------------------------------Placing Order ends-------------------------------------*/

        /*  
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
                    ref: 'shoppuUser'
              }

        
              */
})

app.post("/logInUser-api", async (req, res)=>{
            const {logInEmail, logInPassword} = req.body;

            const user = await User.findOne({email: logInEmail});
            if(await bcrypt.compare(logInPassword, user.password)){
                            const token = jwt.sign({
                                                        id: user.id,
                                                        username: user.username
                                              },process.env.JWT_SECRET);                                               
                        res.json({status: 'ok', JWT: token});
            }


});

app.post("/registerUser-api", async (req, res)=>{

        console.log(req.body);
    
            const {username, email, password: plainTextPassword, confirmPassword} = req.body;
            
           if(plainTextPassword === confirmPassword)
           {
                const password = await bcrypt.hash(plainTextPassword, 10);            

                        try{ 
                                await User.create({
                                    username,
                                    email,
                                    password
                                });       
                                res.json({status: 'ok'});             
                                //res.sendFile(path.join(__dirname, './public/signIn2.html')); 
                            }
                        catch(error){
                                        if(error.code ===11000){
                                                                    return res.json({
                                                                                        status: 'error',
                                                                                        error: 'User already exists'
                                                                                    })
                                                                } 
                                        throw error;     
                                    }  
           }
           else{
               console.log('Passwords not matching...')
           } 
});
 
// app.use(cors());
app.post("/scrapp-api", async (req, res)=>{

            // identifiers for holding Scrapped Data
        var image = null;
        var title = null;
        var price = null;
        var shopName = null;

        var myURL = new URL(decodeURIComponent(req.body.url));

        console.log(myURL);
        
            console.log(`URL Origin is: ${myURL.origin}`);
            shopName = myURL.origin.match(/(?<=https\:\/\/.*\.).+?(?=\.)/g);

            console.log(shopName[0]);

            console.log(`URL Path is: ${myURL.pathname}`);

        const targetURL = myURL.origin + myURL.pathname;

            console.log(`Required URL is: ${targetURL}`);
     


          
              /* const result =  await fetch(`${targetURL}`,{
                                        method: 'GET',
                                        headers: {
                                            'Content-Type': 'text/html'
                                        }
                                    })
                                    .then(res=>{
                                        return res.text();
                                    })
                                    .catch(error=>{
                                    console.log(error);
                                    });   */
                 
                
            if(shopName[0] === 'rakuten'){
                            /*await axios.request({
                                method: 'GET',
                                url: targetURL,
                                responseType: 'arraybuffer',
                                responseEncoding: 'binary'
                              })
                            .then(response=>{
                                    console.log("Content Type: ", response.headers["content-type"]);
                                    response = Moji.decode(response.data, 'UTF-8');
                                    return response;
                            })*/
                            await axios.get(targetURL)
                            .then(response=>{
                                response = encodingJP.convert(response.data, "utf-8", "EUC-JP");
                                fs.writeFileSync("test.txt", response);
                                return response;
                            })
                            .then(data=>{
                                        console.log("DEcoded Data: ", data);
                                        let $ = cheerio.load(data);
                                        if($){
                                                try{
                                                    console.log("inside RakuTen");                                               
                        
                                                    image = $('.rakutenLimitedId_ImageMain1-3').find('img').attr('src').trim();
                                                    title = $('.item_name').text().trim();                             
                                                    price = $('.price2').attr('content').trim();
                                                    
                                                // image = image[0].getAttributeValue('src');
                                                    //.attr('src').trim();
                                                                                            

                                                    res.json({
                                                        status: 'ok', 
                                                        image,
                                                        title,
                                                        price,
                                                        shopName: shopName[0]
                                                    }); 
                                                    
                                                            console.log(`Image: ${image}`);                
                                                    
                                                            console.log(`Title: ${title}`);
                                    
                                                            console.log(`Price: ${price}`);
                        
                                                }
                                                catch(error){
                                                    console.log(error);
                                                }                                  
                                        }
                                    })
            }            

                
            else if(shopName[0] === 'amazon'){

                var data = '';
                
                https.get(targetURL, response=>{                        

                      response.on('data', chunk=>{

                          data += chunk;

                      });
                      response.on('end', ()=>{
                          console.log("finished loading");
                          

                          const $ = cheerio.load(data);

                                  if($){
                                          try{
                                              console.log("inside Amazon");
                                              image = $('#img-canvas').children('img').attr('src').trim();

                                              if(!image){
                                                  image = $('#imgTagWrapperId').children('img').attr('src').trim();
                                              }

                                              title = $('#productTitle').text().trim();  
                                              
                                              price = $('.slot-price').children('span').text().trim();
                                              if(!price){
                                                  price = $('#price_inside_buybox').text().trim();
                                              }
                                              else if(!price){
                                                  price = $('#price').text().trim();
                                              }      

                                              console.log(`Ist Price: ${price}`);
                                                  price = price.replace('¥', '');  
                                                  price = price.replace(',', '');   
                                                  
                                                  
                                                  res.json({
                                                      status: 'ok', 
                                                      image,
                                                      title,
                                                      price,
                                                      shopName: shopName[0]
                                                  });
                                                  
                                                           console.log(`Image: ${image}`);                
                                                  
                                                           console.log(`Title: ${title}`);
                                  
                                                           console.log(`Price: ${price}`);

                                          }
                                          catch(error){
                                                  console.log(error);
                                          }
                                        
                                       
                                  }

                      })
                })
                .on('error', (error)=>{
                      console.log(error);
                }); 
                
            }    
            else{
                res.json({
                    status: 'ok', 
                    image,
                    title,
                    price,
                    shopName: shopName[0]
                });
            }
});
 

app.listen(port, ()=>{
    console.log(`server started at port ${port}`);
});

