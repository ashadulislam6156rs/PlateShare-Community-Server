const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 3000;

uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ojq4cou.mongodb.net/?appName=Cluster0`;

//middelware
app.use(cors());
app.use(express.json());

//main api
app.get("/", (req, res) => {
    res.send("PlateShare Server is Running....");
})


// MongoDB Cliend
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
   
      await client.connect();
      const db = client.db("PlateShare_DB");
      const foodsCollection = db.collection("Foods");
      const userCollection = db.collection("Users")

      //users get method
      app.get("/users", async (req, res) => {
          const result = await userCollection.find().toArray();
          res.send(result);
      })

       //users get method
      app.post("/user", async (req, res) => {
          const newUser = req.body;
          const result = await userCollection.insertOne(newUser);
          res.send(result);
      })



      //Foods Get Method
      app.get("/foods", async (req, res) => {
          const result = await foodsCollection.find().toArray();
          res.send(result);
      })

      //Feature Foods Get Method 
      app.get("/feature-foods", async (req, res) => {
          const foods = await foodsCollection.find().toArray();
          const result = foods.map((food) => ({ ...food, numericQuantity: parseInt(food.quantity.match(/\d+/)) || 0 })).sort((a, b) => b.numericQuantity - a.numericQuantity).slice(0, 6);
          res.send(result);
      })

      //Available Foods Get Method 
      app.get("/available-foods", async (req, res) => {
          const query = {status: "Available"}
          const result = await foodsCollection.find(query).toArray();
          res.send(result);
      })

      //FoodDetails Get Method 
      app.get("/food/foodDetails/:id", async (req, res) => {
          const id = req.params.id;
          const query = {_id: new ObjectId(id)}
          const result = await foodsCollection.findOne(query)
          res.send(result);
      })

       // Update-food Patch Method 
      app.patch("/update-food/:id", async (req, res) => {
          const id = req.params.id;
          const updateData = req.body;
          const query = { _id: new ObjectId(id) }
          const update = {
              $set: {
                  foodName: updateData.foodName,
                  foodImage: updateData.foodImage,
                  quantity: updateData.quantity,
                  expireDate: updateData.expireDate,
                  pickupTimeWindow: updateData.pickupTimeWindow,
                  pickupLocation: updateData.pickupLocation,
                  status: updateData.status,
              }
          }
          const result = await foodsCollection.updateOne(query,update)
          res.send(result);
      })


      //Foods Post Method
      app.post("/foods", async (req, res) => {
          const newFood = req.body;
          const result = await foodsCollection.insertOne(newFood)
          res.send(result);
          
      })

    
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
  }
}
run().catch(console.dir);



//listen api
app.listen(port, () => {
    console.log(`PlateShare Server is Running Port: ${port}`);
    
})

