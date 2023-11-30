// Loading environment variables from .env file
require('dotenv').config();

const express = require('express');
const { authenticateUser } = require('../middleware/authenticateUser');
const { getAssignments,
    getAssignmentById,
    createAssignment,
    updateAssignment,
    deleteAssignment,
    submitAssignment } = require('../controllers/Assignment');

const router = express.Router();
const logger = require('../logger');

// Middleware to handle the PATCH method with authentication
router.patch('*', authenticateUser, (req, res) => {
    logger.error(`Method PATCH not allowed for ${req.baseUrl}${req.path}`);
    return res.status(405).json({ error: 'Method PATCH not allowed.' });
});

router.get('/', authenticateUser, getAssignments);
router.get('/:id', authenticateUser, getAssignmentById);
router.post('/', authenticateUser, createAssignment);
router.put('/:id', authenticateUser, updateAssignment);
router.delete('/:id', authenticateUser, deleteAssignment);
router.post('/:id/submission', authenticateUser, submitAssignment);

// Middleware to handle unsupported methods for assignment routes
router.use((req, res, next) => {
    logger.error(`Method ${req.method} not allowed for ${req.baseUrl}${req.path}`);
    return res.status(405).json({ error: `Method ${req.method} not allowed.` });
});

module.exports = router;
