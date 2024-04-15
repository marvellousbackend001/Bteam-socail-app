const express = require("express");
const cors = require("cors");
const bodyparser = require("body-parser");
const mysql = require("mysql");
const bodyParser = require("body-parser");
const otpGenerator = require("otp-generator");
const nodemailer = require("nodemailer");
const passport = require("passport");
const app = express();
app.use(cors());
/**********************connecting my Database cred************* */
const con = mysql.createConnection({
    host: "srv1107.hstgr.io",
    user: "u532672005_marvelous",
    password: "Marvelous12344",
    database: "u532672005_marvelousBE",
    port: "3306",
});
//creating an endpoint for signup
app.post("/signup", bodyparser.json(), function (req, res) {
    var sql = `INSERT INTO users(Firstname,Lastname,Dateofbirth,EmailAddress,Pass)
     VALUES('${req.body.Firstname}','${req.body.Lastname}','${req.body.Dateofbirth}','${req.body.EmailAddress}','${req.body.Pass}')`;
    con.query(sql, function (err, result) {
        if (err) throw err
        res.send(result);
    });
});
// Nodemailer transporter setup
app.use(bodyParser.urlencoded
    ({ extended: true }));
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'kennedymarvellous001@gmail.com',
        pass: 'zceb znrq ajzh wszq'
    }
});
// creating an endpoint for sending an otp (one time password),
app.post("/send-otps", bodyParser.json(), (req, res) => {
    const email = req.body.email;
    const otp = otpGenerator.generate(6);
    const now = new Date();
    const expirationTime = new Date(now.getTime() + 6 * 60000);
    const sql = `INSERT INTO otps (email, otp, expiration_time) VALUES (?, ?, ?)`;
    con.query(sql, [email, otp, expirationTime], function (err, res) {
        if (err) throw err
        const mailOptions = {
            from: "kennedymarvellous001@gmail.com",
            to: email,
            subject: "Your OTP for Verification",
            text: `Your OTP (One-Time Password) for verification is: ${otp}. It will expire at ${expirationTime}.`
        };
        transporter.sendMail(mailOptions, function (err, result) {
            if (err) throw err
            res.send({ result, otp });
        })
    })
});
//creating an endpoint for login
app.get("/login", bodyparser.json(), function (req, res) {
    var sql = `SELECT * FROM users
    WHERE EmailAddress ='${req.body.EmailAddress}'
     AND Pass ='${req.body.Pass}' `;
    con.query(sql, function (err, result) {
        if (err) throw err
        res.status(result);
    });
})
//creating an endpoint for getuser ID
app.get("/getuser/id", bodyParser.json(), function (req, res) {
    const sql = `SELECT id FROM users`
    con.query(sql, function (err, result) {
        if (err) throw err
        res.send(result);
    });
});
//creating a post endpoint for creating  new posts
app.post("/createpost/:id", bodyParser.json(), function (req, res) {
    const postid = req.params.id;
    const { title, content } = req.body
    const sql = `INSERT INTO posts (id, title, content) VALUES ('${postid}','${title}','${content}')`;
    con.query(sql, [postid, title, content], function (err, result) {
        if (err) throw err
        res.send(result);
    });
});
// Endpoint for updating a post by ID
app.put("/updatepost/:id", bodyParser.json(), function (req, res) {
    const postid = req.params.id;
    const { title, content } = req.body;
    const sql = `UPDATE posts SET title = '${title}', content = '${content}' WHERE id = '${postid}'`;
    con.query(sql, [title, content, postid], function (err, result) {
        if (err) throw err
        res.send(result);
    });
});
// Endpoint for deleting a post by ID
app.delete("/deletepost/:id", bodyParser.json(), function (req, res) {
    const postid = req.params.id;
    const sql = `DELETE FROM posts WHERE id = '${postid}'`;
    con.query(sql, function (err, result) {
        if (err) throw err
        res.send(result);
    });
});
// endpoint for commenting on a post
app.post('/posts/:post_id/comments', bodyParser.json(), function (req, res) {
    const post_id = req.params.post_id;
    const { content } = req.body;
    const sql = `INSERT INTO comments (post_id, content) 
    VALUES (?, ?)`;
    con.query(sql, [post_id, content], function (err, result) {
        if (err) throw err
        res.send(result);
    });
});
//endpoint for liking posts
app.post('/posts/:post_id/like', bodyParser.json(), function (req, res) {
    const post_id = req.params.post_id;
    const user_id = req.body.user_id;
    const sql = `INSERT INTO post_likes (post_id, user_id)
     VALUES ('${post_id}', '${user_id}')`
    con.query(sql, [post_id, user_id], function (err, result) {
        if (err) throw err
        res.send(result);
    });
});
//creating an endpoint for getting total like count 
app.get('/posts/:post_id/like/count', bodyParser.json(), function (req, res) {
    const post_id = req.params.post_id;
    const sql = `SELECT COUNT (*) AS like_count FROM post_likes WHERE post_id = '${post_id}'`;
    con.query(sql, [post_id], function (err, result) {
        if (err) throw err
        res.send(result);
    });
});
//creating an endpoint for getting total comment count
app.get('/TotalCommentCount/:postId', bodyParser.json(), function (req, res) {
    var post_id = req.params.post_id;
    var sql = 'SELECT COUNT(*) as totalComments FROM comments WHERE post_id = ?';
    con.query(sql, [post_id], function (err, result) {
        if (err) throw err;
        res.send(result);
    });
});
//endpoint for sending messages
app.post("/messages/send", bodyParser.json(), function (req, res) {
    const post_id = req.params.post_id;
    const { sender_id, receiver_id, message } = req.body;
    const sql = `INSERT INTO messages (sender_id, receiver_id, message) VALUES ('${sender_id}',
    '${receiver_id}',
    '${message}')`;
    con.query(sql, [sender_id, receiver_id, message], function (err, result) {
        if (err) throw err;
        res.send(result);
    });
})
// providing an endpoint for retrieving chats between two users
app.get('/get-messages/:sender_id/:receiver_id', bodyParser.json(), function (req, res) {
    const sender_id = req.params.sender_id;
    const receiver_id = req.params.receiver_id;
    const sql = `SELECT * FROM messages WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?) ORDER BY timestamp`;
    con.query(sql, [sender_id, receiver_id, receiver_id, sender_id], function (err, result) {
        if (err) throw err;
        res.send(result);
    });
})
// providing an endpoint for getting  both the like count and the comment count
app.get("/posts/:post_id/counts", bodyParser.json(), function (req, res) {
    const post_id = req.params.post_id;
    const sql = ` SELECT (SELECT COUNT(*) FROM post_likes WHERE post_id = ?) AS like_count,
            (SELECT COUNT(*) FROM comments WHERE post_id = ?) AS comment_count`;
    con.query(sql, [post_id, post_id], function (err, result) {
        if (err) throw err;
        res.send(result);
    })
});
//using JOIN method to provide  an endpoint for getting  both the like count and the comment count
app.get("/posts/:post_id/like,comment/count", bodyParser.json(), function (req, res) {
    const post_id = req.params.post_id;
    const sql = `
        SELECT 
            COUNT(DISTINCT post_likes.user_id) AS like_count,
            COUNT(DISTINCT comments.id) AS comment_count
        FROM 
            posts
        LEFT JOIN 
            post_likes ON posts.id = post_likes.post_id
        LEFT JOIN 
            comments ON posts.id = comments.post_id
        WHERE 
            posts.id = '${post_id}'`;
    con.query(sql, function (err, result) {
        if (err) throw err;
        res.send(result);
    });
});
app.listen(4000)
    , console.log("server is running at port 4000")

