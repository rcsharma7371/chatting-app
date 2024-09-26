const mysql = require("mysql2");
const { randomUUID } = require('crypto');
const express = require('express');
const { url } = require('inspector');
const app = express();
const port = 8080;

const path = require("path");
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));

const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    database: "whatsapp",
    password: "Ranjeet@7371"
});

//Home route
app.get('/', (req, res) => {
    let urlId = randomUUID();
    res.render("index.ejs", { urlId });
});

//Personal page route
app.get('/chat/:id', (req, res) => {
    let { id } = req.params;
    console.log(id);
    let testQuery = `SELECT * FROM page WHERE urlid="${id}"`;
    try {
        connection.query(testQuery, (er, reslt) => {
            let response = reslt;
            // console.log(reslt.length);
            if (response.length != 0) {
                res.render("chat.ejs", { id });
            }
            else {
                let q = `INSERT INTO page (urlid) VALUES ('${id}')`;
                try {
                    connection.query(q, (err, result) => {
                        if (err) throw err;
                        res.render("chatdumy.ejs", { id });

                    })


                } catch (error) {
                    console.log(error);
                    console.log("something went wrong! Try after some time");
                }
            }
        });
    } catch (error) {
        console.log(error);
    }

});

//Print message on page route
// app.post("/chat/:id", (req, res) => {
//     let { id } = req.params;
//     let messageId = randomUUID();
//     let { message } = req.body;
//     // let q = `INSERT INTO user (id,message)`;
//     let q = `INSERT INTO message (id,content,urlid) VALUES ("${messageId}","${message}","${id}")`;
//     try {
//         connection.query(q, (err, result) => {
//             if (err) throw err;
//             let q2 = `SELECT * FROM message WHERE urlid="${id}" ORDER BY new_datetime ASC`;
//             connection.query(q2, (error, data) => {
//                 let users = data;
//                 console.log(data);
//                 res.redirect({id : id,users : users},"chat.ejs");
//                 console.log("user data ", users);

//             });
//         })

//     } catch (error) {
//         console.log(error);
//         console.log("something went wrong! Try after some time");
//     }

// });

app.post("/chat/:id", (req, res) => {
    try{
    let { id } = req.params;
    let messageId = randomUUID();
    let { message } = req.body;

    // Parameterized query to prevent SQL injection
    let q = `INSERT INTO message (id, content, urlid) VALUES (?, ?, ?)`;
    connection.query(q, [messageId, message, id], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).send("Internal server error");
        }

        let q2 = `SELECT * FROM message WHERE urlid = ? ORDER BY new_datetime ASC`;
        connection.query(q2, [id], (error, data) => {
            if (error) {
                console.error(error);
                return res.status(500).send("Internal server error");
            }

            // Pass the data to the 'chat.ejs' view
            // let users = 
            console.log(data)
            res.render('chat.ejs', {
                id: id,
                data: data
            });
        });
    });
} catch(error){
    console.log(error)
    res.status(400).send("Bad Request")
}
});



app.listen(port, () => console.log(`Example app listening on port ${port}!`))