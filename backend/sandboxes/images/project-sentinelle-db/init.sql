-- Schéma DVWA minimal (table `users` interrogée par l'endpoint SQLi) + table
-- `secrets` contenant le flag. Exécuté au premier démarrage de MySQL.
-- La base `dvwa` et l'utilisateur `dvwa` sont créés via les variables d'env
-- MYSQL_DATABASE / MYSQL_USER / MYSQL_PASSWORD.

USE dvwa;

-- Table utilisateurs de DVWA (schéma standard). Le endpoint
-- /vulnerabilities/sqli/?id=... fait : SELECT first_name, last_name FROM users
-- WHERE user_id = '$id'  → vecteur d'UNION SQLi.
CREATE TABLE IF NOT EXISTS users (
  user_id      INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  first_name   VARCHAR(15),
  last_name    VARCHAR(15),
  user         VARCHAR(15),
  password     VARCHAR(32),
  avatar       VARCHAR(70),
  last_login   TIMESTAMP NULL,
  failed_login INT DEFAULT 0
);

-- Utilisateurs standard DVWA (mot de passe en md5, sécurité "low").
INSERT INTO users (user_id, first_name, last_name, user, password, avatar, failed_login) VALUES
  (1, 'admin',  'admin',    'admin',   MD5('password'), '/hackable/users/admin.jpg',   0),
  (2, 'Gordon', 'Brown',    'gordonb', MD5('abc123'),   '/hackable/users/gordonb.jpg', 0),
  (3, 'Hack',   'Me',       '1337',    MD5('charley'),  '/hackable/users/1337.jpg',    0),
  (4, 'Pablo',  'Picasso',  'pablo',   MD5('letmein'),  '/hackable/users/pablo.jpg',   0),
  (5, 'Bob',    'Smith',    'smithy',  MD5('password'), '/hackable/users/smithy.jpg',  0);

-- Livre d'or DVWA (présent pour que l'app se considère "installée").
CREATE TABLE IF NOT EXISTS guestbook (
  comment_id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
  comment    VARCHAR(300),
  name       VARCHAR(100)
);
INSERT INTO guestbook (comment, name) VALUES ('This is a test comment.', 'test');

-- Table cible de l'exfiltration : le flag NovaBank.
CREATE TABLE IF NOT EXISTS secrets (
  id   INT NOT NULL PRIMARY KEY,
  name VARCHAR(64),
  flag VARCHAR(128)
);
INSERT INTO secrets (id, name, flag) VALUES
  (1, 'novabank_master_key', 'NOVA{sqli_union_bypass_waf_exfil}');
