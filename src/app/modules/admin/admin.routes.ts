import express from 'express'
import { AdminController } from './admin.controller'
import auth from '../../middleware/checkAuth'
import { Role } from '../../../generated/prisma/enums'

const router = express.Router()

router.post('/create-category',auth(Role.ADMIN),AdminController.createCategory)
router.post('/delete-category/:categoryId',auth(Role.ADMIN),AdminController.deleteCategory)

router.get('/view-members',auth(Role.ADMIN),AdminController.ViewMembers)

router.get("/user-analytics", auth(Role.ADMIN), AdminController.getUserAnalytics);

router.post('/activate-user/:userId',auth(Role.ADMIN),AdminController.activateUser)
router.patch("/highlight-idea/:ideaId",auth(Role.ADMIN),AdminController.highlightIdea);
router.post('/block-user/:userId',auth(Role.ADMIN),AdminController.blockUser)
router.patch('/update-status/:userId',auth(Role.ADMIN),AdminController.updateStatus)
router.post('/approve-idea/:ideaId',auth(Role.ADMIN),AdminController.approveIdeas)
router.post('/review-idea/:ideaId',auth(Role.ADMIN),AdminController.reviewIdeas)
router.get('/view-ideas-by-status',auth(Role.ADMIN),AdminController.viewIdeasByStatus)
router.patch(
  "/update-role/:userId",
  auth(Role.ADMIN),
  AdminController.updateRole
);

export const AdminRoutes = router