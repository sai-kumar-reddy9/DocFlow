"""Phase 4 Document Management Schema Update

Revision ID: 2026_07_30_0002
Revises: 2026_07_30_0001
Create Date: 2026-07-30 23:46:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = '2026_07_30_0002'
down_revision: Union[str, None] = '2026_07_30_0001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Drop previous documents table and recreate with refined Phase 4 fields
    op.drop_table('documents')

    op.create_table(
        'documents',
        sa.Column('id', sa.String(length=36), nullable=False),
        sa.Column('owner_id', sa.String(length=36), nullable=False),
        sa.Column('original_filename', sa.String(length=255), nullable=False),
        sa.Column('stored_filename', sa.String(length=255), nullable=False),
        sa.Column('file_extension', sa.String(length=20), nullable=False),
        sa.Column('mime_type', sa.String(length=100), nullable=False),
        sa.Column('file_size', sa.Integer(), nullable=False),
        sa.Column('file_path', sa.String(length=512), nullable=False),
        sa.Column('upload_status', sa.String(length=50), nullable=False, server_default='PROCESSED'),
        sa.Column('created_at', sa.DateTime(timezone=True), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=False),
        sa.ForeignKeyConstraint(['owner_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('stored_filename')
    )
    op.create_index(op.f('ix_documents_id'), 'documents', ['id'], unique=False)
    op.create_index(op.f('ix_documents_owner_id'), 'documents', ['owner_id'], unique=False)
    op.create_index(op.f('ix_documents_file_extension'), 'documents', ['file_extension'], unique=False)
    op.create_index(op.f('ix_documents_mime_type'), 'documents', ['mime_type'], unique=False)
    op.create_index(op.f('ix_documents_upload_status'), 'documents', ['upload_status'], unique=False)


def downgrade() -> None:
    op.drop_table('documents')
