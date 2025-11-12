DROP TABLE IF EXISTS public.recette CASCADE;

CREATE TABLE public.recette (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  nom character varying NOT NULL,
  ingredient character varying,
  temps_preparation bigint,
  preparation text,
  images text,
  note real,
  difficulte character varying,
  categorie character varying,
  fete character varying,
  origine character varying,
  CONSTRAINT recette_pkey PRIMARY KEY (id)
);

INSERT INTO public.recette (nom, ingredient, temps_preparation, preparation, images, note, difficulte) VALUES
('Crêpes', 'farine, oeufs, lait', 10, 'Mélanger et cuire.', 'crepes.jpg', 4.8, 'facile'),
('Gâteau au chocolat', 'chocolat, beurre, oeufs, sucre, farine', 30, 'Mélanger et cuire.', 'gateau.jpg', 4.5, 'moyen');