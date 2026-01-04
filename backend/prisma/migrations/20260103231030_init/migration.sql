-- CreateEnum
CREATE TYPE "NoteRole" AS ENUM ('OWNER', 'EDITOR', 'VIEWER');

-- CreateEnum
CREATE TYPE "NoteVisibility" AS ENUM ('PRIVATE', 'LINK', 'PUBLIC');

-- CreateEnum
CREATE TYPE "OperationStatus" AS ENUM ('PENDING', 'APPLIED', 'REJECTED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "password" TEXT NOT NULL,
    "avatarUrl" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verificationToken" TEXT,
    "verificationTokenExpiry" TIMESTAMP(3),
    "resetPasswordToken" TEXT,
    "resetPasswordExpiry" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "refreshTokenHash" TEXT NOT NULL,
    "userAgent" TEXT,
    "ipAddress" TEXT,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "revoked" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Session_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Note" (
    "id" TEXT NOT NULL,
    "ownerId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "latestContent" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "visibility" "NoteVisibility" NOT NULL DEFAULT 'PRIVATE',
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Note_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NotePermission" (
    "id" TEXT NOT NULL,
    "noteId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "NoteRole" NOT NULL DEFAULT 'VIEWER',
    "invitedBy" TEXT,
    "invitedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acceptedAt" TIMESTAMP(3),

    CONSTRAINT "NotePermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NoteOperation" (
    "id" TEXT NOT NULL,
    "noteId" TEXT NOT NULL,
    "opId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "ops" JSONB NOT NULL,
    "clientVersion" INTEGER NOT NULL,
    "serverVersion" INTEGER,
    "status" "OperationStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "appliedAt" TIMESTAMP(3),

    CONSTRAINT "NoteOperation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "NoteVersion" (
    "id" TEXT NOT NULL,
    "noteId" TEXT NOT NULL,
    "versionNumber" INTEGER NOT NULL,
    "snapshotContent" TEXT,
    "createdBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "NoteVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShareLink" (
    "id" TEXT NOT NULL,
    "noteId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "role" "NoteRole" NOT NULL DEFAULT 'VIEWER',
    "expiresAt" TIMESTAMP(3),
    "maxUses" INTEGER,
    "uses" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShareLink_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT,
    "meta" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "Session_userId_idx" ON "Session"("userId");

-- CreateIndex
CREATE INDEX "Session_expiresAt_idx" ON "Session"("expiresAt");

-- CreateIndex
CREATE INDEX "Note_ownerId_idx" ON "Note"("ownerId");

-- CreateIndex
CREATE INDEX "Note_updatedAt_idx" ON "Note"("updatedAt");

-- CreateIndex
CREATE INDEX "NotePermission_userId_idx" ON "NotePermission"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "NotePermission_noteId_userId_key" ON "NotePermission"("noteId", "userId");

-- CreateIndex
CREATE INDEX "NoteOperation_noteId_createdAt_idx" ON "NoteOperation"("noteId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "NoteOperation_noteId_opId_key" ON "NoteOperation"("noteId", "opId");

-- CreateIndex
CREATE INDEX "NoteVersion_noteId_versionNumber_idx" ON "NoteVersion"("noteId", "versionNumber");

-- CreateIndex
CREATE UNIQUE INDEX "NoteVersion_noteId_versionNumber_key" ON "NoteVersion"("noteId", "versionNumber");

-- CreateIndex
CREATE UNIQUE INDEX "ShareLink_token_key" ON "ShareLink"("token");

-- CreateIndex
CREATE INDEX "ShareLink_noteId_idx" ON "ShareLink"("noteId");

-- CreateIndex
CREATE INDEX "ShareLink_expiresAt_idx" ON "ShareLink"("expiresAt");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- AddForeignKey
ALTER TABLE "Session" ADD CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Note" ADD CONSTRAINT "Note_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotePermission" ADD CONSTRAINT "NotePermission_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "Note"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NotePermission" ADD CONSTRAINT "NotePermission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NoteOperation" ADD CONSTRAINT "NoteOperation_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "Note"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NoteOperation" ADD CONSTRAINT "NoteOperation_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "NoteVersion" ADD CONSTRAINT "NoteVersion_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "Note"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ShareLink" ADD CONSTRAINT "ShareLink_noteId_fkey" FOREIGN KEY ("noteId") REFERENCES "Note"("id") ON DELETE CASCADE ON UPDATE CASCADE;
