const expect = require('chai').expect;
let chai = require('chai');
let chaiHttp = require('chai-http');
const result = require('dotenv').config();

chai.use(chaiHttp);


/*
1) Make sure that the Google Token added is for a user which is not available in the DB
2) Make sure that the DB is empty and application will create it's own indices if not there
*/
describe("API testing",() => {

    let HOST = result.parsed.PUBLIC_ENDPOINT+":"+result.parsed.PUBLIC_PORT;
    let token_id;

    it("POST /add-user -> Quering with no paramas will return status code 400", async() => {
        let response = await chai.request(HOST).post("/add-user").send();
        expect(response.status).to.equal(400);
        expect(response.text).to.equal(JSON.stringify({"error":"Parameters missing"}));
    });

    it("POST /add-user -> Quering only with fake token will return status code 400", async() => {
        let response = await chai.request(HOST).post("/add-user").send({"token":"fake-token"});
        expect(response.status).to.equal(400);
        expect(response.text).to.equal(JSON.stringify({"error":"Parameters missing"}));
    });

    it("POST /add-user -> Quering with fake token and address will return status code 500", async() => {
        let response = await chai.request(HOST).post("/add-user").send({"token":"fake-token","address":result.parsed.TEST_ADDRESS});
        expect(response.status).to.equal(500);
        expect(response.text).to.equal(JSON.stringify({"error":"Internal Error or Token is not valid"}));
    });

    it("POST /add-user -> Quering with real token and expecting to add a new user with with 200 status code", async() => {
        let response = await chai.request(HOST).post("/add-user").send({"token":result.parsed.TEST_GOOGLE_TOKEN,"address":result.parsed.TEST_ADDRESS});
        expect(response.status).to.equal(200);
        expect(response.text).to.equal(JSON.stringify({"error":null}));
    });
    
    it("POST /add-user -> Quering with real token and reading a new user with with 500 status code as user already exists", async() => {
        let response = await chai.request(HOST).post("/add-user").send({"token":result.parsed.TEST_GOOGLE_TOKEN,"address":result.parsed.TEST_ADDRESS});
        expect(response.status).to.equal(500);
        expect(response.text).to.equal(JSON.stringify({"error":"Internal Error or Token is not valid"}));
    });
       
    it("POST /create-token with param missing ", async() => {
        let response = await chai.request(HOST).post("/create-token").send({"token":result.parsed.TEST_GOOGLE_TOKEN,"name":"My Test token","description":"random description","image":"iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAMAAACdt4HsAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAMAUExURUxpcdceB70dCcIeCccfCdIgCv8FAFwECv8cAAAAAP7//xIUG84dB5kDACASEcEdCjQPDeMiCQAWKYsaDEYUD4MWCQUSF58bC5kaC7oZBm0RCkgVEH4VCsYbBrMdCrAUBHgVCU8AAJcPBmUaEYJPQIEMB44XCdkkDHwMB+P09IQkGakbCq8cCswUA6MUA7seCqwZB1kaEcgcB7GJQ+/8+8PPzmIQCsAfCnpZVpQfEvX28/////SkKegxGe+KFOwsEvOmL+cuFfHy7/OiKPOnM+o5Iuk1HPOqOfOlLOs/KPOuROoqEPT08vkjCN4fB+xELfX08PTVo/GgJswhC/X39/XPlvIiCPO3XfOrPe5JM+xNOe2HEvSwSv+vLv+qJ/XKieUsFAAAAPUiB+0hB+c3H+ggB/SzT/OgIvW9ZvOdG/Q4H/PEfeUoD/GjK/T9//ExF/TIhObn4/ilKfupKumBE/OnN/TDdvr69/Pbt/79+8kiD90lDvrpzPS1VPc/JvT5+5JbN/biwvS/buigOKp+PZM3KggHCKMlFqUSBf8lCPVTPvStP7yOPY9ANPfw4bYQAPyjIhsWD/Pr246Pjv736I1pXO2ECr3FwbYcCeYXAe+RHdwyIKovJP62RfLkzeuLG6COiUZGRJ9vOaSko7u2sP7w1v/pw9jc2f7DZgECBgAABPbbssUQAa0iFtbj4bRDOvXNj+03HfWtMvnYp/xKMaAsIYllNtSdNu6bI7Suo7aIO1dXV7y8uZiYl83Rz3RcNlI6GPybG+l+DIQRB4l/fPcsEJYpG/1ZQftYQZxFOfW4a5NRSj4+Pf+8UtMXA//NdkUxFPTy6O66c5VuaeqOLLSdmKJ4cv+xOcREO5d0Pv9XPrQqHd6sWmtsazEoHe3Eh5h7Vf7PfvCuT+ErFptmFtyVKI1fGr1+IceGIf7WmZmDX3xCLN7cxolORcSROqyzs14vKGUXEIphXJ5xRu3nzddIPMcyJdNHPL84Lr2aWsCBImVGFeWyYqx0HP/XiczCnItVZDwAAADHdFJOUwD+/v7+/gICAQH+EvwEJ/wy/QurPXYb0MLPe0uM7OzGaJD1b/44l/5c/v7Z5fyl84Fe9f3+/f3c/en//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////v////////////////////////////////////////////////////////////4MkkDGAAAHkUlEQVRYw+2Xd1hT9xrHT0IGGYcAsmXVvVq7731yEkJOUCIZDUlIvIwYEiIz7A2ylxRkC1hAKyigyHWhuK2r7t1pp21v29vW3vbufd9zGIIg5fo89/7V75PnyXNy8n5+7/otBPlZ/1uxmKRYT2TMRBkPHxjof0lhoeQXx87eycnejkM+oMzZD06Mbef7jLsXl6JUUrhe7s842xN+MGc9uouzD1en0FmUFDqdorToFKbr7s52gJhFIDCKyyIvnUlJ41FtaBpQrg2Vx1WaTM8vsiNfzywUQZ29FGYu1YaeIJOJRpSQR7ehcs2K5z0dEfSn7O19dGYalZ4gEgnFYiFIDN9ikSxBQ9XoTMudEMZM9gxkCXcjvY0uExHGq8dEYMSiBE0bRUH3nSkRKOJcV1enEcnAHOxWkYqCDwEhEQNPV3k+nkDYn+tpuaBMEo5YrxnVKpJhTEqo/Gb7Cxc8H5cHFJnffmFwx85/L+DFRRHWr4yJZETF8b6p2W+IKLruMT2BiThp2r+7lb17d3DLngLS/FejIhkFew4FGtTDhjJe3tzpCEwGZ4Wi7sfmu3dvh3z926GDhHXoqAjGwaH3IiTDW9Pra+Zt9HaxZU5TgDkKTd2d/M2bz5TG/wsIoaHV1RcvXnzzzYvV1aGhBzvei1BvSU9Pf+PBWaViztRiQgB0B6ryTn6Yn9+Zu7c//aTj/erQP777a9C7fw6tfv8vhwj7ML+wN47uoVkoc6e0JANxU1Dz2n/M9wOd2aq/8Un5paLfl71QU3O0bHvRpUsL9kdvBXsAQA54ClcmY6oDShuR5UrjljCCkK6P+esHGzo733knArS/tKY0lbT3C6vfnptEdZjiApEBXp5YVJuSsRn+ll4ao7+2PihobWBGgL+/1ZpqSLUOh5GA1KI8EZ32aBZYCMfbQpUZk4Z6LxMAfWaMfsP68KBXAwMBIJVarVKBQL2FCK+0XGRMoJpXukxyAUXmKrkamTFuz/GvAXA5uWQEQHgQIPX3l0gEAolEsgVS8GAoySijURyem9QLKOJpggiEcbnbdm7dfHlvZuYEgD8MDwCQGlJQdi9OLFpMUyyaBIAa6Hgyo3DVZy2bSu8HJ8ePA4gQIAYBfMCF6LC0otf2CSEGkytiOzEFjissPJl4dVRc7bchwSHr4kv0G8YARBIEktjYaIIQW1obFyUUy6hmbw7CmlBEl5VKmsgojCq4d2QnAcg8cCAmfCwEqVUiXbc3EAhqQ01HQZTQKONZeHYTsshE7GgUjUi8etWa11qKAZCZj2E7xnMglUYfgGdwQA0RrIlaLRbRlBr7yQANRSMbByQn52AYlrx2LAeScHjE1kdL1YbtfwIPAECh20/nQVRBBxlCZn7zjuKYoKBX15IAQcCB/E35GdESSf3h8gLwQDbFAxeeMpcIYd93f9gNgE9v9OnDw0caiQhBEqu2GgwCtUQdAVUgATYTcwBV8Hagicg+2EEATp36oE9/P5z0IIDsxIi0f57+Kk2tNhztiIMq2FhWTqwClNTVDGUUxg215gPg44bIhkP3r42HAHPhy5v9uz43DEtSD5cnEX2gW86cCIC5pOMlGIUwmYqzwYPTkf27GsqujXgQ4J/2xemK/v6KL9Mghv1FnwmNMKEnzyYU8bXQFov25d1pJgG3TzX0R0Ye6gzwzwiQRKd+0bCrv+Lm38BeYo2A6Syjc3XzJ7UyUQbopCTathFA/I1/lJ26eTooPrurK/vjzs8/+vtvvkozgL3Eajh6L0lmo8y1n7wgEJOBmpDU1tNcvJts5Zi+vs6+RjZRfwxPro+ISJOoBVJopfoHlefzqLAk2T6yJzxn0dDPV7Y2d2UH700GgP5+PM4+/jqom50YMmxVCyTRsbHWgNTDF87ncs3zH1nZWbaOK8xt5ytfysHxTV3BmSUl+hIVjh2LBH2UpUqMj/WPjg1aV9zY2PhtubnN5M2xZU3Zlsy0vLZWDOdrC7WNe/X6rkIc+7C/oqLiag6uvbU2NiNYnlhYqGUPVkIKp25OLAbqauINbMNwOUirDUkulOPsHsKDJgxXJSYHbUqUq1RyHDtSRTMtd5y6wcK6zHWwKV/Kl5MEeaNWLsdzmhoqPiR+0TbeKlSRbwoX1Mmm2RbIIDzMi6vOjbhAIOR8Nh87eRzTZgFCS4L5ONZ91kE3/f7MgnY00c9+P0aQa1NOpuDd5/CUFPmYcOzkDxSFGzr9CYHFcHRT0H9ofUi4euzEsddPHLuaNW4/+LunN7pybJmPO6Bx3BSUl7/HVPjI34839Tad6z3RPYrEsV7C3uXxRzUm4jhHZ3m5KTGLtODzU/gpvfwUORk/rsJal7Wb3DgzHfXglQd3Y9UvBzH+SDnlWVlEOsEcx15smqegeDJnPipCJp18FO3LTiwFBP4weaocduuCAYX7XMT2pw6rDAT1/YVuoLZ7KTtHhZNSZbETX2qpavdydpzNYRc8dPR1v15Xvu3ki2xSiYNHrlQNuDtzZnHSHT/r2z/rM+9s7dtv9fS89faVZfN8nl0IQ6OsWV8XiMnOWbjE4ymQx5KF5I0BZT3xhQVWXfQJLj4sJjqqJ7w1/az/m/4Dvg7lpGWpzr0AAAAASUVORK5CYII="});
        expect(response.status).to.equal(400);
        expect(response.text).to.equal(JSON.stringify({error:"Parameters missing"}));
    });

    it("POST /create-token with invalid royalities value ", async() => {
        let response = await chai.request(HOST).post("/create-token").send({"token":result.parsed.TEST_GOOGLE_TOKEN,"name":"My Test token","description":"random description","royalities_percent":50,"image":"iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAMAAACdt4HsAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAMAUExURUxpcdceB70dCcIeCccfCdIgCv8FAFwECv8cAAAAAP7//xIUG84dB5kDACASEcEdCjQPDeMiCQAWKYsaDEYUD4MWCQUSF58bC5kaC7oZBm0RCkgVEH4VCsYbBrMdCrAUBHgVCU8AAJcPBmUaEYJPQIEMB44XCdkkDHwMB+P09IQkGakbCq8cCswUA6MUA7seCqwZB1kaEcgcB7GJQ+/8+8PPzmIQCsAfCnpZVpQfEvX28/////SkKegxGe+KFOwsEvOmL+cuFfHy7/OiKPOnM+o5Iuk1HPOqOfOlLOs/KPOuROoqEPT08vkjCN4fB+xELfX08PTVo/GgJswhC/X39/XPlvIiCPO3XfOrPe5JM+xNOe2HEvSwSv+vLv+qJ/XKieUsFAAAAPUiB+0hB+c3H+ggB/SzT/OgIvW9ZvOdG/Q4H/PEfeUoD/GjK/T9//ExF/TIhObn4/ilKfupKumBE/OnN/TDdvr69/Pbt/79+8kiD90lDvrpzPS1VPc/JvT5+5JbN/biwvS/buigOKp+PZM3KggHCKMlFqUSBf8lCPVTPvStP7yOPY9ANPfw4bYQAPyjIhsWD/Pr246Pjv736I1pXO2ECr3FwbYcCeYXAe+RHdwyIKovJP62RfLkzeuLG6COiUZGRJ9vOaSko7u2sP7w1v/pw9jc2f7DZgECBgAABPbbssUQAa0iFtbj4bRDOvXNj+03HfWtMvnYp/xKMaAsIYllNtSdNu6bI7Suo7aIO1dXV7y8uZiYl83Rz3RcNlI6GPybG+l+DIQRB4l/fPcsEJYpG/1ZQftYQZxFOfW4a5NRSj4+Pf+8UtMXA//NdkUxFPTy6O66c5VuaeqOLLSdmKJ4cv+xOcREO5d0Pv9XPrQqHd6sWmtsazEoHe3Eh5h7Vf7PfvCuT+ErFptmFtyVKI1fGr1+IceGIf7WmZmDX3xCLN7cxolORcSROqyzs14vKGUXEIphXJ5xRu3nzddIPMcyJdNHPL84Lr2aWsCBImVGFeWyYqx0HP/XiczCnItVZDwAAADHdFJOUwD+/v7+/gICAQH+EvwEJ/wy/QurPXYb0MLPe0uM7OzGaJD1b/44l/5c/v7Z5fyl84Fe9f3+/f3c/en//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////v////////////////////////////////////////////////////////////4MkkDGAAAHkUlEQVRYw+2Xd1hT9xrHT0IGGYcAsmXVvVq7731yEkJOUCIZDUlIvIwYEiIz7A2ylxRkC1hAKyigyHWhuK2r7t1pp21v29vW3vbufd9zGIIg5fo89/7V75PnyXNy8n5+7/otBPlZ/1uxmKRYT2TMRBkPHxjof0lhoeQXx87eycnejkM+oMzZD06Mbef7jLsXl6JUUrhe7s842xN+MGc9uouzD1en0FmUFDqdorToFKbr7s52gJhFIDCKyyIvnUlJ41FtaBpQrg2Vx1WaTM8vsiNfzywUQZ29FGYu1YaeIJOJRpSQR7ehcs2K5z0dEfSn7O19dGYalZ4gEgnFYiFIDN9ikSxBQ9XoTMudEMZM9gxkCXcjvY0uExHGq8dEYMSiBE0bRUH3nSkRKOJcV1enEcnAHOxWkYqCDwEhEQNPV3k+nkDYn+tpuaBMEo5YrxnVKpJhTEqo/Gb7Cxc8H5cHFJnffmFwx85/L+DFRRHWr4yJZETF8b6p2W+IKLruMT2BiThp2r+7lb17d3DLngLS/FejIhkFew4FGtTDhjJe3tzpCEwGZ4Wi7sfmu3dvh3z926GDhHXoqAjGwaH3IiTDW9Pra+Zt9HaxZU5TgDkKTd2d/M2bz5TG/wsIoaHV1RcvXnzzzYvV1aGhBzvei1BvSU9Pf+PBWaViztRiQgB0B6ryTn6Yn9+Zu7c//aTj/erQP777a9C7fw6tfv8vhwj7ML+wN47uoVkoc6e0JANxU1Dz2n/M9wOd2aq/8Un5paLfl71QU3O0bHvRpUsL9kdvBXsAQA54ClcmY6oDShuR5UrjljCCkK6P+esHGzo733knArS/tKY0lbT3C6vfnptEdZjiApEBXp5YVJuSsRn+ll4ao7+2PihobWBGgL+/1ZpqSLUOh5GA1KI8EZ32aBZYCMfbQpUZk4Z6LxMAfWaMfsP68KBXAwMBIJVarVKBQL2FCK+0XGRMoJpXukxyAUXmKrkamTFuz/GvAXA5uWQEQHgQIPX3l0gEAolEsgVS8GAoySijURyem9QLKOJpggiEcbnbdm7dfHlvZuYEgD8MDwCQGlJQdi9OLFpMUyyaBIAa6Hgyo3DVZy2bSu8HJ8ePA4gQIAYBfMCF6LC0otf2CSEGkytiOzEFjissPJl4dVRc7bchwSHr4kv0G8YARBIEktjYaIIQW1obFyUUy6hmbw7CmlBEl5VKmsgojCq4d2QnAcg8cCAmfCwEqVUiXbc3EAhqQ01HQZTQKONZeHYTsshE7GgUjUi8etWa11qKAZCZj2E7xnMglUYfgGdwQA0RrIlaLRbRlBr7yQANRSMbByQn52AYlrx2LAeScHjE1kdL1YbtfwIPAECh20/nQVRBBxlCZn7zjuKYoKBX15IAQcCB/E35GdESSf3h8gLwQDbFAxeeMpcIYd93f9gNgE9v9OnDw0caiQhBEqu2GgwCtUQdAVUgATYTcwBV8Hagicg+2EEATp36oE9/P5z0IIDsxIi0f57+Kk2tNhztiIMq2FhWTqwClNTVDGUUxg215gPg44bIhkP3r42HAHPhy5v9uz43DEtSD5cnEX2gW86cCIC5pOMlGIUwmYqzwYPTkf27GsqujXgQ4J/2xemK/v6KL9Mghv1FnwmNMKEnzyYU8bXQFov25d1pJgG3TzX0R0Ye6gzwzwiQRKd+0bCrv+Lm38BeYo2A6Syjc3XzJ7UyUQbopCTathFA/I1/lJ26eTooPrurK/vjzs8/+vtvvkozgL3Eajh6L0lmo8y1n7wgEJOBmpDU1tNcvJts5Zi+vs6+RjZRfwxPro+ISJOoBVJopfoHlefzqLAk2T6yJzxn0dDPV7Y2d2UH700GgP5+PM4+/jqom50YMmxVCyTRsbHWgNTDF87ncs3zH1nZWbaOK8xt5ytfysHxTV3BmSUl+hIVjh2LBH2UpUqMj/WPjg1aV9zY2PhtubnN5M2xZU3Zlsy0vLZWDOdrC7WNe/X6rkIc+7C/oqLiag6uvbU2NiNYnlhYqGUPVkIKp25OLAbqauINbMNwOUirDUkulOPsHsKDJgxXJSYHbUqUq1RyHDtSRTMtd5y6wcK6zHWwKV/Kl5MEeaNWLsdzmhoqPiR+0TbeKlSRbwoX1Mmm2RbIIDzMi6vOjbhAIOR8Nh87eRzTZgFCS4L5ONZ91kE3/f7MgnY00c9+P0aQa1NOpuDd5/CUFPmYcOzkDxSFGzr9CYHFcHRT0H9ofUi4euzEsddPHLuaNW4/+LunN7pybJmPO6Bx3BSUl7/HVPjI34839Tad6z3RPYrEsV7C3uXxRzUm4jhHZ3m5KTGLtODzU/gpvfwUORk/rsJal7Wb3DgzHfXglQd3Y9UvBzH+SDnlWVlEOsEcx15smqegeDJnPipCJp18FO3LTiwFBP4weaocduuCAYX7XMT2pw6rDAT1/YVuoLZ7KTtHhZNSZbETX2qpavdydpzNYRc8dPR1v15Xvu3ki2xSiYNHrlQNuDtzZnHSHT/r2z/rM+9s7dtv9fS89faVZfN8nl0IQ6OsWV8XiMnOWbjE4ymQx5KF5I0BZT3xhQVWXfQJLj4sJjqqJ7w1/az/m/4Dvg7lpGWpzr0AAAAASUVORK5CYII="});
        expect(response.status).to.equal(400);
        expect(response.text).to.equal(JSON.stringify({error:"Royalities percentage must be betwen 0 and 15"}));
    });
    
    it("POST /create-token ", async() => {
        let response = await chai.request(HOST).post("/create-token").send({"token":result.parsed.TEST_GOOGLE_TOKEN,"name":"My Test token","description":"random description","royalities_percent":11,"image":"iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAMAAACdt4HsAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAMAUExURUxpcdceB70dCcIeCccfCdIgCv8FAFwECv8cAAAAAP7//xIUG84dB5kDACASEcEdCjQPDeMiCQAWKYsaDEYUD4MWCQUSF58bC5kaC7oZBm0RCkgVEH4VCsYbBrMdCrAUBHgVCU8AAJcPBmUaEYJPQIEMB44XCdkkDHwMB+P09IQkGakbCq8cCswUA6MUA7seCqwZB1kaEcgcB7GJQ+/8+8PPzmIQCsAfCnpZVpQfEvX28/////SkKegxGe+KFOwsEvOmL+cuFfHy7/OiKPOnM+o5Iuk1HPOqOfOlLOs/KPOuROoqEPT08vkjCN4fB+xELfX08PTVo/GgJswhC/X39/XPlvIiCPO3XfOrPe5JM+xNOe2HEvSwSv+vLv+qJ/XKieUsFAAAAPUiB+0hB+c3H+ggB/SzT/OgIvW9ZvOdG/Q4H/PEfeUoD/GjK/T9//ExF/TIhObn4/ilKfupKumBE/OnN/TDdvr69/Pbt/79+8kiD90lDvrpzPS1VPc/JvT5+5JbN/biwvS/buigOKp+PZM3KggHCKMlFqUSBf8lCPVTPvStP7yOPY9ANPfw4bYQAPyjIhsWD/Pr246Pjv736I1pXO2ECr3FwbYcCeYXAe+RHdwyIKovJP62RfLkzeuLG6COiUZGRJ9vOaSko7u2sP7w1v/pw9jc2f7DZgECBgAABPbbssUQAa0iFtbj4bRDOvXNj+03HfWtMvnYp/xKMaAsIYllNtSdNu6bI7Suo7aIO1dXV7y8uZiYl83Rz3RcNlI6GPybG+l+DIQRB4l/fPcsEJYpG/1ZQftYQZxFOfW4a5NRSj4+Pf+8UtMXA//NdkUxFPTy6O66c5VuaeqOLLSdmKJ4cv+xOcREO5d0Pv9XPrQqHd6sWmtsazEoHe3Eh5h7Vf7PfvCuT+ErFptmFtyVKI1fGr1+IceGIf7WmZmDX3xCLN7cxolORcSROqyzs14vKGUXEIphXJ5xRu3nzddIPMcyJdNHPL84Lr2aWsCBImVGFeWyYqx0HP/XiczCnItVZDwAAADHdFJOUwD+/v7+/gICAQH+EvwEJ/wy/QurPXYb0MLPe0uM7OzGaJD1b/44l/5c/v7Z5fyl84Fe9f3+/f3c/en//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////v////////////////////////////////////////////////////////////4MkkDGAAAHkUlEQVRYw+2Xd1hT9xrHT0IGGYcAsmXVvVq7731yEkJOUCIZDUlIvIwYEiIz7A2ylxRkC1hAKyigyHWhuK2r7t1pp21v29vW3vbufd9zGIIg5fo89/7V75PnyXNy8n5+7/otBPlZ/1uxmKRYT2TMRBkPHxjof0lhoeQXx87eycnejkM+oMzZD06Mbef7jLsXl6JUUrhe7s842xN+MGc9uouzD1en0FmUFDqdorToFKbr7s52gJhFIDCKyyIvnUlJ41FtaBpQrg2Vx1WaTM8vsiNfzywUQZ29FGYu1YaeIJOJRpSQR7ehcs2K5z0dEfSn7O19dGYalZ4gEgnFYiFIDN9ikSxBQ9XoTMudEMZM9gxkCXcjvY0uExHGq8dEYMSiBE0bRUH3nSkRKOJcV1enEcnAHOxWkYqCDwEhEQNPV3k+nkDYn+tpuaBMEo5YrxnVKpJhTEqo/Gb7Cxc8H5cHFJnffmFwx85/L+DFRRHWr4yJZETF8b6p2W+IKLruMT2BiThp2r+7lb17d3DLngLS/FejIhkFew4FGtTDhjJe3tzpCEwGZ4Wi7sfmu3dvh3z926GDhHXoqAjGwaH3IiTDW9Pra+Zt9HaxZU5TgDkKTd2d/M2bz5TG/wsIoaHV1RcvXnzzzYvV1aGhBzvei1BvSU9Pf+PBWaViztRiQgB0B6ryTn6Yn9+Zu7c//aTj/erQP777a9C7fw6tfv8vhwj7ML+wN47uoVkoc6e0JANxU1Dz2n/M9wOd2aq/8Un5paLfl71QU3O0bHvRpUsL9kdvBXsAQA54ClcmY6oDShuR5UrjljCCkK6P+esHGzo733knArS/tKY0lbT3C6vfnptEdZjiApEBXp5YVJuSsRn+ll4ao7+2PihobWBGgL+/1ZpqSLUOh5GA1KI8EZ32aBZYCMfbQpUZk4Z6LxMAfWaMfsP68KBXAwMBIJVarVKBQL2FCK+0XGRMoJpXukxyAUXmKrkamTFuz/GvAXA5uWQEQHgQIPX3l0gEAolEsgVS8GAoySijURyem9QLKOJpggiEcbnbdm7dfHlvZuYEgD8MDwCQGlJQdi9OLFpMUyyaBIAa6Hgyo3DVZy2bSu8HJ8ePA4gQIAYBfMCF6LC0otf2CSEGkytiOzEFjissPJl4dVRc7bchwSHr4kv0G8YARBIEktjYaIIQW1obFyUUy6hmbw7CmlBEl5VKmsgojCq4d2QnAcg8cCAmfCwEqVUiXbc3EAhqQ01HQZTQKONZeHYTsshE7GgUjUi8etWa11qKAZCZj2E7xnMglUYfgGdwQA0RrIlaLRbRlBr7yQANRSMbByQn52AYlrx2LAeScHjE1kdL1YbtfwIPAECh20/nQVRBBxlCZn7zjuKYoKBX15IAQcCB/E35GdESSf3h8gLwQDbFAxeeMpcIYd93f9gNgE9v9OnDw0caiQhBEqu2GgwCtUQdAVUgATYTcwBV8Hagicg+2EEATp36oE9/P5z0IIDsxIi0f57+Kk2tNhztiIMq2FhWTqwClNTVDGUUxg215gPg44bIhkP3r42HAHPhy5v9uz43DEtSD5cnEX2gW86cCIC5pOMlGIUwmYqzwYPTkf27GsqujXgQ4J/2xemK/v6KL9Mghv1FnwmNMKEnzyYU8bXQFov25d1pJgG3TzX0R0Ye6gzwzwiQRKd+0bCrv+Lm38BeYo2A6Syjc3XzJ7UyUQbopCTathFA/I1/lJ26eTooPrurK/vjzs8/+vtvvkozgL3Eajh6L0lmo8y1n7wgEJOBmpDU1tNcvJts5Zi+vs6+RjZRfwxPro+ISJOoBVJopfoHlefzqLAk2T6yJzxn0dDPV7Y2d2UH700GgP5+PM4+/jqom50YMmxVCyTRsbHWgNTDF87ncs3zH1nZWbaOK8xt5ytfysHxTV3BmSUl+hIVjh2LBH2UpUqMj/WPjg1aV9zY2PhtubnN5M2xZU3Zlsy0vLZWDOdrC7WNe/X6rkIc+7C/oqLiag6uvbU2NiNYnlhYqGUPVkIKp25OLAbqauINbMNwOUirDUkulOPsHsKDJgxXJSYHbUqUq1RyHDtSRTMtd5y6wcK6zHWwKV/Kl5MEeaNWLsdzmhoqPiR+0TbeKlSRbwoX1Mmm2RbIIDzMi6vOjbhAIOR8Nh87eRzTZgFCS4L5ONZ91kE3/f7MgnY00c9+P0aQa1NOpuDd5/CUFPmYcOzkDxSFGzr9CYHFcHRT0H9ofUi4euzEsddPHLuaNW4/+LunN7pybJmPO6Bx3BSUl7/HVPjI34839Tad6z3RPYrEsV7C3uXxRzUm4jhHZ3m5KTGLtODzU/gpvfwUORk/rsJal7Wb3DgzHfXglQd3Y9UvBzH+SDnlWVlEOsEcx15smqegeDJnPipCJp18FO3LTiwFBP4weaocduuCAYX7XMT2pw6rDAT1/YVuoLZ7KTtHhZNSZbETX2qpavdydpzNYRc8dPR1v15Xvu3ki2xSiYNHrlQNuDtzZnHSHT/r2z/rM+9s7dtv9fS89faVZfN8nl0IQ6OsWV8XiMnOWbjE4ymQx5KF5I0BZT3xhQVWXfQJLj4sJjqqJ7w1/az/m/4Dvg7lpGWpzr0AAAAASUVORK5CYII="});
        expect(response.status).to.equal(200);
        expect(response.text).to.equal(JSON.stringify({error:null}));
    });

    it("GET /mytokens with valid data", async() => {
        let response = await chai.request(HOST).get("/mytokens").send({"token":result.parsed.TEST_GOOGLE_TOKEN});
        expect(response.status).to.equal(200);
        let data = JSON.parse(response.text);
        expect(data.length).to.equal(1);
        token_id = data[0].token_id;
        expect(data[0].name).to.equal("My Test token");
    });

    it("GET /token-details by token_id", async() => {
        let response = await chai.request(HOST).get("/token-details/"+token_id).send({"token":result.parsed.TEST_GOOGLE_TOKEN});
        expect(response.status).to.equal(200);
        let data = JSON.parse(response.text);
        expect(data.length).to.equal(1);
        expect(data[0].name).to.equal("My Test token");
        expect(data[0].token_id).to.equal(token_id);
    });

    it("GET /dashboard with page 0 without adding any new tokens must return 1", async() => {
        let response = await chai.request(HOST).get("/dashboard/"+0).send({"token":result.parsed.TEST_GOOGLE_TOKEN});
        expect(response.status).to.equal(200);
        let data = JSON.parse(response.text);
        expect(data.count).to.equal(1);
        expect(data.tokens.length).to.equal(1);
    });

    it("GET /dashboard with page 0 after adding 15 tokens and expecting to return 10 tokens and total token count as 16", async() => {
        console.log("Adding 15 tokens");
        for(var i=0;i<15;i++){
            await chai.request(HOST).post("/create-token").send({"token":result.parsed.TEST_GOOGLE_TOKEN,"name":"My Test token","description":"random description","royalities_percent":11,"image":"iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAMAAACdt4HsAAAABGdBTUEAALGPC/xhBQAAAAFzUkdCAK7OHOkAAAMAUExURUxpcdceB70dCcIeCccfCdIgCv8FAFwECv8cAAAAAP7//xIUG84dB5kDACASEcEdCjQPDeMiCQAWKYsaDEYUD4MWCQUSF58bC5kaC7oZBm0RCkgVEH4VCsYbBrMdCrAUBHgVCU8AAJcPBmUaEYJPQIEMB44XCdkkDHwMB+P09IQkGakbCq8cCswUA6MUA7seCqwZB1kaEcgcB7GJQ+/8+8PPzmIQCsAfCnpZVpQfEvX28/////SkKegxGe+KFOwsEvOmL+cuFfHy7/OiKPOnM+o5Iuk1HPOqOfOlLOs/KPOuROoqEPT08vkjCN4fB+xELfX08PTVo/GgJswhC/X39/XPlvIiCPO3XfOrPe5JM+xNOe2HEvSwSv+vLv+qJ/XKieUsFAAAAPUiB+0hB+c3H+ggB/SzT/OgIvW9ZvOdG/Q4H/PEfeUoD/GjK/T9//ExF/TIhObn4/ilKfupKumBE/OnN/TDdvr69/Pbt/79+8kiD90lDvrpzPS1VPc/JvT5+5JbN/biwvS/buigOKp+PZM3KggHCKMlFqUSBf8lCPVTPvStP7yOPY9ANPfw4bYQAPyjIhsWD/Pr246Pjv736I1pXO2ECr3FwbYcCeYXAe+RHdwyIKovJP62RfLkzeuLG6COiUZGRJ9vOaSko7u2sP7w1v/pw9jc2f7DZgECBgAABPbbssUQAa0iFtbj4bRDOvXNj+03HfWtMvnYp/xKMaAsIYllNtSdNu6bI7Suo7aIO1dXV7y8uZiYl83Rz3RcNlI6GPybG+l+DIQRB4l/fPcsEJYpG/1ZQftYQZxFOfW4a5NRSj4+Pf+8UtMXA//NdkUxFPTy6O66c5VuaeqOLLSdmKJ4cv+xOcREO5d0Pv9XPrQqHd6sWmtsazEoHe3Eh5h7Vf7PfvCuT+ErFptmFtyVKI1fGr1+IceGIf7WmZmDX3xCLN7cxolORcSROqyzs14vKGUXEIphXJ5xRu3nzddIPMcyJdNHPL84Lr2aWsCBImVGFeWyYqx0HP/XiczCnItVZDwAAADHdFJOUwD+/v7+/gICAQH+EvwEJ/wy/QurPXYb0MLPe0uM7OzGaJD1b/44l/5c/v7Z5fyl84Fe9f3+/f3c/en//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////v////////////////////////////////////////////////////////////4MkkDGAAAHkUlEQVRYw+2Xd1hT9xrHT0IGGYcAsmXVvVq7731yEkJOUCIZDUlIvIwYEiIz7A2ylxRkC1hAKyigyHWhuK2r7t1pp21v29vW3vbufd9zGIIg5fo89/7V75PnyXNy8n5+7/otBPlZ/1uxmKRYT2TMRBkPHxjof0lhoeQXx87eycnejkM+oMzZD06Mbef7jLsXl6JUUrhe7s842xN+MGc9uouzD1en0FmUFDqdorToFKbr7s52gJhFIDCKyyIvnUlJ41FtaBpQrg2Vx1WaTM8vsiNfzywUQZ29FGYu1YaeIJOJRpSQR7ehcs2K5z0dEfSn7O19dGYalZ4gEgnFYiFIDN9ikSxBQ9XoTMudEMZM9gxkCXcjvY0uExHGq8dEYMSiBE0bRUH3nSkRKOJcV1enEcnAHOxWkYqCDwEhEQNPV3k+nkDYn+tpuaBMEo5YrxnVKpJhTEqo/Gb7Cxc8H5cHFJnffmFwx85/L+DFRRHWr4yJZETF8b6p2W+IKLruMT2BiThp2r+7lb17d3DLngLS/FejIhkFew4FGtTDhjJe3tzpCEwGZ4Wi7sfmu3dvh3z926GDhHXoqAjGwaH3IiTDW9Pra+Zt9HaxZU5TgDkKTd2d/M2bz5TG/wsIoaHV1RcvXnzzzYvV1aGhBzvei1BvSU9Pf+PBWaViztRiQgB0B6ryTn6Yn9+Zu7c//aTj/erQP777a9C7fw6tfv8vhwj7ML+wN47uoVkoc6e0JANxU1Dz2n/M9wOd2aq/8Un5paLfl71QU3O0bHvRpUsL9kdvBXsAQA54ClcmY6oDShuR5UrjljCCkK6P+esHGzo733knArS/tKY0lbT3C6vfnptEdZjiApEBXp5YVJuSsRn+ll4ao7+2PihobWBGgL+/1ZpqSLUOh5GA1KI8EZ32aBZYCMfbQpUZk4Z6LxMAfWaMfsP68KBXAwMBIJVarVKBQL2FCK+0XGRMoJpXukxyAUXmKrkamTFuz/GvAXA5uWQEQHgQIPX3l0gEAolEsgVS8GAoySijURyem9QLKOJpggiEcbnbdm7dfHlvZuYEgD8MDwCQGlJQdi9OLFpMUyyaBIAa6Hgyo3DVZy2bSu8HJ8ePA4gQIAYBfMCF6LC0otf2CSEGkytiOzEFjissPJl4dVRc7bchwSHr4kv0G8YARBIEktjYaIIQW1obFyUUy6hmbw7CmlBEl5VKmsgojCq4d2QnAcg8cCAmfCwEqVUiXbc3EAhqQ01HQZTQKONZeHYTsshE7GgUjUi8etWa11qKAZCZj2E7xnMglUYfgGdwQA0RrIlaLRbRlBr7yQANRSMbByQn52AYlrx2LAeScHjE1kdL1YbtfwIPAECh20/nQVRBBxlCZn7zjuKYoKBX15IAQcCB/E35GdESSf3h8gLwQDbFAxeeMpcIYd93f9gNgE9v9OnDw0caiQhBEqu2GgwCtUQdAVUgATYTcwBV8Hagicg+2EEATp36oE9/P5z0IIDsxIi0f57+Kk2tNhztiIMq2FhWTqwClNTVDGUUxg215gPg44bIhkP3r42HAHPhy5v9uz43DEtSD5cnEX2gW86cCIC5pOMlGIUwmYqzwYPTkf27GsqujXgQ4J/2xemK/v6KL9Mghv1FnwmNMKEnzyYU8bXQFov25d1pJgG3TzX0R0Ye6gzwzwiQRKd+0bCrv+Lm38BeYo2A6Syjc3XzJ7UyUQbopCTathFA/I1/lJ26eTooPrurK/vjzs8/+vtvvkozgL3Eajh6L0lmo8y1n7wgEJOBmpDU1tNcvJts5Zi+vs6+RjZRfwxPro+ISJOoBVJopfoHlefzqLAk2T6yJzxn0dDPV7Y2d2UH700GgP5+PM4+/jqom50YMmxVCyTRsbHWgNTDF87ncs3zH1nZWbaOK8xt5ytfysHxTV3BmSUl+hIVjh2LBH2UpUqMj/WPjg1aV9zY2PhtubnN5M2xZU3Zlsy0vLZWDOdrC7WNe/X6rkIc+7C/oqLiag6uvbU2NiNYnlhYqGUPVkIKp25OLAbqauINbMNwOUirDUkulOPsHsKDJgxXJSYHbUqUq1RyHDtSRTMtd5y6wcK6zHWwKV/Kl5MEeaNWLsdzmhoqPiR+0TbeKlSRbwoX1Mmm2RbIIDzMi6vOjbhAIOR8Nh87eRzTZgFCS4L5ONZ91kE3/f7MgnY00c9+P0aQa1NOpuDd5/CUFPmYcOzkDxSFGzr9CYHFcHRT0H9ofUi4euzEsddPHLuaNW4/+LunN7pybJmPO6Bx3BSUl7/HVPjI34839Tad6z3RPYrEsV7C3uXxRzUm4jhHZ3m5KTGLtODzU/gpvfwUORk/rsJal7Wb3DgzHfXglQd3Y9UvBzH+SDnlWVlEOsEcx15smqegeDJnPipCJp18FO3LTiwFBP4weaocduuCAYX7XMT2pw6rDAT1/YVuoLZ7KTtHhZNSZbETX2qpavdydpzNYRc8dPR1v15Xvu3ki2xSiYNHrlQNuDtzZnHSHT/r2z/rM+9s7dtv9fS89faVZfN8nl0IQ6OsWV8XiMnOWbjE4ymQx5KF5I0BZT3xhQVWXfQJLj4sJjqqJ7w1/az/m/4Dvg7lpGWpzr0AAAAASUVORK5CYII="});
        }
        console.log("Added 15 tokens");
        let response = await chai.request(HOST).get("/dashboard/"+0).send({"token":result.parsed.TEST_GOOGLE_TOKEN});
        expect(response.status).to.equal(200);
        let data = JSON.parse(response.text);
        expect(data.count).to.equal(16);
        expect(data.tokens.length).to.equal(10);
    });

    it("GET /dashboard with page 1  expecting to return 6 tokens and total token count as 16", async() => {
        let response = await chai.request(HOST).get("/dashboard/"+1).send({"token":result.parsed.TEST_GOOGLE_TOKEN});
        expect(response.status).to.equal(200);
        let data = JSON.parse(response.text);
        expect(data.count).to.equal(16);
        expect(data.tokens.length).to.equal(6);
    });


});
  

