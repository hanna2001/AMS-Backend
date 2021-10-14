const bcrypt = require('bcrypt')
const User = require('../models/User')
const jwt = require('jsonwebtoken')

exports.signup = async(req, res) => { 
    let { firstName, email, password } = req.body
    console.log(req.body)
    // first_name = first_name;
    // email = email;

    if (firstName == "" || email == "" || password == "") {
        res.json({
            status: "FAILED",
            message: "Empty input field(s)"
        })
    } else if (password.length < 8) {
        res.json({
            status: "FAILED",
            message: "Password is too short"
        })
    } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
        res.json({
            status: "FAILED",
            message: "Invalid email"
        })
    } else {
        // Check if user already exists
        User.find({ email }).then(result => {
            if (result.length) {
                // A user already exists
                res.json({
                    status: "FAILED",
                    message: "User with given email already exists"
                })
            } else {
                bcrypt.hash(password, 10).then(hashedPassword => {
                    const newUser = new User({
                        firstName,
                        email,
                        password: hashedPassword,

                    })

                    newUser.save().then(result => {
                        res.json({
                            status: "SUCCESS",
                            message: "Signup Successful",
                        })
                    }).catch(err => {
                        res.json({
                            status: "FAILED",
                            message: "An error occured while adding the user"
                        })
                    })
                }).catch(err => {
                    res.json({
                        status: "FAILED",
                        message: "An error occurred while hashing the password"
                    })
                })
            }
        }).catch(err => {
            console.log(err)
            res.json({
                status: "FAILED",
                message: "An error occurred while checking for existance of user"
            })
        })
    }
};

exports.login = async(req, res) => {
    let { email, password } = req.body
    email = email.trim();
    console.log(req.body)

    if (email == "" || password == "") {
        res.json({
            status: "FAILED",
            message: "Empty credentials entered"
        })
    } else if (!/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/.test(email)) {
        res.json({
            status: "FAILED",
            message: "Invalid email"
        })
    } else {
        User.findOne({ email }).then(user => {
            if (user) {
				console.log('user\n=====\n' + user)
				if (user.comparePassword(password)) {
					// Correct password
					console.log('correct password');
					const token = user.generateJWT();

					res.json({
						status: "SUCCESS",
						message: "Sign-in successful",
						token: token,
					})
				} else {
					// Incorrect password
					res.json({
						status: "FAILED",
						message: "Incorrect password or mail"
					})
				}
			} else {
				res.json({
					status: "FAILED",
					message: "Incorrect password or mail"
				})
				console.log(err.message)
			}
        }).catch(err => {
            console.log(req.body)
			console.log(err.message)
            res.json({
                status: "FAILED",
                message: "An error occured while checking for existance of user"
            })
        })
    }
};