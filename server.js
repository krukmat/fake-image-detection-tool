const express = require('express');
const path = require('path');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const PYTHON_API_URL = process.env.PYTHON_API_URL || 'http://localhost:5000';

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/api/detect', async (req, res) => {
    try {
        const { url_original, url_suspect } = req.body;

        if (!url_original || !url_suspect) {
            return res.status(400).json({
                error: 'Both url_original and url_suspect are required'
            });
        }

        if (typeof url_original !== 'string' || typeof url_suspect !== 'string') {
            return res.status(400).json({
                error: 'Both url_original and url_suspect must be strings'
            });
        }

        const response = await axios.post(`${PYTHON_API_URL}/detect`, {
            url_original,
            url_suspect
        });

        res.json(response.data);
    } catch (error) {
        if (error.response) {
            res.status(error.response.status).json(error.response.data);
        } else if (error.request) {
            res.status(500).json({
                error: 'Cannot connect to detection service'
            });
        } else {
            res.status(500).json({
                error: 'Internal server error'
            });
        }
    }
});

// Only start server if not in test mode
if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Frontend server running on http://localhost:${PORT}`);
        console.log(`Connecting to Python API at: ${PYTHON_API_URL}`);
    });
}

module.exports = app;