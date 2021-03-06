const Koa = require('koa');
const bodyBody = require('koa-body');
const error = require('koa-json-error');
const parameter = require('koa-parameter');
const mongoose = require('mongoose');
const app = new Koa();
const routing = require('./routes');
const path = require('path');
const koaStatic = require('koa-static');


const {connectionStr} = require('./config');

mongoose.connect(connectionStr, { useNewUrlParser: true, useUnifiedTopology: true },  () => console.log('MongoDB connected successfully'));
mongoose.connection.on('error', console.error.bind(console, 'connection error:'));

app.use(koaStatic(path.join(__dirname, 'public')));
app.use(error({
    postFormat: (e, {stack, ...rest}) => process.env.NODE_ENV === 'production' ? rest : {stack, ...rest} 
}));

app.use(bodyBody({
    multipart: true,
    formidable: {
        uploadDir: path.join(__dirname, '/public/uploads'),
        keepExtensions: true,
    }
}));
app.use(parameter(app));
routing(app);

app.listen(3000, () => console.log('program launched at port 3000'));