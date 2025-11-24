import { Request, Express } from 'express'
import multer, { FileFilterCallback } from 'multer'
import crypto from 'crypto'
import { join, extname } from 'path'

type DestinationCallback = (error: Error | null, destination: string) => void
type FileNameCallback = (error: Error | null, filename: string) => void

const storage = multer.diskStorage({
    destination: (
        _req: Request,
        _file: Express.Multer.File,
        cb: DestinationCallback
    ) => {
        cb(
            null,
            join(
                __dirname,
                process.env.UPLOAD_PATH_TEMP
                    ? `../public/${process.env.UPLOAD_PATH_TEMP}`
                    : '../public'
            )
        )
    },

    filename: (
        _req: Request,
        file: Express.Multer.File,
        cb: FileNameCallback
    ) => {
        try {
            const ext = extname(file.originalname) || ''
            const safeName = `${Date.now()}-${crypto
                .randomBytes(8)
                .toString('hex')}${ext}`
            cb(null, safeName)
        } catch (error) {
            cb(error as Error, '')
        }
    },
})

const types = [
    'image/png',
    'image/jpg',
    'image/jpeg',
    'image/gif',
    'image/svg+xml',
]

const fileFilter = (
    _req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
) => {
    if (!types.includes(file.mimetype)) {
        return cb(null, false)
    }

    return cb(null, true)
}

const maxSize = Number(process.env.UPLOAD_MAX_SIZE) || 5 * 1024 * 1024

export default multer({ storage, fileFilter, limits: { fileSize: maxSize } })
