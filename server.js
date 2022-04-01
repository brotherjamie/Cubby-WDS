if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
  }
const express = require('express')
const mongoose = require('mongoose')
const Blog = require('./models/blogmodel')
const User = require('./models/usermodel')
const blogRouter  = require('./routes/blogroute')
const methodOverride = require('method-override')
const app = express()
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')

const initializePassport = require('./passport-config')
initializePassport(
  passport,
  email => users.find(user => user.email === email),
  id => users.find(user => user.id === id)
)

const users = []

// mongoose.connect('mongodb+srv://Jamie:sable7@cubbyblog.am3l2.mongodb.net/cubbyblog?retryWrites=true&w=majority')
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true })
const db = mongoose.connection
db.on('error', error => console.error(error))
db.once('open', () => console.log('Connected to Mongoose'))

app.set('view engine', 'ejs')
app.use(express.static('public'))
app.use('/blog-admin', express.static(__dirname + '/public'))
app.use('/blog-admin/edit', express.static(__dirname + '/public'))
app.use('/blog-admin/create', express.static(__dirname + '/public'))
app.use(methodOverride('_method'))
app.use(express.urlencoded({ limit: '10mb', extended: false }))

app.use(flash())
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())

app.get('/', async (req, res) => {
    const blogs = await Blog.find().sort({ createdAt: 'desc' })
    res.render('index', { title: 'Home', blogs: blogs, latestBlog: blogs[0] })
})

app.get('/kithunting', (req, res) => {
    res.render('kithunting', { title: 'Kit Hunting Service' });
})

app.get('/blog', async (req, res) => {
    const blogs = await Blog.find().sort({ createdAt: 'desc' })
    res.render('blogpages/blog', { title: 'Blog', blogs: blogs })
})

app.get('/blog-admin', checkAuthenticated, async (req, res) => {
    const blogs = await Blog.find().sort({ createdAt: 'desc' })
    res.render('blogpages/blog-admin', { title: 'Blog Admin', blogs: blogs, name: req.user.name })
})

app.get('/contact', (req, res) => {
    res.render('contact', { title: 'Contact Us' });
})
  
app.get('/hobbytips', (req, res) => {
    res.render('hobbytips', { title: 'Hobby Tips' });
})
  
app.get('/gallery', (req, res) => {
    res.render('gallery', { title: 'Gallery' });
})
  
app.get('/about', (req, res) => {
    res.render('about', { title: 'About' });
})
  
app.delete('/logout', (req, res) => {
    req.logOut()
    res.redirect('/blog-admin/login')
  })

  function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return next()
    }
  
    res.redirect('/blog-admin/login')
  }
  
  function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
      return res.redirect('/blog-admin')
    }
    next()
  }

//redirects
app.get('/blog/contact', (req, res) => {
    res.redirect('/contact');
})

app.get('/blog-admin/edit/contact', (req, res) => {
    res.redirect('/contact');
})

app.get('/blog-admin/create/contact', (req, res) => {
    res.redirect('/contact');
})

app.get('/blog-admin/contact', (req, res) => {
    res.redirect('/contact');
})

app.use('/blog-admin', blogRouter)

app.listen(process.env.PORT || 5000)