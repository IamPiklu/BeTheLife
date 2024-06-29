const express = require('express');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const app = express();

const mongoURI = 'mongodb://127.0.0.1:27017/bengal';

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('Error connecting to MongoDB:', err));

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

// Donars Schema
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

// API endpoint to fetch donar data
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

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
});
