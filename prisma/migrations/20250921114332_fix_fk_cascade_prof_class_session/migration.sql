-- Vérifier et corriger les contraintes de clés étrangères avec CASCADE
-- Cette migration s'assure que toutes les relations ont bien ON DELETE CASCADE

-- Vérifier la contrainte FK Class -> Prof
DO $$
BEGIN
    -- Supprimer l'ancienne contrainte si elle existe
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'Class_profId_fkey' 
        AND table_name = 'Class'
    ) THEN
        ALTER TABLE "Class" DROP CONSTRAINT "Class_profId_fkey";
    END IF;
    
    -- Créer la nouvelle contrainte avec CASCADE
    ALTER TABLE "Class" ADD CONSTRAINT "Class_profId_fkey" 
    FOREIGN KEY ("profId") REFERENCES "Prof"("id") ON DELETE CASCADE;
END $$;

-- Vérifier la contrainte FK Chapter -> Class
DO $$
BEGIN
    -- Supprimer l'ancienne contrainte si elle existe
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'Chapter_classId_fkey' 
        AND table_name = 'Chapter'
    ) THEN
        ALTER TABLE "Chapter" DROP CONSTRAINT "Chapter_classId_fkey";
    END IF;
    
    -- Créer la nouvelle contrainte avec CASCADE
    ALTER TABLE "Chapter" ADD CONSTRAINT "Chapter_classId_fkey" 
    FOREIGN KEY ("classId") REFERENCES "Class"("id") ON DELETE CASCADE;
END $$;

-- Vérifier la contrainte FK Document -> Chapter
DO $$
BEGIN
    -- Supprimer l'ancienne contrainte si elle existe
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'Document_chapterId_fkey' 
        AND table_name = 'Document'
    ) THEN
        ALTER TABLE "Document" DROP CONSTRAINT "Document_chapterId_fkey";
    END IF;
    
    -- Créer la nouvelle contrainte avec CASCADE
    ALTER TABLE "Document" ADD CONSTRAINT "Document_chapterId_fkey" 
    FOREIGN KEY ("chapterId") REFERENCES "Chapter"("id") ON DELETE CASCADE;
END $$;

-- Vérifier la contrainte FK Session -> Prof
DO $$
BEGIN
    -- Supprimer l'ancienne contrainte si elle existe
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'Session_profId_fkey' 
        AND table_name = 'Session'
    ) THEN
        ALTER TABLE "Session" DROP CONSTRAINT "Session_profId_fkey";
    END IF;
    
    -- Créer la nouvelle contrainte avec CASCADE
    ALTER TABLE "Session" ADD CONSTRAINT "Session_profId_fkey" 
    FOREIGN KEY ("profId") REFERENCES "Prof"("id") ON DELETE CASCADE;
END $$;

-- Vérifier la contrainte FK Session -> Admin
DO $$
BEGIN
    -- Supprimer l'ancienne contrainte si elle existe
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'Session_adminId_fkey' 
        AND table_name = 'Session'
    ) THEN
        ALTER TABLE "Session" DROP CONSTRAINT "Session_adminId_fkey";
    END IF;
    
    -- Créer la nouvelle contrainte avec CASCADE
    ALTER TABLE "Session" ADD CONSTRAINT "Session_adminId_fkey" 
    FOREIGN KEY ("adminId") REFERENCES "Admin"("id") ON DELETE CASCADE;
END $$;
