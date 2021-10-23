const express = require("express");
const router = express.Router();

router.get('/', (req, res) => {
    res.status(200).json("{ msg: welcome home }");
});


router.post("/market/", (req, res) => {
    const produce_data = () => {
        const data = [
            Math.round(Math.random() * 15) + 1, Math.round(Math.random() * 15) + 1
         ]; 
         return data;
    };
   
   res.status(200).json({data: produce_data()});
});

module.exports = router;