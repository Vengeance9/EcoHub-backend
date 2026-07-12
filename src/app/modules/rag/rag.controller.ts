import { Request, Response } from "express";
import { catchAsync } from "../../shared/cathAsync";
import { RagService } from "./rag.service";
import { sendResponse } from "../../shared/sendResponse";
import status from "http-status";
import { redisService } from "../../lib/redis";

const ragService = new RagService()

const ingestIdeas = catchAsync(async(req:Request,res:Response)=>{
    const result = await ragService.ingestIdeas()

    sendResponse(res,{
        statusCode:200,
        success:true,
        message:'Indexed successfully',
        data:result
    })
})

const queryRag = catchAsync(async(req:Request,res:Response)=>{
    const {query,limit,sourceType} = req.body

    if (!query) {
    return sendResponse(res, {
      success: false,
      statusCode: status.BAD_REQUEST,
      message: "Query is required",
    });
    }
    const cacheKey = `rag:query:${query}:${limit ?? 5}:${sourceType || "all"}`;
    try {
      const cachedResult = await redisService.get(cacheKey)

      if(cachedResult){
        const parseData = JSON.parse(cachedResult)

        sendResponse(res,{
          success:true,
          statusCode:status.OK,
          message:"Answer retrieved from cache",
          data:parseData
        })
        return;
      }
      } catch (error) {
        console.log("Cache miss ")
      }

    const result = await ragService.getAnswers(
    query,
    limit ?? 5,
    sourceType,
    true,
  );

  try {
    await redisService.set(cacheKey,result,1800)  
  } catch (error) {
    console.log('Cache write error',error)
    
  }

  sendResponse(res, {
    success: true,
    statusCode: status.OK,
    message: "Answer generated successfully",
    data: result,
  });
  })

export const RagController = {ingestIdeas,queryRag}