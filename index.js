const express=require('express');
const app=express();
const cors=require('cors');
const port=process.env.Port || 5000;

// middleware
app.use(cors());
app.use(express.json());

app.get('/',(req,res)=>{
    res.send('Music school is coming');
})
app.listen(port,()=>{
    console.log(`Music school is coming on port ${port}`);
})