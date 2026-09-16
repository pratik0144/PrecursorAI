"""Add organizations, extend users, create ruleset_versions

Revision ID: 003_tenancy
Revises: 002_enums
Create Date: 2026-09-16
"""
from alembic import op
import sqlalchemy as sa

revision = '003_tenancy'
down_revision = '002_enums'
branch_labels = None
depends_on = None

def upgrade():
    # Create updated_at trigger function
    op.execute("""
        CREATE OR REPLACE FUNCTION update_updated_at_column()
        RETURNS TRIGGER AS $$
        BEGIN
            NEW.updated_at = now();
            RETURN NEW;
        END;
        $$ language 'plpgsql';
    """)
    
    # Organizations table
    op.execute("""
        CREATE TABLE organizations (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR NOT NULL,
            slug VARCHAR NOT NULL UNIQUE,
            is_demo BOOLEAN NOT NULL DEFAULT false,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        );
        COMMENT ON TABLE organizations IS 'Tenants in the multi-tenant system.';
        
        CREATE TRIGGER update_organizations_updated_at BEFORE UPDATE ON organizations
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    """)
    
    # Extend users table
    op.execute("""
        ALTER TABLE users
            ADD COLUMN org_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
            ADD COLUMN password_hash VARCHAR,
            ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true,
            ADD COLUMN last_login_at TIMESTAMPTZ,
            ADD COLUMN updated_at TIMESTAMPTZ NOT NULL DEFAULT now();
        
        -- Cast role from VARCHAR to user_role enum
        -- First update existing values to match the enum
        UPDATE users SET role = 'ADMIN' WHERE role NOT IN ('HSSE_OFFICER', 'SITE_MANAGER', 'OPS_MANAGER', 'CORPORATE_LEADERSHIP', 'ADMIN');
        ALTER TABLE users ALTER COLUMN role TYPE user_role USING role::user_role;
        
        -- Make email citext
        ALTER TABLE users ALTER COLUMN email TYPE citext;
        
        COMMENT ON TABLE users IS 'User accounts with RBAC roles and tenant association.';
        
        CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    """)
    
    # Ruleset versions table
    op.execute("""
        CREATE TABLE ruleset_versions (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            version VARCHAR NOT NULL UNIQUE,
            weights JSONB NOT NULL,
            thresholds JSONB NOT NULL,
            classification_map JSONB NOT NULL,
            is_active BOOLEAN NOT NULL DEFAULT false,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            created_by UUID
        );
        COMMENT ON TABLE ruleset_versions IS 'Versioned config for deterministic classification engine. Ensures reproducible decisions.';
    """)

def downgrade():
    op.execute('DROP TABLE IF EXISTS ruleset_versions')
    op.execute("""
        ALTER TABLE users
            DROP COLUMN IF EXISTS org_id,
            DROP COLUMN IF EXISTS password_hash,
            DROP COLUMN IF EXISTS is_active,
            DROP COLUMN IF EXISTS last_login_at,
            DROP COLUMN IF EXISTS updated_at;
        ALTER TABLE users ALTER COLUMN role TYPE VARCHAR(50);
        ALTER TABLE users ALTER COLUMN email TYPE VARCHAR(255);
    """)
    op.execute('DROP TABLE IF EXISTS organizations CASCADE')
    op.execute('DROP FUNCTION IF EXISTS update_updated_at_column()')
