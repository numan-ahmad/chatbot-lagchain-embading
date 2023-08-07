const multer = require("multer");

const MIME_TYPE_MAP = {
  "audio/wav": "wav",
  "audio/mp3": "mp3",
};

const audioUpload = multer({
  limits: {
    fileSize: 5100000,
  },
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "audios");
    },
    filename: (req, file, cb) => {
      const ext = MIME_TYPE_MAP[file.mimetype];
      cb(null, "audio" + "." + ext);
    },
  }),
  fileFilter: (req, file, cb) => {
    const isValid = !!MIME_TYPE_MAP[file.mimetype];
    let error = isValid ? null : new Error("Invalid mime type!");
    cb(error, isValid);
  },
});

module.exports = audioUpload;
