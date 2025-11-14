USE filminis;
ALTER USER 'root'@'localhost' IDENTIFIED WITH 'mysql_native_password' BY 'root';
FLUSH PRIVILEGES;

select * from usuarios;