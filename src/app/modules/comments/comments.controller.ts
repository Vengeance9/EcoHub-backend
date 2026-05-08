import { Request, Response } from "express";
import { CommentServices} from "./comments.services";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import { catchAsync } from "../../shared/cathAsync";
import { ICommentPayload } from "./comments.interface";

const createComments = catchAsync(
    async(req:Request,res:Response)=>{
        const ideaId = req.params.ideaId as string
        const {comment,parentId} = req.body

        let payload:ICommentPayload = {comment,ideaId}

        if(parentId){
            payload = {comment,ideaId,parentId}
        }   
        const result = await CommentServices.createComment(payload,req.user)
        sendResponse(res,{statusCode:status.OK,success:true,message:"Comment created successfully",data:result})
    }
)
const createreplies = catchAsync(async(req:Request,res:Response)=>{
    const parentId = req.params.parentId as string
    const {comment,ideaId} = req.body
    const payload = {comment,ideaId,parentId}
    const result = await CommentServices.createReplies(payload,req.user)
    sendResponse(res,{statusCode:status.OK,success:true,message:"Comment created successfully",data:result})
})
const getReplies = catchAsync(
    async(req:Request,res:Response)=>{
        const {parentId} = req.params
        const result = await CommentServices.getReplies(parentId as string)
        sendResponse(res,{statusCode:status.OK,success:true,message:"Replies fetched successfully",data:result})
    }
)
const getCommentByIdea = catchAsync(
    async(req:Request,res:Response)=>{
        const {ideaId} = req.params
        const result = await CommentServices.getCommentByIdea(ideaId as string)
       // console.log('RESULT IS THIS',result)
        sendResponse(res,{statusCode:status.OK,success:true,message:"Comments fetched successfully",data:result})
    }
)
const getCommentByUser = catchAsync(
    async(req:Request,res:Response)=>{
        const {userId} = req.params
        const result = await CommentServices.getCommentByUser(userId as string)
        sendResponse(res,{statusCode:status.OK,success:true,message:"Comments fetched successfully",data:result})
    }
)


export const CommentController = {createComments,createreplies,getReplies,getCommentByIdea,getCommentByUser}