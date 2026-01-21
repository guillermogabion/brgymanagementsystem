-- CreateTable
CREATE TABLE "Resident" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "birthDate" DATETIME NOT NULL,
    "purok" TEXT NOT NULL,
    "houseNumber" TEXT NOT NULL,
    "phoneNumber" TEXT NOT NULL,
    "isIndigent" BOOLEAN NOT NULL DEFAULT false,
    "isSeniorCitizen" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "Resident_phoneNumber_key" ON "Resident"("phoneNumber");
