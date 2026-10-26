import { describe, it, expect } from 'bun:test';
import { extractCvSkills, matchCvToJob } from './skill-match';

describe('local CV matching', () => {
  it('compares each requested skill with CV evidence', () => {
    const match = matchCvToJob('Built a Python script to clean survey results.', { title: 'Junior analyst', summary: 'Python and SQL required.', requirements: [] });
    expect(match.score).toBe(50);
    expect(match.skills.find(s => s.name === 'SQL')?.level).toBe('Not shown');
    expect(match.skills.find(s => s.name === 'Python')?.level).toBe('Practical evidence');
  });
  it('does not invent a match score for sparse listings', () => {
    expect(matchCvToJob('Python skills', { title: 'Apprentice', summary: 'Apply on employer website', requirements: [] }).score).toBeNull();
  });
  it('distinguishes learning from proven experience', () => {
    expect(extractCvSkills('Learning SQL on my course.')[0]?.level).toBe('Learning');
    expect(extractCvSkills('No experience with SQL.')).toEqual([]);
  });
  it('uses complete pasted adverts instead of generic snippets', () => {
    const match = matchCvToJob('Used SQL in a project.', { title: 'Apprentice', summary: 'Python required', requirements: [] }, 'Basic SQL needed.');
    expect(match.skills.map(s => s.name)).toEqual(['SQL']);
    expect(match.skills[0]?.requiredLevel).toBe('Basic / training');
  });
  it('supports retail and apprenticeship skills', () => {
    expect(matchCvToJob('Customer service at a school event.', { title: 'Sales assistant', summary: 'Customer service', requirements: [] }).matched).toBe(1);
    expect(matchCvToJob('Built a Python game.', { title: 'Software apprentice', summary: 'Python required', requirements: [] }).score).toBe(100);
  });
});