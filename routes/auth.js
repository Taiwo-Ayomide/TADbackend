const express = require("express");
const User = require("../Model/User");
const CryptoJS = require("crypto-js");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");
const multer = require('multer');
// const streamifier = require('streamifier');
const cloudinary = require('./cloudinaryConfig');

const router = express.Router();


// Multer setup for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const sendEmail = async (email, subject, text, html) => {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: "noreplytad2.0@gmail.com", // Use environment variable for security
            // "process.env.EMAIL_USER", // Use environment variable for security
            pass: "ggzp vhpf vxnb xlmw" // Use environment variable for security
            // pass: "sdjv knfz ioft ovbs" // Use environment variable for security
        },
    });

    const mailOptions = {
        from: process.env.EMAIL_USER,
        to: email,
        subject,
        text,
        html,
    };

    return transporter.sendMail(mailOptions);
};

// EMAIL SIGNUP
router.post("/signup", async (req, res) => {
    try {
        const { email, password } = req.body;
        const encryptedPassword = CryptoJS.AES.encrypt(password, process.env.PASS_SEC).toString();

        const existingUser = await User.findOne({ email: email });
        if (existingUser) {
            alert('Email already Exist, Please try a new Email Address');
            return res.status(400).json({ message: 'Email Already Exist' });
        }
        
        // Create new user with inactive status
        const newUser = new User({ email, password: encryptedPassword, isActive: true });
        const savedUser = await newUser.save();


        // Create token (JWT) with user email and set expiration time
        const token = jwt.sign({ email }, process.env.JWT_SEC, { expiresIn: "1h" });

        // Send signup confirmation email with token
        const verificationLink = `https://thinkanddesign.vercel.app/verify/${savedUser._id}/${token}`;

        await sendEmail(
            email,
            "Account Verification",
            "Please verify your email.",
            `Click the link to verify your email and activate your account: <a href="${verificationLink}"><b>Verify Account</b></a>`
        );


        res.status(200).json({ message: "Signup successful, please check your email for verification.", user: savedUser });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// VERIFY EMAIL
router.get("/verify/:id/:token", async (req, res) => {
    try {
        const token = req.params.token;

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SEC);
        const email = decoded.email;

        console.log("Decoded email from token:", email); // Debugging log

        // Find user and update inActive to false
        const user = await User.findOneAndUpdate(
            { email },
            { isActive: false },
            { new: true }
        );

        console.log("User after update:", user); // Debugging log

        if (!user) {
            return res.status(400).json({ message: "Invalid token or user not found" });
        }

        res.status(200).json({ message: "Account verified successfully", user });
    } catch (error) {
        console.error("Verification error:", error.message); // Debugging log
        res.status(400).json({ message: "Token verification failed", error: error.message });
    }
});




// REGISTRATION FORM
router.put('/update/:id', async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            {
                $set: req.body
            },
            { new: true },
        )
        res.status(200).json(user)
    } catch (error) {
        res.status(500).json(error)
    }
})


// UPLOAD PASSPORT
router.put("/passport/:id", upload.single('imageFile'), async (req, res) => {
    try {
        const userId = req.params.id;
        const imageFile = req.file;

        // Check if the user exists before uploading
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if an image file is provided
        if (!imageFile) {
            return res.status(400).json({ message: "No image file provided" });
        }

        // Function to handle Cloudinary upload as a Promise
        const uploadToCloudinary = (fileBuffer) => {
            return new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { folder: 'passport' }, // Optional folder in Cloudinary
                    (error, result) => {
                        if (error) {
                            return reject(new Error("Cloudinary upload failed"));
                        }
                        resolve(result);
                    }
                );
                stream.end(fileBuffer);
            });
        };

        // Upload to Cloudinary
        const uploadResult = await uploadToCloudinary(imageFile.buffer);

        // Ensure Cloudinary returns a URL
        const imageUrl = uploadResult.secure_url;
        if (!imageUrl) {
            return res.status(500).json({ message: "Image upload failed" });
        }

        // Update the user with the new image URL
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { passportImageUrl: imageUrl }, // Update the image URL field in the user document
            { new: true } // Return the updated document
        );

        // Respond with the updated user details
        res.status(200).json(updatedUser);

    } catch (error) {
        console.error('Error:', error.message);
        res.status(500).json({ message: error.message });
    }
});


// LOGIN
router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json("Wrong Email");
        }

        const hashpassword = CryptoJS.AES.decrypt(user.password, process.env.PASS_SEC);
        const originalPassword = hashpassword.toString(CryptoJS.enc.Utf8);

        if (originalPassword !== password) {
            return res.status(401).json("Wrong password");
        }

        // Store user data in session
        req.session.user = {
            id: user._id,
            email: user.email,
            isAdmin: user.isAdmin,
            isAdmitted: user.isAdmitted
        };

        res.status(200).json({ message: "Login successful" });

    } catch (error) {
        console.error(error);
        res.status(500).json("Server error");
    }
});

// ADMIN LOGIN
router.post("/admin-login", async (req, res) => {
    try {
      const { email, password } = req.body;
  
      const user = await User.findOne({ email });
      // !user && res.status(400).json("wrong information");
      if (!user) {
          return res.status(400).json("Wrong Email")
      }
  
      const hashpassword = CryptoJS.AES.decrypt(
          user.password,
          process.env.PASS_SEC,
      );
      const originalPassword = hashpassword.toString(CryptoJS.enc.Utf8);
  
  
      if (originalPassword !== password) {
          return res.status(401).json("Wrong password")
      }
  
      const accessToken = jwt.sign(
          {
            //   id: user._id,
              isAdmin: user.isAdmin,
          }, 
          process.env.JWT_SEC,
          { expiresIn: "3d" },
  
      );
      const { password:_, ...others } = user._doc;
  
      res.status(200).json({ ...others, accessToken });
  
    } catch (error) {
      res.status(500).json(error.message); 
    }
  
});
  

// Get candidates based on session.
router.get('/candidate', (req, res) => {
    if (!req.session.user) {
      return res.status(401).json('Unauthorized');
    }
  
    User.findById(req.session.user.id, (err, user) => {
      if (err || !user) {
        return res.status(404).json('Candidate not found');
      }
      res.json(user); // Send back user/candidate details
    });
});
  

router.post("/logout", (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json("Failed to log out");
        }
        res.status(200).json("Logout successful");
    });
});


router.get("/protected-route", (req, res) => {
    if (req.session.user) {
        // User is logged in
        res.status(200).json({ message: "This is a protected route" });
    } else {
        // User is not logged in
        res.status(401).json("Unauthorized");
    }
});


module.exports = router;
