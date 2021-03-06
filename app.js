let express = require('express');
let path = require('path');
let favicon = require('serve-favicon');
let logger = require('morgan');
let cookieParser = require('cookie-parser');
let bodyParser = require('body-parser');
let clog = require('clog');
let ejsLocals = require('ejs-locals');
let session = require('express-session');
//let loginCheck = require('./middleware/logincheck');

let index = require('./routes/index');

let app = express();
let debug = require('debug')('sixstring:server');
let http = require('http');


// view engine setup
app.engine('ejs', ejsLocals);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'image', 'favicon.ico')));

app.use((req, res, next) => {
	if(req.url == '/'){
		res.redirect('/index.html');
	}else{
		next();
	}
});

const skipLog = {
	'.gif': 1, '.jpg': 1, '.png': 1, '.svg': 1, 
	'.css': 1, '.ttf': 1, '.ico': 1, '.js': 1
};
app.use(logger('dev', {skip: (req, res) => {
	let ext = path.extname(req.url);
	return skipLog[ext];
}}));

app.use((req, res, next) => {
	clog.debug('before cookie', req.cookies);
	clog.debug('before req.body', req.body);
	clog.debug('before session', req.session);
	next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
	cookie: {maxAge: 1000*60*30},	// 쿠키 유지시간 30분
	secret: 'keyboard cat',
	rolling: true	// 매 요청마다 쿠키 갱신
}));

//app.use(loginCheck);

app.use((req, res, next) => {
	clog.debug('after cookie', req.cookies);
	clog.debug('after req.body', req.body);
	clog.debug('after session', req.session);
	next();
});

app.use('/', index);

// catch 404 and forward to error handler
app.use((req, res, next) => {
  let err = new Error(req.url + ' Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use((err, req, res, next) => {
//	console.error(err);
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

let port = normalizePort(process.env.PORT || '80');
app.set('port', port);

let server = http.createServer(app);

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

function normalizePort(val) {
  let port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string'
    ? 'Pipe ' + port
    : 'Port ' + port;

  // handle specific listen errors with friendly messages
  switch (error.code) {
    case 'EACCES':
      console.error(bind + ' requires elevated privileges');
      process.exit(1);
      break;
    case 'EADDRINUSE':
      console.error(bind + ' is already in use');
      process.exit(1);
      break;
    default:
      throw error;
  }
}

function onListening() {
  let addr = server.address();
  let bind = typeof addr === 'string'
    ? 'pipe ' + addr
    : 'port ' + addr.port;
  debug('Listening on ' + bind);
}


