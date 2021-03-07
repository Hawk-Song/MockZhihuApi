const jsonwebtoken = require('jsonwebtoken');
const User = require('../models/users');
const Question = require('../models/questions');
const Answers = require('../models/answers');
const {secret} = require('../config');

class UsersCtl { 
    async find(ctx) { //find all users
        const {per_page = 10} = ctx.query;
        const page = Math.max(ctx.query.page * 1, 1) - 1;
        const perPage = Math.max(ctx.query.per_page * 1, 1);
        ctx.body = await User.find().limit(perPage).skip(page * perPage);
    }
    async findById(ctx){
        const {fields} = ctx.query;
        const selectFields = fields.split(';').filter(f => f).map(f => ' +' + f).join('');
        const populateStr = fields.split(';').filter(f => f).map(f => {
            if (f === 'employments') {
                return 'employements.company employements.job';
            }
            if (f === 'educations') {
                return 'education.school education.major';
            }
            return f;
        }).join(' ');
        const user = await User.findById(ctx.params.id).select(selectFields).populate(populateStr);
        if (!user) {ctx.throw(404, 'User donot exists')}
        ctx.body = user;
    }
    async create(ctx) {
        ctx.verifyParams({
            name: {type: 'string', required: true},
            password: {type: 'string', required: true}
        });
        const {name} = ctx.request.body;
        const repeatedUser = await User.findOne({name});
        if (repeatedUser) {ctx.throw(409, 'Username is occupied')}
        const user = await new User(ctx.request.body).save();
        ctx.body = user;
    }

    async checkOwner(ctx, next) {
        if (ctx.params.id !== ctx.state.user._id) {
            ctx.throw(403, "No Permission");
        }
        await next();
    }

    async update(ctx) {
        ctx.verifyParams({
            name: {type: 'string', required: false},
            password: {type: 'string', required: false},
            avatar_url: {type: 'string', required: false},
            gender: {type: 'string', required: false},
            headerline: {type: 'string', required: false},
            locations: {type: 'array', itemType: 'string', required: false},
            business: {type: 'string', required: false},
            employments: {type: 'array', itemType: 'object', required: false},
            educations: {type: 'array', itemType: 'object', required: false},
        });
        const user = await User.findByIdAndUpdate(ctx.params.id, ctx.request.body);
        if (!user) {ctx.throw(404);}
        ctx.body = user;

    }
    async delete(ctx) {
        const user = await User.findByIdAndRemove(ctx.params.id);
        if (!user) {ctx.throw(404, 'User does not exist!')}
        ctx.status = 204;
    }

    async login(ctx) {
        ctx.verifyParams({
            name: {type: 'string', required: true},
            password: {type: 'string', required: true}
        });
        const user = await User.findOne(ctx.request.body);
        if (!user) {ctx.throw(401, 'User does not exist!')};
        const {_id, name} = user;
        const token = jsonwebtoken.sign({_id, name}, secret, {expiresIn: '1d'});
        ctx.body = {token};

    }

    async listFollowing(ctx) {
        const user = await User.findById(ctx.params.id).select('+following').populate('following');
        console.log(user);
        if(!user) {ctx.throw(404);}
        ctx.body = user.following;
    }

    async listFollowers(ctx) {
        const users = await User.find({following: ctx.params.id});
        ctx.body = users;
    }

    async checkUserExist(ctx) {
        const user = await User.findById(ctx.params.id);
        if (!user) {ctx.throw(404, "User does not exist");}
        await next();
    }

    async follow(ctx) {
        const me = await User.findById(ctx.state.user._id).select('+following');
        if (!me.following.map(id => id.toString()).includes(ctx.params.id)) {
            me.following.push(ctx.params.id);
            me.save();
        }
        ctx.status = 204;
    }

    async unfollow(ctx) {
        const me = await User.findById(ctx.state.user._id).select('+following');
        const index = me.following.map(id => id.toString()).indexOf(ctx.params.id);
        if (index > -1) { 
            me.following.splice(index, 1);
            me.save();
        }
        ctx.status = 204;
    }

    async listFollowingTopics(ctx) {
        const user = await User.findById(ctx.params.id).select('+followingTopics').populate('followingTopics');

        if(!user) {ctx.throw(404);}
        ctx.body = user.followingTopics;
    }

    async followTopic(ctx) {
        const me = await User.findById(ctx.state.user._id).select('+followingTopics');
        if (!me.followingTopics.map(id => id.toString()).includes(ctx.params.id)) {
            me.followingTopics.push(ctx.params.id);
            me.save();
        }
        ctx.status = 204;
    }

    async unfollowTopic(ctx) {
        const me = await User.findById(ctx.state.user._id).select('+followingTopics');
        const index = me.followingTopics.map(id => id.toString()).indexOf(ctx.params.id);
        if (index > -1) { 
            me.followingTopics.splice(index, 1);
            me.save();
        }
        ctx.status = 204;
    }

    async listQuestions(ctx) {
        const questions = await Question.find({questioner: ctx.params.id});
        ctx.body = questions;
    }


    async listLikingAnswers(ctx) {
        const user = await User.findById(ctx.params.id).select('+likengAnswers').populate('likingAnswers');
        if(!user) {ctx.throw(404);}
        ctx.body = user.likengAnswers;
    }

    async likeAnswer(ctx, next) {
        const me = await User.findById(ctx.state.user._id).select('+likengAnswers');
        if (!me.likengAnswers.map(id => id.toString()).includes(ctx.params.id)) {
            me.likengAnswers.push(ctx.params.id);
            me.save();
            await Answer.findByIdAndUpdate(ctx.params.id, {$inc: {voteCount: 1}});
        }
        ctx.status = 204;
        await next();
    }

    async unLikeAnswer(ctx) {
        const me = await User.findById(ctx.state.user._id).select('+likengAnswers');
        const index = me.likengAnswers.map(id => id.toString()).indexOf(ctx.params.id);
        if (index > -1) { 
            me.likengAnswers.splice(index, 1);
            me.save();
            await Answer.findByIdAndUpdate(ctx.params.id, {$inc: {voteCount: -1}});
        }
        ctx.status = 204;
    }

    async listDisLikingAnswers(ctx) {
        const user = await User.findById(ctx.params.id).select('+dislikengAnswers').populate('dislikengAnswers');
        if(!user) {ctx.throw(404);}
        ctx.body = user.dislikengAnswers;
    }

    async dislikeAnswer(ctx, next) {
        const me = await User.findById(ctx.state.user._id).select('+dislikengAnswers');
        if (!me.dislikengAnswers.map(id => id.toString()).includes(ctx.params.id)) {
            me.dislikengAnswers.push(ctx.params.id);
            me.save();
            await Answer.findByIdAndUpdate(ctx.params.id, {$inc: {voteCount: 1}});
        }
        ctx.status = 204;
        await next();
    }

    async undisLikeAnswer(ctx) {
        const me = await User.findById(ctx.state.user._id).select('+dislikengAnswers');
        const index = me.dislikengAnswers.map(id => id.toString()).indexOf(ctx.params.id);
        if (index > -1) { 
            me.dislikengAnswers.splice(index, 1);
            me.save();
        }
        ctx.status = 204;
    }
    
}

module.exports = new UsersCtl();