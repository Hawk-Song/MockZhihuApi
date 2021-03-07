const Router = require('koa-router');
const jwt = require('koa-jwt');
const router = new Router({prefix: '/questions/:questionsId/comments'})
const {
    find, findById, create, update, checkCommentExist, delete: del,
    checkCommentator
} = require('../controllers/comments')

const {secret} = require('../config');
const auth = jwt({secret});

router.get('/', find)
router.post('/', auth, create);
router.get('/:id', checkCommentator, findById);
router.patch('/:id', auth, checkCommentExist, checkCommentator, update);
router.delete('/:id', checkCommentExist, checkCommentator);

module.exports = router;