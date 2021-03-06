const User = require('../models/users');

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

}

module.exports = new UsersCtl();