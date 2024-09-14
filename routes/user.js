const User = require("../Model/User");
const router = require("express").Router();


// TO ACCEPT ADMISSION
router.put("/candidate/:id/accept", async (req, res) => {
    const candidateId = req.params.id;

    try {
        const updatedCandidate = await User.findByIdAndUpdate(
            candidateId,
            { isAdmitted: true },
            { new: true }
        );

        if (!updatedCandidate) {
            return res.status(404).json({ message: 'Candidate not found' });
        }

        return res.status(200).json({ message: 'Candidate accepted', candidate: updatedCandidate });

    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
})


// GET ADMITTED CANDIDATES
router.get('/candidates/admitted', async (req, res) => {
    try {
        // Find candidates where isAdmitted is false
        const candidates = await User.find({ isAdmitted: true });

        return res.status(200).json({ candidates });
    } catch (error) {
        return res.status(500).json({ message: 'Server error', error: error.message });
    }
});



// GET ALL USERS
router.get("/find", async (req, res) => {
    try {
        const user = await User.find();
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json(error);
    }
});



// GET ONE USER
router.get("/find/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json(error);
    }
});

// UPDATE
router.put("/update/:id", async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            {
                $set: req.body
            },
            { new: true },
        );

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json(error);
    }
});


// DELETE
router.delete("/delete/:id", async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.status(200).json("Data Deleted Successfully");
    } catch (error) {
        res.status(500).json(error);
    }
});



module.exports = router;