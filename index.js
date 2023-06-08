const express=require('express');
const app=express();
const cors=require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config();
const port=process.env.Port || 5000;

// middleware
app.use(cors());
app.use(express.json());

const verifyJWT=(req,res,next)=>{
  const authorization= req.headers.authorization;
  if(!authorization){
    return res.status(401).send({error:true, message: 'unauthorized access'});
  }
  const token= authorization.split(' ')[1];

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET,(err,decoded)=>{
    if(err){
      return res.status(401).send({error: true, message: 'unauthorized access'})
    }
    req.decoded=decoded;
    next();

  })

}


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.fus4ier.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const usersCollection=client.db('musicSchoolDB').collection('Users');


    app.post('/jwt',(req,res)=>{
      const user=req.body;
      const token=jwt.sign(user,process.env.ACCESS_TOKEN_SECRET,{expiresIn: '2h'})

      res.send({token})
    })


    // verify admin middle ware

    const verifyAdmin= async(req,res,next)=>{
      const email=req.decoded.email;
      const query={email: email}
      const user= await usersCollection.findOne(query);
      if(user?.role !== 'admin'){
        return res.status(403).send({ error: true, message: 'forbidden message' });
      }
      next();
    }

    // user related api
    app.post('/users',async(req,res)=>{
      const user=req.body;
      const query={email: user.email}
      const existingUser=await usersCollection.findOne(query);
      if(existingUser){
        return res.send({message: 'user already exists'});
      }
      const result= await usersCollection.insertOne(user);
      res.send(result);
      console.log(user);
    })




    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/',(req,res)=>{
    res.send('Music school is coming');
})
app.listen(port,()=>{
    console.log(`Music school is coming on port ${port}`);
})