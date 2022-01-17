const express = require("express");
const { MongoClient, ObjectId } = require("mongodb");
const cors = require("cors");
require("dotenv").config();
const app = express();
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");
app.use(express.json());
app.use(cors());

var serviceAccount = require("./restore-repaier-service-firebase-adminsdk-mlk80-e47e2cc8c7.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://restore-repaier-service.firebaseio.com",
});

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
  const reviewCollection = client.db(process.env.DB_NAME).collection("review");
  const adminCollection = client.db(process.env.DB_NAME).collection("admin");

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

  // GET Booking by auth
  app.get("/bookings", (req, res) => {
    const email = req.query.email;
    const bearer = req.headers.authorization;

    console.log(email);
    if (bearer && bearer.startsWith("Bearer ")) {
      const idToken = bearer.split(" ")[1];
      // getAuth()
      admin
        .auth()
        .verifyIdToken(idToken)
        .then((decodedToken) => {
          const tokenEmail = decodedToken.email;
          console.log("tokenEmail", tokenEmail);
          if (tokenEmail === req.query.email) {
            bookingCollection
              .find({ email: email })
              .toArray((err, documents) => {
                res.send(documents);
              });
          }
        })
        .catch((error) => {
          console.log(error);
        });
    }
  });

  // GET ALL BOOking

  app.get("/allBookings", (req, res) => {
    bookingCollection.find({}).toArray((err, document) => {
      res.send(document);
    });
  });

  // PATCH booking
  app.patch("/bookStatus/:id", (req, res) => {
    const bookingId = req.params.id;
    const updateObject = req.body;
    bookingCollection
      .updateOne({ _id: new ObjectId(bookingId) }, { $set: updateObject })
      .then((result) => {
        res.send(result);
        console.log(result);
      });
  });

  //Delete Booking
  app.delete("/deleteBooking/:id", (req, res) => {
    const bookingId = req.params.id;
    console.log("bookingId", bookingId);
    bookingCollection.deleteOne({ _id: ObjectId(bookingId) });
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

  // [ADMIN COLLECTION]

  // POST  ADMIN
  app.post("/admin", (req, res) => {
    adminCollection.insertOne(req.body).then((result) => {
      res.send(result);
    });
  });

  //  GET ADMIN
  app.get("/allAdmin", (req, res) => {
    adminCollection.find({}).toArray((err, document) => {
      res.send(document);
    });
  });

  // DELETE ADMIN
  app.delete("/deleteAdmin/:id", (req, res) => {
    const adminId = req.params.id;
    console.log("adminId", adminId);
    adminCollection.deleteOne({ _id: ObjectId(adminId) });
  });

  //IS ADMIN

  app.get("/checkAdmin/:email", async (req, res) => {
    const email = req.params.email;
    const query = { email: email };
    const user = await adminCollection.findOne(query);
    let isAdmin = false;
    if (user?.role === "admin") {
      isAdmin = true;
    }
    res.json({ admin: isAdmin });
  });
});

app.post("/send_mail", cors(), async (req, res) => {
  let serviceInfo = req.body;
  const transport = nodemailer.createTransport({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    auth: {
      user: process.env.DB_EMAIL_USER,
      pass: process.env.DB_EMAIL_PASS,
    },
  });


  await transport.sendMail({
    from:`${serviceInfo.email}`,
    to: "abdullahalnoman1512@gmail.com",
    subject: "REPAIR SERVICE BOOKING",
    html: `
    <div style="border:2px solid #ddd">
    <h1 style="color:blue;text-align:center;">Booking Details</h1>
    <h4>${serviceInfo.serviceName}</h4>
    <p>Phone:${serviceInfo.phone}</p>
    <p>Gender:${serviceInfo.Gender}<p/>
    <p>Booking Date:${serviceInfo.bookingDate}</p>
    </div>
    `,
  });
});

app.listen(process.env.PORT || 5000);
