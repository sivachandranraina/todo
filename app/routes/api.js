var user = require('../modules/user');
var story = require('../modules/todo');
var config = require('../../config');
var sKey = config.sKey;
var webtoken = require('jsonwebtoken');

function createToken(user) {
    var token = webtoken.sign({
        id: user._id,
        name: user.name,
        username: user.username
    }, sKey);
    return token;
}

module.exports = function(app, express) {
    var api = express.Router();
    api.post('/signup', function(req, res) {
        var userSave = new user({
            name: req.body.name,
            username: req.body.username,
            password: req.body.password
        });
        userSave.save(function(err) {
            if (err) {
                res.send(err);
                return;
            }
            res.json({
                success: true,
                message: 'User Created Successfully'
            });
        })
    });
    api.post('/login', function(req, res) {
        user.findOne({
            username: req.body.username,
        }).select('name password').exec(function(err, user) {
            if (!user) {
                res.json({
                    success: false,
                    message: "User not available"
                });
            } else if (user) {
                var valid = user.comparePassword(req.body.password);
                if (!valid) {
                    res.json({
                        success: false,
                        message: "Incorrect password"
                    });
                } else {
                    var token = createToken(user);
                    res.json({
                        success: true,
                        message: "Access granted",
                        token: token,
                        Data: user
                    });
                }
            }
        });
    });

    api.use(function(req, res, next) {
        console.log("Authenticating");
        var token = req.body.token || req.param('token') || req.headers['x-access-token'];
        if (token) {
            webtoken.verify(token, sKey, function(err, decoded) {
                if (err) {
                    res.status(403).send({ success: false, message: "Not a valid user" });
                } else {
                    req.decoded = decoded;
                    next();
                }
            });
        } else {
            res.status(403).send({ success: false, message: "Token not available" });
        }
    });

    api.route('/')
        .post(function(req, res) {
            var storySave = new story({
                creator: req.decoded.id,
                content: req.body.content
            });
            storySave.save(function(err) {
                if (err) {
                    res.send(err);
                }
                res.json({ success: true });
            });
        })
        .get(function(req, res) {
            story.find({ creator: req.decoded.id }, function(err, stories) {
                res.json(stories);
            })
        });

    api.get('/stories', function(req, res) {
        var data;
        story.find().populate('creator').exec(function(err, users) {
            data = users.map(function(user) {
                return user;
            });
            res.json(data);
        });
    });

    api.get('/me', function(req, res) {
        res.json(req.decoded);
    });

    api.post('/update', function(req, res) {
        var condition = { _id: req.body._id };
        story.update(condition, { content: req.body.content, completed: req.body.completed }, function(err, story) {
            if (err) {
                res.send(err);
            }
            res.json({ success: true });
        })
    });

    api.post('/delete', function(req, res) {
        var condition = { _id: req.body._id };
        story.remove(condition, function(err, story) {
            if (err) {
                res.send(err);
            }
            res.json({ success: true });
        })
    });

    api.get('/users', function(req, res) {
        user.find({}, function(err, result){
            res.json(result);
        })
    });

    return api;
}
