const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const app = express();

const mongoURI = 'mongodb://127.0.0.1:27017/bengal';

mongoose.connect(mongoURI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('Error connecting to MongoDB:', err));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Need Schema
const needSchema = new mongoose.Schema({
    name: String,
    contact: String,
    address: String,
    bloodGroup: String,
    organ: String
}, { collection: 'need' });
const Need = mongoose.model('Need', needSchema);

// Receiver Schema
const receiverSchema = new mongoose.Schema({
    name: String,
    email: String,
    phone: String,
    password: String,
    bloodGroup: String,
    documents: String
}, { collection: 'receivers' });
const Receiver = mongoose.model('Receiver', receiverSchema);

// Bloodbank Schema
const bloodbankSchema = new mongoose.Schema({
    'unique-id': Number,
    name: String,
    address: String,
    contact: String,
    coordinates: {
        latitude: Number,
        longitude: Number
    }
}, { collection: 'bloodbank' });
const Bloodbank = mongoose.model('Bloodbank', bloodbankSchema);

// Donors Schema
const donarsSchema = new mongoose.Schema({
    'unique-id': Number,
    name: String,
    contact_number: String,
    address: String,
    blood_type: String,
    donation_type: String,
}, { collection: 'donars' });
const Donars = mongoose.model('Donars', donarsSchema);

// NGO Schema
const ngoSchema = new mongoose.Schema({
    'unique-id': Number,
    name: String,
    address: String,
    contact: String,
    coordinates: {
        latitude: Number,
        longitude: Number
    }
}, { collection: 'ngo' });
const Ngo = mongoose.model('Ngo', ngoSchema);

// Hospital Schema
const hospitalSchema = new mongoose.Schema({
    'unique-id': Number,
    name: String,
    address: String,
    phone: String,
    website: String,
    coordinates: {
        latitude: Number,
        longitude: Number
    }
}, { collection: 'hospital' });
const Hospital = mongoose.model('Hospital', hospitalSchema);

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// API endpoint to handle need form submission
app.post('/api/need', async (req, res) => {
    try {
        const { name, contact, address, bloodGroup, organ } = req.body;
        const newNeed = new Need({ name, contact, address, bloodGroup, organ });
        const data = await newNeed.save();
        res.status(201).json({ message: 'Request submitted successfully' });
    } catch (error) {
        console.error('Error submitting request:', error);
        res.status(500).json({ error: error.message });
    }
});

// API endpoint to fetch need data
app.get('/api/needs', async (req, res) => {
    try {
        const needs = await Need.find({});
        // console.log(needs);
        res.json(needs);
    } catch (err) {
        console.error('Error fetching needs:', err);
        res.status(500).json({ error: err.message });
    }
});


// API endpoint to handle signups
app.post('/api/signup', async (req, res) => {
    try {
        const { name, email, phone, password, bloodGroup } = req.body;
        const newReceiver = new Receiver({
            name,
            email,
            phone,
            password, // Store the plain password (Not secure, should be hashed in production)
            bloodGroup,
            documents: req.file ? req.file.filename : null
        });
        await newReceiver.save();
        res.status(201).json({ message: 'Receiver registered successfully' });
    } catch (error) {
        console.error('Error registering receiver:', error);
        res.status(500).json({ error: error.message });
    }
});

// API endpoint to handle login
app.post('/api/login', async (req, res) => {
    try {
        const { username } = req.body;
        console.log('Login attempt:', { username });

        const receiver = await Receiver.findOne({ email: username });
        if (!receiver) {
            console.log('User not found');
            return res.status(401).json({ success: false, message: 'User not found' });
        }

        console.log('Login successful');
        res.status(200).json({ success: true, message: 'Login successful' });
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).json({ error: error.message });
    }
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/ngo', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'maps/ngo.html'));
});

app.get('/bloodbank', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'maps/bloodbank.html'));
});

app.get('/hospital', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'maps/hospital.html'));
});

// Serve the medicine finder page
app.get('/medicine', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'medicine.html'));
});

app.get('/map', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'map.html'));
});

// API endpoint to fetch hospital data
app.get('/api/hospitals', async (req, res) => {
    try {
        const hospitals = await Hospital.find({});
        res.json(hospitals);
    } catch (err) {
        console.error('Error fetching hospitals:', err);
        res.status(500).json({ error: err.message });
    }
});

// API endpoint to fetch bloodbank data
app.get('/api/bloodbanks', async (req, res) => {
    try {
        const bloodbanks = await Bloodbank.find({});
        res.json(bloodbanks);
    } catch (err) {
        console.error('Error fetching bloodbanks:', err);
        res.status(500).json({ error: err.message });
    }
});

// API endpoint to fetch NGO data
app.get('/api/ngos', async (req, res) => {
    try {
        const ngos = await Ngo.find({});
        res.json(ngos);
    } catch (err) {
        console.error('Error fetching NGOs:', err);
        res.status(500).json({ error: err.message });
    }
});

// API endpoint to fetch donor data
app.get('/api/donars', async (req, res) => {
    try {
        const donars = await Donars.find({});
        res.json(donars);
    } catch (err) {
        console.error('Error fetching donars:', err);
        res.status(500).json({ error: err.message });
    }
});


// Load the medicine JSON data
let medicines = {};

const fs = require('fs');
fs.readFile(path.join(__dirname, 'data', 'medicine.json'), 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading medicine.json:', err);
        return;
    }
    const jsonData = JSON.parse(data);
    jsonData.forEach(item => {
        item.alternatives.forEach(alt => {
            if (!medicines[alt.name]) {
                medicines[alt.name] = [];
            }
            medicines[alt.name].push({
                medicine: item.medicine,
                price: item.price,
                alt_price: alt.price
            });
        });
    });
});

// API endpoint to fetch medicine data
app.get('/api/medicines', (req, res) => {
    const altMedicine = req.query.medicine;
    if (medicines[altMedicine]) {
        res.json(medicines[altMedicine]);
    } else {
        res.status(404).json({ error: 'No alternative found' });
    }
});

app.get('/api/receivers', async (req, res) => {
    try {
        const receivers = await Receiver.find({});
        res.json(receivers);
    } catch (err) {
        console.error('Error fetching receivers:', err);
        res.status(500).json({ error: err.message });
    }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
});
