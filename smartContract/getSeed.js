"use strict";

var Developer = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        this.time = obj.time;
        this.address = obj.address;
    } else {
        this.time = "";
        this.address = "";
    }
};

Developer.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var Donor = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        this.time = obj.time;
        this.address = obj.address;
        this.nickname = obj.nickname;
        this.number = obj.number;
        this.words = obj.words;
    } else {
        this.time = "";
        this.address = "";
        this.nickname = "";
        this.number = "";
        this.words = "";
    }
};

Donor.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};


var Seed = function () {

    LocalContractStorage.defineProperty(this, "developerNumber");
    LocalContractStorage.defineProperty(this, "donorTimes");
    LocalContractStorage.defineProperty(this, "adminAddress");

    LocalContractStorage.defineMapProperty(this, "developers", {
        parse: function (text) {
            return new Developer(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });

    LocalContractStorage.defineMapProperty(this, "Donors", {
        parse: function (text) {
            return new Donor(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

Seed.prototype = {
    init: function () {
        this.adminAddress = Blockchain.transaction.from;
        this.developerNumber = 0;
        this.donorTimes = 0;
    },

    // 主网上的返回值是交易的信息
    get: function () {

        var from = Blockchain.transaction.from;
        var timestamp = Blockchain.transaction.timestamp;
        var resultValue;

        var developer = this.developers.get(from);

        console.log('developer', developer);
        if (developer) {
            //之前参加过赠送
            resultValue = 1;
        } else {
            resultValue = 2;

            var amount = new BigNumber(0.00001 * 1e18);
            var result = Blockchain.transfer(from, amount);
            console.log('result', result);

            if (!result) {
                //可能是合约地址余额不足
                throw new Error("transfer failed.");
            } else {
                //转账成功了才将用户放入名单
                developer = new Developer();
                developer.address = from;
                developer.time = timestamp;
                this.developerNumber++;
                LocalContractStorage.set('dev'+this.developerNumber, from);
                this.developers.set(from, developer);


                console.log('developer2', developer);
            }
        }

        // 这个返回主要是给simulateCall来使用
        return resultValue;

    },

    // 获取所有参与活动的用户信息
    getAllDevs: function () {
        var arr = [];
        var temp;
        for(var i=0; i<this.developerNumber; i++){
            temp = LocalContractStorage.get('dev'+(i+1));
            console.error('temp', temp);
            arr.push( this.developers.get(temp) );

        }
        return arr;
    },

    // 管理员清空领取开发者地址，每天每人领取一次
    clearDevAddress: function () {
        var from = Blockchain.transaction.from;
        var temp;
        console.warn('from', from);
        if (from === this.adminAddress) {
            console.warn('from', from);
            for(var i=0; i<this.developerNumber; i++){
                temp = LocalContractStorage.get('dev'+(i+1));
                console.error('temp', temp);
                try{
                    LocalContractStorage.del('dev'+(i+1));
                    this.developers.del(temp);

                    console.log(LocalContractStorage.get('dev'+(i+1)) );
                    console.log(this.developers.get(temp) );
                } catch (e){
                    console.error('error', e);
                }

            }
            this.developerNumber = 0;
        }
    },

    //往合约地址充钱,也可以支持捐赠和广告
    recharge: function (nickname, words) {
        var timestamp = Blockchain.transaction.timestamp;
        var value = Blockchain.transaction.value;
        var from = Blockchain.transaction.from;

        if(value > 0) {
            var donor = new Donor();
            donor.address = from;
            donor.number = value / 1e18;
            donor.time = timestamp;
            donor.nickname = nickname;
            donor.words = words;

            console.log('donor', donor);
            console.log('this.donorTimes', this.donorTimes);

            //以时间维度来存储捐赠者
            this.Donors.set(++this.donorTimes, donor);
        }

    },

    // 管理将合约里面的钱出来
    getAllToken: function (value) {
        var from = Blockchain.transaction.from;
        console.log('from', from);
        if (from === this.adminAddress) {
            //我自己的钱包地址
            var amount = new BigNumber(value * 1e18);
            var result = Blockchain.transfer(from, amount);
            if (!result) {
                throw new Error("transfer failed.");
            }
        }
    },

    // 获取捐赠者的名单, 参数为最近数量的捐赠者
    getDonors: function (number) {
        var start = this.donorTimes - number;
        var arr = [];

        if (start < 0) {
            start = 0;
        }

        for (var i = start; i < this.donorTimes; i++) {
            arr.push(this.Donors.get((i + 1)));
        }

        return arr;
    },
};
module.exports = Seed;