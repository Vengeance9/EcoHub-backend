import express from "express";
import { RagController } from "./rag.controller";

const router = express.Router()

router.post('/index-ideas',RagController.ingestIdeas)
router.post('/query',RagController.queryRag)

export const RagRoutes = router