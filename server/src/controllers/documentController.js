const prisma = require('../lib/prisma');

// 1. GET ALL DOCUMENTS (For the list/table view)
// 1. GET ALL DOCUMENTS (With Pagination & Search)
exports.getDocuments = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const search = req.query.search || "";

        const where = search 
            ? { name: { contains: search } } 
            : {};

        const [templates, total] = await prisma.$transaction([
            prisma.documentTemplate.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' }
            }),
            prisma.documentTemplate.count({ where })
        ]);

        res.json({
            data: templates,
            total,
            pages: Math.ceil(total / limit),
            currentPage: page
        });
    } catch (error) {
        console.error("Fetch Error:", error);
        res.status(500).json({ error: "Failed to fetch templates" });
    }
};

// 2. GET SINGLE DOCUMENT (For the Draggable Designer to load data)
exports.getDocumentById = async (req, res) => {
    try {
        const { id } = req.params;  
        const template = await prisma.documentTemplate.findUnique({
            where: { id: parseInt(id) }
        });
        
        if (!template) return res.status(404).json({ error: "Template not found" });
        
        res.json(template);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// 3. CREATE DOCUMENT
exports.createDocument = async (req, res) => {
    try {
        const { name, layoutSettings } = req.body;
        
        const template = await prisma.documentTemplate.create({
            data: {
                name,
                layoutSettings // This saves the whole JSON object from your Draggable UI
            }
        });
        
        res.status(201).json(template);
    } catch (error) {
        console.error("Create Error:", error);
        res.status(500).json({ error: error.message });
    }
};

// 4. UPDATE DOCUMENT (Important for saving changes in the Designer)
exports.updateDocument = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, layoutSettings } = req.body;

        const updated = await prisma.documentTemplate.update({
            where: { id: parseInt(id) },
            data: {
                name,
                layoutSettings
            }
        });

        res.json(updated);
    } catch (error) {
        console.error("Update Error:", error);
        res.status(404).json({ error: "Template not found or update failed" });
    }
};

// 5. DELETE DOCUMENT
exports.deleteDocument = async (req, res) => {
    try {
        const { id } = req.params;
        await prisma.documentTemplate.delete({
            where: { id: parseInt(id) }
        });
        res.json({ message: "Template deleted successfully" });
    } catch (error) {
        res.status(404).json({ error: "Template not found" });
    }
};