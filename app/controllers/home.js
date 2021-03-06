const path = require('path');
class HomeCtl { //home controller 的缩写
    index(ctx) {
        ctx.body = '<h1>This is Home page</hi>'
    }

    upload(ctx) {
        const file = ctx.request.files.file;
        const basename = path.basename(file.path);
        ctx.body = {url: `${ctx.origin}/uploads/${basename}`};
    }
}

module.exports = new HomeCtl();