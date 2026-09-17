-- AlterTable
ALTER TABLE "AdminUser" ADD COLUMN     "bloqueadoAte" TIMESTAMP(3),
ADD COLUMN     "tentativasFalhas" INTEGER NOT NULL DEFAULT 0;
