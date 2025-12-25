-- DropForeignKey
ALTER TABLE `expenses` DROP FOREIGN KEY `expenses_barberId_fkey`;

-- DropIndex
DROP INDEX `expenses_barberId_date_idx` ON `expenses`;

-- AlterTable
ALTER TABLE `expenses` DROP COLUMN `barberId`;

-- CreateIndex
CREATE INDEX `expenses_date_idx` ON `expenses`(`date`);

