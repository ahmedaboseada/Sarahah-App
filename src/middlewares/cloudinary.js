import { Multer } from "./multer.js";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";

export function cloudinaryUploadImage({folder, customPath="temp", customExtensions= [] }) {
    const upload = Multer({ customPath, customExtensions });

    return [
        upload.single("avatar"),
        async (req, res, next) => {
            try {
                if (!req.file) {
                    return next();
                }

                const result = await cloudinary.v2.uploader.upload(req.file.path, { folder });

                req.file.cloudinaryUrl = result.secure_url;

                fs.unlink(req.file.path, (err) => {
                    if (err) console.error("Error deleting temp file:", err);
                });

                next();
            } catch (err) {
                next(err);
            }
        }
    ];
}

export function cloudinaryUploadImages({folder, customPath="temp", customExtensions= [] }) {
    const upload = Multer({ customPath, customExtensions });

    return [
        upload.array("images"),
        async (req, res, next) => {
            try {
                if (!req.files) {
                    return next();
                }

                const results = await Promise.all(
                    req.files.map((file) =>
                        cloudinary.v2.uploader.upload(file.path, { folder })
                    )
                );

                req.files.cloudinaryUrls = results.map((result) => result.secure_url);

                fs.unlink(req.files.path, (err) => {
                    if (err) console.error("Error deleting temp file:", err);
                });

                next();
            } catch (err) {
                next(err);
            }
        }
    ];
}


// export function cloudinaryUploadAvatarAndCover({ folder, customPath = "temp", customExtensions = [] }) {
//     const upload = Multer({ customPath, customExtensions });

//     return [
//         upload.fields([
//             { name: "avatar", maxCount: 1 },
//             { name: "images", maxCount: 5 }
//         ]),
//         async (req, res, next) => {
//             try {
//                 // Upload avatar if present
//                 if (req.files?.avatar) {
//                     const result = await cloudinary.v2.uploader.upload(req.files.avatar[0].path, {
//                         folder: `${folder}/avatarImages`
//                     });
//                     req.files.avatar[0].cloudinaryUrl = result.secure_url;
//                     fs.unlink(req.files.avatar[0].path, () => {});
//                 }

//                 // Upload cover images if present
//                 if (req.files?.images) {
//                     const results = await Promise.all(
//                         req.files.images.map(file =>
//                             cloudinary.v2.uploader.upload(file.path, { folder: `${folder}/coverImages` })
//                         )
//                     );
//                     results.forEach((result, i) => {
//                         req.files.images[i].cloudinaryUrl = result.secure_url;
//                         fs.unlink(req.files.images[i].path, () => {});
//                     });
//                 }

//                 next();
//             } catch (err) {
//                 next(err);
//             }
//         }
//     ];
// }


export function cloudinaryUploadAvatarAndCover({ folder, customPath = "temp", customExtensions = [] }) {
    const upload = Multer({ customPath, customExtensions });

    return [
        upload.fields([
            { name: "avatar", maxCount: 1 },
            { name: "images", maxCount: 5 }
        ]),
        async (req, res, next) => {
            try {
                if (req.files?.avatar) {
                    const result = await cloudinary.v2.uploader.upload(req.files.avatar[0].path, {
                        folder: `${folder}/avatarImages`
                    });
                    req.files.avatar[0].cloudinaryUrl = result.secure_url;
                    req.files.avatar[0].publicId = result.public_id;
                    fs.unlink(req.files.avatar[0].path, () => {});
                }

                if (req.files?.images) {
                    const results = await Promise.all(
                        req.files.images.map(file =>
                            cloudinary.v2.uploader.upload(file.path, { folder: `${folder}/coverImages` })
                        )
                    );
                    results.forEach((result, i) => {
                        req.files.images[i].cloudinaryUrl = result.secure_url;
                        req.files.images[i].publicId = result.public_id;
                        fs.unlink(req.files.images[i].path, () => {});
                    });
                }

                next();
            } catch (err) {
                next(err);
            }
        }
    ];
}

