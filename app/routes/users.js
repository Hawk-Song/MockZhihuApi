const Router = require('koa-router');
const jsonwebtoken = require('jsonwebtoken');
const jwt = require('koa-jwt');
const router = new Router({prefix: '/users'})
const {
    find,
    findById,
    create,
    update,
    delete: del,
    login,
    checkOwner,
    listFollowing,
    follow,
    unfollow,
    listFollowers
} = require('../controllers/users')

const {secret} = require('../config');
const auth = jwt({secret});

router.get('/', find)

router.post('/', create);

router.get('/:id', findById);

router.patch('/:id', auth, update);

router.delete('/:id', auth, checkOwner, del);

router.post('/login', login);

router.get('/:id/following', listFollowing);

router.put('/following/:id', auth, follow);

router.delete('/following/:id', auth, unfollow);

router.get('/:id/followers', auth, listFollowers);

module.exports = router;