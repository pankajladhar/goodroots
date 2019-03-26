const express = require('express');
var app = express();
var bodyParser = require('body-parser');
var path = require('path');
var crypto = require('crypto');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'))

const key = "yGf2xak9";
const salt = "Vg1fM0UYz9";
const txnid = `GR-${new Date().getTime()}`;
const product = {
    "p-1-1": {
        "amount": "1000",
        "label": "Alphanso 1 dozon",
    },
    "p-1-2": {
        "amount": "2000",
        "label": "Alphanso 2 dozon",
    },
    "p-1-3": {
        "amount": "3000",
        "label": "Alphanso 3 dozon",
    },
    "p-2-1": {
        "amount": "1000",
        "label": "Banganapalli 1 dozon",
    },
    "p-2-2": {
        "amount": "2000",
        "label": "Banganapalli 2 dozon",
    },
    "p-2-3": {
        "amount": "3000",
        "label": "Banganapalli 3 dozon",
    }
}

const hiddenForm = (amount,name, email, phone, hash, prodInfo) => {
    return '<form id=\"myForm\" action=\"https://sandboxsecure.payu.in/_payment" method=\"post\">' +
        '<input type=\"hidden\" name=\"key\" value=\"' + key + '\" />' +
        '<input type=\"hidden\" name=\"txnid\" value=\"' + txnid + '\" />' +
        '<input type=\"hidden\" name=\"amount\" value=\"' + amount + '\" />' +
        '<input type=\"hidden\" name=\"productinfo\" value=\"' + prodInfo + '\" />' +
        '<input type=\"hidden\" name=\"firstname\" value=\"' + name + '\" />' +
        '<input type=\"hidden\" name=\"email\" value=\"' + email + '\" />' +
        '<input type=\"hidden\" name=\"phone\" value=\"' + phone + '\" />' +
        '<input type=\"hidden\" name=\"surl\" value=\"http://localhost:4000/confirmation\" />' +
        '<input type=\"hidden\" name=\"furl\" value=\"http://localhost:4000/error\" />' +
        '<input type=\"hidden\" name=\"hash\" value=\"' + hash + '\" />' +
        '<input type=\"hidden\" name=\"service_provider\" value=\"payu_paisa\" />' +
        '</form>';
}

app.post('/', (req, res) => {
    let strdat = '';

    req.on('data', function (chunk) {
        strdat += chunk;
    });

    req.on('end', function () {
        let {fname, email, phone, pinfo} = JSON.parse(strdat);
        
        const prodInfo = pinfo.map((p)=> {
            return product[p]['label']
        }).join(' and ')
           
        let amount = parseInt(product[pinfo[0]]['amount']) + parseInt(pinfo[1] ? product[pinfo[1]]['amount'] : 0)
        
        let cryp = crypto.createHash('sha512');
        let text = key + '|' + txnid + '|' + amount + '|' + prodInfo + '|' + fname + '|' + email + '|||||||||||' + salt;
        cryp.update(text);
        let hash = cryp.digest('hex');
        res.setHeader("Content-Type", "text/json");
        res.setHeader("Access-Control-Allow-Origin", "*");
        const form = hiddenForm(amount, fname, email, phone, hash, prodInfo)
        res.end(form);
    });
})
app.get('*', (req, res) => {  
    res.sendFile(path.resolve(__dirname, 'public/index.html'));
});

app.post('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'public/index.html'));
});

// app.listen(4000, () => {
//     console.log("Server started .... ")
// });

module.exports = app