import multer from "multer";
import path from 'path'
import fs from 'fs'

// import multer = require("multer");

// const storage = multer.diskStorage({
//     filename: function (req, file, cb) { 
//         cb(null, Date.now() + '-' + file.originalname)
//     }
// })

// export const upload = multer({ storage })




// dest for memory storage, storage for disk storage
// filefilter
//limits- limiting uploaded file size

// export const Multer = ({ customPath="temp", customExtensions= [] } = {}) => {
//     const fullPath = `uploads/${customPath}`
//     if (!fs.existsSync(fullPath)) {
//         fs.mkdirSync(fullPath, { recursive: true })
//     }

    
//     const storage = multer.diskStorage({
//         destination: function (req, file, cb) {
//             cb(null, fullPath) // error or null and destination
//         },
//         filename: function (req, file, cb) { // name of file in the destination
//             // const uniqueSuffix = Date.now() // any name to be added to the file name
//             cb(null, file.originalname)
//         }
//     })

//     function fileFilter(req, file, cb) {
        
//         if (!customExtensions.includes(file.mimetype.split('/')[1])) {
//             cb(new Error('Invalid File Type!'))
//         } else {
//             cb(null, true)
//         }
//     }

//     const upload = multer({ storage, fileFilter })
//     return upload
// }


export const Multer = ({ customPath = "temp", customExtensions = [] } = {}) => {
    const fullPath = `uploads/${customPath}`;
    if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
    }

    const storage = multer.diskStorage({
        destination: (req, file, cb) => cb(null, fullPath),
        filename: (req, file, cb) => cb(null, file.originalname)
    });

    const fileFilter = (req, file, cb) => {
        const ext = file.mimetype.split('/')[1];
        if (!customExtensions.includes(ext)) {
            return cb(new Error('Invalid File Type!'));
        }
        cb(null, true);
    };

    return multer({ storage, fileFilter });
};



// upload.single(fieldName) - accept only one file -> returns req.file
// upload.array(fieldName,[,maxCount]) -> returns req.files - array of objects
// upload.fields([{file1},{file2}]) - mix of files to upload from many inputs -> returns req.files - object of fieldnames and each key is array of object
















