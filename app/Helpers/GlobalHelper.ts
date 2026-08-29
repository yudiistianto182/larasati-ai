'use strict'

import fs from 'fs';

class GlobalHelper {
    async validateFile (file, validate) {
        if (!file) {
            return {
                status: false,
                message: 'Files is empty'
            }
        }

        if (!validate.extname.includes(file.extname)) {
            return {
                status: false,
                message: 'Files do not match the criteria'
            }
        }
        
        if (file.size > validate.size) {
            return {
                status: false,
                message: 'Files over size do not match the criteria'
            }
        }

        return true;

    }
}

module.exports = GlobalHelper