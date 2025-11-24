import { NextFunction, Request, Response } from 'express'
import { constants } from 'http2'
import BadRequestError from '../errors/bad-request-error'

export const uploadFile = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        if (!req.file) {
            return next(new BadRequestError('Файл не загружен'))
        }

        // Проверяем, что файл имеет безопасное имя (не оригинальное)
        const fileName = req.file.filename
        // Имя должно быть в формате timestamp-randomhex.ext и не содержать опасные символы
        if (!fileName.includes('-') || fileName.includes('..') || fileName.includes('/')) {
            return next(new BadRequestError('Некорректное имя файла'))
        }

        const filePath = process.env.UPLOAD_PATH_TEMP
            ? `/${process.env.UPLOAD_PATH_TEMP}/${fileName}`
            : `/${fileName}`

        return res.status(constants.HTTP_STATUS_CREATED).send({
            fileName: filePath,
            originalName: req.file.originalname,
            size: req.file.size,
            mimetype: req.file.mimetype
        })
    } catch (error) {
        return next(error)
    }
}

export default {}