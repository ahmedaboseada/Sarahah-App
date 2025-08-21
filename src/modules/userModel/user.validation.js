import joi from "joi";
import { userGender } from "../../config/CONSTANTS.js";

export const signupSchema = {
    body: joi.object({
        name: joi.string()
            .required()
            .pattern(/^[a-zA-Z ]+$/)
            .min(2)
            .max(50)
            .messages({
                'string.pattern.base': 'Name must contain only letters and spaces',
            }),

        email: joi.string()
            .email()
            .required()
            .messages({
                'string.email': 'Email must be a valid email address',
            }),

        password: joi.string()
            .required()
            .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
            .messages({
                'string.pattern.base': 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character',
            }),

        confirmPassword: joi.string()
            .required()
            .valid(joi.ref('password'))
            .messages({
                'any.only': 'Passwords do not match',
            }),

        gender: joi.string()
            .required()
            .valid(...Object.values(userGender)).messages({
                'any.only': 'Gender must be male or female',
            }),

        phone: joi.string()
            .required()
            .pattern(/^(?:\+20|0020|0)?(10|11|12|15)[0-9]{8}$/)
            .messages({
                'string.pattern.base': 'Phone number must be 11 digits',
            }),
    })
};

export const signinSchema = {
    body: joi.object({
        email: joi.string().email().required().messages({
            'string.email': 'Email must be a valid email address',
        }),
        password: joi.string().required().messages({
            'string.empty': 'Password is required',
        }),
    })
};

export const updatePasswordSchema = {
    body: joi.object({
        oldPassword: joi.string()
            .required()
            .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
            .messages({
                'string.pattern.base': 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character',
            }),
        newPassword: joi.string()
            .required()
            .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
            .messages({
                'string.pattern.base': 'Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character',
            }),

        confirmPassword: joi.string()
            .required()
            .valid(joi.ref('newPassword'))
            .messages({
                'any.only': 'Passwords do not match',
            })
    })
}

export const forgetPasswordSchema = {
    body: joi.object({
        email: joi.string().email().required().messages({
            'string.email': 'Email must be a valid email address',
        }),
    })
}

export const checkOTPSchema = {
    body: joi.object({
        otp: joi.string().pattern(/^[0-9]{6}$/).required().messages({
            'string.pattern.base': 'OTP must be 6 digits',
        }),
        email:joi.string().email().required().messages({
            'string.email': 'Email must be a valid email address',
        })
    })
}

export const updateProfile = {
    body: joi.object({
        name: joi.string().pattern(/^[a-zA-Z ]+$/).min(2).max(50).messages({
            'string.pattern.base': 'Name must contain only letters and spaces',
        }),
        email: joi.string().email().messages({
            'string.email': 'Email must be a valid email address',
        }),
        phone: joi.string().pattern(/^(?:\+20|0020|0)?(10|11|12|15)[0-9]{8}$/).messages({
            'string.pattern.base': 'Phone number must be 11 digits',
        }),
        gender: joi.string().valid(...Object.values(userGender)).messages({
            'any.only': 'Gender must be male or female',
        })
    })
}

export const getProfileSchema = {
    params: joi.object({
        id: joi.string().required().hex().length(24).messages({
            'string.empty': 'User ID is required',
            'string.length': 'User ID must be 24 characters long',
            'string.hex': 'User ID must be a valid hex string',
        }),
    })
}

export const freezeAccountSchema = {
    params: joi.object({
        id: joi.string().hex().length(24).messages({
            'string.empty': 'User ID is required',
            'string.length': 'User ID must be 24 characters long',
            'string.hex': 'User ID must be a valid hex string',
        }),
    })
}

export const unfreezeAccountSchema = {
    params: joi.object({
        id: joi.string().hex().length(24).messages({
            'string.empty': 'User ID is required',
            'string.length': 'User ID must be 24 characters long',
            'string.hex': 'User ID must be a valid hex string',
        }),
    })
}

export const deleteUserSchema = {
    params: joi.object({
        id: joi.string().hex().length(24).messages({
            'string.empty': 'User ID is required',
            'string.length': 'User ID must be 24 characters long',
            'string.hex': 'User ID must be a valid hex string',
        }),
    })
}


// Regex
/*
a -> any occurence of a
ab -> any occurence of ab
a|b -> any occurence of a or b
[ab] -> any occurence of a or b
[a-z]-> any occurence of a to z
[a-zA-Z]-> any occurence of a to z or A to Z
[web][a-zA-Z] -> any occurence of web characters or a to z or A to Z
^a -> any occurence of a at the start of the string
^[a-zA-Z]{number-number} -> any occurence of a to z or A to Z at the start of the string with length of number-number
$ -> any occurence of a at the end of the string
*/


// ^01[0125][0-9]{8}$ -> any occurence of 010 or 011 or 012 or 015 at the start of the string with length of 11 digits

/*
?: -> non-capturing group
^(002){0,1}01[0125][0-9]{8}$ -> any occurence of 010 or 011 or 012 or 015 at the start of the string with length of 11 digits
(002){0,1} -> any occurence of 002 at the start of the string with length of 11 digits
{0,} -> zero or more
{1,} -> one or more
? -> zero or one
+ -> one or more
. -> any character
.{number-number} -> any character with length of number-number
\. -> dot character
\+ -> plus character
\d -> any digit
\D -> any non-digit
\w -> any word character except special characters
\W -> any special characters
^[^0-9] -> any character except digits
/g -> global search
/i -> case-insensitive search
*/