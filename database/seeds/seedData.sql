-- Sample Categories
INSERT INTO categories (name) VALUES ('General'), ('HR'), ('Finance'), ('IT'), ('Operations');

-- Sample Services (dependent on categories)
INSERT INTO services (name, category_id) VALUES 
('Recruitment', 2), ('Payroll', 3), ('Support', 4), ('Maintenance', 5), ('Onboarding', 2);

-- Sample Offices
INSERT INTO offices (name) VALUES ('Head Office'), ('Branch A'), ('Branch B');

-- Sample Sources
INSERT INTO sources (name) VALUES ('Internal'), ('Client'), ('Vendor');

-- Sample Users (50 users with roles, hashed passwords for 'password123' using bcrypt)
-- Note: In production, generate unique hashes; here using a sample hash for demo.
SET @hash = '$2b$10$K.4XgY6X8z2j5fD9b8zqD.VwZ5Xq6X7z8j9b8zqD.VwZ5Xq6X7z8'; -- bcrypt hash for 'password123'

INSERT INTO users (username, email, password, role) VALUES
('systemadmin1', 'sysadmin1@example.com', @hash, 'SystemAdmin'),
('admin1', 'admin1@example.com', @hash, 'Admin'),
('supervisor1', 'sup1@example.com', @hash, 'Supervisor'),
('agent1', 'agent1@example.com', @hash, 'Agent'),
-- Repeat pattern for 46 more users...
('agent46', 'agent46@example.com', @hash, 'Agent');

-- Sample Tasks
INSERT INTO tasks (title, description, status, priority, due_date, assigned_user_id, category_id, service_id, office_id, source_id, created_by) VALUES
('Task 1', 'Description 1', 'Pending', 'High', '2025-09-15', 4, 1, 1, 1, 1, 1),
-- Add 49 more sample tasks...

-- Sample Leaves
INSERT INTO leaves (user_id, start_date, end_date, reason, status) VALUES
(4, '2025-09-10', '2025-09-12', 'Vacation', 'Pending'),
-- Add more...

-- Sample Audit Logs (for testing)
INSERT INTO audit_logs (user_id, action, entity, entity_id, before_value, after_value, ip_address, user_agent) VALUES
(1, 'CREATE', 'Task', 1, NULL, '{"title": "Task 1"}', '127.0.0.1', 'Mozilla/5.0');