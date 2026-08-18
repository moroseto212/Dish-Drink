ALTER TABLE "Conversation" ADD COLUMN "key" TEXT;

UPDATE "Conversation" c
SET "key" = (
  SELECT string_agg(p."userId", ':' ORDER BY p."userId")
  FROM "ConversationParticipant" p
  WHERE p."conversationId" = c.id
);

ALTER TABLE "Conversation" ALTER COLUMN "key" SET NOT NULL;

CREATE UNIQUE INDEX "Conversation_key_key" ON "Conversation"("key");
