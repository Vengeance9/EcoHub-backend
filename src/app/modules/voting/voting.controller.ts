import { Request, Response } from "express";
import { catchAsync } from "../../shared/cathAsync";
import { IVotePayload, VotingServices } from "./voting.services";
import status from "http-status";
import { sendResponse } from "../../shared/sendResponse";

const vote = catchAsync(async(req:Request,res:Response)=>{
    const {ideaId} = req.params
    const {type} = req.body
    const {userId} = req.user

    console.log('USER ID',userId)
    console.log('TYPE',type)
    console.log('IDEA ID',ideaId)
    const payload = {ideaId,type,userId}
    const result = await VotingServices.vote(payload as IVotePayload)
    sendResponse(res,{statusCode:status.OK,success:true,message:"Vote created successfully",data:result})  
})
const getVotes = catchAsync(
    async(req:Request,res:Response)=>{
        const {ideaId} = req.params
        const result = await VotingServices.getVotes(ideaId as string)
        sendResponse(res,{statusCode:status.OK,success:true,message:"Votes fetched successfully",data:result})
    }
)
const getUserLikedIdeas = catchAsync(
    async(req:Request,res:Response)=>{
        const {userId} = req.params
        const result = await VotingServices.getUserLikedIdeas(userId as string)
        sendResponse(res,{statusCode:status.OK,success:true,message:"User liked ideas fetched successfully",data:result})
    }
)

const deleteVote = catchAsync(
    async(req:Request,res:Response)=>{
        const {ideaId} = req.params
        const {userId} = req.user
        console.log('USER ID from deleetvoteo',userId)
        console.log('IDEA ID from deleteVotoe',ideaId)
        const result = await VotingServices.deleteVote(ideaId as string,userId as string)
        console.log('RESULT of deleting vote',result)
        sendResponse(res,{statusCode:status.OK,success:true,message:"Vote deleted successfully",data:result})
    }
)

const isUserLiked = catchAsync(
    async(req:Request,res:Response)=>{
        const {ideaId} = req.params
        const {userId} = req.user
        const result = await VotingServices.isUserLiked(ideaId as string,userId as string)
        sendResponse(res,{statusCode:status.OK,success:true,message:"Fetched successfully",data:result})
    }
)
export const VotingController = {vote,getVotes,getUserLikedIdeas,deleteVote,isUserLiked}