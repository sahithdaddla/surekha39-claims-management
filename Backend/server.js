
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const app = express();
const port = 3026;

// Middleware
app.use(cors());
app.use(express.json());

// PostgreSQL connection configuration
const pool = new Pool({
    user: 'postgres', // Replace with your PostgreSQL username
    host: 'postgres',
    database: 'employee_claims_db',
    password: 'admin123', // Replace with your PostgreSQL password
    port: 5432,
});

// Test database connection
pool.connect((err, client, release) => {
    if (err) {
        return console.error('Error acquiring client', err.stack);
    }
    console.log('Connected to PostgreSQL database');
    release();
});

// Get all claims
app.get('/api/claims', async (req, res) => {
    try {
        const { search } = req.query;
        let query = 'SELECT * FROM claims ORDER BY submission_date DESC';
        let values = [];
        
        if (search) {
            query = 'SELECT * FROM claims WHERE LOWER(employee_id) LIKE $1 OR LOWER(claim_type) LIKE $1 ORDER BY submission_date DESC';
            values = [`%${search.toLowerCase()}%`];
        }
        
        const result = await pool.query(query, values);
        res.json(result.rows);
    } catch (err) {
        console.error(err.stack);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get claim by ID
app.get('/api/claims/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM claims WHERE id = $1', [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Claim not found' });
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.stack);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Create a new claim
app.post('/api/claims', async (req, res) => {
    try {
        const {
            employeeId, employeeName, claimType, claimAmount,
            hospitalName, treatmentStartDate, treatmentEndDate,
            fromLocation, toLocation, travelStartDate, travelEndDate,
            workStartDate, workEndDate, claimName, claimDate, claimDescription
        } = req.body;

        const query = `
            INSERT INTO claims (
                employee_id, employee_name, claim_type, claim_amount, status,
                submission_date, hospital_name, treatment_start_date, treatment_end_date,
                from_location, to_location, travel_start_date, travel_end_date,
                work_start_date, work_end_date, claim_name, claim_date, claim_description
            ) VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)
            RETURNING *
        `;
        
        const values = [
            employeeId, employeeName, claimType, claimAmount, 'Pending',
            hospitalName || null, treatmentStartDate || null, treatmentEndDate || null,
            fromLocation || null, toLocation || null, travelStartDate || null, travelEndDate || null,
            workStartDate || null, workEndDate || null, claimName || null, claimDate || null, claimDescription || null
        ];

        const result = await pool.query(query, values);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err.stack);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Update claim status
app.put('/api/claims/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        if (!['Pending', 'Approved', 'Rejected'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }

        const result = await pool.query(
            'UPDATE claims SET status = $1 WHERE id = $2 RETURNING *',
            [status, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Claim not found' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error(err.stack);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Delete a claim
app.delete('/api/claims/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM claims WHERE id = $1 RETURNING *', [id]);
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Claim not found' });
        }

        res.json({ message: 'Claim deleted successfully' });
    } catch (err) {
        console.error(err.stack);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Clear all claims
app.delete('/api/claims', async (req, res) => {
    try {
        await pool.query('DELETE FROM claims');
        res.json({ message: 'All claims deleted successfully' });
    } catch (err) {
        console.error(err.stack);
        res.status(500).json({ error: 'Internal server error' });
    
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server running at http://13.48.195.115:${port}`);
});
