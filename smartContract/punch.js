"use strict";

//每个参加抽奖的人
var Draw = function(text) {
	if (text) {
		var obj = JSON.parse(text);
		this.time = obj.time;
		this.address = obj.address;
	} else {
	    this.time = "";
	    this.address = "";
	}
};

Draw.prototype = {
	toString: function () {
		return JSON.stringify(this);
	}
};

var Punch = function () {
    LocalContractStorage.defineProperty(this, "size");
    LocalContractStorage.defineMapProperty(this, "repo", {
        parse: function (text) {
            return new Draw(text);

        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

var signArr = [];

//抽奖合约
Punch.prototype = {
    init: function () {
        // todo
        this.size = 0;
    },

    //参加抽奖,一个地址只能参与一次抽奖,每次固定金额0.1
    join: function () {

        var from = Blockchain.transaction.from;
        var timestamp = Blockchain.transaction.timestamp;

        //timestamp * 1000即为时间
        console.log(22, timestamp)

        var draw = new Draw();
        draw.address = from;
        draw.time = timestamp;

        this.repo.set(from, draw);
        this.size +=1;
    },

    //退出抽奖
    quit: function (address) {
        this.repo.del(address);
        this.size -=1;
    },

    //签到,时间在5:00 -- 8:00之间都可以
    sign: function () {
        var from = Blockchain.transaction.from;
        var timestamp = Blockchain.transaction.timestamp;

        if(timestamp){
            var draw = this.repo.get(from);
            console.log('draw', draw);
            if(draw.address){
                //之前参加过活动
                signArr.push(from);
            } else {

            }
        }

    },

    takeout: function (to, value) {
        var amount = new BigNumber(value);

        var result = Blockchain.transfer(to, amount);
        console.log('result', result);

        if (!result) {
            throw new Error("transfer failed.");
        }
        //Event.Trigger("BankVault", {
        //    Transfer: {
        //        from: Blockchain.transaction.to,
        //        to: from,
        //        value: amount.toString()
        //    }
        //});
        //
        //deposit.balance = deposit.balance.sub(amount);
        //this.bankVault.put(from, deposit);
    },

    //签到完毕,将token返回到相应的账户
    backToken: function () {
        var eachCoin = this.size * 0.1 / signArr.length;

        console.log('eachCoin', eachCoin);
        //signArr.forEach(function(to) {
        //    console.log('to, eachCoin', to, eachCoin)
        //    this.takeout(to, eachCoin);
        //})

        for(var i=0;i<signArr.length;i++){
            console.log('to, eachCoin', signArr[0], eachCoin)
            this.takeout(signArr[0], eachCoin);
        }

    },

    //查询是否参与了抽奖
    get: function () {
        var from = Blockchain.transaction.from;
        if ( from === "" ) {
            throw new Error("empty key")
        }
        return this.repo.get(from);
    }
};
module.exports = Punch;