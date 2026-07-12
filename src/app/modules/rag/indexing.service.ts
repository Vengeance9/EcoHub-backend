
import { IdeaStatus, Prisma } from "../../../generated/prisma/client"
import { prisma } from "../../lib/prisma"
import { unknown } from 'zod';
import { EmbeddingService } from './embedding.service';


const toVectorLiteral = (vector:number[])=>{
    return `[${vector.join(",")}]`
}

export class IndexService {
  private embeddingService: EmbeddingService;

  constructor() {
    this.embeddingService = new EmbeddingService();
  }
  async indexDocument(
    chunkKey: string,
    sourceId: string,
    sourceType: string,
    content: string,
    metadata?: Record<string, unknown>,
    sourceLabel?: string
  ) {
    try {
      const embedding = await this.embeddingService.generateEmbedding(content);
      const vectorLiteral = toVectorLiteral(embedding);

      await prisma.$executeRaw(Prisma.sql`
            INSERT INTO "document_embeddings"
            ("id", "chunkKey", "sourceId", "sourceType", "sourceLabel","content", "metadata", "embedding","updatedAt")
            VALUES (
                ${Prisma.raw("gen_random_uuid()")},
                ${chunkKey},
                ${sourceId}, 
                ${sourceType}, 
                ${sourceLabel || null}, 
                ${content},
                ${JSON.stringify(metadata || {})} :: jsonb,
                CAST (${vectorLiteral} AS vector),
                NOW())
            
                ON CONFLICT("chunkKey")
                DO UPDATE SET
                "sourceId" = EXCLUDED."sourceId",
                "sourceType" = EXCLUDED."sourceType",
                "sourceLabel" = EXCLUDED."sourceLabel",
                "metadata" = EXCLUDED."metadata",
                "embedding" = EXCLUDED."embedding",
                "content" = EXCLUDED."content",
                "updatedAt" = NOW()
                `);
    } catch (err) {
      console.log(err);
      throw err
    }
  }

  async indexIdeas() {
    try {
      const ideas = await prisma.idea.findMany({
        where: {
          status: IdeaStatus.ACCEPTED,
        },
        select: {
          id: true,
          title: true,
          problem: true,
          solution: true,
          description: true,
          category: { select: { name: true } },
          user: { select: { name: true } },
          upvotes: true,
          downvotes: true,
        },
      });
      for (const idea of ideas) {
        const content = `
            Title: ${idea.title}
            Problem: ${idea.problem}
            Solution: ${idea.solution}
            Description: ${idea.description}
            Category: ${idea.category.name}
            User: ${idea.user.name}
            Upvotes: ${idea.upvotes}
            Downvotes: ${idea.downvotes}
            `;

        const metadata = {
          title: idea.title,
          problem: idea.problem,
          solution: idea.solution,
          description: idea.description,
          category: idea.category.name,
          user: idea.user.name,
          upvotes: idea.upvotes,
          downvotes: idea.downvotes,
        };

        const chunkKey = `Idea-${idea.id}`;
        await this.indexDocument(chunkKey, idea.id, "idea",content,metadata);
      }
    } catch (err) {
      console.log(err);
      throw err
    }
  }
}