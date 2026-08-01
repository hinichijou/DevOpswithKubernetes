CREATE TABLE IF NOT EXISTS todos (
  id serial PRIMARY KEY,
  title text NOT NULL
);

-- Can be used to add default entries to database
INSERT INTO todos VALUES ('Learn Kubernetes basics');
INSERT INTO todos VALUES ('Deploy application to cluster');
INSERT INTO todos VALUES ('Configure persistent volumes');