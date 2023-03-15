const express = require("express");
const router = express.Router();
const Worker = require("./model");
const { v4: uuidv4 } = require("uuid");

router.get("/getWorkerDetail", async (req, res) => {
  const { page = 1, limit = 4, search, country } = req.query;
  try {
    const grouping = [];
    const filter = {};
    if (search) {
      filter.position = { $regex: new RegExp(search, "i") };
    }
    if (country) {
      grouping.push({ $match: { country: country } });
    }
    grouping.push({
      $group: {
        _id: "$country",
        count: { $sum: 1 },
        workers: { $push: "$$ROOT" },
      },
    });
    const workers = await Worker.aggregate(grouping)
      .sort({ _id: 1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const counts = await Worker.countDocuments(filter);
    const totalWorkers = await Worker.aggregate(grouping).count("count");
    res.json({
      statusCode: 200,
      data: workers,
      PageSize: Math.ceil(totalWorkers[0].count / limit),
      PageNumber: page,
      successMessage: "Worker's Details fetched successfully",
    });
  } catch (error) {
    res.send("error");
  }
});

router.get("/getWorkerDetail/:id", async (req, res) => {
  try {
    const workers = await Worker.findById(req.params.id);
    res.json(workers);
  } catch (error) {
    res.send("error");
  }
});

router.post("/postWorkerDetail", async (req, res) => {
  const workerPost = new Worker({
    _id: uuidv4(),
    ...req.body, // Spread the request body to include any additional properties not defined in the schema
  });
  try {
    const workerSave = await workerPost.save();
    const dataKeys = Object.keys(req.body);
    console.log("Data keys:", dataKeys);
    res.json(workerSave);
  } catch (error) {
    res.send("error");
    console.log(error);
  }
});

// Route to get all unique keys in the worker collection
router.get("/workerKeys", async (req, res) => {
  try {
    const workers = await Worker.find();
    const keys = [
      ...new Set(workers.flatMap((worker) => Object.keys(worker.toObject()))),
    ];
    res.json(keys);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Server error" });
  }
});

router.patch("/patchWorkerDetail/:id", async (req, res) => {
  try {
    const workers = await Worker.findById(req.params.id);
    // (workers.name = req.body.name),
    // (workers.position = req.body.position),
    workers.wages = req.body.wages;
    const a1 = await workers.save();
    res.json(workers);
  } catch (error) {
    res.send("error");
  }
});

router.put("/updateWorkerDetail/:id", async (req, res) => {
  const { name, country, position, wages } = req.body;
  try {
    const updatedWorker = await Worker.findByIdAndUpdate(
      req.params.id,
      { name, country, position, wages },
      { new: true }
    );
    res.json(updatedWorker);
  } catch (error) {
    res.send("error");
  }
});

router.delete("/deleteWorkerDetail/:id", async (req, res) => {
  try {
    const workers = await Worker.findByIdAndDelete(req.params.id);
    res.json("Worker's Detail deleted successfully");
  } catch (error) {
    res.send("error");
  }
});

module.exports = router;
