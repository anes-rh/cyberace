<?php

# DVWA — configuration. Base de données EXTERNE (nœud `db`), adressée par IP
# (webapp et db ne partagent aucun réseau : la route passe par le firewall).

$_DVWA = array();
$_DVWA[ 'db_server' ]   = getenv('DB_SERVER')   ?: '10.30.0.40';
$_DVWA[ 'db_database' ] = getenv('DB_DATABASE') ?: 'dvwa';
$_DVWA[ 'db_user' ]     = getenv('DB_USER')     ?: 'dvwa';
$_DVWA[ 'db_password' ] = getenv('DB_PASSWORD') ?: 'p@ssw0rd';
$_DVWA[ 'db_port' ]     = getenv('DB_PORT')     ?: '3306';

# Sécurité applicative volontairement faible — la difficulté vient du
# firewall/WAF à contourner, pas de DVWA lui-même.
$_DVWA[ 'default_security_level' ] = 'low';
$_DVWA[ 'default_locale' ]         = 'en';
$_DVWA[ 'disable_authentication' ] = false;

$_DVWA[ 'recaptcha_public_key' ]  = '';
$_DVWA[ 'recaptcha_private_key' ] = '';
