const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const cors = require("cors");
require("dotenv").config();
const app = express();

app.use(express.json());
app.use(cors());

const uri = `mongodb+srv://${process.env.BD_USER}:${process.env.DBA_PASS}@cluster0.ez7qy.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

client.connect((err) => {
  const serviceCollection = client
    .db(process.env.DB_NAME)
    .collection("product");
  const bookingCollection = client
    .db(process.env.DB_NAME)
    .collection("booking");
    const reviewCollection = client
    .db(process.env.DB_NAME)
    .collection("review");

  // [ SERVICES COLLECTION] //

  //POST service
  app.post("/service", (req, res) => {
    const product = req.body;
    const products = serviceCollection.insertOne(product);
    products.then((result) => {
      res.send(result);
    });
  });

  //GET service
  app.get("/services", (req, res) => {
    const products = serviceCollection.find({});
    products.toArray((err, document) => {
      res.send(document);
    });
  });

  //DELETE service
  app.delete("/delete/:id", (req, res) => {
    const serviceId = req.params.id;
    serviceCollection.deleteOne({ _id: ObjectId(serviceId) });
  });

  //PATCH service
  app.patch("/service/:id", (req, res) => {
    const serviceId = req.params.id;
    const updateObject = req.body;
    serviceCollection
      .updateOne({ _id: new ObjectId(serviceId) }, { $set: updateObject })
      .then((result) => {
        res.send(result);
      });
  });

  // [ BOOKING COLLECTION] //

  //POST BOOKING
  app.post("/booking", (req, res) => {
    const book = req.body;
    bookingCollection.insertOne(book).then((result) => {
      res.send(result);
    });
  });

  // [ REVIEW COLLECTION] //

  //POST Review
  app.post("/review", (req, res) => {
    const review = req.body;
    reviewCollection.insertOne(review).then((result) => {
      res.send(result);
    });
  });

  //GET Review
  app.get("/reviews", (req, res) => {
    const products = reviewCollection.find({});
    products.toArray((err, document) => {
      res.send(document);
    });
  });

    

});

app.get("/", async (req, res) => {
  await res.send("Hello BANGLADESH");
});

app.listen(process.env.port || 5000);
