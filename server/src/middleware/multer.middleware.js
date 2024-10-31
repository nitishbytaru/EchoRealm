// understand this entire code

import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const upload = multer({ storage });

const conditionalMulter = (fields) => (req, res, next) => {
  if (
    req.headers["content-type"] &&
    req.headers["content-type"].startsWith("multipart/form-data")
  ) {
    upload.fields(fields)(req, res, next);
  } else {
    next();
  }
};

export { upload, conditionalMulter };
