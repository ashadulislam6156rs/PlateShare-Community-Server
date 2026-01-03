const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');

const app = express();
const port = process.env.PORT || 3000;

uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ojq4cou.mongodb.net/?appName=Cluster0`;

//middleware
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
   
    //   await client.connect();
      const db = client.db("PlateShare_DB");
      const foodsCollection = db.collection("Foods");
      const usersCollection = db.collection("Users");
      const foodRequestCollection = db.collection("FoodRequest");

    
    // =======> user related Api's

     app.post("/users", async (req, res) => {
      const newUser = req.body;
      const email = req.body.email;
      const isExist = await usersCollection.findOne({ email });

      if (isExist) {
        return res.send({ message: "User Alredy Exist!" });
      } 
       newUser.createdAt = new Date();
       newUser.userRole = "User";
        const result = await usersCollection.insertOne(newUser);
        res.send({ message: "User added successfully", insertedId: result.insertedId });
      
    })


    app.get("/users", async (req, res) => {
    const result = await usersCollection.find().sort({createdAt: -1}).toArray();
    return res.send(result); 
      
    })
     

       //Food request Post method
      app.post("/foodRequest", async (req, res) => {
          const newFoodRequest = req.body;
          const result = await foodRequestCollection.insertOne(newFoodRequest);
          res.send(result);
      })

       //Food request get method
      app.get("/foodRequest", async (req, res) => {
          const result = await foodRequestCollection.find().toArray();
          res.send(result);
      })

    //   Spacific Food All request get method
      app.get("/foodRequest/:id", async (req, res) => {
          const id = req.params.id;
          const query = { foodId: id }
          const result = await foodRequestCollection.find(query).toArray();
          res.send(result)
      })

   

      //spacific user Food reguest get method
      app.get("/myfoodRequest", async (req, res) => {
          const email = req.query.email;
          const query = {}
          if (email) {
              query.userEmail = email;
          }
          const result = await foodRequestCollection.find(query).toArray();
          res.send(result)
          
      })


       //Foods statusUpdate patch Method
      app.patch("/foods/statusUpdate/:id", async (req, res) => {
          const id = req.params.id;
          const updateData = req.body;
          const query = { _id: new ObjectId(id) };
          const updateProperty = {
              $set: {
                status: updateData.status
              }
          }
           const result = await foodsCollection.updateOne(query,updateProperty)
          res.send(result);
      })

    //   foodRequest statusUpdate patch Method
      app.patch("/foodRequest/statusUpdate/:id", async (req, res) => {
           const id = req.params.id;
          const updateData = req.body;
          const query = { _id: new ObjectId(id) };
          const updateProperty = {
              $set: {
                status: updateData.status
              }
          }
           const result = await foodRequestCollection.updateOne(query,updateProperty)
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

      //ManageMyFoods get method
      app.get("/manageMyFoods", async (req, res) => {
          const email = req.query.email;
          const query = {}
          if (email) {
              query["provider.email"] = email
          }
          const result = await foodsCollection.find(query).toArray();
          res.send(result)
          
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
                  description: updateData.description,
                  cookedTime: updateData.cookedTime,
                  locationType: updateData.locationType,
                  packagingType: updateData.packagingType,
                  "provider.name": updateData.provider?.name,
                  "provider.provider_image": updateData.provider?.provider_image,
              }
          }
          const result = await foodsCollection.updateOne(query,update)
          res.send(result);
      })


      // myFoods Delete Method
      app.delete("/deleteMyFood/:id", async (req, res) => {
          const id = req.params.id;
          const query = { _id: new ObjectId(id) }
          const result = await foodsCollection.deleteOne(query);
          res.send(result);
      })

       // Update-food get Method 
      app.get("/update-food/:id", async (req, res) => {
  const id = req.params.id;
  const query = { _id: new ObjectId(id) };
  const result = await foodsCollection.findOne(query);
  res.send(result);
});



      //Foods Post Method
      app.post("/foods", async (req, res) => {
          const newFood = req.body;
          const result = await foodsCollection.insertOne(newFood)
          res.send(result);
          
      })

       

      

    
    // await client.db("admin").command({ ping: 1 });
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

