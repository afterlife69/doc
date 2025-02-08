import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import User from './schemas/user.js';
import Document from './schemas/document.js';
import jwt from 'jsonwebtoken';
import { userAuthMiddleware } from './middlewares/userAuth.js';
import { JWT_SECRET } from './config.js';
import AWS from 'aws-sdk';
import multer from 'multer';

dotenv.config();

const app = express();
app.use(bodyParser.json());
app.use(cors());

const s3 = new AWS.S3({
    region: process.env.AWS_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const upload = multer();

mongoose.connect('').then(() => {
    app.listen(8080 , () => {
      console.log('Connected');
    })
  })

app.post('/signup', async (req, res) => {
    const {username, firstName, lastName, email, password} = req.body;
    try {
        const user = new User({
            username, 
            firstName, 
            lastName, 
            email, 
            password
        });
        
        user.save();
        res.status(201).send('User Added');
    } catch(err) {
        res.status(500).send(err);
    }
})

app.post('/login', async (req, res) => {
    const {email, password} = req.body;
    
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }
        const isValidPassword = await user.verifyPassword(password)
        
        if (!isValidPassword) {
            return res.status(401).json({ message: 'Invalid password' });
        }

        const token =  jwt.sign(
            { userId: user._id, username: user.username },
            JWT_SECRET
        );
        res.status(200).json({ token });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }

});

app.post('/upload', userAuthMiddleware, upload.single('document'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
    }
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const email = req.headers['user-email'];
        // Save document in MongoDB
        const newDocument = new Document({
            filename: req.file.originalname
        });
        await newDocument.save();

        // Upload file to S3
        const params = {
            Bucket: process.env.AWS_BUCKET_NAME,
            Key: newDocument._id.toString() + '.pdf', // Use MongoDB _id as the S3 object key
            Body: req.file.buffer
        };

        await s3.upload(params).promise();

        // Find user and add document reference
        console.log(req.email);
        
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.documentsGenerated.push(newDocument._id);
        await user.save();

        res.status(200).json({
            message: 'File uploaded successfully',
            documentId: newDocument._id
        });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: 'Error uploading file' });
    }
});

app.get('/getDocuments', userAuthMiddleware, async (req, res) => {
    try {
        const email = req.headers['user-email'];
        const user = await User.findOne({email});
        
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const documentsWithLinks = await Promise.all(
            user.documentsGenerated.map(async (doc) => {
                const s3Params = {
                    Bucket: process.env.AWS_BUCKET_NAME,
                    Key: doc._id.toString() + '.pdf',
                    Expires: 3600,
                    ResponseContentDisposition: 'inline',
                    ResponseContentType: 'application/pdf'
                };

                const presignedUrl = await s3.getSignedUrlPromise('getObject', s3Params);
                
                return {
                    id: doc._id,
                    filename: doc.filename,
                    createdAt: doc.createdAt,
                    downloadUrl: presignedUrl
                };
            })
        );

        res.status(200).json({ documents: documentsWithLinks });
    } catch (err) {
        console.error('Error fetching documents:', err);
        res.status(500).json({ message: 'Error fetching documents' });
    }
});


