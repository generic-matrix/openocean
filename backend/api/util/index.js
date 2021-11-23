const {OAuth2Client} = require('google-auth-library');
const { MongoClient } = require("mongodb");
const result = require('dotenv').config();
const Web3 = require('web3');
const truffleConfig = require("../../truffle-config.js");
const OpenOceanToken = require("../../build/contracts/OpenOceanToken.json");
const Cryptr = require('cryptr');
const cryptr = new Cryptr(result.parsed.SECRECT_PASSPHASE);


class Util{

    constructor(){
        return new Promise((resolve, reject) => {
            MongoClient.connect(result.parsed.MONGODB_URL).then(async(client) => {
                this.db = client.db(result.parsed.DB_NAME);
                this.client = client;
                //wait for db to init and add two indices with the collections
                await this.db.collection((result.parsed.TOKEN_COLLECTION)).createIndex( { token_id: 1}, { unique: true } );
                await this.db.collection((result.parsed.USERS_COLLECTION)).createIndex( { email: 1}, { unique: true } );
                const web3 = new Web3(new Web3.providers.HttpProvider("http://"+truffleConfig.networks.ganache.host+":"+truffleConfig.networks.ganache.port ));
                const networkId = await web3.eth.net.getId();
                this.token = new web3.eth.Contract(OpenOceanToken.abi,OpenOceanToken.networks[networkId] && OpenOceanToken.networks[networkId].address,);
                this.AES = cryptr;        
                resolve(this);
            }).catch((error)=>{
                reject(error);
            });
        });
    }

    Json(error){
        return {
            "error":error
        };
    }

    async CloseConnection(){
        await this.client.close();
    }

    CheckIfUserExists(email){
        return new Promise(async(resolve, reject) => {
            try{
                const cursor = await this.db.collection(result.parsed.USERS_COLLECTION).find({"email":email});
                let data =[];
                await cursor.forEach(doc => {data.push(doc)});
                resolve(data);
            }catch(e){
                reject(e);
            }
        });
    }


    AddUser(email,name,crypto_address){
        return new Promise(async(resolve, reject) => {
            try{
                const User = await this.CheckIfUserExists(email);
                if(User.length===0){
                    await this.db.collection(result.parsed.USERS_COLLECTION).insertOne({
                        "email":email,
                        "name":name,
                        "address":crypto_address,
                        "tokens":[]
                    });
                    resolve(this.Json(null));
                }else{
                    reject(this.Json("User Already exists"));
                }
            }catch(e){
                reject(this.Json(e));
            }
        });
    }
    
    
    AddToken(token_id,name,image,royalities_percent,description,current_owner_email,user){
        return new Promise(async(resolve, reject) => {
            try{
                await this.db.collection(result.parsed.TOKEN_COLLECTION).insertOne({
                    "token_id":token_id,
                    "name":name,
                    "image":image,
                    "royalities_percent":royalities_percent,
                    "description":description,
                    "current_owner_email":current_owner_email
                });
                // In the user object update add tokens 
                let tokens =user.tokens;
                tokens.push(token_id);
                await  this.db.collection(result.parsed.USERS_COLLECTION).updateOne({ _id : user._id },{$set: {"tokens": tokens},});
                resolve(this.Json(null));
                
            }catch(e){
                reject(this.Json(e));
            }
        });
    }

    VerifyAuthToken(token){
        return new Promise((resolve, reject) => {
            const client = new OAuth2Client(result.parsed.CLIENT_ID);
                async function verify() {
                const ticket = await client.verifyIdToken({
                    idToken: token,
                    audience: result.parsed.CLIENT_ID,
                });
                const payload = ticket.getPayload();
                resolve(payload);
            }
            verify().catch((error)=>{
                reject(error);
            });
        });
    }

     // get tokenid and image data for each tokens search by email
     GetTokensByEmail(email){
        return new Promise(async(resolve, reject) => {
            try{
                const cursor = await this.db.collection(result.parsed.TOKEN_COLLECTION).find({"current_owner_email":email});
                let data =[];
                await cursor.forEach(doc => {data.push({"token_id":doc.token_id,"name":doc.name,"image":doc.image})});
                resolve(data);
            }catch(e){
                reject(e);
            }
        });
     }

     // Return all token details search by id
    GetTokenDataById(token_id){
        return new Promise(async(resolve, reject) => {
            try{
                const cursor = await this.db.collection(result.parsed.TOKEN_COLLECTION).find({"token_id":token_id});
                let data =[];
                await cursor.forEach(doc => {data.push(doc)});
                resolve(data);
            }catch(e){
                reject(e);
            }
        });
    }

    GetTokensForDashboard(page){
        return new Promise(async(resolve, reject) => {
            try{
                const number_of_docs = await this.db.collection(result.parsed.TOKEN_COLLECTION).countDocuments({});
                const cursor = await this.db.collection(result.parsed.TOKEN_COLLECTION).find({},{limit:10, skip:page*10});
                let data =[];
                await cursor.forEach(doc => { delete doc["_id"] ; data.push(doc)});
                resolve({"count":number_of_docs,"tokens":data});
            }catch(e){
                reject(e);
            }
        });
    }

    ToJson(data){
        let json = [];
        for(var i=0;i<data['0'].length;i++){
          json.push({
            "bidId":Number(data['0'][i].toString()),
            "bidder_address":data['1'][i],
            "bid_amount":Number(data['2'][i].toString()),
            "royalitiy_amount":Number(data['3'][i].toString())
          });
        }
        return json;
    }

    GetBids(token_id){
        return new Promise(async(resolve, reject) => {
            try{
                let data = await this.token.methods.GetBids(token_id).call();
                resolve(ToJson(data));
            }catch(e){
                reject(e);
            }
        });
    }

    SelectBid(auth_token,token_id,bid_id){
        return new Promise(async(resolve, reject) => {
            // Get bids data from the db ...
            // Find user by addres and get his email id
            // set current_owner_email of the token to the new email id
            // Remove token_id from the prior user
            // add token_id to the new user
        });
    }
}

module.exports=Util;