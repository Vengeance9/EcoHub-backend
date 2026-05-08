import { Request, Response } from "express";
import { catchAsync } from "../../shared/cathAsync";
import { sendResponse } from "../../shared/sendResponse";
import { ideaServices } from "./ideas.services";
import { IQueryParams } from "../../interfaces/query.interface";

const getAllIdeas = catchAsync(async (req: Request, res: Response) => {
    const ideas = await ideaServices.getAllIdeas(req.query as IQueryParams)
    sendResponse(res,{
        statusCode:200,
        success:true,
        message:"Ideas fetched successfully",
        data:ideas
    })
}); 

const createIdeas = catchAsync(
    async(req:Request,res:Response)=>{
          
       
        console.log('USER from createIdeas controller',req.user)
        //const {title,problem,solution,description,categoryId,isPaid,price} = req.body
        const payload = {...req.body,isPaid:req.body.isPaid==='true',price:req.body.price?Number(req.body.price):undefined}

        const result = await ideaServices.createIdeas(payload,req.user,req.file)
        
        sendResponse(res,{statusCode:200,success:true,message:"Idea created successfully",data:result})
    }
)
const updateIdeas = catchAsync(
    async(req:Request,res:Response)=>{
          
        const {ideaId} = req.params
        console.log('USER from UpdateIdeas controller',req.user)
       
        const payload = {...req.body,isPaid:req.body.isPaid==='true',price:req.body.price?Number(req.body.price):undefined}

        const result = await ideaServices.updateIdeas(payload,ideaId as string,req.user,req.file)
        
        sendResponse(res,{statusCode:200,success:true,message:"Idea updated successfully",data:result})
    }
)

const getIdeaById = catchAsync(
    async(req:Request,res:Response)=>{
        const {ideaId} = req.params
        const result = await ideaServices.getIdeaById(ideaId as string)
        
        sendResponse(res,{statusCode:200,success:true,message:"Idea fetched successfully",data:result})
    }
)

const getCategories = catchAsync(
    async(req:Request,res:Response)=>{
        const result = await ideaServices.getCategories()
        //console.log('RESULT IS HERE',result)
        sendResponse(res,{statusCode:200,success:true,message:"Categories fetched successfully",data:result})
    }
)

const getIdeasByUserId = catchAsync(
    async(req:Request,res:Response)=>{
        const {userId} = req.user
        const result = await ideaServices.getIdeasByUserId(req.query as IQueryParams,userId as string)
        //console.log('RESULT is aodoifbeobo',result)
        sendResponse(res,{statusCode:200,success:true,message:"Ideas of this user is fetched successfully",data:result})
    
})

const getUserIdeaInfo = catchAsync(
    async(req:Request,res:Response)=>{
        const {userId} = req.user
        const result = await ideaServices.getUserIdeaInfo(userId as string)
        sendResponse(res,{statusCode:200,success:true,message:"User idea info fetched successfully",data:result})
    }
)

const canViewPage = catchAsync(
    async(req:Request,res:Response)=>{
        const {userId} = req.user
        const {ideaId} = req.params
        const result = await ideaServices.canViewPage(userId as string,ideaId as string)
        sendResponse(res,{statusCode:200,success:true,message:"View access resturned successfully",data:result})
    }
)

const addToWatchList = catchAsync(
    async(req:Request,res:Response)=>{
        const {ideaId} = req.body
        const userId = req.user.userId
        console.log('USER ID from addToWatchList',userId)
        const result = await ideaServices.addToWatchList(userId as string,ideaId as string)
        sendResponse(res,{statusCode:200,success:true,message:"Idea added to watchlist successfully",data:result}) 
    }
)

const removeFromWatchList = catchAsync(
    async(req:Request,res:Response)=>{
        const {ideaId} = req.params
        const userId = req.user.userId
        const result = await ideaServices.removeFromWatchList(userId as string,ideaId as string)
        sendResponse(res,{statusCode:200,success:true,message:"Idea removed from watchlist successfully",data:result}) 
    }
)

const getWatchList = catchAsync(
    async(req:Request,res:Response)=>{
        const userId = req.user.userId
        const result = await ideaServices.getWatchList(userId as string)
        sendResponse(res,{statusCode:200,success:true,message:"Watchlist fetched successfully",data:result}) 
    }
)

const isSaved = catchAsync(
    async(req:Request,res:Response)=>{
        const {ideaId} = req.params
        const userId = req.user.userId
        const result = await ideaServices.isSaved(userId as string,ideaId as string)
        sendResponse(res,{statusCode:200,success:true,message:"Watchlist fetched successfully",data:result}) 
    }
)
export const IdeaController = { isSaved,addToWatchList,getWatchList,removeFromWatchList,getAllIdeas,createIdeas,updateIdeas,getCategories,getIdeaById,getIdeasByUserId,getUserIdeaInfo,canViewPage }
