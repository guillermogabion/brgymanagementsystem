const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// --- LOGIN FUNCTION ---
exports.login = async (req, res) => {
    const { username, password } = req.body;

    try {
        // 1. Check if user exists
        const user = await prisma.user.findUnique({
            where: { username }
        });

        if (!user) {
            return res.status(401).json({ message: "Invalid username or password" });
        }

        // 2. Check password
        // Use bcrypt.compare if you hash your passwords (recommended)
        // If you are using plain text (not recommended): const isMatch = password === user.password;
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({ message: "Invalid username or password" });
        }

        // 3. Generate JWT
        const token = jwt.sign(
            { id: user.id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '8h' } // Token lasts for 8 hours
        );

        // 4. Send response
        res.json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                username: user.username,
                role: user.role,
                designation: user.designation
            }
        });

    } catch (error) {
        res.status(500).json({ message: "Server error during login" });
    }
};

// --- LOGOUT FUNCTION ---
// Since JWTs are stateless, "logging out" is mostly handled by the frontend 
// (deleting the token). However, you can provide an endpoint for it.
exports.logout = async (req, res) => {
    // Optionally: Add token to a blocklist in the database if using high security
    res.json({ message: "Logged out successfully. Please remove your token from storage." });
};

// --- IMPROVED CREATE USER (With Password Hashing) ---
exports.createUser = async (req, res) => {
    const { username, password, role, designation, email } = req.body;

    console.log(req.body)

    try {
        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await prisma.user.create({
            data: { 
                username, 
                password: hashedPassword, // Store the hash, not the plain text
                role,
                designation,
                email
            }
        });

        // Don't send the password back in the response
        const { password: _, ...userWithoutPassword } = newUser;
        res.status(201).json(userWithoutPassword);
    } catch (error) {
        console.error(error);
        res.status(400).json({ error: "Username or email might already exist" });
    }
};

// ... keep your getUsers, updateUser, deleteUser as they 

exports.getUsers = async (req, res) => {
    console.log("--- GET USERS ATTEMPT ---");
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 3; 
        const skip = (page - 1) * limit;
        
        // 1. Capture the search term from the URL
        const search = req.query.search || "";

        // 2. Build the "where" filter
        let where = {};
        if (search) {
            where = {
                OR: [
                    { username: { contains: search } }, // Change 'username' to your actual field name
                    { role: { contains: search } }      // You can add more fields here
                ]
            };
        }

        // 3. Pass the "where" object to Prisma
        const users = await prisma.user.findMany({
            where: where, // <--- THIS FILTERS THE DATA
            skip: skip,
            take: limit,
            orderBy: { id: 'desc' }
        });

        // 4. Count only the filtered items for correct pagination
        const total = await prisma.user.count({ where: where });

        console.log(`Search: "${search}" | Found: ${users.length} users`);
        
        res.json({ 
            data: users, 
            total, 
            pages: Math.ceil(total / limit) 
        });

    } catch (error) {
        console.error("!!! PRISMA ERROR DETAILS !!!");
        console.error(error); 
        res.status(500).json({ 
            message: "Database Error", 
            details: error.message 
        });
    }
};

// UPDATE USER
exports.updateUser = async (req, res) => {
    const { id } = req.params;
    try {
        const updatedUser = await prisma.user.update({
            where: { id: parseInt(id) }, // Prisma needs the ID as a number
            data: req.body
        });
        res.json(updatedUser);
    } catch (error) {
        res.status(404).json({ error: "User not found" });
    }
};

// DELETE USER
exports.deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.user.delete({
            where: { id: parseInt(id) }
        });
        res.json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(404).json({ error: "User not found" });
    }
};