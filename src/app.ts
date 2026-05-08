import express, { application, Application, Request, Response } from 'express'
import { IndexRoutes } from './app/routes'
import cors from 'cors'
import { PaymentController } from './app/modules/payments/payments.controller'

const app:Application = express()

app.post('/webhook',express.raw({type:"application/json"}),PaymentController.handleStripeWebHooks)

app.use(
  cors({
    origin: [`${process.env.FRONTEND_URL}`, `${process.env.BACKEND_URL}`],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.urlencoded({extended:true}))

app.use(express.json())

app.use('/api/v1',IndexRoutes)

app.get('/',(req,res)=>{
    res.status(201).json({
       success:true,
       message:'Hello World'
    })
})

export default app

