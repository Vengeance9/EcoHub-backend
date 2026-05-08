import express from 'express'
import auth from '../../middleware/checkAuth'
import { Role } from '../../../generated/prisma/enums'
import { PaymentController } from './payments.controller'

const router = express.Router()

router.post('/pay/:ideaId',auth(Role.USER),PaymentController.payForIdeas)
router.get('/user/:userId',PaymentController.getUserPaymentDetails)

export const PaymentRoutes = router
