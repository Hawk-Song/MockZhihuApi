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
    listFollowers, 
    checkUserExist,
    followTopic,
    unfollowTopic,
    listFollowingTopics
} = require('../controllers/users')

const {checkTopicExist} = require('../controllers/topics');

const {secret} = require('../config');
const auth = jwt({secret});

router.get('/', find)

router.post('/', create);

router.get('/:id', findById);

router.patch('/:id', auth, update);

router.delete('/:id', auth, checkOwner, del);

router.post('/login', login);

router.get('/:id/following', listFollowing);

router.put('/following/:id', auth, checkUserExist, follow);

router.delete('/following/:id', auth, checkUserExist, unfollow);

router.get('/:id/followers', auth, listFollowers);

router.get('/:id/followingTopics', auth, listFollowingTopics);
router.put('/followingTopics/:id', auth, checkTopicExist, followTopic);

router.delete('/followingTopics/:id', auth, checkTopicExist, unfollowTopic);


module.exports = router;