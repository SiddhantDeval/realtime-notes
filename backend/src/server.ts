import express from 'express'
import dotenv from 'dotenv'
import routes from '@/routes'


// Determine the environment
const env = process.env.NODE_ENV || 'development'
// Load the corresponding .env file
dotenv.config({ path: `.env.${env}` })

const app = express()
const port = process.env.PORT

app.use(express.json())
app.use(express.urlencoded({ extended: true }))


app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Server is running on http://localhost:${port}`)
})

// mount Router handlers 
app.use('/', routes)
