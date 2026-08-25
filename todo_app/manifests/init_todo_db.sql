CREATE TABLE IF NOT EXISTS todos (
  id serial PRIMARY KEY,
  title text NOT NULL
);

-- Can be used to add default entries to database
-- 3.7: Test deployment to main branch with existing images
-- INSERT INTO todos (title) VALUES ('Learn Kubernetes basics');
-- INSERT INTO todos (title) VALUES ('Deploy application to cluster');
-- INSERT INTO todos (title) VALUES ('Configure persistent volumes');