import { IQueryParams } from './../../interfaces/query.interface';
import { Request, Response } from "express";
import { catchAsync } from "../../shared/cathAsync";
import { AdminServices } from './admin.services';
import { send } from 'process';
import { sendResponse } from '../../shared/sendResponse';


const createCategory = catchAsync(
    async(req:Request,res:Response)=>{
        const {name} = req.body
        const result = await AdminServices.createCategory(name as string)
        sendResponse(res,{statusCode:200,success:true,message:"Category created successfully",data:result})
    }
)

const deleteCategory = catchAsync(
    async(req:Request,res:Response)=>{
        const {categoryId} = req.params
        const result = await AdminServices.deleteCategory(categoryId as string)
        sendResponse(res,{statusCode:200,success:true,message:"Category deleted successfully",data:result})
    }
)

const ViewMembers = catchAsync(
    async(req:Request,res:Response)=>{
        const {userstatus} = req.query
        const result = await AdminServices.ViewMembers(req.query as IQueryParams,userstatus as string)
        sendResponse(res,{statusCode:200,success:true,message:"Members fetched successfully",data:result})
    }
)

const activateUser = catchAsync(
    async(req:Request,res:Response)=>{
        const {userId} = req.params
        const result = await AdminServices.activateUser(userId as string)
        sendResponse(res,{statusCode:200,success:true,message:"User activated successfully",data:result})
    }
)

const blockUser = catchAsync(
    async(req:Request,res:Response)=>{
        const {userId} = req.params
        const result = await AdminServices.blockUser(userId as string)
        sendResponse(res,{statusCode:200,success:true,message:"User deactivated successfully",data:result})
    }
)

const approveIdeas = catchAsync(
    async(req:Request,res:Response)=>{
        const {ideaId} = req.params
        const result = await AdminServices.approveideas(ideaId as string)
        sendResponse(res,{statusCode:200,success:true,message:"Idea approved successfully",data:result})
    }
)

const reviewIdeas = catchAsync(
    async(req:Request,res:Response)=>{
        const {ideaId} = req.params
        const {feedback,status} = req.body
        
        const result = await AdminServices.reviewideas(ideaId as string,feedback as string,status as string)
        sendResponse(res,{statusCode:200,success:true,message:"Idea rejected successfully",data:result})
    }
)

const viewIdeasByStatus = catchAsync(
    async(req:Request,res:Response)=>{
        const {userStatus} = req.query
        const status = (userStatus! as string).toUpperCase()
        const result = await AdminServices.viewIdeasByStatus(req.query as IQueryParams,status as string)
        sendResponse(res,{statusCode:200,success:true,message:"Ideas fetched successfully",data:result})
    }
)

const updateRole = catchAsync(
    async(req:Request,res:Response)=>{
        const {userId} = req.params
       
        const result = await AdminServices.updateRole(userId as string)
        sendResponse(res,{statusCode:200,success:true,message:"Role updated successfully",data:result})
    }
)

const updateStatus = catchAsync(
    async(req:Request,res:Response)=>{
        const {userId} = req.params
        const {status} = req.body
        const result = await AdminServices.updateStatus(userId as string,status as string)
        sendResponse(res,{statusCode:200,success:true,message:"Status updated successfully",data:result})
    }
)
const highlightIdea = catchAsync(
    async(req:Request,res:Response)=>{
        const {ideaId} = req.params
        const result = await AdminServices.highlightIdea(ideaId as string)
        sendResponse(res,{statusCode:200,success:true,message:"Idea highlighted successfully",data:result})
    }
)



export const AdminController = {highlightIdea,updateStatus,updateRole,createCategory,deleteCategory,ViewMembers,activateUser,blockUser,approveIdeas,reviewIdeas,viewIdeasByStatus}
