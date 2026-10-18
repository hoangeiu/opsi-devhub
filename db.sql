CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS pgcrypto;

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
  title VARCHAR NOT NULL, -- Name of the test data collection
  items JSONB DEFAULT '[]'::jsonb,
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

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto update the updated_at column on row update
CREATE TRIGGER update_users_modtime 
BEFORE UPDATE ON users 
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TABLE future_enhancements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR NOT NULL,
    requester VARCHAR NOT NULL,
    description TEXT NOT NULL,
    status VARCHAR DEFAULT 'open',
    resolver VARCHAR,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

----------------- ADD DATA ----------------- 

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

INSERT INTO command_categories (name, order_index) VALUES
('🌟 Top Favorites', 1),
('☸️ Kubernetes & AWS', 2),
('🗄️ Database & SQL', 3),
('🌐 Network & Proxy', 4),
('🔑 Credentials & URLs', 5),
('⚡ API & Testing', 6)
ON CONFLICT (name) DO NOTHING;

INSERT INTO commands (category_id, title, template) VALUES
-- 🌟 Top Favorites
((SELECT id FROM command_categories WHERE name = '🌟 Top Favorites'), 'Git: Rebase & Reset', '1. Combine Commits (Soft Reset):
git reset --soft HEAD~N

2. Undo Previous Reset:
git reset --soft HEAD@{1}

3. Interactive Rebase:
git rebase -i HEAD~N
- pick (p): Keep commit as-is.
- reword (r): Change the commit message.
- squash (s): Merge into the previous commit (combine messages).
- fixup (f): Merge into the previous commit (discard message).
- drop (d): Delete the commit entirely.
- edit (e): Pause rebase to edit commit content.'),
((SELECT id FROM command_categories WHERE name = '🌟 Top Favorites'), 'Jenkins: Add Headlamp URL', 'https://jenkins.itoi-hvn.dev.ops-integration.com/job/opsi-dev/job/workings/job/dev_tools/'),
((SELECT id FROM command_categories WHERE name = '🌟 Top Favorites'), 'OTOBO: Format (Docker Linter)', 'aws sso login
aws ecr get-login-password --region ap-northeast-1 | sudo docker login --username AWS --password-stdin 664113206212.dkr.ecr.ap-northeast-1.amazonaws.com
sudo docker run -ti --rm --entrypoint /bin/bash -v /mnt/f/Industry/Ops\ I/otobo/otobo/otobo_extensions/dx-itsm-webservices/src:/data/src 664113206212.dkr.ecr.ap-northeast-1.amazonaws.com/dx-tool/dx-common/opsi-ci-linter:1.0.2-perl
/data/src /data/CodePolicy/bin/otobo.CodePolicy.pl -a'),
((SELECT id FROM command_categories WHERE name = '🌟 Top Favorites'), 'OTOBO: Debug Snippets', 'use Data::Dumper;
print STDERR "messageaaaaaaaaaaaaaaaaaaaaaaaaaaaaa\n";
print STDERR "UserID: $UserID\n";
print Dumper($object);'),
((SELECT id FROM command_categories WHERE name = '🌟 Top Favorites'), 'Python: Format (Ruff)', 'pip install ruff
python -m ruff check . --fix
python -m ruff format .
python -m uv lock
python -m uv run ruff format'),
((SELECT id FROM command_categories WHERE name = '🌟 Top Favorites'), 'AI: Test Agents', 'py -3.13 -m venv .venv
bash setup.sh
source .venv/Scripts/activate
pytest test_agent_eval.py::TestAllEvals -v --tb=short > eval_log.txt 2>&1'),
((SELECT id FROM command_categories WHERE name = '🌟 Top Favorites'), 'QA: Run Autotest', 'pip install virtualenv
python -m virtualenv .venv
source .venv/Scripts/activate
python -m pip install -r requirements.txt
behave features/troubleshooting_improvements_features/28959_28960_28962UI.feature'),

-- ☸️ Kubernetes & AWS
((SELECT id FROM command_categories WHERE name = '☸️ Kubernetes & AWS'), 'Switch Cluster & Update Kubeconfig', 'aws eks update-kubeconfig --name {{ENV}}
config use-context arn:aws:eks:ap-northeast-1:664113206212:cluster/{{ENV}}
bash switch_cluster.sh {{ENV}}'),
((SELECT id FROM command_categories WHERE name = '☸️ Kubernetes & AWS'), 'Scale EKS Node Group', 'eksctl scale nodegroup --cluster={{ENV}} --nodes=2 --name={{ENV}}-eks-nodes --nodes-min=2 --nodes-max=2'),
((SELECT id FROM command_categories WHERE name = '☸️ Kubernetes & AWS'), 'Tail Logs (dxconsole & dxworker)', 'stern -n {{ENV}}-service dxconsole --container dxconsole --tail 5000
stern -n {{ENV}}-service dxworker --container dxworker --tail 5000'),
((SELECT id FROM command_categories WHERE name = '☸️ Kubernetes & AWS'), 'Access Pod Shell', 'kubectl exec -it -n {{ENV}}-service <pod-name> -- bash'),
((SELECT id FROM command_categories WHERE name = '☸️ Kubernetes & AWS'), 'Port Forward (RabbitMQ)', 'kubectl -n {{ENV}}-service port-forward svc/rabbitmq 15672:15672 --address 0.0.0.0'),
((SELECT id FROM command_categories WHERE name = '☸️ Kubernetes & AWS'), 'Restart Deployment', 'kubectl rollout restart deployment -n {{ENV}}-service'),

-- 🗄️ Database & SQL (Lưu ý: Cú pháp ''post'' để chuỗi bên trong SQL không bị lỗi nháy đơn)
((SELECT id FROM command_categories WHERE name = '🗄️ Database & SQL'), 'Access PostgreSQL Pod & DB', 'kubectl exec -it -n {{ENV}}-datastore opsi-postgresql-0 -- bash
psql -U dxconsole -d wordpress
psql -U otobo -d otobo_db'),
((SELECT id FROM command_categories WHERE name = '🗄️ Database & SQL'), 'Query WordPress Post', 'SELECT "ID", post_title, post_type FROM wp_posts WHERE post_type = ''post'' OR post_type = ''page'' AND post_status = ''publish'';'),
((SELECT id FROM command_categories WHERE name = '🗄️ Database & SQL'), 'WP CLI: Manage Block Settings', 'wp --url=https://portal.{{ENV}}.sdx.dev.ops-integration.com/template option get opsi_block_setting'),

-- 🌐 Network & Proxy
((SELECT id FROM command_categories WHERE name = '🌐 Network & Proxy'), 'Git Proxy Setup', 'git config --global http.proxy http://hoangml.df:Cogangquit09%21@172.18.15.105:3128
git config --global https.proxy http://hoangml.df:Cogangquit09%21@172.18.15.105:3128'),
((SELECT id FROM command_categories WHERE name = '🌐 Network & Proxy'), 'Shell Proxy Exports', 'export https_proxy=172.18.15.105:3128'),

-- 🔑 Credentials & URLs
((SELECT id FROM command_categories WHERE name = '🔑 Credentials & URLs'), 'Project Important Links', 'Git: https://gitlab.itoi-hvn.dev.ops-integration.com/itoi/dx-tool
Redmine: https://redmine.itoi-hvn.dev.ops-integration.com/issues/62628
CI/CD: https://cicd.itoi-hvn-cicd.dev.ops-integration.com/job/opsi-dev'),
((SELECT id FROM command_categories WHERE name = '🔑 Credentials & URLs'), 'Default Accounts', 'Gitlab/Jenkins/CICD: hoang.le1 / 123
System Account: system / Keep!t5ecret'),

-- ⚡ API & Testing
((SELECT id FROM command_categories WHERE name = '⚡ API & Testing'), 'Curl: Get Token (Keycloak)', 'curl -ik -X POST "https://keycloak.itom-dx-tool.local/realms/opsi/protocol/openid-connect/token" -H "Content-Type: application/x-www-form-urlencoded" -d "username=anhnp&password=123&grant_type=password&client_id=alb&client_secret=..."'),
((SELECT id FROM command_categories WHERE name = '⚡ API & Testing'), 'Curl: Test MCP Server API', 'curl -X POST http://127.0.0.1:8000/mcp -H "Content-Type: application/json" -d ''{"tool": "get_ticket_by_id", "input": {"ticket_id": 1}}''');
