import { Comments } from './../../../generated/prisma/browser';

import { IRequestUser } from "../../interfaces/interface";
import { prisma } from "../../lib/prisma";
import { ICommentPayload } from './comments.interface';



const createComment = async(payload:ICommentPayload,user:IRequestUser)=>{
    console.log("THIS IS THE PAYLOAD", payload);
    const result = await prisma.comments.create({
        data:{
            userId:user.userId,
            comment:payload.comment,
            ideaId:payload.ideaId,
            parentId:payload.parentId
        }
    })
    return result
}

const createReplies = async(payload:ICommentPayload,user:IRequestUser)=>{
    console.log('THIS IS THE PAYLOAD',payload)
    const result = await prisma.comments.create({
        data:{
            userId:user.userId,
            comment:payload.comment,
            ideaId:payload.ideaId,
            parentId:payload.parentId
        }
    })
    return result
}

const getReplies = async(parentId:string)=>{
    const replies  = await prisma.comments.findMany({
        where:{parentId},
        select:{
            id:true,
            comment:true,
            parentId:true,
            createdAt:true,
            isDeleted:true,
            ideaId:true,
            parent:{
                select:{
                    user:{select:{id:true,name:true}}
                }
            },
            user:{
                select:{id:true,name:true}
            },
            _count:{select:{replies:true}}
        },
        orderBy:{createdAt:'desc'},
    })    
    return replies
}

const getCommentByIdea = async(ideaid:string)=>{
    const comment = await prisma.comments.findMany({
        where:{ideaId:ideaid,parentId:null},
        select:{
            id:true,
            comment:true,
            parentId:true,
            createdAt:true,
            isDeleted:true,
            ideaId:true,
            user:{
                select:{id:true,name:true}
            },
            _count:{select:{replies:true}}
        },
        orderBy:{createdAt:'desc'},
    })
    return comment
}

const getCommentByUser = async(userId:string)=>{
    const Comments = await prisma.comments.findMany({
        where:{userId},
        select:{
            id:true,
            comment:true,
            parentId:true,
            createdAt:true,
            isDeleted:true,
            ideaId:true,
            user:{
                select:{id:true,name:true}
            },
            _count:{select:{replies:true}}
        },
        orderBy:{createdAt:'desc'},
    })
}


export const CommentServices = {createComment,createReplies,getReplies,getCommentByIdea,getCommentByUser}