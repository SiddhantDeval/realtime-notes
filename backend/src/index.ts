import express from 'express'
import dotenv from 'dotenv'

// Determine the environment
const env = process.env.NODE_ENV || 'development'

// Load the corresponding .env file
dotenv.config({ path: `.env.${env}` })

const app = express()
const port = process.env.PORT

app.get('/', (req, res) => {
    res.send('Hello, TypeScript with Express!')
})

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`)
})
