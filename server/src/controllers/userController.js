const prisma = require('../lib/prisma');



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

// CREATE A NEW USER
exports.createUser = async (req, res) => {
    const { username, password, role } = req.body;


    // return console.log(req.body, 'check');
    try {
        const newUser = await prisma.user.create({
            data: { username, password, role }
        });
        res.status(201).json(newUser);
    } catch (error) {
        res.status(400).json({ error: "Username might already exist" });
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