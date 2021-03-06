const User = require("../Models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const ProtonMail = require("protonmail-api");
const { uuid } = require('uuidv4');

const express = require("express");
const config = require("../Config/config");
const router = express.Router();

router.get('/', (req, res) => {
    res.status(200).json({ msg: "welcome home"});
});

router.post('/users/', async (req, res) => {
    const { email, phoneNumber, password, confirmPassword } = req.body;

    await bcrypt.genSalt(10)
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

            User.findOne({ email })
            .then(result => {
                if (result === null) {
                    newUser.save()
                        .then(response => {
                            res.status(200).json({email: response.email, phoneNumber: response.phoneNumber});
                        })
                        .catch(err => {
                            res.status(200).json({msg: err._message});
                        })
                }else{
                    res.status(200).json({msg: "User with that email exists"});
                }
            })
            .catch(err => {
                res.status(200).json({msg: err});
            })

        })
        .catch(err => {
            res.status(200).json({msg: err});
        })
    })
    .catch(err => {
        res.status(500).json({msg: err });
    })
});

router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    console.log(req.body);

    await User.findOne({email})
    .then(data => {
        if(data !== null){
            bcrypt.compare(password, data.password)
                .then(response => {
                    if(response){
                        const { email, password , phoneNumber} = data;
                        
                        const token = jwt.sign({user_id: email}, password, {
                            expiresIn: "2h"
                        })

                        console.log(token);

                        res.status(200).json({token: token, email: email, phoneNumber: phoneNumber});
                    }else{
                        res.status(200).json({msg: "Wrong password!"});
                    }
                })
                .catch(err => {
                    res.status(200).json(err);
                })
        }else{
            res.status(401).json({msg: "User already exists!"})
        }
    })
    .catch(err => {
        console.error(err)
    })
});

router.post('/set', async (req ,res) => {
    const { email, token } = req.body;
    await User.findOne({email})
    .then(result => {
        if (result !== null) {
            const password = result.password;
            jwt.verify(token, password)
            .then(response => {
                console.log(response);
            })
            .catch(err => {
                console.error(err);
            });
        }else{

        }
    })
    .catch(err => {
        console.error(err);
    })
});

router.post("/forgot", async (req, res) => {
    const { email } = req.body;
    const newPassword = uuid();

    console.log(`New password: ${email}`);
    await User.findOne({email})
    .then(result => {
        if (result != null) {

            (async () => {
                const pm = await ProtonMail.connect({
                    username: config.username,
                    password: config.password
                })
              
                await pm.sendEmail({
                    to: email,
                    subject: 'Password reset',
                    body: `New temporary password: ${newPassword}`
                })

                await User.findOneAndUpdate({email}, {$set: { password: newPassword }}, {new: true})
                .then(result => {
                    if (result != null) {
                        res.status(200).json({msg: "Password reset successfull", email: result.email});
                    } else {
                        res.status(200).json({ error: 'Unable to update db' });
                    }
                })
                .catch(err => {
                    console.error(err);
                })
              
                pm.close()
              })()
        
        } else {
            res.status(200).json({ msg: "User does not exist" });
        }
    })
    .catch(err => {
        console.error(err);
    });
});

module.exports = router;