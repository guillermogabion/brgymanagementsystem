const prisma = require('../lib/prisma');


exports.getDocuments = async (req, res) => {
    console.log("Attempting getting documents");
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = 3;
        const skip = (page-1) * limit;


        const search = req.query.search || "";

        let where = {}
        if (search) {
            where = {
                OR: [
                    {name: {contains: search}},
                ]
            };
        }

        const documents = await prisma.documentTemplate.findMany({
            where: where,
            skip: skip,
            take: limit,
            orderBy: {id: 'desc'}
        });

        const total = await prisma.documentTemplate.count({where: where});

        res.json({
            data: documents,
            total,
            pages: Math.ceil(total/limit)
        });
    } catch (error) {
        console.error ("Prisma error details");
        console.error(error);
        res.status(500).json({
            message: "Database Error",
            details: error.message
        })
    }
}

exports.getDocumentById = async (req, res) => {
    const { id } = req.params;
    try {
        const template = await prisma.documentTemplate.findUnique({
            where: { id: parseInt(id) }
        });
        if (!template) return res.status(404).json({ error: "Template not found" });
        res.json(template);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.createDocument = async (req, res) => {
    // 1. Destructure ONLY the fields that exist in your Prisma schema
    const { name, layoutSettings } = req.body;

    try {


        // 2. Ensure we are calling the correct Prisma model (documentTemplate)
        const newDocument = await prisma.documentTemplate.create({
            data: {
                name: name,
                layoutSettings: layoutSettings // This saves the entire JSON object
            }
        });

        res.status(201).json(newDocument);
    } catch (error) {
        // 3. Log the actual error to the terminal so you can see it
        console.error("Prisma Create Error:", error.message);

        res.status(400).json({
            error: "Document create Failed",
            details: error.message 
        });
    }
};

exports.updateDocument = async (req, res) => {
    const { id } = req.params;
    try {
        const updatedDocument = await prisma.documentTemplate.update({
            where: { id: parseInt(id) }, // Prisma needs the ID as a number
            data: req.body
        });
        res.json(updatedDocument);
    } catch (error) {
        res.status(404).json({ error: "Document not found" });
    }
};

// DELETE USER
exports.deleteDocument = async (req, res) => {
    const { id } = req.params;
    try {
        await prisma.documentTemplate.delete({
            where: { id: parseInt(id) }
        });
        res.json({ message: "Document deleted successfully" });
    } catch (error) {
        res.status(404).json({ error: "Document not found" });
    }
};