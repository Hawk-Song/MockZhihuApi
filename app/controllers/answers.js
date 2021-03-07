const Answer = require('../models/answers');
class AnswersCtl { 
    async checkAnswerExist(ctx, next) {
        const answer = await Answer.findById(ctx.params.id).select('+answerer');
        if (!answer) {ctx.throw(404, "answer does not exist");}
        //only when deleting, updaing, checking answers, will we check if the quesiton exists
        //we don't check this when disliking or liking answers
        if (ctx.params.questionId && answer.questionId !== ctx.params.questionId) {
            ctx.throw(404, 'this question does not have this kind of answer')
        }
        ctx.state.answer = answer;
        await next();
    }

    async find(ctx) {
        const {per_page = 10} = ctx.query;
        const page = Math.max(ctx.query.page * 1, 1) - 1;
        const perPage = Math.max(ctx.query.per_page * 1, 1) // convert string to number
        const q = new RegExp(ctx.query.q);
        ctx.body = await Answer
            .find({content: q, questionId: ctx.params.questionId})
            .limit(perPage)
            .skip(page * perPage);
    }

    async findById(ctx) {
        const {fields = ""} = ctx.query;
        const selectFields = fields.split(';').filter(f => f).map(f => ' +' + f).join('');
        const topic = await Answer.findById(ctx.params.id).select(selectFields).populated('Answerer topics');
        ctx.body = topic;
    }

    async create(ctx) {
        ctx.verifyParams({
            content: {type: 'string', required: true}
        });
        const answerer = ctx.state.user._id;
        const {questionId} = ctx.params;
        const answer = await new Answer({...ctx.request.body, answer: answerer, questionId: questionId}).save();
        ctx.body = answer;
    }

    async checkAnswerer(ctx, next) {
        const {answer} = ctx.state;
        if (answer.Answerer.toString() !== ctx.state.user._id) {
            ctx.throw(403, 'No Permission');
        }
        await next();
    }

    async update(ctx) {
        ctx.verifyParams({
            content: {type: 'string', required: true},
        });
        await ctx.state.answer.update(ctx.request.body);
        ctx.body = ctx.state.answer;
    }

    async delete(ctx) {
        await Answer.findByIdAndRemove(ctx.params.id);
        ctx.status = 204;
    }
}

module.exports = new AnswersCtl();