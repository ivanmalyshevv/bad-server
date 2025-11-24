import { NextFunction, Request, Response } from 'express'
import BadRequestError from '../errors/bad-request-error'

// Middleware для проверки на NoSQL-инъекции через $ операторы в query параметрах
export const validateNoSQLInjection = (
    req: Request,
    _res: Response,
    next: NextFunction
) => {
    try {
        // Проверяем все query параметры
        Object.keys(req.query).forEach((key) => {
            const value = req.query[key]
            // Блокируем $-операторы MongoDB в значениях
            if (typeof value === 'string' && value.includes('$')) {
                throw new BadRequestError('Некорректные параметры фильтра')
            }
            // Проверяем вложенные объекты
            if (typeof value === 'object' && value !== null) {
                const valueStr = JSON.stringify(value)
                if (valueStr.includes('$')) {
                    throw new BadRequestError('Некорректные параметры фильтра')
                }
            }
        })

        // Проверяем body параметры (для POST/PUT/PATCH)
        if (req.body && typeof req.body === 'object') {
            const checkBody = (obj: any, depth = 0) => {
                if (depth > 5) return // Ограничиваем глубину проверки
                Object.keys(obj).forEach((key) => {
                    // Блокируем ключи, начинающиеся с $
                    if (key.startsWith('$')) {
                        throw new BadRequestError('Некорректные параметры')
                    }
                    if (typeof obj[key] === 'object' && obj[key] !== null) {
                        checkBody(obj[key], depth + 1)
                    }
                })
            }
            checkBody(req.body)
        }

        next()
    } catch (error) {
        next(error)
    }
}
