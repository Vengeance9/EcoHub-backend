//import { UserStatus } from './../../../generated/prisma/enums';
import { Category, IdeaStatus, Role, UserStatus } from './../../../generated/prisma/browser';
import { prisma } from "../../lib/prisma"
import { QueryBuilder } from '../../utils/QueryBuilder';
import { IQueryParams } from '../../interfaces/query.interface';

const createCategory = async(name:string)=>{
    const CategoryExists = await prisma.category.findUnique({where:{name}})
    if(CategoryExists){
        throw new Error("Category already exists")
    }
    const category = await prisma.category.create({
        data:{
            name
        }
    })
    return category
}


const deleteCategory = async(categoryId:string)=>{
    const category = await prisma.category.delete({
        where:{id:categoryId}
    })
}

const ViewMembers = async(query:IQueryParams,userStatus:string)=>{
    let role
    let status = undefined
    query.userRole === 'USER'?role=Role.USER:query.userRole === 'ADMIN'?role=Role.ADMIN:undefined
    if(query.userStatus === 'ACTIVE') status = UserStatus.ACTIVE
    if(query.userStatus === 'INACTIVE') status = UserStatus.INACTIVE
    if(query.userStatus === 'BLOCKED') status = UserStatus.BLOCKED
    
    console.log('THIS IS THE USER Role',query.userRole,role)
    console.log('THIS IS THE status',query.userStatus)
    const result = await new QueryBuilder(prisma.user, query)
      .search()
      .filter()
      .fields('id,name,email,role,status,isDeleted,deletedAt,image,isSubscribed,createdAt,updatedAt',{
        _count: {
          select: {
            Idea: true,
            purchase:true,
            comment:true
          },
        },
      })
      .sort()
      .paginate()
      .where({
        status:status,
        isSubscribed:query.userSubscribed === 'subscribed'? true:undefined,
        role:role
     }).
      dynamicInclude(
        {
          _count: {
            select: {
              ideas: true,
            },
          },
        },
        ["ideas","_count"]
      )
      .execute();

      console.log('THIS IS THE RESULT FROM VIEW MEMBERS',result)

      return result
}

const activateUser = async(userId:string)=>{
    const user = await prisma.user.update({
        where:{id:userId},
        data:{status:UserStatus.ACTIVE}
    })
}

const blockUser = async(userId:string)=>{
    const user = await prisma.user.update({
        where:{id:userId},
        data:{status:UserStatus.BLOCKED}
    })
}

const approveideas = async (ideaId: string) => {
  const approve = await prisma.idea.update({
    where: { id: ideaId },
    data: {
      status: IdeaStatus.ACCEPTED,
    },
  });
};

const reviewideas = async (ideaId: string, feedback: string, review: string) => {
  let status
  console.log('THIS IS THE FEEDBACK FROM REVIEW IDEAS',JSON.stringify(feedback))
  let fb = JSON.stringify(feedback)
  review==="APPROVED"?status=IdeaStatus.ACCEPTED:status=IdeaStatus.REJECTED
  const giveReview = await prisma.idea.update({
    where: { id: ideaId },
    data: {
      status: status,
      feedback:fb,
      rejectedAt:review==="APPROVED"?null:new Date(),
      
    },
  });
  return giveReview
};

const viewIdeasByStatus = async(query:IQueryParams,status:string)=>{
    const result = await new QueryBuilder(prisma.idea, query)
      .search()
      .filter()
      .sort()
      .paginate()
      .where({ status: status })
      .execute();

    return result;
}
const updateRole = async(userId:string)=>{
  const userData = await prisma.user.findUnique({where:{id:userId}
  ,select:{
    id:true,
    email:true,
    name:true,
    role:true,
    image:true
  }
  })
  if(!userData){
    throw new Error("User not found")
  }
    const transaction = await prisma.$transaction(async(tx)=>{
      const user = await tx.user.update({
        where:{id:userId},
        data:{role:Role.ADMIN}
      })
      const admin = await tx.admin.create({
        data:{
          userId:userData.id,
          email:userData.email,
          name:userData.name,
          profilePhoto:userData.image
        }
      })
      return {user,admin}
    })
    return transaction
}
const updateStatus = async(userId:string,status:string)=>{
  let userStatus
   status==="ACTIVE"?userStatus=UserStatus.ACTIVE:(status==="INACTIVE"?userStatus=UserStatus.INACTIVE:(status==="BLOCKED"?userStatus=UserStatus.BLOCKED:userStatus=UserStatus.DELETED))
   const user = await prisma.user.update({
     where:{id:userId},
     data:{status:userStatus}
   })
   return user
  }


  const highlightIdea = async(ideaId:string)=>{
    const idea = await prisma.idea.update({
      where:{id:ideaId},
      data:{highlighted:true}
    })
    return idea
  }

export const AdminServices = {
  highlightIdea,
  updateStatus,
    createCategory,
    deleteCategory,
    ViewMembers,
    activateUser,
    blockUser,
    approveideas,
    reviewideas,
    viewIdeasByStatus,
    updateRole
}

