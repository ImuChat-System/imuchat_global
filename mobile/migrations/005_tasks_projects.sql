-- ============================================================================
-- Migration 005: Tasks & Projects (Productivity Hub)
-- Module: DEV-018 - Productivity Hub (/tasks)
-- Date: 27 février 2026
-- Réf: MOBILE_TODO_TRACKER.md - Groupe 6, Fonc. 1
-- ============================================================================

-- ============================================================================
-- 1. ENUMs
-- ============================================================================

-- Priorité des tâches
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');

-- Statut des tâches (colonnes Kanban)
CREATE TYPE task_status AS ENUM ('backlog', 'todo', 'in_progress', 'review', 'done', 'archived');

-- ============================================================================
-- 2. TABLE: projects
-- ============================================================================

CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Infos de base
    name TEXT NOT NULL,
    description TEXT,
    color TEXT DEFAULT '#6366f1', -- Couleur du projet (hex)
    icon TEXT DEFAULT '📁', -- Emoji ou icon name
    
    -- Relations
    owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL, -- Lien optionnel avec un groupe
    
    -- Membres du projet (en plus du owner)
    member_ids UUID[] DEFAULT '{}',
    
    -- Métadonnées
    is_archived BOOLEAN DEFAULT FALSE,
    tasks_count INTEGER DEFAULT 0,
    completed_tasks_count INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX idx_projects_owner ON projects(owner_id);
CREATE INDEX idx_projects_conversation ON projects(conversation_id) WHERE conversation_id IS NOT NULL;
CREATE INDEX idx_projects_archived ON projects(is_archived);

-- ============================================================================
-- 3. TABLE: tasks
-- ============================================================================

CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Infos de base
    title TEXT NOT NULL,
    description TEXT,
    
    -- Statut et priorité
    status task_status DEFAULT 'todo',
    priority task_priority DEFAULT 'medium',
    
    -- Dates
    due_date TIMESTAMPTZ,
    reminder_at TIMESTAMPTZ, -- Date du rappel push notification
    completed_at TIMESTAMPTZ,
    
    -- Relations
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    creator_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    assignee_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    
    -- Sous-tâches (IDs des tâches enfants)
    parent_task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    
    -- Tags (array de strings)
    tags TEXT[] DEFAULT '{}',
    
    -- Métadonnées
    position INTEGER DEFAULT 0, -- Pour le tri dans les colonnes Kanban
    estimated_minutes INTEGER, -- Estimation du temps
    actual_minutes INTEGER, -- Temps réel passé
    
    -- Checklist inline (JSON array)
    -- Format: [{"id": "uuid", "text": "Item", "done": false}]
    checklist JSONB DEFAULT '[]',
    
    -- Attachments (références fichiers Supabase Storage)
    attachments TEXT[] DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index
CREATE INDEX idx_tasks_project ON tasks(project_id);
CREATE INDEX idx_tasks_creator ON tasks(creator_id);
CREATE INDEX idx_tasks_assignee ON tasks(assignee_id) WHERE assignee_id IS NOT NULL;
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_priority ON tasks(priority);
CREATE INDEX idx_tasks_due_date ON tasks(due_date) WHERE due_date IS NOT NULL;
CREATE INDEX idx_tasks_reminder ON tasks(reminder_at) WHERE reminder_at IS NOT NULL;
CREATE INDEX idx_tasks_parent ON tasks(parent_task_id) WHERE parent_task_id IS NOT NULL;
CREATE INDEX idx_tasks_position ON tasks(project_id, status, position);

-- ============================================================================
-- 4. TABLE: task_comments
-- ============================================================================

CREATE TABLE IF NOT EXISTS task_comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_task_comments_task ON task_comments(task_id);
CREATE INDEX idx_task_comments_author ON task_comments(author_id);

-- ============================================================================
-- 5. TABLE: task_activity_log (audit trail)
-- ============================================================================

CREATE TABLE IF NOT EXISTS task_activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    action TEXT NOT NULL, -- 'created', 'status_changed', 'assigned', 'commented', 'completed', etc.
    old_value JSONB,
    new_value JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_task_activity_task ON task_activity_log(task_id);
CREATE INDEX idx_task_activity_user ON task_activity_log(user_id);
CREATE INDEX idx_task_activity_created ON task_activity_log(created_at);

-- ============================================================================
-- 6. TRIGGERS: Auto-update timestamps
-- ============================================================================

CREATE OR REPLACE FUNCTION update_projects_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_projects_updated_at
    BEFORE UPDATE ON projects
    FOR EACH ROW
    EXECUTE FUNCTION update_projects_updated_at();

CREATE OR REPLACE FUNCTION update_tasks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_tasks_updated_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_tasks_updated_at();

-- ============================================================================
-- 7. TRIGGERS: Auto-update project task counts
-- ============================================================================

CREATE OR REPLACE FUNCTION update_project_task_counts()
RETURNS TRIGGER AS $$
BEGIN
    -- Sur INSERT
    IF TG_OP = 'INSERT' THEN
        UPDATE projects 
        SET tasks_count = tasks_count + 1,
            completed_tasks_count = completed_tasks_count + CASE WHEN NEW.status = 'done' THEN 1 ELSE 0 END
        WHERE id = NEW.project_id;
        RETURN NEW;
    END IF;
    
    -- Sur DELETE
    IF TG_OP = 'DELETE' THEN
        UPDATE projects 
        SET tasks_count = GREATEST(0, tasks_count - 1),
            completed_tasks_count = GREATEST(0, completed_tasks_count - CASE WHEN OLD.status = 'done' THEN 1 ELSE 0 END)
        WHERE id = OLD.project_id;
        RETURN OLD;
    END IF;
    
    -- Sur UPDATE (changement de statut)
    IF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
        UPDATE projects 
        SET completed_tasks_count = completed_tasks_count 
            + CASE WHEN NEW.status = 'done' THEN 1 ELSE 0 END
            - CASE WHEN OLD.status = 'done' THEN 1 ELSE 0 END
        WHERE id = NEW.project_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_project_task_counts
    AFTER INSERT OR UPDATE OR DELETE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_project_task_counts();

-- ============================================================================
-- 8. TRIGGERS: Auto-set completed_at
-- ============================================================================

CREATE OR REPLACE FUNCTION set_task_completed_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'done' AND OLD.status != 'done' THEN
        NEW.completed_at = NOW();
    ELSIF NEW.status != 'done' AND OLD.status = 'done' THEN
        NEW.completed_at = NULL;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_task_completed_at
    BEFORE UPDATE ON tasks
    FOR EACH ROW
    EXECUTE FUNCTION set_task_completed_at();

-- ============================================================================
-- 9. RLS Policies
-- ============================================================================

ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_activity_log ENABLE ROW LEVEL SECURITY;

-- Projects: Owner ou membre peut voir
CREATE POLICY projects_select ON projects
    FOR SELECT
    USING (
        owner_id = auth.uid() 
        OR auth.uid() = ANY(member_ids)
    );

-- Projects: Seul le owner peut modifier
CREATE POLICY projects_insert ON projects
    FOR INSERT
    WITH CHECK (owner_id = auth.uid());

CREATE POLICY projects_update ON projects
    FOR UPDATE
    USING (owner_id = auth.uid())
    WITH CHECK (owner_id = auth.uid());

CREATE POLICY projects_delete ON projects
    FOR DELETE
    USING (owner_id = auth.uid());

-- Tasks: Membre du projet peut voir
CREATE POLICY tasks_select ON tasks
    FOR SELECT
    USING (
        creator_id = auth.uid()
        OR assignee_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM projects p 
            WHERE p.id = tasks.project_id 
            AND (p.owner_id = auth.uid() OR auth.uid() = ANY(p.member_ids))
        )
    );

-- Tasks: Membre du projet peut créer
CREATE POLICY tasks_insert ON tasks
    FOR INSERT
    WITH CHECK (
        creator_id = auth.uid()
        AND (
            project_id IS NULL
            OR EXISTS (
                SELECT 1 FROM projects p 
                WHERE p.id = project_id 
                AND (p.owner_id = auth.uid() OR auth.uid() = ANY(p.member_ids))
            )
        )
    );

-- Tasks: Créateur, assigné ou owner du projet peut modifier
CREATE POLICY tasks_update ON tasks
    FOR UPDATE
    USING (
        creator_id = auth.uid()
        OR assignee_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM projects p 
            WHERE p.id = tasks.project_id 
            AND p.owner_id = auth.uid()
        )
    );

-- Tasks: Créateur ou owner du projet peut supprimer
CREATE POLICY tasks_delete ON tasks
    FOR DELETE
    USING (
        creator_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM projects p 
            WHERE p.id = tasks.project_id 
            AND p.owner_id = auth.uid()
        )
    );

-- Task comments: Membre du projet peut voir
CREATE POLICY task_comments_select ON task_comments
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM tasks t 
            WHERE t.id = task_comments.task_id
            AND (
                t.creator_id = auth.uid()
                OR t.assignee_id = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM projects p 
                    WHERE p.id = t.project_id 
                    AND (p.owner_id = auth.uid() OR auth.uid() = ANY(p.member_ids))
                )
            )
        )
    );

-- Task comments: Auteur peut créer/modifier/supprimer ses commentaires
CREATE POLICY task_comments_insert ON task_comments
    FOR INSERT
    WITH CHECK (author_id = auth.uid());

CREATE POLICY task_comments_update ON task_comments
    FOR UPDATE
    USING (author_id = auth.uid());

CREATE POLICY task_comments_delete ON task_comments
    FOR DELETE
    USING (author_id = auth.uid());

-- Activity log: Membre du projet peut voir
CREATE POLICY task_activity_log_select ON task_activity_log
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM tasks t 
            WHERE t.id = task_activity_log.task_id
            AND (
                t.creator_id = auth.uid()
                OR t.assignee_id = auth.uid()
                OR EXISTS (
                    SELECT 1 FROM projects p 
                    WHERE p.id = t.project_id 
                    AND (p.owner_id = auth.uid() OR auth.uid() = ANY(p.member_ids))
                )
            )
        )
    );

-- Activity log: Système insère (via trigger ou fonction)
CREATE POLICY task_activity_log_insert ON task_activity_log
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- 10. Helper Functions
-- ============================================================================

-- Obtenir les tâches groupées par statut (pour Kanban)
CREATE OR REPLACE FUNCTION get_tasks_kanban(p_project_id UUID)
RETURNS TABLE (
    status task_status,
    tasks JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.status,
        COALESCE(
            jsonb_agg(
                jsonb_build_object(
                    'id', t.id,
                    'title', t.title,
                    'description', t.description,
                    'priority', t.priority,
                    'due_date', t.due_date,
                    'assignee_id', t.assignee_id,
                    'position', t.position,
                    'tags', t.tags,
                    'checklist', t.checklist,
                    'created_at', t.created_at
                )
                ORDER BY t.position, t.created_at
            ),
            '[]'::jsonb
        ) AS tasks
    FROM tasks t
    WHERE t.project_id = p_project_id
    AND t.parent_task_id IS NULL -- Seulement les tâches racines
    GROUP BY t.status;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Obtenir le résumé des projets de l'utilisateur
CREATE OR REPLACE FUNCTION get_my_projects_summary()
RETURNS TABLE (
    id UUID,
    name TEXT,
    color TEXT,
    icon TEXT,
    tasks_count INTEGER,
    completed_tasks_count INTEGER,
    progress_percent NUMERIC,
    updated_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        p.id,
        p.name,
        p.color,
        p.icon,
        p.tasks_count,
        p.completed_tasks_count,
        CASE 
            WHEN p.tasks_count = 0 THEN 0
            ELSE ROUND((p.completed_tasks_count::NUMERIC / p.tasks_count) * 100, 1)
        END AS progress_percent,
        p.updated_at
    FROM projects p
    WHERE p.owner_id = auth.uid() OR auth.uid() = ANY(p.member_ids)
    AND p.is_archived = FALSE
    ORDER BY p.updated_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Obtenir les tâches dues bientôt (pour rappels)
CREATE OR REPLACE FUNCTION get_upcoming_tasks(p_days INTEGER DEFAULT 7)
RETURNS TABLE (
    id UUID,
    title TEXT,
    due_date TIMESTAMPTZ,
    project_name TEXT,
    project_color TEXT,
    priority task_priority
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        t.id,
        t.title,
        t.due_date,
        p.name AS project_name,
        p.color AS project_color,
        t.priority
    FROM tasks t
    LEFT JOIN projects p ON p.id = t.project_id
    WHERE (t.creator_id = auth.uid() OR t.assignee_id = auth.uid())
    AND t.status NOT IN ('done', 'archived')
    AND t.due_date IS NOT NULL
    AND t.due_date BETWEEN NOW() AND NOW() + (p_days || ' days')::INTERVAL
    ORDER BY t.due_date ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 11. Sample Data (optionnel, pour démo)
-- ============================================================================

-- Cette section peut être utilisée pour insérer des données de test
-- Décommentez si nécessaire pour le développement

/*
-- Créer un projet de démo pour l'utilisateur actuel
INSERT INTO projects (name, description, color, icon, owner_id)
SELECT 
    'Mon premier projet',
    'Un projet de démonstration pour découvrir ImuChat Tasks',
    '#6366f1',
    '🚀',
    auth.uid()
WHERE NOT EXISTS (
    SELECT 1 FROM projects WHERE owner_id = auth.uid() AND name = 'Mon premier projet'
);
*/

-- ============================================================================
-- FIN Migration 005
-- ============================================================================
