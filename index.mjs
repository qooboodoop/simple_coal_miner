
import Pact from 'pact-lang-api'


var mpad = function (x) {
    while (x.length < 8) {
        x = '0' + x
    }
    return x
}


var mstrength = function (x) {
    var c = 0
    while (x[c] == '0') {
        c += 1
    }
    return c
}

var curhashstrength = function (x) {
    return mstrength(Array.from(Pact.crypto.base64UrlDecodeArr(x)).map((x) => mpad(x.toString(2))).reduce((x, y) => x + y))
}

function makeid(length) {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

const get_nonce = function () {
    return new Date().toUTCString()
}
const mymeta = function (acc, c_id) {
    return Pact.lang.mkMeta("", c_id, 0.000001, 2e6, Math.round((new Date).getTime() / 1e3) - 10, 600)

}
var mnet = "mainnet01"
// mnet = "testnet04"
var cid = "13"
// cid = "1"

var apihost = "https://api.chainweb.com/chainweb/0.0/mainnet01/chain/13/pact"
// apihost = "https://api.testnet.chainweb.com/chainweb/0.0/testnet04/chain/1/pact"

var mcmd = {
    type: "exec",
    pactCode: "(free.coal.get-nft-details \"" + process.argv[2] + "\")",
    nonce: get_nonce(),
    envData: {},
    chainId: cid,
    meta: mymeta("", cid),
    networkId: mnet

}
console.log("LOADING NFT #" + process.argv[2])



Pact.fetch.local(mcmd, apihost).then(x => {
    var tmp = x.result.data
    var curhash = tmp.curhash
    var strongest_nonce_strength = curhashstrength(curhash)
    var guess = ""
    var tmp = ""
    var t = 0

    var mdo = function () {
        var c = 0
        while (c < 10000) {
            c += 1
            if (curhashstrength(Pact.crypto.hash(curhash + "" + guess)) > strongest_nonce_strength) {
                tmp = Pact.crypto.hash(curhash + "" + guess)
                strongest_nonce_strength = curhashstrength(tmp)
                console.log("miner", "fnd")

                console.log({
                    res: "found", data: {
                        nonce: guess
                        , strength: strongest_nonce_strength
                        , curhash: curhash
                        , nexthash: tmp
                    }
                })
                process.exit(0)
            }
            guess = makeid(Math.floor(Math.random() * 1023) + 1)
        }
        t += 1
        console.clear()
        console.log(t,guess)
        setTimeout(() => {
            mdo()
        }, 150);
    }

    setTimeout(() => {
        mdo()
    }, 1);
})



