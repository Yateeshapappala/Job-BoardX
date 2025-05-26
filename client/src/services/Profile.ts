
export interface Experience {
  title: string;
  company: string;
  location: string;
  from: string;
  to?: string;
  current: boolean;
  description: string;
}

export interface Education {
  school: string;
  degree: string;
  fieldOfStudy: string;
  from: string;
  to?: string;
  current: boolean;
  description: string;
}

export interface Profile {
  headline: string;
  bio: string;
  phone: string;
  location: string;
  website: string;
  linkedin: string;
  github: string;
  skills: string[];
  experience: Experience[];
  education: Education[];
}
