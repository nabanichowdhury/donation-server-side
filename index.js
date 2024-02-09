const express = require("express");
const cors = require("cors");
const app = express();
app.use(express.json());
app.use(cors());
const port = 8000;

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri =
  "mongodb+srv://dbadmin:q32S6qhXnlkKtLM5@cluster0.vdcw4ws.mongodb.net/?retryWrites=true&w=majority";
// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function run() {
  try {
    await client.connect();
    console.log("Connected to MongoDB");

    const database = client.db("donation_database");
    const usersCollection = database.collection("users");
    const donationsCollection = database.collection("donations");

    app.get("/donations", async (req, res) => {
      const donations = await donationsCollection.find({}).toArray();
      res.json(donations);
    });
    app.get("/user/:email", async (req, res) => {
      const email = req.params.email;
      console.log(email);
      const user = await usersCollection.findOne({ email: email });
      res.json(user);
    });
    app.get("/donation/:id", async (req, res) => {
      const id = new ObjectId(req.params.id);

      const donation = await donationsCollection.findOne({ _id: id });
      console.log(donation);
      res.json(donation);
    });
    app.get("/create-donation", async (req, res) => {
      const newDonation = req.body.donation;
      const user = req.body.user;
      if (user.role == "admin") {
        const result = await donationsCollection.insertOne(newDonation);
        res.json({
          success: true,
          message: "Donation created successfully",
          data: result,
        });
      } else {
        res.send({
          success: false,
          message: "You are not authorized to create a donation",
        });
      }
    });
    app.put("/update-donation/:id", async (req, res) => {
      const id = req.params.id;
      const updatedDonation = req.body;
      if (updatedDonation.user == "admin") {
        const result = await donationsCollection.updateOne(
          { _id: id },
          { $set: updatedDonation }
        );
        res.json({
          success: true,
          message: "Donation updated successfully",
          data: result,
        });
      } else {
        res.send({
          success: false,
          message: "You are not authorized to update a donation",
        });
      }
    });
    app.delete("/delete-donation/:id", async (req, res) => {
      const id = new ObjectId(req.params.id);
      const user = req.body;
      console.log(user);
      console.log(id);
      if (user.role == "admin") {
        const result = await donationsCollection.deleteOne({ _id: id });
        console.log(result);
        res.json({
          success: true,
          message: "Donation deleted successfully",
          data: result,
        });
      } else {
        res.send({
          success: false,
          message: "You are not authorized to delete a donation",
        });
      }
    });
    app.post("/createAdmin", async (req, res) => {
      const newAdmin = req.body;
      const result = await usersCollection.insertOne(newAdmin);
      res.json({
        success: true,
        message: "Admin created successfully",
        data: result,
      });
    });
    app.post("/createUser", async (req, res) => {
      const newUser = req.body;
      const result = await usersCollection.insertOne(newUser);
      res.json({
        success: true,
        message: "User created successfully",
        data: result,
      });
    });
    app.put("/donate/:id", async (req, res) => {
      const user = req.body;
      const donationId = new ObjectId(req.params.id);

      const result = await donationsCollection.updateOne(
        { _id: donationId },
        { $push: { donatedUser: user } }
      );

      res.json({
        success: true,
        message: "U have donated successfully",
        data: result,
      });
    });
    app.get("/donationByUser/:user", async (req, res) => {
      const userId = req.params.user;
      const donations = await donationsCollection
        .find({ donatedUser: { $elemMatch: { userId: userId } } })
        .toArray();
      res.json(donations);
    });
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
  } finally {
  }
}
run().catch(console.dir);
app.get("/", (req, res) => {
  res.send("Donation Database connected");
});
// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
