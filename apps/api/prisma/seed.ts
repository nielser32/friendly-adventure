import { PrismaClient, RelationshipType } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const alice = await prisma.user.upsert({
    where: { email: 'alice@example.com' },
    update: {},
    create: {
      email: 'alice@example.com',
      name: 'Alice Example',
    },
  })

  const bob = await prisma.user.upsert({
    where: { email: 'bob@example.com' },
    update: {},
    create: {
      email: 'bob@example.com',
      name: 'Bob Example',
    },
  })

  const [knowledgeGraph, semanticSearch, uxPatterns] = await prisma.$transaction([
    prisma.concept.upsert({
      where: { title: 'Knowledge Graphs' },
      update: {},
      create: {
        title: 'Knowledge Graphs',
        summary: 'Data models that capture entities and relationships for flexible querying.',
        createdById: alice.id,
      },
    }),
    prisma.concept.upsert({
      where: { title: 'Semantic Search' },
      update: {},
      create: {
        title: 'Semantic Search',
        summary: 'Finding meaning-aware results by leveraging embeddings and graph context.',
        createdById: alice.id,
      },
    }),
    prisma.concept.upsert({
      where: { title: 'UX Patterns' },
      update: {},
      create: {
        title: 'UX Patterns',
        summary: 'Reusable interaction designs that improve usability and consistency.',
        createdById: bob.id,
      },
    }),
  ])

  const [graphTag, aiTag, designTag] = await prisma.$transaction([
    prisma.tag.upsert({
      where: { label: 'graph' },
      update: {},
      create: { label: 'graph' },
    }),
    prisma.tag.upsert({
      where: { label: 'ai' },
      update: {},
      create: { label: 'ai' },
    }),
    prisma.tag.upsert({
      where: { label: 'design' },
      update: {},
      create: { label: 'design' },
    }),
  ])

  await prisma.$transaction([
    prisma.conceptTag.upsert({
      where: { conceptId_tagId: { conceptId: knowledgeGraph.id, tagId: graphTag.id } },
      update: {},
      create: { conceptId: knowledgeGraph.id, tagId: graphTag.id },
    }),
    prisma.conceptTag.upsert({
      where: { conceptId_tagId: { conceptId: semanticSearch.id, tagId: aiTag.id } },
      update: {},
      create: { conceptId: semanticSearch.id, tagId: aiTag.id },
    }),
    prisma.conceptTag.upsert({
      where: { conceptId_tagId: { conceptId: uxPatterns.id, tagId: designTag.id } },
      update: {},
      create: { conceptId: uxPatterns.id, tagId: designTag.id },
    }),
  ])

  await prisma.$transaction([
    prisma.relationship.create({
      data: {
        type: RelationshipType.derives_from,
        description: 'Semantic search builds on knowledge graph structure for relevance.',
        createdById: alice.id,
        sourceId: semanticSearch.id,
        targetId: knowledgeGraph.id,
      },
    }),
    prisma.relationship.create({
      data: {
        type: RelationshipType.supports,
        description: 'UX patterns help teams surface graph insights in understandable ways.',
        createdById: bob.id,
        sourceId: uxPatterns.id,
        targetId: knowledgeGraph.id,
      },
    }),
    prisma.relationship.create({
      data: {
        type: RelationshipType.relates_to,
        description: 'UX patterns can drive semantic search results presentation.',
        createdById: bob.id,
        sourceId: uxPatterns.id,
        targetId: semanticSearch.id,
      },
    }),
  ])
}

main()
  .catch((error) => {
    console.error('Seeding error', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
