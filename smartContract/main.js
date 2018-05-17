"use strict";

var Post = function (text) {
    if (text) {
        var obj = JSON.parse(text);
        this.id = obj.id;
        this.from = obj.from;
        this.title = obj.title;
        this.describe = obj.describe;
        this.time = obj.time;
        this.location = obj.location;
        this.concact = obj.concact;
        this.status = obj.status;
    } else {
        this.id = "";
        this.from = "";
        this.title = "";
        this.describe = "";
        this.time = "";
        this.location = "";
        this.concact = "";
        this.status = "";
    }
};

Post.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};

var Reward = function (text) {
    console.log('text', text)
    if (text) {
        var obj = JSON.parse(text);
        this.from = obj.from;
        this.id = obj.id;
        this.title = obj.title;
        this.describe = obj.describe;
        this.time = obj.time;
        this.location = obj.location;
        this.concact = obj.concact;
        this.money = obj.money;
        this.status = obj.status;
    } else {
        this.id = "";
        this.from = "";
        this.title = "";
        this.describe = "";
        this.time = "";
        this.location = "";
        this.concact = "";
        this.money = "";
        this.status = "";
    }
};

Reward.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};


var lostAndFind = function () {

    LocalContractStorage.defineProperty(this, "postNumber");
    LocalContractStorage.defineProperty(this, "rewardNumber");

    LocalContractStorage.defineMapProperty(this, "post", {
        parse: function (text) {
            return new Post(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });

    LocalContractStorage.defineMapProperty(this, "reward", {
        parse: function (text) {
            return new Reward(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
};

lostAndFind.prototype = {
    init: function () {
        this.adminAddress = Blockchain.transaction.from;
        this.postNumber = 0;
        this.rewardNumber = 0;
    },

    // 发布丢失物品信息
    // ["标题", "描述", "3312121122", "位置信息", "联系方式"]
    onPost: function (title, describe, time, location, concact) {
        var from = Blockchain.transaction.from;

        this.postNumber++;

        var poster = new Post();
        poster.id = this.postNumber;
        poster.from = from;
        poster.title = title;
        poster.describe = describe;
        poster.time = time;
        poster.location = location;
        poster.concact = concact;
        poster.status = 1;

        this.post.set(this.postNumber, poster);

    },

    // 下架物品
    offPost: function (id) {
        var from = Blockchain.transaction.from;
        var poster = this.post.get(id);

        if(poster.from === from){
            poster.status = 2;
            this.post.set(id, poster);
        }

    },

    // 获取所有物品列表
    listPost: function () {
        var arr1 = [];
        var arr2 = [];
        var poster;
        for (var i = 0; i < this.postNumber; i++) {
            poster = this.post.get(i + 1);
            if (poster.status === 1) {
                // 还在线的帖子
                arr1.push(poster);
            } else {
                // 下架的帖子
                arr2.push(poster);
            }
        }

        return {
            online: arr1,
            offline: arr2
        }
    },

    // 发布悬赏
    // ["标题", "描述", "3312121122", "位置信息", "联系方式", "100"]
    onReward: function (title, describe, time, location, concact, money) {
        var from = Blockchain.transaction.from;

        this.rewardNumber++;

        var reward = new Reward();
        reward.id = this.rewardNumber;
        reward.title = title;
        reward.from = from;
        reward.describe = describe;
        reward.time = time;
        reward.location = location;
        reward.concact = concact;
        reward.money = money;
        reward.status = 1;

        this.reward.set(this.rewardNumber, reward);

    },

    // 下架悬赏贴
    offReward: function (id) {
        var from = Blockchain.transaction.from;
        var reward = this.reward.get(id);
        if(reward.from === from){
            reward.status = 2;
            this.reward.set(id, reward);
        }
    },

    // 获取所有悬赏贴
    listReward: function () {
        var arr1 = [];
        var arr2 = [];
        var reward;

        for (var i = 0; i < this.rewardNumber; i++) {
            console.log(111, i);
            reward = this.reward.get(i + 1);
            console.log(222, reward);
            if (reward.status === 1) {
                // 还在线的帖子
                arr1.push(reward);
            } else {
                // 下架的帖子
                arr2.push(reward);
            }
        }

        return {
            online: arr1,
            offline: arr2
        }
    },

    // 查询我发布的帖子
    findMyPost: function () {
        var from = Blockchain.transaction.from;
        var arr1 = [];
        var arr2 = [];
        var post, reward;

        for (var i = 0; i < this.postNumber; i++) {
            post = this.post.get(i + 1);
            if(post.from === from){
                arr1.push(post);
            }
        }

        for (var i = 0; i < this.rewardNumber; i++) {
            reward = this.reward.get(i + 1);
            if(reward.from === from){
                arr2.push(reward);
            }
        }

        return {
            post: arr1,
            reward: arr2
        }
    },
};
module.exports = lostAndFind;