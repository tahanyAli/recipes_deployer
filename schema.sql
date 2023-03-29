DROP TABLE IF EXISTS recipes;
CREATE TABLE IF NOT EXISTS recipes (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255),
    time VARCHAR(255),
    image VARCHAR(255)
   
);