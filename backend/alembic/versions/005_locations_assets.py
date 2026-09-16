"""Create locations hierarchy and assets tables

Revision ID: 005_locations
Revises: 004_reference
Create Date: 2026-09-16
"""
from alembic import op

revision = '005_locations'
down_revision = '004_reference'
branch_labels = None
depends_on = None

def upgrade():
    op.execute("""
        CREATE TABLE locations (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
            parent_id UUID REFERENCES locations(id) ON DELETE CASCADE,
            level location_level NOT NULL,
            name VARCHAR NOT NULL,
            code VARCHAR,
            latitude DOUBLE PRECISION,
            longitude DOUBLE PRECISION,
            bbox JSONB,
            is_synthetic BOOLEAN NOT NULL DEFAULT false,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            
            CONSTRAINT chk_latitude CHECK (latitude IS NULL OR (latitude >= -90 AND latitude <= 90)),
            CONSTRAINT chk_longitude CHECK (longitude IS NULL OR (longitude >= -180 AND longitude <= 180))
        );
        COMMENT ON TABLE locations IS 'Self-referential location hierarchy: WORLD→COUNTRY→REGION→FIELD→SITE for globe drill-down.';
        
        CREATE INDEX ix_locations_parent_id ON locations(parent_id);
        CREATE INDEX ix_locations_level ON locations(level);
        CREATE INDEX ix_locations_lat_lon ON locations(latitude, longitude);
    """)
    
    op.execute("""
        CREATE TABLE assets (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
            location_id UUID NOT NULL REFERENCES locations(id) ON DELETE CASCADE,
            asset_type asset_type NOT NULL,
            name VARCHAR NOT NULL,
            code VARCHAR,
            latitude DOUBLE PRECISION,
            longitude DOUBLE PRECISION,
            status VARCHAR,
            metadata JSONB,
            is_synthetic BOOLEAN NOT NULL DEFAULT false,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            
            CONSTRAINT chk_asset_latitude CHECK (latitude IS NULL OR (latitude >= -90 AND latitude <= 90)),
            CONSTRAINT chk_asset_longitude CHECK (longitude IS NULL OR (longitude >= -180 AND longitude <= 180))
        );
        COMMENT ON TABLE assets IS 'Physical assets (wellheads, rigs, BOPs, GGS, etc.) placed under SITE locations.';
        
        CREATE INDEX ix_assets_location_id ON assets(location_id);
        CREATE INDEX ix_assets_asset_type ON assets(asset_type);
        CREATE INDEX ix_assets_org_id ON assets(org_id);
    """)

def downgrade():
    op.execute('DROP TABLE IF EXISTS assets CASCADE')
    op.execute('DROP TABLE IF EXISTS locations CASCADE')
