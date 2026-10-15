-- Kích hoạt extension UUID (nếu chưa có)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Tạo Function tự động cập nhật cột updated_at
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TABLE environments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant VARCHAR NOT NULL UNIQUE,
  cluster VARCHAR,
  cidr VARCHAR,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TRIGGER update_environments_modtime BEFORE UPDATE ON environments FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TABLE jwts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  env_id UUID REFERENCES environments(id) ON DELETE CASCADE,
  token TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_env_jwt UNIQUE (env_id)
);
CREATE TRIGGER update_jwts_modtime BEFORE UPDATE ON jwts FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TABLE command_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR NOT NULL UNIQUE,
  order_index INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TRIGGER update_command_categories_modtime BEFORE UPDATE ON command_categories FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TABLE commands (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID REFERENCES command_categories(id) ON DELETE SET NULL,
  title VARCHAR NOT NULL,
  template TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TRIGGER update_commands_modtime BEFORE UPDATE ON commands FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TABLE ai_test_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR NOT NULL,
  description TEXT,
  conclusion TEXT,
  work_notes JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TRIGGER update_ai_test_data_modtime BEFORE UPDATE ON ai_test_data FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TABLE devops_configs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title VARCHAR NOT NULL,
  content TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TRIGGER update_devops_configs_modtime BEFORE UPDATE ON devops_configs FOR EACH ROW EXECUTE PROCEDURE update_modified_column();


INSERT INTO environments (tenant, cluster, cidr) VALUES
  ('elephantqc1', 'elephantqc1', '10.112.32.0/21'),
  ('elephantqc1-1', 'elephantqc1', '10.112.32.0/21'),
  ('elephantqc2', 'elephantqc2', '10.112.40.0/21'),
  ('elephantqc2-1', 'elephantqc2', '10.112.40.0/21'),
  ('elephantdev1', 'elephantdev1', '10.112.48.0/21'),
  ('elephantdev1-1', 'elephantdev1', '10.112.48.0/21'),
  ('elephantdev2', 'elephantdev2', '10.112.56.0/21'),
  ('elephantdev2-1', 'elephantdev2', '10.112.56.0/21'),
  ('elephantdev3', 'elephantdev3', '10.112.64.0/21'),
  ('elephantdev3-1', 'elephantdev3', '10.112.64.0/21'),
  ('elephantdev4', 'elephantdev4', '10.112.80.0/21'),
  ('elephantdev4-1', 'elephantdev4', '10.112.80.0/21'),
  ('elephantdev5', 'elephantdev5', '10.111.240.0/21'),
  ('elephantdev5-1', 'elephantdev5', '10.111.240.0/21'),
  ('elephantdev6', 'elephantdev6', '10.112.104.0/21'),
  ('elephantdev6-1', 'elephantdev6', '10.112.104.0/21'),
  ('elephantqc0', 'elephantqc0', '10.112.24.0/21'),
  ('elephantqc0-1', 'elephantqc0', '10.112.24.0/21'),
  ('elephantdev0', 'elephantdev0', '10.112.16.0/21'),
  ('elephantdev0-1', 'elephantdev0', '10.112.16.0/21')
ON CONFLICT (tenant) DO NOTHING;
