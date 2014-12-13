var express = require('express');
var path = require('path');
var http = require('http');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

var mongoose = require('mongoose');

mongoose.connect('mongodb://localhost/todo_development', function(err){
    if(!err){
        console.log('Connected to MongoDB');
    }else{
        throw err;
    }
});

var Schema = mongoose.Schema, 
    ObjectId = Schema.ObjectId;

var Task = new Schema({
    task : String
});

var Task = mongoose.model('Task', Task);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json('strict'));
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
})); 
// app.use(bodyParser());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);
app.get('/tasks', function(req, res){
    Task.find({}, function(err, docs){
        res.render('tasks/index', {
            title: 'Todos index view',
            docs: docs
        });
    });
});




app.post('/tasks', function(req, res){
    var task = new Task(req.body.task);
    // console.log(req.body.task);
    task.save(function(err){
        if(!err){
            res.redirect('/tasks');
        }
        else {
            res.redirect('/tasks/new');
        }
    });
});
app.post('/tasks/:id', function(req, res){
    //console.log('PUT');
    Task.findById(req.params.id, function(err, doc){
        doc.task = req.body.task.task;
        doc.save(function(err){
            if(!err){
                res.redirect('/tasks');
            }
            else {
                //error handling
            }
        });
    });
});

app.get('/tasks/new', function(req, res){
    res.render('tasks/new.jade', {
        title : 'New Task'
    });
});

app.get('/tasks/:id/edit', function(req, res){
    Task.findById(req.params.id, function(err, doc){
        res.render('tasks/edit', {
            title: 'Edit Task View',
            task: doc
        });
    });
});

app.get('/tasks/:id/del', function(req, res){
    Task.findById(req.params.id, function(err, doc){
        if(!doc) return next(new NotFound('Document Not Found'));
        doc.remove(function(){
            res.redirect('/tasks');
        });
    });
})



// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;
