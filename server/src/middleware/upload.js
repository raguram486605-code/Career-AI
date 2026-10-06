const multer = require('multer');
// Resume is held in memory and forwarded to the AI service; only extracted text is stored.
module.exports = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ok = /\.(pdf|docx|txt)$/i.test(file.originalname);
    cb(ok ? null : Object.assign(new Error('Only PDF, DOCX or TXT files are allowed'), { status: 400 }), ok);
  },
});
