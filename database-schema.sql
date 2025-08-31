-- Multi-Domain Email Server Database Schema
-- This schema supports multiple domains and temporary email generation

-- Create database
CREATE DATABASE IF NOT EXISTS mailserver;
USE mailserver;

-- Virtual domains table
CREATE TABLE IF NOT EXISTS virtual_domains (
  id int(11) NOT NULL AUTO_INCREMENT,
  name varchar(100) NOT NULL,
  description text,
  active tinyint(1) NOT NULL DEFAULT 1,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY unique_domain (name),
  KEY idx_active (active),
  KEY idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Virtual users table (temporary emails)
CREATE TABLE IF NOT EXISTS virtual_users (
  id int(11) NOT NULL AUTO_INCREMENT,
  domain_id int(11) NOT NULL,
  email varchar(255) NOT NULL,
  username varchar(100) NOT NULL,
  password varchar(255) NOT NULL,
  active tinyint(1) NOT NULL DEFAULT 1,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP,
  expires_at timestamp NOT NULL,
  last_login timestamp NULL,
  PRIMARY KEY (id),
  UNIQUE KEY unique_email (email),
  KEY idx_domain_id (domain_id),
  KEY idx_active (active),
  KEY idx_expires_at (expires_at),
  KEY idx_created_at (created_at),
  FOREIGN KEY (domain_id) REFERENCES virtual_domains(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Messages table (received emails)
CREATE TABLE IF NOT EXISTS messages (
  id int(11) NOT NULL AUTO_INCREMENT,
  user_id int(11) NOT NULL,
  message_id varchar(255),
  from_email varchar(255) NOT NULL,
  from_name varchar(255),
  subject varchar(500),
  body_text longtext,
  body_html longtext,
  headers text,
  size int(11) DEFAULT 0,
  received_at timestamp DEFAULT CURRENT_TIMESTAMP,
  read_at timestamp NULL,
  is_spam tinyint(1) DEFAULT 0,
  PRIMARY KEY (id),
  KEY idx_user_id (user_id),
  KEY idx_message_id (message_id),
  KEY idx_from_email (from_email),
  KEY idx_received_at (received_at),
  KEY idx_is_spam (is_spam),
  FOREIGN KEY (user_id) REFERENCES virtual_users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Email attachments table
CREATE TABLE IF NOT EXISTS attachments (
  id int(11) NOT NULL AUTO_INCREMENT,
  message_id int(11) NOT NULL,
  filename varchar(255) NOT NULL,
  content_type varchar(100),
  size int(11) DEFAULT 0,
  file_path varchar(500),
  created_at timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_message_id (message_id),
  FOREIGN KEY (message_id) REFERENCES messages(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Email aliases table (for forwarding)
CREATE TABLE IF NOT EXISTS virtual_aliases (
  id int(11) NOT NULL AUTO_INCREMENT,
  domain_id int(11) NOT NULL,
  source varchar(255) NOT NULL,
  destination varchar(255) NOT NULL,
  active tinyint(1) NOT NULL DEFAULT 1,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_domain_id (domain_id),
  KEY idx_source (source),
  KEY idx_active (active),
  FOREIGN KEY (domain_id) REFERENCES virtual_domains(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Domain settings table
CREATE TABLE IF NOT EXISTS domain_settings (
  id int(11) NOT NULL AUTO_INCREMENT,
  domain_id int(11) NOT NULL,
  setting_key varchar(100) NOT NULL,
  setting_value text,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY unique_domain_setting (domain_id, setting_key),
  FOREIGN KEY (domain_id) REFERENCES virtual_domains(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- User sessions table (for web interface)
CREATE TABLE IF NOT EXISTS user_sessions (
  id int(11) NOT NULL AUTO_INCREMENT,
  user_id int(11) NOT NULL,
  session_token varchar(255) NOT NULL,
  ip_address varchar(45),
  user_agent text,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP,
  expires_at timestamp NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY unique_session_token (session_token),
  KEY idx_user_id (user_id),
  KEY idx_expires_at (expires_at),
  FOREIGN KEY (user_id) REFERENCES virtual_users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Audit log table
CREATE TABLE IF NOT EXISTS audit_log (
  id int(11) NOT NULL AUTO_INCREMENT,
  user_id int(11) NULL,
  action varchar(100) NOT NULL,
  details text,
  ip_address varchar(45),
  user_agent text,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_user_id (user_id),
  KEY idx_action (action),
  KEY idx_created_at (created_at),
  FOREIGN KEY (user_id) REFERENCES virtual_users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Insert default domains
INSERT INTO virtual_domains (name, description, active) VALUES 
  ('tempmail.com', 'Primary temporary email domain', 1),
  ('10minutemail.com', 'Quick temporary emails', 1),
  ('guerrillamail.com', 'Guerrilla temporary emails', 1),
  ('mailinator.com', 'Mailinator style emails', 1),
  ('yopmail.com', 'Yopmail style emails', 1),
  ('temp-mail.org', 'Temporary mail organization', 1),
  ('sharklasers.com', 'Shark lasers emails', 1),
  ('grr.la', 'Grr la emails', 1)
ON DUPLICATE KEY UPDATE 
  description = VALUES(description),
  active = VALUES(active);

-- Insert default domain settings
INSERT INTO domain_settings (domain_id, setting_key, setting_value) 
SELECT 
  d.id, 
  'max_emails_per_domain', 
  '1000'
FROM virtual_domains d
ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value);

INSERT INTO domain_settings (domain_id, setting_key, setting_value) 
SELECT 
  d.id, 
  'email_expiry_hours', 
  '24'
FROM virtual_domains d
ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value);

-- Create indexes for better performance
CREATE INDEX idx_messages_user_received ON messages(user_id, received_at);
CREATE INDEX idx_users_domain_active ON virtual_users(domain_id, active);
CREATE INDEX idx_users_expires_active ON virtual_users(expires_at, active);

-- Create views for easier querying
CREATE OR REPLACE VIEW active_emails AS
SELECT 
  u.id,
  u.email,
  u.username,
  d.name as domain,
  u.created_at,
  u.expires_at,
  COUNT(m.id) as message_count,
  CASE WHEN u.expires_at < NOW() THEN 1 ELSE 0 END as is_expired
FROM virtual_users u
JOIN virtual_domains d ON u.domain_id = d.id
LEFT JOIN messages m ON u.id = m.user_id
WHERE u.active = 1
GROUP BY u.id;

CREATE OR REPLACE VIEW domain_stats AS
SELECT 
  d.id,
  d.name,
  d.active,
  COUNT(u.id) as total_emails,
  COUNT(CASE WHEN u.active = 1 THEN 1 END) as active_emails,
  COUNT(CASE WHEN u.expires_at < NOW() THEN 1 END) as expired_emails,
  SUM(CASE WHEN m.id IS NOT NULL THEN 1 ELSE 0 END) as total_messages
FROM virtual_domains d
LEFT JOIN virtual_users u ON d.id = u.domain_id
LEFT JOIN messages m ON u.id = m.user_id
GROUP BY d.id;

-- Create stored procedures for common operations
DELIMITER //

CREATE PROCEDURE CleanupExpiredEmails()
BEGIN
  DECLARE done INT DEFAULT FALSE;
  DECLARE email_id INT;
  DECLARE email_path VARCHAR(500);
  
  DECLARE email_cursor CURSOR FOR 
    SELECT id FROM virtual_users WHERE expires_at < NOW() AND active = 1;
  
  DECLARE CONTINUE HANDLER FOR NOT FOUND SET done = TRUE;
  
  OPEN email_cursor;
  
  read_loop: LOOP
    FETCH email_cursor INTO email_id;
    IF done THEN
      LEAVE read_loop;
    END IF;
    
    -- Mark email as inactive
    UPDATE virtual_users SET active = 0 WHERE id = email_id;
    
    -- Log the cleanup
    INSERT INTO audit_log (user_id, action, details) 
    VALUES (email_id, 'email_expired', 'Email marked as expired and deactivated');
  END LOOP;
  
  CLOSE email_cursor;
END //

CREATE PROCEDURE GetDomainEmails(IN domain_name VARCHAR(100))
BEGIN
  SELECT 
    u.email,
    u.username,
    u.created_at,
    u.expires_at,
    COUNT(m.id) as message_count
  FROM virtual_users u
  JOIN virtual_domains d ON u.domain_id = d.id
  LEFT JOIN messages m ON u.id = m.user_id
  WHERE d.name = domain_name AND u.active = 1
  GROUP BY u.id
  ORDER BY u.created_at DESC;
END //

DELIMITER ;

-- Create events for automatic cleanup
CREATE EVENT IF NOT EXISTS cleanup_expired_emails
ON SCHEDULE EVERY 1 HOUR
DO CALL CleanupExpiredEmails();

-- Grant permissions for postfix user
CREATE USER IF NOT EXISTS 'postfix'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT SELECT ON mailserver.* TO 'postfix'@'localhost';

-- Grant permissions for web application
CREATE USER IF NOT EXISTS 'webapp'@'localhost' IDENTIFIED BY 'your_webapp_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON mailserver.* TO 'webapp'@'localhost';

FLUSH PRIVILEGES;

-- Show created tables
SHOW TABLES;

-- Show initial data
SELECT 'Domains:' as info;
SELECT * FROM virtual_domains;

SELECT 'Domain Settings:' as info;
SELECT * FROM domain_settings;
