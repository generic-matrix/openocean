const Util = require("./util/index.js");
const express = require('express')
const fs = require("fs");
const e = require("express");
const { userInfo } = require("os");
const result = require('dotenv').config();


const app = express()
app.use(express.json())

new Util().then(async(util)=>{

    console.log("DB successfully connected and web3 has been connected to the expected network");
    app.get('/', (req, res) => {
        fs.readFile('/Users/cp/Desktop/index.html', 'utf8', (err, text) => {
            res.send(text);
        });
    });

    app.post('/add-user', async(req, res) => {
        try{
        let token = req.body.token;
        let address = req.body.address;
        if(token === undefined || address === undefined){
            res.status(400).send(util.Json("Parameters missing"))
        }else{
            const payload =await util.VerifyAuthToken(token);
            let email = payload.email;
            let name = payload.given_name+" "+payload.family_name;
            await util.AddUser(email,name,address);
            res.status(200).send(util.Json(null));
        }
        }catch(e){
            console.log(e);
            res.status(500).send(util.Json("Internal Error or Token is not valid"));
        }
    });

    
    app.post('/create-token', async(req, res) => {
        try{
            let auth_token = req.body.token;
            let name = req.body.name;
            let description = req.body.description; 
            let image_base64 = req.body.image;
            let royalities_percent = req.body.royalities_percent;
            if(auth_token === undefined || name === undefined || description === undefined || image_base64 === undefined || royalities_percent ===undefined){
                res.status(400).send(util.Json("Parameters missing"));
            }else{
                if(royalities_percent<0 || royalities_percent > 15){
                    res.status(400).send(util.Json("Royalities percentage must be betwen 0 and 15"));
                }else{
                    const payload =await util.VerifyAuthToken(auth_token);
                    let email = payload.email;
                    let User =await util.CheckIfUserExists(email);
                    if(User.length===0){
                        res.status(400).send(util.Json("User does not exists"));
                    }else{
                        // Get the base64 string of image and encrypt it
                        const encrypted_image = util.AES.encrypt(image_base64);
                        // Mint the token and get the token id
                        let token_id = Date.now()+Math.floor(Math.random() * 111) + 1
                        await util.token.methods.mintx(token_id,User[0].address).call({from:User.address});
                        // Set the royalities
                        await util.token.methods.saveRoyalties(token_id,User[0].address,royalities_percent*100).call({from:User.address});
                        //Add token data to db
                        await util.AddToken(token_id,name,encrypted_image,royalities_percent,description,email,User[0]);
                        res.status(200).send(util.Json(null));
                    }
                }
            }
        }catch(e){
            console.log(e);
            res.status(500).send(util.Json("Internal Error or Token is not valid"));
        }     
    });

    app.get('/mytokens', async(req, res) => {
        try{
            // check if the token is valid or not
            let auth_token = req.body.token;
            if(auth_token === undefined ){
                res.status(400).send(util.Json("Parameters missing"));
            }else{
                const payload =await util.VerifyAuthToken(auth_token);
                let email = payload.email;
                let User =await util.CheckIfUserExists(email);
                if(User.length===0){
                    res.status(400).send(util.Json("User does not exists"));
                }else{
                    // get tokenid and image data for each tokens search by email
                    let data = await util.GetTokensByEmail(email);
                    res.status(200).send(data);
                }
            }
        }catch(e){
            console.log(e);
            res.status(500).send(util.Json("Internal Error or Token is not valid"));
        }
    });


    app.get('/token-details/:id', async(req, res) => {
        try{
            // check if the token is valid or not
            let auth_token = req.body.token;
            let token_id = Number(req.params.id);
            if(auth_token === undefined || token_id===undefined){
                res.status(400).send(util.Json("Parameters missing"));
            }else{
                const payload =await util.VerifyAuthToken(auth_token);
                let email = payload.email;
                let User =await util.CheckIfUserExists(email);
                if(User.length===0){
                    res.status(400).send(util.Json("User does not exists"));
                }else{
                    // Return all token details search by id
                    let data = await util.GetTokenDataById(token_id);
                    res.status(200).send(data);
                }
            }
        }catch(e){
            console.log(e);
            res.status(500).send(util.Json("Internal Error or Token is not valid"));
        }
    });

    app.get('/dashboard/:page', async(req, res) => {
        try{
            // check if the token is valid or not
            let auth_token = req.body.token;
            let page = Number(req.params.page);
            if(auth_token === undefined || page === undefined){
                res.status(400).send(util.Json("Parameters missing"));
            }else{
                const payload =await util.VerifyAuthToken(auth_token);
                let email = payload.email;
                let User =await util.CheckIfUserExists(email);
                if(User.length===0){
                    res.status(400).send(util.Json("User does not exists"));
                }else{
                    // Return all token details search by id
                    let data = await util.GetTokensForDashboard(page);
                    res.status(200).send(data);
                }
            }
        }catch(e){
            console.log(e);
            res.status(500).send(util.Json("Internal Error or Token is not valid"));
        }
    });

    app.listen(result.parsed.PUBLIC_PORT,()=>{
        console.log("Application listing on port 3000");
    });

    app.get('/bid', async(req, res) => {
        try{
            let auth_token = req.body.token;
            let token_id = req.token.id;
            if(auth_token === undefined || token_id ===undefined){
                res.status(400).send(util.Json("Parameters missing"));
            }else{
                let data = await util.GetBids(token_id);
                res.status(200).send(data);
            }
        }catch(e){
            console.log(e);
            res.status(500).send(util.Json("Internal Error or Token is not valid"));
        }
    });

}).catch((error)=>{
    console.log("FATAL : "+error);
});
