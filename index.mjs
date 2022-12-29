
import Pact from 'pact-lang-api'
import fs from 'fs';


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
var cid = "13"
var hashes_per_round = 10000
var is_testnet = ""
var apihost = "https://api.chainweb.com/chainweb/0.0/mainnet01/chain/13/pact"
if (process.argv[3] != undefined && process.argv[3] == "testnet") {
    is_testnet = "TESTNET-"
    mnet = "testnet04"
    cid = "1"
    apihost = "https://api.testnet.chainweb.com/chainweb/0.0/testnet04/chain/1/pact"
}

var mcmd = {
    type: "exec",
    pactCode: "(free.coal.get-nft-details \"" + process.argv[2] + "\")",
    nonce: get_nonce(),
    envData: {},
    chainId: cid,
    meta: mymeta("", cid),
    networkId: mnet

}
fs.readFile("miner-config.json", 'utf-8', function (err, data) {
    if (!err) {
        console.log(data);
        console.log("LOADING NFT #" + process.argv[2])

        var config = JSON.parse(data)
        if (config.hashes_per_round != undefined) {
            hashes_per_round = config.hashes_per_round
        }

        Pact.fetch.local(mcmd, apihost).then(x => {
            var tmpx = x.result.data
            var curhash = tmpx.curhash
            var strongest_nonce_strength = curhashstrength(curhash)
            var guess = ""
            var tmp = ""
            var t = 0

            var mdo = function () {
                var c = 0
                while (c < hashes_per_round) {
                    c += 1
                    if (curhashstrength(Pact.crypto.hash(curhash + "" + guess)) > strongest_nonce_strength) {
                        tmp = Pact.crypto.hash(curhash + "" + guess)
                        strongest_nonce_strength = curhashstrength(tmp)
                        // console.log("miner", "fnd")
                        var content = {
                            result: "found", data: {
                                nonce: guess
                                , "new-strength": strongest_nonce_strength
                                , curhash: curhash
                                , nexthash: tmp
                            }
                        }



                        fs.writeFile('' + is_testnet + 'NFT-' + process.argv[2] + "-" + get_nonce().split(" ").join("-").split(",").join("-").split(":").join("-") + ".txt", JSON.stringify(content, null, 4), err => {
                            if (err) {
                                console.error(err);
                            }
                            setTimeout((x) => {
                                console.log(x)
                                process.exit()
                            }, 1000, content);
                            // file written successfully
                        });


                    }
                    guess = makeid(Math.floor(Math.random() * 1023) + 1)
                }
                t += 1
                console.clear()
                console.log("Mining NFT#", tmpx.id.int, " - round:", t, guess.slice(0, 10) + " ...")
                setTimeout(() => {
                    mdo()
                }, 50);
            }

            setTimeout(() => {
                mdo()
            }, 1);
        })




    } else {
        console.log(err);
    }
});

