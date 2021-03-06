const Router = require('koa-router');
const jwt = require('koa-jwt');
const router = new Router({prefix: '/questions'})
const {
    find, findById, create, update, checkQuestionExist, delete: del,
    checkQuestioner
} = require('../controllers/questions')

const {secret} = require('../config');
const auth = jwt({secret});

router.get('/', find)
router.post('/', auth, create);
router.get('/:id', checkQuestionExist, findById);
router.patch('/:id', auth, checkQuestionExist, update);
router.delete('/:id', checkQuestionExist, checkQuestioner);

module.exports = router;