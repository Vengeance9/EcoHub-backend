import express from 'express'
import { IdeaRoutes } from '../modules/ideas/ideas.route'
import { AuthRoutes } from '../modules/auth/auth.routes'
import { CommentRoutes } from '../modules/comments/comments.routes'
import { VotingRoutes } from '../modules/voting/voting.routes'
import { AdminRoutes } from '../modules/admin/admin.routes'
import { PaymentRoutes } from '../modules/payments/payment.route'

const router = express.Router()

router.use('/ideas',IdeaRoutes)
router.use('/auth',AuthRoutes)
router.use('/comments',CommentRoutes)
router.use('/voting',VotingRoutes)
router.use('/admin',AdminRoutes)
router.use('/payment',PaymentRoutes)

export const IndexRoutes = router