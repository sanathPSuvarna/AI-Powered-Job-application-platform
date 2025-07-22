// middleware/validators.js

const { body, param, validationResult } = require('express-validator');

// Helper function to validate results
const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// User Registration Validation
const registerValidation = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please enter a valid email'),
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long'),
    body('user_type')
        .isIn(['job_seeker', 'employer'])
        .withMessage('Invalid user type'),
    validate
];

// Profile Validation
const profileValidation = [
    body('first_name')
        .trim()
        .notEmpty()
        .withMessage('First name is required'),
    body('last_name')
        .trim()
        .notEmpty()
        .withMessage('Last name is required'),
    body('professional_status')
        .isIn(['fresher', 'working'])
        .withMessage('Invalid professional status'),
    body('experience_years')
        .optional()
        .isInt({ min: 0 })
        .withMessage('Experience years must be a positive number'),
    validate
];

// Job Posting Validation
const jobValidation = [
    body('title')
        .trim()
        .notEmpty()
        .withMessage('Job title is required'),
    body('description')
        .trim()
        .notEmpty()
        .withMessage('Job description is required'),
    body('salary_min')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Minimum salary must be a positive number'),
    body('salary_max')
        .optional()
        .isFloat({ min: 0 })
        .custom((value, { req }) => {
            if (req.body.salary_min && value <= req.body.salary_min) {
                throw new Error('Maximum salary must be greater than minimum salary');
            }
            return true;
        }),
    body('job_type')
        .isIn(['full-time', 'part-time', 'contract', 'internship'])
        .withMessage('Invalid job type'),
    validate
];

// Skill Validation
const skillValidation = [
    body('skill_name')
        .trim()
        .notEmpty()
        .withMessage('Skill name is required'),
    body('proficiency_level')
        .isIn(['beginner', 'intermediate', 'advanced'])
        .withMessage('Invalid proficiency level'),
    validate
];

// ID Parameter Validation
const idParamValidation = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('Invalid ID parameter'),
    validate
];

module.exports = {
    registerValidation,
    profileValidation,
    jobValidation,
    skillValidation,
    idParamValidation
};
