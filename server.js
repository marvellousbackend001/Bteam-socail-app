const express = require("express");
const cors = require("cors");
const bodyparser = require("body-parser");
const mysql = require("mysql");
const bodyParser = require("body-parser");

const app = express();
app.use(cors());
/**********************connecting my Database cred************* */
const con = mysql.createConnection({
    host: "srv1107.hstgr.io",
    user: "u532672005_marvelous",
    password: "Marvelous12344",
    database: "u532672005_marvelousBE",
    port: "3306",
})

//creating an endpoint for signup
app.post("/signup", bodyparser.json(), function (req, res) {
    var sql = `INSERT INTO users(Firstname,Lastname,Dateofbirth,EmailAddress,Pass)
     VALUES('${req.body.Firstname}','${req.body.Lastname}','${req.body.Dateofbirth}','${req.body.EmailAddress}','${req.body.Pass}')`;
    con.query(sql, function (err, result) {
        if (err) throw err
        res.send(result);
    });
});
//creating an endpoint for login
app.get("/login", bodyparser.json(), function (req, res) {
    var sql = `SELECT * FROM users
    WHERE EmailAddress ='${req.body.EmailAddress}' AND Pass ='${req.body.Pass}' `
    con.query(sql, function (err, result) {
        if (err) throw err
        res.send(result);
    });
});


//creating an endpoint for getuserid
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
    const sql = `INSERT INTO posts (id, title, content) VALUES (?, ?, ?)`;
    con.query(sql, [postid, title, content], function (err, result) {
        if (err) throw err
        res.send(result);
    });
});

// Endpoint for updating a post by ID
app.put("/updatepost/:id", bodyParser.json(), function (req, res) {
    const postid = req.params.id;
    const { title, content } = req.body;
    const sql = `UPDATE posts SET title = ?, content = ? WHERE id = ?`;
    con.query(sql, [title, content, postid], function (err, result) {
        if (err) throw err
        res.send(result);
    });
});
// Endpoint for deleting a post by ID
app.delete("/deletepost/:id", function (req, res) {
    const postid = req.params.id;
    const sql = `DELETE FROM posts WHERE id = ?`;
    con.query(sql, [postid], function (err, result) {
        if (err) throw err
        res.send(result);
    });
});
// endpoint for commenting on a post
app.post('/posts/:post_id/comments', bodyParser.json(), function (req, res) {
    const post_id = req.params.post_id;
    const { content } = req.body;
    const sql = `INSERT INTO comments (post_id, content) VALUES (?, ?)`;
    con.query(sql, [post_id, content], function (err, result) {
        if (err) throw err;
        res.send(result);
    });
});
//endpoint for liking posts
app.post('/posts/:post_id/like', bodyParser.json(), function (req, res) {
    const post_id = req.params.post_id;
    const user_id = req.body.user_id;
    const sql = `INSERT INTO post_likes (post_id, user_id) VALUES (?, ?)`;
    con.query(sql, [post_id, user_id], function (err, result) {
        if (err) throw err;
        res.send(result);
    });
});

app.listen(3000), console.log("server is running at port 3000")


