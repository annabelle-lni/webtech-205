CREATE TABLE public.recette (
  id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nom character varying NOT NULL,
  ingredient character varying,
  temps_preparation bigint,
  preparation text,
  images text,
  note real,
  difficulte character varying,
  categorie character varying,
  fete character varying,
  origine character varying
);
