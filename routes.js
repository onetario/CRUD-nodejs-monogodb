const express = require("express");
const router = express.Router();
const Worker = require("./model");
router.get("/getWorkerDetail", async (req, res) => {
  const { page = 1, limit=4 } = req.query;
  try {
    const workers = await Worker.find()
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const counts = await Worker.count();
    console.log(Math.ceil(counts / limit));
    
    res.json({
      statusCode: 200,
      data: workers,
      PageSize: Math.ceil(counts / limit),
      PageNumber: page,
      successMessage: "Worker's Details fetched successfully",
    });
    const count = await Worker.countDocuments({});
    console.log(count);
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
    name: req.body.name,
    country: req.body.country,
    position: req.body.position,
    wages: req.body.wages,
  });
  try {
    const workerSave = await workerPost.save();
    res.json(workerSave);
  } catch (error) {
    res.send("error");
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
router.delete("/deleteWorkerDetail/:id", async (req, res) => {
  try {
    const workers = await Worker.findByIdAndDelete(req.params.id);
    res.json("Worker's Detail deleted successfully");
  } catch (error) {
    res.send("error");
  }
});

module.exports = router;
