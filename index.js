const express = require("express");
const cors = require("cors");
const app = express();

const port = 8000 || process.env.PORT;

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const uri =process.env.MONGODB_URI;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
app.use(cors());
app.use(express.json());

async function run() {
  try {
    const database = client.db("donation_database");
    const usersCollection = database.collection("users");
    const donationsCollection = database.collection("donations");
    const helpRequestCollection = database.collection("helpRequests");

    app.put("/update-request/:id", async (req, res) => {
      const id = new ObjectId(req.params.id);
      console.log(id);

      const result = await helpRequestCollection.updateOne(
        { _id: id },
        { $set: { hasRead: true } }
      );
      console.log(result);
      res.json({
        success: true,
        message: "Request updated successfully",
        data: result,
      });
    });

    app.delete("/delete-request/:id", async (req, res) => {
      const id = new ObjectId(req.params.id);

      const result = await helpRequestCollection.deleteOne({ _id: id });
      res.json({
        success: true,
        message: "Request deleted successfully",
        data: result,
      });
    });
    app.get("/notification", async (req, res) => {
      const helpRequests = await helpRequestCollection
        .find({ hasRead: false })
        .toArray();
      res.json(helpRequests);
    });
    app.post("/create-request", async (req, res) => {
      const helpRequest = req.body;
      const result = await helpRequestCollection.insertOne(helpRequest);
      res.json({
        success: true,
        message: "Help request created successfully",
        data: result,
      });
    });

    app.get("/donations", async (req, res) => {
      const donations = await donationsCollection.find({}).toArray();
      res.json(donations);
    });
    app.get("/user/:email", async (req, res) => {
      const email = req.params.email;

      const user = await usersCollection.findOne({ email: email });
      res.json(user);
    });
    app.get("/donation/:id", async (req, res) => {
      const id = new ObjectId(req.params.id);

      const donation = await donationsCollection.findOne({ _id: id });

      res.json(donation);
    });
    app.post("/create-donation", async (req, res) => {
      const data = req.body;
      const newDonation = data.donation;
      const user = data.user;
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
    app.put("/update-user/:id", async (req, res) => {
      const id = new ObjectId(req.params.id);
      const updatedUser = req.body;
      console.log(updatedUser);
      const result = await usersCollection.updateOne(
        { _id: id },
        { $set: updatedUser }
      );
      console.log(result);
      res.json({
        success: true,
        message: "User updated successfully",
        data: result,
      });
    });
    app.put("/update-donation/:id", async (req, res) => {
      const id = new ObjectId(req.params.id);
      const updatedDonation = req.body.donation;
      const user = req.body.user;
      console.log(user);
      if (user.role == "admin") {
        const result = await donationsCollection.updateOne(
          { _id: id },
          { $set: updatedDonation }
        );
        console.log(result);
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
      const data = req.body;
      const donationId = new ObjectId(req.params.id);
      const user = data.user;
      const donation = data.donation;
      const userId = new ObjectId(user._id);

      await usersCollection.updateOne(
        { _id: userId },
        { $push: { donations: donation } }
      );

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
