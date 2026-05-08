import { VoteType } from "../../../generated/prisma/enums"
import { prisma } from "../../lib/prisma";
import { IVotePayload } from "./voting.interface";



const vote = async(payload:IVotePayload)=>{
    const alreadyVoted = await prisma.vote.findUnique({
        where:{
            userId_ideaId:{userId:payload.userId,ideaId:payload.ideaId},
        },
        select:{
            type:true
        }
    })
    if(!alreadyVoted){
        const prismaTransaction = await prisma.$transaction(async (tx) => {
          const vote = await tx.vote.create({
            data: payload,
          });
          const idea = await tx.idea.update({
            where: { id: payload.ideaId },
            data: {
              ...(payload.type == VoteType.UPVOTE
                ? { upvotes: { increment: 1 } }
                : { downvotes: { increment: 1 } }),
            },
          });
        });
        return prismaTransaction
    }
    if(alreadyVoted.type===payload.type){
        return
    }
    if(alreadyVoted.type!==payload.type){
        const prismaTransaction = await prisma.$transaction(async(tx)=>{
            const vote = await tx.vote.update({
                where:{userId_ideaId:{userId:payload.userId,ideaId:payload.ideaId}},
                data:{type:payload.type}
            })
            const idea = await tx.idea.update({
                where:{id:payload.ideaId},
                data:{...(payload.type==VoteType.UPVOTE?
                    {
                        upvotes:{increment:1,},
                        downvotes:{decrement:1}
                    
                    }:{
                        downvotes:{increment:1},
                        upvotes:{decrement:1}
                    })}
            })
        })
        return prismaTransaction
    }
    
    
}

const getVotes = async (ideaId: string) => {
    try {
        const [upvotes, downvotes] = await Promise.all([
            prisma.vote.count({
                where: {
                    ideaId: ideaId,
                    type: VoteType.UPVOTE
                }
            }),
            prisma.vote.count({
                where: {
                    ideaId: ideaId,
                    type: VoteType.DOWNVOTE
                }
            })
        ]);

        return {
            upvotes,
            downvotes,
        };
    } catch (error) {
        console.error('Error getting votes:', error);
        throw new Error('Failed to get vote counts');
    }
};


const getUserLikedIdeas = async (userId: string) => {
    try {  
        const likedIdeas = await prisma.idea.findMany({
            where: {
                vote: {
                    some: {
                        userId: userId,
                        type: VoteType.UPVOTE
                    }
                }
            }
        });

        return likedIdeas;
    }catch (error) {
        console.error('Error getting user liked ideas:', error);
        throw new Error('Failed to get liked ideas');
    }}


const deleteVote = async(ideaId:string,userId:string)=>{
    const vote = await prisma.vote.findUnique({
        where:{
            userId_ideaId:{
                userId,
                ideaId
            }
        }
    })
    if(!vote){
        throw new Error("Vote not found")
    }
    const deleteVote = await prisma.vote.delete({
        where:{
            userId_ideaId:{
                userId,
                ideaId
            }
        }
    })
    return {deleteVote,vote}
}

const isUserLiked = async(ideaId:string,userId:string)=>{
    const vote = await prisma.vote.findUnique({
        where:{
            userId_ideaId:{
                userId,
                ideaId
            }
        },
        select:{
            type:true
        }
    })
    if(vote)return vote
    return null
}
export const VotingServices = {vote,getVotes,getUserLikedIdeas,deleteVote,isUserLiked}