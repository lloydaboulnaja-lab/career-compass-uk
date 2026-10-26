import { describe, it } from 'node:test';
import { strict as assert } from 'node:assert';
import { extractCvSkills, matchCvToJob } from './skill-match';

describe('local CV matching', () => {
  it('compares each requested skill with CV evidence', () => {
    const match = matchCvToJob('Built a Python script to clean survey results.', { title: 'Junior analyst', summary: 'Python and SQL required.', requirements: [] });
    assert.equal(match.score, 50);
    assert.equal(match.skills.find(s => s.name === 'SQL')?.level, 'Not shown');
    assert.equal(match.skills.find(s => s.name === 'Python')?.level, 'Practical evidence');
  });
  it('does not invent a match score for sparse listings', () => {
    assert.equal(matchCvToJob('Python skills', { title: 'Apprentice', summary: 'Apply on employer website', requirements: [] }).score, null);
  });
  it('distinguishes learning from proven experience', () => {
    assert.equal(extractCvSkills('Learning SQL on my course.')[0]?.level, 'Learning');
    assert.deepEqual(extractCvSkills('No experience with SQL.'), []);
  });
  it('uses complete pasted adverts instead of generic snippets', () => {
    const match = matchCvToJob('Used SQL in a project.', { title: 'Apprentice', summary: 'Python required', requirements: [] }, 'Basic SQL needed.');
    assert.deepEqual(match.skills.map(s => s.name), ['SQL']);
    assert.equal(match.skills[0]?.requiredLevel, 'Basic / training');
  });
  it('supports retail and apprenticeship skills', () => {
    assert.equal(matchCvToJob('Customer service at a school event.', { title: 'Sales assistant', summary: 'Customer service', requirements: [] }).matched, 1);
    assert.equal(matchCvToJob('Built a Python game.', { title: 'Software apprentice', summary: 'Python required', requirements: [] }).score, 100);
  });
});