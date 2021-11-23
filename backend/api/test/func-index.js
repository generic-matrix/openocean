const expect = require('chai').expect;
const Util = require("../util/index.js");

/*
1) The database must be empty as we are asuming the to contain specific count of data while testing
*/
describe("Function Testing", () => {
  let util;
  let userDetails;
  let token_id = Math.floor(Math.random() * 100);
  let email = (Math.random() + 1).toString(36).substring(7)+"@gmail.com";
  before(async() => {
    util = await new Util();
  });
  after(async()  => { 
    await util.CloseConnection();
  });

  it("user with email "+email+" exists must be false", async() => {
    const user = await util.CheckIfUserExists(email);
    expect(user.length).to.equal(0);
  });

  it("Add the user with  "+email, async() => {
    const data = await util.AddUser(email,(Math.random() + 1).toString(36).substring(7),"0x0"+(Math.random() + 1).toString(36).substring(10));
    expect(JSON.stringify(data)).to.equal(JSON.stringify(util.Json(null)));
  });

  it("User with "+email+" now exists ", async() => {
    const user = await util.CheckIfUserExists(email);
    this.userDetails = user[0];
    expect(user.length).to.equal(1);
  });

  it("Add a token to DB", async() => {
    
    const status = await util.AddToken(token_id,"test token","random-image-encrypted-string",11,"this token is random token",email,this.userDetails);
    expect(JSON.stringify(status)).to.equal(JSON.stringify(util.Json(null)));
  });

  it("Get tokens by valid email must return an array with 1 element", async() => {
    const data = await util.GetTokensByEmail(email);
    expect(data.length).to.equal(1);
    expect(data[0].token_id).to.equal(token_id);
  });

  it("Get tokens by some random email must raturn an empty array", async() => {
    const data = await util.GetTokensByEmail(email+"test");
    expect(data.length).to.equal(0);
  });

  it("Get token details by id which really exists", async() => {
    const data = await util.GetTokenDataById(token_id);
    expect(data.length).to.equal(1);
    expect(data[0].token_id).to.equal(token_id);
    expect(data[0].current_owner_email).to.equal(email);
  });

  it("Get token details by id which doesnot exists must return an empty array", async() => {
    const data = await util.GetTokenDataById("random-"+token_id);
    expect(data.length).to.equal(0);
  });

  it("Get tokens data for dashbaord - we expect the endpoint to return 10 data for page = 0", async() => {
    console.log("Adding 15 tokens");
    for(var i=0;i<15;i++){
      await util.AddToken(i,"test token"+i,"random-image-encrypted-string"+i,11,"this token is random token"+i,email,this.userDetails);
    }
    console.log("Added 15 tokens");
    let data = await util.GetTokensForDashboard(0);
    expect(data.count).to.equal(16);
    expect(data.tokens.length).to.equal(10);
    
  });

  it("Get tokens data for dashbaord - we expect the endpoint to return 7 data for page = 1", async() => {
    let data = await util.GetTokensForDashboard(1);
    expect(data.count).to.equal(16);
    expect(data.tokens.length).to.equal(6);
    
  });
  
});



/*describe("Checking util functionality ", () => {
  let util;
  let token_data;
  before(async() => {
    util = await new Util();
    try{
        token_data = await TestUtil.AddSampleTokenDataToDB();
    }catch(e){
        console.log(e);
    }
  });

  it("Check GetTokens from page 0 to 10 ", async() => {
    expect(JSON.stringify(await util.GetTokens(0))).to.equal(JSON.stringify(token_data.data.slice(0,10)));
  });
  it("Check GetTokens from page 11 to 20 ", async() => {
    expect(JSON.stringify(await util.GetTokens(1))).to.equal(JSON.stringify(token_data.data.slice(10,20)));
  });
});*/