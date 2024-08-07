const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const { PythonShell } = require('python-shell');
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

// Serve the prediction page
app.get('/predict', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'predict.html'));
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

// API endpoint to predict the original medicine
app.get('/api/predict', (req, res) => {
    const alternativeName = req.query.alternative_name;

    let options = {
        mode: 'text',
        pythonOptions: ['-u'],
        args: [alternativeName]
    };

    PythonShell.run('predict.py', options, (err, results) => {
        if (err) throw err;
        res.json({ medicine: results[0] });
    });
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
});
