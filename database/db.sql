CREATE DATABASE database_react_mysql;

USE database_react_mysql;

--user table
CREATE TABLE users(
  id INT(11) NOT NULL,
  email VARCHAR(100) NOT NULL,
  password VARCHAR(60) NOT NULL,
  firstname VARCHAR(60),
  lastname VARCHAR(60),
  birthdate DATE,
  image VARCHAR(255),
  isadmin BOOLEAN
);

ALTER TABLE users
  ADD PRIMARY KEY (id);

ALTER TABLE users
  MODIFY id INT(11) NOT NULL AUTO_INCREMENT,
  AUTO_INCREMENT = 2;

ALTER TABLE users
  MODIFY email VARCHAR(100) NOT NULL UNIQUE;

ALTER TABLE users
  MODIFY isadmin BOOLEAN DEFAULT 0;

DESCRIBE users;

--general categories
CREATE TABLE general_categories(
  id INT(11) NOT NULL,
  type VARCHAR(255) NOT NULL,
  title VARCHAR(150) NOT NULL
);

ALTER TABLE general_categories
  ADD PRIMARY KEY (id);

ALTER TABLE general_categories
  MODIFY id INT(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT = 2;

DESCRIBE general_categories;

--categorias personales
CREATE TABLE personal_categories(
  id INT(11) NOT NULL,
  title VARCHAR(150) NOT NULL,
  user_id INT(11),
  CONSTRAINT fk_user_category FOREIGN KEY (user_id) REFERENCES users(id)
);

ALTER TABLE personal_categories
  ADD PRIMARY KEY (id);

ALTER TABLE personal_categories
  MODIFY id INT(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT = 2;

DESCRIBE personal_categories;

--registro ingresos
CREATE TABLE income(
id INT(11) NOT NULL,
title VARCHAR(150) NOT NULL,
category VARCHAR(150) NOT NULL,
description TEXT,
currency VARCHAR(5),
amount INT(20),
user_id INT(11),
created_at timestamp NOT NULL DEFAULT current_timestamp,
CONSTRAINT fk_user_income FOREIGN KEY (user_id) REFERENCES users(id)
);

ALTER TABLE income
  ADD personal_cat_id INT(11);

ALTER TABLE income
  ADD CONSTRAINT fk_income_personal_cat FOREIGN KEY (personal_cat_id) REFERENCES personal_categories(id);

ALTER TABLE income
  ADD PRIMARY KEY (id);

ALTER TABLE income
  MODIFY id INT(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT = 2;

DESCRIBE income;

--outcome registro
CREATE TABLE outcome(
id INT(11) NOT NULL,
title VARCHAR(150) NOT NULL,
category VARCHAR(150) NOT NULL,
description TEXT,
currency VARCHAR(5),
amount INT(20),
user_id INT(11),
created_at timestamp NOT NULL DEFAULT current_timestamp,
CONSTRAINT fk_user_outcome FOREIGN KEY (user_id) REFERENCES users(id)
);

ALTER TABLE outcome
  ADD personal_cat_id INT(11);

ALTER TABLE outcome
  ADD CONSTRAINT fk_outcome_personal_cat FOREIGN KEY (personal_cat_id) REFERENCES personal_categories(id);

ALTER TABLE outcome
  ADD PRIMARY KEY (id);

ALTER TABLE outcome
  MODIFY id INT(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT = 2;

DESCRIBE outcome;

--currency
CREATE TABLE currency(
  id INT(11) NOT NULL,
  name VARCHAR(255) NOT NULL,
  code VARCHAR(255) NOT NULL
);

ALTER TABLE currency
  ADD PRIMARY KEY (id);

ALTER TABLE currency
  MODIFY id INT(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT = 2;

--procedure
DROP PROCEDURE for_days;

DELIMITER $$
CREATE PROCEDURE for_days()
BEGIN
	DECLARE x  INT;
        
	SET x = 1;
  SET y = 1;
        
	loop_label:  LOOP
    IF y > 12 THEN --mes
      LEAVE loop_label;
		IF  x > 30 THEN  --dia
        x = 1 
        y = y+1
			--LEAVE  loop_label;
		END IF;
    END IF;

      
    SELECT SUM(amount) as total_outcome, DAY(created_at) as day FROM OUTCOME WHERE DAY(created_at) = x;
    SET  x = x + 1;	
    ITERATE  loop_label;    
		
	END LOOP;
END$$

DELIMITER ;
