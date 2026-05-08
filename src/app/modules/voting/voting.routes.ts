import express from 'express'
import { VotingController } from './voting.controller'
import auth from '../../middleware/checkAuth'
import { Role } from '../../../generated/prisma/enums'

const router = express.Router()

router.post('/vote/:ideaId',auth(Role.USER,Role.ADMIN), VotingController.vote)
router.get('/getVotes/:ideaId',VotingController.getVotes)
router.get('/user/:userId',VotingController.getUserLikedIdeas)
router.get('/user/Liked/:ideaId',auth(Role.USER,Role.ADMIN),VotingController.isUserLiked)
router.delete('/deleteVote/:ideaId',auth(Role.USER,Role.ADMIN),VotingController.deleteVote)

export const VotingRoutes = router