import rateLimit from 'express-rate-limit'

// Общий лимитер API: 100 запросов в 15 минут
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 минут
    max: 100, // ограничить IP до 100 запросов в windowMs
    message: 'Слишком много запросов с этого IP, пожалуйста, попробуйте позже.',
    standardHeaders: true, // возвращать информацию о лимите в заголовках RateLimit-*
    legacyHeaders: false, // отключить X-RateLimit-* заголовки
    skip: (req) =>
        // пропустить лимитинг для GET запросов статических файлов
        req.method === 'GET' && req.path.startsWith('/images'),
})

// Более строгий лимитер для авторизации: 5 запросов в 15 минут
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'Слишком много попыток входа, пожалуйста, попробуйте позже.',
    standardHeaders: true,
    legacyHeaders: false,
})

// Лимитер для загрузки файлов: 10 запросов в час
export const uploadLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 час
    max: 10,
    message: 'Слишком много загрузок файлов, пожалуйста, попробуйте позже.',
    standardHeaders: true,
    legacyHeaders: false,
})
