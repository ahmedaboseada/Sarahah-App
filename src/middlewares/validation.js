import joi from "joi";

export const validation = (schema) => {
    return (req, res, next) => {
        const resultErrors = [];

        for (const key of Object.keys(schema)) {
            const { error } = schema[key].validate(req[key], { abortEarly: false });
            if (error) {
                const messages = error.details.map(detail => detail.message);
                resultErrors.push(...messages);
            }
        }

        if (resultErrors.length > 0) {
            return res.status(400).json({
                message: "Validation Error",
                errors: resultErrors,
            });
        }

        next();
    };
};
