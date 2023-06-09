const express = require('express')
const app = express()
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config()
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const verifyJWT = (req, res, next) => {
    const authorization = req.headers.authorization;
    if (!authorization) {
        return res.status(401).send({ error: true, message: 'unauthorized access' });
    }
    // bearer token
    const token = authorization.split(' ')[1];

    jwt.verify(token, process.env.Access_Token, (err, decoded) => {
        if (err) {
            return res.status(401).send({ error: true, message: 'unauthorized access' })
        }
        req.decoded = decoded;
        next();
    })
}

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.qwzfeis.mongodb.net/?retryWrites=true&w=majority`;

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
        // await client.connect();
        const SportLearnUsersCollection = client.db('SportLearn').collection('users');
        const ClassesCollection = client.db('SportLearn').collection('classes');

        app.post('/jwt', (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.Access_Token, {
                expiresIn: '1h'
            })
            res.send({ token })
        })



        app.get('/classes', async (req, res) => {
            const result = await ClassesCollection.find().toArray();
            res.send(result);
        })

        app.post('/classes', async (req, res) => {
            const classes = req.body;
            const result = await ClassesCollection.insertOne(classes);
            res.send(result);
        });

        app.patch('/classes/approved/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id)
            const query = { _id: new ObjectId(id) }
            const updateDoc = {
                $set: {
                    role: 'approved'
                }
            }
            const result = await ClassesCollection.updateOne(query, updateDoc);
            res.send(result);
        })

        app.patch('/classes/denied/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id)
            const query = { _id: new ObjectId(id) }
            const updateDoc = {
                $set: {
                    role: 'denied'
                }
            }
            const result = await ClassesCollection.updateOne(query, updateDoc);
            res.send(result);
        })

        app.patch('/classes/pending/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id)
            const query = { _id: new ObjectId(id) }
            const updateDoc = {
                $set: {
                    role: 'pending'
                }
            }
            const result = await ClassesCollection.updateOne(query, updateDoc);
            res.send(result);
        })


        // User Apis

        app.get('/users', verifyJWT, async (req, res) => {
            const result = await SportLearnUsersCollection.find().toArray();
            res.send(result);
        })

        app.post('/users', async (req, res) => {
            const user = req.body;
            const query = { email: user.email }
            const existingUser = await SportLearnUsersCollection.findOne(query);
            if (existingUser) {
                return res.send({ message: 'user already exists' })
            }
            const result = await SportLearnUsersCollection.insertOne(user);
            res.send(result);
        });


        app.patch('/users/admin/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id)
            const query = { _id: new ObjectId(id) }
            const updateDoc = {
                $set: {
                    role: 'admin'
                }
            }
            const result = await SportLearnUsersCollection.updateOne(query, updateDoc);
            res.send(result);
        })


        app.patch('/users/Instructor/:id', async (req, res) => {
            const id = req.params.id;
            console.log(id)
            const query = { _id: new ObjectId(id) }
            const updateDoc = {
                $set: {
                    role: 'Instructor'
                }
            }
            const result = await SportLearnUsersCollection.updateOne(query, updateDoc);
            res.send(result);
        })


        app.delete('/users/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: new ObjectId(id) }
            const result = await SportLearnUsersCollection.deleteOne(query)
            res.send(result);
        })


        // Send a ping to confirm a successful connection
        // await client.db("admin").command({ ping: 1 });
        console.log("Pinged your deployment. You successfully connected to MongoDB!");
    } finally {
        // Ensures that the client will close when you finish/error
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Sport Learn Running!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})