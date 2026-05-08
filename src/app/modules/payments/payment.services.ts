import { stripe } from '../../config/stripe';
import { prisma } from '../../lib/prisma';
import { PaymentStatus, Purchase } from './../../../generated/prisma/client';
import Stripe from "stripe";

const handleStripeWebHooks=async(event:Stripe.Event)=>{
    const existingPayments = await prisma.purchase.findFirst({
        where:{
            stripeEventId:event.id
        }
    })
    if(existingPayments){
        return
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as any;
        const purchaseId = session?.metadata?.purchaseId;
        if (!purchaseId) {
          return { message: "Missing purchaseId" };
        }
        await prisma.purchase.update({
          where: {
            id: purchaseId,
          },
          data: {
            status:
              session.payment_status === "paid"
                ? PaymentStatus.PAID
                : PaymentStatus.UNPAID,
            stripeEventId: event.id,
            paymentGatewayData:{
               id:session.id,
               amount_total:session.amount_total,
               customer_email:session.customer_email
            },
          },
        });
        break;
      }
      case "checkout.session.expired": {
        console.log("Session expired");
        break;
      }
      case "payment_intent.payment_failed": {
        const session = event.data.object;

        console.log(
          `Payment intent ${session.id} failed. Marking associated payment as failed.`
        );
        break;
      }
      default:
        console.log(`Unhandled event: ${event.type}`);
    }
    return {message:"Stripe webhook event processed successfully"}

}

const payForIdeas = async(ideaId:string,userId:string,amount:number)=>{
    let session
    try{
      session = await stripe.checkout.sessions.create({
        payment_method_types:['card'],
        mode:'payment',
        line_items:[
            {
                price_data:{
                    currency:'bdt',
                    product_data:{
                        name:'Idea Payment',
                    },
                    unit_amount:Math.round(amount*100)

                },
                quantity:1
            }
        ],
        success_url:`${process.env.FRONTEND_URL}/ideaDetails/paid/${ideaId}`,
        cancel_url:`${process.env.FRONTEND_URL}/dashboard`
    })}catch(err:any){
      console.log("STRIPE ERROR:", err.message);
      throw new Error('Failed to create checkout session')
      return
    }

    const payment = await prisma.purchase.create({
      data: {
        ideaId: ideaId,
        userId: userId,
        amount: Number(amount),
        status:PaymentStatus.PAID
      },
    });
   

    await stripe.checkout.sessions.update(session.id,{
      metadata:{
        purchaseId:payment.id}
    })

    return{
        payment,
        paymentUrl:session.url
    }
}

const getUserPaymentDetails = async(userId:string)=>{
    const paymentDetails = await prisma.purchase.findMany({
        where:{
            userId:userId,
            status:PaymentStatus.PAID
        },select:{
            id:true,
            ideaId:true,
            amount:true,
            purchasedAt:true
        }
    })
    return paymentDetails
}

export const paymentServices = {
    handleStripeWebHooks,
    payForIdeas,
    getUserPaymentDetails
}