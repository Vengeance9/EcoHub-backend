import { WatchList } from './../../../generated/prisma/browser';
import status from "http-status";
import { IdeaStatus, PaymentStatus, VoteType } from "../../../generated/prisma/enums";
import { IRequestUser } from "../../interfaces/interface";
import { IQueryParams } from "../../interfaces/query.interface";
import { prisma } from "../../lib/prisma";
import { QueryBuilder } from "../../utils/QueryBuilder";
import { ideaFilterableFields, ideaSearchableFields } from "./ideas.constants";
import { IIdeaPayload, IIdeaUpdatePayload } from "./ideas.interface";
import AppError from "../../errorHelpers/AppError";
import { deleteFileFromCloudinary, uploadFileToCloudinary } from "../../config/cloudinary";

const getAllIdeas = async (query: IQueryParams) => {
  let status = undefined;
  if (query.where && query.where === "APPROVED") status = IdeaStatus.ACCEPTED;
  if (query.where && query.where === "REJECTED") status = IdeaStatus.REJECTED;
  if (query.where && query.where === "DRAFT") status = IdeaStatus.DRAFT;
  if (query.where && query.where === "UNDERREVIEW")status = IdeaStatus.UNDERREVIEW;

  console.log('THIS IS THE QUERY WHERE',query.where)
  
  
  const result = await new QueryBuilder(prisma.idea, query, {
    searchableFields: ideaSearchableFields,
    filterableFields: ideaFilterableFields,
  })
    .search()
    .filter()
    .sort()
    .paginate()
    .where({ status: status,categoryId:query.category })
    .dynamicInclude(
      {
        user: { select: { id: true, name: true } },
        category: true,
        _count: { select: { comments: true } },
        
      },
      ["user", "category", "purchase", "comments", "_count"]
    )
    .execute();

    console.log('THIS IS THE QUERY.EDITED',query.edited)

    if(query.edited ==='editedAt'){
      result.data = result.data.filter((idea:any)=>{
        return(
        idea.editedAt && idea.rejectedAt && 
        new Date(idea.editedAt)>new Date(idea.rejectedAt))
        console.log('IDEA from the file',idea)
      })
      result.meta.total = result.data.length
      result.meta.totalPages = Math.ceil(result.meta.total/result.meta.limit)
      console.log('THIS IS THE RESULT',result.data)
      console.log('THIS IS THE RESULT META',result.meta)
    }

  return result;
};



const createIdeas = async (payload: IIdeaPayload, user: IRequestUser,file?:Express.Multer.File) => {
  let imageUrl = null
  

  console.log('payload from createIdeas services',payload)
  console.log('File from createIdeas controller',file)

  try{
    if(file){
      if (file.size > 2 * 1024 * 1024) {
        throw new Error("Image too large. Max size is 2MB");
      }
    const uploadedResult = await uploadFileToCloudinary(file.buffer,file.originalname)
    imageUrl = uploadedResult.secure_url
  }else{
    console.log('Error occured in the file upload')
    throw new AppError(status.BAD_REQUEST, "Image is needed")
  }
  const result = await prisma.idea.create({
    data: {
      ...payload,
      userId: user.userId,
      photo:imageUrl,
      
    },
  });
  return result;
}catch(err:any){
  if(imageUrl){
    await deleteFileFromCloudinary(imageUrl)
  }
  console.log('Error occured in the try-catch',err)
  throw new AppError(status.BAD_REQUEST, err.message)
}
};

const getIdeaById = async (ideaId: string) => {
  const result = await prisma.idea.findUnique({
    where: { id: ideaId },
    select: {
      id: true,
      title: true,
      problem: true,
      solution: true,
      photo: true,
      description: true,
      createdAt: true,
      userId: true,
      isPaid: true,
      price: true,
      feedback: true,
      highlighted: true,
      user: {
        select: {name: true },
      },
      status: true,
      categoryId: true,
      category: {
        select: { name: true },
      },
      purchase: {
        select: { id: true },
      },
      comments: {
        select: {
          id: true,
          comment: true,
          parentId: true,
          createdAt: true,
          isDeleted: true,
          ideaId: true,
          user: {
            select: { id: true, name: true },
          },
          _count: { select: { replies: true } },
        },
      },
      vote: {
        select: {
          id: true,
          userId: true,
          type: true,
        },
      },
      _count:{select:{purchase:true}}
    },
  });

  const upvotes = await prisma.vote.count({
    where: {
      ideaId: ideaId,
      type: VoteType.UPVOTE,
    },
  });

  const downvotes = await prisma.vote.count({
    where: {
      ideaId: ideaId,
      type: VoteType.DOWNVOTE,
    },
  });  
  return {
    result,
    upvotes,
    downvotes
};
}



const getIdeasByUserId = async (query: IQueryParams,userId:string) => {
//console.log('THE QUERIES IN GET IDEAS BY USER ID',query)
let status = undefined
let WatchList = undefined
if(query.where && query.where === "APPROVED")status = IdeaStatus.ACCEPTED
if(query.where && query.where === "REJECTED")status = IdeaStatus.REJECTED
if(query.where && query.where === "DRAFT")status = IdeaStatus.DRAFT
if(query.where && query.where === "UNDERREVIEW")status = IdeaStatus.UNDERREVIEW
if(query.where && query.where === "WatchListed"){
  status = undefined
  WatchList = true
}
console.log('THIS IS THE STATUS type',typeof(status))
  let result = await new QueryBuilder(prisma.idea,query,{
    searchableFields: ideaSearchableFields,
    filterableFields: ideaFilterableFields,
  }).search().filter().sort().paginate().
  where({userId:WatchList?undefined:userId,status:status,
    watchList:WatchList?{some:{userId:userId}}:undefined}).dynamicInclude({
    
    category: true,
    _count: { select: { comments: true } },
  },["user","category","purchase","comments","_count","watchlist"]).execute();

  // const watchListed = await prisma.watchList.findMany({
  //   where:{userId:userId},
  //   select:{
  //     ideaId:true,
  //     idea:{
  //       select:{
  //         id:true,
  //         title:true,
  //         photo:true,
  //         description:true,
  //         createdAt:true,
  //         userId:true,
  //         isPaid:true,
  //         price:true,
  //         feedback:true,
  //         highlighted:true,
  //         user:{select:{name:true}},
  //         status:true,
  //         categoryId:true,
  //         category:{select:{name:true}},
  //         purchase:{select:{id:true}},
  //         comments:{select:{id:true,comment:true,parentId:true,createdAt:true,isDeleted:true,ideaId:true,user:{select:{id:true,name:true}},_count:{select:{replies:true}}}},
  //         vote:{select:{id:true,userId:true,type:true}},
  //         _count:{select:{comments:true}}
  //       }
  //     }
  //   }
  // })

  //console.log('THIS IS THE WATCHLISTED',watchListed)
  console.log('THIS IS THE RESULT',result)

   //result = {...result,data:[...result.data,...watchListed]}
  return result
  }


const getIdeasByCategoryId = async (categoryId: string, user: IRequestUser) => {
  const result = await prisma.idea.findMany({
    where: { categoryId },
  });
  return result;
};

const updateIdeas = async (
  payload: IIdeaUpdatePayload,
  ideaId: string,
  user: IRequestUser,
  file?: Express.Multer.File
) => {
  const idea = await prisma.idea.findUnique({
    where: { id: ideaId },
    select:{
      status:true,
      photo:true
    }
  });
  if (
    !idea ||
    idea.status == IdeaStatus.ACCEPTED 
  ) {
    throw new AppError(status.FORBIDDEN, "Cannot Update Idea");
  }
  let imageUrl = idea.photo

  if (file) {
    const uploadedResult = await uploadFileToCloudinary(
      file.buffer,
      file.originalname
    );
    imageUrl = uploadedResult.secure_url;
  }
  const result = await prisma.idea.update({
    where: { id: ideaId },
    data: {
      ...payload,
      userId: user.userId,
      photo:imageUrl,
      editedAt:new Date(),
      status:IdeaStatus.UNDERREVIEW
    },
  });
  return result;
};

const deleteideas = async (ideaId: string, user: IRequestUser) => {
  const result = await prisma.idea.delete({
    where: { id: ideaId },
  });
  return result;
};
const getCategories = async () => {
  const result = await prisma.category.findMany();
  return result;
};

const getUserIdeaInfo = async(userId:string)=>{
  const approvedIdeas = await prisma.idea.count({
    where: {
      userId: userId,
      status: IdeaStatus.ACCEPTED,
    },
  })
  const rejectedIdeas = await prisma.idea.count({
    where:{
      status:IdeaStatus.REJECTED,
      userId:userId
    }
  })
  const totalIdeas = await prisma.idea.count({
    where: {
      userId: userId,
    },
  })
  const totalUpvotes = await prisma.vote.count({
    where:{
      userId
    }
  })
  const totalDownvotes = await prisma.vote.count({
    where:{
      userId,
      type:VoteType.DOWNVOTE
    }
  })
  const draftedIdeas = await prisma.idea.count({
    where: {
      userId: userId,
      status: IdeaStatus.DRAFT,
    },
  })
  
  const totalRevenue = await prisma.purchase.aggregate({
    _sum:{
      amount:true
    },
    where:{
      idea:{
        userId
      }
    }
  })
  return {approvedIdeas,rejectedIdeas,totalIdeas,totalUpvotes,totalDownvotes,draftedIdeas,Revenue:totalRevenue._sum.amount}
}

const canViewPage = async(userId:string,ideaId:string)=>{
  const purchased = await prisma.purchase.findUnique({
    where:{
      userId_ideaId:{
        userId,
        ideaId
      },
      status:PaymentStatus.PAID
    }
  })
  const idea = await prisma.idea.findUnique({
    where:{
      id:ideaId,
      userId:userId
    }
  })
  if(purchased || idea){
    return true
  }
  return false
}

const addToWatchList = async(userId:string,ideaId:string)=>{
  const result = await prisma.watchList.create({
    data:{
      userId,
      ideaId
    }
  })
  return result
}

const getWatchList = async(userId:string)=>{
  const result = await prisma.watchList.findMany({
    where:{
      userId
    }
  })
  return result
}

const removeFromWatchList = async(userId:string,ideaId:string)=>{
  const result = await prisma.watchList.delete({
    where:{
      userId_ideaId:{
        userId,
        ideaId
      }
    }
  })
  return result
}


const isSaved = async(userId:string,ideaId:string)=>{
  const result = await prisma.watchList.findUnique({
    where:{
      userId_ideaId:{
        userId,
        ideaId
      }
    }
  })
  if(result){
    return true
  }
  return false
}

const getTopContributers = async()=>{
  const result = await prisma.idea.groupBy({
    by: ["userId"],
    where:{
      status:IdeaStatus.ACCEPTED
    },
    _count: {
      userId: true,
    },
    orderBy: {
      _count: {
        userId: "desc",
      },
    },
    take:3
  });

  const users = await Promise.all(
    result.map(async(c)=>{
      const user = await prisma.user.findFirst({
        where:{
          id:c.userId
        },
        select:{
          name:true,
          image:true
        }
      })
      return {
        ...user,
        totalIdeas:c._count.userId
      }
    })
  )
  return users
}

const getUserStats = async(userId:string)=>{
  const acceptedIdeas = await prisma.idea.count({
    where:{
      userId:userId,
      status:IdeaStatus.ACCEPTED
    }
  })
  const rejectedIdeas = await prisma.idea.count({
    where:{
      userId:userId,
      status:IdeaStatus.REJECTED
    }
  })
  const underReviewIdeas = await prisma.idea.count({
    where:{
      userId:userId,
      status:IdeaStatus.UNDERREVIEW
    }
  })

  const paidIdeas = await prisma.idea.count({
    where:{
        userId:userId,
        isPaid:true
      },
  })
  const FreeIdeas = await prisma.idea.count({
    where:{
        userId:userId,
        isPaid:false
      },
    }
  )

  return{
    acceptedIdeas,
    rejectedIdeas,
    underReviewIdeas,
    paidIdeas,
    FreeIdeas
  }
}


export const ideaServices = {
  getUserStats,
  getTopContributers,
  isSaved,
  addToWatchList,
  getWatchList,
  removeFromWatchList,
  getAllIdeas,
  createIdeas,
  getIdeaById,
  getIdeasByUserId,
  getIdeasByCategoryId,
  updateIdeas,
  deleteideas,
  getCategories,
  getUserIdeaInfo,
  canViewPage
  

}
