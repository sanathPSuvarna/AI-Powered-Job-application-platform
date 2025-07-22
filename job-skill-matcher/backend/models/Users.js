// models/User.js
const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
    // Constructor for User object
    constructor(email, password, userType) {
        this.email = email;
        this.password = password;
        this.userType = userType;
    }

    // Save user to database
    async save() {
        try {
            // // Hash password before saving
            const hashedPassword = await bcrypt.hash(this.password, 10);
            
            const [result] = await db.execute(
                'INSERT INTO users (email, password_hash, user_type) VALUES (?, ?, ?)',
                [this.email, hashedpassword, this.userType]
            );
            return result.insertId;
        } catch (error) {
            throw new Error('Could not create user: ' + error.message);
        }
    }

    // Find user by email
    static async findByEmail(email) {
        try {
            const [rows] = await db.execute(
                'SELECT * FROM users WHERE email = ?',
                [email]
            );
            return rows[0];
        } catch (error) {
            throw new Error('Error finding user: ' + error.message);
        }
    }

    // Validate user password
    static async validatePassword(plainPassword, hashedPassword) {
        return await bcrypt.compare(plainPassword, hashedPassword);
    }
}

module.exports = User;
