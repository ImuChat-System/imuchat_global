-- ============================================================================
-- Migration : Office Suite (DEV-019)
-- Sprint    : 6a — Suite Office
-- Date      : 2026-03-03
-- Pré-requis: supabase_schema.sql (profiles), supabase_modules.sql
-- ============================================================================
--
-- Tables :
--   1. office_documents   — Documents (notes, tableur, présentation)
--   2. office_folders      — Dossiers de classement
--   3. journal_entries     — Journal privé (humeurs)
--   4. pdf_documents       — Métadonnées PDF + annotations
--   5. signatures          — Signatures électroniques
--   6. signature_requests  — Demandes de signature
--
-- RLS activé sur toutes les tables.
-- ============================================================================

-- ============================================================================
-- 1. office_folders  (créé en premier car référencé par office_documents)
-- ============================================================================

CREATE TABLE IF NOT EXISTS office_folders (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name            TEXT NOT NULL,
    parent_id       UUID REFERENCES office_folders(id) ON DELETE CASCADE,
    color           TEXT NOT NULL DEFAULT '#4A90D9',
    icon            TEXT NOT NULL DEFAULT '📁',
    document_count  INTEGER NOT NULL DEFAULT 0,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_office_folders_user   ON office_folders(user_id);
CREATE INDEX IF NOT EXISTS idx_office_folders_parent ON office_folders(parent_id);

ALTER TABLE office_folders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "office_folders_owner"
    ON office_folders FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 2. office_documents
-- ============================================================================

CREATE TABLE IF NOT EXISTS office_documents (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title         TEXT NOT NULL DEFAULT 'Sans titre',
    type          TEXT NOT NULL DEFAULT 'note'
                  CHECK (type IN ('note', 'spreadsheet', 'presentation', 'pdf', 'journal', 'signature')),
    content       TEXT NOT NULL DEFAULT '',
    blocks        JSONB NOT NULL DEFAULT '[]'::jsonb,
    is_favorite   BOOLEAN NOT NULL DEFAULT false,
    is_pinned     BOOLEAN NOT NULL DEFAULT false,
    is_encrypted  BOOLEAN NOT NULL DEFAULT false,
    tags          TEXT[] NOT NULL DEFAULT '{}',
    word_count    INTEGER NOT NULL DEFAULT 0,
    thumbnail_url TEXT,
    folder_id     UUID REFERENCES office_folders(id) ON DELETE SET NULL,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_office_documents_user    ON office_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_office_documents_type    ON office_documents(type);
CREATE INDEX IF NOT EXISTS idx_office_documents_folder  ON office_documents(folder_id);
CREATE INDEX IF NOT EXISTS idx_office_documents_updated ON office_documents(updated_at DESC);

ALTER TABLE office_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "office_documents_owner"
    ON office_documents FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 3. journal_entries
-- ============================================================================

CREATE TABLE IF NOT EXISTS journal_entries (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    date          DATE NOT NULL DEFAULT CURRENT_DATE,
    title         TEXT NOT NULL DEFAULT 'Mon journal',
    content       TEXT NOT NULL DEFAULT '',
    blocks        JSONB NOT NULL DEFAULT '[]'::jsonb,
    mood          TEXT CHECK (mood IN ('great', 'good', 'neutral', 'bad', 'terrible')),
    tags          TEXT[] NOT NULL DEFAULT '{}',
    is_encrypted  BOOLEAN NOT NULL DEFAULT false,
    weather       TEXT,
    location      TEXT,
    word_count    INTEGER NOT NULL DEFAULT 0,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_journal_entries_user ON journal_entries(user_id);
CREATE INDEX IF NOT EXISTS idx_journal_entries_date ON journal_entries(date DESC);
CREATE INDEX IF NOT EXISTS idx_journal_entries_mood ON journal_entries(mood);

ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "journal_entries_owner"
    ON journal_entries FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 4. pdf_documents
-- ============================================================================

CREATE TABLE IF NOT EXISTS pdf_documents (
    id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    title         TEXT NOT NULL,
    file_url      TEXT NOT NULL,
    page_count    INTEGER NOT NULL DEFAULT 0,
    current_page  INTEGER NOT NULL DEFAULT 1,
    annotations   JSONB NOT NULL DEFAULT '[]'::jsonb,
    bookmarks     INTEGER[] NOT NULL DEFAULT '{}',
    file_size     BIGINT NOT NULL DEFAULT 0,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pdf_documents_user ON pdf_documents(user_id);

ALTER TABLE pdf_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pdf_documents_owner"
    ON pdf_documents FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 5. signatures
-- ============================================================================

CREATE TABLE IF NOT EXISTS signatures (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    svg_path    TEXT NOT NULL DEFAULT '',
    png_base64  TEXT NOT NULL DEFAULT '',
    is_default  BOOLEAN NOT NULL DEFAULT false,
    created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_signatures_user ON signatures(user_id);

ALTER TABLE signatures ENABLE ROW LEVEL SECURITY;

CREATE POLICY "signatures_owner"
    ON signatures FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- 6. signature_requests
-- ============================================================================

CREATE TABLE IF NOT EXISTS signature_requests (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    document_id     UUID NOT NULL REFERENCES office_documents(id) ON DELETE CASCADE,
    document_title  TEXT NOT NULL,
    signer_name     TEXT NOT NULL,
    signature_id    UUID REFERENCES signatures(id) ON DELETE SET NULL,
    signed_at       TIMESTAMPTZ,
    status          TEXT NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'signed', 'rejected')),
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_signature_requests_user ON signature_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_signature_requests_doc  ON signature_requests(document_id);

ALTER TABLE signature_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "signature_requests_owner"
    ON signature_requests FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- ============================================================================
-- Triggers : updated_at automatique
-- ============================================================================

CREATE OR REPLACE FUNCTION update_office_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_office_documents_updated
    BEFORE UPDATE ON office_documents
    FOR EACH ROW EXECUTE FUNCTION update_office_updated_at();

CREATE TRIGGER trg_journal_entries_updated
    BEFORE UPDATE ON journal_entries
    FOR EACH ROW EXECUTE FUNCTION update_office_updated_at();

CREATE TRIGGER trg_pdf_documents_updated
    BEFORE UPDATE ON pdf_documents
    FOR EACH ROW EXECUTE FUNCTION update_office_updated_at();

-- ============================================================================
-- Fin de la migration Office Suite
-- ============================================================================
