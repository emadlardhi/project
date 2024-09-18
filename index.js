import express from "express";
import pg from "pg";
import bodyParser from "body-parser";
import env from "dotenv";

const app = express();
const port = 3000;
env.config();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// db Conection 

 const db = new pg.Client({
    user : process.env.PG_USER,
    host : process.env.PG_HOST,
    database : process.env.PG_DATABASE,
    password : process.env.PG_PASSWORD,
    port : process.env.PG_PORT
 });

 db.connect();

// Get All Book
  app.get("/books" , async (req , res) => {
        try {
            const result = await db.query("SELECT * FROM Book");
            res.send(result)
        } catch (err) {
            console.error(err.message);
        }
  });

// GET a specific Book by id 
 app.get("/books/:id" , async (req , res) => {
        try {
            const result = await db.query("SELECT * FROM Book WHERE id = $1",[req.params.id]);
            if(result.rows.length === 0 ){
                res.status(404).send({ message : "Book not found" });
            }  else {
                res.send(result.rows[0]);
            }  
        } catch (err) {
            console.error(err.message);
        }
 });

 // POST a new Book 
 app.post("/books" , async (req ,res) => {
        try {
            const result = await db.query("SELECT * FROM Book where title = $1",[req.body.title]);
            if(result.rows.length === 0) {
                await db.query("INSERT INTO Book (author_id,lang,supplier,price,publish_year,publisher,title,description,image) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)",
                    [req.body.author_id,req.body.lang,req.body.supplier,req.body.price,req.body.publish_year,req.body.publisher,req.body.title,req.body.description,req.body.image]
                );
                res.send({ message : "Book created" });
            } else {
                res.status(400).send({ message : "Book already exists" });
            }
        } catch (err) {
            console.error(err.message);
        }
 });

 // PATCH a Book when you just want to update

  app.patch("/books/:id" , async (req , res) => {
        try {
            await db.query("UPDATE Book SET author_id = ($1),lang = $2,supplier = $3,price = $4,publish_year = $5,publisher= $6,title = $7,description = $8,image =$9 WHERE id = $10",
                [req.body.author_id,req.body.lang,req.body.supplier,req.body.price,req.body.publish_year,req.body.publisher,req.body.title,req.body.description,req.body.image,req.params.id]
            );
            res.send({ message : "Book Ubdated" });
        } catch (err) {
            console.error(err.message);
        }
  });

  // delete Book 

  app.delete("/books/:id" , async (req , res) => {
        try {
            await db.query("delete from Book where id = $1",[req.params.id]);
        } catch (err) {
            console.error(err.message);
        }
       res.send(`Deleted Book ${req.params.id}`);
  });


app.listen(port , () => {
    console.log(`API is running at http://localhost:${port}`);
});