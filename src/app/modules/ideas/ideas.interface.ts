// model Idea{
//     id String @id
//     title String
//     problem String
//     solution String
//     photo String
//     description String
//     created_At DateTime
//     userId String
//     isPaid Boolean @default(false)
//     price Decimal?
//     feedback String?
//     upvotes Int?
//     downvotes Int?
//     highlighted Boolean @default(false)

//     user User @relation(fields: [userId],references: [id])
//     status IdeaStatus @default(UNDERREVIEW)
//     categoryId String
//     category Category @relation(fields: [categoryId],references: [id])
// }

export interface IIdeaPayload {
    title: string;
    problem: string;
    solution: string;
 //   photo: string;
    description: string;
    categoryId: string;
    isPaid?:boolean;
    Price?:number;
}
export interface IIdeaUpdatePayload {
    title?: string;
    problem?: string;
    solution?: string;
 //   photo: string;
    description?: string;
    categoryId?: string;
    isPaid?:boolean;
    Price?:number;
}
