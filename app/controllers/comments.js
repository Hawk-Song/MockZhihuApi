const Comment = require('../models/comments');
class CommentsCtl { 
    async checkCommentExist(ctx, next) {
        const comment = await Comment.findById(ctx.params.id).select('+Commenter');
        if (!comment) {ctx.throw(404, "Comment does not exist");}
        //only when deleting, updaing, checking Comments, will we check if the quesiton exists
        //we don't check this when disliking or liking Comments
        if (ctx.params.questionId && comment.questionId !== ctx.params.questionId) {
            ctx.throw(404, 'this question does not have this kind of Comment')
        }

        if (ctx.params.answerId && comment.answerId !== ctx.params.answerId) {
            ctx.throw(404, 'this question does not have this kind of Comment')
        }

        ctx.state.comment = Comment;
        await next();
    }

    async find(ctx) {
        const {per_page = 10} = ctx.query;
        const page = Math.max(ctx.query.page * 1, 1) - 1;
        const perPage = Math.max(ctx.query.per_page * 1, 1) // convert string to number
        const q = new RegExp(ctx.query.q);
        const {questionId, answerId} = ctx.params;
        const {rootCommentId} = ctx.query;
        ctx.body = await Comment
            .find({content: q, questionId, answerId, rootCommentId})
            .limit(perPage)
            .skip(page * perPage)
            .populate('commentator replyTo');
    }

    async findById(ctx) {
        const {fields = ""} = ctx.query;
        const selectFields = fields.split(';').filter(f => f).map(f => ' +' + f).join('');
        const topic = await Comment.findById(ctx.params.id).select(selectFields).populated('Commenter topics');
        ctx.body = topic;
    }

    async create(ctx) {
        ctx.verifyParams({
            content: {type: 'string', required: true},
            rootCommentId: {type: 'string', required: false},
            replyto: {type: 'string', required: false},
        });
        const commentator = ctx.state.user._id;
        const {questionId, answerId} = ctx.params;
        const comment = await new Comment({...ctx.request.body, commentator, questionId, answerId}).save();
        ctx.body = comment;
    }

    async checkCommentator(ctx, next) {
        const {Comment} = ctx.state;
        if (Comment.Commenter.toString() !== ctx.state.user._id) {
            ctx.throw(403, 'No Permission');
        }
        await next();
    }

    async update(ctx) {
        ctx.verifyParams({
            content: {type: 'string', required: true},
        });
        const {content} = ctx.request.body;
        await ctx.state.Comment.update({content});
        ctx.body = ctx.state.Comment;
    }

    async delete(ctx) {
        await Comment.findByIdAndRemove(ctx.params.id);
        ctx.status = 204;
    }
}

module.exports = new CommentsCtl();