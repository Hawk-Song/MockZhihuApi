const Router = require('koa-router');
const jsonwebtoken = require('jsonwebtoken');
const router = new Router({prefix: '/users'})
const {
    find,
    findById,
    create,
    update,
    delete: del,
    login
} = require('../controllers/users')

const {secret} = require('../config');
const auth = async (ctx, next) => {
    const {authorization = ''} = ctx.request.header;
    const token = authorization.replace('Bearer ', '');
    try {
        const user = jsonwebtoken.verify(token, secret);
        ctx.state.user = user; //为了让后面的controller 能拿到用户信息， 放到state里面
    } catch (err) {
        ctx.throw(401, err.message);
    }
    await next();
}

router.get('/', find)

router.post('/', create);

router.get('/:id', findById);

router.patch('/:id', auth, update);

router.delete('/:id', auth, del);

router.post('/login', login);

module.exports = router;