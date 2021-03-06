import Express from 'express';
import session from 'express-session';
import bodyParser from 'body-parser';
import methodOverride from 'method-override';

import flash from './flash';

import encrypt from './encrypt';
import Post from './entities/Post';
import User from './entities/User';
import Guest from './entities/Guest';

export default () => {
  const app = new Express();
  app.set('view engine', 'pug');
  app.use(methodOverride('_method'));
  app.use(bodyParser.urlencoded({
    extended: false,
  }));
  // app.use('/assets', Express.static(process.env.NODE_PATH.split(':')[0]));
  app.use(Express.static('public'));
  app.use(session({
    secret: 'secret key',
    resave: false,
    saveUninitialized: false,
  }));
  app.use(flash());

  // DATA
  const users = [
    new User('admin', encrypt('qwerty')),
    new User('user', encrypt('1')),
  ];
  const posts = [
    new Post('Гостевая запись 1', 'The first half of life consists of the capacity to enjoy without the chance, the last half consists of the chance without the capacity. Mark Twain', 'guest', 'Sat Mar 01 2019'),
    new Post('Гостевая запись 2', 'Political language is designed to make lies sound truthful and murder respectable and to give an appearance of solidity to pure wind. George Orwell', 'guest', 'Sat Mar 01 2019'),
    new Post('Запись 1 админа', 'My religion consists of a humble admiration of the illimitable superior spirit who reveals himself in the slight details we are able to perceive with our frail and feeble mind. Albert Einstein', 'admin', 'Sat Mar 01 2019'),
    new Post('Запись 2 админа', 'To be conscious that you are ignorant is a great step to knowledge. Benjamin Disraeli', 'admin', 'Sat Mar 01 2019'),
  ];

  app.use((req, res, next) => {
    if (req.session && req.session.nickname) {
      const {
        nickname,
      } = req.session;
      res.locals.currentUser = users.find(user => user.nickname === nickname);
    } else {
      res.locals.currentUser = new Guest();
    }
    next();
  });

  app.get('/', (req, res) => {
    res.render('index');
  });

  // Work with posts

  app.get('/posts', (_req, res) => {
    res.render('posts/index', {
      posts,
    });
  });

  app.get('/posts/new', (_req, res) => {
    res.render('posts/new', { form: {}, errors: {} });
  });

  // app.get('/posts/:id', (req, res) => {
  //   const post = posts.find(p => p.id.toString() === req.params.id);
  //   res.render('posts/show', { post });
  // });

  app.post('/posts', (req, res) => {
    const { title, body } = req.body;

    const errors = {};
    if (!title) {
      errors.title = "Title can't be blank";
    }

    if (!body) {
      errors.body = "Body can't be blank";
    }

    if (Object.keys(errors).length === 0) {
      const currentDate = new Date();
      const post = new Post(title, body, res.locals.currentUser.nickname, currentDate.toDateString());
      posts.push(post);
      // res.redirect(`/posts/${post.id}/edit`);
      res.redirect('/posts');
      return;
    }

    res.status(422);
    res.render('posts/new', { form: req.body, errors });
  });

  app.get('/posts/:id/edit', (req, res) => {
    const post = posts.find(p => p.id.toString() === req.params.id);
    res.render('posts/edit', { form: post, errors: {} });
  });

  app.patch('/posts/:id', (req, res) => {
    const { title, body } = req.body;
    const errors = {};
    const post = posts.find(p => p.id.toString() === req.params.id);
    if (!title) {
      errors.title = "Title can't be blank";
    }

    if (!body) {
      errors.body = "Body can't be blank";
    }

    if (Object.keys(errors).length === 0) {
      post.title = title;
      post.body = body;
      res.redirect(`/posts/${post.id}/edit`);
      return;
    }
    res.status(422);
    res.render('posts/edit', { form: post, errors });
  });
  app.delete('/posts/:id', (req, res) => {
    const post = posts.find(p => p.id.toString() === req.params.id);
    posts.splice(posts.indexOf(post), 1);
    res.redirect('/posts');
  });

  // Work with users

  app.get('/users/new', (req, res) => {
    res.render('users/new', {
      form: {},
      errors: {},
    });
  });

  app.post('/users', (req, res) => {
    const {
      nickname,
      password,
    } = req.body;

    const errors = {};
    if (!nickname) {
      errors.nickname = "Can't be blank";
    } else {
      const uniq = users.find(user => user.nickname === nickname) === undefined;
      if (!uniq) {
        errors.nickname = 'Already exist';
      }
    }

    if (!password) {
      errors.password = "Can't be blank";
    }

    if (Object.keys(errors).length === 0) {
      const user = new User(nickname, encrypt(password));
      users.push(user);
      res.flash('info', `Welcome, ${user.nickname}!`);
      res.redirect('/');
      return;
    }

    res.status(422);
    res.render('users/new', {
      form: req.body,
      errors,
    });
  });

  app.get('/session/new', (req, res) => {
    res.render('session/new', {
      form: {},
    });
  });

  app.post('/session', (req, res) => {
    const {
      nickname,
      password,
    } = req.body;
    const user = users.find(nUser => nUser.nickname === nickname);
    if (user && user.passwordDigest === encrypt(password)) {
      req.session.nickname = user.nickname;
      res.flash('info', `Welcome, ${user.nickname}!`);
      res.redirect('/');
      return;
    }
    res.status(422);
    res.render('session/new', {
      form: req.body,
      error: 'Invalid nickname or password',
    });
  });

  app.delete('/session', (req, res) => {
    delete req.session.nickname;
    res.flash('info', `Good bye, ${res.locals.currentUser.nickname}`);
    res.redirect('/');
  });

  return app;
};
