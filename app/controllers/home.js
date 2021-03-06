class HomeCtl { //home controller 的缩写
    index(ctx) {
        ctx.body = '<h1>This is Home page</hi>'
    }
}

module.exports = new HomeCtl();