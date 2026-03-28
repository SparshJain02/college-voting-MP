import 'dotenv/config'

export const ENV = {
    MONGO_URL:process.env.MONGO_URL,
    PORT: process.env.PORT,
    JWT_SECRET:process.env.JWT_SECRET,
    VOTING_EMAIL_API:process.env.VOTING_EMAIL_API,
    EMAIL_APP_PASSWORD: process.env.EMAIL_APP_PASSWORD,
}