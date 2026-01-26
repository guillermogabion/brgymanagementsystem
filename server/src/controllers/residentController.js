const prisma = require('../lib/prisma');


// getResident

exports.getResident = async (req, res) => {
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
                    { lastName: { contains: search } }, 
                    { firstName: { contains: search } },
                    { phoneNumber: { contains: search } },
                    { purok: { contains: search } }      
                ]
            };
        }

        // 3. Pass the "where" object to Prisma
        const residents = await prisma.resident.findMany({
            where: where, // <--- THIS FILTERS THE DATA
            skip: skip,
            take: limit,
            orderBy: { id: 'desc' }
        });

        // 4. Count only the filtered items for correct pagination
        const total = await prisma.resident.count({ where: where });

        console.log(`Search: "${search}" | Found: ${residents.length} users`);
        
        res.json({ 
            data: residents, 
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
}

// Get a single resident by ID
exports.getResidentById = async (req, res) => {
    const { id } = req.params;
    console.log(`--- GET RESIDENT ATTEMPT ID: ${id} ---`);
    
    try {
        const resident = await prisma.resident.findUnique({
            where: { id: parseInt(id) }
        });

        if (!resident) {
            return res.status(404).json({ message: "Resident not found" });
        }

        res.json(resident);
    } catch (error) {
        console.error("Get Resident By ID Error:", error);
        res.status(500).json({ 
            message: "Database Error", 
            details: error.message 
        });
    }
};

exports.createResident = async (req, res) => {
    const { 
            pic,
            firstName, 
            lastName, 
            birthDate, 
            purok, 
            houseNumber, 
            phoneNumber, 
            isIndigent, 
            isSeniorCitizen  } = req.body;


    try {
        const newResident = await prisma.resident.create({
            data: { 
                pic,
                firstName, 
                lastName, 
                birthDate: new Date(birthDate).toISOString(), 
                purok, 
                houseNumber, 
                phoneNumber, 
                isIndigent: Boolean(isIndigent),
                isSeniorCitizen : Boolean(isSeniorCitizen), }
        });
        res.status(201).json(newResident);
    } catch (error) {
        // LOOK AT YOUR TERMINAL/CMD - THIS WILL SHOW THE REAL ERROR
        console.log("--- FULL ERROR START ---");
        console.log(error);
        console.log("--- FULL ERROR END ---");

        // Better error handling
        if (error.code === 'P2002') {
            return res.status(400).json({ error: "Phone number already exists." });
        }
        
        res.status(400).json({ error: "Check terminal for Prisma validation error." });
    }
};
exports.updateResident = async (req, res) => {
    const { id } = req.params;
    const { 
        pic, firstName, lastName, birthDate, purok, 
        houseNumber, phoneNumber, isIndigent, isSeniorCitizen 
    } = req.body;

    try {
        const updatedResident = await prisma.resident.update({
            where: { id: parseInt(id) },
            data: {
                pic,
                firstName,
                lastName,
                // Ensure birthDate is converted back to a Date object if it's a string
                birthDate: birthDate ? new Date(birthDate).toISOString() : undefined,
                purok,
                houseNumber,
                phoneNumber,
                isIndigent: isIndigent !== undefined ? Boolean(isIndigent) : undefined,
                isSeniorCitizen: isSeniorCitizen !== undefined ? Boolean(isSeniorCitizen) : undefined,
            }
        });
        res.json(updatedResident);
    } catch (error) {
        console.error("Update Error:", error);
        res.status(404).json({ error: "Resident not found or update failed" });
    }
};

exports.deleteResident = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.resident.delete({
            where: { id: parseInt(id) }
        });
        res.json({ message: "User deleted successfully" });
    } catch (error) {
        res.status(404).json({ error: "Resident not found" });
    }
};