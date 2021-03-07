const Router = require('koa-router');
const jwt = require('koa-jwt');
const router = new Router({prefix: '/questions/:questionsId/answers'})
const {
    find, findById, create, update, checkAnswerExist, delete: del,
    checkAnswerer
} = require('../controllers/answers')

const {secret} = require('../config');
const auth = jwt({secret});

router.get('/', find)
router.post('/', auth, create);
router.get('/:id', checkAnswerExist, findById);
router.patch('/:id', auth, checkAnswerExist, update);
router.delete('/:id', checkAnswerExist, checkAnswerer);

module.exports = router;