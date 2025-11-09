const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 3000;

uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ojq4cou.mongodb.net/?appName=Cluster0`

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
      const foodsCollection = db.collection("Foods")

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

      //Feature Foods Get Method 
      app.get("/feature-foods", async (req, res) => {
          const foods = await foodsCollection.find().toArray();
          const result = foods.map((food) => ({ ...food, numericQuantity: parseInt(food.quantity.match(/\d+/)) || 0 })).sort((a, b) => b.numericQuantity - a.numericQuantity).slice(0, 6);
          
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

