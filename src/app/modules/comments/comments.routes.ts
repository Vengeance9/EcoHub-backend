import express from 'express'
import { CommentController } from './comments.controller'
import auth from '../../middleware/checkAuth'
import { Role } from '../../../generated/prisma/enums'

const router = express.Router()

router.post('/create-comment/:ideaId',auth(Role.USER),CommentController.createComments)
router.post('/create-replies/:ideaId',auth(Role.USER),CommentController.createreplies)
router.get('/replies/:parentId',CommentController.getReplies)
router.get('/idea/:ideaId',CommentController.getCommentByIdea)
router.get('/user/:userId',CommentController.getCommentByUser)

export const CommentRoutes = router