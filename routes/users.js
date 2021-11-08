const User = require("../Models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
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

    console.log(`New password: ${newPassword}`);
    await User.findOne({email})
    .then(result => {
        if (result != null) {
            const transport = nodemailer.createTransport({
                port: 1025,
                secure: false,
                auth: {
                    user: config.username,
                    pass: config.password
                },
                logger: true,
                debug: true,
                ignoreTLS: true, 
                tls: {
                    rejectUnauthorized: false
                }
            });

            const mailOptions = {
                from: config.admin,
                to: email,
                subject: 'Password reset',
                text: `New temporary password: ${newPassword}`
            };

            transport.sendMail(mailOptions, (error, data) => {
                if (error) {
                    console.error(error);
                } else {
                    console.log(data);
                    User.findOneAndUpdate({email}, {$set: { password: newPassword }}, {new: true})
                    .then(result => {
                        if (result != null) {
                            res.status(200).json(result);
                        } else {
                            res.status(200).json({ error: 'Unable to update db' });
                        }
                    })
                    .catch(err => {
                        console.error(err);
                    })
                }
            });
        }else{
            res.status(200).json({ msg: "User does not exist" });
        }
    })
    .catch(err => {
        console.error(err);
    });
});

module.exports = router;