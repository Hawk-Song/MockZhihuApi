const Router = require('koa-router');
const jsonwebtoken = require('jsonwebtoken');
const jwt = require('koa-jwt');
const router = new Router({prefix: '/topics'})
const {
    find, findById, create, update, listTopicsFollowers, checkTopicExist
} = require('../controllers/topics')

const {secret} = require('../config');
const auth = jwt({secret});

router.get('/', find)

router.post('/', auth, create);

router.get('/:id', checkTopicExist, findById);

router.patch('/:id', auth, checkTopicExist, update);

router.get('/:id/followers', checkTopicExist, listTopicsFollowers);

module.exports = router;