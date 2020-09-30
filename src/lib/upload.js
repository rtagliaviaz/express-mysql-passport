const multer = require('multer');
const path = require('path');

const imgFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb("please upload only images", false)
  }
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.resolve(__dirname, '../public/img'))
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname)
  }
})

const uploadFile = multer({storage: storage, fileFilter: imgFilter})

module.exports = uploadFile