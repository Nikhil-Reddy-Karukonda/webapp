// At the top of your file where you're using AWS services
const AWS = require('aws-sdk');

AWS.config.update({
    region: 'us-east-1'
    // Credentials are obtained from the IAM role in this case
});

const sns = new AWS.SNS();

const { Assignment, Submission } = require('../models/model');
const { ValidationError } = require('sequelize');
const logger = require('../logger');
const path = require('path');

const { downloadAndSaveZip } = require('../helpers/downloadAndSaveZip');

const hasPayload = (req) => req.body && Object.keys(req.body).length !== 0;
const hasQueryParameters = (req) => req.query && Object.keys(req.query).length !== 0;

const getAssignments = async (req, res) => {
    logger.debug("Accessed getAssignments()");
    if (hasPayload(req) || hasQueryParameters(req)) {
        // Payload not allowed, Query parameters not allowed
        logger.error("Payload or Query parameters not allowed");
        return res.status(400).set({
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'X-Content-Type-Options': 'nosniff'
        }).send({ error: 'Payload or query parameters not allowed' });
    }

    try {
        const assignments = await Assignment.findAll();
        // const assignments = await Assignment.findAll({ where: { accountId: req.account.id } });
        logger.info(`Fetched ${assignments.length} assignments successfully`);
        res.json(assignments);
    } catch (err) {
        logger.error(`Error in getAssignments: ${err.message} - Failed to fetch assignments`);
        res.status(500).json({ error: 'Failed to fetch assignments.' });
    }
};

const getAssignmentById = async (req, res) => {
    logger.debug("Accessed getAssignmentById()");

    if (!validateAssignmentId(req.params.id)) {
        return res.status(400).json({ error: 'Invalid UUID format.' });
    }

    if (hasPayload(req) || hasQueryParameters(req)) {
        // Payload not allowed, Query parameters not allowed
        logger.error("Payload or Query parameters not allowed");
        return res.status(400).set({
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'X-Content-Type-Options': 'nosniff'
        }).send({ error: 'Payload or query parameters not allowed' });
    }

    try {
        const assignment = await Assignment.findByPk(req.params.id);
        if (assignment) {
            logger.info(`Fetched assignment ${assignment.name} successfully`);
            res.json(assignment);
        } else {
            logger.error(`Assignment Not Found - Assignment: ${req.params.id}`);
            res.status(404).json({ error: 'Assignment not found.' });
        }
    } catch (err) {
        console.error('Error in getAssignmentById:', err);
        logger.error(`Error in getAssignmentById: ${err.message} - Failed to fetch assignment`);
        res.status(500).json({ error: 'Internal server error.' });
    }
};

const validateAssignmentData = (assignmentData) => {

    const expectedKeys = ['name', 'points', 'num_of_attempts', 'deadline'];
    const dataKeys = Object.keys(assignmentData);

    const errors = [];

    // Check for unwanted keys
    dataKeys.forEach(key => {
        if (!expectedKeys.includes(key)) {
            errors.push(`Invalid key "${key}" in payload.`);
        }
    });

    // Name validation
    if (typeof assignmentData.name !== 'string') {
        errors.push('Name must be a string.');
    }

    // Points validation
    if (typeof assignmentData.points !== 'number' || !Number.isInteger(assignmentData.points)) {
        errors.push('Points must be an integer.');
    }

    // Num of attempts validation
    if (typeof assignmentData.num_of_attempts !== 'number' || !Number.isInteger(assignmentData.num_of_attempts)) {
        errors.push('num_of_attempts must be an integer.');
    }
    // Regex to match YYYY-MM-DDTHH:mm:ss.sssZ format
    const dateRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/;

    // Check if the deadline input is a string and matches expected format
    if (typeof assignmentData.deadline !== 'string' || !dateRegex.test(assignmentData.deadline)) {
        errors.push('Deadline must be provided in a valid date format (YYYY-MM-DDTHH:mm:ss.sssZ).');
    } else {
        const deadlineDate = new Date(assignmentData.deadline);

        // Check if the provided string could be turned into a valid date
        if (!(deadlineDate instanceof Date && !isNaN(deadlineDate))) {
            errors.push('Deadline must be a valid date.');
        } else {
            // If it's a valid date, check if it's in the future
            if (deadlineDate <= new Date()) {
                errors.push('Deadline must be in the future.');
            }
        }
    }


    const { assignment_created, assignment_updated, ...validatedData } = assignmentData;

    if (validatedData.points < 1 || validatedData.points > 100) {
        errors.push('Assignment points must be between 1 and 100.');
    }
    if (validatedData.num_of_attempts < 1 || validatedData.num_of_attempts > 100) {
        errors.push('num_of_attempts must be between 1 and 100.');
    }

    return { validatedData, errors };
};

const createAssignment = async (req, res) => {

    logger.debug("Accessed createAssignment()");
    const { validatedData, errors } = validateAssignmentData(req.body);

    if (errors.length > 0) {
        logger.error("Error creating assignment: ", errors);
        return res.status(400).json({ error: errors });
    }

    try {
        const assignment = await Assignment.create({ ...validatedData, accountId: req.account.id });
        logger.info(`Created assignment ${assignment.name} successfully`);
        res.status(201).json(assignment);

    } catch (err) {
        console.log(err);
        if (err instanceof ValidationError) {
            logger.error(`Validation Error: ${err.errors.map(e => e.message)}`);
            res.status(400).json({ error: err.errors.map(e => e.message) });
        } else {
            logger.error(`Error creating assignment: ${err.message}`);
            res.status(500).json({ error: 'Failed to create assignment.' });
        }
    }
};

const deleteAssignment = async (req, res) => {
    logger.debug("Accessed deleteAssignment()");

    if (hasPayload(req)) {
        // Payload not allowed
        logger.error("Payload not allowed");
        return res.status(400).set({
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'X-Content-Type-Options': 'nosniff'
        }).send({ error: 'Payload not allowed' });
    }

    try {

        if (!validateAssignmentId(req.params.id)) {
            return res.status(400).json({ error: 'Invalid UUID format.' });
        }

        const assignment = await Assignment.findByPk(req.params.id);
        if (!assignment) return res.status(404).json({ error: 'Assignment not found.' });

        if (assignment.accountId !== req.account.id) {
            logger.error(`Forbidden - Not authorized to delete this assignment`);
            return res.status(403).json({ error: 'Not authorized to delete this assignment.' });
        }

        // Check for existing submissions
        const submissions = await Submission.findAll({ where: { assignment_id: req.params.id } });
        if (submissions.length > 0) {
            // If submissions exist, block deletion
            return res.status(400).json({ error: 'Cannot delete assignment as there are submissions linked to it.' });
        }

        await assignment.destroy();
        logger.info(`Deleted assignment ${req.params.id} Successfully`);
        res.status(204).send();
    } catch (err) {
        console.error('Error during deletion:', err);
        logger.error(`Error during deletion: ${err.message} - Failed to delete assignment`);
        res.status(500).json({ error: 'Failed to delete assignment.' });
    }
};

const updateAssignment = async (req, res) => {
    logger.debug("Accessed updateAssignment()");
    const { validatedData, errors } = validateAssignmentData(req.body);

    if (errors.length > 0) {
        logger.error(`Error updating assignment: ${errors}`);
        return res.status(400).json({ error: errors });
    }

    try {

        if (!validateAssignmentId(req.params.id)) {
            return res.status(400).json({ error: 'Invalid UUID format.' });
        }

        const assignment = await Assignment.findByPk(req.params.id);
        if (!assignment) {
            logger.error(`updateAssignment() - Assignment Not Found`)
            return res.status(404).json({ error: 'Assignment not found.' });
        }

        if (assignment.accountId !== req.account.id) {
            logger.error(`updateAssignment() - Not authorized to update this assignment`);
            return res.status(403).json({ error: 'Not authorized to update this assignment.' });
        }

        validatedData.assignment_updated = new Date();
        await assignment.update(validatedData);
        logger.info(`Assignment ${assignment.name} successfully updated`);
        res.status(204).send();
    } catch (err) {
        if (err instanceof ValidationError) {
            res.status(400).json({ error: err.errors.map(e => e.message) });
            logger.error(`validation Error: ${err.errors.map(e => e.message)}`);
        } else {
            res.status(500).json({ error: 'Failed to update assignment.' });
        }
    }
};


const validateAssignmentId = (id) => {
    const uuidPattern = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/;
    if (!uuidPattern.test(id)) {
        logger.error(`Invalid UUID format - Assignment: ${id}`);
        return false;
    }
    return true;
}

const submitAssignment = async (req, res) => {
    logger.debug(`Accessed submitAssignment()`);
    const assignmentId = req.params.id;
    const { submission_url } = req.body;

    const rootPath = path.join(__dirname, '..');
    const fileName = `submission_${assignmentId}_${Date.now()}.zip`;
    const savePath = path.join(rootPath, fileName);

    // Validate the submission URL
    // if (!submission_url || typeof submission_url !== 'string') {
    //     logger.error('Invalid submission URL provided');
    //     return res.status(400).json({ error: 'Submission URL is required and must be a string.' });
    // }

    // if (!submission_url.endsWith('.zip')) {
    //     logger.error('Invalid submission URL: URL must end with .zip');
    //     return res.status(400).json({ error: 'Invalid submission URL: URL must end with .zip' });
    // }

    if (!validateAssignmentId(assignmentId)) {
        logger.error(`Invalid UUID format for assignment ID: ${assignmentId}`);
        return res.status(400).json({ error: 'Invalid UUID format.' });
    }

    try {
        // Check if the assignment exists
        const assignment = await Assignment.findByPk(assignmentId);
        if (!assignment) {
            logger.error(`Assignment not found: ${assignmentId}`);
            return res.status(404).json({ error: 'Assignment not found.' });
        }

        const snsMessage = {
            assignmentId: assignmentId,
            assignmentName: assignment.name,
            email: req.account.email, 
            submissionCount: 0, 
            submissionUrl: submission_url, 
            assignment_creator: assignment.accountId, 
            submission_id: '',
            status: '',
            message: ''
        }

        // Check for deadline and attempt limits
        if (new Date() > new Date(assignment.deadline)) {
            const errorMessage = 'Assignment deadline has passed.';
            snsMessage.status = 'DEADLINE_PASSED';
            snsMessage.message = errorMessage;
            publishToSNS(sns, snsMessage);
            logger.warn(`Assignment deadline has passed for assignment: ${assignmentId}`);
            return res.status(403).json({ error: 'Assignment deadline has passed.' });
        }

        const userId = req.account.id;

        // Count existing submissions
        const submissionsCount = await Submission.count({
            where: {
                assignment_id: assignmentId,
                accountId: userId
            }
        });

        snsMessage.submissionCount = submissionsCount;

        if (submissionsCount >= assignment.num_of_attempts) {
            const errorMessage = 'Maximum number of attempts reached.';
            snsMessage.status = 'MAX_ATTEMPTS';
            snsMessage.message = errorMessage;
            publishToSNS(sns, snsMessage);
            logger.warn(`Maximum number of attempts reached for assignment: ${assignmentId}`);
            return res.status(403).json({ error: 'Maximum number of attempts reached.' });
        }

        logger.debug('Creating new submission record');
        const submission = await Submission.create({
            assignment_id: assignmentId,
            accountId: userId,
            submission_url,
            submission_date: new Date(),
            submission_updated: new Date()
        });

        snsMessage.submission_id = submission.id;

        // try {
        //     await downloadAndSaveZip(submission_url, savePath);
        //     logger.info(`File downloaded successfully to ${savePath}`);
        // } catch (err) {
        //     logger.error(`Error downloading file: ${err.message}`);
        //     return res.status(500).json({ error: `Error downloading file: ${err.message}` });
        // }

        snsMessage.status = 'SUCCESS';
        snsMessage.message = 'Submission created successfully.';
        await publishToSNS(sns, snsMessage);

        logger.info(`Submission created successfully for assignment: ${assignmentId}`);
        res.status(201).json(submission);
    } catch (err) {
        logger.error(`Error in submitAssignment: ${err.message}`);
        res.status(500).json({ error: err });
    }
};


const publishToSNS = async (sns, message) => {
    const params = {
        Message: JSON.stringify(message),
        TopicArn: process.env.SNS_ARN
    };

    try {
        const data = await sns.publish(params).promise();
        logger.info(`Message published to SNS topic: ${data.MessageId}`);
    } catch (err) {
        logger.error(`Error publishing to SNS: ${err.message}`);
    }
};



module.exports = {
    getAssignments,
    getAssignmentById,
    createAssignment,
    updateAssignment,
    deleteAssignment,
    submitAssignment
};