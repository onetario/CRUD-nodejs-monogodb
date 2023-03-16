const express = require("express");
const router = express.Router();
const Worker = require("./model");
const { v4: uuidv4 } = require("uuid");

router.get("/getWorkerDetail", async (req, res) => {
  const { page = 1, limit = 4, search, country } = req.query;
  try {
    const pipeline = [];
    if (search) {
      pipeline.push({
        $match: { position: { $regex: new RegExp(search, "i") } },
      });
    }
    if (country) {
      pipeline.push({ $match: { country: country } });
    }
    pipeline.push({
      $group: {
        _id: "$country",
        count: { $sum: 1 },
        workers: { $push: "$$ROOT" },
      },
    });
    pipeline.push({ $sort: { _id: 1 } });
    pipeline.push({ $skip: (page - 1) * limit });
    pipeline.push({ $limit: limit });

    const workers = await Worker.aggregate(pipeline);
    const counts = await Worker.countDocuments(pipeline[0]["$match"]);

    res.json({
      statusCode: 200,
      data: workers,
      PageSize: Math.ceil(counts / limit),
      PageNumber: page,
      successMessage: "Worker's Details fetched successfully",
    });
  } catch (error) {
    res.send({
      statusCode: 500,
      error: "Could not get worker details.",
    });
  }
});

router.get("/getWorkerById", async (req, res) => {
  try {
    const workers = await Worker.findById(req.query.id);
    if (!workers) {
      res.send({
        statusCode: 404,
        error: "Worker not found for the given id.",
      });
      return;
    }
    res.json(workers);
  } catch (error) {
    res.send({
      statusCode: 500,
      error: "Could not get worker detail by the given id.",
    });
  }
});

const getUniqueKeys = async () => {
  try {
    const keys = await Worker.aggregate([
      { $project: { keys: { $objectToArray: "$$ROOT" } } },
      { $unwind: "$keys" },
      { $group: { _id: "$keys.k" } },
      { $project: { _id: 0, key: "$_id" } },
    ]);
    console.log(keys);
    return keys.map((obj) => obj.key);
  } catch (error) {
    console.error(error);
    throw new Error("Unable to retrieve unique keys");
  }
};

router.get("/workerKeys", async (req, res) => {
  try {
    const keys = await getUniqueKeys();
    res.json(keys);
  } catch (error) {
    console.error(error);
    res.send({
      statusCode: 500,
      error: "Could not get unique keys.",
    });
  }
});

router.post("/postWorkerDetail", async (req, res) => {
  const workerPost = new Worker({
    _id: uuidv4(),
    ...req.body, // Spread the request body to include any additional properties not defined in the schema
  });
  try {
    const workerSave = await workerPost.save();
    res.json(workerSave);
  } catch (error) {
    console.error(error);
    res.send({
      statusCode: 500,
      error: "Could not save this worker detail.",
    });
  }
});

router.patch("/patchWorkerDetail", async (req, res) => {
  try {
    const workers = await Worker.findById(req.query.id);
    // (workers.name = req.body.name),
    // (workers.position = req.body.position),
    workers.wages = req.body.wages;
    const a1 = await workers.save();
    res.json(workers);
  } catch (error) {
    res.send({
      statusCode: 500,
      error: "Could not patch this worker detail.",
    });
  }
});

router.put("/updateWorkerDetail", async (req, res) => {
  const { name, country, position, wages } = req.body;
  const id = req.query.id;
  try {
    const updatedWorker = await Worker.findByIdAndUpdate(
      id,
      { name, country, position, wages },
      { new: true }
    );
    res.json(updatedWorker);
  } catch (error) {
    res.send({
      statusCode: 500,
      error: "Could not update this worker detail.",
    });
  }
});

router.delete("/deleteWorkerDetail", async (req, res) => {
  try {
    const workers = await Worker.findByIdAndDelete(req.query.id);
    res.json("Worker's Detail deleted successfully");
  } catch (error) {
    res.send({
      statusCode: 500,
      error: "Could not delete this worker detail.",
    });
  }
});

module.exports = router;
