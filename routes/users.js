const User = require("../Models/User");
const bcrypt = require("bcrypt");

const express = require("express");
const router = express.Router();

router.get('/', (req, res) => {
    res.status(200).json("{ msg: welcome home }");
});

router.post('/users/', (req, res) => {
    const { email, phoneNumber, password, confirmPassword } = req.body;

    bcrypt.genSalt(10)
    .then(salt => {
        bcrypt.hash(password, salt)
        .then(hash => {
            const newPassword = hash;
            const newUser = new User({
                email,
                phoneNumber,
                password: newPassword,
                confirmPassword
            });

            newUser.save()
            .then(response => {
                res.status(200).json({email: response.email, phone: response.phoneNumber});
            })
            .catch(err => {
                res.status(400).json(err._message);
            })

        })
        .catch(err => {
            res.status(500).json(err);
        })
    })
    .catch(err => {
        res.status(500).json(err);
    })
});

router.post("/login", (req, res) => {
    const { email, password } = req.body;

    User.findOne({email})
    .then(data => {
        bcrypt.compare(password, data.password)
        .then(response => {
            if(response){
                const { email, password } = data;
                
                res.status(200).json(data);
            }else{
                res.status(400).json({msg: "Wrong password!"});
            }
        })
        .catch(err => {
            res.status(400).json(err);
        })
    })
    .catch(err => {
        console.error(err)
    })
});

module.exports = router;