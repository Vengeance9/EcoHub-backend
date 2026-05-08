import { VoteType } from "../../../generated/prisma/enums";

export interface IVotePayload {
  type: VoteType;
  ideaId: string;
  userId: string;
}
