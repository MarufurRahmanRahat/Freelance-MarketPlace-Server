const express = require('express')
const cors = require('cors')
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express()
const port = process.env.PORT || 3000 ;

app.use(cors())
app.use(express.json())




const uri = "mongodb+srv://Freelance-MarketPlace-Server:CEKGGTYdLKrFTnF7@cluster0.rw2jx8i.mongodb.net/?appName=Cluster0";

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
    const db = client.db("Freelance-Marketplace-DB");
    const jobsCollection = db.collection("Freelance-Marketplace");
    const acceptedJobsCollection = db.collection("acceptedJobs");

      //API starts here 
    app.get('/jobs', async (req, res) => {
      try {
        const sort = req.query.sort; 
        let query = {};
        let sortOption = {};

        if (sort === 'newest') {
          sortOption = { postedDate: -1 };
        } else if (sort === 'oldest') {
          sortOption = { postedDate: 1 }; 
        }

        const jobs = await jobsCollection.find(query).sort(sortOption).toArray();
        res.send(jobs);
      } catch (error) {
        console.error("Error fetching jobs:", error);
        res.status(500).send({
          success: false,
          message: "Failed to fetch jobs"
        });
      }
    });

     
    //6ta latest jobgula
     app.get('/latestJobs', async (req, res) => {
      try {
        const jobs = await jobsCollection
          .find()
          .sort({ postedDate: -1 })
          .limit(6)
          .toArray();
        res.send(jobs);
      }catch (error) {
        console.error("Error fetching latest jobs:", error);
        res.status(500).send({
          success: false,
          message: "Failed to fetch latest jobs"
        });
      }
     })


      app.get('/jobs/:id', async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const job = await jobsCollection.findOne(query);
        console.log(id);
        
        console.log(job);
        
        if (!job) {
          return res.status(404).send({
            success: false,
            message: "Job not found"
          });
        }

        res.send(job);
      } catch (error) {
        console.error("Error fetching job details:", error);
        res.status(500).send({
          success: false,
          message: "Failed to fetch job details"
        });
      }
    });

    // job add korar jonno
    app.post('/addJob', async (req, res) => {
      try {
        const jobData = {
          title: req.body.title,
          postedBy: req.body.postedBy,
          category: req.body.category,
          summary: req.body.summary,
          coverImage: req.body.coverImage,
          userEmail: req.body.userEmail,
          postedDate: new Date()
        };

        const result = await jobsCollection.insertOne(jobData);
        res.status(201).send({
          success: true,
          message: "Job added successfully!",
          jobId: result.insertedId
        });
      }
      catch (error) {
        console.error("Error adding job:", error);
        res.status(500).send({
          success: false,
          message: "Failed to add job",
          error: error.message
        });
      }
    });


    // accepted job 
    app.get('/myPostedJobs/:email', async (req, res) => {
       try {
        const email = req.params.email;
        const query = { userEmail: email };
        const jobs = await jobsCollection.find(query).toArray();
        res.send(jobs);
      } catch (error) {
        console.error("Error fetching user's jobs:", error);
        res.status(500).send({
          success: false,
          message: "Failed to fetch your jobs"
        });
      }
    });

    // job update korar jonno
     app.put('/updateJob/:id', async (req, res) =>{
      try {
        const id = req.params.id;
        const filter = { _id: new ObjectId(id) };
        const updatedJob = {
          $set: {
            title: req.body.title,
            category: req.body.category,
            summary: req.body.summary,
            coverImage: req.body.coverImage,
            updatedDate: new Date()
          }
        };
         const result = await jobsCollection.updateOne(filter, updatedJob);

        if (result.matchedCount === 0) {
          return res.status(404).send({
            success: false,
            message: "Job not found"
          });
        }

        res.send({
          success: true,
          message: "Job updated successfully!",
          modifiedCount: result.modifiedCount
        });
      } catch (error) {
        console.error("Error updating job:", error);
        res.status(500).send({
          success: false,
          message: "Failed to update job"
        });
      }
    });

    // delete korar jonno
    app.delete('/deleteJob/:id', async (req, res)=> {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await jobsCollection.deleteOne(query);

        if (result.deletedCount === 0) {
          return res.status(404).send({
            success: false,
            message: "Job not found"
          });
        }

         res.send({
          success: true,
          message: "Job deleted successfully!",
          deletedCount: result.deletedCount
        });
      } catch (error) {
        console.error("Error deleting job:", error);
        res.status(500).send({
          success: false,
          message: "Failed to delete job"
        });
      }
    });


    //  job accept korbo
     app.post('/acceptJob', async (req, res) => {
      try {
        const acceptedJobData = {
          jobId: req.body.jobId,
          jobTitle: req.body.jobTitle,
          jobCategory: req.body.jobCategory,
          postedBy: req.body.postedBy,
          acceptedBy: req.body.acceptedBy, 
          acceptedByName: req.body.acceptedByName,
          acceptedDate: new Date(),
          status: 'pending' 
        };

        const result = await acceptedJobsCollection.insertOne(acceptedJobData);
        res.status(201).send({
          success: true,
          message: "Job accepted successfully!",
          acceptedJobId: result.insertedId
        });
         } catch (error) {
        console.error("Error accepting job:", error);
        res.status(500).send({
          success: false,
          message: "Failed to accept job"
        });
      }
    });

    // posted job gula dekhbo
    app.get('/my-accepted-tasks/:email', async (req, res) => {
      try {
        const email = req.params.email;
        const query = { acceptedBy: email };
        const tasks = await acceptedJobsCollection.find(query).toArray();
        res.send(tasks);
      } catch (error) {
        console.error("Error fetching accepted tasks:", error);
        res.status(500).send({
          success: false,
          message: "Failed to fetch accepted tasks"
        });
      }
    });



   



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
  res.send('Server is running fine!')
})

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`)
})
