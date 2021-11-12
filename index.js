const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();
const ObjectId = require("mongodb").ObjectId;
const { MongoClient } = require("mongodb");
const port = process.env.PORT || 5000;

// middle ware
app.use(cors());
app.use(express.json());

// database client connect
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.yai2s.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// console.log(uri);

async function run() {
  try {
    await client.connect();
    const database = client.db("carDB");
    const productsCollection = database.collection("products");
    const ordersCollection = database.collection("orders");
    const usersCollection = database.collection("users");
    const reviewsCollection = database.collection("reviews");

    // get all products
    app.get("/allProducts", async (req, res) => {
      const result = await productsCollection.find({}).toArray();
      res.send(result);
    });

    // get specific product for place order
    app.get("/placeOrder/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await productsCollection.findOne(query);
      res.send(result);
    });

    // insert order
    app.post("/orders", async (req, res) => {
      const body = req.body;
      const result = await ordersCollection.insertOne(body);
      res.send(result);
    });

    // save user to database
    app.post("/users", async (req, res) => {
      const body = req.body;
      const result = await usersCollection.insertOne(body);
      res.send(result);
    });

    // get my order from database order collection by email
    app.get("/orders/:email", async (req, res) => {
      const email = req.params.email;
      const filter = { email: email };
      const result = await ordersCollection.find(filter).toArray();
      res.send(result);
    });

    // get reviews
    app.get("/reviews", async (req, res) => {
      const result = await reviewsCollection.find({}).toArray();
      res.send(result);
    });

    // post review
    app.post("/reviews", async (req, res) => {
      const body = req.body;
      const result = await reviewsCollection.insertOne(body);
      res.send(result);
      // console.log(result);
    });

    // cancel customer order
    app.delete("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const result = await ordersCollection.deleteOne(filter);
      res.send(result);
      // console.log(result);
    });

    // check user admin or not
    app.get("/checkAdmin/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await usersCollection.findOne(query);
      res.send(result);
    });

    // get all orders
    app.get("/orders", async (req, res) => {
      const result = await ordersCollection.find({}).toArray();
      res.send(result);
    });

    // update order status
    app.put("/orders/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const updateDoc = {
        $set: {
          status: "Shipped",
        },
      };
      const result = await ordersCollection.updateOne(query, updateDoc);
      res.send(result);
    });


    // delete product
    app.delete('/allProducts/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await productsCollection.deleteOne(query);
      res.send(result);
    })

    // add product api
    app.post('/products', async (req, res) => {
      const body = req.body;
      const result = await productsCollection.insertOne(body);
      res.send(result);
    })

    // make admin api
    app.put('/users/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      if (query) {
        const updateDoc = {
          $set: {
            role: "admin"
          }
        }
        const result = await usersCollection.updateOne(query, updateDoc);
        res.send(result);
      }
    })

  } finally {
    // await client.close();
  }
}

run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Car Deal Server is Running...");
});

app.listen(port, (req, res) => {
  console.log("Server is running on port: ", port);
});
