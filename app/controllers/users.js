const jsonwebtoken = require('jsonwebtoken');
const User = require('../models/users');
const {secret} = require('../config');

class UsersCtl { 
    async find(ctx) { //find all users
        ctx.body = await User.find();
    }
    async findById(ctx){
        const user = await User.findById(ctx.params.id);
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
            password: {type: 'string', required: false}
        });
        const user = await User.findByIdAndUpdate(ctx.params.id, ctx.params.body);
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

}

module.exports = new UsersCtl();