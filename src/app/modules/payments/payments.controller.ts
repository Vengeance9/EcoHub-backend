import { Request, Response } from "express";
import { catchAsync } from "../../shared/cathAsync";
import status from "http-status";
import { sendResponse } from "../../shared/sendResponse";
import { stripe } from "../../config/stripe";
import { paymentServices } from "./payment.services";


const handleStripeWebHooks = catchAsync(
    async(req:Request,res:Response)=>{
        const signature = req.headers['stripe-signature'] as string
        const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET as string

        if(!signature || !webhookSecret){
            return res.status(status.BAD_REQUEST).json({message:"Missing Stripe Signature or Webhook Secret"});
        }
        let event

        try {
          event = stripe.webhooks.constructEvent(
            req.body,
            signature,
            webhookSecret
          );
        } catch (error: any) {
          console.error("Error processing Stripe webhook:", error);
          return res
            .status(status.BAD_REQUEST)
            .json({ message: "Error processing Stripe webhook" });
        }

        try{
            const result = await paymentServices.handleStripeWebHooks(event);
            sendResponse(res, {
              statusCode: status.OK,
              success: true,
              message: "Stripe webhook event processed successfully",
              data: result,
            });

        }catch(error:any){
            sendResponse(res, {
              statusCode: status.INTERNAL_SERVER_ERROR,
              success: false,
              message: "Error handling Stripe webhook event",
            });
        }
    }
)

const payForIdeas = catchAsync(
    async(req:Request,res:Response)=>{
        const {ideaId} = req.params
        const {userId} = req.user
        const amount = req.body.amount as number 
         console.log("USERID from payment controller", userId);
         console.log("IDEAID from payment controller", ideaId);
        const result = await paymentServices.payForIdeas(ideaId as string,userId as string,amount)
        //console.log('THIS IS THE CONSOLE FROM PAYMENT CONTROLLER',result)
        sendResponse(res,{statusCode:status.OK,success:true,message:"Idea payment created successfully",data:result})
    }
)

const getUserPaymentDetails = catchAsync(
    async(req:Request,res:Response)=>{
        const {userId} = req.params
        const result = await paymentServices.getUserPaymentDetails(userId as string)
        sendResponse(res,{statusCode:status.OK,success:true,message:"User payment details fetched successfully",data:result})
    }
)

export const PaymentController = {handleStripeWebHooks,payForIdeas,getUserPaymentDetails}