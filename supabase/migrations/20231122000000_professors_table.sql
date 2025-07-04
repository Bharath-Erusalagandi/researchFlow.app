-- Create professors table
CREATE TABLE IF NOT EXISTS public.professors (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT,
  university TEXT,
  research_areas TEXT, -- JSON string array stored as text
  email TEXT,
  publications INTEGER DEFAULT 0,
  citations INTEGER DEFAULT 0,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster searches
CREATE INDEX IF NOT EXISTS professors_research_areas_idx ON public.professors USING gin (to_tsvector('english', research_areas));
CREATE INDEX IF NOT EXISTS professors_name_idx ON public.professors USING gin (to_tsvector('english', name));
CREATE INDEX IF NOT EXISTS professors_university_idx ON public.professors USING gin (to_tsvector('english', university));
CREATE INDEX IF NOT EXISTS professors_title_idx ON public.professors USING gin (to_tsvector('english', title));

-- Add some sample professors for testing
INSERT INTO public.professors (name, title, university, research_areas, email, publications, citations, image_url)
VALUES 
  ('Dr. Sarah Chen', 'Associate Professor of Genetics', 'Stanford University', '["Genetics", "Molecular Biology", "Bioinformatics"]', 'schen@stanford.edu', 42, 1289, 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80'),
  ('Dr. Michael Rodriguez', 'Professor of Computational Biology', 'MIT', '["Genetics", "Artificial Intelligence", "Computational Biology"]', 'mrodriguez@mit.edu', 78, 3045, 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80'),
  ('Dr. Jennifer Taylor', 'Professor of Genetics', 'Harvard University', '["Genetics", "CRISPR", "Gene Therapy"]', 'jtaylor@harvard.edu', 56, 2156, 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80'),
  ('Dr. Thomas Williams', 'Associate Professor of Genomics', 'UC Berkeley', '["Genetics", "Genomics", "Cancer Research"]', 'twilliams@berkeley.edu', 38, 1425, 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80'),
  ('Dr. Emily Johnson', 'Associate Professor of Machine Learning', 'Carnegie Mellon University', '["Machine Learning", "Computer Vision", "Neural Networks"]', 'ejohnson@cmu.edu', 64, 2780, 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80'),
  ('Dr. James Wilson', 'Professor of Artificial Intelligence', 'University of California, Berkeley', '["Artificial Intelligence", "Machine Learning", "Robotics"]', 'jwilson@berkeley.edu', 92, 4120, 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80'),
  ('Dr. Lisa Wang', 'Professor of Climate Science', 'Columbia University', '["Climate Science", "Environmental Studies", "Oceanography"]', 'lwang@columbia.edu', 45, 1875, 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80'),
  ('Dr. Robert Kim', 'Professor of Neuroscience', 'Johns Hopkins University', '["Neuroscience", "Cognitive Psychology", "Brain Mapping"]', 'rkim@jhu.edu', 67, 3210, 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80'),
  ('Dr. Maria Garcia', 'Associate Professor of Quantum Physics', 'Caltech', '["Quantum Physics", "Theoretical Physics", "Quantum Computing"]', 'mgarcia@caltech.edu', 51, 2345, 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80'),
  ('Dr. David Lee', 'Professor of Computer Vision', 'Stanford University', '["Computer Vision", "Deep Learning", "Image Processing"]', 'dlee@stanford.edu', 73, 3650, 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80'),
  ('Dr. Susan Roberts', 'Professor of Biotechnology', 'MIT', '["Biotechnology", "Genetic Engineering", "Synthetic Biology"]', 'sroberts@mit.edu', 59, 2875, 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80'),
  ('Dr. Kevin Zhang', 'Associate Professor of Sociology', 'Harvard University', '["Sociology", "Urban Studies", "Social Networks"]', 'kzhang@harvard.edu', 34, 1560, 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80'),
  ('Dr. Catherine Brown', 'Professor of Psychology', 'Yale University', '["Psychology", "Behavioral Science", "Clinical Psychology"]', 'cbrown@yale.edu', 68, 3125, 'https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80'),
  ('Dr. Alex Patel', 'Associate Professor of CRISPR Technology', 'University of California, San Francisco', '["CRISPR", "Gene Editing", "Molecular Biology"]', 'apatel@ucsf.edu', 47, 2230, 'https://images.unsplash.com/photo-1560250097-0b93528c311a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=256&q=80'); 