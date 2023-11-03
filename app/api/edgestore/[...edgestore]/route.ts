import { initEdgeStore } from '@edgestore/server'
import {
  CreateContextOptions,
  createEdgeStoreNextHandler
} from '@edgestore/server/adapters/next/app'
import { z } from 'zod'

type Context = {
  userId: string
  userRole: 'admin' | 'user'
}

function createContext({ req }: CreateContextOptions): Context {
  return {
    userId: '123',
    userRole: 'admin'
  }
}

const es = initEdgeStore.context<Context>().create()

const edgeStoreRouter = es.router({
  publicImages: es
    .imageBucket({
      maxSize: 1024 * 1024 * 1 // 1MB
    })
    .input(
      z.object({
        type: z.enum(['post', 'profile'])
      })
    )
    .path(({ input }) => [{ type: input.type }]),

  protectedFiles: es
    .fileBucket()
    .path(({ ctx }) => [{ owner: ctx.userId }])
    .accessControl({
      OR: [
        {
          userId: { path: 'owner' }
        },
        {
          userRole: { eq: 'admin' }
        }
      ]
    })
})

const handler = createEdgeStoreNextHandler({
  router: edgeStoreRouter,
  createContext
})

export { handler as GET, handler as POST }

export type EdgeStoreRouter = typeof edgeStoreRouter
