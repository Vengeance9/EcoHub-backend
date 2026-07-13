import express, { Request, Response } from 'express'
import { IdeaController } from './ideas.controller'
import auth from '../../middleware/checkAuth'
import { Role } from '../../../generated/prisma/enums'
import upload from '../../config/multer'
import { ideaServices } from './ideas.services'
import { prisma } from '../../lib/prisma'

const router = express.Router()


router.get('/',IdeaController.getAllIdeas)
router.post('/create-idea',auth(Role.USER,Role.ADMIN),upload.single("photo"),IdeaController.createIdeas)
router.get('/getCategories',IdeaController.getCategories)
router.get("/user", auth(Role.USER), IdeaController.getIdeasByUserId);
router.post('/save-idea',auth(Role.USER,Role.ADMIN),IdeaController.addToWatchList)
router.get('/getUserIdeaInfo',auth(Role.USER,Role.ADMIN),IdeaController.getUserIdeaInfo)
router.get("/top-contributers", IdeaController.getTopContributers);
router.get('/userStats',auth(Role.USER,Role.ADMIN),IdeaController.getUserStats)
router.get('/:ideaId',IdeaController.getIdeaById)
router.get('/isSaved/:ideaId',auth(Role.USER,Role.ADMIN),IdeaController.isSaved)
router.get('/canView/:ideaId',auth(Role.USER,Role.ADMIN),IdeaController.canViewPage)
router.patch('/update-idea/:ideaId',auth(Role.USER,Role.ADMIN),upload.single("photo"),IdeaController.updateIdeas)








export const IdeaRoutes= router