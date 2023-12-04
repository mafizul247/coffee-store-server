const express = require('express');
const cors = require('cors')
const dotenv = require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();

const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// console.log(process.env.DB_USER);
// console.log(process.env.DB_PASS);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.k95s6zq.mongodb.net/?retryWrites=true&w=majority`;

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

        const coffeeCollections = client.db('coffeeStore').collection('coffees');

        app.get('/coffees', async (req, res) => {
            const result = await coffeeCollections.find().sort({ entryDate: -1 }).toArray();
            res.send(result);
        })

        app.get('/coffees/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) };
            const result = await coffeeCollections.findOne(query);
            res.send(result);
        })

        app.post('/coffees', async (req, res) => {
            const coffee = req.body;
            // console.log(coffee);
            coffee.entryDate = new Date();
            const result = await coffeeCollections.insertOne(coffee);
            // console.log(result);
            res.send(result);
        })

        app.put('/coffees/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const coffee = req.body;
            const updateCoffee = {
                $set: {
                    coffeeName: coffee.coffeeName,
                    chef: coffee.chef,
                    supplier: coffee.supplier,
                    taste: coffee.taste,
                    category: coffee.category,
                    details: coffee.details,
                    price: coffee.price,
                    photo: coffee.photo,
                    entryDate: new Date()
                }
            }
            const result = await coffeeCollections.updateOne(filter, updateCoffee, options);
            res.send(result);
        })

        app.delete('/coffees/:id', async (req, res) => {
            const id = req.params.id;
            const filter = { _id: new ObjectId(id) };
            const result = await coffeeCollections.deleteOne(filter);
            res.send(result);
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


app.get('/', (req, res) => {
    res.send('Coffee Server Is Running');
})

app.listen(port, () => {
    console.log(`Coffee server is runnng port ${port}`)
})