const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.dhl2xpe.mongodb.net/?retryWrites=true&w=majority`;

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
    
    await client.connect();

    const categoriesCollection = client.db('eduLinkDB').collection('categories')
    const newBookCollection = client.db('eduLinkDB').collection('newBook')

    //get categories
    app.get('/api/v1/categories', async(req, res) => {
      const result = await categoriesCollection.find().toArray();
      res.send(result);
    });

    //post new book details
    app.post('/api/v1/addBook', async(req, res) => {
      const newBook = req.body;
      // console.log(newBook)

      const result = await newBookCollection.insertOne(newBook);
      res.send(result);
    })

    //get all books
    app.get('/api/v1/newBook', async(req, res) => {
      const result = await newBookCollection.find().toArray();
      res.send(result);
    })


    //get category wise books
    app.get('/api/v1/newBook/:category', async(req, res) => {
      const category = req.params.category
      const query = {category: category};

      const options = {
        
        projection: { image: 1, bName: 1, aName: 1, category: 1, rating: 1 }

      };

      const result = await newBookCollection.find(query, options).toArray();
      res.send(result)

    });

    //get api for each book details route
    app.get('/api/v1/details/:id', async(req, res)=> {
      const id = req.params.id
      const query = {_id: new ObjectId(id)}
      
      const result = await newBookCollection.findOne(query);
      res.send(result)
    })

    //get api for read route
    app.get('/api/v1/describe/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}

      const options = {
        projection: { description: 1, bName: 1, image: 1 }
      }

      const result = await newBookCollection.findOne(query, options)
      res.send(result)
    });

    //update books details
    app.get('/api/v1/update/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await newBookCollection.findOne(query)
      res.send(result)
    })

    app.put('/api/v1/update/:id', async(req, res) => {
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)}
      const options = {upsert: true}
      const updateBook = req.body
      const updateBookDetails = {
        $set: {
          image:updateBook.image,
          bName:updateBook.bName,
          aName:updateBook.aName,
          category:updateBook.category,
          rating:updateBook.rating

        }
      }
      const result = await newBookCollection.updateOne(filter, updateBookDetails, options)
      res.send(result)
      
    })

    
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    
    // await client.close();
  }
}
run().catch(console.dir);




app.get('/', (req, res) => {
    res.send('EduLink Library Server is running...')
});

app.listen(port, () => {
    console.log(`EduLink Library server is running on Port: ${port}`)
})